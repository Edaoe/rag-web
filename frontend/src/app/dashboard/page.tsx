"use client";

import { useEffect, useState } from "react";


export default function MyDashboard() {

  const [stats, setStats] = useState({ knowledgeBases: 0, chats: 0 });


  useEffect(() => {

    const getData = async () => {
      try {

        const kbCount = 5;  
        const chatCount = 10; 

        setStats({
          knowledgeBases: kbCount,
          chats: chatCount,
        });
      } catch (error) {
        console.log("出错了：", error);
      }
    };

    getData();
  }, []); 


  return (
    <div style={{ padding: "20px", background: "#f0f2f5", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "32px", color: "#1e40af" }}>我的智能助手</h1>
      
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "10px", flex: 1 }}>
          <h3>📚 知识库总数</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.knowledgeBases}</p >
          <a href=" " style={{ color: "blue" }}>查看全部 →</a >
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "10px", flex: 1 }}>
          <h3>💬 进行中会话</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.chats}</p >
          <a href="/chat" style={{ color: "orange" }}>去聊天 →</a >
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <button style={{ 
          padding: "15px 30px", 
          background: "linear-gradient(to right, #2563eb, #eab308)",
          color: "white",
          border: "none",
          borderRadius: "50px",
          cursor: "pointer"
        }}>
          + 创建新知识库
        </button>
      </div>
    </div>
  );
}