import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export function Logo({ className = "", width, height, alt = "Curly Ellie Hair Lotion" }: LogoProps) {
  const { data: logoSetting, refetch } = trpc.siteSettings.get.useQuery({ key: "site_logo" });
  const [cacheBustParam, setCacheBustParam] = useState(Date.now());
  
  const baseLogoUrl = logoSetting?.settingValue || "/curly-ellie-logo.png";
  // Add cache-busting parameter to force fresh image load
  const logoUrl = baseLogoUrl.includes("?") 
    ? `${baseLogoUrl}&t=${cacheBustParam}` 
    : `${baseLogoUrl}?t=${cacheBustParam}`;
  
  // Refetch logo when window regains focus to catch updates from admin panel
  useEffect(() => {
    const handleFocus = () => {
      refetch();
      setCacheBustParam(Date.now());
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  // Poll for logo updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setCacheBustParam(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={(e) => {
        // Fallback to default logo if custom logo fails to load
        const img = e.target as HTMLImageElement;
        if (!img.src.includes("/curly-ellie-logo.png")) {
          img.src = `/curly-ellie-logo.png?t=${Date.now()}`;
        }
      }}
    />
  );
}
