"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MessageSquare, Trash2, Search } from "lucide-react"; 
import DashboardLayout from "@/components/layout/dashboard-layout"; 
import { api } from "@/lib/api"; 
import { useToast } from "@/components/ui/use-toast"; 


interface Chat {
  id: number;
  title: string;
  created_at: string;
  messages: { content: string }[]; 
}

export default function ChatListPage() {

  const [chats, setChats] = useState<Chat[]>([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isLoading, setIsLoading] = useState(true); 
  const { toast } = useToast();


  const fetchChats = async () => {
    try {
      const data = await api.get("/api/chat");
      setChats(data);
    } catch (error) {
      toast({ title: "加载失败", description: "无法获取对话记录", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这段对话吗？")) return; 

    try {
      await api.delete(`/api/chat/${id}`);

      setChats(chats.filter((chat) => chat.id !== id));
      toast({ title: "成功", description: "对话已删除" });
    } catch (error) {
      toast({ title: "失败", description: "删除对话时出错了" });
    }
  };


  useEffect(() => {
    fetchChats();
  }, []);


  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">您的对话</h1>
            <p className="text-sm text-gray-500">查看并管理您的所有聊天记录</p >
          </div>
          <Link
            href="/dashboard/chat/new"
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="mr-2 h-4 w-4" /> 开启新对话
          </Link>
        </div>

    
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索对话标题..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

    
        {isLoading ? (
          <p className="text-center text-gray-500 py-10">正在加载您的对话...</p >
        ) : filteredChats.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChats.map((chat) => (
              <div key={chat.id} className="relative group bg-white border rounded-xl p-5 hover:shadow-md transition">
                <Link href={`/dashboard/chat/${chat.id}`} className="block">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-semibold truncate">{chat.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(chat.created_at).toLocaleDateString()}
                      </p >
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => handleDelete(chat.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (

          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">还没找到相关对话</p >
            <Link href="/dashboard/chat/new" className="text-blue-600 font-medium hover:underline mt-2 inline-block">
              现在就开始第一次对话吧！
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}