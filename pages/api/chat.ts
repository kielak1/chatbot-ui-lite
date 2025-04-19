import type { NextApiRequest, NextApiResponse } from "next";
import { Message } from "@/types";
import { OpenAIStream } from "@/utils";

export const config = {
  api: {
    bodyParser: true,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("🔹 Żądanie odebrane:", req.method, req.url);

  // Nagłówki CORS — tymczasowo zezwalamy na wszystko
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method !== "POST") {
    console.warn("⛔ Niewłaściwa metoda:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body as { messages: Message[] };
    console.log("📩 Odebrane wiadomości:", messages);

    const charLimit = 12000;
    let charCount = 0;
    const messagesToSend: Message[] = [];

    for (const message of messages) {
      if (charCount + message.content.length > charLimit) break;
      charCount += message.content.length;
      messagesToSend.push(message);
    }

    console.log("📦 Wysyłane do OpenAI:", messagesToSend);

    const responseText = await OpenAIStream(messagesToSend);

    console.log("✅ Odpowiedź od OpenAI:", responseText);

    res.status(200).json({ content: responseText });
  } catch (error: any) {
    console.error("🔥 Błąd w handlerze:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
