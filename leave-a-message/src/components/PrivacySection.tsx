export default function PrivacySection() {
  return (
    <section className="policy-section" id="privacy">
      <div className="policy-container">
        <div className="policy-hero">
          <h2>Privacy Policy</h2>
          <div className="policy-divider"></div>
        </div>

        <div className="policy-grid">
          <article>
            <h3>Your Privacy Matters</h3>
            <p>We treat your voice messages with the highest level of security and confidentiality. Your data is encrypted and never shared with third parties.</p>
          </article>
          <article>
            <h3>Data Protection</h3>
            <p>All messages are encrypted using industry-standard AES-256 encryption. We use TLS 1.3 for all data in transit. Your encryption keys remain under your complete control.</p>
          </article>
          <article>
            <h3>No Analytics or Tracking</h3>
            <p>We don&apos;t analyze, profile, or track your messages for any purpose. Your messages exist solely for you to access when ready.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
