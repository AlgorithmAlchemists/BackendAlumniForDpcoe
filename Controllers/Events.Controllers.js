const supabase = require("../Connection.js");
const apiResponse = require("../Services/apiResponse.Services.js");
const apiError = require("../Services/apiError.Services.js");
const checkAdminAccess = require("../Services/checkAdminAccess.Services.js");

// Create a new event (Admin only)
async function createEvent(req, res) {
  try {
    const access = req.admin.access;
    const hasAccess = checkAdminAccess(access, 'manageEvents');
    if (!hasAccess) {
      return res.status(403).json(new apiError(403, "Forbidden: You don't have access to manage events"));
    }

    const { title, description, venue, dateAndTime, duration } = req.body;

    // Validate required fields
    if (!title || !dateAndTime) {
      return res.status(400).json(new apiError(400, "Title and dateAndTime are required"));
    }

    const { data, error } = await supabase
      .from('Event')
      .insert([{
        createdby: req.admin.id,
        title,
        description: description || null,
        venue: venue || null,
        dateAndTime: dateAndTime,
        duration: duration || null
      }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json(new apiError(400, error.message));
    }

    res.status(201).json(new apiResponse(201, "Event created successfully", data));
  } catch (error) {
    console.error("Error in createEvent:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

// Get all events
async function getAllEvents(req, res) {
  try {
  
    const { data, error } = await supabase
      .from('Event')
      .select(`
        *,
        Admin:createdby (
          username,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json(new apiError(400, error.message));
    }

    res.status(200).json(new apiResponse(200, "Events fetched successfully", data));
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

// Update event (Admin who created only)
async function updateEvent(req, res) {
  try {
    const { eventId } = req.params;
    const updates = req.body;

    // Check if the event belongs to the current admin
    const { data: existingEvent, error: fetchError } = await supabase
      .from('Event')
      .select('createdby')
      .eq('id', eventId)
      .single();

    if (fetchError) {
      return res.status(404).json(new apiError(404, "Event not found"));
    }

    if (existingEvent.createdby !== req.admin.id) {
      return res.status(403).json(new apiError(403, "You can only update your own events"));
    }

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.createdby;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('Event')
      .update(updates)
      .eq('id', eventId)
      .select();

    if (error) {
      return res.status(400).json(new apiError(400, error.message));
    }

    res.status(200).json(new apiResponse(200, "Event updated successfully", data));
  } catch (error) {
    console.error("Error in updateEvent:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

// Delete event (Admin who created only)
async function deleteEvent(req, res) {
  try {
    const { eventId } = req.params;

    // Check if the event belongs to the current admin
    const { data: existingEvent, error: fetchError } = await supabase
      .from('Event')
      .select('createdby')
      .eq('id', eventId)
      .single();

    if (fetchError) {
      return res.status(404).json(new apiError(404, "Event not found"));
    }

    if (existingEvent.createdby !== req.admin.id) {
      return res.status(403).json(new apiError(403, "You can only delete your own events"));
    }

    const { data, error } = await supabase
      .from('Event')
      .delete()
      .eq('id', eventId)
      .select();

    if (error) {
      return res.status(400).json(new apiError(400, error.message));
    }

    res.status(200).json(new apiResponse(200, "Event deleted successfully", data));
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
};