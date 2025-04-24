'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Thêm state kiểm tra token

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      window.location.href = "/admin/dashboard";
    } else {
      setIsCheckingAuth(false); // Cho phép render UI nếu không có token
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      return Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin!',
        text: 'Vui lòng nhập đủ tên đăng nhập và mật khẩu.',
      });
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
        username,
        password
      });

      localStorage.setItem("token", res.data.token);

      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đăng nhập thành công!',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "/admin/dashboard";
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: err.response?.data?.message || "Đăng nhập thất bại",
      });
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <p className="text-gray-600 text-lg">🔒 Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">🔐 Admin Login</h1>
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-pink-500 text-white font-semibold py-2 rounded hover:bg-pink-600"
        >
          Đăng nhập
        </button>
      </div>
    </main>
  );
}
