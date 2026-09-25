function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/#+\s+/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/---/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const message = body.message || body.question || "";

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Fetch /data/search-index.json
    let contextText = "";
    try {
      const indexUrl = new URL(request.url).origin + "/data/search-index.json";
      const indexRes = await fetch(indexUrl);
      if (indexRes.ok) {
        const indexData = await indexRes.json();

        // 질문을 단어로 분리
        const keywords = message
          .toLowerCase()
          .replace(/[^\w\s가-힣]/g, "")
          .split(/\s+/)
          .filter((k) => k.length > 0);

        // 각 항목별 키워드 매칭 점수 계산
        const scoredItems = indexData.map((item) => {
          const searchText = [
            item.title || "",
            item.summary || "",
            item.content || "",
            item.category || "",
          ]
            .join(" ")
            .toLowerCase();

          let score = 0;
          keywords.forEach((kw) => {
            if (searchText.includes(kw)) {
              score += 1;
            }
          });

          return { item, score };
        });

        // 점수가 높은 상위 3개 항목 선택 (score > 0 인 항목 우선)
        const topItems = scoredItems
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((x) => x.item);

        if (topItems.length > 0) {
          contextText = topItems
            .map(
              (item, idx) =>
                `${idx + 1}. 제목: ${item.title}\n요약: ${
                  item.summary || item.content || ""
                }`
            )
            .join("\n\n");
        }
      }
    } catch (err) {
      console.error("Error fetching search index:", err);
    }

    // 2. Build system prompt
    const systemPrompt = `You are an AI assistant for a Korean local information blog.
Answer ONLY in Korean. Keep answers to 2-3 sentences maximum.
Do NOT use any markdown symbols (**, *, #, -). Plain text only.
Base your answer ONLY on the following blog data. If not relevant, reply: 해당 내용은 블로그에서 확인이 어렵습니다. 다른 질문을 해주세요.

[블로그 데이터]
${contextText || "관련 정보 없음"}`;

    // 3. Workers AI Call
    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 150,
    });

    const rawReply =
      aiResponse.response || aiResponse.text || JSON.stringify(aiResponse);
    const cleanReply = stripMarkdown(rawReply);

    return new Response(JSON.stringify({ response: cleanReply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate AI response",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
