import asyncHandler from 'express-async-handler';
import Subscriber from '../models/subscriberModel.js';
import nodemailer from 'nodemailer';

// @desc    Add a new subscriber
// @route   POST /api/subscribers
// @access  Public
const addSubscriber = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  // Check if subscriber already exists
  const subscriberExists = await Subscriber.findOne({ email });

  if (subscriberExists) {
    // If subscriber exists but is not active, reactivate
    if (!subscriberExists.isActive) {
      subscriberExists.isActive = true;
      await subscriberExists.save();
      res.status(200).json({ message: 'Subscription reactivated successfully' });
    } else {
      res.status(200).json({ message: 'You are already subscribed' });
    }
    return;
  }

  // Create new subscriber
  const subscriber = await Subscriber.create({
    email,
    isActive: true,
    subscribedAt: Date.now(),
  });

  if (subscriber) {
    res.status(201).json({
      message: 'Subscribed successfully',
    });
  } else {
    res.status(400);
    throw new Error('Invalid subscriber data');
  }
});

// @desc    Unsubscribe a subscriber
// @route   PUT /api/subscribers/unsubscribe
// @access  Public
const unsubscribeSubscriber = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const subscriber = await Subscriber.findOne({ email });

  if (!subscriber) {
    res.status(404);
    throw new Error('Subscriber not found');
  }

  subscriber.isActive = false;
  await subscriber.save();

  res.status(200).json({ message: 'Unsubscribed successfully' });
});

// @desc    Get all subscribers
// @route   GET /api/subscribers
// @access  Private/Admin
const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
  res.status(200).json(subscribers);
});

// @desc    Send email to all active subscribers
// @route   POST /api/subscribers/notify
// @access  Private/Admin
const notifySubscribers = asyncHandler(async (req, res) => {
  const { subject, message, productId, productName, productImage } = req.body;

  if (!subject || !message) {
    res.status(400);
    throw new Error('Subject and message are required');
  }

  // Get all active subscribers
  const activeSubscribers = await Subscriber.find({ isActive: true });

  if (activeSubscribers.length === 0) {
    res.status(404);
    throw new Error('No active subscribers found');
  }

  // Configure nodemailer with more secure settings for Gmail
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  // Log connection attempt for debugging
  transporter.verify(function(error, success) {
    if (error) {
      console.log("SMTP Server connection error:", error);
    } else {
      console.log("SMTP Server is ready to send messages");
    }
  });

  // Create product link
  const productLink = productId 
    ? `${process.env.FRONTEND_URL}/product/${productId}`
    : `${process.env.FRONTEND_URL}/products`;

  // Create email template
  const createEmailTemplate = (productName, message, productLink, productImage) => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .product { margin-top: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .button { display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; 
                     text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Arian Shop Newsletter</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>${message}</p>
              ${productName ? `
              <div class="product">
                <h3>${productName}</h3>
                ${productImage ? `<img src="${productImage}" alt="${productName}" style="max-width: 200px;">` : ''}
                <p><a href="${productLink}" class="button">View Product</a></p>
              </div>
              ` : ''}
              <p>Thank you for subscribing to our newsletter!</p>
            </div>
            <div class="footer">
              <p>&#169; ${new Date().getFullYear()} Arian Shop. All rights reserved.</p>
              <p>If you wish to unsubscribe, <a href="${process.env.FRONTEND_URL}/unsubscribe">click here</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Send emails to all subscribers
  const emailPromises = activeSubscribers.map(async (subscriber) => {
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: subscriber.email,
      subject: subject,
      html: createEmailTemplate(productName, message, productLink, productImage),
    };

    try {
      console.log(`Attempting to send email to ${subscriber.email}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${subscriber.email}: ${info.messageId}`);
      
      // Update last email sent timestamp
      subscriber.lastEmailSent = Date.now();
      await subscriber.save();
      
      return { email: subscriber.email, status: 'success', messageId: info.messageId };
    } catch (error) {
      console.error(`Failed to send email to ${subscriber.email}:`, error);
      // More detailed error logging
      if (error.code) {
        console.error(`Error code: ${error.code}`);
      }
      if (error.command) {
        console.error(`Failed command: ${error.command}`);
      }
      return { email: subscriber.email, status: 'failed', error: error.message };
    }
  });

  const results = await Promise.all(emailPromises);
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;

  res.status(200).json({
    message: `Emails sent to ${successful} subscribers (${failed} failed)`,
    results,
  });
});

// @desc    Send notification about new product to all subscribers
// @route   POST /api/subscribers/notify-new-product
// @access  Private/Admin
const notifyNewProduct = asyncHandler(async (req, res) => {
  const { productId, productName, productImage, productDescription } = req.body;

  if (!productId || !productName) {
    res.status(400);
    throw new Error('Product ID and name are required');
  }

  const subject = `New Product: ${productName}`;
  const message = `We're excited to announce a new product in our store: ${productName}. ${productDescription || ''}`;

  // Reuse the notification function
  req.body.subject = subject;
  req.body.message = message;
  
  await notifySubscribers(req, res);
});

export { 
  addSubscriber, 
  unsubscribeSubscriber, 
  getSubscribers, 
  notifySubscribers,
  notifyNewProduct 
};
