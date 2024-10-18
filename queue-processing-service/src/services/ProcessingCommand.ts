import amqp, { Channel } from "amqplib";
import { UserRequestRewards } from "../database";
import ProcessingEventsHandler from "./ProcessingEventsHandler";
import { IQuestReward } from "./RabbitMQService";

export const streamQueue = "PROCESSING_STREAM";
class ProcessingCommandHandler {
  channel: amqp.Channel;
  eventHandler: ProcessingEventsHandler;
  constructor(channel: amqp.Channel) {
    this.channel = channel
    this.eventHandler = new ProcessingEventsHandler(this.channel);
  }

  async addProcess({ user_id, quest }: { user_id: string, quest: IQuestReward }) {
    const { streak, duplication } = quest;
    const quest_id = quest._id as string;

    if (streak === 0 || duplication === 0) throw new Error("no streak or duplication");
    const cnt_rewards_for_quest = await this.getCountFromUserQuestRewards(user_id, quest_id);
    if (cnt_rewards_for_quest >= duplication) throw new Error("no room for rewards");

    console.log('cnt_rewards_for_quest', cnt_rewards_for_quest)

    const processData = {
      user_id,
      quest_id,
      quest,
      cnt_rewards_for_quest,
    };

    //stream queue
    this.channel.prefetch(100)
    await this.channel.assertQueue(streamQueue, { arguments: { 'x-queue-type': 'stream' } })
    this.channel.sendToQueue(streamQueue, Buffer.from(JSON.stringify(processData)))

    this.eventHandler.processingHandler(processData);
  }

  async getCountFromUserQuestRewards(user_id: string, quest_id: string) {
    const reqRewards = await UserRequestRewards.find({ user_id: user_id, quest_id: quest_id });
    if (!reqRewards) {
      throw new Error("reqRewards not found");
    }
    return reqRewards.length;
  };

}

export default ProcessingCommandHandler;