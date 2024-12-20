import Notification from "../../models/SuperAdmin/notificationModel.js";
import mongoose from 'mongoose';

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    console.log("Creating notification with data:", req.body);

    const notification = await Notification.create({
      recipient: req.body.recipient,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
      relatedItem: req.body.relatedItem,
      itemModel: req.body.itemModel,
      read: false,
    });

    console.log("Created notification:", notification);

    res.status(201).json({
      status: "success",
      data: {
        notification,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all notifications for a specific user
export const getUserNotifications = async (req, res) => {
  try {
    // Debug logging
    console.log("Getting notifications for user ID:", req.user._id);
    console.log("User ID type:", typeof req.user._id);
    
    // Convert string ID to ObjectId if necessary
    const userId = typeof req.user._id === 'string' 
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.user._id;

    // First check if there are any notifications at all
    const allNotifications = await Notification.find({});
    console.log("Total notifications in database:", allNotifications.length);
    
    // Log all recipient IDs for comparison
    console.log("All notification recipients:", allNotifications.map(n => ({
      recipientId: n.recipient,
      recipientType: typeof n.recipient
    })));

    // Try exact match with both string and ObjectId
    const userNotifications = await Notification.find({
      recipient: {
        $in: [
          userId.toString(),
          userId
        ]
      }
    }).lean();

    console.log('Found notifications for user:', userNotifications);
    console.log('Query used:', {
      userId: userId,
      userIdString: userId.toString()
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications: userNotifications || [],
      },
    });
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get unread count with same ID handling
export const getUnreadCount = async (req, res) => {
  try {
    const userId = typeof req.user._id === 'string' 
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.user._id;

    const count = await Notification.countDocuments({
      recipient: {
        $in: [
          userId.toString(),
          userId
        ]
      },
      read: false
    });

    console.log('Unread count for user:', {
      userId: userId,
      userIdString: userId.toString(),
      count: count
    });

    res.status(200).json({
      status: 'success',
      data: {
        unreadCount: count
      },
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: "error",
        message: "No notification found with that ID",
      });
    }

    // After marking as read, get the new unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    });

    res.status(200).json({
      status: "success",
      data: {
        notification,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({
      status: "success",
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: "error",
        message: "No notification found with that ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete all read notifications
export const deleteReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id, read: true });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
