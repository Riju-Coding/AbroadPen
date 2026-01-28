import type React from "react"

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h2 className="text-2xl font-bold text-[#37476b] border-b pb-2">{title}</h2>
    <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
  </div>
)

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50/50">
      <section className="bg-[#37476b] text-white py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-lg text-white/80">Last Updated: January 28, 2026</p>
        </div>
      </section>

      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 bg-white p-12 rounded-2xl shadow-lg space-y-8">
          <Section title="Introduction">
            <p>
              Welcome to AbroadPen ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when you use our website and
              services. Please read this policy carefully.
            </p>
          </Section>

          <Section title="Information We Collect">
            <p>We may collect personal information that you voluntarily provide to us, such as:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Personal Identification Information:</strong> Name, email address, phone number, city, date of
                birth.
              </li>
              <li>
                <strong>Educational Information:</strong> Academic history, test scores, transcripts, and other
                documents required for university applications.
              </li>
              <li>
                <strong>Communication Data:</strong> Information you provide when you contact us for support or make an
                enquiry.
              </li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide and manage our educational consulting services.</li>
              <li>Process your applications to universities and other institutions.</li>
              <li>Communicate with you regarding your application status, enquiries, and our services.</li>
              <li>Improve our website and services.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="Sharing Your Information">
            <p>
              We do not sell or rent your personal information. We may share your information with third parties only in
              the following situations:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Universities and Institutions:</strong> To submit your applications for admission.
              </li>
              <li>
                <strong>Service Providers:</strong> With vendors who perform services on our behalf, such as visa
                processing agents.
              </li>
              <li>
                <strong>Legal Requirements:</strong> If required by law or in response to valid requests by public
                authorities.
              </li>
            </ul>
          </Section>

          <Section title="Data Security">
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. However,
              no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </Section>

          <Section title="Your Rights">
            <p>
              You have the right to access, correct, or delete your personal information. If you wish to exercise these
              rights, please contact us at the details below.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              policy on this page.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-none space-y-2">
              <li>
                <strong>Email:</strong> admission@abroadpen.com
              </li>
              <li>
                <strong>Phone:</strong> +91 7827262135
              </li>
              <li>
                <strong>Address:</strong> 3rd Floor ALT F, Near Sarita Bihar Metro Station, New Delhi, India
              </li>
            </ul>
          </Section>
        </div>
      </main>
    </div>
  )
}