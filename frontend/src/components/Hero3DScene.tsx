import { useEffect, useRef } from 'react';

interface Hero3DSceneProps {
  currentStage: 'PING' | '200 OK' | 'OPERATIONAL';
  mousePos: { x: number; y: number };
}

export default function Hero3DScene({ currentStage, mousePos }: Hero3DSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes in 3D orbit
    const satellites = [
      { radius: 120, speed: 0.015, angle: 0, label: 'iad-1 (US)', size: 3.5 },
      { radius: 165, speed: -0.011, angle: 1.8, label: 'fra-1 (EU)', size: 3 },
      { radius: 210, speed: 0.008, angle: 3.4, label: 'sin-1 (AP)', size: 3.5 },
      { radius: 255, speed: -0.006, angle: 5.1, label: 'sfo-1 (US)', size: 2.8 },
    ];

    // Ambient floating technical particles
    const particles = Array.from({ length: 24 }).map(() => ({
      x: (Math.random() - 0.5) * 450,
      y: (Math.random() - 0.5) * 350,
      z: Math.random() * 200 + 50,
      speed: 0.2 + Math.random() * 0.4,
      opacity: 0.15 + Math.random() * 0.4,
    }));

    let pulseWave = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2 + mousePos.x * 12;
      const centerY = height / 2 + mousePos.y * 12;

      // 1. Draw subtle background radial glow
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        280
      );
      radialGlow.addColorStop(0, 'rgba(18, 184, 166, 0.12)');
      radialGlow.addColorStop(0.5, 'rgba(18, 184, 166, 0.04)');
      radialGlow.addColorStop(1, 'rgba(247, 248, 250, 0)');
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 280, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw 3D-angled orbital rings (ellipses)
      const tilt = 0.42; // perspective compression for 3D tilt
      const rings = [100, 150, 205, 260];

      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, r, r * tilt, 0, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? 'rgba(18, 184, 166, 0.28)' : 'rgba(11, 18, 32, 0.07)';
        ctx.lineWidth = 1;
        ctx.setLineDash(idx % 2 === 0 ? [3, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 3. Draw travelling pulse ring
      pulseWave = (pulseWave + 0.015) % 1;
      const waveRadius = 40 + pulseWave * 210;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, waveRadius, waveRadius * tilt, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(18, 184, 166, ${0.4 * (1 - pulseWave)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Update and draw satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        const x = centerX + Math.cos(sat.angle) * sat.radius;
        const y = centerY + Math.sin(sat.angle) * sat.radius * tilt;

        // Connecting telemetry line to center core
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(18, 184, 166, 0.12)';
        ctx.lineWidth = 0.75;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Satellite node outer glow
        ctx.beginPath();
        ctx.arc(x, y, sat.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(18, 184, 166, 0.18)';
        ctx.fill();

        // Satellite node dot
        ctx.beginPath();
        ctx.arc(x, y, sat.size, 0, Math.PI * 2);
        ctx.fillStyle = '#12B8A6';
        ctx.fill();

        // Node label
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(102, 112, 133, 0.75)';
        ctx.fillText(sat.label, x + 6, y - 4);
      });

      // 5. Draw particles
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < -200) p.y = 200;
        const px = centerX + p.x;
        const py = centerY + p.y * tilt;

        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(18, 184, 166, ${p.opacity * 0.6})`;
        ctx.fill();
      });

      // 6. Draw central monitoring core
      // Outer radar ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(18, 184, 166, 0.08)';
      ctx.strokeStyle = 'rgba(18, 184, 166, 0.35)';
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();

      // Center glowing beacon
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#12B8A6';
      ctx.shadowColor = '#12B8A6';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      // Center white dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Telemetry badge for current signal state
      ctx.save();
      const badgeY = centerY + 36;
      ctx.font = '600 10px "JetBrains Mono", monospace';
      const text = `SIGNAL: ${currentStage}`;
      const textMetrics = ctx.measureText(text);
      const bgW = textMetrics.width + 16;

      ctx.fillStyle = 'rgba(11, 18, 32, 0.85)';
      ctx.beginPath();
      ctx.roundRect(centerX - bgW / 2, badgeY - 9, bgW, 18, 9);
      ctx.fill();

      ctx.strokeStyle = 'rgba(18, 184, 166, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#12B8A6';
      ctx.textAlign = 'center';
      ctx.fillText(text, centerX, badgeY + 3.5);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentStage, mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
