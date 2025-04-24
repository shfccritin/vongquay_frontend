// 📁 File: app/admin/import/page.js

'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import Swal from 'sweetalert2';
import Header from '../../../components/header';
import { useRouter } from 'next/navigation'; // Next.js 13+

export default function ImportSubscribersPage() {
  const [csvData, setCsvData] = useState(null);
  const [result, setResult] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Thêm state này
  const router = useRouter();

  // Check login token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin'); // Redirect nếu không có token
    } else {
      setIsCheckingAuth(false); // Cho phép render khi có token
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">🔒 Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        Swal.fire({
          icon: 'success',
          title: 'Tải file thành công',
          text: `Tìm thấy ${results.data.length} dòng dữ liệu.`,
        });
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Lỗi!', text: 'Không thể đọc file CSV.' });
      },
    });
  };

  const handleSubmit = async () => {
    if (!csvData) {
      Swal.fire({ icon: 'warning', title: 'Vui lòng tải file trước' });
      return;
    }

    const ids = csvData.map((row) => {
      const subscriber_id = row["Subscriber ID"] || row["subscriber id"] || row["ID"] || Object.values(row)[0];
      return subscriber_id?.trim();
    }).filter(Boolean);

    if (ids.length === 0) {
      Swal.fire({ icon: 'error', title: 'Không tìm thấy ID nào hợp lệ trong file' });
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/manychat/batch`,
        { ids },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { saved, skipped, failed } = res.data;
      setResult(`✅ Thành công: ${saved} | ⏩ Trùng: ${skipped} | ❌ Lỗi: ${failed}`);

      Swal.fire({
        icon: 'info',
        title: 'Hoàn tất',
        html: `<b>${saved}</b> ID mới<br/><b>${skipped}</b> đã tồn tại<br/><b>${failed}</b> lỗi`,
      });
    } catch (err) {
      console.error('❌ Batch gửi lỗi:', err.message);
      Swal.fire({ icon: 'error', title: 'Lỗi gửi', text: err.message });
    }

    setUploading(false);
  };

  return (
    <div className='p-8 bg-slate-50 min-h-screen'>
      <Header />
      <div className="p-6 max-xl mx-auto bg-white rounded shadow-lg mt-8">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          📥 Import danh sách ID ManyChat
        </h1>

        <label className="block mb-2 font-medium">Chọn file CSV:</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-4 border p-2 rounded w-full"
        />

        {fileName && <p className="text-sm text-gray-600 mb-4">📂 {fileName}</p>}

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {uploading ? '🚀 Đang gửi...' : '📤 Gửi tới endpoint'}
        </button>

        {result && <p className="mt-6 text-green-600 font-semibold text-center">{result}</p>}
      </div>
    </div>
  );
}
