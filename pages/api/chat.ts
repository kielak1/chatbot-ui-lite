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

    const stream = await OpenAIStream(messages);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    stream.on("data", (chunk) => {
      res.write(chunk);
    });

    stream.on("end", () => {
      res.write("data: [DONE]\n\n");
      res.end();
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end();
    });
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
