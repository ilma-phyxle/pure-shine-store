import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";
import { blogPosts } from "@/components/home/BlogPreviewSection";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);
  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  if (!post) {
    return (
      <main className="py-20">
        <div className="container text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <Button asChild>
            <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <AnimatedSection>
          <Link
            to="/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Blog
          </Link>

          <span className="inline-block text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-3 py-1 mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {post.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readTime}</span>
          </div>

          <div className="aspect-[2/1] rounded-2xl overflow-hidden mb-10">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <article className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Maintaining a clean and hygienic environment is essential for any business or home. At GRAPC, we understand the importance of using the right products for every cleaning challenge. Whether you're managing a large commercial space or keeping your home spotless, having access to professional-grade cleaning supplies makes all the difference.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our range of products is specifically designed to meet Australian standards and deliver exceptional results. From eco-friendly solutions to heavy-duty industrial cleaners, we stock everything you need to maintain the highest levels of cleanliness and hygiene.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Browse our <Link to="/shop" className="text-primary hover:underline">complete product range</Link> or <Link to="/contact" className="text-primary hover:underline">contact our team</Link> for personalised recommendations.
            </p>
          </article>
        </AnimatedSection>

        {otherPosts.length > 0 && (
          <AnimatedSection className="mt-16 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group block rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="aspect-[3/2] overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
};

export default BlogPost;
