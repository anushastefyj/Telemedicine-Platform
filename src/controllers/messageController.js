const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get chat history between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Send a message to another user
// @route   POST /api/messages/:userId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Please provide message content' });
    }

    const message = await Message.create({
      sender: currentUserId,
      receiver: otherUserId,
      content,
    });

    // Populate sender details for the real-time notification
    const populatedMessage = await Message.findById(message._id).populate('sender', 'name profilePic role');

    // Emit real-time notification using the function stored in app.locals
    if (req.app.locals.sendRealTimeNotification) {
      req.app.locals.sendRealTimeNotification(otherUserId, 'receive-message', populatedMessage);
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:userId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get recent chat contacts (users you have messaged)
// @route   GET /api/messages/contacts
// @access  Private
exports.getContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all unique users this user has interacted with
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort({ createdAt: -1 });

    const contactIds = new Set();
    const contacts = [];

    for (const msg of messages) {
      const otherId = msg.sender.toString() === currentUserId ? msg.receiver.toString() : msg.sender.toString();
      
      if (!contactIds.has(otherId)) {
        contactIds.add(otherId);
        
        // Find user details
        const user = await User.findById(otherId).select('name role profilePic');
        if (user) {
          contacts.push({
            _id: user._id,
            name: user.name,
            role: user.role,
            profilePic: user.profilePic,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unreadCount: msg.sender.toString() === otherId && !msg.isRead ? 1 : 0 // simplify unread logic for now
          });
        }
      } else {
        // If we already have the contact, just increment unread if applicable
        if (msg.sender.toString() === otherId && !msg.isRead) {
          const contact = contacts.find(c => c._id.toString() === otherId);
          if (contact) contact.unreadCount += 1;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
