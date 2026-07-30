import Link from 'next/link'

export const metadata = { title: 'Terms & Conditions — Brizee Bri Luxe Hair Studio' }

export default function TermsPage() {
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
        <h1 className="font-cormorant text-5xl font-semibold text-[#ffabdd] mb-2">Terms & Conditions</h1>
        <p className="text-white/40 text-sm mb-12">Effective date: July 1, 2025</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. About These Terms</h2>
            <p>
              By using the website at <span className="text-[#ffabdd]">brizeebri.com</span> or submitting a booking request,
              you agree to these Terms & Conditions. These terms govern your use of our website and appointment booking services
              provided by Brizee Bri Luxe Hair Studio ("we," "us," "our," or "Bri"), located in Pflugerville, TX.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Booking Requests</h2>
            <p className="mb-3">
              Submitting a booking request through our website does <strong className="text-white">not</strong> guarantee
              a confirmed appointment. All requests are reviewed by Bri individually and are subject to availability.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>You will receive confirmation via text or email once your appointment is approved</li>
              <li>Bri reserves the right to decline any request at her discretion</li>
              <li>If your preferred date is unavailable, Bri may suggest alternative dates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. Deposits</h2>
            <p className="mb-3">
              A non-refundable deposit is required to secure your appointment after your booking request is approved.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>The deposit amount will be communicated at the time of confirmation</li>
              <li>Deposits are applied toward the total service cost</li>
              <li>Deposits are non-refundable except where required by applicable law</li>
              <li>Failure to pay the deposit within the specified timeframe may result in your appointment being released</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. Cancellations & Rescheduling</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>If you need to cancel or reschedule, please notify us as soon as possible via text or email</li>
              <li>Cancellations with less than 24 hours notice may result in forfeiture of your deposit</li>
              <li>No-shows forfeit the deposit and may be required to pay an additional booking fee for future appointments</li>
              <li>If Bri cancels for any reason, your deposit will be refunded in full or credited toward a rescheduled appointment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. Pricing</h2>
            <p className="mb-3">
              All prices are estimates and may vary based on:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Hair length, thickness, and texture</li>
              <li>Complexity and time required</li>
              <li>Whether hair is provided by the client or included in the service</li>
            </ul>
            <p className="mt-3">
              A final price quote will be confirmed before your appointment begins. Services requiring a consultation will
              receive a price quote after Bri reviews your inspiration photos and style details.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. SMS Communications</h2>
            <p className="mb-3">
              By providing your phone number and consenting during the booking process, you agree to receive
              text messages from Brizee Bri Luxe Hair Studio related to your appointment.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>You may opt out at any time by replying <strong className="text-white">STOP</strong></li>
              <li>For help, reply <strong className="text-white">HELP</strong></li>
              <li>Message and data rates may apply</li>
              <li>Consent to receive SMS is not required to book an appointment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. Client Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Arrive on time — late arrivals may result in a shortened appointment or reschedule</li>
              <li>Hair should be freshly washed and detangled unless otherwise discussed</li>
              <li>Communicate any allergies, sensitivities, or scalp conditions in advance</li>
              <li>Children receiving services must be accompanied by a parent or guardian</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. Photos & Social Media</h2>
            <p>
              Bri may photograph completed styles for use on social media and marketing materials. If you do not
              wish to be photographed, please let us know before or during your appointment. By not objecting,
              you grant permission for your hairstyle (not identifying features) to be shared.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. Limitation of Liability</h2>
            <p>
              Brizee Bri Luxe Hair Studio is not liable for any allergic reactions, hair damage, or other adverse
              outcomes resulting from services, provided that reasonable professional care was exercised. It is the
              client's responsibility to disclose relevant health, allergy, or hair condition information prior to
              receiving services.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">10. Changes to These Terms</h2>
            <p>
              We reserve the right to update these Terms & Conditions at any time. Changes will be posted on this
              page with an updated effective date. Continued use of our services constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">11. Contact</h2>
            <p>Questions about these Terms? Reach out:</p>
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
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
          <Link href="/book" className="hover:text-white/60 transition-colors">Book an Appointment</Link>
        </div>
      </div>
    </div>
  )
}
