import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsMobileMenuOpen(false); // Close mobile menu after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "1rem 2rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    position: "relative",
  };

  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const logoStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textDecoration: "none",
    color: "white",
  };

  const desktopNavLinksStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  };

  // Mobile styles
  const mobileMenuButtonStyle = {
    display: "none",
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0.5rem",
  };

  const mobileNavLinksStyle = {
    display: isMobileMenuOpen ? "flex" : "none",
    flexDirection: "column",
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    padding: "1rem 2rem",
    gap: "1rem",
    zIndex: 1000,
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    transition: "background-color 0.3s ease",
    textAlign: "center",
  };

  const buttonStyle = {
    ...linkStyle,
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    width: "100%",
  };

  const userInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontSize: "0.9rem",
    padding: "0.5rem 1rem",
  };

  // Media query simulation through JavaScript
  const isMobile = window.innerWidth <= 768;

  // Update styles based on screen size
  if (isMobile) {
    mobileMenuButtonStyle.display = "block";
    desktopNavLinksStyle.display = "none";
  }

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu when link is clicked
  };

  return (
    <header style={headerStyle}>
      <nav style={navStyle}>
        <Link 
          to={user ? "/ai-chat" : "/"} 
          style={logoStyle}
          onClick={handleLinkClick}
        >
          Partner
        </Link>

        {/* Mobile menu button */}
        <button 
          style={mobileMenuButtonStyle} 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Desktop Navigation */}
        <div style={desktopNavLinksStyle}>
          {user ? (
            <>
              <div style={userInfoStyle}>
                <span>Welcome, {user.email || user.displayName || "User"}!</span>
              </div>
              <Link
                to="/ai-chat"
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={buttonStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                style={{
                  ...linkStyle,
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div style={mobileNavLinksStyle}>
        {user ? (
          <>
            <div style={{
              ...userInfoStyle,
              justifyContent: "center",
              fontSize: "0.85rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
              paddingBottom: "1rem",
              marginBottom: "0.5rem",
            }}>
              <span>Welcome, {user.email || user.displayName || "User"}!</span>
            </div>
            <Link
              to="/ai-chat"
              style={linkStyle}
              onClick={handleLinkClick}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={linkStyle}
              onClick={handleLinkClick}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{
                ...linkStyle,
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
              onClick={handleLinkClick}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Add CSS for responsive behavior */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
          header nav {
            padding: 0.75rem 1rem !important;
          }
          .logo {
            font-size: 1.25rem !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;