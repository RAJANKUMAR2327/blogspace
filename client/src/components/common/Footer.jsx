import { Link } from 'react-router-dom'
import { FiTwitter, FiGithub, FiLinkedin, FiInstagram } from 'react-icons/fi'

export default function Footer() {
  return (
    <>
      <style>{`
        .bs-footer-wrap {
          background: var(--bg-surface-2);
          border-top: 1px solid var(--border-soft);
          font-family: var(--font-ui);
        }
        .bs-footer-main {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 48px;
          padding: 64px 48px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .bs-footer-brand-logo {
          font-family: var(--font-display);
          font-size: 22px; font-weight: 700;
          color: var(--accent);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 12px;
        }
        .bs-footer-brand-desc {
          font-size: 14px; color: var(--text-tertiary);
          line-height: 1.6; font-family: var(--font-body);
          max-width: 240px; margin-bottom: 24px;
        }
        .bs-footer-socials { display: flex; gap: 10px; }
        .bs-social-btn {
          width: 34px; height: 34px;
          background: var(--bg-surface);
          border: 1px solid var(--border-soft);
          border-radius: var(--radius-sm); display: flex;
          align-items: center; justify-content: center;
          color: var(--text-tertiary); font-size: 15px;
          transition: all 0.2s; text-decoration: none;
        }
        .bs-social-btn:hover {
          background: var(--accent-soft);
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-2px);
        }
        .bs-footer-col-title {
          font-family: var(--font-display);
          font-size: 13px; font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .bs-footer-col-links { display: flex; flex-direction: column; gap: 10px; }
        .bs-footer-col-link {
          font-size: 14px; color: var(--text-tertiary);
          text-decoration: none; transition: color 0.2s;
        }
        .bs-footer-col-link:hover { color: var(--text-primary); }
        .bs-footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px;
          border-top: 1px solid var(--border-soft);
          max-width: 1200px; margin: 0 auto;
        }
        .bs-footer-copy { font-size: 12px; color: var(--text-tertiary); }
        .bs-footer-bottom-links { display: flex; gap: 20px; }
        .bs-footer-bottom-link {
          font-size: 12px; color: var(--text-tertiary);
          text-decoration: none; transition: color 0.2s;
        }
        .bs-footer-bottom-link:hover { color: var(--text-primary); }
        .bs-footer-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; color: var(--text-tertiary);
        }
        .bs-footer-badge-dot {
          width: 6px; height: 6px; background: var(--success);
          border-radius: 50%; animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media (max-width: 768px) {
          .bs-footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 32px; padding: 40px 20px 32px;
          }
          .bs-footer-bottom {
            flex-direction: column; gap: 12px;
            text-align: center; padding: 16px 20px;
          }
        }
        @media (max-width: 480px) {
          .bs-footer-main { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="bs-footer-wrap">
        <div className="bs-footer-main">
          {/* Brand */}
          <div>
            <Link to="/" className="bs-footer-brand-logo">BlogSpace</Link>
            <p className="bs-footer-brand-desc">
              A place to read, write, and connect with great thinkers and storytellers from around the world.
            </p>
            <div className="bs-footer-socials">
              <a href="#" className="bs-social-btn" title="Twitter"><FiTwitter /></a>
              <a href="#" className="bs-social-btn" title="GitHub"><FiGithub /></a>
              <a href="#" className="bs-social-btn" title="LinkedIn"><FiLinkedin /></a>
              <a href="#" className="bs-social-btn" title="Instagram"><FiInstagram /></a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <div className="bs-footer-col-title">Explore</div>
            <div className="bs-footer-col-links">
              <Link to="/blogs" className="bs-footer-col-link">All Stories</Link>
              <Link to="/categories" className="bs-footer-col-link">Topics</Link>
              <Link to="/search" className="bs-footer-col-link">Search</Link>
              <Link to="/blogs?category=Technology" className="bs-footer-col-link">Technology</Link>
              <Link to="/blogs?category=Programming" className="bs-footer-col-link">Programming</Link>
              <Link to="/blogs?category=Design" className="bs-footer-col-link">Design</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="bs-footer-col-title">Account</div>
            <div className="bs-footer-col-links">
              <Link to="/login" className="bs-footer-col-link">Sign In</Link>
              <Link to="/register" className="bs-footer-col-link">Get Started</Link>
              <Link to="/profile" className="bs-footer-col-link">Profile</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="bs-footer-col-title">Company</div>
            <div className="bs-footer-col-links">
              <Link to="/" className="bs-footer-col-link">About Us</Link>
              <Link to="/" className="bs-footer-col-link">Contact</Link>
              <Link to="/" className="bs-footer-col-link">Privacy Policy</Link>
              <Link to="/" className="bs-footer-col-link">Terms of Service</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bs-footer-bottom">
          <div className="bs-footer-copy">
            © {new Date().getFullYear()} BlogSpace. All rights reserved.
          </div>
          <div className="bs-footer-badge">
            <span className="bs-footer-badge-dot" />
            All systems operational
          </div>
          <div className="bs-footer-bottom-links">
            <Link to="/" className="bs-footer-bottom-link">Privacy</Link>
            <Link to="/" className="bs-footer-bottom-link">Terms</Link>
            <Link to="/" className="bs-footer-bottom-link">Cookies</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
