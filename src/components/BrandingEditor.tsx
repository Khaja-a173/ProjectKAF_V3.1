import { useState } from "react";
import { useBrandingManagement } from "../hooks/useBrandingManagement";
import {
  Upload,
  Link as LinkIcon,
  Eye,
  History,
  Image as ImageIcon,
  RotateCcw,
  X,
  Globe,
  Smartphone,
  Monitor,
  Rocket,
} from "lucide-react";

interface BrandingEditorProps {
  tenantId: string;
  locationId?: string;
}

export default function BrandingEditor({
  tenantId,
  locationId,
}: BrandingEditorProps) {
  const {
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
  } = useBrandingManagement(tenantId, locationId);

  const [activeTab, setActiveTab] = useState<"logos" | "colors" | "versions">(
    "logos",
  );
  const [importUrl, setImportUrl] = useState("");
  const [importType, setImportType] =
    useState<keyof typeof draft.assets>("logoHeader");
  const [showVersions, setShowVersions] = useState(false);
  const [publishChangelog, setPublishChangelog] = useState("");
  const [showPublishModal, setShowPublishModal] = useState(false);

  const assetTypes = [
    {
      key: "logoHeader" as const,
      name: "Header Logo (Light)",
      description: "Main logo for light backgrounds",
      icon: ImageIcon,
      recommendations: "SVG preferred, 200×60px max, transparent background",
    },
    {
      key: "logoHeaderDark" as const,
      name: "Header Logo (Dark)",
      description: "Logo variant for dark backgrounds",
      icon: ImageIcon,
      recommendations: "SVG preferred, 200×60px max, light colors",
    },
    {
      key: "favicon" as const,
      name: "Favicon",
      description: "Browser tab icon",
      icon: Globe,
      recommendations: "ICO or PNG, 32×32px, simple design",
    },
    {
      key: "appIcon" as const,
      name: "App Icon",
      description: "Mobile app icon",
      icon: Smartphone,
      recommendations: "PNG, 512×512px, no transparency",
    },
    {
      key: "ogImage" as const,
      name: "Social Preview",
      description: "Open Graph image for social sharing",
      icon: Monitor,
      recommendations: "PNG/JPG, 1200×630px, includes text/logo",
    },
  ];

  const handleFileUpload = async (
    file: File,
    assetType: keyof typeof draft.assets,
  ) => {
    try {
      await uploadAsset(file, assetType);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleUrlImport = async () => {
    if (!importUrl.trim()) return;

    try {
      await importAssetFromUrl(importUrl, importType);
      setImportUrl("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Import failed");
    }
  };

  const handlePublish = async () => {
    try {
      await publishBranding(publishChangelog);
      setShowPublishModal(false);
      setPublishChangelog("");
      alert("Branding published successfully! Changes are now live.");
    } catch (err) {
      alert("Failed to publish branding changes");
    }
  };

  const hasChanges =
    Object.values(draft.assets).some((asset) => asset) ||
    Object.values(draft.colors || {}).some((color) => color);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Branding & Assets
          </h2>
          <p className="text-gray-600">
            Customize your brand appearance across all pages
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">
              Live Updates
            </span>
          </div>
          {hasChanges && (
            <button
              onClick={() => setShowPublishModal(true)}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Rocket className="w-4 h-4" />
              <span>Publish Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("logos")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "logos"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Logos & Assets
          </button>
          <button
            onClick={() => setActiveTab("colors")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "colors"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Colors & Theme
          </button>
          <button
            onClick={() => setActiveTab("versions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "versions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Version History
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "logos" && (
        <div className="space-y-8">
          {/* URL Import Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Quick Import from URL
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={importType}
                onChange={(e) =>
                  setImportType(e.target.value as keyof typeof draft.assets)
                }
                className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {assetTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.name}
                  </option>
                ))}
              </select>
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleUrlImport}
                disabled={!importUrl.trim() || uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Import</span>
              </button>
            </div>
          </div>

          {/* Asset Management Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assetTypes.map((assetType) => (
              <div
                key={assetType.key}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <assetType.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {assetType.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {assetType.description}
                    </p>
                  </div>
                </div>

                {/* Current Asset Preview */}
                <div className="mb-4">
                  {draft.assets[assetType.key] ? (
                    <div className="relative">
                      <img
                        src={draft.assets[assetType.key]}
                        alt={assetType.name}
                        className="w-full h-24 object-contain bg-gray-50 rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeAsset(assetType.key)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        No asset uploaded
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Actions */}
                <div className="space-y-3">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, assetType.key);
                      }}
                      className="hidden"
                      id={`upload-${assetType.key}`}
                    />
                    <label
                      htmlFor={`upload-${assetType.key}`}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload from Device</span>
                    </label>
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <strong>Recommendations:</strong>
                    <br />
                    {assetType.recommendations}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "colors" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Brand Colors
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={draft.colors?.primary || "#EA580C"}
                    onChange={(e) => updateColors({ primary: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={draft.colors?.primary || "#EA580C"}
                    onChange={(e) => updateColors({ primary: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#EA580C"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={draft.colors?.secondary || "#DC2626"}
                    onChange={(e) =>
                      updateColors({ secondary: e.target.value })
                    }
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={draft.colors?.secondary || "#DC2626"}
                    onChange={(e) =>
                      updateColors({ secondary: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#DC2626"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={draft.colors?.accent || "#F59E0B"}
                    onChange={(e) => updateColors({ accent: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={draft.colors?.accent || "#F59E0B"}
                    onChange={(e) => updateColors({ accent: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#F59E0B"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Color Preview</h4>
              <div className="flex space-x-4">
                <div
                  className="w-16 h-16 rounded-lg shadow-sm"
                  style={{
                    backgroundColor: draft.colors?.primary || "#EA580C",
                  }}
                ></div>
                <div
                  className="w-16 h-16 rounded-lg shadow-sm"
                  style={{
                    backgroundColor: draft.colors?.secondary || "#DC2626",
                  }}
                ></div>
                <div
                  className="w-16 h-16 rounded-lg shadow-sm"
                  style={{ backgroundColor: draft.colors?.accent || "#F59E0B" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "versions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Version History
            </h3>

            {versions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No published versions yet</p>
                <p className="text-sm">
                  Publish your first branding changes to see version history
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Version {version.version}
                        </div>
                        <div className="text-sm text-gray-600">
                          Published {version.publishedAt.toLocaleDateString()}{" "}
                          by {version.publishedBy}
                        </div>
                        {version.changelog && (
                          <div className="text-sm text-gray-500 mt-1">
                            {version.changelog}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => rollbackToVersion(version.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Rollback</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Publish Branding Changes
            </h3>
            <p className="text-gray-600 mb-4">
              Your changes will be applied instantly across all pages and apps.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Changelog (Optional)
              </label>
              <textarea
                value={publishChangelog}
                onChange={(e) => setPublishChangelog(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what you changed..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Rocket className="w-4 h-4" />
                <span>Publish Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(loading || uploading) && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">
              {uploading ? "Uploading asset..." : "Publishing changes..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
