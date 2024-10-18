import mongoose, { Schema, Document } from "mongoose";

export enum Status {
  Claimed = 0,
  Not_Claimed = 1
}

export interface IUserRequestRewards {
  user_id: string;
  quest_id: string;
  status?: Status;
  createdAt?: Date;
}

export interface IUserRequestRewardsDocument extends Document {
}

const UserRequestRewardsModelSchema: Schema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    quest_id: {
      type: String,
      default: true
    },
    status: {
      type: Number,
      default: Status.Not_Claimed
    }
  },
  {
    timestamps: true,
  }
);

const UserRequestRewardsModel = mongoose.model<IUserRequestRewardsDocument>("UserRequestRewardsModel", UserRequestRewardsModelSchema);
export default UserRequestRewardsModel;