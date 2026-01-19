import { Router } from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.post("/", createCategory);
categoryRouter.get("/isCustom/:isCustom/pageNo/:pageNo/limit/:limit", getCategories);

export default categoryRouter;
