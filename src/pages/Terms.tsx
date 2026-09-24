import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-black font-display uppercase tracking-tight mt-3 text-black">
            Terms & Conditions
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">Last updated: September 2026</p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-6 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">1. Overview</h2>
            <p>
              Welcome to Ravenza. By accessing our website and purchasing our streetwear products, you agree to be bound by these Terms & Conditions. Please read them carefully before placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">2. Orders & Phone Confirmation</h2>
            <p>
              Once an order is placed on Ravenza, our Customer Support Team will contact you via phone call or WhatsApp to confirm your order details. Your order will be processed and dispatched only after successful confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">3. Online Payment & COD Discounts</h2>
            <p>
              We offer a 10% discount on online payments (capped at Rs. 500). Cash on Delivery (COD) is also available across all major cities and regions in Pakistan.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">4. Pricing & Product Availability</h2>
            <p>
              All prices are listed in Pakistani Rupees (PKR). We reserve the right to update prices, modify drops, or correct pricing errors at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">5. Intellectual Property</h2>
            <p>
              All designs, graphics, brand names, logos, and imagery displayed on Ravenza are the exclusive property of Ravenza and protected under copyright laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
