import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createContactMessage } from "@/lib/api";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createContactMessage(formData);
      
      toast.success("Message sent successfully!", { 
        description: "We'll get back to you as soon as possible.", 
        position: "top-center" 
      });
      
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message", {
        description: "Please try again later or contact us directly via email.",
        position: "top-center"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <section className="bg-primary py-16 lg:py-24 border-b border-white/5">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground tracking-tight">
              Contact Us
            </h1>
            <p className="text-primary-foreground/70 text-sm md:text-base max-w-xl mx-auto">
              Have a question or need a quote? We're here to help.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                <p className="text-sm text-primary mt-3">
                  View our <Link to="/shipping-policy" className="font-semibold underline">Shipping Policy</Link>.
                </p>
                <p className="text-muted-foreground">Whether you need product advice, bulk pricing, or have a general inquiry — our team is ready to assist.</p>
              </div>
              <div className="space-y-6">
                {[
                  { icon: Phone, label: "Phone", value: " +61 416 163 126  " },
                  { icon: Mail, label: "Email", value: "info@cleanyglow.co.au" },
                  { icon: MapPin, label: "Address", value: "Tarneit, VIC, Australia" },
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
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="pb-16 md:pb-24">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-primary">Find Us</h2>
          <div className="rounded-2xl overflow-hidden border shadow-sm aspect-[16/7]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100782.72777178714!2d144.60744662495116!3d-37.8286958448938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad68979313b73e5%3A0x5045675218cd8d0!2sTarneit%20VIC%2C%20Australia!5e0!3m2!1sen!2sau!4v1710424900000!5m2!1sen!2sau"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location - Tarneit, VIC, Australia"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
