'use client'
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';

const Wheel = forwardRef(({ segments, onSpinEnd }, ref) => {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const currentReward = useRef(null);

  const size = typeof window !== 'undefined' && window.innerWidth < 768 ? 300 : 600;

  const radius = size / 2;

  const colors = [
    '#f06595', '#ffe066', '#74c0fc', '#b197fc',
    '#63e6be', '#ffa8a8', '#ffd43b', '#d0bfff'
  ];

  useEffect(() => {
    drawWheel();
  }, [segments, angle]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const arcSize = (2 * Math.PI) / segments.length;

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-radius, -radius);

    segments.forEach((segment, i) => {
      const start = angle + i * arcSize;
      const end = start + arcSize;

      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, start, end);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(start + arcSize / 2);
      ctx.fillStyle = '#000';
      const fontSize = size / 30; 
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(segment.label, radius / 2.5, 0);
      ctx.restore();
    });

    ctx.restore();

    // 👉 Kim bên phải (3h)
    ctx.beginPath();
    ctx.moveTo(size, radius); // mũi kim
    ctx.lineTo(size - 30, radius - 15); // cạnh trên
    ctx.lineTo(size - 30, radius + 15); // cạnh dưới
    ctx.fillStyle = '#000';
    ctx.fill();
  };

  const spinToIndex = (targetIndex, rewardInfo) => {
    if (spinning) return;

    currentReward.current = rewardInfo;

    const totalSegments = segments.length;
    const arcDeg = 360 / totalSegments;
    const middleOfTarget = arcDeg * (targetIndex + 0.5);
    const stopAngleDeg = 360 * 10 + 90 - middleOfTarget;
    const finalAngleRad = (stopAngleDeg * Math.PI) / 180;
    const duration = 3000;
    const startTime = performance.now();

    setSpinning(true);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAngle(easeOut * finalAngleRad);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        onSpinEnd(currentReward.current);
      }
    };

    requestAnimationFrame(animate);
  };

  useImperativeHandle(ref, () => ({ spinToIndex }));

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-2xl border-[6px] border-pink-400"
      />
      {spinning && (
        <div className="text-2xl mt-4 font-bold text-yellow-600 animate-pulse">
          ⏳ Đang quay...
        </div>
      )}
    </div>
  );
});

export default Wheel;
