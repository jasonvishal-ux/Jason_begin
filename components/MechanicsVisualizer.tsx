
import React, { useEffect, useRef } from 'react';

interface MechanicsVisualizerProps {
  beamType: 'simply_supported' | 'cantilever';
  loadType: 'point' | 'udl';
  inputs: Record<string, string>;
}

const MechanicsVisualizer: React.FC<MechanicsVisualizerProps> = ({ beamType, loadType, inputs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const primaryColor = `rgb(${rootStyle.getPropertyValue('--primary')})`;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const margin = 50;
      const beamY = h / 2 + 20;
      const beamL = w - margin * 2;

      // Draw Beam
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(margin, beamY);
      ctx.lineTo(w - margin, beamY);
      ctx.stroke();

      // Draw Supports
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;

      if (beamType === 'simply_supported') {
        // Left Pin
        ctx.beginPath();
        ctx.moveTo(margin, beamY);
        ctx.lineTo(margin - 10, beamY + 15);
        ctx.lineTo(margin + 10, beamY + 15);
        ctx.closePath();
        ctx.fill();
        // Right Roller
        ctx.beginPath();
        ctx.arc(w - margin, beamY + 10, 5, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Cantilever Fix (Wall)
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(margin, beamY - 20);
        ctx.lineTo(margin, beamY + 20);
        ctx.stroke();
        for (let i = -20; i <= 20; i += 8) {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(margin, beamY + i);
          ctx.lineTo(margin - 8, beamY + i + 5);
          ctx.stroke();
        }
      }

      // Draw Loads
      ctx.strokeStyle = primaryColor;
      ctx.fillStyle = primaryColor;
      ctx.lineWidth = 2;

      if (loadType === 'point') {
        // Point Load Arrow
        const arrowX = beamType === 'simply_supported' ? w / 2 : w - margin;
        ctx.beginPath();
        ctx.moveTo(arrowX, beamY - 40);
        ctx.lineTo(arrowX, beamY - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(arrowX - 5, beamY - 12);
        ctx.lineTo(arrowX, beamY - 2);
        ctx.lineTo(arrowX + 5, beamY - 12);
        ctx.fill();
        ctx.font = '10px Inter';
        ctx.fillText('P', arrowX - 4, beamY - 45);
      } else {
        // UDL Load
        for (let x = margin; x <= w - margin; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, beamY - 25);
          ctx.lineTo(x, beamY - 5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - 3, beamY - 10);
          ctx.lineTo(x, beamY - 2);
          ctx.lineTo(x + 3, beamY - 10);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(margin, beamY - 25);
        ctx.lineTo(w - margin, beamY - 25);
        ctx.stroke();
        ctx.font = '10px Inter';
        ctx.fillText('w (UDL)', w / 2 - 20, beamY - 35);
      }

      // Deflection Preview (Exaggerated Elastic Curve)
      ctx.strokeStyle = primaryColor;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(margin, beamY);
      
      if (beamType === 'simply_supported') {
        ctx.quadraticCurveTo(w / 2, beamY + 30, w - margin, beamY);
      } else {
        ctx.bezierCurveTo(margin + 50, beamY, w - margin - 50, beamY + 40, w - margin, beamY + 40);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      ctx.setLineDash([]);
    };

    draw();
  }, [beamType, loadType, inputs]);

  return (
    <div className="relative w-full h-48 bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden mb-6 group">
      <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
        <div className="w-2 h-2 rounded-full bg-[rgb(var(--primary))] shadow-lg shadow-[rgb(var(--primary)/0.5)] animate-pulse" />
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Structural Static Solver</span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={200} 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default MechanicsVisualizer;
