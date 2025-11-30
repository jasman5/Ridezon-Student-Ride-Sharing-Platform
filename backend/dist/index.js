"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const ride_routes_1 = __importDefault(require("./routes/ride.routes"));
const group_routes_1 = __importDefault(require("./routes/group.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const poll_routes_1 = __importDefault(require("./routes/poll.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // Allow all for now, restrict in prod
        methods: ["GET", "POST"]
    }
});
const helmet_1 = __importDefault(require("helmet"));
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
app.use((0, helmet_1.default)({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://ridezon.akshatnathani.me"], // Restrict to frontend
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api/", rateLimit_middleware_1.apiLimiter);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/rides", ride_routes_1.default);
app.use("/api/groups", group_routes_1.default);
app.use("/api", expense_routes_1.default);
app.use("/api", poll_routes_1.default);
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
