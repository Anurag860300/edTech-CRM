const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public route: Submit an inquiry from the public form
router.post('/', inquiryController.createInquiry);

// Protected routes: Admin access only (enforced via custom JWT middleware)
router.get('/', authenticateToken, inquiryController.getInquiries);
router.get('/stats', authenticateToken, inquiryController.getInquiryStats);
router.get('/:id', authenticateToken, inquiryController.getInquiryById);
router.patch('/:id/status', authenticateToken, inquiryController.updateInquiryStatus);
router.delete('/:id', authenticateToken, inquiryController.deleteInquiry);

module.exports = router;
