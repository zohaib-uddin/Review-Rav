import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-black font-display uppercase tracking-tight mt-3 text-black">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">Last updated: September 2026</p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-6 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">1. Information We Collect</h2>
            <p>
              When you visit Ravenza or place an order for our premium streetwear, we collect personal information such as your name, shipping address, phone number, email address, and order history to fulfill your purchases securely and communicate order confirmation details via phone call or WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">2. How We Use Your Information</h2>
            <p>
              Your data is used solely for processing orders, coordinating delivery across Pakistan, verifying Cash on Delivery (COD) or online payment transactions, and sending occasional exclusive drop notifications (if subscribed). We never sell or share your personal details with third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">3. Data Security</h2>
            <p>
              We implement industry-standard encryption and secure database protocols (Neon PostgreSQL with Firebase Authentication) to protect your personal account credentials and checkout records.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase tracking-wider mb-2">4. Contact Us</h2>
            <p>
              If you have any questions regarding your privacy or data, reach out to our support team at <a href="mailto:support@ravenza.pk" className="font-bold text-black underline">support@ravenza.pk</a> or WhatsApp us at +92 300 1234567.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
