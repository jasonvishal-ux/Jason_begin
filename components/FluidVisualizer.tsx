
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  type: 'reynolds' | 'bernoulli' | 'continuity' | 'pressure';
  inputs: Record<string, string>;
  result: string | null;
}

const FluidVisualizer: React.FC<VisualizerProps> = ({ type, inputs, result }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const particleCount = 60;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 1,
          offset: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.5 + 0.3
        });
      }
    };

    initParticles();

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const padding = 20;

      // Get computed primary color for the skin
      const rootStyle = getComputedStyle(document.documentElement);
      const primaryColor = `rgb(${rootStyle.getPropertyValue('--primary')})`;
      const accentColor = `rgb(${rootStyle.getPropertyValue('--accent')})`;

      if (type === 'reynolds') {
        const pipeH = 70;
        const pipeY = h / 2 - pipeH / 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, pipeY, w - padding * 2, pipeH);

        const reStr = result?.split(' ')[0] || '0';
        const re = parseFloat(reStr);
        const turbulence = Math.min(re / 10000, 1) * 20;
        const speed = Math.max(0.5, Math.min(parseFloat(inputs.v || '1'), 10)) * 2;

        particles.forEach(p => {
          p.x += speed;
          if (p.x > w - padding - 5) {
             p.x = padding + 5;
             p.y = pipeY + Math.random() * pipeH;
          }
          const jitter = (Math.random() - 0.5) * turbulence;
          const baseY = p.y;
          const finalY = Math.max(pipeY + 2, Math.min(pipeY + pipeH - 2, baseY + jitter));
          
          ctx.fillStyle = re > 4000 ? '#fb7185' : (re > 2300 ? '#fbbf24' : accentColor);
          ctx.beginPath();
          ctx.arc(p.x, finalY, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } 
      else if (type === 'continuity') {
        const a1 = Math.max(10, Math.sqrt(parseFloat(inputs.a1 || '1')) * 40);
        const a2 = Math.max(10, Math.sqrt(parseFloat(inputs.a2 || '1')) * 40);
        const v1 = Math.max(0.2, parseFloat(inputs.v1 || '1'));
        const v2 = (parseFloat(inputs.a1 || '1') * v1) / parseFloat(inputs.a2 || '1');

        ctx.beginPath();
        ctx.moveTo(0, h/2 - a1);
        ctx.lineTo(w/2, h/2 - a1);
        ctx.lineTo(w, h/2 - a2);
        ctx.lineTo(w, h/2 + a2);
        ctx.lineTo(w/2, h/2 + a1);
        ctx.lineTo(0, h/2 + a1);
        ctx.strokeStyle = `rgba(${rootStyle.getPropertyValue('--primary')}, 0.3)`;
        ctx.stroke();

        particles.forEach(p => {
          const isLeft = p.x < w/2;
          const currentSpeed = isLeft ? v1 : v2;
          p.x += Math.min(currentSpeed * 3, 15);
          if (p.x > w) p.x = 0;
          const xProgress = Math.max(0, (p.x - w/2) / (w/2));
          const currentHalfWidth = isLeft ? a1 : a1 + (a2 - a1) * xProgress;
          if (p.ratio === undefined) p.ratio = (Math.random() - 0.5) * 1.8;
          const yPos = h/2 + (p.ratio * currentHalfWidth);
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, yPos, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });
      }
      else if (type === 'pressure') {
        const depth = Math.min(parseFloat(inputs.h || '10'), 50);
        const tankW = w / 2;
        const tankX = w / 4;
        const grad = ctx.createLinearGradient(0, padding, 0, h - padding);
        grad.addColorStop(0, 'rgba(30, 41, 59, 0.5)');
        grad.addColorStop(1, `rgba(${rootStyle.getPropertyValue('--primary')}, 0.2)`);
        ctx.fillStyle = grad;
        ctx.fillRect(tankX, padding, tankW, h - padding * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(tankX, padding, tankW, h - padding * 2);
        const markerY = padding + Math.min(depth * 3, h - padding * 3);
        ctx.strokeStyle = '#f43f5e';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(tankX - 10, markerY);
        ctx.lineTo(tankX + tankW + 10, markerY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 9px Inter';
        ctx.fillText(`${depth}m`, tankX + tankW + 15, markerY + 3);
        particles.forEach(p => {
          p.y -= 0.8;
          if (p.y < padding + 2) p.y = h - padding - 5;
          if (p.x < tankX + 5 || p.x > tankX + tankW - 5) p.x = tankX + 5 + Math.random() * (tankW - 10);
          ctx.strokeStyle = `rgba(255,255,255,${p.alpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
        });
      }
      else if (type === 'bernoulli') {
        const pipeH = 60;
        const pipeY = h / 2 - pipeH / 2;
        const v1 = parseFloat(inputs.v1 || '1');
        const v2 = parseFloat(inputs.v2 || '2');
        const grad = ctx.createLinearGradient(padding, 0, w - padding, 0);
        const color1 = v1 > v2 ? 'rgba(244, 63, 94, 0.15)' : `rgba(${rootStyle.getPropertyValue('--primary')}, 0.15)`;
        const color2 = v1 > v2 ? `rgba(${rootStyle.getPropertyValue('--primary')}, 0.15)` : 'rgba(244, 63, 94, 0.15)';
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(padding, pipeY, w - padding * 2, pipeH);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(padding, pipeY, w - padding * 2, pipeH);
        particles.forEach(p => {
          const speed = p.x < w / 2 ? Math.max(v1, 0.5) : Math.max(v2, 0.5);
          p.x += speed * 2;
          if (p.x > w - padding - 5) {
            p.x = padding + 5;
            p.y = pipeY + Math.random() * pipeH;
          }
          const finalY = Math.max(pipeY + 2, Math.min(pipeY + pipeH - 2, p.y));
          ctx.fillStyle = '#fff';
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, finalY, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [type, inputs, result]);

  return (
    <div className="relative w-full h-56 bg-slate-950/40 rounded-[2rem] border border-white/10 overflow-hidden mb-6 group transition-all hover:border-white/20">
      <div className="absolute top-4 left-6 flex items-center gap-3 z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--primary))] shadow-lg shadow-[rgb(var(--primary)/0.5)] animate-pulse transition-colors duration-500" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PHYS_ENGINE :: SKIN_SYNC</span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={700} 
        height={220} 
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
};

export default FluidVisualizer;
