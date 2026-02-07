import {
  Home, Utensils, Car, Fuel, Gamepad2, HeartPulse, Tv, CreditCard,
  MoreHorizontal, Briefcase, TrendingUp, Laptop, PlusCircle, Shield,
  Landmark, LineChart, PiggyBank, Circle, Target, Wallet, Bitcoin,
  BarChart3, DollarSign, Plane, ShoppingBag, Smartphone, Gift,
  GraduationCap, Baby, Dog, Dumbbell, Music, Camera, Book, Coffee
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  utensils: Utensils,
  car: Car,
  fuel: Fuel,
  'gamepad-2': Gamepad2,
  'heart-pulse': HeartPulse,
  tv: Tv,
  'credit-card': CreditCard,
  'more-horizontal': MoreHorizontal,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  laptop: Laptop,
  'plus-circle': PlusCircle,
  shield: Shield,
  landmark: Landmark,
  'line-chart': LineChart,
  'piggy-bank': PiggyBank,
  circle: Circle,
  target: Target,
  wallet: Wallet,
  bitcoin: Bitcoin,
  'bar-chart-3': BarChart3,
  'dollar-sign': DollarSign,
  plane: Plane,
  'shopping-bag': ShoppingBag,
  smartphone: Smartphone,
  gift: Gift,
  'graduation-cap': GraduationCap,
  baby: Baby,
  dog: Dog,
  dumbbell: Dumbbell,
  music: Music,
  camera: Camera,
  book: Book,
  coffee: Coffee,
};

interface CategoryIconProps {
  icon: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const CategoryIcon = ({ icon, color, size = 'md', className }: CategoryIconProps) => {
  const Icon = iconMap[icon] || Circle;
  
  return (
    <Icon 
      className={cn(sizeClasses[size], className)} 
      style={color ? { color } : undefined} 
    />
  );
};

export default CategoryIcon;
export { iconMap };
