import { Request, Response } from "express";
import prisma from "../prisma";

interface AuthRequest extends Request {
    user?: any;
}

export const getGroupMessages = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const messages = await prisma.message.findMany({
            where: { groupId },
            include: { sender: { select: { id: true, fullName: true, avatar: true } } },
            orderBy: { createdAt: "asc" },
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { groupId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        const message = await prisma.message.create({
            data: {
                content,
                groupId,
                senderId,
            },
            include: { sender: { select: { id: true, fullName: true, avatar: true } } },
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: "Error sending message", error });
    }
};

export const getGroupExpenses = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const expenses = await prisma.expense.findMany({
            where: { groupId },
            include: { payer: { select: { id: true, fullName: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching expenses", error });
    }
};

export const addExpense = async (req: AuthRequest, res: Response) => {
    try {
        const { groupId } = req.params;
        const { amount, description, splitDetails } = req.body;
        const payerId = req.user.id;

        const expense = await prisma.expense.create({
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
    } catch (error) {
        res.status(500).json({ message: "Error adding expense", error });
    }
};
