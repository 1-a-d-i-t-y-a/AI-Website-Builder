import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { billing, verifyPayment } from "../controllers/billing.controller.js";

const billingRouter = express.Router();

billingRouter.post("/", isAuth, billing);
billingRouter.post("/verify", isAuth, verifyPayment);

export default billingRouter;