"use client";

import { useState } from "react";

export default function Home() {
  const [isClicked, setIsClicked] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-blue-900 text-white flex flex-col items-center justify-center p-6">
      <div className={isClicked ? "text-left w-full max-w-4xl" : "text-center"}>
        
        <div 
          onClick={() => setIsClicked(!isClicked)}
          className={`cursor-pointer border-4 border-blue-400 rounded-full overflow-hidden transition-all ${
            isClicked ? 'w-24 h-24' : 'w-40 h-40 mx-auto'
          }`}
        >
          < img src="/logo1.png" alt="Logo" className="w-full h-full object-cover" />
        </div>

        <h1 className={isClicked ? "text-5xl font-bold" : "text-7xl font-bold mt-4"}>
          Lume
        </h1>

        {isClicked && (
          <div className="mt-10">
            <p>xxxxxxxxxx</p >
            <div className="mt-4 flex gap-4">
              <button className="px-6 py-2 bg-blue-500 rounded">注册</button>
              <button className="px-6 py-2 border border-white rounded">登录</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}