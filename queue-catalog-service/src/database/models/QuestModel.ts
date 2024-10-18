import mongoose, { Schema, Document } from "mongoose";

export interface IQuest extends Document {
  reward_id: String;
  auto_claim: boolean;
  streak: number;
  duplication: number;
  name: String;
  description: String;
  createdAt: Date;
}

const QuestModelSchema: Schema = new Schema(
  {
    reward_id: {
      type: String,
      unique: true,
      required: true,
    },
    auto_claim: {
      type: Boolean,
      required: true,
      default: true
    },
    streak: {
      type: Number,
      required: true,
      default: 0
    },
    duplication: {
      type: Number,
      required: true,
      default: 0
    },
    name: {
      type: String,
    },
    description: {
      type: String
    },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: 'RewardModel' }
  },
  {
    timestamps: true,
  }
);

const QuestModel = mongoose.model<IQuest>("QuestModel", QuestModelSchema);
export default QuestModel;