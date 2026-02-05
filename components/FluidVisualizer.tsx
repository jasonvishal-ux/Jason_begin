
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
    const particleCount = 100; // Increased for larger canvas

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          offset: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.6 + 0.2
        });
      }
    };

    initParticles();

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const padding = 40;

      const rootStyle = getComputedStyle(document.documentElement);
      const primaryColor = `rgb(${rootStyle.getPropertyValue('--primary')})`;
      const accentColor = `rgb(${rootStyle.getPropertyValue('--accent')})`;

      if (type === 'reynolds') {
        const pipeH = 120;
        const pipeY = h / 2 - pipeH / 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, pipeY, w - padding * 2, pipeH);

        const reStr = result?.split(' ')[0] || '0';
        const re = parseFloat(reStr);
        const turbulence = Math.min(re / 8000, 1) * 35;
        const speed = Math.max(0.3, Math.min(parseFloat(inputs.v || '1'), 15)) * 2.5;

        particles.forEach(p => {
          p.x += speed;
          if (p.x > w - padding - 5) {
             p.x = padding + 5;
             p.y = pipeY + Math.random() * pipeH;
          }
          const jitter = (Math.random() - 0.5) * turbulence;
          const baseY = p.y;
          const finalY = Math.max(pipeY + 4, Math.min(pipeY + pipeH - 4, baseY + jitter));
          
          ctx.fillStyle = re > 4000 ? '#fb7185' : (re > 2300 ? '#fbbf24' : accentColor);
          ctx.beginPath();
          ctx.arc(p.x, finalY, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } 
      else if (type === 'continuity') {
        const a1 = Math.max(20, Math.sqrt(parseFloat(inputs.a1 || '1')) * 80);
        const a2 = Math.max(20, Math.sqrt(parseFloat(inputs.a2 || '1')) * 80);
        const v1 = Math.max(0.1, parseFloat(inputs.v1 || '1'));
        const a1_raw = parseFloat(inputs.a1 || '1');
        const a2_raw = parseFloat(inputs.a2 || '1');
        const v2 = (a1_raw * v1) / (a2_raw || 1);

        ctx.beginPath();
        ctx.moveTo(0, h/2 - a1);
        ctx.lineTo(w/2, h/2 - a1);
        ctx.lineTo(w, h/2 - a2);
        ctx.lineTo(w, h/2 + a2);
        ctx.lineTo(w/2, h/2 + a1);
        ctx.lineTo(0, h/2 + a1);
        ctx.strokeStyle = `rgba(${rootStyle.getPropertyValue('--primary')}, 0.2)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        particles.forEach(p => {
          const isLeft = p.x < w/2;
          const currentSpeed = isLeft ? v1 : v2;
          p.x += Math.min(currentSpeed * 4, 25);
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
        const depth = Math.min(parseFloat(inputs.h || '10'), 100);
        const tankW = w / 1.5;
        const tankX = (w - tankW) / 2;
        
        const grad = ctx.createLinearGradient(0, padding, 0, h - padding);
        grad.addColorStop(0, 'rgba(30, 41, 59, 0.3)');
        grad.addColorStop(1, `rgba(${rootStyle.getPropertyValue('--primary')}, 0.15)`);
        ctx.fillStyle = grad;
        ctx.fillRect(tankX, padding, tankW, h - padding * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(tankX, padding, tankW, h - padding * 2);
        
        const markerY = padding + Math.min((depth / 100) * (h - padding * 2), h - padding * 2);
        ctx.strokeStyle = '#f43f5e';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(tankX - 20, markerY);
        ctx.lineTo(tankX + tankW + 20, markerY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 11px Inter';
        ctx.fillText(`Depth: ${depth}m`, tankX + tankW + 25, markerY + 4);
        
        particles.forEach(p => {
          p.y -= 1.2;
          if (p.y < padding + 4) p.y = h - padding - 8;
          if (p.x < tankX + 10 || p.x > tankX + tankW - 10) p.x = tankX + 10 + Math.random() * (tankW - 20);
          ctx.strokeStyle = `rgba(255,255,255,${p.alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
        });
      }
      else if (type === 'bernoulli') {
        const pipeH = 100;
        const pipeY = h / 2 - pipeH / 2;
        const v1 = parseFloat(inputs.v1 || '1');
        const v2 = parseFloat(inputs.v2 || '2');
        const grad = ctx.createLinearGradient(padding, 0, w - padding, 0);
        const color1 = v1 > v2 ? 'rgba(244, 63, 94, 0.1)' : `rgba(${rootStyle.getPropertyValue('--primary')}, 0.1)`;
        const color2 = v1 > v2 ? `rgba(${rootStyle.getPropertyValue('--primary')}, 0.1)` : 'rgba(244, 63, 94, 0.1)';
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(padding, pipeY, w - padding * 2, pipeH);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(padding, pipeY, w - padding * 2, pipeH);
        particles.forEach(p => {
          const speed = p.x < w / 2 ? Math.max(v1, 0.4) : Math.max(v2, 0.4);
          p.x += speed * 3;
          if (p.x > w - padding - 5) {
            p.x = padding + 5;
            p.y = pipeY + Math.random() * pipeH;
          }
          const finalY = Math.max(pipeY + 4, Math.min(pipeY + pipeH - 4, p.y));
          ctx.fillStyle = '#fff';
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, finalY, 1.8, 0, Math.PI * 2);
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
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={600} 
        className="w-full h-full object-contain rounded-[2rem] shadow-inner"
      />
    </div>
  );
};

export default FluidVisualizer;
