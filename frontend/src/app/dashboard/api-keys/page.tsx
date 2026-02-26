"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Check, List, Trash2 } from "lucide-react"; 
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api"; 


export interface APIKey {
  id: number;
  name: string;
  key: string;
  is_active: boolean;
}

export default function APIKeysPage() {

  const [apiKeys, setApiKeys] = useState<APIKey[]>([]); 
  const [newKeyName, setNewKeyName] = useState("");     
  const [isLoading, setIsLoading] = useState(true);     
  const [copiedId, setCopiedId] = useState<number | null>(null); 
  
  const { toast } = useToast(); 



  const fetchAPIKeys = async () => {
    try {
      const data = await api.get("/api/api-keys");
      setApiKeys(data); 
    } catch (error) {
      toast({ title: "错误", description: "获取数据失败", variant: "destructive" });
    } finally {
      setIsLoading(false); 
    }
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast({ title: "提示", description: "名字不能为空哦" });
      return;
    }
    try {
      const data = await api.post("/api/api-keys", { name: newKeyName, is_active: true });
      setApiKeys([...apiKeys, data]); 
      setNewKeyName(""); 
      toast({ title: "成功", description: "创建了一个新密钥" });
    } catch (error) {
      toast({ title: "错误", description: "创建失败", variant: "destructive" });
    }
  };

  const deleteAPIKey = async (id: number) => {
    try {
      await api.delete(`/api/api-keys/${id}`);
      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast({ title: "成功", description: "删除成功" });
    } catch (error) {
      toast({ title: "错误", description: "删除失败" });
    }
  };


  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/api/api-keys/${id}`, { is_active: !currentStatus });

      setApiKeys(apiKeys.map(k => k.id === id ? { ...k, is_active: !currentStatus } : k));
    } catch (error) {
      toast({ title: "更新状态失败" });
    }
  };


  const copyKey = async (id: number, key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id); 
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "已复制", description: "可以去粘贴了" });
  };


  useEffect(() => {
    fetchAPIKeys();
  }, []);


  return (
    <DashboardLayout>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">我的 API 密钥</h1>


        <div className="flex gap-4 mb-8 bg-gray-50 p-4 rounded-lg border">
          <Input 
            placeholder="为你的密钥起个名字..." 
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <Button onClick={createAPIKey}>
            <Plus className="mr-2 h-4 w-4" /> 创建新密钥
          </Button>
        </div>


        {isLoading ? (
          <p>正在拼命加载数据中...</p >
        ) : (
          <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4">名称</th>
                  <th className="p-4">密钥内容</th>
                  <th className="p-4">状态</th>
                  <th className="p-4 text-right">管理</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4 font-mono text-sm text-gray-500">
                      {item.key.substring(0, 8)}...{item.key.slice(-4)}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(item.id, item.is_active)}
                        className={`px-3 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {item.is_active ? "已开启" : "已禁用"}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyKey(item.id, item.key)}>
                        {copiedId === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteAPIKey(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {apiKeys.length === 0 && <div className="p-10 text-center text-gray-400">目前还没有任何密钥。</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}