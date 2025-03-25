import express from 'express';
import {
  addSubscriber,
  unsubscribeSubscriber,
  getSubscribers,
  notifySubscribers,
  notifyNewProduct
} from '../controllers/subscriberController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').post(addSubscriber).get(authMiddleware, adminMiddleware, getSubscribers);
router.route('/unsubscribe').put(unsubscribeSubscriber);
router.route('/notify').post(authMiddleware, adminMiddleware, notifySubscribers);
router.route('/notify-new-product').post(authMiddleware, adminMiddleware, notifyNewProduct);

export default router;
