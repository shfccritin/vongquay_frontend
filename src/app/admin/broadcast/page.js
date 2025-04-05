'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';

export default function BroadcastPage() {
  const router = useRouter();
  const [message, setMessage] = useState(`🚨 *SẮP LIVE PK RỒI ĐÂY ANH/CHỊ ƠI!*\n🎁 Chuẩn bị nhận code & quà siêu hot\n🕒 Bắt đầu sau 15 phút nữa nha!`);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Check token khi vào trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin'); // redirect nếu chưa đăng nhập
    }
  }, [router]);

  const sendBroadcast = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('⚠️ Bạn chưa đăng nhập');
      return;
    }

    if (!message.trim()) {
      return setStatus('⚠️ Vui lòng nhập nội dung tin nhắn!');
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ Đã gửi thành công cho ${data.success} người dùng, thất bại ${data.failed}.`);
      } else {
        setStatus(`❌ Gửi thất bại: ${data.error || 'Lỗi không xác định'}`);
      }
    } catch (err) {
      setStatus(`❌ Lỗi kết nối: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="p-6 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">📢 Gửi thông báo livestream</h1>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full p-2 border rounded mb-4"
          placeholder="Nhập nội dung tin nhắn..."
        />

        <button
          onClick={sendBroadcast}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {loading ? 'Đang gửi...' : 'Gửi thông báo ngay'}
        </button>

        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </>
  );
}
