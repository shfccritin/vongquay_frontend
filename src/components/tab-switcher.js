'use client';
import React, { useState } from 'react';
import RewardList from './RewardList';
import HistoryList from './HistoryList';

export default function TabSwitcher({ rewards, logs, className = '' }) {
  const tabs = [
    { label: 'Giải Thưởng Hoạt Động', key: 'rewards' },
    { label: 'Danh Sách Thắng', key: 'history' },
  ];
  const [active, setActive] = useState('rewards');

  return (
    <div className={className}>
      <div className="flex space-x-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex-1 p-2.5 rounded-[5px] outline-1 outline-offset-[-1px] outline-white flex
            justify-center items-center gap-2.5 transition-colors duration-200 ${
            active === tab.key
                ? `bg-[radial-gradient(ellipse_97.48%_397.92%_at_2.52%_50%,_#FFB53E_29%,_#FFF8E5_100%)]
                  text-black`
                : 'bg-[#111111] text-white'
            }`}
          >
            <span className="text-base font-medium capitalize">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      <div>
        {active === 'rewards' && <RewardList rewards={rewards} />}
        {active === 'history' && <HistoryList logs={logs} />}
      </div>
    </div>
  );
}
