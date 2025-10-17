import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalPayments = await Payment.countDocuments({ status: 'captured' });

    // Get revenue
    const payments = await Payment.find({ status: 'captured' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Recent registrations
    const recentRegistrations = await Registration.find()
      .populate('user', 'name email')
      .populate('event', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent payments
    const recentPayments = await Payment.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    // Event-wise registrations
    const eventStats = await Registration.aggregate([
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: '$eventDetails'
      },
      {
        $project: {
          eventName: '$eventDetails.name',
          registrations: '$count',
          revenue: '$revenue'
        }
      },
      {
        $sort: { registrations: -1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalRegistrations,
        totalPayments,
        totalRevenue,
        recentPayments
      },
      recentRegistrations,
      eventStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, role } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User role updated',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/admin/clear-database
// @desc    Clear all data except admin users (ONE-TIME USE)
// @access  Private/Admin
router.post('/clear-database', protect, authorize('admin'), async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    // Verify admin password for security
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm this action'
      });
    }

    // Get the current admin user with password
    const admin = await User.findById(req.user._id).select('+password');
    const isPasswordMatch = await admin.matchPassword(confirmPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Database clear operation cancelled.'
      });
    }

    // Delete all notifications
    const notificationsDeleted = await Notification.deleteMany({});
    
    // Delete all payments
    const paymentsDeleted = await Payment.deleteMany({});
    
    // Delete all registrations
    const registrationsDeleted = await Registration.deleteMany({});
    
    // Delete all events
    const eventsDeleted = await Event.deleteMany({});
    
    // Delete all non-admin users
    const usersDeleted = await User.deleteMany({ role: { $ne: 'admin' } });
    
    // Count remaining admin users
    const adminCount = await User.countDocuments({ role: 'admin' });

    res.json({
      success: true,
      message: 'Database cleared successfully! Only admin users remain.',
      deletedCounts: {
        notifications: notificationsDeleted.deletedCount,
        payments: paymentsDeleted.deletedCount,
        registrations: registrationsDeleted.deletedCount,
        events: eventsDeleted.deletedCount,
        users: usersDeleted.deletedCount
      },
      remainingAdmins: adminCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
