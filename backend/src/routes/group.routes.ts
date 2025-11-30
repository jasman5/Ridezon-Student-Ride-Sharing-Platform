import { Router } from "express";
import { getGroupMessages, sendMessage, getGroupExpenses, addExpense } from "../controllers/group.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:groupId/messages", authenticate, getGroupMessages);
router.post("/:groupId/messages", authenticate, sendMessage);

router.get("/:groupId/expenses", authenticate, getGroupExpenses);
router.post("/:groupId/expenses", authenticate, addExpense);

export default router;
