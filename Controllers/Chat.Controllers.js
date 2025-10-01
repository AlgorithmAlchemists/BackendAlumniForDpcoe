const apiError = require("../Services/apiError.Services.js")
const supabase = require("../Connection.js")
const uploadOnCLoudinary = require("../Services/cloudinary.Services.js")
const apiResponse = require("../Services/apiResponse.Services.js");
const getUserDetails = require("../Services/userinfo.Services.js");
// const { get } = require("../Routes/chat.Route.js");

async function sendMessage(req, res) {
  try {
    //check if conversation exists between sender and receiver  
    let { senderId, receiverId, content, instituteId } = req.body;
    // const  = req.senderId.instituteId; // both have same instituteId as per middleware
    // console.log(`body : ${req.body}, file : ${req.file}, sender :  ${senderId}, reciver : ${receiverId}, institute : ${instituteId}`);
    // console.log(req.body)
    let { data: existing, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .or(`participants.cs.{${senderId.id}},participants.cs.{${receiverId.id}}`) // check both are present
      .eq("instituteid", instituteId)
      .maybeSingle();
    // console.log(fetchError);
    //if not create a new conversation
    if (!existing) {
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          participants: [senderId.id, receiverId.id], instituteid: instituteId, createdby: senderId.id
        })
        .select()
        .maybeSingle();
      // console.log(createError);
      if (newConv) {
        existing = newConv;
        // console.log("New conversation created");
      }
    }
    let imageorvideoorpdf = null, contenttype = null;

    if (req.file) {
      if (req.file.mimetype.startsWith("image/")) {
        contenttype = "image"
        content = null
      } else if (req.file.mimetype.startsWith("video/")) {
        contenttype = "video"
        content = null
      } else if (req.file.mimetype == "application/pdf") {
        contenttype = "raw"
        content = null
      } else {
        return res.status(400).json(new apiError(400, "Invalid file type"))
      }
      const localPath = req.file.path
      const url = await uploadOnCLoudinary(localPath, contenttype)
      if (!url) return res.status(500).json(new apiError(500, "File upload failed"))
      imageorvideoorpdf = url
    } else if (content?.trim()) {
      contenttype = "text"
    } else {
      return res.status(400).json(new apiError(400, "Either content or file is required"))
    }
    // console.log("aftr file upload", existing);
    //add message to Messages table with conversationId
    // console.log( existing.id, senderId.id, receiverId.id, content, contenttype, imageorvideoorpdf );
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert({ conversationid: existing.id, sender: senderId.id, receiver: receiverId.id, content, contenttype, imageorvideoorpdf })
      .select('*')
      .maybeSingle();
    if (messageError) {
      // console.log(messageError);
      return res.status(500).json(new apiError(500, "Failed to send message"));
    }

    if (newMessage?.content) {
      existing.lastmessage = newMessage?.id;

    }
    existing.unreadcount = (existing.unreadcount || 0) + 1;
    // console.log("aftr unreadcount", newMessage, existing);
    const { data: updateData, error: updateError } = await supabase
      .from("conversations")
      .update({ lastmessage: existing.lastmessage, updated_at: new Date().toISOString(), unreadcount: existing.unreadcount })
      .eq("id", existing.id)
      .select('lastmessage')
      .maybeSingle();
    // console.log("aftr conversation update",updateData,updateError);

    //create a populated response to emit with socket.io
    let { data: Message, error: populatedError } = await supabase
      .from("messages")
      .select(`*`)
      .eq("id", newMessage.id)
    // console.log(newMessage.sender,newMessage.receiver);
    Message.sender = await getUserDetails(newMessage.sender);
    Message.receiver = await getUserDetails(newMessage.receiver);

    //using socket.io emit the message to the receiver if online

    if(req.io && req.socketUserMap){
      const receiverSocketId = req.socketUserMap.get(Message.receiver.id)
      if(receiverSocketId){
        req.io.to(receiverSocketId).emit("receive_message",Message)
        const {data,error} = await supabase
        .from('messages')
        .update({status:'delivered'})
        
        if(error){
          console.log("fron send-message emmit")
          return res.status(500).json(new apiError(500,"Internal error"))
        }
      }
    }

    //save the message in the conversation
    res.status(200).json({ message: "Message sent successfully", data: Message });
  } catch (error) {
    console.error(error);
    res.status(500).json(new apiError(500, "Internal server error"));
  }
}

async function getConversations(req, res) {
  try {
    const userId = req.alumni?.id || req.student?.id;

    // 1️⃣ Fetch conversations without participant join
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*, lastmessage(*)")
      .contains("participants", [userId])
      .order("updated_at", { ascending: false });

    if (error) return res.status(500).json(new apiError(500, "Failed to fetch conversations"));

    // 2️⃣ Populate participants and lastMessage sender/receiver
    for (const conv of conversations) {
      // Populate participants
      conv.participants = await Promise.all(
        conv.participants.map(async (id) => {
          const user = await getUserDetails(id);
          return user ? user : { id, unknown: true };
        })
      );

      // Populate lastMessage sender and receiver
      if (conv.lastmessage) {
        conv.lastmessage.sender = await getUserDetails(conv.lastmessage.sender);
        conv.lastmessage.reciver = await getUserDetails(conv.lastmessage.reciver);
      }

      //get all message in order in which they were created(latests first) for tht conversation id
      const { data: messages, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversationid", conv.id)
        .order("created_at", { ascending: false })
        .range(0, 19); // limit to latest 20 messages
      if (msgError) {
        console.error(`Failed to fetch messages for conversation ${conv.id}:`, msgError);
        conv.messages = [];
      } else {
        // Populate sender and receiver for each message

        conv.messages = await Promise.all(
          messages.map(async (msg) => {
            if (msg.receiver == userId) {
                msg.status = 'delivered';
            }
            msg.sender = await getUserDetails(msg.sender);
            msg.reciver = await getUserDetails(msg.receiver);

            return msg;
          })
        );
      }

    }



    res.status(200).json(new apiResponse(200, "Conversations fetched successfully", conversations));

  } catch (error) {
    console.error(error);
    res.status(500).json(new apiError(500, "Internal server error"));
  }
}

async function getAllMessages(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const conversationid = req.params.conversationid;
    const userId = req.alumni?.id || req.student?.id;
    //check if user is part of the conversation
    console.log(conversationid, userId);
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationid)
      .single();
    if (convError || !conversation) {
      return res.status(404).json(new apiError(404, "Conversation not found"));
    }
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json(new apiError(403, "Access denied"));
    }
    console.log("Conversation found:", conversation);
    // update status of all messages where receiver is user to 'read'
    const { data: updateData, error: updateError } = await supabase
      .from("messages")
      .update({ status: 'read' })
      .select('*')
      .eq("conversationid", conversationid)
      .eq("receiver", userId)
      .eq("status", 'sent');
    if (updateError) {
      console.error("Failed to update message status:", updateError);
    }
    console.log(`Updated ${updateData?.length || 0} messages to read status`);
    //fetch messages for the conversation
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversationid", conversationid)
      .order("createdat", { ascending: false })
      .range((page - 1) * limit, page * limit - 1); //pagination
    if (msgError) {
      console.error("Failed to fetch messages:", msgError);
      return res.status(500).json(new apiError(500, "Failed to fetch messages"));
    }
    console.log(`Fetched ${messages.length} messages for conversation ${conversationid}`);

    //update unread count in conversation to 0
    if (updateData?.length > 0) {
      await supabase
        .from("conversations")
        .update({ unreadcount: conversation.unreadcount - updateData.length })
        .eq("id", conversationid);

      if (convUpdateError) {
        console.error("Failed to update conversation unread count:", convUpdateError);
      }
    }


    console.log("Messages fetched:", messages);
    //populate sender and receiver for each message
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        msg.sender = await getUserDetails(msg.sender);
        msg.reciver = await getUserDetails(msg.receiver);
        return msg;
      })
    );
    console.log("Populated messages:", populatedMessages);
    res.status(200).json(new apiResponse(200, "Messages fetched successfully", populatedMessages));
  } catch (error) {
    console.error(error);
    res.status(500).json(new apiError(500, "Internal server error"));
  }
}

async function createNewConversation(req, res) {
  try {
    const participants = req.body.participants;

    const { data: existing, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .contains("participants", participants)
      .eq("instituteid", req.alumni?.instituteId || req.student?.instituteId)
      .maybeSingle();

    if (existing) {
      return res.status(200).json(new apiResponse(200, "Conversation already exists", existing));
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert([{
        participants: participants,
        instituteid: req.alumni?.instituteId || req.student?.instituteId,
        createdby: req.alumni?.id || req.student?.id
      }]);

    if (error) {
      console.error(error);
      return res.status(500).json(new apiError(500, "Failed to create conversation"));
    }
    res.status(200).json(new apiResponse(200, "Conversation created successfully", data));
    return

  } catch (error) {
    console.error(error);
    res.status(500).json(new apiError(500, "Internal server error"));
    return
  }
}

async function markMessagesAsRead(req, res) {
  try {
    const conversationid = req.params.conversationid;
    const user = req.user;

    // 1. Mark messages as read
    const { data: messages, error } = await supabase
      .from("messages")
      .update({ status: "read" })
      .eq("conversationid", conversationid)
      .eq("receiver", user.id)
      .eq("status", "sent")
      .select("*");

    if (error) {
      console.error(error);
      return res.status(500).json(new apiError(500, "Failed to mark messages as read"));
    }

    // 2. Recalculate unread count directly (safer than subtracting)
    const { data:count, error: countError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversationid", conversationid)
      .eq("receiver", user.id)
      .eq("status", "sent");

    if (countError) {
      console.error(countError);
    } else {
      // 3. Update conversation with new count
      const { error: convError } = await supabase
        .from("conversations")
        .update({ unreadcount: count || 0 })
        .eq("id", conversationid);

      if (convError) {
        console.error(convError);
      }
    }

    // 4. Emit socket.io event if needed

    if(req.io && req.socketUserMap){
      const senderSocketId = req.socketUserMap.get(count.sender.toString())
      if(senderSocketId){
        req.io.to(senderSocketId).emit("message_read",count)
        
      }
    }

    // 5. Response
    res.status(200).json(new apiResponse(200, "Messages marked as read", messages));

  } catch (error) {
    console.error(error);
    res.status(500).json(new apiError(500, "Internal server error"));
  }
}


async function deleteMessage(req, res) {
  try {
    const messageid = req.params.messageid;
    const user = req.user;
    // if (message.sender !== user.id) {
    //   return res.status(403).json(new apiError(403, "You can only delete your own messages"));
    // }
    const { data: deletedMessage, error: fetchError } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageid)
      .eq("sender", user.id)
      .select('*')
      .maybeSingle();
    if (fetchError) {
      console.error(fetchError);
      return res.status(500).json(new apiError(500, "Failed to delete message"));
    }
    if (!deletedMessage) {
      return res.status(404).json(new apiError(404, "Message not found"));
    }

    // emmit message has been deleted using socket.io

    if(req.io && req.socketUserMap){
      const receiverSocketId = req.socketUserMap.get(deletedMessage.receiver.toString())
      if(receiverSocketId){
        req.io.to(receiverSocketId).emit("message_deleted",deletedMessage)
        
      }
    }

    //response
    return res.status(200).json(new apiResponse(200, "Message deleted successfully", deleteMessage));
  } catch (error) {
    console.error(error)
    return res.status(500).json(new apiError(500, "Internal server error"))
  }
}

module.exports = { sendMessage, getConversations, getAllMessages, createNewConversation, markMessagesAsRead, deleteMessage };