
import React, { useState, useEffect } from 'react';
import { Calculator, Box, Activity, ChevronDown, Anchor } from 'lucide-react';
import MechanicsVisualizer from './MechanicsVisualizer';

interface MechanicsCalcProps {
    onNewResult: (expr: string, res: string) => void;
}

const MECHANICS_UNITS: Record<string, number> = {
  // Length (to m)
  'm': 1,
  'cm': 0.01,
  'mm': 0.001,
  'in': 0.0254,
  'ft': 0.3048,
  // Force (to N)
  'N': 1,
  'kN': 1000,
  'lbf': 4.44822,
  // UDL (to N/m)
  'N/m': 1,
  'kN/m': 1000,
  'lbf/ft': 14.5939,
  // Pressure/Modulus (to Pa)
  'Pa': 1,
  'kPa': 1000,
  'MPa': 1e6,
  'GPa': 1e9,
  'psi': 6894.76,
  // Inertia (to m⁴)
  'm⁴': 1,
  'cm⁴': 1e-8,
  'mm⁴': 1e-12,
  'in⁴': 4.162314e-7,
};

const MechanicsCalc: React.FC<MechanicsCalcProps> = ({ onNewResult }) => {
  const [beamType, setBeamType] = useState<'simply_supported' | 'cantilever'>('simply_supported');
  const [loadType, setLoadType] = useState<'point' | 'udl'>('point');
  const [inputs, setInputs] = useState<Record<string, string>>({
    L: '5', P: '1000', w: '200', E: '200', I: '0.0001'
  });
  const [units, setUnits] = useState<Record<string, string>>({
    L: 'm', P: 'N', w: 'N/m', E: 'GPa', I: 'm⁴'
  });
  const [result, setResult] = useState<Record<string, string> | null>(null);

  const calculate = () => {
    // Convert all to SI
    const L = parseFloat(inputs.L) * (MECHANICS_UNITS[units.L] || 1);
    const P = parseFloat(inputs.P) * (MECHANICS_UNITS[units.P] || 1);
    const w = parseFloat(inputs.w) * (MECHANICS_UNITS[units.w] || 1);
    const E = parseFloat(inputs.E) * (MECHANICS_UNITS[units.E] || 1);
    const I = parseFloat(inputs.I) * (MECHANICS_UNITS[units.I] || 1);

    if (isNaN(L) || L <= 0 || isNaN(E) || isNaN(I) || I <= 0) return;

    let maxMoment = 0;
    let maxShear = 0;
    let maxDeflection = 0;
    let reaction1 = 0;
    let reaction2 = 0;

    if (beamType === 'simply_supported') {
      if (loadType === 'point') {
        reaction1 = P / 2;
        reaction2 = P / 2;
        maxShear = P / 2;
        maxMoment = (P * L) / 4;
        maxDeflection = (P * Math.pow(L, 3)) / (48 * E * I);
      } else {
        reaction1 = (w * L) / 2;
        reaction2 = (w * L) / 2;
        maxShear = (w * L) / 2;
        maxMoment = (w * Math.pow(L, 2)) / 8;
        maxDeflection = (5 * w * Math.pow(L, 4)) / (384 * E * I);
      }
    } else {
      if (loadType === 'point') {
        reaction1 = P;
        maxShear = P;
        maxMoment = P * L;
        maxDeflection = (P * Math.pow(L, 3)) / (3 * E * I);
      } else {
        reaction1 = w * L;
        maxShear = w * L;
        maxMoment = (w * Math.pow(L, 2)) / 2;
        maxDeflection = (w * Math.pow(L, 4)) / (8 * E * I);
      }
    }

    const res = {
      'Reaction A': `${reaction1.toFixed(2)} N`,
      'Reaction B': reaction2 > 0 ? `${reaction2.toFixed(2)} N` : 'N/A',
      'Max Moment': `${maxMoment.toFixed(2)} Nm`,
      'Max Shear': `${maxShear.toFixed(2)} N`,
      'Max Deflection': `${(maxDeflection * 1000).toFixed(4)} mm`
    };

    setResult(res);
    onNewResult(`${beamType.replace('_', ' ')} Beam (L=${inputs.L}${units.L})`, `M_max=${maxMoment.toFixed(2)}Nm`);
  };

  const Field = ({ id, label, unitOptions }: { id: string, label: string, unitOptions: string[] }) => (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="flex gap-2">
        <input 
          type="number" 
          value={inputs[id]} 
          onChange={(e) => setInputs({...inputs, [id]: e.target.value})} 
          className="flex-1 bg-slate-950 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-[rgb(var(--primary))] outline-none transition-all font-mono-calc text-sm" 
        />
        <div className="relative">
          <select 
            value={units[id]}
            onChange={(e) => setUnits({...units, [id]: e.target.value})}
            className="appearance-none bg-slate-800 border border-white/10 rounded-xl px-3 pr-8 py-4 text-xs font-bold text-slate-300 outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] cursor-pointer h-full min-w-[70px]"
          >
            {unitOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setBeamType('simply_supported')}
          className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${beamType === 'simply_supported' ? 'bg-[rgb(var(--primary))] border-[rgb(var(--primary))] text-white shadow-xl shadow-[rgb(var(--primary)/0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
        >
          <Activity size={24} />
          <span className="font-bold text-sm">Simply Supported</span>
        </button>
        <button
          onClick={() => setBeamType('cantilever')}
          className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${beamType === 'cantilever' ? 'bg-[rgb(var(--primary))] border-[rgb(var(--primary))] text-white shadow-xl shadow-[rgb(var(--primary)/0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
        >
          <Anchor size={24} />
          <span className="font-bold text-sm">Cantilever</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Box className="text-[rgb(var(--primary))]" />
              Beam Properties
            </h3>
            <select 
              value={loadType}
              onChange={(e) => setLoadType(e.target.value as any)}
              className="bg-slate-800 text-xs font-bold text-slate-300 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
            >
              <option value="point">Point Load</option>
              <option value="udl">Uniform Load (UDL)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Field id="L" label="Beam Length (L)" unitOptions={['m', 'cm', 'mm', 'in', 'ft']} />
            
            {loadType === 'point' ? (
              <Field id="P" label="Point Load (P)" unitOptions={['N', 'kN', 'lbf']} />
            ) : (
              <Field id="w" label="Uniform Load (w)" unitOptions={['N/m', 'kN/m', 'lbf/ft']} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field id="E" label="Young's Modulus (E)" unitOptions={['GPa', 'MPa', 'Pa', 'psi']} />
              <Field id="I" label="Moment of Inertia (I)" unitOptions={['m⁴', 'cm⁴', 'mm⁴', 'in⁴']} />
            </div>
          </div>

          <button onClick={calculate} className="w-full mt-8 bg-[rgb(var(--primary))] hover:brightness-110 text-white font-bold py-5 rounded-2xl shadow-xl shadow-[rgb(var(--primary)/0.2)] transition-all active:scale-95 flex items-center justify-center gap-3">
            <Calculator size={20} />
            Solve Beam Statics
          </button>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 shadow-xl">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Structural Behavior</h4>
            <MechanicsVisualizer beamType={beamType} loadType={loadType} inputs={inputs} />
            
            {result ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                {Object.entries(result).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[rgb(var(--primary)/0.2)] transition-colors">
                    <span className="text-xs font-bold text-slate-400">{key}</span>
                    <span className="text-sm font-mono-calc text-[rgb(var(--accent))] font-bold">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center opacity-20 flex flex-col items-center">
                <Activity size={40} className="mb-4 text-[rgb(var(--primary))]" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ready for Simulation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicsCalc;
