import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';
import fs from 'fs';
import path from 'path';
import { Flashcard, UserFlashcardState } from '../types/flashcard';

const router = Router();

// Get flashcards for a book
router.get('/:bookId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user!.id;

    // For MVP, we only have one book (Forty Hadiths)
    if (bookId !== 'forty-hadiths') {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    // Read the pre-generated flashcards from JSON file
    const flashcardsPath = path.join(
      __dirname,
      '../../../flashcard_generation/flashcards.json'
    );

    const flashcardsData = fs.readFileSync(flashcardsPath, 'utf-8');
    const flashcards: Flashcard[] = JSON.parse(flashcardsData);

    res.json({ flashcards });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Get user's flashcard generation state for a book
router.get('/:bookId/state', authenticate, async (req: AuthRequest, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user!.id;

    if (bookId !== 'forty-hadiths') {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    // Check if user has generated flashcards for this book
    const { data, error } = await supabaseAdmin
      .from('user_flashcard_states')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw error;
    }

    const state: UserFlashcardState = data ? {
      userId: data.user_id,
      bookId: data.book_id,
      hasGeneratedFlashcards: data.has_generated_flashcards,
      lastAccessedAt: data.last_accessed_at,
    } : {
      userId,
      bookId,
      hasGeneratedFlashcards: false,
      lastAccessedAt: new Date().toISOString(),
    };

    res.json(state);
  } catch (error) {
    console.error('Error fetching flashcard state:', error);
    res.status(500).json({ error: 'Failed to fetch flashcard state' });
  }
});

// Mark flashcards as generated for a user
router.post('/:bookId/generate', authenticate, async (req: AuthRequest, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user!.id;

    if (bookId !== 'forty-hadiths') {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    // Simulate generation delay (5-10 seconds as per requirements)
    // In production, this would be where flashcard generation happens
    // For MVP, we just mark as generated since flashcards already exist

    // Upsert the user's flashcard state
    const { data, error } = await supabaseAdmin
      .from('user_flashcard_states')
      .upsert({
        user_id: userId,
        book_id: bookId,
        has_generated_flashcards: true,
        last_accessed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,book_id',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Flashcards generated successfully',
      state: data,
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

export default router;
