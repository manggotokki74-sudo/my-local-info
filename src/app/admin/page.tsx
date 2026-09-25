'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'bot' | 'system';
  text: string;
  sessionId?: string;
  timestamp?: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputReply, setInputReply] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('default');
  const [sessions, setSessions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const polledIds = useRef<Set<string>>(new Set());

  // 비밀번호 인증
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin1234') {
      setIsAuth(true);
      setAuthError('');
    } else {
      setAuthError('비밀번호가 올바르지 않습니다.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAuth) {
      scrollToBottom();
    }
  }, [messages, isAuth]);

  // 2초마다 /api/chat-poll 데이터 수신
  useEffect(() => {
    if (!isAuth) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/chat-poll');
        if (res.ok) {
          const data = await res.json();
          const list: any[] = Array.isArray(data)
            ? data
            : data.messages || (data.message ? [data] : []);

          const newSessionsSet = new Set<string>();

          list.forEach((msg) => {
            const sid = msg.sessionId || 'default';
            newSessionsSet.add(sid);

            const msgId = msg.id || `msg-${msg.timestamp || Date.now()}-${msg.text}`;
            if (!polledIds.current.has(msgId)) {
              polledIds.current.add(msgId);
              setMessages((prev) => [
                ...prev,
                {
                  id: msgId,
                  sender: msg.sender || msg.role || 'user',
                  text: msg.text || msg.message || '',
                  sessionId: sid,
                  timestamp: msg.timestamp || Date.now(),
                },
              ]);
            }
          });

          if (newSessionsSet.size > 0) {
            setSessions(Array.from(newSessionsSet));
          }
        }
      } catch (err) {
        console.error('Error polling admin chat:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [isAuth]);

  // 관리자 답장 보내기 (/api/chat-human)
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputReply.trim();
    if (!trimmed) return;

    const replyMsgId = `admin-reply-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: replyMsgId,
      sender: 'admin',
      text: trimmed,
      sessionId: selectedSessionId,
      timestamp: Date.now(),
    };

    polledIds.current.add(replyMsgId);
    setMessages((prev) => [...prev, newMsg]);
    setInputReply('');

    try {
      await fetch('/api/chat-human', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          sender: 'admin',
          sessionId: selectedSessionId,
        }),
      });
    } catch (err) {
      console.error('Error sending admin reply:', err);
    }
  };

  // 로그인되지 않은 경우 비밀번호 입력 화면
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
              👨‍💼
            </div>
            <h1 className="text-xl font-bold text-slate-800">상담 관리자 로그인</h1>
            <p className="text-xs text-slate-500 mt-1">
              실시간 문의 상담을 위해 비밀번호를 입력해 주세요.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                관리자 비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력 (admin1234)"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-red-500 font-medium">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-md"
            >
              접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 필터링된 메시지 (선택된 세션이 있는 경우 해당 세션 메시지, 아니면 전체)
  const filteredMessages =
    sessions.length > 0 && selectedSessionId !== 'default'
      ? messages.filter((m) => m.sessionId === selectedSessionId)
      : messages;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 헤더 */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg">
            👨‍💼
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">실시간 상담 관리자센터</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              2초 간격 실시간 동기화 중
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAuth(false)}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          로그아웃
        </button>
      </header>

      {/* 메인 컨테이너 */}
      <div className="flex-1 flex max-w-6xl w-full mx-auto p-4 gap-4 overflow-hidden">
        {/* 세션 목록 사이드바 */}
        {sessions.length > 0 && (
          <div className="w-64 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 shrink-0 flex flex-col">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              대화 목록 ({sessions.length})
            </h2>
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              <button
                onClick={() => setSelectedSessionId('default')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  selectedSessionId === 'default'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                💬 전체 대화 모아보기
              </button>

              {sessions.map((sid) => (
                <button
                  key={sid}
                  onClick={() => setSelectedSessionId(sid)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    selectedSessionId === sid
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">세션: {sid.substring(0, 12)}...</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 채팅 영역 */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* 채팅 영역 상단 바 */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>방문자 실시간 대화창</span>
            <span className="text-slate-400">총 {filteredMessages.length}개 메시지</span>
          </div>

          {/* 대화 내용 (말풍선) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                아직 수신된 문의 메시지가 없습니다.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isAdmin = msg.sender === 'admin';

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm mr-2 shrink-0 self-end mb-1">
                        👨‍💼
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-yellow-400 text-slate-900 font-medium rounded-2xl rounded-tr-none'
                          : isAdmin
                          ? 'bg-blue-600 text-white font-medium rounded-2xl rounded-tl-none'
                          : 'bg-slate-200 text-slate-800 rounded-2xl'
                      }`}
                    >
                      <div className="text-[10px] opacity-75 mb-0.5 font-bold">
                        {isUser ? '방문자 (User)' : '상담원 (Admin)'}
                      </div>
                      {msg.text}
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm ml-2 shrink-0 self-end mb-1">
                        👤
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 하단 관리자 답장 입력창 */}
          <form
            onSubmit={handleSendReply}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputReply}
              onChange={(e) => setInputReply(e.target.value)}
              placeholder="방문자에게 보낼 답장을 입력하세요..."
              className="flex-1 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputReply.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors shrink-0 focus:outline-none disabled:cursor-not-allowed shadow-xs"
            >
              답장 전송
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
