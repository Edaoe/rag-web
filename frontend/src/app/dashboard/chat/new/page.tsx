"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, MessageSquare, ChevronLeft } from "lucide-react"; 
import DashboardLayout from "@/components/layout/dashboard-layout"; 
import { api } from "@/lib/api"; 
import { useToast } from "@/components/ui/use-toast";


interface KnowledgeBase {
  id: number;
  name: string;
  description: string;
}

export default function NewChatPage() {
  const router = useRouter();
  const { toast } = useToast();


  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]); 
  const [selectedKB, setSelectedKB] = useState<number | null>(null);         
  const [title, setTitle] = useState("");                                   
  const [isLoading, setIsLoading] = useState(true);                         
  const [isSubmitting, setIsSubmitting] = useState(false);            




  const fetchKBs = async () => {
    try {
      const data = await api.get("/api/knowledge-base");
      setKnowledgeBases(data);
    } catch (err) {
      toast({ title: "获取失败", description: "无法加载知识库列表", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKBs();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!selectedKB) {
      toast({ title: "提示", description: "请先选择一个知识库" });
      return;
    }

    setIsSubmitting(true);
    try {
      
      const data = await api.post("/api/chat", {
        title: title || "新对话",
        knowledge_base_ids: [selectedKB], 
      });


      router.push(`/dashboard/chat/${data.id}`);
    } catch (err) {
      toast({ title: "创建失败", description: "请检查网络后重试", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };




  if (isLoading) {
    return <DashboardLayout><div className="p-10 text-center">正在加载知识库...</div></DashboardLayout>;
  }

  if (knowledgeBases.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-20 p-8 border rounded-lg bg-white text-center shadow">
          <h2 className="text-2xl font-bold mb-4">没有可用的知识库</h2>
          <p className="text-gray-500 mb-6">您需要先创建一个知识库，AI 才能根据其内容回答问题。</p >
          <Link href="/dashboard/knowledge" className="bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center">
            <Plus className="mr-2 h-4 w-4" /> 去创建知识库
          </Link>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-10 px-4">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">开始新对话</h2>
          <p className="text-gray-500">选择一个知识库并给对话起个名字</p >
        </div>


        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
          

          <div className="space-y-2">
            <label className="text-sm font-medium">对话标题</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：关于项目合同的咨询"
              className="w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium">选择知识库</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeBases.map((kb) => (
                <div
                  key={kb.id}
                  onClick={() => setSelectedKB(kb.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedKB === kb.id 
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                    : "hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className={`h-4 w-4 ${selectedKB === kb.id ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="font-medium">{kb.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{kb.description || "暂无描述"}</p >
                </div>
              ))}
            </div>
          </div>


          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              返回
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedKB}
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "正在创建..." : "开始对话"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}