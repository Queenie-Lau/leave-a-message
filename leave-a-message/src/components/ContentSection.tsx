import Image from 'next/image';
import './css/ContentSection.css';

export default function ContentSection() {
  return (
    <section className="content-section">
      <div className="content-grid">
        <div className="content-image-card">
          <Image
            className="content-image"
            alt="Vintage rotary telephone on a minimalist white table"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQV1yENNLDvhmx_qomWLim4C66WOE_SJ_7j3uS8dIVWfiTLhnCPHxeSpBm7rgLnRDZ1p6FddoD-MgkZt3NR-UYbiUnnun4YfmFV0zD_HcP-oKlihgDMxkDGY-jK3Z61k71Ic5NWSHXRP8El7kjUayR1euErNct0e8sScExJCRZ30rVn6EaRmK2CbBAPO3cUJ7aPLGivUrLMl9udu5CqTdBrIYIAQKJqjdR8W6EMoX_mphne0qDVT6tpDo88V1LRAE-gGOtukAIy74w"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
          <div className="content-tag">THE EXPERIENCE</div>
        </div>
        <div className="content-text-blocks">
          <div className="content-text-card">
            <h3>Analog soul in a digital world.</h3>
            <p>No apps, no links, no clouds. Just a heavy receiver and a familiar tone. Say what&apos;s in your heart, exactly how you mean it.</p>
          </div>
          <div className="content-action-card">
            <span>RE-THINK GUESTBOOKS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
