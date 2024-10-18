//@ts-nocheck
import { Router } from "express";
import QueueCatalogController from "../controllers/QueueCatalogController";

const catalogRoutes = Router();

catalogRoutes.post("/create", QueueCatalogController.create);
catalogRoutes.get("/get/:quest_id", QueueCatalogController.getQuest);

export default catalogRoutes;