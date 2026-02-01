
import React from 'react';

interface CalculatorButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  className?: string;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'secondary',
  className = ''
}) => {
  const baseStyles = "h-14 md:h-16 flex items-center justify-center text-lg font-medium transition-all duration-150 rounded-xl active:scale-95 select-none";
  
  const variants = {
    primary: "bg-slate-700 hover:bg-slate-600 text-white shadow-lg",
    secondary: "bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 border border-slate-700/50",
    accent: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 shadow-lg",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20 shadow-lg",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {label}
    </button>
  );
};

export default CalculatorButton;
