import amqp, { Channel } from "amqplib";
import { UserRequestRewards } from "../database";
import { IUserRequestRewards } from "../database/models/UserRequestRewardsModel";
import { IQuestReward } from "./RabbitMQService";
import { streamQueue } from "./ProcessingCommand";

interface IUserRequestRewardsCommand extends IUserRequestRewards {
  quest: IQuestReward
  cnt_rewards_for_quest: number
}

class ProcessingEventsHandler {
  private respQuestRewardQueue = "QUEST_REWARD_RESPONSE";
  channel: amqp.Channel;

  constructor(channel: amqp.Channel) {
    this.channel = channel
  }

  async computeProcessingHandler(userId: string, questId: string, quest: IQuestReward, cnt_rewards_for_quest: number): Promise<Boolean> {
    const { streak, duplication } = quest;
    const totalCnt = streak * duplication

    let initIndex = cnt_rewards_for_quest * streak;
    console.log('initIndex', initIndex);
    console.log('totalCnt', totalCnt);

    let shouldCreate = false;
    let signInCount = 0;

    await this.channel.assertQueue(streamQueue, {
      arguments: {
        'x-queue-type': 'stream'
      }
    });
    console.log('Waiting for messages in stream queue:', streamQueue);

    this.channel.consume(streamQueue, async (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        const processData = JSON.parse(messageContent);

        if (processData.user_id === userId && processData.quest_id === questId) {
          console.log('processData', processData);
          signInCount++;
          console.log('signInCount', signInCount);
          if ((signInCount > initIndex) && (signInCount <= (initIndex + streak)) && (signInCount % streak === 0)) {
            shouldCreate = true;
            console.log('Condition met. Should create a row in user_quest_rewards.', signInCount);

            //insert data to user_quest_Rewards db
            await this.createUserRequestRewards(userId, questId);
            // if auto claim is true, send reward
            // await this.sendRewardToUser(userId, quest);
          }
        }

        this.channel.ack(msg);
      }
    },
      {
        arguments: {
          'x-stream-offset': 'first'
        },
        noAck: false
      }
    );

    return shouldCreate;
  }

  async processingHandler(record: IUserRequestRewardsCommand) {
    try {
      await this.computeProcessingHandler(record.user_id, record.quest_id, record.quest, record.cnt_rewards_for_quest);
    } catch (error) {
      console.log(error);
    }
  }

  async sendRewardToUser(userId: string, quest: IQuestReward) {
    const claimed = quest.auto_claim;

    if (claimed) {
      let gold, diamond = 0;
      if (quest.reward_item === 'gold') {
        gold = quest.reward_qty;
      } else {
        diamond = quest.reward_qty;
      }

      const rewardPayload = {
        type: "GET_REWARD",
        userId,
        gold,
        diamond,
      };

      try {
        this.channel.sendToQueue(
          this.respQuestRewardQueue,
          Buffer.from(JSON.stringify(rewardPayload))
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  async createUserRequestRewards(user_id: string, quest_id: string) {
    const reward = await UserRequestRewards.create({
      user_id,
      quest_id,
    });
    return reward
  }
}

export default ProcessingEventsHandler;