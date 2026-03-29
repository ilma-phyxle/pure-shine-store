import { Link } from "react-router-dom";

const CancellationPolicy = () => {
  return (
    <main>
      <section className="bg-primary py-16 lg:py-24 border-b border-white/5">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground tracking-tight">
              Cancellation Policy
            </h1>
            <p className="text-primary-foreground/70 text-sm md:text-base max-w-xl mx-auto">
              Returns, replacements, and your rights under Australian Consumer Law
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-4xl mx-auto">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-3">Australian Consumer Law</h2>
              <p className="text-sm text-foreground">
                Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or replaced if the goods fail to be of acceptable quality and the failure does not amount to a major failure.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Major Failure</h2>
              <p className="text-sm text-foreground mb-3">A product or good has a major failure when:</p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
                <li>it has a problem that would have stopped someone from buying it if they'd known about it;</li>
                <li>it is significantly different from the sample or description;</li>
                <li>it is substantially unfit for its common purpose and can't easily be fixed within a reasonable time;</li>
                <li>it doesn't do what you asked for and can't easily be fixed within a reasonable time; or</li>
                <li>it creates a safety risk.</li>
              </ul>
              <p className="text-sm text-foreground mt-3">
                Importantly, the rights described in this policy are in addition to the statutory rights to which you may be entitled under the Australian Consumer Law and other applicable Australian consumer protection laws and regulations.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Refunds</h2>
              <p className="text-sm text-foreground">
                Please note there may be limitations on your right to return and obtain a refund for products, however these limits will always be subject to your statutory rights.
              </p>
              <p className="text-sm text-foreground mt-3">
                Refunds will not be available in any circumstances. If you are not satisfied with any item that you receive from us, you may be entitled to return that item to us in accordance with the below.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Returns</h2>
              <p className="text-sm text-foreground">Replacement or credit as remedy</p>
              <p className="text-sm text-foreground mt-3">
                If you are not satisfied with any item that you receive from us, please let us know as soon as possible as we may be able to replace the item for you. In some circumstances, we may provide a credit instead of replacement at our discretion.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">What You Must Return to Us</h2>
              <p className="text-sm text-foreground">
                To receive a replacement or credit, you must first return the item to us along with its original packaging.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Returning Items Within the First 30 Days</h2>
              <p className="text-sm text-foreground mb-3">
                If we receive the returned item, or written notice from you that you will be returning the item, within the first 30 days after the earlier of the date of purchase and the date of delivery to you, then we will assess the circumstances (including analysing the returned item, if considered appropriate by us) to ascertain whether or not the Company is at fault and:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
                <li>(Company at fault) if we consider that the Company is at fault, we will provide a full replacement of the returned item (or a credit at our discretion); or</li>
                <li>(Company not at fault) if we consider that the Company is not at fault, then:</li>
                <li>if the item has been returned in its original condition, we will provide a full replacement of the returned item (or a credit at our discretion); or</li>
                <li>if the item has been returned broken, damaged, tarnished or worn, we will not provide any replacement or credit.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Returning Items After the First 30 Days</h2>
              <p className="text-sm text-foreground mb-3">
                If we do not receive the returned item, or written notice from you that you will be returning the item, within the first 30 days after the earlier of the date of purchase and the date of delivery to you, then we will assess the circumstances (including analysing the returned item if considered appropriate by us) to ascertain whether or not the Company is at fault and:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
                <li>(Company at fault) if we consider that the Company is at fault, we will provide a full replacement of the returned item (or a credit at our discretion); or</li>
                <li>(Company not at fault) if we consider that the Company is not at fault, then no replacement or credit will be provided. The Company may, however, choose to provide a replacement or credit in some cases at its discretion.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
              <p className="text-sm text-foreground">
                If you have any questions regarding cancellations or returns, please reach out to our friendly team: info@cleanyglow.co.au
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

export default CancellationPolicy;
