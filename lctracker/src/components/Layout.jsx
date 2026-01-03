import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const { isDark, toggleTheme } = useTheme();

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-1">
              <span className="text-xl font-bold text-amber-500">LC</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Tracker</span>
            </NavLink>
            <div className="flex items-center gap-2">
              <NavLink to="/" className={linkClass}>
                Today
              </NavLink>
              <NavLink to="/library" className={linkClass}>
                Library
              </NavLink>
              <NavLink to="/history" className={linkClass}>
                History
              </NavLink>
              <NavLink to="/stats" className={linkClass}>
                Stats
              </NavLink>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <NavLink
                to="/add"
                className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                + Add
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
