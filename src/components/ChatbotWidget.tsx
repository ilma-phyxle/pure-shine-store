import { useState, useRef, useEffect, useMemo } from "react";
import { X, Send, Bot, RotateCcw, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import catalogData from "@/cleaners_outlet_catalog.json";

type Message = { role: "user" | "assistant"; content: string };

type CatalogProduct = {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  category_slug?: string;
  subcategory?: string;
  tags?: string[];
  description?: string;
};

type CatalogCategory = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  products?: CatalogProduct[];
};

const CATEGORIES: CatalogCategory[] = (catalogData as { categories?: CatalogCategory[] }).categories ?? [];
const ALL_PRODUCTS: CatalogProduct[] = CATEGORIES.flatMap((c) => c.products ?? []);
const CATEGORY_NAME_MAP = new Map(CATEGORIES.map((c) => [c.name.toLowerCase(), c]));

const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["shipping", "delivery", "ship"],
    answer: "Happy to help! We offer **free shipping** on orders over $150. Standard delivery is **1-3 business days** across Australia.",
  },
  {
    keywords: ["bulk", "wholesale", "volume", "discount"],
    answer: "Great question. We offer **competitive bulk pricing** for businesses. Reach us at sales@ .com.au or use our [Contact page](/contact) and we'll put together a custom quote.",
  },
  {
    keywords: ["return", "refund", "exchange"],
    answer: "No worries. We accept returns within **30 days** of purchase for unopened products. Contact our support team and we'll sort it out.",
  },
  {
    keywords: ["payment", "pay", "card", "credit"],
    answer: "You can pay with **Visa, Mastercard, AMEX**, and we also accept bank transfers for bulk orders.",
  },
  {
    keywords: ["hours", "open", "time", "available"],
    answer: "We're open **Mon-Fri 8am-5pm AEST**, and you can browse and order online anytime.",
  },
  {
    keywords: ["contact", "phone", "email", "reach"],
    answer: "Here's the best way to reach us:\nPhone: **+61 416 163 126**\nEmail: info@cleanyglow.lk\nOr pop over to our [Contact page](/contact).",
  },
  {
    keywords: ["product", "range", "sell", "stock", "category"],
    answer: "We stock **floor care, bathroom, kitchen, disinfectants, paper products, janitorial equipment, hand hygiene, laundry, glass & surface, waste management, outdoor**, and **specialty chemicals**. Browse our [Shop](/shop) anytime!",
  },
  {
    keywords: ["eco", "green", "sustainable", "environment"],
    answer: "Yes! We carry **eco-friendly cleaning products** that are biodegradable and sustainably sourced. Look for the eco badge in our shop.",
  },
  {
    keywords: ["quote", "custom"],
    answer: "For a custom quote on large orders, use our [Contact page](/contact) or email **info@cleanyglow.lk** and we'll take care of it.",
  },
];

const GREETING = "Hi there! I'm your CleanyGlow AI assistant. What can I help you with today?";

const STOP_WORDS = new Set(["the", "a", "an", "and", "or", "to", "in", "of", "for", "with", "on", "at", "by", "from"]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOP_WORDS.has(t));
}

function formatCategoryTree(category: CatalogCategory): string {
  const subMap = new Map<string, CatalogProduct[]>();
  for (const product of category.products ?? []) {
    const key = (product.subcategory || "Other").trim();
    if (!subMap.has(key)) subMap.set(key, []);
    subMap.get(key)!.push(product);
  }

  const subcats = Array.from(subMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const lines: string[] = [
    `Here's a quick look at **${category.name}**:`,
    category.description ? category.description : "",
    "Subcategories:",
  ].filter(Boolean);

  const maxSubcats = 4;
  const maxProducts = 3;

  subcats.slice(0, maxSubcats).forEach(([subcat, products]) => {
    lines.push(`- ${subcat} (${products.length})`);
    products.slice(0, maxProducts).forEach((p) => {
      lines.push(`  - ${p.name}`);
    });
    if (products.length > maxProducts) lines.push("  - ...");
  });

  if (subcats.length > maxSubcats) lines.push("- ...");

  return lines.join("\n");
}

type QuickReply = {
  id: string;
  label: string;
  href?: string;
  action: "category" | "back" | "link" | "keyword";
  value?: string;
};

function getCategoryShopLink(category: CatalogCategory): string {
  const key = category.slug || category.name;
  return `/shop?cat=${encodeURIComponent(key)}`;
}

function listCategories(): string {
  if (!CATEGORIES.length) return "No categories found.";
  const lines = ["Here are some popular categories:", ...CATEGORIES.slice(0, 8).map((c) => `- ${c.name} (${c.products?.length ?? 0})`)];
  if (CATEGORIES.length > 8) lines.push("- ...");
  lines.push("Type a category name and I'll show a product tree.");
  return lines.join("\n");
}

function findCategoryFromInput(input: string): CatalogCategory | undefined {
  const lower = input.toLowerCase();
  for (const [name, category] of CATEGORY_NAME_MAP.entries()) {
    if (lower.includes(name)) return category;
  }
  return undefined;
}

function searchProducts(input: string): string | null {
  const tokens = tokenize(input);
  if (!tokens.length) return null;

  const matches = ALL_PRODUCTS.filter((p) => {
    const hay = `${p.name} ${p.category_name} ${p.subcategory ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase();
    return tokens.some((t) => hay.includes(t));
  }).slice(0, 6);

  if (!matches.length) return null;

  const lines = ["Matching products:", ...matches.map((p) => `- ${p.name} (${p.category_name}${p.subcategory ? ` / ${p.subcategory}` : ""})`)];
  lines.push("Want a category view? Just type the category name and I'll show a product tree.");
  return lines.join("\n");
}

function findAnswer(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("category") || lower.includes("categories")) {
    return listCategories();
  }

  const matchedCategory = findCategoryFromInput(input);
  if (matchedCategory) {
    return formatCategoryTree(matchedCategory);
  }

  if (lower.includes("product") || lower.includes("products") || lower.includes("catalog")) {
    const productMatch = searchProducts(input);
    if (productMatch) return productMatch;
    return "Tell me a product keyword (example: degreaser, disinfectant, floor care) or a category name, and I'll show you a product tree.";
  }

  const keywordSearch = searchProducts(input);
  if (keywordSearch) return keywordSearch;

  for (const faq of FAQ) {
    if (faq.keywords.some((kw) => lower.includes(kw))) return faq.answer;
  }
  return "I'm not sure about that yet. For detailed help, please [contact our team](/contact) or call **+61 416 163 126**.";
}

type ViewState =
  | { type: "root" }
  | { type: "category"; categoryId: string };

export const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [view, setView] = useState<ViewState>({ type: "root" });
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

  const quickReplies = useMemo<QuickReply[]>(() => {
    if (!CATEGORIES.length) return [];

    if (view.type === "root") {
      return CATEGORIES.slice(0, 6).map<QuickReply>((c) => ({
        id: c.id,
        label: c.name,
        action: "category",
        value: c.id,
      }));
    }

    const category = CATEGORIES.find((c) => c.id === view.categoryId);
    if (!category) return [];

    const subcats = Array.from(
      new Set((category.products ?? []).map((p) => p.subcategory || "Other"))
    ).slice(0, 5);

    return [
      ...subcats.map<QuickReply>((s) => ({
        id: `${category.id}-${s}`,
        label: s,
        action: "keyword",
        value: s,
      })),
      {
        id: "shop-category",
        label: "View Category",
        action: "link",
        href: getCategoryShopLink(category),
      },
      { id: "back", label: "Back", action: "back" },
    ];
  }, [view]);

  const handleQuickReply = (reply: QuickReply) => {
    if (reply.action === "back") {
      setView({ type: "root" });
      setMessages((prev) => [...prev, { role: "assistant", content: "Sure. Pick a category below." }]);
      return;
    }

    if (reply.action === "link" && reply.href) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Opening **${reply.label}**.` },
      ]);
      return;
    }

    if (reply.action === "category" && reply.value) {
      const category = CATEGORIES.find((c) => c.id === reply.value);
      if (!category) return;
      setView({ type: "category", categoryId: category.id });
      setMessages((prev) => [
        ...prev,
        { role: "user", content: category.name },
        { role: "assistant", content: formatCategoryTree(category) },
      ]);
      return;
    }

    if (reply.action === "keyword" && reply.value) {
      const userMsg: Message = { role: "user", content: reply.value };
      const answer = findAnswer(reply.value);
      setMessages((prev) => [...prev, userMsg, { role: "assistant", content: answer }]);
    }
  };

  return (
    <>
      <a
        href="https://wa.me/61416163126"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-[4.5rem] sm:right-[5.5rem] z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg flex items-center justify-center bg-[#25D366] text-white hover:scale-110 transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          open ? "bg-[#1c224f] text-white" : "bg-[#ffcc00] text-[#1c224f] hover:scale-110"
        )}
        aria-label="Chat assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[380px] max-h-[70vh] sm:max-h-[520px] rounded-2xl border border-white/10 bg-[#262b5a] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-[#1c224f] px-4 py-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#ffcc00] text-[#1c224f] flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide">CleanyGlow AI SUPPORT</p>
                <p className="text-xs text-white/70 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Active now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <button
                onClick={() => {
                  setMessages([{ role: "assistant", content: GREETING }]);
                  setView({ type: "root" });
                }}
                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                aria-label="Restart chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[260px] max-h-[360px] text-white">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-[#ffcc00] text-[#1c224f] rounded-br-sm"
                      : "bg-white/10 text-white rounded-bl-sm"
                  )}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline font-medium">$1</a>')
                      .replace(/\n/g, "<br/>")
                  }}
                />
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {quickReplies.length > 0 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {quickReplies.map((reply) => {
                const isBack = reply.action === "back";
                const isLink = reply.action === "link";
                const content = (
                  <span className="flex items-center gap-2">
                    {isBack && <ArrowLeft className="h-4 w-4" />}
                    {reply.label}
                    {isLink && <ExternalLink className="h-4 w-4" />}
                  </span>
                );
                if (isLink && reply.href) {
                  return (
                    <a
                      key={reply.id}
                      href={reply.href}
                      className="px-4 py-2 rounded-full border border-[#ffcc00] text-[#ffcc00] text-xs font-semibold uppercase tracking-wide hover:bg-[#ffcc00] hover:text-[#1c224f] transition-colors"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {content}
                    </a>
                  );
                }
                return (
                  <button
                    key={reply.id}
                    onClick={() => handleQuickReply(reply)}
                    className="px-4 py-2 rounded-full border border-[#ffcc00] text-[#ffcc00] text-xs font-semibold uppercase tracking-wide hover:bg-[#ffcc00] hover:text-[#1c224f] transition-colors"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-white/10 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border border-[#ffcc00]/40 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-[#ffcc00]/40"
            />
            <Button size="icon" onClick={send} className="rounded-full shrink-0 bg-[#ffcc00] text-[#1c224f] hover:bg-[#ffd633]">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
