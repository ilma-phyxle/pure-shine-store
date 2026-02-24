import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
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
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          open ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground hover:scale-110"
        )}
        aria-label="Chat assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[480px] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-primary px-4 py-3 text-primary-foreground">
            <p className="font-bold text-sm">GRAPC Assistant</p>
            <p className="text-xs text-primary-foreground/70">Ask us anything</p>
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
