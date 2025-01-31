import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

  const createParticles = (width: number, height: number) => {
    const particleCount = Math.floor((width * height) / 15000);
    return Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 5 + 1,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 - 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 0 + 350, 
    }));
  };

  const handleResize = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles.current = createParticles(canvas.width, canvas.height);
  };

  const handlePointerMove = (e: TouchEvent | MouseEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mousePosition.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const animate = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(243, 244, 246, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.current.forEach((particle) => {
      const dx = mousePosition.current.x - particle.x;
      const dy = mousePosition.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 200;

      if (distance < maxDistance) {
        const force = (1 - distance / maxDistance) * 0.6;
        particle.speedX -= (dx / distance) * force;
        particle.speedY -= (dy / distance) * force;
      }

      particle.x += particle.speedX;
      particle.y += particle.speedY;

      particle.speedX *= 0.98;
      particle.speedY *= 0.98;

      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${particle.hue}, 70%, 50%, ${particle.opacity})`;
      ctx.fill();
    });

    particles.current.forEach((p1, i) => {
      particles.current.slice(i + 1).forEach((p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          gradient.addColorStop(0, `hsla(${p1.hue}, 70%, 50%, ${0.2 * (1 - distance / 120)})`);
          gradient.addColorStop(1, `hsla(${p2.hue}, 70%, 50%, ${0.2 * (1 - distance / 120)})`);
          ctx.strokeStyle = gradient;
          ctx.stroke();
        }
      });
    });

    animationFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        touchAction: 'none'
      }}
    />
  );
};