'use client'
import { useEffect, useRef } from 'react';

export default function Snowfall() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const maxFlakes = 100;
    const flakes = [];

    for (let i = 0; i < maxFlakes; i++) {
      flakes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 4 + 1,
        d: Math.random() * maxFlakes,
      });
    }

    const drawFlakes = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'white';
      ctx.beginPath();
      for (let i = 0; i < maxFlakes; i++) {
        const f = flakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      moveFlakes();
    };

    let angle = 0;
    const moveFlakes = () => {
      angle += 0.01;
      for (let i = 0; i < maxFlakes; i++) {
        const f = flakes[i];
        f.y += Math.cos(angle + f.d) + 1 + f.r / 2;
        f.x += Math.sin(angle) * 2;
        if (f.y > H) {
          flakes[i] = { x: Math.random() * W, y: 0, r: f.r, d: f.d };
        }
      }
    };

    const animate = () => {
      drawFlakes();
      requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('resize', () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none z-10"
    ></canvas>
  );
}
