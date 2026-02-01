
import React, { useState, useEffect, useRef } from 'react';
import * as math from 'mathjs';
import CalculatorButton from './CalculatorButton';
import { Delete, Equal } from 'lucide-react';

interface ScientificCalcProps {
    onNewResult: (expr: string, res: string) => void;
}

const ScientificCalc: React.FC<ScientificCalcProps> = ({ onNewResult }) => {
  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [display]);

  const handleInput = (val: string) => {
    setError(false);
    setDisplay(prev => prev + val);
  };

  const clear = () => {
    setDisplay('');
    setResult('');
    setError(false);
  };

  const backspace = () => {
    setDisplay(prev => prev.slice(0, -1));
  };

  const calculate = () => {
    try {
      if (!display) return;
      const res = math.evaluate(display);
      const formatted = typeof res === 'number' ? math.format(res, { precision: 12 }) : res.toString();
      setResult(formatted);
      onNewResult(display, formatted);
    } catch (e) {
      setError(true);
      setResult('ERR: SYNTAX');
    }
  };

  const buttons = [
    { label: '(', val: '(', type: 'secondary' },
    { label: ')', val: ')', type: 'secondary' },
    { label: '%', val: '%', type: 'secondary' },
    { label: 'AC', val: 'clear', type: 'danger' },
    { label: 'sin', val: 'sin(', type: 'primary' },
    { label: 'cos', val: 'cos(', type: 'primary' },
    { label: 'tan', val: 'tan(', type: 'primary' },
    { label: 'deg', val: 'deg', type: 'primary' },
    { label: 'log', val: 'log10(', type: 'primary' },
    { label: 'ln', val: 'log(', type: 'primary' },
    { label: '√', val: 'sqrt(', type: 'primary' },
    { label: '÷', val: '/', type: 'accent' },
    { label: '7', val: '7', type: 'secondary' },
    { label: '8', val: '8', type: 'secondary' },
    { label: '9', val: '9', type: 'secondary' },
    { label: '×', val: '*', type: 'accent' },
    { label: '4', val: '4', type: 'secondary' },
    { label: '5', val: '5', type: 'secondary' },
    { label: '6', val: '6', type: 'secondary' },
    { label: '-', val: '-', type: 'accent' },
    { label: '1', val: '1', type: 'secondary' },
    { label: '2', val: '2', type: 'secondary' },
    { label: '3', val: '3', type: 'secondary' },
    { label: '+', val: '+', type: 'accent' },
    { label: '0', val: '0', type: 'secondary' },
    { label: '.', val: '.', type: 'secondary' },
    { label: 'π', val: 'pi', type: 'secondary' },
    { label: '^', val: '^', type: 'accent' },
  ];

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10 shadow-[rgb(var(--primary)/0.05)] transition-all duration-500">
      <div className="mb-8 bg-slate-950/80 rounded-3xl p-8 min-h-[160px] flex flex-col justify-end items-end overflow-hidden border border-white/5 shadow-inner">
        <div 
          ref={scrollRef}
          className="w-full text-right text-slate-500 text-xl font-mono-calc whitespace-nowrap overflow-x-auto scrollbar-hide pb-2 transition-all"
        >
          {display || '0'}
        </div>
        <div className={`text-5xl font-bold font-mono-calc break-all text-right mt-3 transition-colors duration-500 ${error ? 'text-rose-500' : 'text-[rgb(var(--accent))]'}`}>
          {result || ' '}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {buttons.map((btn, idx) => (
          <CalculatorButton
            key={idx}
            label={btn.label}
            variant={btn.type as any}
            onClick={() => {
                if (btn.val === 'clear') clear();
                else handleInput(btn.val);
            }}
          />
        ))}
        <CalculatorButton
          label={<Delete size={22} />}
          variant="secondary"
          onClick={backspace}
        />
        <CalculatorButton
          label={<Equal size={28} />}
          variant="accent"
          className="col-span-3 transition-colors duration-500"
          onClick={calculate}
        />
      </div>
    </div>
  );
};

export default ScientificCalc;
