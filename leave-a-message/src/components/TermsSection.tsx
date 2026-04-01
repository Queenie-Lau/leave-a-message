export default function TermsSection() {
  return (
    <section className="policy-section" id="terms">
      <div className="policy-container">
        <div className="policy-hero">
          <h2>Terms of Service</h2>
          <div className="policy-divider"></div>
        </div>

        <div className="policy-grid">
          <div className="terms-row">
            <article className="terms-card">
              <h4>Account Security</h4>
              <p>You&apos;re responsible for keeping your password secure. We recommend using a strong, unique password and enabling two-factor authentication.</p>
            </article>
            <article className="terms-card">
              <h4>Message Storage</h4>
              <p>Messages are stored securely and backed up across multiple servers for reliability. You can request deletion at any time.</p>
            </article>
          </div>

          <article>
            <h3>Acceptable Use</h3>
            <p>This service is for personal use only. You agree not to use this platform for illegal, harassing, or abusive content.</p>
          </article>

          <article>
            <h3>Limitation of Liability</h3>
            <p>We provide this service on an &quot;as-is&quot; basis with 99.9% uptime commitment. We&apos;re not liable for any indirect damages or data loss beyond our control.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
