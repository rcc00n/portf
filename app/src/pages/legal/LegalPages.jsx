import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./legal.css";

const privacyEmail = "vadrud2016@gmail.com";
const reviewDate = "25 November 2026";

function LegalLayout({ title, intro, children }) {
  const { hash } = useLocation();

  useEffect(() => {
    document.title = `${title} — RACCN Code`;
    let targetId = hash.slice(1);
    try { targetId = decodeURIComponent(targetId); } catch { /* Unknown anchors return to the document title. */ }
    const target = targetId ? document.getElementById(targetId) : null;
    if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [title, hash]);

  return (
    <div className="raccn-legal">
      <article id="legal-content" className="legal-content" tabIndex={-1}>
        <header className="legal-intro">
          <p className="legal-eyebrow">Website information / reviewed {reviewDate}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </header>
        {children}
      </article>

    </div>
  );
}

function LegalSection({ number, title, children, id }) {
  return (
    <section className="legal-section" id={id} aria-labelledby={`legal-section-${number}`}>
      <span className="legal-section-number" aria-hidden="true">{number}</span>
      <div>
        <h2 id={`legal-section-${number}`}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function ClearWebsiteStorage() {
  const [message, setMessage] = useState("");

  const clearStorage = () => {
    let failed = false;
    const entries = [
      ["localStorage", "qualificationGate"],
      ["localStorage", "estimateSnapshot"],
      ["sessionStorage", "raccn-home-seen"],
      ["sessionStorage", "raccn-control-plane-seen"],
    ];
    for (const [storage, key] of entries) {
      try {
        window[storage].removeItem(key);
      } catch {
        failed = true;
      }
    }
    setMessage(failed
      ? "Your browser blocked access to some saved choices. You can remove this website’s data in your browser settings."
      : "Saved project choices and motion preferences have been cleared in this browser. Already submitted inquiries are unchanged.");
  };

  return (
    <div className="legal-storage-control">
      <button type="button" onClick={clearStorage}>Clear saved website choices <span aria-hidden="true">↗</span></button>
      <p role="status" aria-live="polite" aria-atomic="true">{message}</p>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="How this website handles your project inquiry, saved choices, and contact information."
    >
      <LegalSection number="01" title="Who to contact">
        <p>RACCN Code is operated personally by Vadim Rudenko in Alberta, Canada. Vadim is responsible for privacy inquiries about this website. For questions, or to request access, correction, or deletion, email <a href={`mailto:${privacyEmail}?subject=Privacy%20request`}>{privacyEmail}</a>.</p>
      </LegalSection>
      <LegalSection number="02" title="Information in a project inquiry">
        <p>When you send a project inquiry, the website collects your name, email address, and message. You can optionally include your saved project definition, including product type, complexity, budget preference, and timing preference.</p>
        <p>The inquiry record also includes its source, submission time, IP address, and browser information. The source may include project-routing details derived from choices you made in the qualification flow or estimator.</p>
        <p>The details you enter are used to understand your request, assess the project, respond, and manage the inquiry. Please leave out passwords, payment-card information, health records, and other sensitive personal information.</p>
        <p>Sending an inquiry does not subscribe you to marketing. No newsletter subscription is included in these forms.</p>
        <p>IP addresses and browser information support abuse prevention and investigation of submission problems. They are not used for advertising profiles.</p>
      </LegalSection>
      <LegalSection number="03" title="Where an inquiry goes" id="service-providers">
        <p>Submitted inquiries are stored in the website’s database and are available through its restricted administration area.</p>
        <p>Telegram notifications are enabled. Your name, email address, message, optional project definition, and inquiry source are sent through the Telegram Bot API to the configured recipients handling inquiries. Legacy submissions may also contain an optional company name; the current form does not ask for one. Notifications do not include the IP address or browser information stored with the inquiry. Long messages may be shortened in the notification; the full inquiry remains in the restricted administration area.</p>
        <p>Telegram is a separate cloud service. Its handling of information is described in the <a href="https://telegram.org/privacy" target="_blank" rel="noopener noreferrer">Telegram Privacy Policy <span className="legal-sr-only">(opens in a new tab)</span></a>. Sending a direct email also involves your email provider and the receiving mailbox provider.</p>
        <p>The website and its database are hosted on a Vultr virtual server. Direct email to the published contact address is handled by Gmail. These providers and Telegram may process information outside Canada, where different laws may apply. This website does not promise Canadian-only storage. For questions about these arrangements, contact Vadim at the address above.</p>
        <p>Provider information: <a href="https://www.vultr.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Vultr privacy policy <span className="legal-sr-only">(opens in a new tab)</span></a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google privacy policy <span className="legal-sr-only">(opens in a new tab)</span></a>.</p>
      </LegalSection>
      <LegalSection number="04" title="Saved choices, cookies, and measurement" id="browser-storage">
        <p>Optional project definition remembers product type, complexity, team size, and integration choices in this browser when you change them. Optional budget and timing preferences, and compatible choices saved by the earlier qualification flow, can also be retained. These records include the time they were saved and remain until you clear them or your browser removes them.</p>
        <p>Saved choices are attached to the Start inquiry only when you select the option to include your project definition. Choosing “Discuss this project definition” preselects that option, which you can turn off before sending. Using the estimator alone does not submit a project inquiry.</p>
        <p>Session storage remembers whether the homepage and Control Plane entrance animations have already played in this tab. It does not identify you across visits.</p>
        <p>This website implementation does not load an external analytics or advertising service. Page-view and interaction events are held temporarily in browser memory; the website does not send that event queue to an analytics provider. Sign-in and security cookies support the restricted administration area.</p>
        <p>You can clear saved website choices below or use your browser’s site-data settings. This does not delete inquiries you have already submitted.</p>
        <ClearWebsiteStorage />
      </LegalSection>
      <LegalSection number="05" title="Hosting, retention, and access">
        <p>The web server records request and error information for operation and security, including connection details and requested URLs. Its logs are configured for daily rotation with 14 retained rotations. Application and deployment logs can retain diagnostic information separately.</p>
        <p>Closed inquiries and their related correspondence are scheduled for removal 12 months after the last communication. You can request earlier removal by email. Retention is reviewed manually; an active project, dispute, or legal obligation may require relevant records to be kept longer.</p>
        <p>The review includes the inquiry database, notification records, Telegram copies, and email. Restricted backups may retain an earlier copy until the backup is removed through the retention review. A deletion request is also recorded so that removed information is not returned to active use if a backup is restored.</p>
        <p>Access to inquiries is restricted to the operator and authorized people helping handle them. Contact Vadim to ask about access, correction, withdrawal of consent, removal, or a specific retention concern.</p>
      </LegalSection>
      <LegalSection number="06" title="Links and changes">
        <p>Project and resource links may take you to other websites, whose privacy practices apply there. This policy will need updating if the website’s data handling or service providers change.</p>
        <p>Privacy concerns can also be raised with the <a href="https://oipc.ab.ca/" target="_blank" rel="noopener noreferrer">Office of the Information and Privacy Commissioner of Alberta <span className="legal-sr-only">(opens in a new tab)</span></a>.</p>
      </LegalSection>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Use"
      intro="Terms for using the RACCN Code website, examples, and interactive tools."
    >
      <LegalSection number="01" title="Website information">
        <p>RACCN Code is the website and working name of Vadim Rudenko, operating personally in Alberta, Canada.</p>
        <p>This website introduces RACCN Code’s work and approach to digital products and systems. Its content, architecture examples, pricing ranges, and interactive estimates provide general information. They are not binding quotes, promises of availability, or guarantees of a particular result.</p>
        <p>A project inquiry does not create a service agreement. Scope, deliverables, fees, timing, and responsibilities must be agreed separately before work begins.</p>
      </LegalSection>
      <LegalSection number="02" title="Examples and demonstrations">
        <p>Interactive system diagrams, sample workflows, and the admin demonstration illustrate engineering concepts. Demonstration records and example calculations are not a live customer account or a production service. Decisions about a real system require its own requirements and review.</p>
        <p>Project descriptions and screenshots show selected work at a point in time. Third-party products may change after a screenshot or description is published.</p>
      </LegalSection>
      <LegalSection number="03" title="Content and third-party rights">
        <p>Original RACCN Code content and branding are protected by applicable intellectual-property law. Third-party names, logos, product marks, and screenshots remain the property of their respective owners. Their appearance does not by itself imply endorsement, a partnership, or ownership by RACCN Code.</p>
        <p>Permission to reuse material is not granted merely by displaying it here. A separately published licence applies where one is provided. Contact <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> about reuse or a rights concern.</p>
      </LegalSection>
      <LegalSection number="04" title="Reasonable use">
        <p>Use the website lawfully. Do not interfere with its operation, attempt unauthorized access, submit malicious material, or send information you are not authorized to share.</p>
        <p>Project forms are for initial inquiries. Do not use them to send passwords, payment details, confidential customer records, or sensitive personal information. See the <Link to="/privacy">Privacy Policy</Link> for information handling.</p>
      </LegalSection>
      <LegalSection number="05" title="Links, availability, and limitations">
        <p>External links are provided for context. RACCN Code does not control third-party websites or their content, availability, or terms.</p>
        <p>Website information may contain errors or become outdated, and uninterrupted availability is not guaranteed. To the extent permitted by applicable law, RACCN Code is not responsible for loss arising solely from reliance on general website content or interruption of this informational website. Nothing in these terms excludes rights or liabilities that the law does not allow to be excluded.</p>
      </LegalSection>
      <LegalSection number="06" title="Contact and updates">
        <p>Questions about these terms can be sent to <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. Changes will be reflected on this page with an updated review date.</p>
      </LegalSection>
    </LegalLayout>
  );
}
