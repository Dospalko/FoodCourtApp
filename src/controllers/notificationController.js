// src/controllers/notificationController.js
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const { authToken } = req.query;
  if (!authToken) {
    return res.status(400).json({ message: 'authToken is required' });
  }
  try {
    const notifications = await Notification.findAll({ where: { authToken } });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};
