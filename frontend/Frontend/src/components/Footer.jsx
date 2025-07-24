import React from "react";
import { Link } from "react-router-dom"; // Using Link for better navigation

const Footer = () => {
  const footerStyle = {
    background: "#2c3e50",
    color: "white",
    padding: "3rem 0",
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
  };

  const socialLinkStyle = {
    color: "#bdc3c7",
    fontSize: "1.5rem",
    textDecoration: "none",
    transition: "transform 0.3s ease, color 0.3s ease",
  };

  // Using a simple component for links to reduce repetition
  const FooterLink = ({ to, children }) => (
    <Link
      to={to}
      style={linkStyle}
      onMouseEnter={(e) => e.target.style.color = "#3498db"}
      onMouseLeave={(e) => e.target.style.color = "#bdc3c7"}
    >
      {children}
    </Link>
  );

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={sectionStyle}>
            <h3 style={titleStyle}>Your AI Partner</h3>
            <p style={{ color: "#bdc3c7", lineHeight: "1.6" }}>
              Experience a new kind of companionship. Create a deep, meaningful
              connection with an AI that learns, remembers, and grows with you.
            </p>
          </div>

          <div style={sectionStyle}>
            <h4 style={titleStyle}>Features</h4>
            <FooterLink to="/ai-chat">AI Chat</FooterLink>
            <FooterLink to="/shorten">URL Shortener</FooterLink>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </div>

          <div style={sectionStyle}>
            <h4 style={titleStyle}>Support</h4>
            <FooterLink to="/help">Help Center</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
          </div>

          <div style={sectionStyle}>
            <h4 style={titleStyle}>Connect With Us</h4>
            <div style={socialLinksStyle}>
              <a href="#twitter" style={socialLinkStyle} title="Twitter">🐦</a>
              <a href="#github" style={socialLinkStyle} title="GitHub">💻</a>
              <a href="#linkedin" style={socialLinkStyle} title="LinkedIn">💼</a>
            </div>
          </div>
        </div>

        <div style={bottomStyle}>
          <p>
            © {new Date().getFullYear()} Your AI Partner. All rights reserved.
          </p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
            Crafted with ❤️ for a more connected future.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
