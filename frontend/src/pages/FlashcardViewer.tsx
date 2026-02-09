import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
import { Flashcard } from '@/types';

const FlashcardViewer = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const bookId = location.state?.bookId || 'forty-hadiths';

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const data = await api.getFlashcards(bookId);
      setFlashcards(data.flashcards);
    } catch (err: any) {
      setError(err.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/flashcards');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No flashcards available</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100/60 transition-all duration-200"
        >
          <span className="text-2xl">←</span>
          <span className="font-medium">Back to Flashcards</span>
        </button>
        <div className="px-4 py-2 bg-gray-100/60 backdrop-blur rounded-full text-sm font-medium text-gray-700">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="perspective-1000 cursor-pointer mb-8"
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        <div
          className={`relative w-full min-h-[400px] transition-transform duration-500 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of card */}
          <div
            className="absolute w-full h-full backface-hidden bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 p-12 flex flex-col justify-center border border-gray-200/50"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-primary-500/30">
                {currentCard.type}
              </span>
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
              {currentCard.question}
            </h2>
            <p className="text-gray-400 text-center mt-10 font-medium">Click to reveal answer</p>
          </div>

          {/* Back of card */}
          <div
            className="absolute w-full h-full backface-hidden bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-3xl shadow-2xl shadow-primary-500/40 p-12 flex flex-col justify-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-xl mb-8 leading-relaxed">{currentCard.answer}</p>

            {currentCard.context && (
              <div className="mt-6 pt-6 border-t border-white/30">
                <p className="text-sm opacity-90 leading-relaxed">
                  <strong className="font-semibold">Context:</strong> {currentCard.context}
                </p>
              </div>
            )}

            {currentCard.arabic && (
              <div className="mt-6 pt-6 border-t border-white/30">
                <p className="text-3xl text-right mb-3 font-arabic">{currentCard.arabic}</p>
                {currentCard.transliteration && (
                  <p className="text-sm opacity-90 text-right">{currentCard.transliteration}</p>
                )}
              </div>
            )}

            <p className="text-sm opacity-75 text-center mt-10 font-medium">Click to flip back</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 transition-colors"
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FlashcardViewer;
