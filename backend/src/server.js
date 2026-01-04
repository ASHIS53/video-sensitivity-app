import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./services/socket.service.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = http.createServer(app);
    initSocket(server);

    server
      .listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log("Port 5000 in use. Run: npx kill-port 5000");
        } else {
          console.error("Server error:", err);
        }
      });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
