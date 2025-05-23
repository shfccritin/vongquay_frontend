'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Header from '../../../components/header';

export default function AdminDashboard() {
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [selectedRewardId, setSelectedRewardId] = useState("");

  const router = useRouter();

  const fetchCodes = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/codes`);
      setCodes(res.data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tải mã!',
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin");
    } else {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsCheckingAuth(false);
      fetchCodes();

      // ✅ Chỉ fetch rewards sau khi token có
      const fetchRewards = async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/rewards`);
          setRewards(res.data);
        } catch (err) {
          console.error("Không thể tải danh sách rewards", err);
        }
      };
      fetchRewards();
    }
  }, [router]);



  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <p className="text-lg text-gray-600">🔒 Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!newCode) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa nhập mã',
        text: 'Vui lòng nhập mã trước khi thêm.',
      });
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/codes`, {
        code: newCode,
        rewardId: selectedRewardId
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Mã đã được thêm.',
        timer: 2000,
        showConfirmButton: false,
      });

      setNewCode("");
      fetchCodes();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: err.response?.data?.message || 'Không thể thêm mã.',
      });
    }
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
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/codes/${id}`);

        Swal.fire({
          icon: 'success',
          title: 'Đã xoá!',
          text: 'Mã đã được xoá thành công.',
          timer: 1500,
          showConfirmButton: false
        });

        fetchCodes();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: err.response?.data?.message || 'Không thể xoá mã.',
        });
      }
    }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen">
      <Header></Header>
      {/* ==== Các phần còn lại giữ nguyên ==== */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="file"
          accept=".xlsx"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            try {
              const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/codes/import`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              const { imported, duplicated } = res.data;

              if (duplicated && duplicated.length > 0) {
                Swal.fire({
                  icon: "warning",
                  title: "Một số mã đã tồn tại",
                  html: `
                    <p>✅ <b>${imported}</b> mã mới đã được thêm.</p>
                    <p>⚠️ <b>${duplicated.length}</b> mã bị trùng:</p>
                    <pre style="text-align:left; max-height:150px; overflow:auto; background:#f9f9f9; padding:6px; border-radius:4px;">
${duplicated.join("\n")}
                    </pre>
                  `,
                  width: 500,
                });
              } else {
                Swal.fire({
                  icon: "success",
                  title: "Thành công!",
                  text: `${imported} mã đã được thêm.`,
                  timer: 2000,
                  showConfirmButton: false,
                });
              }

              fetchCodes();
            } catch (err) {
              Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: err.response?.data?.message || "Lỗi khi import file",
              });
            }

            e.target.value = ""; // Reset input
          }}
          className="border px-3 py-2 rounded bg-white w-64"
        />
        <span className="text-gray-600 text-sm">
          * File .xlsx cần có 2 cột <code>code</code> và <code>reward</code>

        </span>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="Nhập mã mới"
          className="border px-3 py-2 rounded w-64"
        />
        <select
          className="border px-3 py-2 rounded w-64"
          value={selectedRewardId}
          onChange={(e) => setSelectedRewardId(e.target.value)}
        >
          <option value="">-- Chọn giải thưởng --</option>
          {rewards.map(r => (
            <option key={r._id} value={r._id}>{r.label}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Thêm mã
        </button>
      </div>

      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-pink-100 text-gray-700 text-sm uppercase">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3">Mã</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Giải thưởng</th>
            <th className="px-4 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c, i) => (
            <tr key={c._id} className="border-t hover:bg-pink-50 transition">
              <td className="px-4 py-2 text-sm">{i + 1}</td>
              <td className="px-4 py-2 font-mono text-sm">{c.code}</td>
              <td className="px-4 py-2 text-sm text-center">
                {c.used ? (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">Đã dùng</span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Chưa dùng</span>
                )}
              </td>
              <td className="px-4 py-2 text-sm text-center">{c.rewardId?.label || 'Không có'}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleDelete(c._id)}
                  className="inline-flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded shadow-sm transition"
                >
                  🗑 Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
