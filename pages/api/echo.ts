import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false, // żeby można było ręcznie czytać body
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // CORS — na wszelki wypadek
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
      return res.status(200).end(); // CORS preflight
    }

    // Odczyt body ręcznie jako buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks).toString("utf-8");

    let parsedBody: any = null;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = null; // nie udało się sparsować jako JSON
    }

    res.status(200).json({
      method: req.method,
      headers: req.headers,
      parsedBody,
      rawBody,
    });
  } catch (error: any) {
    console.error("Echo handler error:", error);
    res.status(500).json({
      error: "Echo handler failed",
      message: error?.message || "Unknown error",
    });
  }
}
