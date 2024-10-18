import mongoose, { Schema, Document } from "mongoose";

export interface IReward extends Document {
  reward_name: String;
  reward_item: String;
  reward_qty: number;
}

const RewardModelSchema: Schema = new Schema(
  {
    reward_name: {
      type: String,
      required: true,
    },
    reward_item: {
      type: String,
      default: true
    },
    reward_qty: {
      type: Number,
      default: 0
    }
  }
);

const RewardModel = mongoose.model<IReward>("RewardModel", RewardModelSchema);
export default RewardModel;