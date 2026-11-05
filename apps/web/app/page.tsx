import Link from "next/link";
import type { Metadata } from "next";
import { Brand } from "./ui/brand";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Weblix — A workspace for your local business clients",
  description: "Organize local business clients, review CSV imports, and keep business details and website content together in Weblix.",
  other: { "page-type": "software", "site-kind": "software" },
};

const clients = ["Juniper Flower Studio", "Northline Plumbing"];

function ClientWindow({ compact = false }: { compact?: boolean }) {
  return <div className={`ui ui-panel client-window ${compact ? "client-window--compact" : ""}`} role="img" aria-label="Fictional workspace illustration showing client details and saved website content">
    <div className="client-bar"><span className="ui-dots" aria-hidden="true"><i /><i /><i /></span><span>Weblix / Businesses</span></div>
    <div className="client-body">
      <aside className="client-list"><p className="visual-label">Businesses</p><div className="visual-search">Search clients</div>{clients.map((client, i) => <div className={`client-item ${i === 0 ? "selected" : ""}`} key={client}><span className="client-initial" aria-hidden="true">{i === 0 ? "J" : "N"}</span><div><strong>{client}</strong><span>{i === 0 ? "Florist · Boise, ID" : "Plumbing"}</span></div></div>)}</aside>
      <div className="client-detail"><span className="visual-label">Business details</span><h3>Juniper Flower Studio</h3><p>Florist · Boise, ID</p><div className="visual-tabs"><strong>Content</strong><span>Details</span></div><div className="visual-form"><span className="visual-label">Homepage</span><span className="visual-label">Headline</span><p className="visual-field">Flowers for everyday moments</p><span className="visual-label">Introduction</span><p className="visual-field">Seasonal flowers, thoughtfully arranged.</p><span className="visual-label">Services</span><p className="visual-field">Seasonal bouquets</p></div></div>
    </div>
  </div>;
}

function ReviewFragment() {
  return <div className="ui ui-panel ui-checks" data-ui="checklist" data-ui-still="">
    <div className="ui-checks__head"><div className="ui-title">Review before importing</div></div>
    <ul className="ui-checks__list">{clients.map(client => <li className="ui-check is-done" key={client}><span className="ui-check__box"><svg viewBox="0 0 16 16"><path d="m4.5 8.2 2.3 2.3 4.7-5" /></svg></span><span className="ui-check__label">{client}</span><span className="ui-meta">Valid</span></li>)}</ul>
    <p className="visual-review-note">Check rows, then confirm.</p>
  </div>;
}

export default function Home() {
  return <>
    {/* software; split; olive-on-bone / onest; nav-cards → nav-split (no photographs); footer-dark; close-type; space; solid; sage; silk-folds in editor; word-highlight in statement; bg-mist / bg-dots. */}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400..700&family=JetBrains+Mono:wght@400..500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/system.css" />
    <link rel="stylesheet" href="/assets/ui/cards.css" />
    <link rel="stylesheet" href="/assets/motion/motion.css" />
    <link rel="stylesheet" href="/assets/backgrounds/backgrounds.css" />
    <link rel="stylesheet" href="/assets/layout/layout.css" />
    <link rel="stylesheet" href="/assets/moments/word-highlight/moment.css" />
    <link rel="stylesheet" href="/home-taste.css" />
    <header className="nav nav--split" id="top"><div className="wrap nav__bar">
      <a href="#main" className="skip-link">Skip to content</a>
      <Link href="/" className="nav__logo" aria-label="Weblix home"><Brand /></Link>
      <nav className="nav__links" aria-label="Main navigation"><div className="nav__item"><a className="nav__link" href="#workspace-examples">Workspace</a></div><div className="nav__item"><a className="nav__link" href="#how-it-works">Workflow</a></div><div className="nav__item"><a className="nav__link" href="#editor">Content</a></div><div className="nav__item"><a className="nav__link" href="#statement">Updates</a></div></nav>
      <div className="nav__actions"><a className="btn btn--primary" href="/login">Log in</a></div>
      <button className="nav__toggle" type="button" aria-label="Menu" aria-expanded="false"><span>Menu</span></button>
    </div></header>
    <main id="main" tabIndex={-1}>
      <section className="hero hero--split" aria-labelledby="hero-title"><div className="wrap"><div className="hero-text grid hero__grid">
        <div className="hero__text span-5"><h1 id="hero-title">Client workspace for local sites</h1><p className="hero__lead">Organize client details and saved website content in one workspace. For local business website managers.</p><div className="btn-row"><a className="btn btn--primary" href="/login">Log in</a><a className="btn btn--secondary" href="#workspace-examples">See the workspace</a></div><p className="hero__kicker">3 steps: add clients, organize details, save updates.</p></div>
        <div className="hero__media span-6 start-7"><ClientWindow compact /></div>
      </div></div></section>
      <section className="section" id="workspace-examples" aria-labelledby="examples-title"><div className="wrap">
        <div className="grid"><h2 className="span-5" id="examples-title">Client details.<br />Website content.<br />One workspace.</h2><div className="span-6 start-7"><p className="t-lead">Search your clients in grid or compact view. Open a business to edit contact information, location, industry, and the words for its website.</p><a className="link" href="#how-it-works">See the 3 steps</a></div></div>
        <div className="app-frame fill"><ClientWindow /></div>
      </div></section>
      <section className="section bg-mist" id="how-it-works" aria-labelledby="workflow-title"><div className="wrap">
        <div className="section-head"><h2 id="workflow-title">Your client updates in 3 steps</h2><p className="t-lead">From a client list to the next saved edit.</p></div>
        <div className="grid steps-grid">
          <article className="card card--row card--open span-4"><span className="step-num">01</span><h3>Add your clients</h3><p>Enter a business by hand or review and confirm a CSV import.</p><div className="panel"><div className="stage"><div className="at-rise fit"><ReviewFragment /></div></div></div></article>
          <article className="card card--row card--open span-4"><span className="step-num">02</span><h3>Organize the details</h3><p>Keep contact details, location, industry, and website content together.</p><div className="panel"><div className="stage"><div className="at-rise fit visual-details"><span className="visual-label">Business details</span><strong>Juniper Flower Studio</strong><dl><dt>Industry</dt><dd>Florist</dd><dt>Location</dt><dd>Boise, ID</dd></dl></div></div></div></article>
          <article className="card card--row card--open span-4"><span className="step-num">03</span><h3>Save client content</h3><p>Find a client, make your edits, and save the details and content.</p><div className="panel"><div className="stage"><div className="at-rise fit visual-details"><span className="visual-label">Website content</span><span className="visual-label">Headline</span><p className="visual-field">Flowers for everyday moments</p><span className="visual-label">Services</span><p className="visual-field">Seasonal bouquets</p></div></div></div></article>
        </div>
      </div></section>
      <section className="section" id="editor" aria-labelledby="editor-title"><div className="wrap grid">
        <div className="span-5 stack-5"><h2 id="editor-title">A home for website content</h2><p className="t-lead">Edit each client’s headlines, introduction, and services alongside their business details. Save your edits and return for the next update.</p><p className="t-body">Website rendering, live preview, and publishing are not available yet.</p><a className="link" href="#workspace-examples">See the workspace</a></div>
        <div className="frame frame--split span-6 start-7" data-visual="" data-fx="silk-folds" data-fx-seed="51" data-fx-palette='{"bg":"#cdd6c6","surface":"#dce3d6","ink":"#262d24","accent":"#6c8e63"}' data-fx-params='{"speed":0,"tone":1}'><div className="stage"><div className="at-rise fit editor-art"><ClientWindow compact /></div></div></div>
      </div></section>
      <section className="section bg-dots" id="statement" data-moment="word-highlight" aria-labelledby="statement-title"><div className="wrap"><h2 id="statement-title">The next client update</h2><p className="mo-wh__text">Find the business. Review its details. Keep contact information, location, and industry together with the headlines, introduction, and services for its website. Make your edits and save. Your clients and their words, in <strong>one workspace.</strong></p></div></section>
    </main>
    <footer className="footer closing footer--dark ground-inverse" aria-labelledby="cta-title"><div className="wrap">
      <div className="closing__cta close--type"><div className="section-head"><h2 id="cta-title">Your next client update starts here.</h2></div><a href="/login" className="btn btn--primary btn--xl btn--wide">Log in</a></div>
      <div className="closing__links"><div className="grid"><div className="span-4"><Link href="/" className="nav__logo" aria-label="Weblix home">Weblix</Link></div><div className="span-4 footer__col"><h3>Workspace</h3><ul><li><a href="#workspace-examples">Workspace examples</a></li><li><a href="#how-it-works">How it works</a></li></ul></div><div className="span-4 footer__col"><h3>Weblix</h3><ul><li><a href="https://github.com/kaylahellbusch/weblix-platform">GitHub</a></li><li><a href="/login">Log in</a></li></ul></div></div><div className="footer__legal"><span>© {new Date().getFullYear()} Weblix</span></div></div>
    </div></footer>
    <Script type="module" src="/assets/system.js" strategy="afterInteractive" />
    <Script type="module" src="/assets/motion/motion.js" strategy="afterInteractive" />
    <Script type="module" src="/assets/layout/layout.js" strategy="afterInteractive" />
    <Script type="module" src="/assets/moments/moments.js" strategy="afterInteractive" />
  </>;
}
