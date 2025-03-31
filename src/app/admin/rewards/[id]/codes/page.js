'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/header";
import { use } from "react";
export default function ImportRewardCodes({ params }) {
  const [codeText, setCodeText] = useState("");
  const [file, setFile] = useState(null);
  const [codesList, setCodesList] = useState([]);
  const router = useRouter();
  const { id: rewardId } = use(params);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchCodes = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reward-codes/${rewardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCodesList(res.data || []);
    } catch (err) {
      console.error("Không thể tải danh sách mã:", err);
    }
  };

  const handleImportText = async () => {
    const codes = codeText.split("\n").map(code => code.trim()).filter(Boolean);
    if (codes.length === 0) {
      return Swal.fire({ icon: 'warning', title: 'Chưa nhập mã nào' });
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reward-codes/import`, {
        rewardId,
        codes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: "success",
        title: "Thành công",
        html: `
          ✅ <b>${res.data.imported}</b> mã đã được thêm.<br/>
          ⚠️ <b>${res.data.duplicated.length}</b> mã trùng không được thêm.
        `
      });

      setCodeText("");
      fetchCodes();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi khi import mã' });
    }
  };

  const handleImportFile = async () => {
    if (!file) {
      return Swal.fire({ icon: 'warning', title: 'Chưa chọn file nào' });
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("rewardId", rewardId);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reward-codes/import-file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      Swal.fire({
        icon: "success",
        title: "Import file thành công",
        html: `
          ✅ <b>${res.data.imported}</b> mã đã được thêm.<br/>
          ⚠️ <b>${res.data.duplicated.length}</b> mã trùng không được thêm.
        `
      });

      setFile(null);
      fetchCodes();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi khi upload file' });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin");
    } else {
      fetchCodes();
    }
  }, []);

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-pink-50 to-yellow-50 min-h-screen mx-auto">
      <AdminHeader />
      <h1 className="text-3xl font-bold text-pink-600 mb-8">🎁 Nhập mã đổi thưởng</h1>

      {/* Danh sách mã đã nhập */}
      <div className="bg-white rounded-xl shadow p-6 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          📋 Danh sách mã đã thêm
        </h2>
        {codesList.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có mã nào được thêm.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto text-sm text-gray-700 divide-y divide-gray-200 border rounded-md">
            {codesList.map((c, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2">
                <span className="font-medium text-gray-800">{c.code}</span>
                <span
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${c.used
                      ? "bg-red-100 text-red-600 border border-red-400"
                      : "bg-green-100 text-green-600 border border-green-400"
                    }`}
                >
                  {c.used ? "❌ Đã phát cho người may mắn" : "✔️ Chưa có người nào trúng cả"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 mt-5">
        {/* Nhập thủ công */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">✍️ Nhập thủ công</h2>
          <textarea
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            rows={10}
            className="w-full border rounded-md p-3 text-sm text-gray-700 resize-none mb-4"
            placeholder="Mỗi dòng là một mã...\nABC123\nXYZ456"
          />
          <button
            onClick={handleImportText}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md transition"
          >
            Nhập từ văn bản
          </button>
        </div>

        {/* Upload file */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">📂 Nhập từ file (.txt hoặc .xlsx)</h2>
          <input
            type="file"
            accept=".txt,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full mb-4 text-sm border rounded px-3 py-2"
          />
          <button
            onClick={handleImportFile}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-md transition"
          >
            Tải file lên
          </button>
        </div>
      </div>
    </div>
  );
}
