import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import type { Player, RoomState } from "./types.js";

const app = express();

const allowedOrigins = new Set(
  (
    process.env.CORS_ORIGINS ??
    "https://mind-snap-beta.vercel.app,http://localhost:3000"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true; // same-origin / server-to-server / curl
  if (allowedOrigins.has(origin)) return true;
  // Allow Vercel preview URLs if the app is deployed there.
  if (/^https:\/\/mind-snap(?:-[\w-]+)?\.vercel\.app$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin ?? undefined));
    },
    credentials: true,
  }),
);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin ?? undefined));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

function generatePatterns(count: number): number[][] {
  const allPatterns = [];
  for (let p = 0; p < count; p++) {
    const arr = Array.from({ length: 25 }, (_, i) => i);
    const correctTiles = Math.floor(Math.random() * 4) + 8;
    const pattern = arr.sort(() => Math.random() - 0.5).slice(0, correctTiles);
    allPatterns.push(pattern);
  }
  return allPatterns;
}

const rooms: Record<string, RoomState> = {};

app.get("/", (req: Request, res: Response) => {
  res.send("Mind Snap Multiplayer Server Live!");
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (roomId: string, username: string) => {
    socket.join(roomId);

    let room = rooms[roomId];
    if (!room) {
      room = {
        roomId,
        players: {},
        timeLeft: 60,
        isActive: false,
        patterns: [],
      };
      rooms[roomId] = room;
    }

    const newPlayer: Player = {
      id: socket.id,
      username: username || "Player",
      score: 0,
      roomId,
    };

    room.players[socket.id] = newPlayer;

    // Broadcast updated players list to room so everyone sees the new player
    io.to(roomId).emit("room-updated", room);
  });

  socket.on("start-game", (roomId: string) => {
    const room = rooms[roomId];
    if (!room || room.isActive) return;

    room.patterns = generatePatterns(100);
    room.isActive = true;
    room.timeLeft = 60;

    Object.values(room.players).forEach((p) => (p.score = 0));

    io.to(roomId).emit("game-started", room);

    const timer = setInterval(() => {
      room.timeLeft -= 1;
      io.to(roomId).emit("timer-update", room.timeLeft);

      if (room.timeLeft <= 0) {
        clearInterval(timer);
        room.isActive = false;
        io.to(roomId).emit("game-over", room);
      }
    }, 1000);
  });

  socket.on("score-update", (roomId: string, newScore: number) => {
    const room = rooms[roomId];
    const player = room?.players?.[socket.id];
    if (room && player) {
      player.score = newScore;
      io.to(roomId).emit("room-updated", room); // broadcast to update opponents
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (!room) continue;
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        io.to(roomId).emit("room-updated", room);

        if (Object.keys(room.players).length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server live on http://localhost:${PORT}`);
});
