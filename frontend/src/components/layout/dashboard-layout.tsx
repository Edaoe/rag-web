"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { Book, MessageSquare, LogOut, Menu, User } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {

      router.push("/login");
    }
  }, [router]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };


  const navigation = [
    { name: "知识库", href: "/dashboard/knowledge", icon: Book },
    { name: "对话", href: "/dashboard/chat", icon: MessageSquare },
    { name: "API 密钥", href: "/dashboard/api-keys", icon: User },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      

      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-500">

        <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-blue-700/20 blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-64 h-64 rounded-full bg-yellow-600/20 blur-3xl"></div>
        

        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: i % 2 === 0 ? "#3b82f6" : "#fde047",
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>


      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>



      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-blue-600 text-white shadow-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>



      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-md border-r transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">

          <div className="flex h-20 items-center px-6 border-b">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">L</div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
              Lume Dashboard
            </span>
          </div>


          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {

              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>


          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              安全退出
            </button>
          </div>
        </div>
      </aside>



      <main className="lg:pl-64 relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 p-4 md:p-8">

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl min-h-full p-6 border border-white/20">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}