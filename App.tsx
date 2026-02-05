
import React, { useState, useEffect, useRef } from 'react';
import ScientificCalc from './components/ScientificCalc';
import FluidDynamicsCalc from './components/FluidDynamicsCalc';
import MechanicsCalc from './components/MechanicsCalc';
import AIAssistant from './components/AIAssistant';
import { TabType, HistoryItem } from './types';
import { 
  Calculator, 
  Droplets, 
  Bot, 
  History as HistoryIcon, 
  Info,
  ChevronRight,
  CalculatorIcon,
  Palette,
  X,
  Box
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('scientific');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSkinPicker, setShowSkinPicker] = useState(false);
  const [theme, setTheme] = useState('indigo');
  const [customColor, setCustomColor] = useState('#6366f1');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    document.documentElement.style.setProperty('--primary', hexToRgb(color));
    setTheme('custom');
  };

  const addToHistory = (expression: string, result: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      type: activeTab,
      expression,
      result,
      timestamp: new Date()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const navItems = [
    { id: 'scientific', label: 'Scientific', icon: <Calculator size={20} /> },
    { id: 'fluid', label: 'Fluid Dynamics', icon: <Droplets size={20} /> },
    { id: 'mechanics', label: 'Mechanics', icon: <Box size={20} /> },
    { id: 'ai', label: 'AI Assistant', icon: <Bot size={20} /> },
  ];

  const themes = [
    { id: 'indigo', color: 'bg-indigo-500', label: 'Indigo' },
    { id: 'gold', color: 'bg-amber-500', label: 'Amber' },
    { id: 'ruby', color: 'bg-rose-500', label: 'Ruby' },
    { id: 'cyan', color: 'bg-cyan-500', label: 'Cyan' },
    { id: 'emerald', color: 'bg-emerald-500', label: 'Emerald' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative transition-colors duration-500">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[rgb(var(--primary)/0.1)] rounded-full blur-[120px] animate-float transition-colors duration-700"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[rgb(var(--primary)/0.05)] rounded-full blur-[120px] animate-float transition-colors duration-700" style={{ animationDelay: '2s' }}></div>
      </div>

      <nav className="w-full md:w-24 lg:w-72 bg-slate-950/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 z-50">
        <div className="flex items-center gap-4 mb-10 px-2 md:justify-center lg:justify-start">
          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary)/0.6)] rounded-2xl flex items-center justify-center shadow-xl shadow-[rgb(var(--primary)/0.2)] group cursor-pointer transition-all hover:scale-110">
            <CalculatorIcon className="text-white group-hover:rotate-12 transition-transform" size={26} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-white tracking-tight">PhysiCalc <span className="text-[rgb(var(--primary))] transition-colors duration-500">Pro</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scientific OS</p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-3 mb-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex-1 md:flex-none flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                activeTab === item.id 
                  ? 'bg-[rgb(var(--primary))] text-white shadow-xl shadow-[rgb(var(--primary)/0.2)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <span className="relative z-10">{item.icon}</span>
              <span className="text-sm font-semibold hidden lg:block relative z-10">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 hidden md:block">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                showHistory ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <HistoryIcon size={20} />
            <span className="text-sm font-semibold hidden lg:block">History Log</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto relative pb-20 md:pb-0 z-10">
        <header className="sticky top-0 bg-slate-950/40 backdrop-blur-md z-40 border-b border-white/5 p-6 md:p-8">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
               <div className="w-1 h-8 bg-[rgb(var(--primary))] rounded-full transition-colors duration-500"></div>
               <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {navItems.find(i => i.id === activeTab)?.label}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium tracking-wide">ACTIVE_NODE_SESSION</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4 relative">
                <button 
                  onClick={() => setShowSkinPicker(!showSkinPicker)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 border border-white/5 transition-all shadow-lg active:scale-95"
                >
                    <Palette size={16} className="text-[rgb(var(--primary))] transition-colors duration-500" />
                    <span className="hidden sm:inline">SKINS</span>
                </button>

                {showSkinPicker && (
                  <div className="absolute top-14 right-0 w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Interface Skins</h4>
                      <button onClick={() => setShowSkinPicker(false)} className="text-slate-500 hover:text-white"><X size={14}/></button>
                    </div>
                    <div className="grid grid-cols-5 gap-3 mb-6">
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTheme(t.id);
                            document.documentElement.style.removeProperty('--primary');
                          }}
                          className={`w-9 h-9 rounded-full transition-all border-2 ${t.color} ${theme === t.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          title={t.label}
                        />
                      ))}
                    </div>
                    <div className="pt-5 border-t border-white/5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Custom Color</label>
                      <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
                        <input 
                          type="color" 
                          value={customColor}
                          onChange={(e) => handleCustomColorChange(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                        />
                        <span className="text-xs font-mono text-slate-300 uppercase">{customColor}</span>
                        {theme === 'custom' && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-[rgb(var(--primary))] animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 lg:hidden" onClick={() => setShowHistory(true)}>
                    <HistoryIcon size={22} />
                </button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-[calc(100vh-100px)]">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'scientific' && <ScientificCalc onNewResult={addToHistory} />}
            {activeTab === 'fluid' && <FluidDynamicsCalc onNewResult={addToHistory} />}
            {activeTab === 'mechanics' && <MechanicsCalc onNewResult={addToHistory} />}
            {activeTab === 'ai' && <AIAssistant />}
          </div>
        </div>
      </main>

      {showHistory && (
        <div className="fixed inset-0 md:relative md:inset-auto z-[100] md:z-auto w-full md:w-80 lg:w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <HistoryIcon size={20} className="text-[rgb(var(--primary))] transition-colors duration-500" />
              History
            </h3>
            <button 
              onClick={() => setShowHistory(false)}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-20 opacity-20 flex flex-col items-center">
                <Info size={48} className="mb-4" />
                <p className="font-bold tracking-widest text-sm">NO DATA DETECTED</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-[rgb(var(--primary)/0.3)] transition-all group cursor-default">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 rounded bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-[9px] font-black uppercase tracking-widest transition-colors duration-500">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono-calc mb-2 break-words leading-relaxed">
                    {item.expression}
                  </div>
                  <div className="text-xl font-bold text-[rgb(var(--accent))] font-mono-calc break-words transition-colors duration-500">
                    = {item.result}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
