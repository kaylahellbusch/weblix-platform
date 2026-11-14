import { House, Mail, MapPin, Phone } from "lucide-react";
import { Inter } from "next/font/google";
import type { WebsitePreview } from "@/lib/website-content/preview";
import styles from "./preview.module.css";

const inter = Inter({ subsets: ["latin"] });

function Brand({ name }: { name: string }) {
  const words = name.split(/\s+/);
  const split = words.length < 4 ? 1 : 2;
  return <div className={styles.brand}><span><strong>{words.slice(0, split).join(" ")}</strong><span>{words.slice(split).join(" ")}</span></span></div>;
}

function Contact({ preview }: { preview: WebsitePreview }) {
  const { business: b, actions } = preview;
  return <div className={styles.contacts}>
    {b.phone && <div><Phone aria-hidden="true" /><span>{actions.phone ? <a href={actions.phone}>{b.phone}</a> : b.phone}</span></div>}
    {b.email && <div><Mail aria-hidden="true" /><span>{actions.email ? <a href={actions.email}>{b.email}</a> : b.email}</span></div>}
    {(b.city || b.state) && <div><MapPin aria-hidden="true" /><span>{[b.city, b.state].filter(Boolean).join(", ")}</span></div>}
    {b.website && <div><span>{actions.website ? <a href={actions.website}>{b.website}</a> : b.website}</span></div>}
  </div>;
}

/** Presentation only: all data and safe contact URIs come from the preview adapter. */
export function GranitePreview({ preview }: { preview: WebsitePreview }) {
  const { business, headline, introduction, services, serviceAreas, actions } = preview;
  const nav = <>{services && <a href="#services">Services</a>}{serviceAreas && <a href="#locations">Areas We Serve</a>}<a href="#contact">Contact</a></>;
  return <article className={`granite-preview ${styles.preview} ${inter.className}`} aria-label="Website preview">
    <div className={styles.notice}>Website preview · Read-only · Not published</div>
    <header className={styles.header}>
      {actions.phone && <div className={styles.mobilePhone}><Phone size={18} aria-hidden="true" /> Call Now: <a href={actions.phone}>{business.phone}</a></div>}
      <div className={styles.headerInner}>
        <Brand name={business.name} />
        <nav className={styles.desktopNav} aria-label="Website sections">{nav}</nav>
        {actions.phone && <a className={styles.headerPhone} href={actions.phone}><Phone size={18} aria-hidden="true" />{business.phone}</a>}
        <details className={styles.mobileMenu}><summary>Menu</summary><nav aria-label="Mobile website sections">{nav}</nav></details>
      </div>
    </header>
    <section className={styles.hero} aria-labelledby="preview-headline">
      <div className={styles.container}><div className={styles.heroContent}>
        <h1 id="preview-headline">{headline}</h1>
        <a className={styles.button} href="#contact">Get My Free Estimate</a>
      </div></div>
    </section>
    <section className={styles.contactSection} id="contact" aria-labelledby="contact-title">
      <div className={`${styles.container} ${styles.contactGrid}`}>
        <div><h2 id="contact-title">{introduction ? `About ${business.name}` : "Contact Us"}</h2>
          {introduction && <p className={styles.introduction}>{introduction}</p>}
          <Contact preview={preview} />
        </div>
        <div className={styles.demo}>
          <p>Demo only — this form sends nothing.</p>
          <fieldset disabled aria-label="Demo contact form">
            <label>Name<input placeholder="Your Name" /></label>
            <label>Phone Number<input type="tel" placeholder="(555) 123-4567" /></label>
            <label>Message<textarea placeholder="How can we help?" /></label>
            <button type="button" disabled>Get My Free Estimate</button>
          </fieldset>
        </div>
      </div>
    </section>
    {services && <section className={styles.section} id="services" aria-labelledby="services-title">
      <div className={styles.container}><h2 id="services-title" className={styles.sectionTitle}>Our Services</h2>
        <div className={styles.services}>{services.map((service, i) => <div className={styles.card} key={i}>
          <div className={styles.icon}><House aria-hidden="true" /></div><h3>{service.title}</h3><p>{service.description}</p>
        </div>)}</div>
      </div>
    </section>}
    {serviceAreas && <section className={styles.section} id="locations" aria-labelledby="areas-title">
      <div className={styles.container}><h2 id="areas-title" className={styles.sectionTitle}>Areas We Serve</h2>
        <div className={styles.areas}>{serviceAreas.map((area, i) => <div key={i}>{area}</div>)}</div>
      </div>
    </section>}
    <footer className={styles.footer}><div className={styles.container}>
      <div className={styles.footerGrid}><div><Brand name={business.name} />{introduction && <p>{introduction}</p>}</div>
        {services && <div><h3>Our Services</h3><ul>{services.map((service, i) => <li key={i}>{service.title}</li>)}</ul></div>}
        {serviceAreas && <div><h3>Areas We Serve</h3><ul>{serviceAreas.map((area, i) => <li key={i}>{area}</li>)}</ul></div>}
        <div><h3>Contact Us</h3><Contact preview={preview} /></div>
      </div>
      <div className={styles.copyright}>© {new Date().getFullYear()} {business.name}. All rights reserved.</div>
    </div></footer>
  </article>;
}
