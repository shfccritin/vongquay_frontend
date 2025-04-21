'use client';
import React from 'react';

export default function RewardList({ rewards }) {
  return (
    <div
      className="w-full h-[93vh] px-6 overflow-auto no-scrollbar flex-col inline-flex
        justify-start items-start gap-8"
    >
      {rewards.map((item, i) => (
        <div
          key={i}
          className="self-stretch relative p-[3px] bg-[linear-gradient(to_right,_#FFA500,_#FFFFFF)]
            rounded-[11.56px] shadow-[0px_4.624px_23.120937px_0px_rgba(0,0,0,0.25)]"
        >
          <div
            className="h-20 rounded-[10.404px]
              bg-[radial-gradient(ellipse_97.48%_397.92%_at_2.52%_50%,_#FFB53E_29%,_#FFF8E5_100%)]
              overflow-hidden relative"
          >
            <img
              className="w-16 h-14 left-[23.58px] top-[11.79px] absolute"
              src={`icon/top-${i + 1}.png`}
              alt={`top-${i + 1}`}
            />
            <div className="w-16 h-14 left-[112.88px] top-[11.79px] absolute">
              <img
                className="w-8 h-14 left-[24.69px] top-0 absolute"
                src={item.image}
              />
            </div>
            <div
              className="left-[215.02px] top-[30.29px] absolute justify-center text-stone-950 text-lg
                font-semibold uppercase"
            >
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
