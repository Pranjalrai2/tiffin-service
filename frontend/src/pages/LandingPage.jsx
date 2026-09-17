import { Link } from 'react-router-dom';

const LandingPage = () => (
  <div className="page-shell landing-shell">
    <header className="topbar">
      <div className="brand">TiffinTrack</div>
      <nav>
        <Link className="link-button" to="/login">Owner Login</Link>
      </nav>
    </header>

    <main className="landing-hero">
      <div>
        <p className="eyebrow">Home-style lunch service billing made simple</p>
        <h1>Track subscriptions, pauses, and monthly bills without manual math.</h1>
        <p className="lead">
          TiffinTrack helps home tiffin owners manage recurring weekday delivery plans, exclude paused days,
          and calculate accurate pro-rated monthly bills in seconds.
        </p>
        <div className="cta-row">
          <Link className="primary-button" to="/login">Get Started</Link>
        </div>
      </div>

      <div className="feature-card">
        <h3>Why owners use it</h3>
        <ul>
          <li>Accurate billing from real weekday totals</li>
          <li>Pause and resume tracking with full history</li>
          <li>Fast customer lookup by phone number</li>
        </ul>
      </div>
    </main>

    <section className="feature-grid">
      <div className="feature-box">
        <h3>Key Features</h3>
        <p>Monthly plan management, active/paused status, and invoice summaries for every customer.</p>
      </div>
      <div className="feature-box">
        <h3>Target Audience</h3>
        <p>Built for home-style lunch service owners, apartment tiffin operators, and local meal delivery managers.</p>
      </div>
      <div className="feature-box">
        <h3>Next Features</h3>
        <p>WhatsApp bill reminders, multiple delivery slots, and a customer self-service portal.</p>
      </div>
    </section>
  </div>
);

export default LandingPage;
