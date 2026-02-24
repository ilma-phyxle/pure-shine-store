import { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const FAQ: { keywords: string[]; answer: string }[] = [
  { keywords: ["shipping", "delivery", "ship"], answer: "We offer **free shipping** on orders over $150. Standard delivery takes **1–3 business days** across Australia." },
  { keywords: ["bulk", "wholesale", "volume", "discount"], answer: "We offer **competitive bulk pricing** for businesses. Contact us at sales@grapc.com.au or visit our [Contact page](/contact) for a custom quote." },
  { keywords: ["return", "refund", "exchange"], answer: "We accept returns within **30 days** of purchase for unopened products. Please contact our support team to arrange a return." },
  { keywords: ["payment", "pay", "card", "credit"], answer: "We accept **Visa, Mastercard, AMEX**, and bank transfers for bulk orders." },
  { keywords: ["hours", "open", "time", "available"], answer: "Our office hours are **Mon–Fri 8am–5pm AEST**. You can browse and order online 24/7." },
  { keywords: ["contact", "phone", "email", "reach"], answer: "📞 **1300 123 456**\n📧 sales@grapc.com.au\nOr visit our [Contact page](/contact)." },
  { keywords: ["product", "range", "sell", "stock", "category"], answer: "We stock **floor care, bathroom, kitchen, disinfectants, paper products, janitorial equipment, hand hygiene, laundry, glass & surface, waste management, outdoor**, and **specialty chemicals**. Browse our [Shop](/shop)!" },
  { keywords: ["eco", "green", "sustainable", "environment"], answer: "We carry a range of **eco-friendly cleaning products** that are biodegradable and sustainably sourced. Look for the 🌿 eco badge in our shop." },
  { keywords: ["quote", "custom"], answer: "For custom quotes on large orders, please visit our [Contact page](/contact) or email **sales@grapc.com.au** with your requirements." },
];

const GREETING = "👋 Hi! I'm the GRAPC assistant. Ask me about our products, shipping, bulk pricing, or anything else!";

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  for (const faq of FAQ) {
    if (faq.keywords.some((kw) => lower.includes(kw))) return faq.answer;
  }
  return "I'm not sure about that. For detailed help, please [contact our team](/contact) or call **1300 123 456**.";
}

export const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { role: "user", content: text };
    const answer = findAnswer(text);
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: answer }]);
    setInput("");
  };

  return (
    <>
      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/611300123456"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-[5.5rem] z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center bg-[#25D366] text-white hover:scale-110 transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* Chat FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          open ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground hover:scale-110"
        )}
        aria-label="Chat assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[480px] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-primary px-4 py-3 text-primary-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="font-bold text-sm">GRAPC Assistant</p>
                <p className="text-xs text-primary-foreground/70">Ask us anything</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[240px] max-h-[320px]">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline font-medium">$1</a>')
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button size="icon" onClick={send} className="rounded-lg shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
