"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const expense_controller_1 = require("../controllers/expense.controller");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticate);
// Create a new expense for a group
router.post("/groups/:groupId/expenses", expense_controller_1.createExpense);
// Get all expenses for a group
router.get("/groups/:groupId/expenses", expense_controller_1.getGroupExpenses);
// Settle a specific split of an expense
router.put("/expenses/:expenseId/settle/:debtorId", expense_controller_1.settleExpenseSplit);
exports.default = router;
