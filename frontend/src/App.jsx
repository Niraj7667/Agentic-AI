import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";

// Your existing components
import Login from "./Authentication/Login";
import Signup from "./Authentication/Signup";
import UrlShortener from "./components/UrlShortner";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./context/AuthContext";

// --- NEW --- Import the main page for the AI Chat feature
import AiChatPage from "./components/aiChatPage";

const Layout = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Header />
    <main style={{ flex: 1, padding: "2rem" }}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/ai-chat" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <PublicRoute>
            <Signup />
          </PublicRoute>
        ),
      },
      {
        path: "shorten",
        element: (
          <ProtectedRoute>
            <UrlShortener />
          </ProtectedRoute>
        ),
      },
      // --- NEW ROUTE FOR THE CHATBOT ---
      // This adds the AI Chat feature as a new, protected page in your app.
      {
        path: "ai-chat",
        element: (
          <ProtectedRoute>
            <AiChatPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
