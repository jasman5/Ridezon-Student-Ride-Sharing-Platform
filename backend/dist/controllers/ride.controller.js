"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToRequest = exports.joinRide = exports.deleteRide = exports.getRideById = exports.getRides = exports.createRide = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createRide = async (req, res) => {
    try {
        const { origin, destination, departureTime, transportMode, totalSeats, pricePerSeat, description, genderPreference } = req.body;
        const userId = req.user.id;
        const ride = await prisma_1.default.ride.create({
            data: {
                origin,
                destination,
                departureTime: new Date(departureTime),
                transportMode,
                totalSeats,
                pricePerSeat,
                description,
                genderPreference,
                creatorId: userId,
                group: {
                    create: {} // Create an empty group associated with the ride
                }
            },
            include: { group: true }
        });
        res.status(201).json(ride);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating ride", error });
    }
};
exports.createRide = createRide;
const getRides = async (req, res) => {
    try {
        const rides = await prisma_1.default.ride.findMany({
            include: {
                creator: { select: { fullName: true, avatar: true, gender: true, phone: true } },
                passengers: { select: { fullName: true, avatar: true, gender: true, phone: true } },
                group: true
            },
            orderBy: { departureTime: "asc" },
        });
        res.status(200).json(rides);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching rides", error });
    }
};
exports.getRides = getRides;
const getRideById = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await prisma_1.default.ride.findUnique({
            where: { id },
            include: {
                creator: { select: { fullName: true, avatar: true, phone: true, gender: true } },
                passengers: { select: { fullName: true, avatar: true, gender: true, phone: true } },
                requests: { include: { user: { select: { fullName: true, avatar: true } } } },
                group: true
            },
        });
        if (!ride)
            return res.status(404).json({ message: "Ride not found" });
        res.status(200).json(ride);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching ride", error });
    }
};
exports.getRideById = getRideById;
const deleteRide = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const ride = await prisma_1.default.ride.findUnique({ where: { id }, include: { group: true } });
        if (!ride)
            return res.status(404).json({ message: "Ride not found" });
        if (ride.creatorId !== userId)
            return res.status(403).json({ message: "Not authorized to delete this ride" });
        // Delete group first if exists (cascade should handle it but good to be safe or if cascade not set)
        // Prisma cascade delete on Ride -> Group is not explicit in schema unless configured.
        // Actually, let's just delete the ride, and if we need to delete group manually we will.
        // For now, assume cascade or manual deletion.
        // Let's delete the group first to be safe.
        if (ride.group) {
            // Need to fetch group id first or use deleteMany
            await prisma_1.default.group.delete({ where: { rideId: id } }).catch(() => { });
        }
        await prisma_1.default.ride.delete({ where: { id } });
        res.status(200).json({ message: "Ride deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting ride", error });
    }
};
exports.deleteRide = deleteRide;
const joinRide = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if ride exists
        const ride = await prisma_1.default.ride.findUnique({ where: { id }, include: { passengers: true } });
        if (!ride)
            return res.status(404).json({ message: "Ride not found" });
        // Check if already joined
        if (ride.passengers.some(p => p.id === userId)) {
            return res.status(400).json({ message: "You are already a passenger" });
        }
        // Check if creator
        if (ride.creatorId === userId) {
            return res.status(400).json({ message: "You cannot join your own ride" });
        }
        // Check if request already exists
        const existingRequest = await prisma_1.default.rideRequest.findFirst({
            where: { rideId: id, userId, status: "PENDING" }
        });
        if (existingRequest) {
            return res.status(400).json({ message: "Request already pending" });
        }
        const request = await prisma_1.default.rideRequest.create({
            data: {
                rideId: id,
                userId,
                status: "PENDING"
            }
        });
        res.status(201).json(request);
    }
    catch (error) {
        res.status(500).json({ message: "Error joining ride", error });
    }
};
exports.joinRide = joinRide;
const respondToRequest = async (req, res) => {
    try {
        const { id, requestId } = req.params;
        const { status } = req.body; // ACCEPTED or REJECTED
        const userId = req.user.id;
        const ride = await prisma_1.default.ride.findUnique({ where: { id } });
        if (!ride)
            return res.status(404).json({ message: "Ride not found" });
        if (ride.creatorId !== userId)
            return res.status(403).json({ message: "Not authorized" });
        const request = await prisma_1.default.rideRequest.findUnique({ where: { id: requestId } });
        if (!request)
            return res.status(404).json({ message: "Request not found" });
        if (status === "ACCEPTED") {
            // Add user to passengers
            await prisma_1.default.ride.update({
                where: { id },
                data: {
                    passengers: {
                        connect: { id: request.userId }
                    }
                }
            });
        }
        const updatedRequest = await prisma_1.default.rideRequest.update({
            where: { id: requestId },
            data: { status }
        });
        res.status(200).json(updatedRequest);
    }
    catch (error) {
        res.status(500).json({ message: "Error responding to request", error });
    }
};
exports.respondToRequest = respondToRequest;
