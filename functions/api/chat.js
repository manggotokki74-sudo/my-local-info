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

    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for a Korean local information blog. Answer in Korean.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 300,
    });

    const replyText = aiResponse.response || aiResponse.text || JSON.stringify(aiResponse);

    return new Response(JSON.stringify({ response: replyText }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Failed to generate AI response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
