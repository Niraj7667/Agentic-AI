// src/components/UrlShortener.jsx
import { useState, useEffect } from "react";
import axios from "../axios";
import { useAuth } from "../context/AuthContext"; // 👈 import the global context

export default function UrlShortener() {
  const [longurl, setLongurl] = useState("");
  const [shortInfo, setShortInfo] = useState(null);
  const [userUrls, setUserUrls] = useState([]); // 👈 store user's URLs
  const [loading, setLoading] = useState(false);

  const { user } = useAuth(); // 👈 use global auth user

  // 👇 Fetch user's URLs
  const fetchUserUrls = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/url/user-urls");
      setUserUrls(res.data);
    } catch (err) {
      console.error("Failed to fetch user URLs:", err);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Create short URL
  const createShort = async () => {
    if (!longurl.trim()) {
      alert("Please enter a URL");
      return;
    }

    try {
      const res = await axios.post("/url/long", { longurl });
      setShortInfo(res.data);
      setLongurl(""); // Clear input
      
      // Refresh the list to show the new URL
      fetchUserUrls();
    } catch (err) {
      console.error(err);
      alert("Failed to shorten URL");
    }
  };

  // 👇 Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy");
    });
  };

  // 👇 Delete URL function
  const deleteUrl = async (urlId) => {
    if (!confirm("Are you sure you want to delete this URL?")) return;

    try {
      await axios.delete(`/url/${urlId}`);
      fetchUserUrls(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete URL:", err);
      alert("Failed to delete URL");
    }
  };

  // 👇 Fetch URLs when component mounts and user changes
  useEffect(() => {
    if (user) {
      fetchUserUrls();
    }
  }, [user]);

  // 👇 Protect component from unauthenticated access
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Please log in to access the URL shortener.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h2>URL Shortener</h2>
      
      {/* Create New Short URL Section */}
      <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>Shorten a New URL</h3>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            value={longurl}
            onChange={(e) => setLongurl(e.target.value)}
            placeholder="Enter long URL (e.g., https://example.com)"
            style={{ 
              flex: 1, 
              padding: "0.5rem", 
              border: "1px solid #ccc", 
              borderRadius: "4px" 
            }}
            onKeyPress={(e) => e.key === "Enter" && createShort()}
          />
          <button 
            onClick={createShort}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Shorten
          </button>
        </div>

        {/* Show newly created URL */}
        {shortInfo && (
          <div style={{ padding: "1rem", backgroundColor: "#d4edda", borderRadius: "4px" }}>
            <p><strong>✅ URL shortened successfully!</strong></p>
            <p><strong>Original:</strong> {shortInfo.longurl}</p>
            <p><strong>Short URL:</strong> 
              <span style={{ marginLeft: "0.5rem" }}>
                http://localhost:3001/url/{shortInfo.shorturl}
                <button 
                  onClick={() => copyToClipboard(`http://localhost:3001/url/${shortInfo.shorturl}`)}
                  style={{ marginLeft: "0.5rem", fontSize: "0.8rem" }}
                >
                  Copy
                </button>
              </span>
            </p>
            {shortInfo.existing && <p><em>Note: This URL was already shortened before.</em></p>}
          </div>
        )}
      </div>

      {/* User's URLs History Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Your Shortened URLs ({userUrls.length})</h3>
          <button 
            onClick={fetchUserUrls} 
            disabled={loading}
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "0.8rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Loading your URLs...</p>
        ) : userUrls.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            No URLs shortened yet. Create your first short URL above!
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {userUrls.map((url) => (
              <div 
                key={url.id} 
                style={{ 
                  padding: "1rem", 
                  border: "1px solid #ddd", 
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa"
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Original URL:</strong>
                  <div style={{ 
                    wordBreak: "break-all", 
                    color: "#0066cc",
                    fontSize: "0.9rem",
                    marginTop: "0.2rem"
                  }}>
                    {url.longurl}
                  </div>
                </div>
                
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Short URL:</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                    <code style={{ 
                      backgroundColor: "#e9ecef", 
                      padding: "0.2rem 0.4rem", 
                      borderRadius: "3px",
                      fontSize: "0.9rem"
                    }}>
                      http://localhost:3001/url/{url.shorturl}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(`http://localhost:3001/url/${url.shorturl}`)}
                      style={{ 
                        fontSize: "0.75rem", 
                        padding: "0.2rem 0.4rem",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer"
                      }}
                    >
                      Copy
                    </button>
                    <a 
                      href={`http://localhost:3001/url/${url.shorturl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: "0.75rem", 
                        padding: "0.2rem 0.4rem",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "3px"
                      }}
                    >
                      Visit
                    </a>
                    <button 
                      onClick={() => deleteUrl(url.id)}
                      style={{ 
                        fontSize: "0.75rem", 
                        padding: "0.2rem 0.4rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {url.createdAt && (
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    Created: {new Date(url.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}