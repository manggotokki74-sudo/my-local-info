export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const filterSender = url.searchParams.get("sender");

    let messages = [];

    if (env.CHAT_KV) {
      // KV에서 'msg_' 접두사 키 목록 가져오기
      const list = await env.CHAT_KV.list({ prefix: "msg_" });
      const keys = list.keys || [];

      // 각 키의 메시지 데이터 읽기
      const itemPromises = keys.map(async (keyObj) => {
        const raw = await env.CHAT_KV.get(keyObj.name);
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      });

      const items = await Promise.all(itemPromises);
      messages = items.filter((item) => item !== null);

      // 시간 순서(오름차순) 정렬
      messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    }

    // sender 파라미터 존재 시 해당 발신자 메시지만 필터링
    if (filterSender) {
      messages = messages.filter((m) => m.sender === filterSender);
    }

    return new Response(JSON.stringify({ messages }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to poll messages" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
