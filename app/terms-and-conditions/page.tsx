import type React from "react"

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h2 className="text-2xl font-bold text-[#37476b] border-b pb-2">{title}</h2>
    <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
  </div>
)

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-gray-50/50">
      <section className="bg-[#37476b] text-white py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Terms and Conditions</h1>
          <p className="mt-4 text-lg text-white/80">Last Updated: January 28, 2026</p>
        </div>
      </section>

      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 bg-white p-12 rounded-2xl shadow-lg space-y-8">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing and using the AbroadPen website and its services, you agree to comply with and be bound by
              these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </Section>

          <Section title="2. Description of Services">
            <p>
              AbroadPen provides educational consulting services, including but not limited to university selection,
              application assistance, documentation guidance, and visa support for students seeking international
              education.
            </p>
          </Section>

          <Section title="3. User Obligations">
            <p>You agree to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate, current, and complete information as requested by our counsellors.</li>
              <li>
                Take full responsibility for the final choice of university and course, and for the authenticity of all
                documents submitted.
              </li>
              <li>Comply with all applicable laws and regulations of your home country and your destination country.</li>
            </ul>
          </Section>

          <Section title="4. Fees and Payments">
            <p>
              Any applicable service fees will be communicated to you clearly. All fees are non-refundable unless
              otherwise stated in a separate agreement. We are not responsible for any fees charged by universities,
              embassies, or other third parties.
            </p>
          </Section>

          <Section title="5. Limitation of Liability">
            <p>
              AbroadPen provides guidance based on our expertise and information provided by institutions. However, we
              do not guarantee admission to any university or the approval of any visa application. The final decision
              rests with the respective authorities. We shall not be liable for any direct, indirect, incidental, or
              consequential damages resulting from the use of our services.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              All content on this website, including text, graphics, logos, and images, is the property of AbroadPen
              and is protected by intellectual property laws.
            </p>
          </Section>

          <Section title="7. Governing Law">
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any
              disputes will be subject to the exclusive jurisdiction of the courts in New Delhi.
            </p>
          </Section>

          <Section title="8. Changes to Terms">
            <p>
              We reserve the right to modify these Terms and Conditions at any time. We will notify you of any changes
              by posting the new terms on this page. Your continued use of the service after any such changes
              constitutes your acceptance of the new terms.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
            <ul className="list-none space-y-2">
              <li>
                <strong>Email:</strong> admission@abroadpen.com
              </li>
            </ul>
          </Section>
        </div>
      </main>
    </div>
  )
}