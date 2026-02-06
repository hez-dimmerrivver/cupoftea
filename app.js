const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3500;

app.use(express.static("public"));

let allSelections = [];
let participantIDs = new Set(); // To store unique participants
server.listen(port, () => {
  console.log("listening on: " + port);
});

// Socket.io

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  // Add new participant to the Set
  participantIDs.add(socket.id);

  // Send current boxes and cumulative participant count
  socket.emit("allSelections", allSelections);
  io.emit("participantCount", participantIDs.size);

  socket.on("updateSelection", ({ genre, checked }) => {
    if (checked) {
      allSelections.push(genre);
      if (allSelections.length > 100) allSelections.shift(); // max 100
    } else {
      const idx = allSelections.lastIndexOf(genre);
      if (idx !== -1) allSelections.splice(idx, 1);
    }
    io.emit("allSelections", allSelections);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    // Keep participantIDs intact — we still count them as having participated
    io.emit("participantCount", participantIDs.size);
  });
});
