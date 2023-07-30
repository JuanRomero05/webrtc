const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
     cors: {
          origin: "*",
          methods: ["GET", "POST"]
     }
});

app.use(cors());

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
     console.log("a user connected");

     socket.on("offer", (offer) => {
          console.log("offer received", offer);
          socket.broadcast.emit("offer", offer);
     });

     socket.on("answer", (answer) => {
          console.log("answer received", answer);
          socket.broadcast.emit("answer", answer);
     });

     socket.on("ice-candidate", (candidate) => {
          console.log("ice candidate received", candidate);
          socket.broadcast.emit("ice-candidate", candidate);
     });

     socket.on("disconnect", () => {
          console.log("user disconnected");
     });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));