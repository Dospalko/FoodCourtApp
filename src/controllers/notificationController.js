// src/controllers/notificationController.js
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const { authToken, customerId } = req.query;
  if (!authToken && !customerId) {
    return res.status(400).json({ message: 'authToken or customerId is required' });
  }
  try {
    let notifications;
    if (customerId) {
      // Filtrovanie podľa perzistentného identifikátora zákazníka
      notifications = await Notification.find({ customerId });
    } else {
      notifications = await Notification.find({ authToken });
    }
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};
