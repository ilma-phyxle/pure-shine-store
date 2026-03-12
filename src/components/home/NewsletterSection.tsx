import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Thanks for subscribing!", description: "You'll receive our latest deals and updates." });
    setEmail("");
  };

  return (
    <section className="py-16 md:py-20 bg-card border-y">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto">
            <Mail className="h-7 w-7 text-secondary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Stay Updated with  </h2>
          <p className="text-muted-foreground">
            Subscribe to our newsletter for exclusive deals, new products, and cleaning tips delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
