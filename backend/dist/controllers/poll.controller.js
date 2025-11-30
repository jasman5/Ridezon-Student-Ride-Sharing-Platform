"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.votePoll = exports.getGroupPolls = exports.createPoll = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createPoll = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { question, options } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!options || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: "A poll must have at least 2 options" });
        }
        const poll = await prisma_1.default.poll.create({
            data: {
                question,
                groupId,
                creatorId: userId,
                options: {
                    create: options.map((opt) => ({ text: opt })),
                },
            },
            include: {
                options: true,
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        avatar: true,
                    },
                },
            },
        });
        res.status(201).json(poll);
    }
    catch (error) {
        console.error("Error creating poll:", error);
        res.status(500).json({ message: "Failed to create poll" });
    }
};
exports.createPoll = createPoll;
const getGroupPolls = async (req, res) => {
    try {
        const { groupId } = req.params;
        const polls = await prisma_1.default.poll.findMany({
            where: { groupId },
            include: {
                options: {
                    include: {
                        votes: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(polls);
    }
    catch (error) {
        console.error("Error fetching polls:", error);
        res.status(500).json({ message: "Failed to fetch polls" });
    }
};
exports.getGroupPolls = getGroupPolls;
const votePoll = async (req, res) => {
    try {
        const { pollId, optionId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Check if user already voted for this option
        const existingVote = await prisma_1.default.pollVote.findUnique({
            where: {
                pollOptionId_userId: {
                    pollOptionId: optionId,
                    userId,
                },
            },
        });
        if (existingVote) {
            // Remove vote (toggle off)
            await prisma_1.default.pollVote.delete({
                where: { id: existingVote.id },
            });
            return res.json({ message: "Vote removed", voted: false });
        }
        // Check if user voted for another option in the same poll (if single choice enforced)
        // For now, let's assume single choice per poll
        const pollOption = await prisma_1.default.pollOption.findUnique({
            where: { id: optionId },
            select: { pollId: true },
        });
        if (!pollOption) {
            return res.status(404).json({ message: "Option not found" });
        }
        // Remove any other votes by this user for this poll
        const otherOptions = await prisma_1.default.pollOption.findMany({
            where: { pollId: pollOption.pollId },
            select: { id: true },
        });
        const otherOptionIds = otherOptions.map((o) => o.id);
        await prisma_1.default.pollVote.deleteMany({
            where: {
                userId,
                pollOptionId: { in: otherOptionIds },
            },
        });
        // Add new vote
        await prisma_1.default.pollVote.create({
            data: {
                pollOptionId: optionId,
                userId,
            },
        });
        res.json({ message: "Vote cast", voted: true });
    }
    catch (error) {
        console.error("Error voting:", error);
        res.status(500).json({ message: "Failed to vote" });
    }
};
exports.votePoll = votePoll;
