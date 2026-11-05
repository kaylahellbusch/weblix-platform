import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Brand } from "./ui/brand";
import { MobileNavigation } from "./home/navigation";
import "./home/home.css";

export const metadata: Metadata = {
  title: "Weblix — A workspace for your local business clients",
  description: "Organize local business clients, review CSV imports, and keep business details and website content together in Weblix.",
};

function ExamplePanel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return <div className={`home-example ${className}`}>
    <div className="example-bar"><span className="example-window-mark" aria-hidden="true" /><span>{title}</span></div>
    <div className="example-body">{children}</div>
  </div>;
}

function BusinessExample() {
  return <><strong>Juniper Flower Studio</strong><p>Florist · Boise, ID</p><div className="example-divider" /><span className="example-label">Business details</span><p>Contact information<br />Location &amp; industry</p></>;
}

function ContentExample() {
  return <><span className="example-label">Headline</span><p className="example-field">Flowers for everyday moments</p><span className="example-label">Services</span><p className="example-field">Seasonal bouquets</p></>;
}

function ImportExample() {
  return <><strong>Review before importing</strong><div className="example-row"><span>Juniper Flower Studio</span><span>Valid</span></div><div className="example-row"><span>Northline Plumbing</span><span>Valid</span></div><p>Check rows, then confirm.</p></>;
}

export default function Home() {
  return <div className="public-home">
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="home-shell">
      <header className="home-header">
        <Link href="/" aria-label="Weblix home"><Brand /></Link>
        <nav className="home-desktop-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a><a href="#workspace-examples">Workspace examples</a>
        </nav>
        <a href="/login" className="home-button header-login">Log in</a>
        <MobileNavigation />
      </header>
      <main id="main" tabIndex={-1}>
        <section className="home-hero home-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Your clients.<br /><span>A little more organized.</span></h1>
            <div className="hero-introduction"><div><p className="home-lead">One workspace to organize client details and keep their website content in order.</p><p className="hero-audience">For local business website managers</p></div>
            <div className="home-actions"><a href="/login" className="home-button">Log in</a><a href="#workspace-examples" className="home-button home-secondary">Explore the workspace<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></a></div></div>
          </div>
          <figure className="hero-examples">
            <div className="hero-record"><div className="record-heading"><span>Client workspace</span><strong>Juniper Flower Studio</strong><span>Illustrative example</span></div><div className="hero-collage">
              <ExamplePanel title="Business details" className="collage-business"><strong>Juniper Flower Studio</strong><p>Florist · Boise, ID</p><span className="record-note">Contact information &amp; location</span></ExamplePanel>
              <ExamplePanel title="CSV review" className="collage-import"><strong>Review your client list</strong><p>Check rows before importing.</p><span className="record-note">Review, then confirm</span></ExamplePanel>
              <ExamplePanel title="Website content" className="collage-content"><span className="example-label">Headline</span><p className="example-field">Flowers for everyday moments</p></ExamplePanel>
            </div></div>
            <figcaption>Synthetic workspace illustrations</figcaption>
          </figure>
        </section>
        <section className="home-gallery home-section" id="workspace-examples" aria-labelledby="examples-title">
          <div className="home-section-heading"><h2 id="examples-title">Client information. All in one place.</h2><p>Illustrative app examples with fictional data.</p></div>
          <div className="example-grid">
            <article><ExamplePanel title="Businesses"><BusinessExample /></ExamplePanel><div className="example-description"><h3>Organize your clients</h3><p>Search your clients in grid or compact view.</p></div></article>
            <article><ExamplePanel title="CSV review"><ImportExample /></ExamplePanel><div className="example-description"><h3>Bring your client list</h3><p>Review CSV rows before confirming an import.</p></div></article>
            <article><ExamplePanel title="Website content"><ContentExample /></ExamplePanel><div className="example-description"><h3>Keep content together</h3><p>Save each client’s headlines, services, and more.</p></div></article>
          </div>
        </section>
        <section className="home-workflow home-section" id="how-it-works" aria-labelledby="workflow-title">
          <h2 id="workflow-title">How it works</h2>
          <ol className="workflow-grid">
            <li><span className="step-number" aria-hidden="true">1</span><h3>Add your clients</h3><p>Enter a business by hand or review and confirm a CSV import.</p></li>
            <li><span className="step-number" aria-hidden="true">2</span><h3>Bring the details together</h3><p>Organize contact details and website content.</p></li>
            <li><span className="step-number" aria-hidden="true">3</span><h3>Keep it current</h3><p>Find a client, make your edits, and save.</p></li>
          </ol>
        </section>
        <section className="home-editor home-section" aria-labelledby="editor-title">
          <div><h2 id="editor-title">A place for the details.<br />Room for the words.</h2><p className="home-lead">Edit business details and saved website content in one focused workspace.</p><p className="editor-scope">Website rendering, live preview, and publishing are not available yet.</p><a href="/login" className="home-button">Log in</a></div>
          <figure><ExamplePanel title="Juniper Flower Studio · Content" className="editor-example"><div className="illustrated-tabs"><strong>Content</strong><span>Details</span></div><div className="illustrated-editor"><h3>Homepage</h3><span className="example-label">Headline</span><p className="example-field">Flowers for everyday moments</p><span className="example-label">Introduction</span><p className="example-field">Seasonal flowers, thoughtfully arranged.</p></div></ExamplePanel><figcaption>Synthetic content illustration · not an interactive editor</figcaption></figure>
        </section>
        <section className="home-cta" aria-labelledby="cta-title"><h2 id="cta-title">Your next client update starts here.</h2><a href="/login" className="home-button">Log in</a></section>
      </main>
      <footer className="home-footer"><Link href="/" aria-label="Weblix home"><Brand /></Link><nav aria-label="Footer navigation"><a href="#how-it-works">How it works</a><a href="#workspace-examples">Workspace examples</a><a href="https://github.com/kaylahellbusch/weblix-platform">GitHub</a><a href="/login">Log in</a></nav><p>© {new Date().getFullYear()} Weblix</p></footer>
    </div>
  </div>;
}
