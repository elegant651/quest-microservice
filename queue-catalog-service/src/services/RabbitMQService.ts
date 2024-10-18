import amqp, { Channel } from "amqplib";
import config from "../config/config";
import { ApiError } from "../utils";
import { Quest, Reward } from "../database";

class RabbitMQService {
  private reqGetQuestQueue = "GET_QUEST_DETAILS_REQUEST";
  private respGetQuestQueue = "GET_QUEST_DETAILS_RESPONSE";
  private channel!: Channel;

  constructor() {
    this.init();
  }

  async init() {
    const connection = await amqp.connect(config.rabbitmqURL!);
    this.channel = await connection.createChannel();

    await this.channel.assertQueue(this.reqGetQuestQueue);
    this.listenForRequests();
  }

  private async listenForRequests() {
    this.channel.consume(this.reqGetQuestQueue, async (msg) => {
      if (msg && msg.content) {
        const { userId } = JSON.parse(msg.content.toString());
        const questWithUserId: any = await getLatestQuestData();
        questWithUserId.userId = userId;
        console.log('questWithUserId', questWithUserId)

        // Send the response back to the client
        this.channel.sendToQueue(
          this.respGetQuestQueue,
          Buffer.from(JSON.stringify(questWithUserId)),
          { correlationId: msg.properties.correlationId }
        );

        this.channel.ack(msg);
      }
    });
  }
}

const getLatestQuestData = async () => {
  const quest = await Quest.findOne().sort({ created_at: -1 })
  const reward = await Reward.findById(quest?.reward_id);
  if (!quest) {
    throw new ApiError(404, "quest not found");
  }
  const data = {
    _id: quest?._id,
    auto_claim: quest?.auto_claim,
    streak: quest?.streak,
    duplication: quest?.duplication,
    name: quest?.name,
    description: quest?.description,
    reward_id: quest?.reward_id,
    reward_name: reward?.reward_name,
    reward_item: reward?.reward_item,
    reward_qty: reward?.reward_qty
  }
  return data;
};

export const rabbitMQService = new RabbitMQService();