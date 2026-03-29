"use client";

import { useEffect, useState, useRef } from "react";
import { MessageSquare, RefreshCw, Send, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import Pusher from "pusher-js";

interface Msg {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  isBot: boolean;
  createdAt: string;
}

export default function DiscordChatViewer({ orderId }: { orderId: string }) {   
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [discordChannelId, setDiscordChannelId] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/orders/${orderId}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data.ticketClosed) {
          setIsClosed(true);
        } else {
          if (data.messages) setMessages(data.messages);
          if (data.discordChannelId) setDiscordChannelId(data.discordChannelId);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending || isClosed) return;
    setIsSending(true);

    try {
      const res = await fetch(`/api/user/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputText })
      });

      if (res.ok) {
        // 先在前端樂觀加上去，避免網路延遲導致畫面卡頓
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, {
          id: tempId,
          content: `**[買家] 說：**\n${inputText}`,
          authorId: "user",
          authorName: "我",
          isBot: true, // 讓他套用使用者的樣式
          createdAt: new Date().toISOString()
        }]);

        setInputText("");
        
        // 捲動到底部
        setTimeout(() => {
          if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
          }
        }, 100);

        // 背景同步最新訊息
        await fetchMessages();
      } else {
        const data = await res.json();
        if (data.ticketClosed) setIsClosed(true);
        toast.error(data.error || "發送失敗");
      }
    } catch (error) {
      console.error(error);
      toast.error("發送發生錯誤！");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [orderId]);

  useEffect(() => {
    if (!discordChannelId) return;
    
    // 如果環境變數中沒有設定 Pusher，就 fallback 到 polling
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      const intervalId = setInterval(() => {
        fetchMessages();
      }, 10000);
      return () => clearInterval(intervalId);
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap3',
    });

    const channel = pusher.subscribe(`chat-${discordChannelId}`);
    
    channel.bind('new-message', (data: Msg) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 100);
    });

    channel.bind('ticket-closed', () => {
      setIsClosed(true);
    });

    return () => {
      pusher.unsubscribe(`chat-${discordChannelId}`);
    };
  }, [discordChannelId]);

  return (
    <div className="mt-4 border border-indigo-500/20 rounded-lg bg-indigo-500/5">
      <div className="bg-indigo-500/10 p-3 flex items-center justify-between border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-sm text-indigo-300">專人進度 (Discord 客服對話同步)</span>
        </div>
        <button onClick={fetchMessages} disabled={loading} className="text-indigo-400 hover:text-white transition p-1">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div ref={chatRef} className="p-4 max-h-60 overflow-y-auto space-y-3">
        {loading && messages.length === 0 && !isClosed ? (
          <p className="text-sm text-slate-400 text-center py-4">載入中...</p>
        ) : isClosed ? (
           <div className="flex flex-col items-center justify-center py-6 text-slate-400">
             <Lock className="w-8 h-8 mb-2 opacity-50" />
             <p className="text-sm font-medium">此客服票口已關閉或結案</p>
           </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">目前尚無人工回覆紀錄，您可以在下方留言給客服。</p>
        ) : (
          messages.map((m) => {
            const isUser = m.isBot && m.content.includes('說：**\n');
            const displayContent = isUser ? m.content.replace(/^.*?說：\*\*\n/g, '') : m.content;
            const alignClass = isUser ? 'items-end' : 'items-start';
            const bgClass = isUser ? 'bg-indigo-500/20 rounded-tr-sm text-right' : (m.isBot ? 'bg-primary/20 rounded-tl-sm' : 'bg-emerald-500/10 rounded-tl-sm');
            const nameText = isUser ? '我' : (m.isBot ? '系統/管理員' : m.authorName);
            const nameColor = isUser ? 'text-indigo-400' : (m.isBot ? 'text-primary' : 'text-emerald-400');
            return (
            <div key={m.id} className={`flex flex-col ${alignClass}`}>
              <span className={`text-[11px] font-bold mb-1 ${nameColor}`}>
                {nameText} <span className="opacity-50 text-[10px] font-normal font-mono">{new Date(m.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute:'2-digit' })}</span>
              </span>
              <div className={`text-sm px-3 py-2 rounded-xl text-slate-200 border border-white/10 ${bgClass} break-words whitespace-pre-wrap max-w-[90%]`}>
                {displayContent}
              </div>
            </div>
            );
          })
        )}
      </div>

      {!isClosed && (
        <div className="p-3 border-t border-indigo-500/20 bg-indigo-500/5 flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="傳送訊息給客服..." 
            disabled={isSending}
            className="flex-1 bg-black/40 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-400 focus:bg-black/60 transition-all disabled:opacity-50"
          />
          <button 
            onClick={handleSendMessage}
            disabled={isSending || !inputText.trim()}
            className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 hover:text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
