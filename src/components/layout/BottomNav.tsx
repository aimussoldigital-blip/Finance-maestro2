import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Target, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onNewRecord: () => void;
}

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/analysis', icon: BarChart3, label: 'Análisis' },
  { path: 'new', icon: Plus, label: 'Nuevo', isAction: true },
  { path: '/goals', icon: Target, label: 'Metas' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

const BottomNav = ({ onNewRecord }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.path}
                onClick={onNewRecord}
                className="relative -mt-6"
              >
                <div className="w-14 h-14 rounded-full gradient-primary glow-primary flex items-center justify-center shadow-lg animate-pulse-glow">
                  <Plus className="h-7 w-7 text-primary-foreground" />
                </div>
              </button>
            );
          }

          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_8px_hsl(var(--primary))]')} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
