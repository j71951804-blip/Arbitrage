// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const auth = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// routes/auth.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      settings: {
        minProfit: 10,
        minRoi: 25,
        keywords: ['electronics', 'books', 'toys'],
        notifications: true
      }
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    res.json({
      id: user._id,
      email: user.email,
      settings: user.settings,
      hasEbayKeys: !!(user.apiKeys?.ebay?.appId),
      hasAmazonKeys: !!(user.apiKeys?.amazon?.accessKey)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/settings', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { settings } = req.body;

    user.settings = { ...user.settings, ...settings };
    await user.save();

    res.json({ message: 'Settings updated successfully', settings: user.settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.put('/api-keys', auth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { ebay, amazon } = req.body;

    if (ebay) {
      user.apiKeys = user.apiKeys || {};
      user.apiKeys.ebay = { ...user.apiKeys.ebay, ...ebay };
    }

    if (amazon) {
      user.apiKeys = user.apiKeys || {};
      user.apiKeys.amazon = { ...user.apiKeys.amazon, ...amazon };
    }

    await user.save();

    res.json({ message: 'API keys updated successfully' });
  } catch (error) {
    console.error('Update API keys error:', error);
    res.status(500).json({ error: 'Failed to update API keys' });
  }
});

export { router as authRoutes };
