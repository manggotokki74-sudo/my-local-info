'use client';

import React, { useState, useRef, useEffect } from 'react';
import chatData from '../../chat-data.json';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '안녕하세요! 👋 부산나우 AI 상담원입니다. 궁금하신 내용은 아래 자주 묻는 질문 버튼을 눌러 확인해 주세요.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSelectQuestion = (question: string, answer: string) => {
    const userMsgId = `user-${Date.now()}`;
    const botMsgId = `bot-${Date.now()}`;

    // 1. 내 질문 추가
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: question },
    ]);

    // 2. 약간의 시간차 후 AI 답변 추가 (자연스러운 느낌)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, sender: 'bot', text: answer },
      ]);
    }, 300);
  };

  return (
    <>
      {/* 챗봇 창 */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col bg-white shadow-2xl overflow-hidden
          ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }
          /* 모바일: 전체 화면 */
          inset-0 w-full h-full rounded-none
          /* sm 이상: 우하단 팝업 (가로 360px, 세로 500px) */
          sm:inset-auto sm:bottom-24 sm:right-5 sm:w-[360px] sm:h-[500px] sm:rounded-2xl border border-slate-200
        `}
      >
        {/* 상단 헤더 */}
        <div className="bg-blue-600 text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-9 h-9 bg-white/20 rounded-full font-bold text-sm">
              🤖
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-600 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">AI 상담원</h3>
              <p className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                온라인 · 즉시 답변
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
            aria-label="채팅창 닫기"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 대화 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs mr-2 shrink-0 self-end mb-1">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[78%] px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 하단 질문 버튼 목록 */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <p className="text-[11px] font-semibold text-slate-400 mb-2 px-1">
            💡 자주 묻는 질문을 선택하세요
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {chatData.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuestion(item.question, item.answer)}
                className="w-full text-left text-xs bg-blue-50/80 hover:bg-blue-100 text-blue-700 active:bg-blue-200 border border-blue-200/60 py-2 px-3 rounded-xl transition-all duration-150 font-medium flex items-center justify-between group"
              >
                <span>{item.question}</span>
                <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  ›
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label={isOpen ? '채팅창 닫기' : '채팅창 열기'}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </>
  );
}
