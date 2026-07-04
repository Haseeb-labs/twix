import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';

const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
    {filled ? (
      <path d="M21 8.719L7.836 1.607c-.915-.534-2.082-.189-2.575.802l-.235.582 15.093 8.63.881-2.902zm-1.5 7.508l-7.3-3.704-1.363 2.687 7.3 3.704 1.363-2.687zM4.5 13.5L3 21l7.012-2.603-2.512-4.897z" />
    ) : (
      <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z" />
    )}
  </svg>
);

const ExploreIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
    {filled ? (
      <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5 4.694 0 8.5 3.806 8.5 8.5 0 1.986-.682 3.815-1.814 5.272l4.521 4.521-1.414 1.414-4.521-4.521c-1.457 1.132-3.286 1.814-5.272 1.814-4.694 0-8.5-3.806-8.5-8.5z" />
    ) : (
      <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5 4.694 0 8.5 3.806 8.5 8.5 0 1.986-.682 3.815-1.814 5.272l4.521 4.521-1.414 1.414-4.521-4.521c-1.457 1.132-3.286 1.814-5.272 1.814-4.694 0-8.5-3.806-8.5-8.5z" />
    )}
  </svg>
);

const BellIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
    {filled ? (
      <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L3 17h18l-.997-7.949C19.491 5.021 16.06 2 11.996 2zM12 23c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
    ) : (
      <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L3 17h18l-.997-7.949C19.491 5.021 16.06 2 11.996 2zm.004 2c3.05 0 5.5 2.258 5.998 5.276L18.772 15H5.228l.774-5.724C6.5 6.258 8.95 4 12 4zM12 23c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
    )}
  </svg>
);

const UserIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
    {filled ? (
      <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
    ) : (
      <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z" />
    )}
  </svg>
);

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', icon: (active) => <HomeIcon filled={active} />, label: 'Home' },
    { to: '/explore', icon: (active) => <ExploreIcon filled={active} />, label: 'Explore' },
    { to: '/notifications', icon: (active) => <BellIcon filled={active} />, label: 'Notifications' },
    ...(user ? [{ to: `/${user.handle}`, icon: (active) => <UserIcon filled={active} />, label: 'Profile' }] : []),
  ];

  return (
    <aside className="w-[72px] xl:w-64 flex flex-col py-2 px-2 xl:px-4 shrink-0">
      <Link to="/" className="p-3 rounded-full hover:bg-gray-900 transition-colors self-start mb-1">
        <XLogo />
      </Link>

      <nav className="flex flex-col gap-0.5 w-full">
        {navItems.map(({ to, icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 px-3 py-3 rounded-full hover:bg-gray-900 transition-colors ${active ? 'font-bold' : 'font-normal'}`}
            >
              <span className="text-white">{icon(active)}</span>
              <span className="hidden xl:block text-xl text-white">{label}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 px-3 py-3 w-full rounded-full hover:bg-gray-900 transition-colors"
        >
          <UserAvatar user={user} size={40} />
          <div className="hidden xl:block text-left overflow-hidden">
            <p className="text-white font-bold text-sm truncate">{user.username}</p>
            <p className="text-gray-500 text-sm truncate">@{user.handle}</p>
          </div>
        </button>
      )}
    </aside>
  );
}
