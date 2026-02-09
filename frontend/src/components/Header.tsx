import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-semibold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent" dir="rtl">
            هادي
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-500 font-medium">{user?.email}</span>
          <button
            onClick={() => signOut()}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-full transition-all duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
