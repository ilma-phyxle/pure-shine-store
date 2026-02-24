import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { blogPosts } from "@/components/home/BlogPreviewSection";

const Blog = () => {
  return (
    <main className="py-12 md:py-20">
      <div className="container">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Cleaning Tips & Guides</h1>
            <p className="text-muted-foreground text-lg">
              Expert advice, industry insights, and practical guides to help you maintain spotless spaces.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <AnimatedSection key={post.slug} delay={i * 0.08}>
              <Link
                to={`/blog/${post.slug}`}
                className="group block rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
              >
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <span className="inline-block text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-3 py-1">
                    {post.category}
                  </span>
                  <h2 className="font-semibold text-xl leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Blog;
