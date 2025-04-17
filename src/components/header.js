'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin");
  };

  const navLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/admin/dashboard", label: "Mã Dự Thưởng" },
    { href: "/admin/rewards", label: "Giải thưởng" },
    { href: "/admin/logs", label: "Lịch sử quay" },
    { href: "/admin/broadcast", label: "Broadcast" },
    { href: "/admin/chat", label: "Chat" },
    { href: "/admin/schedule", label: "Lịch Bình Luận" },
  ];

  return (
    <header className="bg-white shadow-md rounded-xl px-6 py-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-pink-100">
      <h1 className="text-2xl md:text-3xl font-bold text-pink-700 flex items-center gap-2">
        <span>🛠️</span> <span>Quản trị hệ thống</span>
      </h1>

      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <nav className="flex flex-wrap gap-2 md:gap-4 text-sm md:text-base font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 rounded-md transition-all ${
                pathname === link.href
                  ? "bg-pink-100 text-pink-700 font-semibold"
                  : "text-gray-600 hover:text-pink-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition duration-200 shadow"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
