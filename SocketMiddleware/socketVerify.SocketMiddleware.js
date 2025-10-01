const verifyToken = require("../Middlewares/jwtVerify.Middlewares.js");

const socketAuth = (socket, next) => {
  try {
    // Try from handshake.auth first (preferred for Socket.IO)
    let token = socket.handshake.auth?.token;

    // Fallback: from Authorization header if provided
    if (!token && socket.handshake.headers.authorization) {
      token = socket.handshake.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    // 🔑 Use your existing checkToken / verifyToken logic
    const decoded = verifyToken(token); // e.g. jwt.verify(token, secret)

    // attach user payload to socket
    socket.user = decoded;

    return next();
  } catch (err) {
    console.error("Socket auth failed:", err.message);
    return next(new Error("Unauthorized"));
  }
};

// socketVerify.SocketMiddleware.js
const mapIo = (io) => (req, res, next) => {
  req.io = io;
  req.socketUsersMap = io.socketUserMap;
  next();
};

module.exports = {socketAuth, mapIo};