import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BadgeCheck, BookOpen, User } from 'lucide-react';
import api from '../api/client';

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/ids', label: 'IDs', icon: BadgeCheck, badge: true },
  { to: '/passbook', label: 'Passbook', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const [showIdsDot, setShowIdsDot] = useState(false);

  const refreshBadge = useCallback(async () => {
    try {
      const [pRes, gRes] = await Promise.all([
        api.get('/game-ids/platforms'),
        api.get('/game-ids'),
      ]);
      const list = gRes.data.gameIds || [];
      const platforms = pRes.data.platforms || [];
      const blocked = (name) => {
        const g = list.find((x) => x.platformName === name);
        if (!g) return false;
        const a = g.approvalStatus || 'approved';
        return a !== 'rejected';
      };
      setShowIdsDot(platforms.some((pl) => !blocked(pl.name)));
    } catch {
      setShowIdsDot(false);
    }
  }, []);

  useEffect(() => {
    refreshBadge();
  }, [location.pathname, refreshBadge]);

  useEffect(() => {
    const onIdsChanged = () => refreshBadge();
    window.addEventListener('mahadev:game-ids-changed', onIdsChanged);
    return () => window.removeEventListener('mahadev:game-ids-changed', onIdsChanged);
  }, [refreshBadge]);

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[768px] -translate-x-1/2 rounded-t-2xl border border-zinc-800/90 bg-[#141414]/98 shadow-lg shadow-black/40 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 py-2.5">
        {items.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-accent-blue' : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            <span className="relative inline-flex">
              <Icon className="h-5 w-5" strokeWidth={2} />
              {badge && showIdsDot && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#141414]" />
              )}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
