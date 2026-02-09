import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import FlashcardViewer from './pages/FlashcardViewer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/flashcards" replace />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="flashcards/viewer" element={<FlashcardViewer />} />
            <Route path="qiraat-corrector" element={<ComingSoon title="Qira'at Corrector" />} />
            <Route path="chain-narration" element={<ComingSoon title="Chain-of-Narration" />} />
            <Route path="quran-expanded" element={<ComingSoon title="Qur'an Expanded" />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-xl text-gray-600">Coming soon</p>
      </div>
    </div>
  );
}

export default App;
