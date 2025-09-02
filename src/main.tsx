import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ✅ Context Providers
import { AccessControlProvider } from "@/contexts/AccessControlContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { BrandingProvider } from "@/contexts/BrandingContext";

// ✅ Strict mode enabled for stability and debugging
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* 🔹 AccessControlProvider → fetches /auth/whoami */}
    <AccessControlProvider>
      {/* 🔹 TenantProvider → exposes tenantId derived from currentUser */}
      <TenantProvider>
        {/* 🔹 BrandingProvider → MUST receive tenantId for correct logos, theme, etc */}
        <BrandingProvider tenantId="">
          <App />
        </BrandingProvider>
      </TenantProvider>
    </AccessControlProvider>
  </React.StrictMode>
);