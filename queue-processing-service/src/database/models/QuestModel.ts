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
