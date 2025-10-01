const { Server } = require("socket.io")
const supabase = require("../Connection.js")

// to store online users.id and socket id
const onlineUsers = new Map();

const socketService = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true
    },
    pingTimeout: 60000,//Disconnect the client if no pong is received within 60000 ms
    path: '/api/v1/Chat'
  });

  // Handeling new socket connection
  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);
    const userId = null;

    // handle user connection and mark them online

    socket.on("user_connected", (Id) => {
      try {
        userId = Id;
        onlineUsers.set(userId, socket.id);
        socket.join(userId); // Join a personal room for direct emit

      } catch (error) {
        console.error("Error in user_connected:", error);

      }
    })
    // forward message to receiver if online
    socket.on("send_message", async (message) => {
      try {
        const receiverSocketId = onlineUsers.get(message.receiver.id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive-message", message);
        }
      } catch (error) {
        console.error("Error in send-message:", error);
        socket.emit("error", { error_message: "Message delivery failed." });
      }
    })

    socket.on("message_read", async (messageids, senderid) => {
      try {
        for (const id of messageids) {
          const { data, error } = await supabase
            .from('messages')
            .update('status', 'read')
            .eq('id', id)
            .eq('receiver', userId)
            .select('*');
          if (error) throw error;
          const senderSocketId = onlineUsers.get(senderid);
          if (senderSocketId) {
            io.to(senderSocketId).emit("message_status_update", { id, status: 'read' });
          }
        }
      } catch (error) {
        console.error("Error in message_read:", error);

      }
    })

    


  })
}




module.exports = socketService;