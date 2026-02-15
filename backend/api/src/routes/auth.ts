import { Router } from 'express';
import { Resend } from 'resend';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// In-memory store for pending signups
const pendingSignups = new Map<
  string,
  { password: string; code: string; expiresAt: number }
>();

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Sign up endpoint - sends verification code, does NOT create user yet
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user already exists in Supabase
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      res.status(409).json({ error: 'User already exists. Please sign in.' });
      return;
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store pending signup
    pendingSignups.set(email.toLowerCase(), { password, code, expiresAt });

    // Send verification email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Hadi <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Hadi - Verify your email',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #16a34a; margin-bottom: 8px;">Welcome to Hadi</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">Enter this code to verify your email address:</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend API error:', emailError);
      throw new Error(emailError.message || 'Failed to send email');
    }

    console.log('Email sent successfully:', emailData);
    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error: any) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: error.message || 'Failed to send verification code' });
  }
});

// Verify email and create user
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email and code are required' });
      return;
    }

    const pending = pendingSignups.get(email.toLowerCase());

    if (!pending) {
      res.status(400).json({ error: 'No pending verification found. Please sign up again.' });
      return;
    }

    if (Date.now() > pending.expiresAt) {
      pendingSignups.delete(email.toLowerCase());
      res.status(400).json({ error: 'Verification code has expired. Please sign up again.' });
      return;
    }

    if (pending.code !== code) {
      res.status(400).json({ error: 'Invalid verification code' });
      return;
    }

    // Code is valid - create user in Supabase
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: pending.password,
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        pendingSignups.delete(email.toLowerCase());
        res.status(409).json({ error: 'User already exists. Please sign in.' });
        return;
      }
      throw error;
    }

    // Clean up
    pendingSignups.delete(email.toLowerCase());

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error: any) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: error.message || 'Failed to verify email' });
  }
});

// Resend verification code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const pending = pendingSignups.get(email.toLowerCase());

    if (!pending) {
      res.status(400).json({ error: 'No pending verification found. Please sign up again.' });
      return;
    }

    // Generate new code and extend expiry
    const code = generateCode();
    pending.code = code;
    pending.expiresAt = Date.now() + 10 * 60 * 1000;

    // Send new code via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Hadi <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Hadi - Your new verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #16a34a; margin-bottom: 8px;">Hadi - New Verification Code</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">Here's your new verification code:</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend API error:', emailError);
      throw new Error(emailError.message || 'Failed to send email');
    }

    console.log('Resend code email sent:', emailData);
    res.json({ success: true, message: 'New verification code sent' });
  } catch (error: any) {
    console.error('Error resending code:', error);
    res.status(500).json({ error: error.message || 'Failed to resend code' });
  }
});

// Verify token endpoint
router.get('/verify', authenticate, (req: AuthRequest, res) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

export default router;
