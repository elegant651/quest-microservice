import amqp, { Channel, Connection } from "amqplib";
import config from "../config/config";
import { User } from "../database";
import { ApiError } from "../utils";

class RabbitMQService {
  private reqQuestRewardQueue = "QUEST_REWARD_REQUEST";
  private respQuestRewardQueue = "QUEST_REWARD_RESPONSE";
  private connection!: Connection;
  private channel!: Channel;

  constructor() {
    this.init();
  }

  async init() {
    this.connection = await amqp.connect(config.rabbitmqURL!);
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue(this.reqQuestRewardQueue);
    await this.channel.assertQueue(this.respQuestRewardQueue);

    this.listenForRequests();
  }

  private async listenForRequests() {
    this.channel.consume(this.respQuestRewardQueue, async (msg) => {
      if (msg && msg.content) {
        const {
          type,
          userId,
          gold,
          diamond
        } = JSON.parse(msg.content.toString());

        if (type === "GET_REWARD") {
          await updateUserRewards(userId, gold, diamond);
        }
      }
    },
      { noAck: true });
  }

  async notifyReceiverToProcessing(
    userId: string
  ) {
    await this.channel.sendToQueue(
      this.reqQuestRewardQueue,
      Buffer.from(JSON.stringify({ userId })),
    );
  }
}

const updateUserRewards = async (userId: string, gold: number, diamond: number) => {
  const user = await User.findById(userId);

  if (user) {
    const sumGold = user.gold + gold;
    const sumDiamond = user.diamond + diamond;
    const res = await User.updateOne({ gold: sumGold, diamond: sumDiamond });
    return res;
  } else {
    throw new ApiError(404, "user not found");
  }
}

export const rabbitMQService = new RabbitMQService();