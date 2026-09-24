import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-black font-display uppercase tracking-tight mt-3 text-black">
            Return & Exchange Policy
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">Last updated: September 2026</p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-6 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">1. Eligibility for Return & Exchange</h2>
            <p>
              We offer Return & Exchange on eligible regular products within 7 days of delivery, provided the item is unworn, unwashed, and has original tags attached.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">2. Minor or Last Collection (Final Sale)</h2>
            <p>
              Products listed under the <strong>MINOR OR LAST</strong> collection are final sale and are strictly non-returnable and non-exchangeable. These include minor fault/imperfect items or last remaining old stock offered at 40%–80% off.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">3. Shipping Charges for Returns</h2>
            <p>
              Standard delivery charges for returns or exchanges apply unless the item delivered had a verified manufacturing defect. Standard flat delivery across Pakistan is Rs. 260.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">4. Initiation</h2>
            <p>
              To initiate a return or exchange, contact our support team via WhatsApp at +92 300 1234567 or email <a href="mailto:support@ravenza.pk" className="font-bold text-black underline">support@ravenza.pk</a> with your order number.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
