"use client";

import Link from "next/link";
import { useState } from "react";

interface FeatureProps {
  icon: string;
  title: string;
  desc: string;
}

function FeatureCard({ icon, title, desc }: FeatureProps) {
  return (
    <div className="p-6 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-blue-100 text-sm leading-relaxed">{desc}</p >
    </div>
  );
}

export default function Home() {

  const [isClicked, setIsClicked] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 text-white relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px]"></div>

      <div className={`z-10 w-full max-w-4xl transition-all duration-1000 ease-in-out ${
        isClicked ? 'transform -translate-y-10' : 'text-center'
      }`}>
        
        <div className={`flex flex-col items-center ${isClicked ? 'md:flex-row md:justify-start gap-8' : ''}`}>
          
          <div 
            onClick={() => setIsClicked(!isClicked)}
            className={`cursor-pointer border-4 border-blue-400/50 rounded-full overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl ${
              isClicked ? 'w-24 h-24' : 'w-40 h-40 mb-6'
            }`}
          >
            < img 
              src="/logo1.png" 
              alt="Logo" 
              className="w-full h-full object-cover" 
            />
          </div>

          <div>
            <h1 className={`font-black tracking-tighter bg-gradient-to-r from-blue-400 to-yellow-300 bg-clip-text text-transparent transition-all duration-500 ${
              isClicked ? 'text-5xl' : 'text-7xl md:text-8xl'
            }`}>
              Lume
            </h1>
            {!isClicked && (
              <p className="mt-4 text-blue-200 text-lg font-light tracking-widest animate-bounce">
                点击 Logo 开启智能之旅
              </p >
            )}
          </div>
        </div>

        {isClicked && (
          <div className="mt-10 space-y-10 animate-[fadeIn_1s_ease-in]">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard icon="📚" title="知识库" desc="建立您的私人数字大脑。" />
              <FeatureCard icon="📄" title="智能解析" desc="支持 PDF、MD 等多种格式。" />
              <FeatureCard icon="💬" title="AI 对话" desc="基于您的文档精准问答。" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Link 
                href="/register" 
                className="px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all text-center"
              >
                立即开始
              </Link>
              <Link 
                href="/login" 
                className="px-10 py-4 border-2 border-blue-400/30 hover:bg-white/10 text-blue-100 font-bold rounded-xl transition-all text-center"
              >
                登录账号
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}