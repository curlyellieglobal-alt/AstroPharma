import { useLocation } from "wouter";
import { useEffect, useState } from "react";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session");
    const pinVerified = localStorage.getItem("admin_pin_verified");
    const rememberMe = localStorage.getItem("admin_remember_me");
    const sessionExpiry = localStorage.getItem("admin_session_expiry");
    
    // Check if session has expired
    if (rememberMe && sessionExpiry) {
      const expiryTime = parseInt(sessionExpiry);
      if (Date.now() > expiryTime) {
        // Session expired, clear all auth data
        localStorage.removeItem("admin_session");
        localStorage.removeItem("admin_pin_verified");
        localStorage.removeItem("admin_remember_me");
        localStorage.removeItem("admin_session_expiry");
        setLocation("/admin-login");
        setIsLoading(false);
        return;
      }
    }
    
    if (!adminSession || !pinVerified) {
      // Redirect to login if not authenticated
      setLocation("/admin-login");
    } else {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
