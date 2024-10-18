import mongoose, { Schema, Document } from "mongoose";

export interface IReward extends Document {
  reward_name: String;
  reward_item: String;
  reward_qty: number;
}
