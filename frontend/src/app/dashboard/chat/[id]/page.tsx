"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User } from "lucide-react"; 
import { useChat } from "ai/react"; 
import DashboardLayout from "@/components/layout/dashboard-layout"; 
import { api } from "@/lib/api"; 
import { useToast } from "@/components/ui/use-toast";
import { Answer } from "@/components/chat/answer";


interface Message {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null); 


  const {
    messages,        
    input,           
    handleInputChange, 
    handleSubmit,    
    isLoading,       
    setMessages,     
  } = useChat({
    api: `/api/chat/${params.id}/messages`, 

    headers: {
      Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
    },
  });


  const fetchHistory = async () => {
    try {

      const data = await api.get(`/api/chat/${params.id}`);

      const history = data.messages.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
      }));
      setMessages(history);
    } catch (error) {
      toast({ title: "获取失败", description: "无法加载之前的聊天记录", variant: "destructive" });
    }
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {
    fetchHistory();
  }, []);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] relative bg-white">
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"} items-start space-x-2`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs">AI</div>
              )}

              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "assistant" 
                ? "bg-gray-100 text-gray-800" 
                : "bg-blue-600 text-white"
              }`}>
                {message.role === "assistant" ? (
                  <Answer markdown={message.content} />
                ) : (
                  message.content
                )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start space-x-1 p-2">
              <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t p-4 flex items-center space-x-2 bg-white absolute bottom-0 left-0 right-0"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="问问我任何问题..."
            className="flex-1 h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white p-2 rounded-md disabled:opacity-50 hover:bg-blue-700 transition"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}