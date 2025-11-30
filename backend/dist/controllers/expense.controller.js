"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settleExpenseSplit = exports.getGroupExpenses = exports.createExpense = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createExpense = async (req, res) => {
    try {
        const { amount, description, type, splitDetails, groupId } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Validate split details based on type
        // This is a basic validation, more complex validation can be added
        if (type === "PERCENTAGE") {
            let totalPercentage = 0;
            for (const key in splitDetails) {
                totalPercentage += splitDetails[key].percentage || 0;
            }
            if (Math.abs(totalPercentage - 100) > 0.1) {
                return res.status(400).json({ message: "Percentages must add up to 100%" });
            }
        }
        else if (type === "EXACT") {
            let totalAmount = 0;
            for (const key in splitDetails) {
                totalAmount += splitDetails[key].amount || 0;
            }
            if (Math.abs(totalAmount - amount) > 0.1) {
                return res.status(400).json({ message: "Split amounts must add up to total amount" });
            }
        }
        const expense = await prisma_1.default.expense.create({
            data: {
                amount,
                description,
                type,
                splitDetails,
                groupId,
                payerId: userId,
            },
            include: {
                payer: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
        res.status(201).json(expense);
    }
    catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: "Failed to create expense" });
    }
};
exports.createExpense = createExpense;
const getGroupExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;
        const expenses = await prisma_1.default.expense.findMany({
            where: { groupId },
            include: {
                payer: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(expenses);
    }
    catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Failed to fetch expenses" });
    }
};
exports.getGroupExpenses = getGroupExpenses;
const settleExpenseSplit = async (req, res) => {
    try {
        const { expenseId, debtorId } = req.params;
        const userId = req.user?.id;
        const expense = await prisma_1.default.expense.findUnique({
            where: { id: expenseId },
        });
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        // Only the payer can mark as settled (or maybe the debtor too? usually payer confirms)
        // For now let's allow payer to settle
        if (expense.payerId !== userId) {
            return res.status(403).json({ message: "Only the payer can mark as settled" });
        }
        const splitDetails = expense.splitDetails;
        if (splitDetails && splitDetails[debtorId]) {
            splitDetails[debtorId].settled = true;
        }
        const updatedExpense = await prisma_1.default.expense.update({
            where: { id: expenseId },
            data: { splitDetails },
        });
        res.json(updatedExpense);
    }
    catch (error) {
        console.error("Error settling expense:", error);
        res.status(500).json({ message: "Failed to settle expense" });
    }
};
exports.settleExpenseSplit = settleExpenseSplit;
