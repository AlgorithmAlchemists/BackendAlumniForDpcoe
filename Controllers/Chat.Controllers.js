const apiError = require("../Services/apiError.Services.js")
const supabase = require("../Services/supabase.Services.js")
const uploadOnCLoudinary = require("../Services/cloudinary.Services.js")
async function sendMessage(req, res) {
  try {
    //check if conversation exists between sender and receiver  
  let { senderId, receiverId, content} = req.body;
    const instituteId = req.senderId.instituteId; // both have same instituteId as per middleware

    let { data: existing, error: fetchError } = await supabase
      .from("conversations")
      .select("*")
      .contains("participants", [senderId, receiverId].sort()) // check both are present
      .eq("instituteid", instituteId)
      .maybeSingle();

    //if not create a new conversation
    if (!existing) {
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          participants: [senderId, receiverId], instituteid, createdby: senderId
        })
        .select()
        .maybeSingle();

        if(newConv){
          existing=newConv; 
        }
    }
    let imageorvideoorpdf=null,contenttype=null;

    if(req.file){
      if(req.file.mimetype.startsWith("image/")){
        contenttype="image"
        content=null
      }else if(req.file.mimetype.startsWith("video/")){
        contenttype="video"
        content=null
      }else if(req.file.mimetype("applicatioin/pdf")){
        contenttype="raw"
        content=null
      }else{
        return res.status(400).json(new apiError(400,"Invalid file type"))
      }
      const localPath = req.file.path
      const url = await uploadOnCLoudinary(localPath,contenttype)
      if(!url) return res.status(500).json(new apiError(500,"File upload failed"))
        imageorvideoorpdf=url
    }else if(content?.trim()){
      contenttype="text"
    }else{
      return res.status(400).json(new apiError(400,"Either content or file is required"))
    }
    //add message to Messages table with conversationId
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert({ conversationid: existing.id, sender:senderId.id,reciver:receiverId.id, content, contenttype, imageorvideoorpdf })
      .select('*')
      .maybeSingle();
    if (messageError) {
      return res.status(500).json(new apiError(500, "Failed to send message"));
    }

    if(newMessage?.content){
      existing.lastMessage=newMessage?.id
    }
    existing.unreadcount=existing.unreadcount+1 ;
     const {data:updateData,error:updateError} = await supabase
      .from("conversations")
      .update({ lastmessage: existing.lastMessage, updatedAt: new Date().toISOString(), unreadcount:existing.unreadcount })
      .eq("id", existing.id)
      .select()
      .maybeSingle();

    //create a populated response to emit with socket.io
    const {data:populatedMessage,error:populatedError} = await supabase
      .from("messages")
      .select(`*, sender:Users(id, fName, lName,role), reciver:Users(id, fName, lName, role), `)
      .eq("id", newMessage.id)

      //using socket.io emit the message to the receiver if online

    //save the message in the conversation
    res.status(200).json({ message: "Message sent successfully", data: populatedMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json(new apiError(500, "Internal server error") );
  }
}

module.exports = { sendMessage };