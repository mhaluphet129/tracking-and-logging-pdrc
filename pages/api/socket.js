import { Server } from "Socket.IO";
import { v4 } from "uuid";
import { IDGen } from "../assets/utilities";

/*        //==============/================/===================/==================//
              WEBSOCKETS handles end to end communications without pulling an API 
              to listen every time okay ?
          //===============/================/===================/=================//           */

let key = IDGen(v4(), 6);
let isConnected = false;

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
  } else {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    io.on("connection", (socket) => {
      key = req.cookies["key"] || key;
      socket.emit("room-connected", key);
      // // setter
      socket.on("connected", () => {
        isConnected = true;
        socket.broadcast.emit("connection-status", isConnected);
      });
      socket.on("disconnected", () => {
        isConnected = false;
        socket.broadcast.emit("connection-status", isConnected);
      });
      socket.on("new-key", () => {
        key = IDGen(v4(), 6);
        isConnected = false;
        socket.emit("room-connected", key);
        socket.broadcast.emit("connection-status", isConnected);
        socket.broadcast.emit("on-getKey", key);
      });

      // //getter
      socket.on("is-connected", () => {
        socket.emit("connection-status", isConnected);
      });
      socket.on("get-key", () => {
        socket.emit("on-getKey", key);
      });
      socket.on("open-visitor", (id) => {
        socket.broadcast.emit("open-profile", id);
      });
    });
  }
  res.end();
};

export default SocketHandler;
