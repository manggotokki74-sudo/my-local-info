import Link from "next/link";
import localData from "../../public/data/local-info.json";

interface InfoItem {
  id: string;
  title: string;
  category: "행사" | "혜택";
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

export default function HomePage() {
  const { lastUpdated, items } = localData as {
    lastUpdated: string;
    items: InfoItem[];
  };

  const events = items.filter((item) => item.category === "행사");
  const benefits = items.filter((item) => item.category === "혜택");

  return (
    <div className="min-h-screen flex flex-col bg-[#fffdf9] text-stone-800">
      {/* 1. 상단 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-amber-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500 text-white font-bold text-xl shadow-md shadow-amber-200 group-hover:scale-105 transition-transform">
              🏡
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-amber-950 tracking-tight group-hover:text-amber-600 transition-colors">
                성남시 생활 정보
              </h1>
              <p className="text-xs text-amber-700 font-medium">우리 동네 행사 & 지원금 한눈에</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              성남시 실시간
            </span>
          </div>
        </div>
      </header>

      {/* 히어로 바너 */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50/40 border-b border-amber-100 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center md:text-left md:flex md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-amber-200/60 text-amber-900 mb-3">
              ✨ 2026년 최신 소식
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
              놓치면 아까운 <span className="text-amber-600 underline decoration-amber-300 decoration-wavy underline-offset-4">우리 동네 축제</span>와 <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy underline-offset-4">지원금 혜택</span>
            </h2>
            <p className="mt-2 text-stone-600 text-sm sm:text-base">
              공공데이터포털 공식 연동을 통해 매일 새롭게 업데이트되는 성남시의 소식을 전해드립니다.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-wrap gap-3 justify-center">
            <a
              href="#events"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-200 transition-all hover:scale-105"
            >
              🎉 이번 달 행사 보기
            </a>
            <a
              href="#benefits"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all hover:scale-105"
            >
              💰 지원금 혜택 보기
            </a>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* 2. 이번 달 행사/축제 카드 목록 */}
        <section id="events" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌸</span>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                  이번 달 행사 & 축제
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                성남시에서 펼쳐지는 즐거운 문화 행사와 축제 일정입니다.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
              총 {events.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((item) => (
              <article
                key={item.id}
                className="group bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                      {item.category}
                    </span>
                    <span className="text-xs text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded">
                      📅 {item.startDate === item.endDate ? item.startDate : `${item.startDate} ~ ${item.endDate}`}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-2">
                    <Link href={`/info/${item.id}`}>
                      {item.title}
                    </Link>
                  </h4>

                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-500">
                  <div className="flex items-start gap-1.5">
                    <span className="shrink-0 text-amber-500">📍</span>
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="shrink-0 text-amber-500">👥</span>
                    <span className="truncate">{item.target}</span>
                  </div>

                  <Link
                    href={`/info/${item.id}`}
                    className="mt-3 block w-full text-center py-2 rounded-xl bg-stone-50 hover:bg-amber-500 text-stone-700 hover:text-white font-semibold text-xs transition-colors"
                  >
                    상세 정보 보기 →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. 지원금/혜택 정보 카드 목록 */}
        <section id="benefits" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                  지원금 & 혜택 소식
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                청년, 출산, 복지 등 성남시민을 위한 든든한 맞춤 혜택입니다.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
              총 {benefits.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((item) => (
              <article
                key={item.id}
                className="group bg-white rounded-2xl border border-emerald-100/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.category}
                    </span>
                    <span className="text-xs text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded">
                      신청 기간: {item.startDate} ~ {item.endDate}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors mb-2">
                    <Link href={`/info/${item.id}`}>
                      {item.title}
                    </Link>
                  </h4>

                  <p className="text-xs sm:text-sm text-stone-600 mb-4 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-emerald-50/80 space-y-2 text-xs text-stone-600 bg-emerald-50/30 p-3 rounded-xl">
                  <div className="flex items-start gap-1.5">
                    <span className="shrink-0 font-bold text-emerald-600">대상:</span>
                    <span>{item.target}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="shrink-0 font-bold text-emerald-600">지역:</span>
                    <span>{item.location}</span>
                  </div>

                  <Link
                    href={`/info/${item.id}`}
                    className="mt-3 block w-full text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-200 transition-colors"
                  >
                    상세 혜택 보기 →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* 4. 하단 푸터 */}
      <footer className="bg-stone-900 text-stone-400 mt-16 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-lg">🏡</span>
                <span className="text-white font-bold text-base">성남시 생활 정보</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                지역 주민들을 위한 맞춤형 행정, 문화, 지원금 소식을 자동으로 수집하여 제공합니다.
              </p>
            </div>

            <div className="text-xs space-y-1 text-stone-400">
              <p className="flex items-center justify-center md:justify-end gap-1">
                <span>🏛️ 데이터 출처:</span>
                <span className="text-amber-400 font-semibold">공공데이터포털(data.go.kr)</span>
              </p>
              <p className="flex items-center justify-center md:justify-end gap-1">
                <span>📅 마지막 업데이트:</span>
                <span className="text-stone-300 font-medium">{lastUpdated}</span>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-800 text-center text-xs text-stone-500">
            © {new Date().getFullYear()} 성남시 생활 정보. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
