import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "1rem 2rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
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

  const navLinksStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    transition: "background-color 0.3s ease",
  };

  const buttonStyle = {
    ...linkStyle,
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  };

  const userInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontSize: "0.9rem",
  };

  return (
    <header style={headerStyle}>
      <nav style={navStyle}>
        {/* <Link to={user ? "/shorten" : "/"} style={logoStyle}>
          URL Shortener
        </Link> */}

        <Link to={user ? "/ai-chat" : "/"} style={logoStyle}>
          Partner
        </Link>

        <div style={navLinksStyle}>
          {user ? (
            // Authenticated user navigation
            <>
              <div style={userInfoStyle}>
                <span>Welcome, {user.email || user.displayName || "User"}!</span>
              </div>
              <Link
                // to="/shorten"
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
            // Guest user navigation
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
    </header>
  );
};

export default Header;