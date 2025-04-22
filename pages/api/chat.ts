// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Message } from "@/types";
import { OpenAIStream } from "@/utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const buffers: Buffer[] = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const rawBody = Buffer.concat(buffers).toString("utf-8");
    const { messages } = JSON.parse(rawBody) as { messages: Message[] };

    const stream = await OpenAIStream(messages);

    if (!stream) {
      return res.status(500).send("Brak odpowiedzi.");
    }

    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.replace("data: ", "").trim();
          if (jsonStr === "[DONE]") break;

          try {
            const json = JSON.parse(jsonStr);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              res.write(content);
            }
          } catch (err) {
            console.warn("⚠️ Błąd parsowania JSON z OpenAI:", line);
            continue;
          }
        }
      }
    }

    res.end();
  } catch (error: any) {
    console.error("🔥 Błąd w handlerze:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
