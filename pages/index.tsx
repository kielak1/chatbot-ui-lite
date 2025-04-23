// pages/index.tsx
import { Chat } from "@/components/Chat/Chat";
import { Footer } from "@/components/Layout/Footer";
import { Navbar } from "@/components/Layout/Navbar";
import { Message } from "@/types";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (message: Message) => {
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullText },
      ]);
    } catch (error: any) {
      alert(`Wystąpił błąd: ${error.message}`);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleReset = () => setMessages([]);

  useEffect(() => scrollToBottom(), [messages]);

  return (
    <>
      <Head>
        <title>Czat Lite</title>
        <meta name="description" content="OpenAI chat streaming app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto max-w-6xl p-4 sm:p-8">
        <Navbar />
        <Chat
          messages={messages}
          loading={loading}
          onSend={handleSend}
          onReset={handleReset}
        />
        <div ref={messagesEndRef} />
        <Footer />
      </main>
    </>
  );
}
