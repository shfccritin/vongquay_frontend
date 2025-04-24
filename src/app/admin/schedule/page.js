'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Header from '../../../components/header';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({
    blv: '',
    time: '',
    date: '',
    game: '',
    link: '',
    countdown: 10,
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Thêm dòng này

  const router = useRouter();

  useEffect(() => {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    } else {
      setIsCheckingAuth(false); // Thêm dòng này
      fetchSchedules();
    }
  }, [router]);

  const fetchSchedules = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/schedules`);
    setSchedules(res.data);
  };

  const handleAdd = async () => {
    const { blv, time, date, countdown } = form;

    if (!blv || !time || !date) {
      return Swal.fire('Thiếu thông tin', 'Vui lòng nhập đầy đủ Tên BLV, Thời gian và Ngày!', 'warning');
    }

    if (!/^\d{1,2}h\d{1,2}$/.test(time)) {
      return Swal.fire('Sai định dạng giờ', 'Định dạng phải là ví dụ: 21h30', 'warning');
    }

    if (isNaN(countdown) || countdown < 0) {
      return Swal.fire('Countdown không hợp lệ', 'Countdown phải là số không âm', 'warning');
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/schedules`, form);
      setForm({ blv: '', time: '', date: '', game: '', link: '', countdown: 10 });
      fetchSchedules();
      Swal.fire('Thành công!', 'Lịch đã được thêm.', 'success');
    } catch (err) {
      Swal.fire('Lỗi!', err.response?.data?.message || 'Không thể thêm lịch.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc muốn xoá?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
    });
    if (result.isConfirmed) {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/schedules/${id}`);
      fetchSchedules();
      Swal.fire('Đã xoá!', '', 'success');
    }
  };

  if (isCheckingAuth) { // Thêm đoạn này
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-lg text-gray-600">🔒 Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  return (
    <main className="p-6 max-xl mx-auto bg-white min-h-screen">
      <Header />
      <h1 className="text-xl font-bold mb-4">🗓 Quản lý lịch phát livestream</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input placeholder="Tên BLV" className="border px-3 py-2 rounded" value={form.blv} onChange={(e) => setForm({ ...form, blv: e.target.value })} />
        <input placeholder="Thời gian (vd: 21h30)" className="border px-3 py-2 rounded" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        <input type="date" className="border px-3 py-2 rounded" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input placeholder="Game (vd: nổ hũ)" className="border px-3 py-2 rounded" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} />
        <input placeholder="Link livestream" className="col-span-2 border px-3 py-2 rounded" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        <input type="number" placeholder="Countdown (phút trước)" className="border px-3 py-2 rounded" value={form.countdown} onChange={(e) => setForm({ ...form, countdown: e.target.value })} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>➕ Thêm lịch</button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">#</th>
            <th>BLV</th>
            <th>Giờ</th>
            <th>Ngày</th>
            <th>Game</th>
            <th>Đã gửi?</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, i) => (
            <tr key={s._id} className="border-t hover:bg-gray-50">
              <td className="p-2">{i + 1}</td>
              <td>{s.blv}</td>
              <td>{s.time}</td>
              <td>{s.date?.slice(0, 10)}</td>
              <td>{s.game}</td>
              <td>{s.sent ? '✅' : '⏳'}</td>
              <td>
                <button className="text-red-500 text-sm" onClick={() => handleDelete(s._id)}>🗑 Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
