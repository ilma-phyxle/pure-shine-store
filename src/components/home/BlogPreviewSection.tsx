import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import blogOffice from "@/assets/blog/office-cleaning.jpg";
import blogEco from "@/assets/blog/eco-cleaning.jpg";
import blogFloor from "@/assets/blog/floor-care-guide.jpg";
import blogKitchen from "@/assets/blog/kitchen-hygiene.jpg";
import blogHand from "@/assets/blog/hand-hygiene.jpg";
import blogSupplies from "@/assets/blog/supplies-guide.jpg";

export const blogPosts = [
  {
    slug: "office-cleaning-best-practices",
    title: "Office Cleaning Best Practices for 2025",
    excerpt: "Learn the essential cleaning routines and products that keep modern offices hygienic, productive, and compliant with health standards.",
    image: blogOffice,
    category: "Commercial",
    date: "Feb 20, 2026",
    readTime: "5 min read",
  },
  {
    slug: "eco-friendly-cleaning-guide",
    title: "The Complete Guide to Eco-Friendly Cleaning",
    excerpt: "Discover sustainable cleaning products that are gentle on the environment without compromising on cleaning power.",
    image: blogEco,
    category: "Sustainability",
    date: "Feb 15, 2026",
    readTime: "7 min read",
  },
  {
    slug: "commercial-floor-care-guide",
    title: "Commercial Floor Care: From Polishing to Scrubbing",
    excerpt: "A comprehensive guide to maintaining different floor types in commercial settings with the right equipment and chemicals.",
    image: blogFloor,
    category: "Floor Care",
    date: "Feb 10, 2026",
    readTime: "6 min read",
  },
  {
    slug: "kitchen-hygiene-standards",
    title: "Kitchen Hygiene Standards for Australian Restaurants",
    excerpt: "Essential hygiene protocols and cleaning supplies every commercial kitchen needs to pass health inspections.",
    image: blogKitchen,
    category: "Kitchen",
    date: "Feb 5, 2026",
    readTime: "8 min read",
  },
  {
    slug: "hand-hygiene-workplace",
    title: "Hand Hygiene in the Workplace: A Complete Guide",
    excerpt: "Why proper hand hygiene is critical for workplace health and which sanitisation products work best.",
    image: blogHand,
    category: "Hygiene",
    date: "Jan 28, 2026",
    readTime: "4 min read",
  },
  {
    slug: "essential-cleaning-supplies",
    title: "Essential Cleaning Supplies Every Business Needs",
    excerpt: "A checklist of must-have cleaning products and equipment for maintaining any commercial space.",
    image: blogSupplies,
    category: "Guides",
    date: "Jan 20, 2026",
    readTime: "6 min read",
  },
];

const BlogCard = ({ post }: { post: typeof blogPosts[0] }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
  >
    <div className="aspect-[3/2] overflow-hidden">
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    <div className="p-4 sm:p-5 space-y-2 sm:space-y-3 flex flex-col flex-1">
      <span className="inline-block self-start text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-3 py-1">
        {post.category}
      </span>
      <h3 className="font-semibold text-base sm:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
        {post.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{post.excerpt}</p>
      <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground pt-1">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
      </div>
    </div>
  </Link>
);

export const BlogPreviewSection = () => {
  const [current, setCurrent] = useState(0);
  const displayPosts = blogPosts.slice(0, 6);
  const maxIndex = displayPosts.length - 1;

  const next = useCallback(() => setCurrent((c) => (c >= maxIndex ? 0 : c + 1)), [maxIndex]);
  const prev = useCallback(() => setCurrent((c) => (c <= 0 ? maxIndex : c - 1)), [maxIndex]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary">Cleaning Tips & Guides</h2>
              <p className="text-muted-foreground">Expert advice to keep your space spotless.</p>
            </div>
            <Link
              to="/blog"
              className="hidden md:inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View All Articles <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>

        {/* Desktop: grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.slice(0, 3).map((post, i) => (
            <AnimatedSection key={post.slug} delay={i * 0.1}>
              <BlogCard post={post} />
            </AnimatedSection>
          ))}
        </div>

        {/* Mobile: slideshow */}
        <div className="sm:hidden relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-400 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {displayPosts.map((post) => (
                <div key={post.slug} className="w-full flex-shrink-0 px-1">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1.5">
              {displayPosts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to article ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="h-9 w-9 rounded-full border bg-card flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Previous article"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="h-9 w-9 rounded-full border bg-card flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Next article"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
          >
            View All Articles <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
