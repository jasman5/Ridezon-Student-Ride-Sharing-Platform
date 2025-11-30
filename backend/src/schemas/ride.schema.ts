import { z } from "zod";

export const createRideSchema = z.object({
    body: z.object({
        origin: z.string().min(1, "Start point is required"),
        destination: z.string().min(1, "End point is required"),
        departureTime: z.string().datetime(),
        transportMode: z.string().min(1, "Transport mode is required"),
        totalSeats: z.number().min(1).max(20),
        pricePerSeat: z.number().min(1).optional(),
        description: z.string().min(10).optional(),
        genderPreference: z.enum(["Any", "Male", "Female"]).optional(),
    }),
});
