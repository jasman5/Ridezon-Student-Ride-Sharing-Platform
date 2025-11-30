import { Request, Response } from "express";
import prisma from "../prisma";

interface AuthRequest extends Request {
    user?: any;
}

export const createRide = async (req: AuthRequest, res: Response) => {
    try {
        const { origin, destination, departureTime, arrivalTime, transportMode, totalSeats, pricePerSeat, description, genderPreference } = req.body;
        const userId = req.user.id;

        const ride = await prisma.ride.create({
            data: {
                origin,
                destination,
                departureTime: new Date(departureTime),
                arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
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
    } catch (error) {
        res.status(500).json({ message: "Error creating ride", error });
    }
};

export const getRides = async (req: Request, res: Response) => {
    try {
        const rides = await prisma.ride.findMany({
            include: {
                creator: { select: { fullName: true, avatar: true, gender: true, phone: true, email: true } },
                passengers: { select: { fullName: true, avatar: true, gender: true, phone: true } },
                requests: { include: { user: { select: { fullName: true, avatar: true, email: true } } } },
                group: true
            },
            orderBy: { departureTime: "asc" },
        });
        res.status(200).json(rides);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rides", error });
    }
};

export const getRideById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ride = await prisma.ride.findUnique({
            where: { id },
            include: {
                creator: { select: { fullName: true, avatar: true, phone: true, gender: true, email: true } },
                passengers: { select: { fullName: true, avatar: true, gender: true, phone: true } },
                requests: { include: { user: { select: { fullName: true, avatar: true } } } },
                group: true
            },
        });

        if (!ride) return res.status(404).json({ message: "Ride not found" });

        res.status(200).json(ride);
    } catch (error) {
        res.status(500).json({ message: "Error fetching ride", error });
    }
};

export const deleteRide = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const ride = await prisma.ride.findUnique({ where: { id }, include: { group: true } });
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        if (ride.creatorId !== userId) return res.status(403).json({ message: "Not authorized to delete this ride" });
        if (ride.group) {
            await prisma.group.delete({ where: { rideId: id } }).catch(() => { });
        }

        await prisma.ride.delete({ where: { id } });
        res.status(200).json({ message: "Ride deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting ride", error });
    }
};

export const updateRide = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { origin, destination, departureTime, arrivalTime, transportMode, totalSeats, pricePerSeat, description, genderPreference } = req.body;
        const userId = req.user.id;

        const ride = await prisma.ride.findUnique({ where: { id } });
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        if (ride.creatorId !== userId) return res.status(403).json({ message: "Not authorized to update this ride" });

        const updatedRide = await prisma.ride.update({
            where: { id },
            data: {
                origin,
                destination,
                departureTime: departureTime ? new Date(departureTime) : undefined,
                arrivalTime: arrivalTime ? new Date(arrivalTime) : undefined,
                transportMode,
                totalSeats,
                pricePerSeat,
                description,
                genderPreference
            },
            include: {
                creator: { select: { fullName: true, avatar: true, phone: true, gender: true, email: true } },
                passengers: { select: { fullName: true, avatar: true, gender: true, phone: true } },
                group: true
            }
        });

        res.status(200).json(updatedRide);
    } catch (error) {
        res.status(500).json({ message: "Error updating ride", error });
    }
};

export const joinRide = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if ride exists
        const ride = await prisma.ride.findUnique({ where: { id }, include: { passengers: true } });
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        // Check if already joined
        if (ride.passengers.some(p => p.id === userId)) {
            return res.status(400).json({ message: "You are already a passenger" });
        }

        // Check if creator
        if (ride.creatorId === userId) {
            return res.status(400).json({ message: "You cannot join your own ride" });
        }

        // Check if request already exists
        const existingRequest = await prisma.rideRequest.findFirst({
            where: { rideId: id, userId, status: "PENDING" }
        });
        if (existingRequest) {
            return res.status(400).json({ message: "Request already pending" });
        }

        const request = await prisma.rideRequest.create({
            data: {
                rideId: id,
                userId,
                status: "PENDING"
            }
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: "Error joining ride", error });
    }
};

export const respondToRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { id, requestId } = req.params;
        const { status } = req.body; // ACCEPTED or REJECTED
        const userId = req.user.id;

        const ride = await prisma.ride.findUnique({ where: { id } });
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        if (ride.creatorId !== userId) return res.status(403).json({ message: "Not authorized" });

        const request = await prisma.rideRequest.findUnique({ where: { id: requestId } });
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (status === "ACCEPTED") {
            // Add user to passengers
            await prisma.ride.update({
                where: { id },
                data: {
                    passengers: {
                        connect: { id: request.userId }
                    }
                }
            });
        }

        const updatedRequest = await prisma.rideRequest.update({
            where: { id: requestId },
            data: { status }
        });

        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: "Error responding to request", error });
    }
};

export const leaveRide = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const ride = await prisma.ride.findUnique({
            where: { id },
            include: { passengers: true }
        });

        if (!ride) return res.status(404).json({ message: "Ride not found" });
        if (ride.creatorId === userId) {
            return res.status(400).json({ message: "Creators cannot leave the ride, they must delete it" });
        }

        const isPassenger = ride.passengers.some(p => p.id === userId);
        if (!isPassenger) {
            return res.status(400).json({ message: "You are not a passenger in this ride" });
        }
        await prisma.ride.update({
            where: { id },
            data: {
                passengers: {
                    disconnect: { id: userId }
                }
            }
        });

        res.status(200).json({ message: "Successfully left the ride" });
    } catch (error) {
        res.status(500).json({ message: "Error leaving ride", error });
    }
};
