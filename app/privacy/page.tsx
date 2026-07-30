import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Brizee Bri Luxe Hair Studio' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="font-cormorant italic text-[#ffabdd] font-bold text-base leading-none">B</span>
          </div>
          <span className="text-white text-xs font-semibold hidden sm:block">Brizee Bri Luxe Hair Studio</span>
        </Link>
        <Link href="/book" className="bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all">
          Request an Appointment
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-cormorant text-5xl font-semibold text-[#ffabdd] mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">Effective date: July 1, 2025</p>

        <div className="prose prose-invert max-w-none space-y-10 text-white/70 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. Who We Are</h2>
            <p>
              Brizee Bri Luxe Hair Studio ("we," "us," or "our") is a professional hair braiding studio based in Pflugerville, TX.
              This Privacy Policy explains how we collect, use, and protect information you provide when using our website at{' '}
              <span className="text-[#ffabdd]">brizeebri.com</span> or when communicating with us.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Information We Collect</h2>
            <p className="mb-3">When you submit a booking request or contact us, we collect:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Your full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Preferred appointment date and time</li>
              <li>Style preferences and notes you provide</li>
              <li>Inspiration photos you choose to upload</li>
              <li>Payment method preference</li>
            </ul>
            <p className="mt-3">
              We do not collect payment card details directly — any card payments are processed securely through Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Review and respond to your appointment requests</li>
              <li>Confirm, reschedule, or follow up on bookings</li>
              <li>Send you appointment reminders and updates via text message or email</li>
              <li>Process deposits and payments</li>
              <li>Maintain our business records</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. SMS Text Messaging</h2>
            <p className="mb-3">
              By providing your phone number and checking the SMS consent box during booking, you agree to receive text messages from
              Brizee Bri Luxe Hair Studio. These messages may include:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Booking confirmations and appointment updates</li>
              <li>Appointment reminders</li>
              <li>Follow-up messages from your stylist</li>
              <li>Studio announcements or promotions (infrequent)</li>
            </ul>
            <p className="mt-3">
              Message frequency varies. Standard message and data rates may apply.
            </p>
            <p className="mt-3">
              <strong className="text-white">To opt out:</strong> Reply <strong className="text-white">STOP</strong> to any text message at any time. You will receive a confirmation and no further messages.
            </p>
            <p className="mt-3">
              <strong className="text-white">For help:</strong> Reply <strong className="text-white">HELP</strong> or contact us at{' '}
              <a href="mailto:brizeebri@gmail.com" className="text-[#ffabdd] underline">brizeebri@gmail.com</a>.
            </p>
            <p className="mt-3">
              Consent to receive SMS messages is not a condition of booking an appointment.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. Third-Party Services</h2>
            <p className="mb-3">We use trusted third-party services to operate our business:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-white">Supabase</strong> — secure database and file storage</li>
              <li><strong className="text-white">Telnyx</strong> — SMS messaging delivery</li>
              <li><strong className="text-white">Stripe</strong> — payment processing</li>
              <li><strong className="text-white">Vercel</strong> — website hosting</li>
            </ul>
            <p className="mt-3">
              Each of these providers maintains their own privacy practices and security standards.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide our services and comply with applicable law.
              If you would like your information deleted, please contact us and we will remove it from our records
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Request a copy of the information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of SMS communications at any time (reply STOP)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. Security</h2>
            <p>
              We take reasonable steps to protect your information from unauthorized access, loss, or misuse.
              All data is stored securely and transmitted over encrypted connections.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an
              updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your personal information, contact us at:
            </p>
            <div className="mt-3 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
              <p className="text-white font-semibold">Brizee Bri Luxe Hair Studio</p>
              <p>Pflugerville, TX</p>
              <p>
                Email:{' '}
                <a href="mailto:brizeebri@gmail.com" className="text-[#ffabdd] underline">brizeebri@gmail.com</a>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex gap-6 text-sm text-white/30">
          <Link href="/" className="hover:text-white/60 transition-colors">← Home</Link>
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms & Conditions</Link>
          <Link href="/book" className="hover:text-white/60 transition-colors">Book an Appointment</Link>
        </div>
      </div>
    </div>
  )
}
