import type { NextApiRequest, NextApiResponse } from "next";
import { Message } from "@/types";
import { OpenAIStream } from "@/utils";

export const config = {
  api: {
    bodyParser: true,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body as { messages: Message[] };

    const charLimit = 12000;
    let charCount = 0;
    const messagesToSend: Message[] = [];

    for (const message of messages) {
      if (charCount + message.content.length > charLimit) break;
      charCount += message.content.length;
      messagesToSend.push(message);
    }

    const responseText = await OpenAIStream(messagesToSend);

    res.status(200).json({ content: responseText });
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
