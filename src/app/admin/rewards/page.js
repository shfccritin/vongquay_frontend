'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "@/components/header";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function AdminRewards() {
  const [rewards, setRewards] = useState([]);
  const [form, setForm] = useState({ label: "", chance: "", image: "", isFake: false });
  const [editingId, setEditingId] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const router = useRouter();

  const fetchRewards = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/rewards`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRewards(res.data);
    console.log(res.data, 'res.data')
  };

  const handleSubmit = async () => {
    // ⚠️ Validate phía client
    if (!form.label || form.label.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Thiếu tên giải!",
        text: "Vui lòng nhập tên giải thưởng.",
      });
      return;
    }

    if (form.chance === "" || isNaN(form.chance) || form.chance < 0 || form.chance > 100) {
      Swal.fire({
        icon: "warning",
        title: "Tỷ lệ không hợp lệ!",
        text: "Tỷ lệ phải là số từ 0 đến 100.",
      });
      return;
    }

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rewards/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rewards`;

      const method = editingId ? "put" : "post";

      await axios[method](url, form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: "success",
        title: editingId ? "Đã cập nhật" : "Đã thêm",
        text: editingId ? "Thông tin giải đã được cập nhật." : "Thêm giải thưởng thành công.",
        timer: 2000,
        showConfirmButton: false,
      });

      setForm({ label: "", chance: "", image: "", isFake: false });
      setEditingId(null);
      fetchRewards();

    } catch (err) {
      const message = err.response?.data?.message || "Đã xảy ra lỗi khi xử lý.";
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: message,
      });
    }
  };

  const handleEdit = (r) => {
    setForm(r);
    setEditingId(r._id);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xoá?",
      text: "Thao tác này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/rewards/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire({
          icon: "success",
          title: "Đã xoá!",
          text: "Giải thưởng đã được xoá thành công.",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchRewards();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: err.response?.data?.message || "Không thể xoá giải thưởng.",
        });
      }
    }
  };


  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/admin");
    } else {
      fetchRewards();
    }
  }, []);
  return (
    <main className="p-8 bg-gradient-to-br from-yellow-50 to-pink-100 min-h-screen">
      <AdminHeader />

      {/* Form nhập hoặc sửa */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-4">
        <h2 className="text-xl font-bold text-pink-600">
          {editingId ? "✏️ Cập nhật giải thưởng" : "➕ Thêm giải thưởng mới"}
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Tên giải"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="border px-4 py-2 rounded w-60"
          />
          <input
            type="number"
            placeholder="Tỷ lệ (%)"
            value={form.chance}
            onChange={(e) => setForm({ ...form, chance: Number(e.target.value) })}
            className="border px-4 py-2 rounded w-36"
          />
          <input
            type="text"
            placeholder="Link ảnh (nếu có)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="border px-4 py-2 rounded w-80"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isFake}
              onChange={(e) => setForm({ ...form, isFake: e.target.checked })}
              className="accent-pink-500"
            />
            <span className="text-gray-700">Giải mồi</span>
          </label>
          <button
            onClick={handleSubmit}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2 rounded shadow"
          >
            {editingId ? "Cập nhật" : "Thêm"}
          </button>
        </div>
      </div>

      {/* Danh sách */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-pink-100 text-pink-700 text-left">
            <tr>
              <th className="px-6 py-3">Tên</th>
              <th className="px-6 py-3 text-center">Tỷ lệ (%)</th>
              <th className="px-6 py-3 text-center">Mồi?</th>
              <th className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r, i) => (
              <tr
                key={r._id}
                className="border-t hover:bg-pink-50 transition"
              >
                <td className="px-6 py-3 font-medium">{r.label}</td>
                <td className="px-6 py-3 text-center">{r.chance}</td>
                <td className="px-6 py-3 text-center">{r.isFake ? "✅" : "❌"}</td>
                <td className="px-6 py-3 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(r)}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                  >
                    ✏️ <span className="hidden sm:inline">Sửa</span>
                  </button>

                  <button
                    onClick={() => handleDelete(r._id)}
                    className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition"
                  >
                    🗑️ <span className="hidden sm:inline">Xoá</span>
                  </button>

                  <Link
                    href={`/admin/rewards/${r._id}/codes`}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition"
                  >
                    🔑 <span className="hidden sm:inline">Mã code</span>
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>

  );
}
