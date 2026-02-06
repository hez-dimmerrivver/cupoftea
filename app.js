const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3500;

// 讓 Render 提供 public 資料夾裡的前端檔案
app.use(express.static("public"));

// 啟動伺服器
server.listen(port, () => {
  console.log("listening on: " + port);
});

// Socket.io
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
  });
});
