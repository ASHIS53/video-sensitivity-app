import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) socket.join(userId);

    console.log("Socket connected:", socket.id);
  });
};

export const emitProgress = (userId, data) => {
  if (io) {
    io.to(userId).emit("progress", data);
  }
};
