import React from 'react';
import {
  Sparkles,
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  Heart,
  Star,
  Crown,
  Flame,
  Utensils,
  GraduationCap,
  Car,
  Laptop,
  Gift,
  Trees,
  AlertTriangle,
  Users,
  Phone,
  DollarSign,
  MessageSquare,
  Eye,
  Lock,
  Unlock,
  FileText,
  Zap,
  Target,
  Smile,
  Compass,
  Home,
  Cross,
  Activity,
  HeartPulse,
  type LucideProps,
} from 'lucide-react';

interface IconRendererProps extends LucideProps {
  name?: string | null;
  fallback?: React.ReactNode;
}

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  sparkles: Sparkles,
  hearthandshake: HeartHandshake,
  calendar: Calendar,
  clock: Clock,
  mappin: MapPin,
  checkcircle2: CheckCircle2,
  shieldcheck: ShieldCheck,
  award: Award,
  heart: Heart,
  star: Star,
  crown: Crown,
  flame: Flame,
  utensils: Utensils,
  graduationcap: GraduationCap,
  car: Car,
  laptop: Laptop,
  gift: Gift,
  trees: Trees,
  treepine: Trees,
  alerttriangle: AlertTriangle,
  users: Users,
  phone: Phone,
  dollarsign: DollarSign,
  messagesquare: MessageSquare,
  eye: Eye,
  lock: Lock,
  unlock: Unlock,
  filetext: FileText,
  zap: Zap,
  target: Target,
  smile: Smile,
  compass: Compass,
  home: Home,
  cross: Cross,
  heartpulse: HeartPulse,
  activity: Activity,
};

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  fallback = <Sparkles className="w-4 h-4" />,
  className = 'w-4 h-4',
  ...props
}) => {
  if (!name || typeof name !== 'string') {
    return <>{fallback}</>;
  }

  // Normalize key (e.g. 'HeartHandshake' -> 'hearthandshake', 'CheckCircle2' -> 'checkcircle2')
  const cleanKey = name.trim().toLowerCase().replace(/[-_\s]/g, '');
  const IconComponent = ICON_MAP[cleanKey];

  if (IconComponent) {
    return <IconComponent className={className} {...props} />;
  }

  // If unknown icon name, return the clean fallback icon instead of spilling the raw text string!
  return <>{fallback}</>;
};
