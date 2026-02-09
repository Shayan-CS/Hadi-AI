import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { BookMetadata } from '../types/flashcard';

const router = Router();

// Get book metadata
router.get('/:bookId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { bookId } = req.params;

    // For MVP, we only have one book (Forty Hadiths)
    if (bookId !== 'forty-hadiths') {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    const bookMetadata: BookMetadata = {
      id: 'forty-hadiths',
      title: 'An-Nawawi\'s Forty Hadiths',
      coverImage: '/static/fortyHadiths.pdf',
      description: 'A collection of forty hadiths compiled by Imam An-Nawawi',
      totalFlashcards: 100,
    };

    res.json(bookMetadata);
  } catch (error) {
    console.error('Error fetching book metadata:', error);
    res.status(500).json({ error: 'Failed to fetch book metadata' });
  }
});

export default router;
