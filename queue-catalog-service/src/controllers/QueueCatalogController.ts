import { Request, Response } from "express";
import { Reward, Quest } from "../database";

const create = async (req: Request, res: Response) => {
  try {
    const { reward_name, reward_item, reward_qty, auto_claim, streak, duplication, name, description } = req.body;

    console.log('r', req.body)
    const reward = await Reward.create({
      reward_name,
      reward_item,
      reward_qty
    });
    const reward_id = reward._id
    const quest = await Quest.create({
      reward_id,
      auto_claim,
      streak,
      duplication,
      name,
      description
    })

    return res.json({
      status: 200,
      message: "Create successfully!",
      data: quest,
    });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

const getQuest = async (req: Request, res: Response) => {
  try {
    const { quest_id } = req.params;

    const quest = await Quest.findById(quest_id);

    return res.json({
      status: 200,
      message: "Messages retrieved successfully!!",
      data: quest,
    });
  } catch (error: any) {
    return res.json({
      status: 500,
      message: error.message,
    });
  }
};

export default {
  create,
  getQuest,
};