import { Message, Conversation } from '../models/Chat.js';
import User from '../models/User.js';

export const getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId, propertyId } = req.body;
    const senderId = req.user.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
      property: propertyId || { $exists: false },
    }).populate('participants', 'name avatar isVerified').populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        property: propertyId || undefined,
      });
      conversation = await conversation.populate('participants', 'name avatar isVerified');
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name avatar isVerified lastActive')
      .populate('lastMessage')
      .populate('property', 'title images address')
      .sort('-lastMessageAt')
      .lean();

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Mark as read
    await Message.updateMany(
      { conversation: req.params.conversationId, sender: { $ne: req.user.id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!conversation.participants.includes(req.user.id))
      return res.status(403).json({ success: false, message: 'Not a participant' });

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content,
      type,
    });

    await message.populate('sender', 'name avatar');
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Emit via socket
    req.io.to(conversationId).emit('new_message', message);

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    const { participants, groupName, propertyId } = req.body;
    const allParticipants = [...new Set([req.user.id, ...participants])];

    const group = await Conversation.create({
      participants: allParticipants,
      isGroupChat: true,
      groupName,
      property: propertyId,
    });

    await group.populate('participants', 'name avatar');
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};