'use client'
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Wheel from "../components/Wheel";
import Swal from 'sweetalert2';
export default function Home() {
  const [code, setCode] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [rewardsCode, setRewardsCode] = useState(null)
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const wheelRef = useRef();

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/rewards`);
        const data = res.data.map(r => ({ label: r.label, image: r.image }));
        setRewards(data);
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải danh sách giải thưởng',
        });
      }
    };
    fetchRewards();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data);
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải lịch sử quay.',
        });
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    window.onTelegramAuth = async function (user) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/send-telegram`, {
          user, 
          code: rewardsCode,
          reward: result
        });

        Swal.fire({
          icon: 'success',
          title: 'Đã gửi mã!',
          text: `Mã đã được gửi đến Telegram của bạn.`,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: err.response?.data?.message || 'Gửi mã thất bại.',
        });
      }
    };
  }, [rewardsCode, result]);

  const handleCheckCode = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/check-code`, { code });
      if (res.data.success) setIsValid(true);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: err.response?.data?.message || "Lỗi kiểm tra mã",
      });
    }
  };

  const handleSpin = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/spin`, { code });
      if (res.data.success) {
        const rewardLabel = res.data.reward.label;
        const index = rewards.findIndex(r => r.label === rewardLabel);
        if (index !== -1 && wheelRef.current) {
          wheelRef.current.spinToIndex(index, res.data.reward);
        }
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: err.response?.data?.message || "Không thể quay",
      }).then(() => {
        window.location.reload();
      });
    }
  };


  const handleSpinEnd = async (reward) => {
    setResult(reward.label);
    setRewardsCode(reward.code);

    Swal.fire({
      title: "🎉 Chúc mừng!",
      html: `
        <p><strong>Bạn đã trúng:</strong> <span style="color:#e91e63;">${reward.label}</span></p>
        <p>🔑 Mã: <b>${reward.code}</b></p>
        <p class="mt-4">🎯 Xác thực Telegram để nhận mã quà:</p>
        <div id="telegram-login-container" class="flex justify-center mt-3">
  <div id="telegram-login"></div>
</div>
      `,
      didOpen: () => {
        if (!document.getElementById("telegram-login").hasChildNodes()) {
          const script = document.createElement("script");
          script.src = "https://telegram.org/js/telegram-widget.js?22";
          script.setAttribute("data-telegram-login", "vongquayvipbot");
          script.setAttribute("data-size", "large");
          script.setAttribute("data-userpic", "true");
          script.setAttribute("data-request-access", "write");
          script.setAttribute("data-onauth", "onTelegramAuth(user)");
          document.getElementById("telegram-login").appendChild(script);
        }
      },
      showConfirmButton: false,
    });
  };




  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-100 p-6">
      <h1 className="text-3xl md:text-4xl font-bold text-pink-600 text-center mb-8">
        🎯 Vòng quay dự thưởng
      </h1>
      {!isValid ? (
        <div className="flex flex-col xl:flex-row gap-8 justify-center items-start">
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Nhập mã dự thưởng..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="p-3 border rounded w-64"
            />
            <button
              onClick={handleCheckCode}
              className="bg-green-500 text-white px-5 py-3 rounded font-semibold hover:bg-green-600 transition"
            >
              Kiểm tra mã
            </button>
          </div>
          <div className="w-full xl:w-1/4 bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-bold text-center mb-4 text-pink-600">
              🕓 Lịch sử quay
            </h2>
            <ul className="space-y-3 text-sm max-h-[420px] overflow-y-auto pr-2">
              {logs.map((log, index) => (
                <li key={index} className="border-b pb-2">
                  <div className="font-medium">🎫 Mã: <span className="text-gray-700">{log.code}</span></div>
                  <div>🎁 Phần thưởng: <b className="text-pink-600">{log.reward}</b></div>
                  <div className="text-xs text-gray-400 italic">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>

      ) : (
        <div className="flex flex-col xl:flex-row gap-8 justify-center items-start">
          <div className="w-full xl:w-1/5 bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-bold text-center mb-4 text-pink-600">
              🎁 Giải thưởng
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {rewards.map((item, i) => (
                <li
                  key={i}
                  className="bg-pink-50 border border-pink-200 px-3 py-1 rounded-md"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* 🎡 Vòng quay */}
          <div className="flex flex-col items-center justify-center">
            <Wheel ref={wheelRef} segments={rewards} onSpinEnd={handleSpinEnd} />
            <button
              onClick={handleSpin}
              className="mt-6 px-8 py-3 rounded-full text-white font-bold bg-pink-500 hover:bg-pink-600 shadow-lg transition"
            >
              🎯 Quay Ngay
            </button>
            {result && (
              <div className="mt-6 text-xl font-bold text-green-700 text-center">
                🎉 Bạn đã trúng: {result}!
              </div>
            )}
          </div>

          {/* 🕓 Lịch sử quay */}
          <div className="w-full xl:w-1/4 bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-bold text-center mb-4 text-pink-600">
              🕓 Lịch sử quay
            </h2>
            <ul className="space-y-3 text-sm max-h-[420px] overflow-y-auto pr-2">
              {logs.map((log, index) => (
                <li key={index} className="border-b pb-2">
                  <div className="font-medium">🎫 Mã: <span className="text-gray-700">{log.code}</span></div>
                  <div>🎁 Phần thưởng: <b className="text-pink-600">{log.reward}</b></div>
                  <div className="text-xs text-gray-400 italic">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </main>
  );
}
