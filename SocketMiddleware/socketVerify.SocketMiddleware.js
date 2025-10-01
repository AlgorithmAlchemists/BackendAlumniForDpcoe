const verifyToken = require("../Middlewares/jwtVerify.Middlewares.js");
const supabase = require("../Connection.js");
const getUserDetails = require("../Services/userinfo.Services.js");

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



const checkSameInstitute = async (socket, next) => {
  try {
    const sender = socket.user; // already set by socketAuth
    if (!sender || !sender.id) {
      return next(new Error("Unauthorized user"));
    }

    // store institute_id of sender
    const senderData = await getUserDetails(sender.id)

    // attach institute_id for quick use
    socket.institute_id = senderData.instituteid;

    return next();
  } catch (err) {
    console.error("Institute check failed:", err.message);
    return next(new Error("Unauthorized"));
  }
};

// ✅ Event-level check inside handlers
const ensureSameInstitute = async (senderInstitute, receiverId) => {
  
  const receiverData = await getUserDetails(receiverId);

  return receiverData.instituteid === senderInstitute;
};




// socketVerify.SocketMiddleware.js
const mapIo = (io) => (req, res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap;
  next();
};

module.exports = {socketAuth, mapIo, checkSameInstitute, ensureSameInstitute};