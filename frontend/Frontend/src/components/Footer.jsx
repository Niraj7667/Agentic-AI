import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  // Base styles
  const footerStyle = {
    background: "#2c3e50",
    color: "white",
    padding: "3rem 0 2rem 0",
    marginTop: "auto",
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  };

  const contentStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
    marginBottom: "2rem",
  };

  const sectionStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  };

  const titleStyle = {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#3498db",
  };

  const linkStyle = {
    color: "#bdc3c7",
    textDecoration: "none",
    transition: "color 0.3s ease",
    padding: "0.25rem 0",
  };

  const bottomStyle = {
    borderTop: "1px solid #34495e",
    paddingTop: "1.5rem",
    textAlign: "center",
    color: "#bdc3c7",
    fontSize: "0.9rem",
  };

  const socialLinksStyle = {
    display: "flex",
    gap: "1.5rem",
    justifyContent: "flex-start",
    marginTop: "0.5rem",
    flexWrap: "wrap",
  };

  const socialLinkStyle = {
    color: "#bdc3c7",
    fontSize: "1.5rem",
    textDecoration: "none",
    transition: "transform 0.3s ease, color 0.3s ease",
    padding: "0.5rem",
  };

  const descriptionStyle = {
    color: "#bdc3c7",
    lineHeight: "1.6",
    fontSize: "0.95rem",
  };

  // Footer link component with hover effects
  const FooterLink = ({ to, children }) => (
    <Link
      to={to}
      style={linkStyle}
      onMouseEnter={(e) => {
        e.target.style.color = "#3498db";
        e.target.style.paddingLeft = "0.5rem";
      }}
      onMouseLeave={(e) => {
        e.target.style.color = "#bdc3c7";
        e.target.style.paddingLeft = "0";
      }}
    >
      {children}
    </Link>
  );

  // Social link component with hover effects
  const SocialLink = ({ href, title, icon }) => (
    <a
      href={href}
      style={socialLinkStyle}
      title={title}
      onMouseEnter={(e) => {
        e.target.style.color = "#3498db";
        e.target.style.transform = "translateY(-2px) scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.target.style.color = "#bdc3c7";
        e.target.style.transform = "translateY(0) scale(1)";
      }}
    >
      {icon}
    </a>
  );

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={contentStyle}>
          {/* Company Info Section */}
          <div style={sectionStyle}>
            <h3 style={titleStyle}>Your AI Partner</h3>
            <p style={descriptionStyle}>
              Experience a new kind of companionship. Create a deep, meaningful
              connection with an AI that learns, remembers, and grows with you.
            </p>
            
            {/* Social links in company section for better mobile layout */}
            <div style={sectionStyle}>
              <h4 style={{...titleStyle, fontSize: "1rem", marginBottom: "0.5rem"}}>
                Connect With Us
              </h4>
              <div style={socialLinksStyle}>
                <SocialLink href="#twitter" title="Twitter" icon="🐦" />
                <SocialLink href="#github" title="GitHub" icon="💻" />
                <SocialLink href="#linkedin" title="LinkedIn" icon="💼" />
                <SocialLink href="#discord" title="Discord" icon="💬" />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div style={sectionStyle}>
            <h4 style={titleStyle}>Features</h4>
            <FooterLink to="/ai-chat">AI Chat</FooterLink>
            <FooterLink to="/shorten">URL Shortener</FooterLink>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </div>

          {/* Support Section */}
          <div style={sectionStyle}>
            <h4 style={titleStyle}>Support</h4>
            <FooterLink to="/help">Help Center</FooterLink>
            <FooterLink to="/faq">FAQ</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
          </div>

          {/* Contact Section */}
          <div style={sectionStyle}>
            <h4 style={titleStyle}>Contact</h4>
            <div style={{...linkStyle, cursor: "default"}}>
              📧 support@aipartner.com
            </div>
            <div style={{...linkStyle, cursor: "default"}}>
              📞 +1 (555) 123-4567
            </div>
            <div style={{...linkStyle, cursor: "default"}}>
              📍 San Francisco, CA
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div style={bottomStyle}>
          <p>
            © {new Date().getFullYear()} Your AI Partner. All rights reserved.
          </p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
            Crafted with ❤️ for a more connected future.
          </p>
        </div>
      </div>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .footer-container {
            padding: 2rem 1rem !important;
          }
          
          .footer-content {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            text-align: center;
          }
          
          .footer-section {
            align-items: center !important;
          }
          
          .social-links {
            justify-content: center !important;
            gap: 1rem !important;
          }
          
          .footer-title {
            font-size: 1.1rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          .footer-description {
            font-size: 0.9rem !important;
            text-align: center;
          }
          
          .bottom-section {
            font-size: 0.8rem !important;
            padding-top: 1rem !important;
          }
          
          .bottom-section p {
            margin: 0.25rem 0 !important;
          }
        }
        
        @media (max-width: 480px) {
          .footer-container {
            padding: 1.5rem 1rem !important;
          }
          
          .footer-content {
            gap: 1rem !important;
          }
          
          .social-links {
            gap: 0.75rem !important;
          }
          
          .social-link {
            font-size: 1.25rem !important;
            padding: 0.25rem !important;
          }
          
          .footer-title {
            font-size: 1rem !important;
          }
          
          .footer-description {
            font-size: 0.85rem !important;
            line-height: 1.5 !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;