
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(formulas) as Array<keyof typeof formulas>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFormula(key)}
            className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${
              activeFormula === key 
                ? 'bg-[rgb(var(--primary))] border-[rgb(var(--primary))] text-white shadow-lg shadow-[rgb(var(--primary)/0.2)]' 
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {formulas[key].icon}
            <span className="text-xs font-semibold text-center">{formulas[key].name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[rgb(var(--primary))]">{formulas[activeFormula].icon}</span>
              {formulas[activeFormula].name}
            </h2>
            <p className="text-slate-400 text-sm">{formulas[activeFormula].desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formulas[activeFormula].fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">{field.label}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs[field.id] || ''}
                    onChange={(e) => setInputs({ ...inputs, [field.id]: e.target.value })}
                    placeholder={field.placeholder}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all font-mono-calc text-sm"
                  />
                  <div className="relative">
                    <select
                      value={selectedUnits[field.id] || field.units[0]}
                      onChange={(e) => setSelectedUnits({ ...selectedUnits, [field.id]: e.target.value })}
                      className="appearance-none bg-slate-800 border border-slate-700 rounded-xl px-3 pr-8 py-3 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] cursor-pointer h-full"
                    >
                      {field.units.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleRunCalc}
            className="w-full mt-8 bg-[rgb(var(--primary))] hover:brightness-110 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[rgb(var(--primary)/0.2)] transition-all active:scale-95 duration-300"
          >
            <Calculator size={20} />
            Calculate
          </button>

          {result && (
            <div className="mt-8 p-6 bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.3)] rounded-2xl transition-all duration-500">
              <span className="text-xs uppercase font-bold text-[rgb(var(--accent))] tracking-wider transition-colors duration-500">Result (SI units)</span>
              <div className="text-3xl font-bold text-[rgb(var(--accent))] font-mono-calc mt-1 transition-colors duration-500">
                {result}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Waves size={16} className="text-[rgb(var(--primary))]" />
              Physical Visualization
            </h3>
            <FluidVisualizer 
              type={activeFormula} 
              inputs={inputs} 
              result={result} 
            />
            <div className="text-xs text-slate-500 leading-relaxed italic bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
              Note: The visualization represents physical behavior based on current parameters. Skin: <span className="text-[rgb(var(--primary))] capitalize">{document.body.getAttribute('data-theme')}</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FluidDynamicsCalc;
