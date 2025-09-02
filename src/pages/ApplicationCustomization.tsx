import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import BrandingEditor from "../components/BrandingEditor";
import { useCustomization, sectionRegistry } from "../hooks/useCustomization";
import { DEFAULT_THEME } from "../types/customization";
import {
  Edit,
  Plus,
  Image as ImageIcon,
  Globe,
  Smartphone,
  X,
  Check,
  BarChart3,
  Monitor,
  Upload,
  Play,
  Eye,
  GripVertical,
  Zap,
} from "lucide-react";
import { Page, PageSection, SectionType } from "../types/customization";

const DEFAULT_COLORS = {
  primary: "#2563eb",
  secondary: "#64748b",
  accent: "#22c55e",
  background: "#ffffff",
  surface: "#f8fafc",
  text: "#0f172a",
  textSecondary: "#475569",
  success: "#16a34a",
  warning: "#f59e0b",
  error: "#ef4444",
};

const DEFAULT_TYPOGRAPHY = {
  fontFamily: "Inter, system-ui, sans-serif",
  headingFont: undefined as string | undefined,
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

type ActiveView = "overview" | "editor" | "theme" | "assets" | "branding";

export default function ApplicationCustomization() {
  const {
    pages,
    theme,
    assets,
    loading,
    createPage,
    updatePage,
    addSection,
    updateSection,
    removeSection,
    reorderSections,
    publishPage,
    uploadAsset,
    importAssetFromUrl,
    updateTheme,
  } = useCustomization({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  const [activeView, setActiveView] = useState<ActiveView>("overview");
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // NEW: refs for smooth scroll (Create Page) and hidden file input (Upload)
  const createNewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageTemplates = [
    { slug: "home", name: "Home Page", icon: "Home", description: "Main landing page" },
    { slug: "menu", name: "Menu Page", icon: "ChefHat", description: "Customer menu display" },
    { slug: "gallery", name: "Gallery Page", icon: "Images", description: "Photo gallery" },
    { slug: "events", name: "Events Page", icon: "Calendar", description: "Events and special occasions" },
    { slug: "contact", name: "Contact Page", icon: "Phone", description: "Contact information" },
    { slug: "live-orders", name: "Live Orders", icon: "Monitor", description: "Order tracking page" },
    { slug: "about", name: "About Page", icon: "Users", description: "About us information" },
  ];

  const sectionCategories = {
    content: { name: "Content", icon: Edit, color: "blue" },
    media: { name: "Media", icon: ImageIcon, color: "purple" },
    interactive: { name: "Interactive", icon: Zap, color: "green" },
    data: { name: "Data", icon: BarChart3, color: "orange" },
  };

  const handleCreatePage = async (template: any) => {
    try {
      const newPage = await createPage({
        slug: template.slug,
        name: template.name,
        seoMeta: { title: template.name, description: template.description, keywords: [] },
      });
      setSelectedPage(newPage);
      setActiveView("editor");
    } catch (err) {
      alert("Failed to create page");
    }
  };

  const handleAddSection = async (sectionType: SectionType) => {
    if (!selectedPage) return;
    try {
      await addSection(selectedPage.id, sectionType);
      setShowSectionPicker(false);
    } catch {
      alert("Failed to add section");
    }
  };

  const handleUpdateSection = async (sectionId: string, props: Record<string, any>) => {
    if (!selectedPage) return;
    try {
      await updateSection(selectedPage.id, sectionId, { props });
      // NEW: optimistic local update for live preview
      setSelectedPage(prev => {
        if (!prev || prev.id !== selectedPage.id) return prev;
        return {
          ...prev,
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, props: { ...s.props, ...props } } : s
          ),
        } as Page;
      });
    } catch {
      alert("Failed to update section");
    }
  };

  // NEW: dedicated visibility toggle with optimistic update
  const handleToggleSectionVisibility = async (sectionId: string, nextVisible: boolean) => {
    if (!selectedPage) return;
    try {
      await updateSection(selectedPage.id, sectionId, { visible: nextVisible });
      setSelectedPage(prev => {
        if (!prev || prev.id !== selectedPage.id) return prev;
        return {
          ...prev,
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, visible: nextVisible } : s
          ),
        } as Page;
      });
    } catch {
      alert("Failed to update visibility");
    }
  };

  const handlePublishPage = async () => {
    if (!selectedPage) return;
    try {
      await publishPage(selectedPage.id, "Published from Application Customization");
      alert("Page published successfully!");
    } catch {
      alert("Failed to publish page");
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{pages.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.filter((p) => p.status === "published").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft Pages</p>
              <p className="text-2xl font-bold text-gray-900">
                {pages.filter((p) => p.status === "draft").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">
                {assets.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Existing Pages */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Existing Pages</h3>
          <button
            onClick={() => createNewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Page</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{page.name}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    page.status === "published"
                      ? "bg-green-100 text-green-800"
                      : page.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {page.status}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>Sections: {page.sections.length}</p>
                <p>Last updated: {page.updatedAt.toLocaleDateString()}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedPage(page);
                    setActiveView("editor");
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm text-center"
                >
                  Preview
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page Templates */}
      <div ref={createNewRef} className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New Page</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageTemplates.map((template) => {
            const existingPage = pages.find((p) => p.slug === template.slug);

            return (
              <div
                key={template.slug}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>

                {existingPage ? (
                  <button
                    onClick={() => {
                      setSelectedPage(existingPage);
                      setActiveView("editor");
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Edit Existing
                  </button>
                ) : (
                  <button
                    onClick={() => handleCreatePage(template)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Page
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderPageEditor = () => {
    if (!selectedPage) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Page Structure */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Page Structure</h3>
              <button
                onClick={() => setShowSectionPicker(true)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {selectedPage.sections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => setSelectedSection(section)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSection?.id === section.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {section.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sectionRegistry[section.type]?.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!section.visible && (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" title="Hidden"></div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSection(selectedPage.id, section.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={handlePublishPage}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Publish
                </button>
                <a
                  href={`/${selectedPage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm text-center"
                >
                  Preview
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Live Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Live Preview</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-2 rounded-lg ${previewMode === "desktop" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode("tablet")}
                  className={`p-2 rounded-lg ${previewMode === "tablet" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                >
                  <Globe className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-2 rounded-lg ${previewMode === "mobile" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className={`border border-gray-300 rounded-lg overflow-hidden ${
                previewMode === "mobile"
                  ? "max-w-sm mx-auto"
                  : previewMode === "tablet"
                    ? "max-w-2xl mx-auto"
                    : "w-full"
              }`}
            >
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600">
                    localhost:3000/{selectedPage.slug}
                  </div>
                </div>
              </div>

              <div className="bg-white min-h-96 p-4">
                {selectedPage.sections
                  .filter((s) => s.visible)
                  .map((section) => (
                    <div
                      key={section.id}
                      className="mb-4 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors border-gray-200 hover:border-gray-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{section.title}</h4>
                        <span className="text-xs text-gray-500">
                          {sectionRegistry[section.type]?.name}
                        </span>
                      </div>

                      {section.type === "hero_video" && (
                        <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
                          <h2 className="text-2xl font-bold mb-2">{section.props.headline}</h2>
                          <p className="text-gray-300 mb-4">{section.props.subheadline}</p>
                          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg">
                            {section.props.cta?.label}
                          </button>
                        </div>
                      )}

                      {section.type === "achievements_counters" && (
                        <div className="grid grid-cols-2 gap-4">
                          {(section.props.items || []).slice(0, 4).map((item: any, index: number) => (
                            <div key={index} className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {item.value}
                                {item.suffix}
                              </div>
                              <div className="text-sm text-gray-600">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.type === "image_gallery" && (
                        <div className="grid grid-cols-3 gap-2">
                          {(section.props.items || []).slice(0, 6).map((item: any, index: number) => (
                            <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                              {item.asset?.url && (
                                <img src={item.asset.url} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {section.type === "cta_banner" && (
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg text-center">
                          <h3 className="text-xl font-bold mb-2">{section.props.headline}</h3>
                          <p className="text-orange-100 mb-4">{section.props.subtext}</p>
                          <button className="bg-white text-orange-600 px-4 py-2 rounded-lg">
                            {section.props.cta?.label}
                          </button>
                        </div>
                      )}

                      {section.type === "contact_block" && (
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Address:</strong> {section.props.address}
                          </p>
                          <p className="text-sm">
                            <strong>Phone:</strong> {section.props.phone}
                          </p>
                          <p className="text-sm">
                            <strong>Email:</strong> {section.props.email}
                          </p>
                        </div>
                      )}

                      {section.type === "rich_text" && (
                        <div
                          className="prose prose-sm"
                          dangerouslySetInnerHTML={{ __html: section.props.content }}
                        />
                      )}

                      {section.type === "faq_accordion" && (
                        <div className="space-y-2">
                          {(section.props.items || []).slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded p-2">
                              <div className="font-medium text-sm">{item.question}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {item.answer?.substring(0, 50)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                {selectedPage.sections.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No sections added yet</p>
                    <p className="text-sm">Click the + button to add your first section</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Section Inspector */}
        <div className="lg:col-span-1">
          {selectedSection ? (
            <SectionInspector
              section={selectedSection}
              onUpdate={(props) => handleUpdateSection(selectedSection.id, props)}
              onToggleVisibility={() =>
                handleToggleSectionVisibility(selectedSection.id, !selectedSection.visible)
              }
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center text-gray-500">
                <Edit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a section to edit its properties</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderThemeEditor = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Theme & Branding</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colors */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Colors</h4>
            <div className="space-y-4">
              {Object.entries(theme?.colors || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) =>
                        updateTheme({
                          colors: { ...(theme?.colors ?? DEFAULT_THEME.colors), [key]: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        updateTheme({
                          colors: { ...(theme?.colors ?? DEFAULT_THEME.colors), [key]: e.target.value },
                        })
                      }
                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Typography</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={theme?.typography.fontFamily}
                  onChange={(e) =>
                    updateTheme({
                      typography: {
                        ...(theme?.typography ?? DEFAULT_THEME.typography),
                        fontFamily: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Inter, system-ui, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Open Sans, sans-serif">Open Sans</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssetsLibrary = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Assets Library</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
            <button
              onClick={async () => {
                const url = window.prompt("Enter asset URL");
                if (!url) return;
                try {
                  await importAssetFromUrl(url);
                } catch {
                  alert("Failed to import URL");
                }
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Import URL</span>
            </button>
          </div>
        </div>

        {/* hidden file input for Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              await uploadAsset(file);
              e.currentTarget.value = "";
            } catch {
              alert("Failed to upload asset");
            }
          }}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100">
                {asset.kind === "IMAGE" ? (
                  <img src={asset.url} alt={asset.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <div className="text-xs text-gray-600 truncate">{asset.alt || "Untitled"}</div>
                <div className="text-xs text-gray-400">{asset.kind}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customization dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin nav (fixed routes) */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">Dashboard</Link>
            <Link to="/menu-management" className="text-gray-500 hover:text-gray-700 pb-2">Menu Management</Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">Orders</Link>
            <Link to="/table-management" className="text-gray-500 hover:text-gray-700 pb-2">Table Management</Link>
            <Link to="/staff" className="text-gray-500 hover:text-gray-700 pb-2">Staff Management</Link>
            <Link to="/kds" className="text-gray-500 hover:text-gray-700 pb-2">Kitchen Dashboard</Link>
            <Link to="/analytics" className="text-gray-500 hover:text-gray-700 pb-2">Analytics</Link>
            <Link to="/application-customization" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Application Customization
            </Link>
            <Link to="/branding" className="text-gray-500 hover:text-gray-700 pb-2">Settings</Link>
          </div>
        </nav>

        {/* Sub Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveView("overview")}
              className={`pb-2 font-medium ${activeView === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView("editor")}
              className={`pb-2 font-medium ${activeView === "editor" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Page Editor
            </button>
            <button
              onClick={() => setActiveView("branding")}
              className={`pb-2 font-medium ${activeView === "branding" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Branding & Assets
            </button>
            <button
              onClick={() => setActiveView("theme")}
              className={`pb-2 font-medium ${activeView === "theme" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Theme & Branding
            </button>
            <button
              onClick={() => setActiveView("assets")}
              className={`pb-2 font-medium ${activeView === "assets" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Assets Library
            </button>
          </div>
        </nav>

        {/* Content */}
        {activeView === "overview" && renderOverview()}
        {activeView === "editor" && renderPageEditor()}
        {activeView === "branding" && <BrandingEditor tenantId="tenant_123" locationId="location_456" />}
        {activeView === "theme" && renderThemeEditor()}
        {activeView === "assets" && renderAssetsLibrary()}
      </div>

      {/* Section Picker Modal */}
      {showSectionPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Section</h3>
                <button onClick={() => setShowSectionPicker(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {Object.entries(sectionCategories).map(([categoryKey, category]) => (
                <div key={categoryKey}>
                  <div className="flex items-center space-x-2 mb-4">
                    <category.icon className={`w-5 h-5 text-${category.color}-600`} />
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(sectionRegistry)
                      .filter((schema) => schema.category === categoryKey)
                      .map((schema) => (
                        <button
                          key={schema.type}
                          onClick={() => handleAddSection(schema.type)}
                          className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-8 h-8 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                              <category.icon className={`w-4 h-4 text-${category.color}-600`} />
                            </div>
                            <h5 className="font-medium text-gray-900">{schema.name}</h5>
                          </div>
                          <p className="text-sm text-gray-600">{schema.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{schema.preview}</p>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Section Inspector Component
function SectionInspector({
  section,
  onUpdate,
  onToggleVisibility,
}: {
  section: PageSection;
  onUpdate: (props: Record<string, any>) => void;
  onToggleVisibility: () => void;
}) {
  const schema = sectionRegistry[section.type];

  const updateProp = (key: string, value: any) => {
    onUpdate({ ...section.props, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">{schema?.name}</h3>
        <button
          onClick={onToggleVisibility}
          className={`p-2 rounded-lg ${section.visible ? "text-green-600" : "text-gray-400"}`}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Section Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dynamic Props */}
        {section.type === "hero_video" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
              <input
                type="url"
                value={section.props.videoUrl || ""}
                onChange={(e) => updateProp("videoUrl", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/video.mp4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={section.props.headline || ""}
                onChange={(e) => updateProp("headline", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subheadline</label>
              <textarea
                value={section.props.subheadline || ""}
                onChange={(e) => updateProp("subheadline", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={section.props.cta?.label || ""}
                  onChange={(e) => updateProp("cta", { ...section.props.cta, label: e.target.value })}
                  placeholder="Button text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={section.props.cta?.href || ""}
                  onChange={(e) => updateProp("cta", { ...section.props.cta, href: e.target.value })}
                  placeholder="Link URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        {section.type === "rich_text" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={section.props.content || ""}
              onChange={(e) => updateProp("content", e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter HTML content..."
            />
          </div>
        )}

        {section.type === "contact_block" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={section.props.address || ""}
                onChange={(e) => updateProp("address", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={section.props.phone || ""}
                onChange={(e) => updateProp("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={section.props.email || ""}
                onChange={(e) => updateProp("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {section.type === "cta_banner" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={section.props.headline || ""}
                onChange={(e) => updateProp("headline", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtext</label>
              <textarea
                value={section.props.subtext || ""}
                onChange={(e) => updateProp("subtext", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={section.props.cta?.label || ""}
                  onChange={(e) => updateProp("cta", { ...section.props.cta, label: e.target.value })}
                  placeholder="Button text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={section.props.cta?.href || ""}
                  onChange={(e) => updateProp("cta", { ...section.props.cta, href: e.target.value })}
                  placeholder="Link URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}