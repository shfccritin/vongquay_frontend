'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/header';

export default function BroadcastPage() {
  const router = useRouter();
  const [message, setMessage] = useState(`🚨 *SẮP LIVE PK RỒI ĐÂY ANH/CHỊ ƠI!*\n🎁 Chuẩn bị nhận code & quà siêu hot\n🕒 Bắt đầu sau 15 phút nữa nha!`);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [videoFile, setVideoFile] = useState(null); // Thêm state video

  // Check login token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin'); 
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">🔒 Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

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
      const formData = new FormData();
      formData.append('message', message);
      if (videoFile) {
        formData.append('video', videoFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-broadcast`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
    <div className="p-8 bg-slate-50 min-h-screen">
      <Header />
      <div className="p-6 max-w-xl mx-auto text-center bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">📢 Gửi thông báo livestream</h1>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full p-2 border rounded mb-4"
          placeholder="Nhập nội dung tin nhắn..."
        />

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
          className="mb-4 w-full"
        />

        <button
          onClick={sendBroadcast}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
        >
          {loading ? 'Đang gửi...' : 'Gửi thông báo ngay'}
        </button>

        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </div>
  );
}
