import { Link } from 'react-router-dom'
import { FiTwitter, FiGithub, FiLinkedin, FiInstagram } from 'react-icons/fi'

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        .bs-footer-wrap {
          background: #04040c;
          border-top: 1px solid rgba(255,255,255,0.04);
          font-family: 'Inter', sans-serif;
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
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800;
          background: linear-gradient(135deg, #a78bfa, #60a5fa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 12px;
        }
        .bs-footer-brand-desc {
          font-size: 14px; color: rgba(255,255,255,0.3);
          line-height: 1.6; font-weight: 300;
          max-width: 240px; margin-bottom: 24px;
        }
        .bs-footer-socials { display: flex; gap: 10px; }
        .bs-social-btn {
          width: 34px; height: 34px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; display: flex;
          align-items: center; justify-content: center;
          color: rgba(255,255,255,0.3); font-size: 15px;
          transition: all 0.2s; text-decoration: none;
        }
        .bs-social-btn:hover {
          background: rgba(167,139,250,0.1);
          border-color: rgba(167,139,250,0.3);
          color: #a78bfa;
          transform: translateY(-2px);
        }
        .bs-footer-col-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .bs-footer-col-links { display: flex; flex-direction: column; gap: 10px; }
        .bs-footer-col-link {
          font-size: 14px; color: rgba(255,255,255,0.25);
          text-decoration: none; transition: color 0.2s;
          font-weight: 300;
        }
        .bs-footer-col-link:hover { color: rgba(255,255,255,0.7); }
        .bs-footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px;
          border-top: 1px solid rgba(255,255,255,0.04);
          max-width: 1200px; margin: 0 auto;
        }
        .bs-footer-copy { font-size: 12px; color: rgba(255,255,255,0.15); }
        .bs-footer-bottom-links { display: flex; gap: 20px; }
        .bs-footer-bottom-link {
          font-size: 12px; color: rgba(255,255,255,0.15);
          text-decoration: none; transition: color 0.2s;
        }
        .bs-footer-bottom-link:hover { color: rgba(255,255,255,0.4); }
        .bs-footer-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; color: rgba(255,255,255,0.15);
        }
        .bs-footer-badge-dot {
          width: 6px; height: 6px; background: #34d399;
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
              <Link to="/profile" className="bs-footer-col-link">Saved Articles</Link>
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
