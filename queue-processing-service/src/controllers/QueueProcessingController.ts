import { Request, Response } from "express";
import { UserRequestRewards } from "../database";
import { rabbitMQService } from "../services/RabbitMQService";

const save = async (req: Request, res: Response) => {
  try {
    const { user_id, quest_id } = req.body;

    const reward = await UserRequestRewards.create({
      user_id,
      quest_id,
    });

    return res.json({
      status: 200,
      message: "Save successfully!",
      data: reward,
    });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

const getReqReward = async (req: Request, res: Response) => {
  try {
    const { user_id, quest_id } = req.params;

    const reqRewards = await UserRequestRewards.find({ user_id: user_id, quest_id: quest_id });

    return res.json({
      status: 200,
      message: "Messages retrieved successfully!",
      data: reqRewards,
    });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

const test = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    //test notifyReceiver
    await rabbitMQService.notifyReceiverToCatalog(user_id)
    return res.json({
      status: 200,
      message: "Test successfully!",
    });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

export default {
  save,
  getReqReward,
  test
};