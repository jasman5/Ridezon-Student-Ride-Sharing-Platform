"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExpense = exports.getGroupExpenses = exports.sendMessage = exports.getGroupMessages = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await prisma_1.default.message.findMany({
            where: { groupId },
            include: { sender: { select: { id: true, fullName: true, avatar: true } } },
            orderBy: { createdAt: "asc" },
        });
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
};
exports.getGroupMessages = getGroupMessages;
const sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;
        const message = await prisma_1.default.message.create({
            data: {
                content,
                groupId,
                senderId,
            },
            include: { sender: { select: { id: true, fullName: true, avatar: true } } },
        });
        res.status(201).json(message);
    }
    catch (error) {
        res.status(500).json({ message: "Error sending message", error });
    }
};
exports.sendMessage = sendMessage;
const getGroupExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;
        const expenses = await prisma_1.default.expense.findMany({
            where: { groupId },
            include: { payer: { select: { id: true, fullName: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(expenses);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching expenses", error });
    }
};
exports.getGroupExpenses = getGroupExpenses;
const addExpense = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { amount, description, splitDetails } = req.body;
        const payerId = req.user.id;
        const expense = await prisma_1.default.expense.create({
            data: {
                amount,
                description,
                splitDetails,
                groupId,
                payerId,
            },
            include: { payer: { select: { id: true, fullName: true } } },
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding expense", error });
    }
};
exports.addExpense = addExpense;
