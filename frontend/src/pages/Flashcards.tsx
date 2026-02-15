import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { BookMetadata, UserFlashcardState } from '@/types';

type Section = null | 'hadith' | 'fiqh' | 'tafsir' | 'seerah';

const sections = [
  {
    id: 'hadith' as const,
    title: 'Hadith',
    description: 'Prophetic traditions and their explanations',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    color: 'bg-primary-50 text-primary-600',
    available: true,
  },
  {
    id: 'fiqh' as const,
    title: 'Fiqh',
    description: 'Islamic jurisprudence and rulings',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    ),
    color: 'bg-amber-50 text-amber-600',
    available: false,
  },
  {
    id: 'tafsir' as const,
    title: 'Tafsir',
    description: "Qur'anic exegesis and interpretation",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: 'bg-blue-50 text-blue-600',
    available: false,
  },
  {
    id: 'seerah' as const,
    title: 'Seerah',
    description: 'Prophetic biography and history',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-purple-50 text-purple-600',
    available: false,
  },
];

const Flashcards = () => {
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [book, setBook] = useState<BookMetadata | null>(null);
  const [state, setState] = useState<UserFlashcardState | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const bookId = 'forty-hadiths';

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

  const handleSectionClick = (sectionId: Section) => {
    if (sectionId === 'hadith') {
      setActiveSection('hadith');
      loadData();
    } else {
      setActiveSection(sectionId);
    }
  };

  const handleBack = () => {
    setActiveSection(null);
    setError('');
  };

  const handleGenerateFlashcards = async () => {
    setError('');
    setGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 7000));
      await api.generateFlashcards(bookId);
      navigate('/dashboard/flashcards/viewer', { state: { bookId } });
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcards');
      setGenerating(false);
    }
  };

  const handleViewFlashcards = () => {
    navigate('/dashboard/flashcards/viewer', { state: { bookId } });
  };

  // Coming Soon view for Fiqh, Tafsir, Seerah
  if (activeSection && activeSection !== 'hadith') {
    const section = sections.find((s) => s.id === activeSection)!;
    return (
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to sections
        </button>
        <div className="flex flex-col items-center justify-center py-24">
          <div className={`w-16 h-16 rounded-2xl ${section.color} flex items-center justify-center mb-6`}>
            {section.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
          <p className="text-gray-500 mb-4">{section.description}</p>
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
            Coming Soon
          </span>
        </div>
      </div>
    );
  }

  // Hadith section view (existing flashcards content)
  if (activeSection === 'hadith') {
    if (loading) {
      return (
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to sections
          </button>
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      );
    }

    if (error && !book) {
      return (
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to sections
          </button>
          <div className="flex items-center justify-center py-24">
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
        </div>
      );
    }

    return (
      <div>
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to sections
        </button>

        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Flashcards</h1>
            <p className="text-gray-500">Master your knowledge with interactive digital decks.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </button>
          </div>
        </div>

        {/* Featured Book Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Book Cover */}
            <div className="md:w-[340px] bg-gray-100 flex-shrink-0">
              {book?.coverImage ? (
                <iframe
                  src={`http://localhost:5001${book.coverImage}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full min-h-[400px]"
                  title="Book Cover"
                />
              ) : (
                <div className="bg-gradient-to-br from-primary-700 to-primary-900 p-8 flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-bold">{book?.title}</h3>
                  </div>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">Most Popular</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4].map((i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">{book?.title}</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">{book?.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span>{book?.totalFlashcards} flashcards</span>
                </div>
                {state?.hasGeneratedFlashcards && (
                  <div className="flex items-center gap-1.5 text-primary-600 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Ready to study</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {generating ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-primary-500 border-r-primary-500 border-b-transparent border-l-transparent mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">Generating flashcards...</p>
                  <p className="text-xs text-gray-400 mt-1">This may take 5-10 seconds</p>
                </div>
              ) : state?.hasGeneratedFlashcards ? (
                <button
                  onClick={handleViewFlashcards}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm"
                >
                  View Flashcards
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleGenerateFlashcards}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm"
                >
                  Generate Flashcards
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Progress + Recommended */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Progress */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Recent Progress</h3>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Introduction to Fiqh</p>
                  <p className="text-xs text-gray-400">24 cards reviewed · 2h ago</p>
                </div>
                <span className="text-sm font-bold text-primary-600">85%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Arabic Grammar Basics</p>
                  <p className="text-xs text-gray-400">12 cards reviewed · Yesterday</p>
                </div>
                <span className="text-sm font-bold text-gray-500">42%</span>
              </div>
            </div>
          </div>

          {/* Recommended for You */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a7 7 0 00-7 7c0 2.862 1.782 5.623 3.532 7.395A28.18 28.18 0 0012 19.79a28.18 28.18 0 003.468-3.395C17.218 14.623 19 11.862 19 9a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 text-white">
              <h4 className="font-bold text-base mb-2">Daily Quiz Challenge</h4>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Master 10 random hadiths from your collection to earn the 'Steady Seeker' badge.
              </p>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg font-medium text-sm transition-colors border border-white/10">
                Start Challenge
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="text-center mt-8 mb-4">
          <p className="text-sm text-gray-400 italic">
            "Seeking knowledge is an obligation upon every Muslim."
          </p>
        </div>
      </div>
    );
  }

  // Section selection view (default)
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Flashcards</h1>
        <p className="text-gray-500">Choose a subject to start studying.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSectionClick(section.id)}
            className="bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                  {!section.available && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-gray-100 text-gray-500">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Quote */}
      <div className="text-center mt-12">
        <p className="text-sm text-gray-400 italic">
          "Seeking knowledge is an obligation upon every Muslim."
        </p>
      </div>
    </div>
  );
};

export default Flashcards;
