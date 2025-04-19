import { Message, OpenAIModel } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { PassThrough } from "stream";

export const OpenAIStream = async (messages: Message[]) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const stream = new PassThrough();

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
          content: `You are a helpful, friendly, assistant.`,
        },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.0,
      stream: true,
    }),
  });

  if (res.status !== 200) {
    const errorText = await res.text();
    console.error("OpenAI error:", errorText);
    throw new Error("OpenAI API returned an error");
  }

  const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
    if (event.type === "event") {
      const data = event.data;

      if (data === "[DONE]") {
        stream.end();
        return;
      }

      try {
        const json = JSON.parse(data);
        const text = json.choices?.[0]?.delta?.content;
        if (text) {
          stream.write(text);
        }
      } catch (e) {
        console.error("Parsing error:", e);
        stream.destroy(e);
      }
    }
  });

  for await (const chunk of res.body as any) {
    parser.feed(decoder.decode(chunk));
  }

  return stream;
};
