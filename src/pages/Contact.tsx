import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent!", { description: "We'll get back to you within 24 hours.", position: "top-center" });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <main>
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-primary-foreground/80">Have a question or need a quote? We're here to help.</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                <p className="text-muted-foreground">Whether you need product advice, bulk pricing, or have a general inquiry — our team is ready to assist.</p>
              </div>
              <div className="space-y-6">
                {[
                  { icon: Phone, label: "Phone", value: "1300 GRAPC" },
                  { icon: Mail, label: "Email", value: "info@grapc.com.au" },
                  { icon: MapPin, label: "Address", value: "Sydney, NSW, Australia" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6 md:p-8 rounded-2xl border bg-card">
              <h3 className="text-xl font-semibold mb-2">Send a Message</h3>
              <Input placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <Input placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
              <Textarea placeholder="Your Message" rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" size="lg">
                <Send className="h-4 w-4 mr-2" /> Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
