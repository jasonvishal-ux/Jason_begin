
import React, { useState, useEffect } from 'react';
import { Calculator, Droplets, Waves, Wind, ChevronDown } from 'lucide-react';
import FluidVisualizer from './FluidVisualizer';

interface FluidDynamicsCalcProps {
    onNewResult: (expr: string, res: string) => void;
}

const UNIT_CONVERSIONS: Record<string, number> = {
  // Density (to kg/m³)
  'kg/m³': 1,
  'g/cm³': 1000,
  'lb/ft³': 16.0185,
  // Velocity (to m/s)
  'm/s': 1,
  'km/h': 0.277778,
  'ft/s': 0.3048,
  'mph': 0.44704,
  // Length (to m)
  'm': 1,
  'cm': 0.01,
  'mm': 0.001,
  'in': 0.0254,
  'ft': 0.3048,
  // Viscosity (to Pa·s)
  'Pa·s': 1,
  'cP': 0.001,
  'lb/(ft·s)': 1.48816,
  // Pressure (to Pa)
  'Pa': 1,
  'kPa': 1000,
  'psi': 6894.76,
  'bar': 100000,
  'atm': 101325,
  // Area (to m²)
  'm²': 1,
  'cm²': 0.0001,
  'in²': 0.00064516,
  'ft²': 0.092903,
};

const FluidDynamicsCalc: React.FC<FluidDynamicsCalcProps> = ({ onNewResult }) => {
  const [activeFormula, setActiveFormula] = useState<'reynolds' | 'bernoulli' | 'continuity' | 'pressure'>('reynolds');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const formulas = {
    reynolds: {
      name: 'Reynolds Number',
      icon: <Droplets className="w-5 h-5" />,
      desc: 'Predict flow patterns (Laminar vs Turbulent)',
      fields: [
        { id: 'rho', label: 'Density (ρ)', units: ['kg/m³', 'g/cm³', 'lb/ft³'], placeholder: '1000' },
        { id: 'v', label: 'Velocity (v)', units: ['m/s', 'km/h', 'ft/s', 'mph'], placeholder: '2.5' },
        { id: 'L', label: 'Length (L)', units: ['m', 'cm', 'mm', 'in', 'ft'], placeholder: '0.05' },
        { id: 'mu', label: 'Dynamic Viscosity (μ)', units: ['Pa·s', 'cP', 'lb/(ft·s)'], placeholder: '0.001' },
      ],
      calculate: (vals: Record<string, number>) => {
        const { rho, v, L, mu } = vals;
        if (!rho || !v || !L || !mu) return null;
        const re = (rho * v * L) / mu;
        let regime = 'Unknown';
        if (re < 2300) regime = 'Laminar';
        else if (re < 4000) regime = 'Transitional';
        else regime = 'Turbulent';
        return { value: re.toFixed(2), unit: '', extra: `Regime: ${regime}` };
      }
    },
    bernoulli: {
      name: 'Bernoulli Pressure Change',
      icon: <Waves className="w-5 h-5" />,
      desc: 'Calculate pressure drop between two points',
      fields: [
        { id: 'p1', label: 'Initial Pressure (P1)', units: ['Pa', 'kPa', 'psi', 'bar', 'atm'], placeholder: '101325' },
        { id: 'v1', label: 'Initial Velocity (v1)', units: ['m/s', 'km/h', 'ft/s', 'mph'], placeholder: '1.0' },
        { id: 'v2', label: 'Final Velocity (v2)', units: ['m/s', 'km/h', 'ft/s', 'mph'], placeholder: '2.0' },
        { id: 'rho', label: 'Density (ρ)', units: ['kg/m³', 'g/cm³', 'lb/ft³'], placeholder: '1000' },
      ],
      calculate: (vals: Record<string, number>) => {
        const { p1, v1, v2, rho } = vals;
        if (isNaN(p1) || isNaN(v1) || isNaN(v2) || isNaN(rho)) return null;
        const p2 = p1 + 0.5 * rho * (Math.pow(v1, 2) - Math.pow(v2, 2));
        return { value: p2.toFixed(2), unit: 'Pa', extra: '' };
      }
    },
    continuity: {
        name: 'Continuity Equation',
        icon: <Wind className="w-5 h-5" />,
        desc: 'Calculate exit velocity (A1*v1 = A2*v2)',
        fields: [
            { id: 'a1', label: 'Area 1 (A1)', units: ['m²', 'cm²', 'in²', 'ft²'], placeholder: '0.1' },
            { id: 'v1', label: 'Velocity 1 (v1)', units: ['m/s', 'km/h', 'ft/s', 'mph'], placeholder: '2' },
            { id: 'a2', label: 'Area 2 (A2)', units: ['m²', 'cm²', 'in²', 'ft²'], placeholder: '0.05' },
        ],
        calculate: (vals: Record<string, number>) => {
            const { a1, v1, a2 } = vals;
            if (!a1 || !v1 || !a2) return null;
            const v2 = (a1 * v1) / a2;
            return { value: v2.toFixed(3), unit: 'm/s', extra: '' };
        }
    },
    pressure: {
        name: 'Hydrostatic Pressure',
        icon: <Droplets className="w-5 h-5" />,
        desc: 'Pressure at depth (P = ρgh)',
        fields: [
            { id: 'rho', label: 'Density (ρ)', units: ['kg/m³', 'g/cm³', 'lb/ft³'], placeholder: '1000' },
            { id: 'h', label: 'Depth (h)', units: ['m', 'cm', 'mm', 'in', 'ft'], placeholder: '10' },
        ],
        calculate: (vals: Record<string, number>) => {
            const { rho, h } = vals;
            if (!rho || !h) return null;
            const p = rho * 9.80665 * h;
            return { value: p.toFixed(2), unit: 'Pa', extra: '' };
        }
    }
  };

  useEffect(() => {
    const defaultUnits: Record<string, string> = {};
    formulas[activeFormula].fields.forEach(field => {
      defaultUnits[field.id] = field.units[0];
    });
    setSelectedUnits(defaultUnits);
    setInputs({});
    setResult(null);
  }, [activeFormula]);

  const handleRunCalc = () => {
    const formula = formulas[activeFormula];
    try {
      const convertedInputs: Record<string, number> = {};
      for (const field of formula.fields) {
        const val = parseFloat(inputs[field.id]);
        if (isNaN(val)) throw new Error(`Invalid value for ${field.label}`);
        const unit = selectedUnits[field.id];
        const multiplier = UNIT_CONVERSIONS[unit] || 1;
        convertedInputs[field.id] = val * multiplier;
      }

      const res = formula.calculate(convertedInputs);
      if (res) {
        const output = `${res.value} ${res.unit || ''} ${res.extra || ''}`;
        setResult(output);
        const logDetails = formula.fields.map(f => `${f.label}: ${inputs[f.id]} ${selectedUnits[f.id]}`).join(', ');
        onNewResult(`${formula.name} (${logDetails})`, output);
      }
    } catch (e: any) {
      setResult(e.message || 'Check inputs');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(formulas) as Array<keyof typeof formulas>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFormula(key)}
            className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all border ${
              activeFormula === key 
                ? 'bg-[rgb(var(--primary))] border-[rgb(var(--primary))] text-white shadow-xl shadow-[rgb(var(--primary)/0.2)] scale-105' 
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/80'
            }`}
          >
            {formulas[key].icon}
            <span className="text-sm font-bold text-center">{formulas[key].name}</span>
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-[rgb(var(--primary))]">{formulas[activeFormula].icon}</span>
                {formulas[activeFormula].name}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{formulas[activeFormula].desc}</p>
            </div>

            <div className="space-y-6">
              {formulas[activeFormula].fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">{field.label}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={inputs[field.id] || ''}
                      onChange={(e) => setInputs({ ...inputs, [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      className="flex-1 bg-slate-950/80 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all font-mono-calc text-sm"
                    />
                    <div className="relative">
                      <select
                        value={selectedUnits[field.id] || field.units[0]}
                        onChange={(e) => setSelectedUnits({ ...selectedUnits, [field.id]: e.target.value })}
                        className="appearance-none bg-slate-800 border border-white/5 rounded-2xl px-4 pr-10 py-4 text-xs font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] cursor-pointer h-full min-w-[90px]"
                      >
                        {field.units.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRunCalc}
              className="w-full bg-[rgb(var(--primary))] hover:brightness-110 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[rgb(var(--primary)/0.2)] transition-all active:scale-[0.98] duration-300"
            >
              <Calculator size={20} />
              Run Solver
            </button>

            {result && (
              <div className="p-8 bg-[rgb(var(--accent)/0.05)] border border-[rgb(var(--accent)/0.2)] rounded-3xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
                <span className="text-[10px] uppercase font-black text-[rgb(var(--accent))] tracking-[0.2em] transition-colors duration-500">Calculated Value (SI)</span>
                <div className="text-4xl font-bold text-[rgb(var(--accent))] font-mono-calc mt-2 transition-colors duration-500">
                  {result}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-950/40 rounded-[2.5rem] p-8 border border-white/5 h-full min-h-[500px] flex flex-col">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Waves size={18} className="text-[rgb(var(--primary))]" />
                Dynamic Fluid Simulation
              </h3>
              <div className="flex-1 flex flex-col justify-center">
                <FluidVisualizer 
                  type={activeFormula} 
                  inputs={inputs} 
                  result={result} 
                />
              </div>
              <div className="mt-8 text-[11px] text-slate-500 leading-relaxed italic bg-slate-800/20 p-5 rounded-2xl border border-white/5 text-center">
                "The simulation updates in real-time as physical constraints are adjusted. Skin synchronization active."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FluidDynamicsCalc;
