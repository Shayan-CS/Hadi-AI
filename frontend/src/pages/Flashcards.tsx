import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { BookMetadata, UserFlashcardState } from '@/types';

const Flashcards = () => {
  const [book, setBook] = useState<BookMetadata | null>(null);
  const [state, setState] = useState<UserFlashcardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const bookId = 'forty-hadiths';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookData, stateData] = await Promise.all([
        api.getBook(bookId),
        api.getFlashcardState(bookId),
      ]);
      setBook(bookData);
      setState(stateData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setError('');
    setGenerating(true);

    try {
      // Simulate generation delay (5-10 seconds)
      await new Promise((resolve) => setTimeout(resolve, 7000));

      await api.generateFlashcards(bookId);

      // Navigate to viewer
      navigate('/dashboard/flashcards/viewer', { state: { bookId } });
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcards');
      setGenerating(false);
    }
  };

  const handleViewFlashcards = () => {
    navigate('/dashboard/flashcards/viewer', { state: { bookId } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-semibold text-gray-900 mb-10 tracking-tight">Flashcards</h1>

      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-200/50">
        <div className="flex flex-col md:flex-row">
          {/* Book Cover */}
          <div className="md:w-1/3 bg-gray-100 relative overflow-hidden">
            {book?.coverImage ? (
              <iframe
                src={`http://localhost:5001${book.coverImage}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full min-h-[400px]"
                title="Book Cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold">{book?.title}</h3>
                </div>
              </div>
            )}
          </div>

          {/* Book Info and Actions */}
          <div className="md:w-2/3 p-10">
            <h2 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">{book?.title}</h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">{book?.description}</p>

            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100/60 backdrop-blur rounded-full">
                <span className="font-medium text-gray-700 text-sm">{book?.totalFlashcards} flashcards</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {generating ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-14 w-14 border-3 border-t-primary-500 border-r-primary-500 border-b-transparent border-l-transparent mx-auto mb-5"></div>
                <p className="text-gray-800 font-semibold text-lg">Generating flashcards...</p>
                <p className="text-sm text-gray-500 mt-2">This may take 5-10 seconds</p>
              </div>
            ) : state?.hasGeneratedFlashcards ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-lg">{book?.totalFlashcards} flashcards ready</span>
                </div>
                <button
                  onClick={handleViewFlashcards}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 text-lg"
                >
                  <span>View Flashcards</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateFlashcards}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] transition-all duration-200 text-lg"
              >
                Generate Flashcards
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
