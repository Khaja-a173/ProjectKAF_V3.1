import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface BrandingAssets {
  logoHeader?: string;
  logoHeaderDark?: string;
  favicon?: string;
  appIcon?: string;
  ogImage?: string;
}

interface BrandingConfig {
  version: number;
  assets: BrandingAssets;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  updatedAt: Date;
}

interface BrandingContextType {
  branding: BrandingConfig;
  loading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(
  undefined,
);

// Global branding state for real-time sync
let globalBrandingState: BrandingConfig = {
  version: 1,
  assets: {
    // Default fallback assets (current static assets)
    logoHeader: undefined, // Will fallback to hardcoded logo
    logoHeaderDark: undefined,
    favicon: undefined,
    appIcon: undefined,
    ogImage: undefined,
  },
  updatedAt: new Date(),
};

const brandingSubscribers: Set<(branding: BrandingConfig) => void> = new Set();

const notifyBrandingSubscribers = () => {
  console.log("🎨 Notifying branding subscribers of changes");
  brandingSubscribers.forEach((callback) =>
    callback({ ...globalBrandingState }),
  );
};

export const updateGlobalBranding = (
  updater: (prev: BrandingConfig) => BrandingConfig,
) => {
  const prevState = { ...globalBrandingState };
  globalBrandingState = updater(globalBrandingState);
  console.log("🎨 Branding state updated:", {
    version: globalBrandingState.version,
    hasLogo: !!globalBrandingState.assets.logoHeader,
  });
  notifyBrandingSubscribers();
};

interface BrandingProviderProps {
  children: ReactNode;
  tenantId: string;
  locationId?: string;
}

export function BrandingProvider({
  children,
  tenantId,
  locationId,
}: BrandingProviderProps) {
  const [branding, setBranding] = useState<BrandingConfig>(globalBrandingState);
  const [loading, setLoading] = useState(false);

  // Subscribe to global branding changes
  useEffect(() => {
    const updateBranding = (newBranding: BrandingConfig) => {
      console.log("🎨 Received branding update:", newBranding.version);
      setBranding(newBranding);
      setLoading(false);
    };

    brandingSubscribers.add(updateBranding);

    // Initialize with current global state
    setBranding({ ...globalBrandingState });

    return () => {
      brandingSubscribers.delete(updateBranding);
    };
  }, []);

  const refreshBranding = async () => {
    try {
      setLoading(true);
      // In real implementation, this would fetch from API
      // For now, we use the global state
      console.log("🔄 Refreshing branding for tenant:", tenantId);
      setBranding({ ...globalBrandingState });
    } catch (err) {
      console.error("❌ Failed to refresh branding:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}

// Hook for components to get logo with fallbacks
export function useLogo() {
  const { branding } = useBranding();

  return {
    logoHeader: branding.assets.logoHeader || null, // Fallback to null for default handling
    logoHeaderDark: branding.assets.logoHeaderDark || null,
    favicon: branding.assets.favicon || "/vite.svg", // Default favicon
    appIcon: branding.assets.appIcon || "/vite.svg",
    ogImage: branding.assets.ogImage || null,
  };
}
