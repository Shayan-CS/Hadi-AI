import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard/flashcards', label: 'Flashcards', icon: '📚' },
  { path: '/dashboard/qiraat-corrector', label: "Qira'at Corrector", icon: '🎙️', comingSoon: true },
  { path: '/dashboard/chain-narration', label: 'Chain-of-Narration', icon: '🔗', comingSoon: true },
  { path: '/dashboard/quran-expanded', label: "Qur'an Expanded", icon: '📖', comingSoon: true },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-72 bg-white/40 backdrop-blur-xl border-r border-gray-200/50 min-h-screen">
      <nav className="p-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-700 hover:bg-gray-100/60 hover:scale-[1.02]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-800'}`}>
                  {item.label}
                </span>
              </div>
              {item.comingSoon && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200/80 text-gray-600'
                }`}>
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
