export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { message, sender = "user" } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const timestamp = Date.now();
    const key = `msg_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
    const data = { id: key, message, sender, timestamp };

    // Cloudflare KV (CHAT_KV) 저장
    if (env.CHAT_KV) {
      await env.CHAT_KV.put(key, JSON.stringify(data));
    }

    return new Response(JSON.stringify({ success: true, item: data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to save message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
