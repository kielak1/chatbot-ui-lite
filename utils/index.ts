import { Message, OpenAIModel } from "@/types";

export const OpenAIStream = async (messages: Message[]) => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: OpenAIModel.DAVINCI_TURBO,
      messages: [
        {
          role: "system",
          content: `You are a helpful, friendly assistant.`,
        },
        ...messages,
      ],
      temperature: 0.1,
      stream: true,
    }),
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.replace("data: ", "");
        if (jsonStr === "[DONE]") break;

        const json = JSON.parse(jsonStr);
        const content = json.choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
        }
      }
    }
  }

  return fullText || "Brak odpowiedzi.";
};
