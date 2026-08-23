"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Car,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";

interface ParknexAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "CUSTOMER" | "ADMIN";
  activeBooking?: any;
  facilityStats?: any;
  availableSlots?: any[];
  recentAnomalies?: any[];
  userEmail?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  confidence?: number;
  sources?: string[];
  timestamp: string;
}

export default function ParknexAssistantModal({
  isOpen,
  onClose,
  userRole = "CUSTOMER",
  activeBooking,
  facilityStats,
  availableSlots,
  recentAnomalies,
  userEmail,
}: ParknexAssistantModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text:
        userRole === "CUSTOMER"
          ? "Hello! I am ParkNex AI, your parking intelligence assistant. How can I help you today? You can ask where your vehicle is parked, check your active duration, or find available spaces near your destination."
          : "Hello Operator! I am ParkNex AI. You can ask for real-time facility metrics, zone occupancy distribution, or pending anomaly review summaries.",
      confidence: 1.0,
      sources: ["ParkNex Knowledge Base"],
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts =
    userRole === "CUSTOMER"
      ? [
          "Where is my car?",
          "How long have I been parked?",
          "Find parking near the food court",
          "Is my parking session active?",
        ]
      : [
          "How many vehicles are currently parked?",
          "Show today's anomalies",
          "Show unresolved AI reviews",
          "Which parking spaces are available?",
        ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/rocketride/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          userRole,
          userEmail,
          context: {
            activeBooking,
            facilityStats,
            availableSlots: availableSlots || [],
            recentAnomalies: recentAnomalies || [],
            vehicleNumber: activeBooking?.vehicleNumber,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to query ParkNex AI.");
      }

      const resData = data.data;
      const asstMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: "assistant",
        text: resData.answer,
        confidence: resData.confidence,
        sources: resData.sources,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "I couldn't verify that information from the current ParkNex live records.",
        confidence: 0.5,
        sources: ["Anti-Hallucination Guard"],
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#FFFFFF] rounded-2xl border border-[#DED3C7] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[#241F1B]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#DED3C7] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C93B2F] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-[16px] text-[#241F1B]">
                  Park<span className="text-[#C93B2F]">Nex</span> AI Assistant
                </span>
                <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-[#F9E3DE] text-[#C93B2F] uppercase border border-[#C93B2F]/20">
                  Grounded LLM
                </span>
              </div>
              <span className="text-[11.5px] text-[#70675F]">
                Pipeline: parknex-assistant.pipe
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#70675F] hover:text-[#241F1B] hover:bg-[#EDE1D4] transition-colors cursor-pointer"
            aria-label="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col gap-4 bg-[#FFFFFF]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.sender === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-[13.5px] leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#C93B2F] text-white rounded-tr-xs"
                    : "bg-[#FAF7F2] border border-[#DED3C7] text-[#241F1B] rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.sender === "assistant" && m.confidence && (
                  <div className="mt-2.5 pt-2 border-t border-[#DED3C7] flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-[#70675F] font-mono">
                    <span className="flex items-center gap-1 text-[#2F7D5A] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {(m.confidence * 100).toFixed(0)}% Fact-Checked Confidence
                    </span>
                    {m.sources && m.sources.length > 0 && (
                      <span className="truncate max-w-[180px]">
                        Src: {m.sources.join(", ")}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-[#241F1B] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-2xl p-3 text-[13px] text-[#70675F] flex items-center gap-2">
                <span>Querying ParkNex RocketRide Intelligence…</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-[#FAF7F2] border-t border-[#DED3C7] flex items-center gap-2 overflow-x-auto">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[11.5px] font-bold text-[#70675F] hover:text-[#C93B2F] hover:border-[#C93B2F] transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-[#FFFFFF] border-t border-[#DED3C7] flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              userRole === "CUSTOMER"
                ? "Ask about your parking session, car location, or rates..."
                : "Ask about facility occupancy, anomalies, or AI runs..."
            }
            className="flex-1 h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#241F1B] text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="h-11 px-4 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
}
