import { Link } from "react-router-dom";

const ShippingPolicy = () => {
  return (
    <main>
      <section className="bg-primary py-16 lg:py-24 border-b border-white/5">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground tracking-tight">
              Shipping Policy
            </h1>
            <p className="text-primary-foreground/70 text-sm md:text-base max-w-xl mx-auto">
              Free Shipping Offer - Victoria Metro/Geelong Only
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-4xl mx-auto">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-8">
            <div>
              <p className="text-sm text-foreground">
                We are pleased to offer free shipping across Victoria Metro for all orders over $100 (AUD).
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Order Processing and Delivery Times</h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
                <li>All orders are typically processed and dispatched within 1-2 business days.</li>
                <li>Delivery times vary depending on your location and the items ordered.</li>
                <li>Orders that do not meet the free shipping threshold will be charged standard rates.</li>
                <li>Standard shipping applies to all regional or remote areas outside eligible metro zones, regardless of order value.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Delays or Delivery Issues</h2>
              <p className="text-sm text-foreground">
                If there are any unexpected delays or issues with your order, our customer service team will contact you promptly with updates.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
              <p className="text-sm text-foreground">
                If you have any questions regarding shipping, please reach out to our friendly team: info@cleanyglow.co.au
              </p>
              <div className="mt-4">
                <Link to="/contact" className="text-primary font-semibold underline">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ShippingPolicy;