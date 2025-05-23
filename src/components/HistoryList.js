'use client';
import React from 'react';

export default function HistoryList({ logs }) {
  return (
    <div
      className="m-6 test sm:px-6 sm:py-10 px-3 py-5 h-[90vh] overflow-auto relative rounded-3xl
        outline-1 outline-offset-[-1.16px] outline-black/20 backdrop-blur-md
        no-scrollbar"
    >
      <div className="w-full inline-flex flex-col justify-start items-start gap-9">
        <div className="inline-flex justify-start items-center gap-2">
          <img className="sm:w-16 sm:h-14 w-10 h-8" src="/icon/fire.png" />
          <div className="justify-center text-3xl sm:text-4xl text-special">
            lịch sử quay
          </div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          {logs.map((item, i) => (
            <div
              key={i}
              className="self-stretch w-full p-[1.5px] bg-gradient-to-r from-[#FFF2D4] to-[#FFDC40]
                rounded-md"
            >
              <div
                className="h-14 relative w-full
                  bg-[radial-gradient(ellipse_97.48%_397.92%_at_2.52%_50%,_#FFF8E5_0%,_#FFB53E_71%)]
                  rounded-[4.5px] shadow-[0px_4.624px_11.560px_0px_rgba(0,0,0,0.25)]
                  overflow-hidden flex items-center justify-start px-3"
              >
                <div className="inline-flex justify-center items-center gap-2 2xl:gap-4">
                  <div className="flex w-[165px] justify-center items-center gap-1">
                    <img className="w-8 h-8" src="/icon/coupon.png" />
                    <div className="text-neutral-950 line-clamp-2 text-base font-bold capitalize">
                      {item.code}
                    </div>
                  </div>
                  <div className="flex justify-start items-center gap-3">
                    <img className="w-6 h-6" src="/icon/gift.png" />
                    <div className="text-neutral-950 line-clamp-2 text-base font-bold capitalize">
                      {item.reward}
                    </div>
                  </div>
                  <div className="text-neutral-950 text-xs font-light italic capitalize">
                    {(() => {
                      const d = new Date(item.createdAt);
                      const time = d.toLocaleTimeString('en-GB', {
                        hour12: false,
                      });
                      const date = d.toLocaleDateString('en-GB');
                      return `${time} ${date}`;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
