import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "블로그 | 성남시 생활 정보",
  description: "성남시 생활 정보 관련 최신 소식 및 정보 블로그입니다.",
};

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen flex flex-col bg-[#fffdf9] text-stone-800">
      {/* 헤더 네비게이션 */}
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
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-stone-600 hover:text-amber-600 transition-colors"
            >
              홈으로
            </Link>
            <Link
              href="/blog"
              className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200"
            >
              📝 블로그
            </Link>
          </nav>
        </div>
      </header>

      {/* 메인 히어로 */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50/40 border-b border-amber-100 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-amber-200/60 text-amber-900 mb-3">
            📝 성남시 생활 블로그
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
            성남시의 알찬 정보와 <span className="text-amber-600 underline decoration-amber-300 decoration-wavy underline-offset-4">새로운 소식</span>
          </h2>
          <p className="mt-2 text-stone-600 text-sm sm:text-base">
            다양한 주제의 생활 팁, 행정 정보, 문화 이야기를 전해드립니다.
          </p>
        </div>
      </section>

      {/* 블로그 포스트 목록 */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <span className="text-4xl block mb-3">📄</span>
            <h3 className="text-lg font-bold text-stone-700">등록된 블로그 글이 없습니다.</h3>
            <p className="text-xs text-stone-500 mt-1">곧 유익한 포스트가 업데이트될 예정입니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    {post.category}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    📅 {post.date}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-stone-900 group-hover:text-amber-600 transition-colors mb-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {post.summary}
                </p>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <span>본문 읽기</span>
                    <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-stone-900 text-stone-400 mt-16 border-t border-stone-800 py-8 text-center text-xs">
        <p>© {new Date().getFullYear()} 성남시 생활 정보 · 블로그</p>
      </footer>
    </div>
  );
}
