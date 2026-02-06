// Import Libraries and Setup

import express from "express";
import http from "http";
import { Server } from "socket.io";

//// REMOVE IF YOU PUT ON RENDER //////
import open, { openApp, apps } from "open"; //only needed for a simple development tool remove if hosting online see above
//// REMOVE IF YOU PUT ON RENDER //////

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app); //socket.io needs an http server
const io = new Server(server);
const port = process.env.PORT || 3500;

//Tell our Node.js Server to host our P5.JS sketch from the public folder
app.use(express.static("public"));

// Setup Our Node.js server to listen to connections
server.listen(port, () => {
  console.log("listening on: " + port);
});

let printEveryMessage = false;
const drawingHistory = []; //server memory, session only.
const MAX_HISTORY = 5000;

//// REMOVE IF YOU PUT ON RENDER //////
//open in browser: dev environment only!
await open(`http://localhost:${port}`); //opens in your default browser
//// REMOVE IF YOU PUT ON RENDER //////

// Callback function for when our P5.JS sketch connects
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.emit("history", drawingHistory); //when a new user connects, send them the history of drawings

  // Code to run every time we get a message from front-end P5.JS
  socket.on("drawing", (data) => {
    drawingHistory.push(data); //saves incoming drawing events into memory array

    if (drawingHistory.length > MAX_HISTORY) {
      drawingHistory.shift(); //if over 5000, remove oldest item in the array
    }

    //do something
    socket.broadcast.emit("drawing", data); //broadcast.emit means send to everyone but the sender

    // Print it to the Console
    if (printEveryMessage) {
      console.log(data);
    }
  });
});
