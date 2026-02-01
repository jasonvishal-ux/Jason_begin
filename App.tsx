
import React, { useState } from 'react';
import ScientificCalc from './components/ScientificCalc';
import FluidDynamicsCalc from './components/FluidDynamicsCalc';
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
  Layers
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('scientific');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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
    { id: 'ai', label: 'AI Assistant', icon: <Bot size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="w-full md:w-24 lg:w-72 bg-slate-950/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 z-50">
        <div className="flex items-center gap-4 mb-12 px-2 md:justify-center lg:justify-start">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group cursor-pointer transition-transform hover:scale-110">
            <CalculatorIcon className="text-white group-hover:rotate-12 transition-transform" size={26} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-white tracking-tight">PhysiCalc <span className="text-indigo-400">Pro</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Version 2.0 Gold</p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-3 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex-1 md:flex-none flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent opacity-50"></div>
              )}
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pb-20 md:pb-0 z-10">
        <header className="sticky top-0 bg-slate-950/40 backdrop-blur-md z-40 border-b border-white/5 p-6 md:p-8">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
               <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
               <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {navItems.find(i => i.id === activeTab)?.label}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium tracking-wide">SYSTEM_READY // 0xAF45B</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button className="hidden lg:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 border border-white/5 transition-all">
                    <Layers size={14} />
                    WORKSPACE 01
                </button>
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
            {activeTab === 'ai' && <AIAssistant />}
          </div>
        </div>
      </main>

      {/* Side History Panel */}
      {showHistory && (
        <div className="fixed inset-0 md:relative md:inset-auto z-[100] md:z-auto w-full md:w-80 lg:w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <HistoryIcon size={20} className="text-indigo-400" />
              Calculation History
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
                <div key={item.id} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-indigo-500/30 transition-all group cursor-default">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono-calc mb-2 break-words leading-relaxed">
                    {item.expression}
                  </div>
                  <div className="text-xl font-bold text-emerald-400 font-mono-calc break-words">
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
