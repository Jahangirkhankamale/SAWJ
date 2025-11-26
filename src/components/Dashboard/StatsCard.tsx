import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  onClick,
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      text: 'text-blue-100',
    },
    green: {
      bg: 'from-green-500 to-green-600',
      icon: 'bg-green-500/20 text-green-600 dark:text-green-400',
      text: 'text-green-100',
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      icon: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      text: 'text-purple-100',
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      icon: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
      text: 'text-orange-100',
    },
    red: {
      bg: 'from-red-500 to-red-600',
      icon: 'bg-red-500/20 text-red-600 dark:text-red-400',
      text: 'text-red-100',
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${colors.bg} p-6 text-white shadow-lg transition-all duration-300 hover:shadow-2xl ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute -right-4 -top-4 opacity-20">
        <div className="h-24 w-24 rounded-full bg-white/20"></div>
      </div>
      <div className="absolute -right-8 -top-8 opacity-10">
        <div className="h-32 w-32 rounded-full bg-white/20"></div>
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text} mb-2`}>{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-100' : 'text-red-100'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs ${colors.text} mt-1`}>{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs ${colors.text} mt-1`}>{trend.label}</p>
          )}
        </div>
        
        <div className="ml-4">
          <div className="rounded-xl bg-white/20 p-3">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;