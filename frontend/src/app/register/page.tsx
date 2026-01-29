"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validate = (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    let isOk = true;
    const newErrors = { email: "", password: "", confirmPassword: "" };

    if (!email.includes("@")) {
      newErrors.email = "邮箱格式不正确";
      isOk = false;
    }

    if (password.length < 8) {
      newErrors.password = "密码至少要8位";
      isOk = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "两次密码输入不一致";
      isOk = false;
    }

    setValidationErrors(newErrors);
    return isOk;
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setError(""); 
    
    const formData = new FormData(e.currentTarget);
    
    if (!validate(formData)) return;

    setLoading(true);
    try {

      await api.post("/api/auth/register", {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      });

      router.push("/login");
    } catch (err) {

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("注册出错了，请稍后再试");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-md border border-white/20">
        
        <h1 className="text-3xl font-bold text-white text-center mb-8">用户注册</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="text-white block mb-2">用户名</label>
            <input 
              name="username" 
              required 
              className="w-full p-3 rounded bg-white/20 text-white outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>


          <div>
            <label className="text-white block mb-2">邮箱</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full p-3 rounded bg-white/20 text-white outline-none focus:ring-2 focus:ring-blue-400"
            />
            {validationErrors.email && <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p >}
          </div>


          <div>
            <label className="text-white block mb-2">密码</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full p-3 rounded bg-white/20 text-white outline-none focus:ring-2 focus:ring-blue-400"
            />
            {validationErrors.password && <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p >}
          </div>


          <div>
            <label className="text-white block mb-2">确认密码</label>
            <input 
              name="confirmPassword" 
              type="password" 
              required 
              className="w-full p-3 rounded bg-white/20 text-white outline-none focus:ring-2 focus:ring-blue-400"
            />
            {validationErrors.confirmPassword && <p className="text-red-400 text-sm mt-1">{validationErrors.confirmPassword}</p >}
          </div>


          {error && <div className="bg-red-500/20 text-red-200 p-3 rounded text-center">{error}</div>}


          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? "注册中..." : "立即注册"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-300">
          已有账户？ <Link href="/login" className="text-yellow-400 hover:underline">去登录</Link>
        </div>
      </div>
    </main>
  );
}