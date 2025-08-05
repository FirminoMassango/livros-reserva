import { BarChart3, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: 'sales',
    label: 'Vendas',
    icon: ShoppingBag,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
  },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-3 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                "hover:bg-muted active:bg-muted/70",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all",
                  isActive && "scale-110"
                )} 
              />
              <span className={cn(
                "text-xs font-medium",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}