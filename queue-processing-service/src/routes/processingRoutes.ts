//@ts-nocheck
import { Router } from "express";
import QueueProcessingController from "../controllers/QueueProcessingController";

const processingRoutes = Router();

processingRoutes.post("/save", QueueProcessingController.save);
processingRoutes.get("/get/:user_id/:quest_id", QueueProcessingController.getReqReward);
processingRoutes.post("/test", QueueProcessingController.test);

export default processingRoutes;