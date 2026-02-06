const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3500;

app.use(express.static("public"));

let userSelections = {};
server.listen(port, () => {
  console.log("listening on: " + port);
});

// Socket.io
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // new user enter and see the history
  socket.emit("allSelections", userSelections);

  socket.on("updateSelection", ({ genre, checked }) => {
    if (!userSelections[socket.id]) {
      userSelections[socket.id] = [];
    }

    if (checked) {
      if (!userSelections[socket.id].includes(genre)) {
        userSelections[socket.id].push(genre);
      }
    } else {
      userSelections[socket.id] = userSelections[socket.id].filter(
        (g) => g !== genre,
      );
    }

    // broadcast to all people
    io.emit("allSelections", userSelections);
  });

  socket.on("disconnect", () => {
    delete userSelections[socket.id];
    io.emit("allSelections", userSelections);
  });
});
