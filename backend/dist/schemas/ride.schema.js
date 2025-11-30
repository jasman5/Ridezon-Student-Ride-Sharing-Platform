"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRideSchema = void 0;
const zod_1 = require("zod");
exports.createRideSchema = zod_1.z.object({
    body: zod_1.z.object({
        origin: zod_1.z.string().min(1, "Start point is required"),
        destination: zod_1.z.string().min(1, "End point is required"),
        departureTime: zod_1.z.string().datetime(),
        transportMode: zod_1.z.string().min(1, "Transport mode is required"),
        totalSeats: zod_1.z.number().min(1).max(20),
        pricePerSeat: zod_1.z.number().min(1).optional(),
        description: zod_1.z.string().min(10).optional(),
        genderPreference: zod_1.z.enum(["Any", "Male", "Female"]).optional(),
    }),
});
