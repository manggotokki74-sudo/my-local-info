import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  if (slugs.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fffdf9] text-stone-800">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-amber-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-stone-600 hover:text-amber-600 font-medium text-sm transition-colors"
          >
            <span>←</span>
            <span>블로그 목록으로</span>
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            성남시 생활 블로그
          </span>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <article className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-10 shadow-sm">
          {/* 상단 포스트 메타 */}
          <div className="border-b border-stone-100 pb-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                {post.category}
              </span>
              <span className="text-xs text-stone-500 font-medium bg-stone-100 px-2.5 py-1 rounded-md">
                📅 {post.date}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight mb-4">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100/60 font-medium">
                {post.summary}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
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
          </div>

          {/* 마크다운 렌더링 본문 */}
          <div className="prose prose-amber max-w-none text-stone-800 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </article>

        {/* 하단 돌아가기 버튼 */}
        <div className="pt-4 border-t border-stone-200/60">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition-colors"
          >
            <span>←</span>
            <span>블로그 목록으로 돌아가기</span>
          </Link>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-stone-900 text-stone-400 mt-16 border-t border-stone-800 py-8 text-center text-xs">
        <p>© {new Date().getFullYear()} 성남시 생활 정보 · 블로그</p>
      </footer>
    </div>
  );
}
