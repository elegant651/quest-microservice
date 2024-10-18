import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../database";
import { ApiError, encryptPassword, isPasswordMatch } from "../utils";
import config from "../config/config";
import { IUser } from "../database";
import { rabbitMQService } from "../services/RabbitMQService";

const jwtSecret = config.JWT_SECRET as string;
const COOKIE_EXPIRATION_DAYS = 90;
const expirationDate = new Date(
  Date.now() + COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
);
const cookieOptions = {
  expires: expirationDate,
  secure: false,
  httpOnly: true,
};

const register = async (req: Request, res: Response) => {
  try {
    const { user_name, email, password } = req.body;

    console.log('u', user_name)
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, "User already exists!");
    }

    const user = await User.create({
      user_name,
      email,
      password: await encryptPassword(password),
    });

    const userData = {
      id: user._id,
      user_name: user.user_name,
      email: user.email,
    };

    return res.json({
      status: 200,
      message: "User registered successfully!",
      data: userData,
    });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

const createSendToken = async (user: IUser, res: Response) => {
  const { user_name, email, id } = user;
  const token = jwt.sign({ user_name, email, id }, jwtSecret, {
    expiresIn: "1d",
  });
  res.cookie("jwt", token, cookieOptions);

  return token;
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (
      !user ||
      !(await isPasswordMatch(password, user.password as string))
    ) {
      throw new ApiError(400, "Incorrect email or password");
    }

    const token = await createSendToken(user!, res);

    //for calling quest processing service
    const userId = user._id as string
    await rabbitMQService.notifyReceiverToProcessing(userId)

    return res.json({
      status: 200,
      message: "User logged in successfully!",
      token,
    });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

export default {
  register,
  login,
};