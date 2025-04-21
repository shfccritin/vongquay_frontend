// components/Wheel.jsx
'use client';
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

/**
 * Component Vòng Quay:
 * - Hiển thị trên nền '/img/wheel.svg'
 * - Canvas quay nằm giữa ngang, lệch lên chút theo chiều dọc
 * - Kim chỉ (pointer) nằm trên cùng, ở chính giữa ngang
 * - Nút quay dùng ảnh 'spin-button.svg', kích thước 125x125, nằm chính giữa
 *
 * Props:
 * - segments: mảng đối tượng { label: string }
 * - segmentColors: (tuỳ chọn) mảng chuỗi màu CSS cho từng phân đoạn
 * - onSpinEnd: callback khi kết thúc quay
 */
const Wheel = forwardRef(
  ({ segments, segmentColors, onSpinEnd, code }, ref) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [angle, setAngle] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [size, setSize] = useState(0);
    const currentReward = useRef(null);
    const arcSize = (2 * Math.PI) / segments.length;
    const defaultColors = ['#FFF8E5', '#FFB53E'];

    // Quan sát kích thước container để giữ tỉ lệ vuông
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setSize(entry.contentRect.width);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // Vẽ phân đoạn
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || size === 0) return;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);

      const radius = size / 2;
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(angle - Math.PI / 2);
      ctx.translate(-radius, -radius);

      segments.forEach((seg, i) => {
        const start = i * arcSize;
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, start, start + arcSize);
        ctx.closePath();
        const fillColor =
          segmentColors?.[i] || defaultColors[i % defaultColors.length];
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Vẽ nhãn, đẩy ra gần viền ngoài
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(start + arcSize / 2);
        ctx.fillStyle = '#000';
        ctx.font = `bold ${size / 30}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(seg.label, radius * 0.65, 0); // đặt label ở 80% bán kính
        ctx.restore();
      });

      ctx.restore();
    }, [segments, segmentColors, angle, size]);
    // Hiệu ứng quay
    const spinToIndex = (targetIndex, rewardInfo) => {
      if (spinning || size === 0) return;
      currentReward.current = rewardInfo;
      const rotations = 6;
      // Tính góc cần quay sao cho segment giữa trùng với kim chỉ
      const targetRad =
        rotations * 2 * Math.PI + (Math.PI / 2 - (targetIndex + 1) * arcSize);
      const duration = 3000;
      const start = performance.now();
      setSpinning(true);
      const animate = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const easeOut = 1 - Math.pow(1 - t, 3);
        setAngle(easeOut * targetRad);
        if (t < 1) requestAnimationFrame(animate);
        else {
          setSpinning(false);
          onSpinEnd?.(currentReward.current);
        }
      };
      requestAnimationFrame(animate);
    };

    useImperativeHandle(ref, () => ({ spinToIndex }));

    const handleSpin = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/spin`,
          { code },
        );
        if (res.data.success) {
          const rewardLabel = res.data.reward.label;
          const index = segments.findIndex((r) => r.label === rewardLabel);
          if (index !== -1) {
            spinToIndex(index, res.data.reward);
          }
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: err.response?.data?.message || 'Không thể quay',
        }).then(() => {
          window.location.reload();
        });
      }
    };

    return (
      <div ref={containerRef} className="relative w-full aspect-square">
        {/* Nền vòng quay */}
        <img
          src="/img/wheel.svg"
          alt="Nền vòng quay"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Canvas quay */}
        <canvas
          ref={canvasRef}
          className="absolute left-1/2 top-1/2 w-[72%] h-[72%] -translate-x-1/2 -translate-y-[57%]
            rounded-full"
        />

        {/* Kim chỉ */}
        <img
          src="/img/kim.png"
          alt="Kim chỉ"
          className="pointer-events-none absolute w-[44px] h-[66px] left-1/2 top-0 -translate-x-1/2
            z-10"
        />

        {/* Nút Quay */}
        <button
          onClick={() => {
            // spinToIndex(Math.floor(Math.random() * segments.length), null)
            handleSpin();
            // spinToIndex(1);
          }}
          className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 z-20 w-[20%]
            h-[20%] p-0"
        >
          <img
            src="/img/spin-button.svg"
            alt="Spin"
            className="w-full h-full object-contain"
          />
        </button>
      </div>
    );
  },
);

export default Wheel;
