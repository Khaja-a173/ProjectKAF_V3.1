import { useState, useCallback } from "react";
import { updateGlobalBranding } from "../contexts/BrandingContext";

interface BrandingAssets {
  logoHeader?: string;
  logoHeaderDark?: string;
  favicon?: string;
  appIcon?: string;
  ogImage?: string;
}

interface BrandingDraft {
  assets: BrandingAssets;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

interface BrandingVersion {
  id: string;
  version: number;
  assets: BrandingAssets;
  publishedAt: Date;
  publishedBy: string;
  changelog?: string;
}

interface AssetUploadResult {
  url: string;
  secureUrl: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

export function useBrandingManagement(_tenantId: string, _locationId?: string) {
  const [draft, setDraft] = useState<BrandingDraft>({
    assets: {},
    colors: {},
  });
  const [versions, setVersions] = useState<BrandingVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadAsset = useCallback(
    async (
      file: File,
      assetType: keyof BrandingAssets,
    ): Promise<AssetUploadResult> => {
      try {
        setUploading(true);
        console.log("📤 Uploading asset:", file.name, "for", assetType);

        // Validate file
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed");
        }

        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          throw new Error("File size must be less than 5MB");
        }

        // Simulate upload to CDN
        const mockUrl = URL.createObjectURL(file);

        // Create optimized versions based on asset type
        let optimizedUrl = mockUrl;
        if (assetType === "favicon") {
          // Generate favicon sizes: 16x16, 32x32, 48x48
          optimizedUrl = mockUrl;
        } else if (assetType === "appIcon") {
          // Generate app icon sizes: 180x180, 192x192, 512x512
          optimizedUrl = mockUrl;
        }

        const result: AssetUploadResult = {
          url: optimizedUrl,
          secureUrl: optimizedUrl,
          metadata: {
            width: 1920, // Would be actual dimensions
            height: 1080,
            size: file.size,
            format: file.type,
          },
        };

        // Update draft
        setDraft((prev) => ({
          ...prev,
          assets: {
            ...prev.assets,
            [assetType]: result.url,
          },
        }));

        console.log("✅ Asset uploaded successfully:", assetType);
        return result;
      } catch (err) {
        console.error("❌ Failed to upload asset:", err);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const importAssetFromUrl = useCallback(
    async (
      url: string,
      assetType: keyof BrandingAssets,
    ): Promise<AssetUploadResult> => {
      try {
        setUploading(true);
        console.log("📥 Importing asset from URL:", url, "for", assetType);

        // Validate URL
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          throw new Error("Please provide a valid HTTP/HTTPS URL");
        }

        // In real implementation, server would fetch and validate the asset
        // For now, we'll use the URL directly
        const result: AssetUploadResult = {
          url: url,
          secureUrl: url,
          metadata: {
            width: 1920, // Would be fetched from actual image
            height: 1080,
            size: 0, // Unknown for external URLs
            format: "unknown",
          },
        };

        // Update draft
        setDraft((prev) => ({
          ...prev,
          assets: {
            ...prev.assets,
            [assetType]: result.url,
          },
        }));

        console.log("✅ Asset imported successfully:", assetType);
        return result;
      } catch (err) {
        console.error("❌ Failed to import asset:", err);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const removeAsset = useCallback((assetType: keyof BrandingAssets) => {
    setDraft((prev) => ({
      ...prev,
      assets: {
        ...prev.assets,
        [assetType]: undefined,
      },
    }));
  }, []);

  const updateColors = useCallback(
    (colors: Partial<BrandingDraft["colors"]>) => {
      setDraft((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          ...colors,
        },
      }));
    },
    [],
  );

  const saveDraft = useCallback(async () => {
    try {
      setLoading(true);
      console.log("💾 Saving branding draft");

      // In real implementation, this would save to database
      // For now, we'll just update local state

      console.log("✅ Draft saved successfully");
    } catch (err) {
      console.error("❌ Failed to save draft:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [draft]);

  const publishBranding = useCallback(
    async (changelog?: string) => {
      try {
        setLoading(true);
        console.log("🚀 Publishing branding changes");

        // Create new version
        const newVersion: BrandingVersion = {
          id: `version_${Date.now()}`,
          version: Date.now(),
          assets: { ...draft.assets },
          publishedAt: new Date(),
          publishedBy: "current_user",
          changelog,
        };

        // Update global branding state
        updateGlobalBranding(() => ({
          version: newVersion.version,
          assets: { ...draft.assets },
          colors: draft.colors,
          updatedAt: new Date(),
        }));

        // Add to versions history
        setVersions((prev) => [newVersion, ...prev]);

        // Simulate real-time broadcast
        setTimeout(() => {
          console.log("📡 Broadcasting branding update to all clients");
          // In real app, this would trigger WebSocket/SSE events
        }, 100);

        console.log("✅ Branding published successfully");
      } catch (err) {
        console.error("❌ Failed to publish branding:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [draft],
  );

  const rollbackToVersion = useCallback(
    async (versionId: string) => {
      try {
        setLoading(true);
        console.log("⏪ Rolling back to version:", versionId);

        const version = versions.find((v) => v.id === versionId);
        if (!version) {
          throw new Error("Version not found");
        }

        // Update global branding state
        updateGlobalBranding(() => ({
          version: Date.now(), // New version number
          assets: { ...version.assets },
          updatedAt: new Date(),
        }));

        // Update draft to match rolled back version
        setDraft({
          assets: { ...version.assets },
          colors: {},
        });

        console.log("✅ Rollback completed successfully");
      } catch (err) {
        console.error("❌ Failed to rollback:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [versions],
  );

  const previewAsset = useCallback(
    (assetType: keyof BrandingAssets, url: string) => {
      // Update draft for preview
      setDraft((prev) => ({
        ...prev,
        assets: {
          ...prev.assets,
          [assetType]: url,
        },
      }));
    },
    [],
  );

  return {
    draft,
    versions,
    loading,
    uploading,
    uploadAsset,
    importAssetFromUrl,
    removeAsset,
    updateColors,
    saveDraft,
    publishBranding,
    rollbackToVersion,
    previewAsset,
  };
}
