// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { HashRouter } from "react-router-dom";
import { AccessControlProvider } from "@/contexts/AccessControlContext";
import { TenantProvider, useTenant } from "@/contexts/TenantContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLoader } from "@/components/AppLoader";
import { useAccessControl } from "@/contexts/AccessControlContext";

function BrandingWithTenant({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAccessControl();
  const tenantId = currentUser?.tenantId ?? "";
  return <BrandingProvider tenantId={tenantId}>{children}</BrandingProvider>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AccessControlProvider>
        <TenantProvider>
          <BrandingWithTenant>
            <HashRouter>
              <React.Suspense fallback={<AppLoader />}>
                <App />
              </React.Suspense>
            </HashRouter>
          </BrandingWithTenant>
        </TenantProvider>
      </AccessControlProvider>
    </ErrorBoundary>
  </React.StrictMode>
);