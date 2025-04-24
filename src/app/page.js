'use client';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Wheel from '../components/Wheel';
import TabSwitcher from '../components/tab-switcher';
import Swal from 'sweetalert2';
import RewardList from '../components/RewardList';
import HistoryList from '../components/HistoryList';
import Snowfall from '../components/Snowfall';

export default function Home() {
  const [code, setCode] = useState('');
  const [turn, setTurn] = useState(1);
  const [isValid, setIsValid] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [rewardsCode, setRewardsCode] = useState(null);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const wheelRef = useRef();

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/public/rewards`,
        );
        const data = res.data.map((r) => ({ label: r.label, image: r.image }));
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
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/logs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
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
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/send-telegram`,
          {
            user,
            code: rewardsCode,
            reward: result,
          },
        );

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
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/check-code`,
        { code },
      );
      if (res.data.success) setIsValid(true);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: err.response?.data?.message || 'Lỗi kiểm tra mã',
      });
    }
  };

  const handleSpin = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/spin`,
        { code },
      );
      if (res.data.success) {
        const rewardLabel = res.data.reward.label;
        const index = rewards.findIndex((r) => r.label === rewardLabel);
        if (index !== -1 && wheelRef.current) {
          wheelRef.current.spinToIndex(index, res.data.reward);
        }
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: err.response?.data?.message || 'Không thể quay',
      }).then(() => {
        window.location.reload();
      });
    }
  };

  const handleSpinEnd = async (reward) => {
    setResult(reward.label);
    setRewardsCode(reward.code);
    setTurn(0);
  
    // 🎆 Pháo hoa
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  
    Swal.fire({
      title: '🎉 Chúc mừng!',
      html: `
        <p><strong>Bạn đã trúng:</strong> <span style="color:#e91e63;">${reward.label}</span></p>
        <p>🔑 Mã: <b>${reward.code}</b></p>
        <p class="mt-4">🎯 Xác thực Telegram để nhận mã quà:</p>
        <div id="telegram-login-container" class="flex justify-center mt-3">
          <div id="telegram-login"></div>
        </div>
      `,
      didOpen: () => {
        if (!document.getElementById('telegram-login').hasChildNodes()) {
          const script = document.createElement('script');
          script.src = 'https://telegram.org/js/telegram-widget.js?22';
          script.setAttribute('data-telegram-login', 'vongquayvipbot');
          script.setAttribute('data-size', 'large');
          script.setAttribute('data-userpic', 'true');
          script.setAttribute('data-request-access', 'write');
          script.setAttribute('data-onauth', 'onTelegramAuth(user)');
          document.getElementById('telegram-login').appendChild(script);
        }
      },
      showConfirmButton: false,
    });
  };
  ;

  return (
    <main
      className="min-h-screen [background-color:lightgray]
        [background-image:linear-gradient(180deg,_rgba(255,255,255,0)_46.01%,_#FFF_100%),url('/img/bg.jpg')]
        p-3 sm:p-6"
    >
       <Snowfall />

      {!isValid ? (
        <div className="flex flex-col 2xl:flex-row gap-8 justify-center items-start">
          <div
            className="w-full mt-15 max-w-[924px] inline-flex flex-col items-center gap-16 mx-auto
              2xl:mx-0"
          >
            <img
              src="/img/title.png"
              alt="Title"
              className="w-full max-w-[799px] h-auto object-contain"
            />

            <div
              className="w-full p-6
                bg-[radial-gradient(ellipse_97.48%_397.92%_at_2.52%_50%,_#FFB53E_29%,_#FFF8E5_100%)]
                sm:rounded-[452.58px] rounded-3xl outline-2 outline-offset-[-2.26px]
                outline-white"
            >
              <div className="w-full sm:flex-row flex-col flex items-center justify-center gap-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Nhập mã dự thưởng..."
                  className="w-full md:w-[591.13px] h-12 bg-slate-800 rounded-[743.56px] border-4
                    border-slate-600 p-3 text-white placeholder-gray-400"
                />
                <button
                  onClick={handleCheckCode}
                  className="h-12 px-6 text-nowrap bg-red-500 text-white rounded-full font-semibold
                    hover:bg-red-600 transition-shrink-0"
                >
                  Kiểm tra mã
                </button>
              </div>
            </div>
          </div>
          {/* <div className="w-full 2xl:w-1/4 bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-bold text-center mb-4 text-pink-600">
              🕓 Lịch sử quay
            </h2>
            <ul className="space-y-3 text-sm max-h-[420px] overflow-y-auto pr-2">
              {logs.map((log, index) => (
                <li key={index} className="border-b pb-2">
                  <div className="font-medium">
                    🎫 Mã: <span className="text-gray-700">{log.code}</span>
                  </div>
                  <div>
                    🎁 Phần thưởng:{' '}
                    <b className="text-pink-600">{log.reward}</b>
                  </div>
                  <div className="text-xs text-gray-400 italic">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </div>
                </li>
              ))}
            </ul>
          </div> */}
        </div>
      ) : (
        <div className="flex w-full flex-col 2xl:flex-row gap-20 justify-center items-start">
          {/*  Qua */}
          <div className="2xl:w-[25%] hidden 2xl:inline-flex">
            <RewardList rewards={rewards} />
          </div>

          {/* 🎡 Vòng quay */}
          <div className="2xl:w-[28%] w-full flex flex-col items-center justify-center">
            <div className="max-w-[600px] w-full flex flex-col items-center">
              <div className="h-[200px] mb-4 flex justify-center">
                <img src="/img/title.png" alt="title" />
              </div>
              <Wheel
                ref={wheelRef}
                segments={rewards}
                onSpinEnd={handleSpinEnd}
                code={code}
              />
              <div
                className="w-84 sm:w-96 mt-8 h-16 relative
                  bg-[radial-gradient(ellipse_97.48%_397.92%_at_2.52%_50.00%,_#050505_0%,_#2A2A2A_71%)]
                  rounded-lg
                  shadow-[0px_3.388185501098633px_16.940927505493164px_0px_rgba(0,0,0,0.25)]
                  outline-2 outline-offset-[-2.16px] outline-[#0f1f2e]"
              >
                <img
                  className="w-24 h-24 left-[-18.63px] top-[-18.63px] absolute"
                  src="/icon/clock.png"
                />
                <div
                  className="left-[104.92px] top-[9.57px] absolute inline-flex justify-start items-center
                    gap-4"
                >
                  <div className="justify-center text-white text-xl font-normal font-['SF_Pro_Display'] uppercase">
                    lượt quay:
                  </div>
                  <div
                    className="text-special-2 justify-center text-[34.71px] font-extrabold
                      font-['SF_Pro_Display'] uppercase"
                  >
                    {turn}
                  </div>
                </div>
              </div>
              {result && (
                <div className="mt-6 text-xl font-bold text-green-700 text-center">
                  🎉 Bạn đã trúng: {result}!
                </div>
              )}
            </div>
          </div>

          {/* 🕓 Lịch sử quay */}
          <div className="hidden 2xl:block 2xl:w-[25%]">
            <HistoryList logs={logs} />
          </div>
          <TabSwitcher
            className="2xl:hidden w-full max-w-[600px] mx-auto"
            rewards={rewards}
            logs={logs}
          />
        </div>
      )}
    </main>
  );
}
