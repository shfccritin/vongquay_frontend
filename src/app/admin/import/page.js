// 📁 File: app/admin/import/page.js

'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import Swal from 'sweetalert2';
import Header from '../../../components/header';

export default function ImportSubscribersPage() {
  const [csvData, setCsvData] = useState(null);
  const [result, setResult] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

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

  // Thay phần gửi từng ID bằng batch gửi 1 lần
const handleSubmit = async () => {
    if (!csvData) {
      Swal.fire({ icon: 'warning', title: 'Vui lòng tải file trước' });
      return;
    }
  
    const ids = [];
  
    for (const row of csvData) {
      const subscriber_id = row["Subscriber ID"] || row["subscriber id"] || row["ID"] || Object.values(row)[0];
      const cleanId = subscriber_id?.trim();
      if (cleanId) ids.push(cleanId);
    }
  
    if (ids.length === 0) {
      Swal.fire({ icon: 'error', title: 'Không tìm thấy ID nào hợp lệ trong file' });
      return;
    }
  
    setUploading(true);
  
    try {
      const res = await axios.post('http://localhost:5000/manychat/batch', {
        ids,
      });
  
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
    <div>
        <Header></Header>
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