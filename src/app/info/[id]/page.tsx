import Link from "next/link";
import { notFound } from "next/navigation";
import localData from "../../../../public/data/local-info.json";

interface InfoItem {
  id: string;
  title: string;
  category: "행사" | "혜택";
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  description: string;
  link: string;
}

export function generateStaticParams() {
  const items = localData.items as InfoItem[];
  return items.map((item) => ({
    id: item.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InfoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const items = localData.items as InfoItem[];
  const item = items.find((i) => i.id === id);

  if (!item) {
    notFound();
  }

  const isEvent = item.category === "행사";

  return (
    <div className="min-h-screen flex flex-col bg-[#fffdf9] text-stone-800">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-amber-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-600 hover:text-amber-600 font-medium text-sm transition-colors"
          >
            <span>←</span>
            <span>목록으로 돌아가기</span>
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            성남시 생활 정보
          </span>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* 상단 뱃지 & 타이틀 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-md ${
                isEvent
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              {isEvent ? "🌸 행사 / 축제" : "💰 지원금 / 혜택"}
            </span>
            <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
              {item.startDate === item.endDate
                ? item.startDate
                : `${item.startDate} ~ ${item.endDate}`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight">
            {item.title}
          </h1>

          <p className="mt-3 text-stone-600 text-base sm:text-lg leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100/60">
            {item.summary}
          </p>
        </div>

        {/* 핵심 요약 메타 카드 (기간, 장소, 대상) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              📅 진행 기간 / 신청일
            </span>
            <p className="text-sm font-semibold text-stone-800">
              {item.startDate === item.endDate
                ? item.startDate
                : `${item.startDate} ~ ${item.endDate}`}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              📍 장소 / 해당 지역
            </span>
            <p className="text-sm font-semibold text-stone-800">{item.location}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              👥 참가 / 신청 대상
            </span>
            <p className="text-sm font-semibold text-stone-800">{item.target}</p>
          </div>
        </div>

        {/* 상세 설명 본문 */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <span>📋</span>
            <span>상세 안내 내용</span>
          </h2>

          <div className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-2">
            {item.description}
          </div>
        </div>

        {/* 하단 버튼 세트 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200/60">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm text-center transition-colors"
          >
            ← 목록으로 돌아가기
          </Link>

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full sm:w-auto px-8 py-3 rounded-xl text-white font-bold text-sm text-center shadow-md transition-all hover:scale-105 ${
                isEvent
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              }`}
            >
              자세히 보기 →
            </a>
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-stone-900 text-stone-400 mt-16 border-t border-stone-800 py-8 text-center text-xs">
        <p>© 2026 성남시 생활 정보 · 데이터 출처: 공공데이터포털(data.go.kr)</p>
      </footer>
    </div>
  );
}
