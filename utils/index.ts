import { Message, OpenAIModel } from "@/types";

export const OpenAIStream = async (messages: Message[]) => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: OpenAIModel.DAVINCI_TURBO, // lub np. "gpt-3.5-turbo"
      messages: [
        {
          role: "system",
          content: `You are a helpful, friendly assistant.`,
        },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.0,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("OpenAI error:", errorText);
    throw new Error("OpenAI API returned an error");
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  return text || "Brak odpowiedzi.";
};
