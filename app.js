const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3500;

app.use(express.static("public"));

let allSelections = [];
server.listen(port, () => {
  console.log("listening on: " + port);
});

// Socket.io

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.emit("allSelections", allSelections);

  socket.on("updateSelection", ({ genre, checked }) => {
    if (checked) {
      if (!allSelections.includes(genre)) allSelections.push(genre);
    } else {
      allSelections = allSelections.filter((g) => g !== genre);
    }

    io.emit("allSelections", allSelections);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});
