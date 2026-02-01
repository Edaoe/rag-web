"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  
  const [error, setError] = useState("");      // 错误信息
  const [loading, setLoading] = useState(false); // 加载状态

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      console.log("尝试登录:", { username, password });
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      localStorage.setItem("token", "my-secret-token");
      router.push("/dashboard");
    } catch (err) {
      setError("登录失败，请检查账号密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-500">
      
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl"></div>

      <div className="absolute top-6 left-6">
        <Link href="/" className="text-white bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all">
          ← 返回首页
        </Link>
      </div>

      <div className="w-full max-w-md px-4">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
          
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-300 to-yellow-300 bg-clip-text text-transparent mb-2">
              Lume
            </h1>
            <p className="text-gray-200">欢迎回来，请登录您的账号</p >
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-200 mb-2 ml-1">用户名</label>
              <input
                name="username"
                type="text"
                required
                className="w-full px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label className="block text-gray-200 mb-2 ml-1">密码</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                placeholder="请输入密码"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-100 p-3 rounded-xl text-sm border border-red-500/30">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl text-white font-bold text-lg hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "正在连接服务..." : "立即登录"}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-300">
            还没有账户？
            <Link href="/register" className="ml-2 text-yellow-300 hover:underline font-semibold">
              点击注册
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}