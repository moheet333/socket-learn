import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { log } from "console";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "userId" }, "secret");

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({ token });
});

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(new Error("Authentication error"));
    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication error"));
    const decoded = jwt.verify(token, "secret");
    if (!decoded) return next(new Error("Authentication error"));
    next();
  });
});

io.on("connection", (socket) => {
  log("User connected ", socket.id);
  socket.on("message", (data) => {
    log(data);
    io.to(data.room).emit("receive-message", data);
  });
  socket.on("join-room", (room) => {
    log(room);
    socket.join(room);
  });
  socket.on("disconnect", () => {
    log("User disconnected ", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port : 5000");
});
