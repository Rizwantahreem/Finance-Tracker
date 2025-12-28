import { Router } from "express";
import { createCategory } from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.post("/", createCategory);

export default categoryRouter;
