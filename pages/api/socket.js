import { Server } from "Socket.IO";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Sockets is already running.");
  } else {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    io.on("connection", (socket) => {
      socket.join("room1");
      socket.emit("room-connected", "room1");
      /*  //==============/================/===================/==================//
              WEBSOCKETS handles end to end communications without pulling an API 
              to listen every listeners okay ?
          //===============/================/===================/=================// */
    });
  }
  res.end();
};

export default SocketHandler;
