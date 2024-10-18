import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";

enum Status {
  New = 0,
  Not_New = 1,
  Banned = 2,
}

export interface IUser extends Document {
  user_name: string;
  email: string;
  password: string;
  gold: number;
  diamond: number;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    user_name: {
      type: String,
      trim: true,
      required: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email."],
    },
    password: {
      type: String,
      trim: false,
      required: [true, "Password must be provided"],
      minlength: 8,
    },
    gold: {
      type: Number,
      default: 0
    },
    diamond: {
      type: Number,
      default: 0
    },
    status: {
      type: Number,
      default: Status.New,
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;