import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Sign up endpoint - creates user without email confirmation
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Create user with admin API - bypasses email confirmation
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (error) {
      // If user already exists, return a specific message
      if (error.message.includes('already registered')) {
        res.status(409).json({ error: 'User already exists. Please sign in.' });
        return;
      }
      throw error;
    }

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// Verify token endpoint (optional, for debugging)
router.get('/verify', authenticate, (req: AuthRequest, res) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

export default router;
