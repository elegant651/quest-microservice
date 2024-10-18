import amqp, { Channel } from "amqplib";
import { v4 as uuidv4 } from "uuid";
import config from "../config/config";
import { IQuest } from "../database/models/QuestModel";
import { IReward } from "../database/models/RewardModel";
import ProcessingCommandHandler from './ProcessingCommand'

export type IQuestReward = IQuest & IReward

class RabbitMQService {
  private reqQuestRewardQueue = "QUEST_REWARD_REQUEST";
  private respQuestRewardQueue = "QUEST_REWARD_RESPONSE";
  private reqGetQuestQueue = "GET_QUEST_DETAILS_REQUEST";
  private respGetQuestQueue = "GET_QUEST_DETAILS_RESPONSE";
  private correlationMap = new Map();
  private channel!: Channel;
  private processingCommand!: ProcessingCommandHandler

  constructor() {
    this.init();
  }

  async init() {
    const connection = await amqp.connect(config.rabbitmqURL!);
    this.channel = await connection.createChannel();
    await this.channel.assertQueue(this.reqQuestRewardQueue);
    await this.channel.assertQueue(this.respQuestRewardQueue);
    await this.channel.assertQueue(this.reqGetQuestQueue);
    await this.channel.assertQueue(this.respGetQuestQueue);
    this.processingCommand = new ProcessingCommandHandler(this.channel);

    this.listenForRequests();
  }

  private async listenForRequests() {
    //for getting user_quest_rewards from user-auth-service
    this.channel.consume(
      this.reqQuestRewardQueue,
      (msg) => {
        if (msg && msg.content) {
          const { userId } = JSON.parse(msg.content.toString());

          this.notifyReceiverToCatalog(userId)
        }
      },
      { noAck: true }
    );

    //for getting quest from quest-catalog-service
    this.channel.consume(
      this.respGetQuestQueue,
      (msg) => {
        if (msg && msg.content) {
          const correlationId = msg.properties.correlationId;
          const questWithUserId = JSON.parse(msg.content.toString());

          const callback = this.correlationMap.get(correlationId);
          if (callback) {
            callback(questWithUserId, questWithUserId.userId);
            this.correlationMap.delete(correlationId);
          }
        }
      },
      { noAck: true }
    );
  }

  private async requestQuestData(userId: string, callback: Function) {
    const correlationId = uuidv4();
    this.correlationMap.set(correlationId, callback);
    this.channel.sendToQueue(
      this.reqGetQuestQueue,
      Buffer.from(JSON.stringify({ userId })),
      { correlationId }
    );
  }

  async notifyReceiverToCatalog(
    userId: string
  ) {
    await this.requestQuestData(userId, async (quest: IQuestReward, user_id: string) => {
      console.log('r-quest', quest)
      console.log('r-userid', user_id)

      try {
        await this.processingCommand.addProcess({ user_id, quest })
      } catch (error) {
        console.log('error', error)
      }
    });
  }
}

export const rabbitMQService = new RabbitMQService();