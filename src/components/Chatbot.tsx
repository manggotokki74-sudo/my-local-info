'use client';

import React, { useState, useRef, useEffect } from 'react';
import chatData from '../../chat-data.json';

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'admin' | 'system';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '안녕하세요! 👋 (멍멍) AI 상담원입니다. 궁금하신 내용을 질문 버튼으로 선택하거나 직접 입력해 주세요!',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const polledMsgIds = useRef<Set<string>>(new Set(['welcome']));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, isHumanMode]);

  // 상담원 대기 모드 시 2초마다 /api/chat-poll 호출
  useEffect(() => {
    if (!isOpen || !isHumanMode) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat-poll?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          // API 응답 데이터가 배열이거나 { messages: [...] } 형태인 경우 모두 지원
          const newMessagesList: any[] = Array.isArray(data)
            ? data
            : data.messages || (data.message ? [data] : []);

          newMessagesList.forEach((msg) => {
            if (msg && (msg.sender === 'admin' || msg.role === 'admin')) {
              const msgId = msg.id || `admin-${msg.timestamp || Date.now()}-${msg.text}`;
              if (!polledMsgIds.current.has(msgId)) {
                polledMsgIds.current.add(msgId);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: msgId,
                    sender: 'admin',
                    text: msg.text || msg.message || '',
                  },
                ]);
              }
            }
          });
        }
      } catch (err) {
        console.error('Error polling chat:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isOpen, isHumanMode, sessionId]);

  // 상담원 연결 모드로 전환
  const handleConnectHuman = () => {
    setIsHumanMode(true);
    const systemMsgId = `sys-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: systemMsgId,
        sender: 'system',
        text: '🎧 상담원 연결 요청이 전달되었습니다. 상담원이 연결될 때까지 문의사항을 메시지로 남겨주세요.',
      },
    ]);
  };

  // 자주 묻는 질문 클릭 처리
  const handleSelectQuestion = (question: string, answer: string) => {
    if (isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: question },
    ]);

    if (!isHumanMode) {
      const botMsgId = `bot-${Date.now()}`;
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: botMsgId, sender: 'bot', text: answer },
        ]);
      }, 300);
    } else {
      // 상담원 모드 시 질문 클릭도 상담원 채널로 전송
      sendToHumanApi(question);
    }
  };

  // 상담원 채널 (/api/chat-human) 전송
  const sendToHumanApi = async (textToSend: string) => {
    try {
      await fetch('/api/chat-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          sessionId: sessionId,
          sender: 'user',
        }),
      });
    } catch (err) {
      console.error('Error sending human message:', err);
    }
  };

  // AI 채널 (/api/chat) 전송
  const sendToAiApi = async (textToSend: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const botAnswer = data.response || data.text || '답변을 생성하지 못했습니다.';

      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, sender: 'bot', text: botAnswer },
      ]);
    } catch (err) {
      console.error('AI chat error:', err);
      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: '죄송합니다. AI 답변을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 전송 핸들러
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputQuery.trim();
    if (!trimmed || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: trimmed },
    ]);
    setInputQuery('');

    if (isHumanMode) {
      sendToHumanApi(trimmed);
    } else {
      sendToAiApi(trimmed);
    }
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
        <div
          className={`px-4 py-3.5 flex items-center justify-between shadow-md shrink-0 transition-colors ${
            isHumanMode
              ? 'bg-blue-600 text-white'
              : 'bg-yellow-400 text-slate-900'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`relative flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm ${
                isHumanMode ? 'bg-white/20' : 'bg-slate-900/10'
              }`}
            >
              {isHumanMode ? '🎧' : '🐶'}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {isHumanMode ? '실시간 상담원 연결' : '(멍멍)'}
              </h3>
              <p
                className={`text-[11px] flex items-center gap-1 mt-0.5 font-medium ${
                  isHumanMode ? 'text-blue-100' : 'text-slate-700'
                }`}
              >
                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                {isHumanMode ? '상담원 대기 중' : '온라인 · 즉시 답변'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-1.5 rounded-full transition-colors focus:outline-none ${
              isHumanMode ? 'hover:bg-white/10' : 'hover:bg-slate-900/10'
            }`}
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
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded-xl text-center max-w-[90%] leading-relaxed font-medium">
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isUser = msg.sender === 'user';
            const isAdmin = msg.sender === 'admin';

            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2 shrink-0 self-end mb-1 ${
                      isAdmin ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}
                  >
                    {isAdmin ? '👨‍💼' : '🐶'}
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-yellow-400 text-slate-900 font-medium rounded-2xl rounded-tr-none'
                      : isAdmin
                      ? 'bg-blue-600 text-white font-medium rounded-2xl rounded-tl-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* AI 로딩 스피너 표시 */}
          {isLoading && !isHumanMode && (
            <div className="flex justify-start items-center">
              <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center text-xs mr-2 shrink-0">
                🐶
              </div>
              <div className="bg-white text-slate-500 border border-slate-200/80 px-4 py-2.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-slate-400">생각 중...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 하단 질문 선택 + 상담원 연결 + 직접 입력 영역 */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-semibold text-slate-400">
              💡 자주 묻는 질문 선택
            </p>
            {!isHumanMode && (
              <button
                onClick={handleConnectHuman}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>🎧 상담원 연결</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {chatData.map((item, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSelectQuestion(item.question, item.answer)}
                className="w-full text-left text-xs bg-amber-50/80 hover:bg-amber-100 text-amber-900 active:bg-amber-200 border border-amber-200/60 py-2 px-3 rounded-xl transition-all duration-150 font-medium flex items-center justify-between group disabled:opacity-50"
              >
                <span>{item.question}</span>
                <span className="text-amber-500 group-hover:translate-x-0.5 transition-transform">
                  ›
                </span>
              </button>
            ))}
          </div>

          {/* 직접 질문 입력창 */}
          <form
            onSubmit={handleFormSubmit}
            className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                isHumanMode
                  ? '상담원에게 문의할 내용을 입력하세요...'
                  : '질문을 직접 입력해 보세요...'
              }
              disabled={isLoading}
              className="flex-1 text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className={`${
                isHumanMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-slate-900'
              } font-bold p-2 rounded-xl transition-colors shrink-0 focus:outline-none disabled:bg-slate-200 disabled:cursor-not-allowed`}
              aria-label="질문 전송"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 ${
          isHumanMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300'
            : 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 focus:ring-yellow-200'
        }`}
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
