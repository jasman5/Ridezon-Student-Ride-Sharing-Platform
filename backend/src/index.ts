import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes";
import rideRoutes from "./routes/ride.routes";
import groupRoutes from "./routes/group.routes";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for now, restrict in prod
        methods: ["GET", "POST"]
    }
});

import helmet from "helmet";
import { apiLimiter } from "./middlewares/rateLimit.middleware";

app.use(helmet());
app.use(cors({
    origin: "http://localhost:3000", // Restrict to frontend
    credentials: true,
}));
app.use(express.json());
app.use("/api/", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/groups", groupRoutes);

app.get("/", (req, res) => {
    res.send("Ridezon API running...");
});

// Socket.io connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_group", (groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}`);
    });

    socket.on("send_message", (data) => {
        // Broadcast to group
        io.to(data.groupId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
