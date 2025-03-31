'use client'
import { useEffect, useState } from "react";
import Swal from "sweetalert2"; 
import axios from "axios";
import AdminHeader from "@/components/header";
import { useRouter } from "next/navigation";
export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ code: "", reward: "", date: "" });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const router = useRouter();

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setLogs(res.data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tải dữ liệu lịch sử.',
      });
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/admin"); // Redirect nếu chưa đăng nhập
    } else {
      fetchLogs(t);
    }
  }, []);
  const handleFilter = () => {
    fetchLogs();
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen">
       <AdminHeader></AdminHeader>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Mã"
          value={filters.code}
          onChange={(e) => setFilters({ ...filters, code: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Tên giải"
          value={filters.reward}
          onChange={(e) => setFilters({ ...filters, reward: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={handleFilter}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Lọc
        </button>
      </div>

      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-pink-100">
          <tr>
            <th className="px-4 py-2 text-left">Mã</th>
            <th className="px-4 py-2">Giải thưởng</th>
            <th className="px-4 py-2">Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{log.code}</td>
              <td className="px-4 py-2 text-center">{log.reward}</td>
              <td className="px-4 py-2 text-right">{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
