import { useState, useEffect, useCallback } from "react";
import {
  Page,
  PageSection,
  Theme,
  Asset,
  SectionSchema,
  PageVersion,
  DEFAULT_THEME,
} from "../types/customization";

// Global state for customization data (simulating real-time sync)
let globalCustomizationState: {
  pages: Page[];
  theme: Theme;
  assets: Asset[];
  versions: PageVersion[];
} = {
  // Start with empty pages - only show custom content when tenant actively customizes
  pages: [],
  theme: { ...DEFAULT_THEME, tenantId: "tenant_123" },
  assets: [],
  versions: [],
};

const customizationSubscribers: Set<
  (state: typeof globalCustomizationState) => void
> = new Set();

const notifySubscribers = () => {
  console.log("🔄 Notifying customization subscribers");
  customizationSubscribers.forEach((callback) =>
    callback({ ...globalCustomizationState }),
  );
};

const updateGlobalCustomization = (
  updater: (
    prev: typeof globalCustomizationState,
  ) => typeof globalCustomizationState,
) => {
  globalCustomizationState = updater(globalCustomizationState);
  console.log("📝 Customization state updated");
  notifySubscribers();
};

// Section Registry with schemas and default props
export const sectionRegistry: Record<string, SectionSchema> = {
  hero_video: {
    type: "hero_video",
    name: "Hero Video",
    description:
      "Full-screen video background with overlay text and call-to-action",
    icon: "Play",
    category: "media",
    schema: {
      type: "object",
      required: ["videoUrl", "headline"],
      properties: {
        videoUrl: { type: "string", format: "uri" },
        headline: { type: "string", maxLength: 100 },
        subheadline: { type: "string", maxLength: 200 },
        cta: {
          type: "object",
          properties: {
            label: { type: "string", maxLength: 30 },
            href: { type: "string" },
          },
        },
        overlayOpacity: { type: "number", minimum: 0, maximum: 1 },
      },
    },
    defaultProps: {
      videoUrl: "",
      headline: "Welcome to Our Restaurant",
      subheadline: "Experience exceptional dining",
      cta: { label: "Book Now", href: "/book-table" },
      overlayOpacity: 0.5,
    },
    preview: "Full-screen video with text overlay",
  },
  image_gallery: {
    type: "image_gallery",
    name: "Image Gallery",
    description: "Responsive image grid with lightbox functionality",
    icon: "Images",
    category: "media",
    schema: {
      type: "object",
      required: ["items"],
      properties: {
        items: {
          type: "array",
          maxItems: 50,
          items: {
            type: "object",
            required: ["asset"],
            properties: {
              asset: { type: "object" },
              caption: { type: "string", maxLength: 100 },
              tags: { type: "array", items: { type: "string" } },
            },
          },
        },
        layout: { type: "string", enum: ["masonry", "justified", "grid"] },
        columnsByBreakpoint: { type: "object" },
      },
    },
    defaultProps: {
      items: [],
      layout: "masonry",
      columnsByBreakpoint: { sm: 1, md: 2, lg: 3, xl: 4 },
    },
    preview: "Responsive image grid",
  },
  achievements_counters: {
    type: "achievements_counters",
    name: "Achievement Counters",
    description: "Animated counters displaying key metrics and achievements",
    icon: "Award",
    category: "data",
    schema: {
      type: "object",
      required: ["items"],
      properties: {
        items: {
          type: "array",
          maxItems: 8,
          items: {
            type: "object",
            required: ["label", "value"],
            properties: {
              label: { type: "string", maxLength: 50 },
              value: { type: "number" },
              suffix: { type: "string", maxLength: 10 },
              icon: { type: "string" },
            },
          },
        },
        bgAsset: { type: "object" },
        overlay: { type: "number", minimum: 0, maximum: 1 },
      },
    },
    defaultProps: {
      items: [
        { label: "Years of Excellence", value: 10, suffix: "+", icon: "Award" },
      ],
      overlay: 0.8,
    },
    preview: "Animated achievement counters",
  },
  cta_banner: {
    type: "cta_banner",
    name: "Call to Action Banner",
    description: "Prominent banner with call-to-action button",
    icon: "ArrowRight",
    category: "content",
    schema: {
      type: "object",
      required: ["headline", "cta"],
      properties: {
        headline: { type: "string", maxLength: 100 },
        subtext: { type: "string", maxLength: 200 },
        cta: {
          type: "object",
          required: ["label", "href"],
          properties: {
            label: { type: "string", maxLength: 30 },
            href: { type: "string" },
          },
        },
        bgColor: { type: "string" },
        textColor: { type: "string" },
      },
    },
    defaultProps: {
      headline: "Ready to Experience Excellence?",
      subtext: "Book your table today and discover exceptional dining",
      cta: { label: "Book Now", href: "/book-table" },
      bgColor: "gradient",
      textColor: "white",
    },
    preview: "Prominent call-to-action banner",
  },
  contact_block: {
    type: "contact_block",
    name: "Contact Information",
    description: "Contact details with address, hours, and social links",
    icon: "Phone",
    category: "content",
    schema: {
      type: "object",
      required: ["address", "phone", "email"],
      properties: {
        address: { type: "string", maxLength: 200 },
        phone: { type: "string", maxLength: 20 },
        email: { type: "string", format: "email" },
        hours: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "string" },
              hours: { type: "string" },
            },
          },
        },
        socials: { type: "array" },
        mapEmbedUrl: { type: "string", format: "uri" },
      },
    },
    defaultProps: {
      address: "123 Restaurant Street, City, State 12345",
      phone: "+1 (555) 123-4567",
      email: "info@restaurant.com",
      hours: [
        { day: "Monday - Thursday", hours: "5:00 PM - 10:00 PM" },
        { day: "Friday - Saturday", hours: "5:00 PM - 11:00 PM" },
        { day: "Sunday", hours: "4:00 PM - 9:00 PM" },
      ],
      socials: [],
    },
    preview: "Contact information block",
  },
  rich_text: {
    type: "rich_text",
    name: "Rich Text Content",
    description: "Formatted text content with HTML support",
    icon: "Type",
    category: "content",
    schema: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string" },
        format: { type: "string", enum: ["html", "markdown"] },
      },
    },
    defaultProps: {
      content: "<p>Add your content here...</p>",
      format: "html",
    },
    preview: "Rich text editor content",
  },
  faq_accordion: {
    type: "faq_accordion",
    name: "FAQ Accordion",
    description: "Collapsible frequently asked questions",
    icon: "HelpCircle",
    category: "interactive",
    schema: {
      type: "object",
      required: ["items"],
      properties: {
        items: {
          type: "array",
          maxItems: 20,
          items: {
            type: "object",
            required: ["question", "answer"],
            properties: {
              question: { type: "string", maxLength: 200 },
              answer: { type: "string", maxLength: 1000 },
            },
          },
        },
      },
    },
    defaultProps: {
      items: [
        {
          question: "Do you take reservations?",
          answer:
            "Yes, we highly recommend making reservations, especially for dinner service and weekends.",
        },
      ],
    },
    preview: "Collapsible FAQ section",
  },
};

interface UseCustomizationProps {
  tenantId: string;
  locationId?: string;
}

export function useCustomization({
  tenantId,
  locationId,
}: UseCustomizationProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  // Subscribe to global customization changes
  useEffect(() => {
    const updateState = (newState: typeof globalCustomizationState) => {
      console.log("🔄 Received customization update");
      setPages(newState.pages);
      setTheme(newState.theme);
      setAssets(newState.assets);
      setVersions(newState.versions);
      setLoading(false);
    };

    customizationSubscribers.add(updateState);

    // Initialize with current global state
    updateState(globalCustomizationState);

    return () => {
      customizationSubscribers.delete(updateState);
    };
  }, []);

  const createPage = useCallback(
    async (data: Partial<Page>) => {
      try {
        console.log("➕ Creating page:", data.name);
        const newPage: Page = {
          id: `page_${Date.now()}`,
          tenantId,
          locationId,
          slug: data.slug || "",
          name: data.name || "",
          version: 1,
          status: "draft",
          sections: [],
          seoMeta: data.seoMeta || {
            title: data.name || "",
            description: "",
            keywords: [],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        updateGlobalCustomization((prev) => ({
          ...prev,
          pages: [...prev.pages, newPage],
        }));

        return newPage;
      } catch (err) {
        console.error("❌ Failed to create page:", err);
        throw new Error("Failed to create page");
      }
    },
    [tenantId, locationId],
  );

  const updatePage = useCallback(
    async (pageId: string, data: Partial<Page>) => {
      try {
        console.log("✏️ Updating page:", pageId);
        updateGlobalCustomization((prev) => ({
          ...prev,
          pages: prev.pages.map((page) =>
            page.id === pageId
              ? { ...page, ...data, updatedAt: new Date() }
              : page,
          ),
        }));
      } catch (err) {
        console.error("❌ Failed to update page:", err);
        throw new Error("Failed to update page");
      }
    },
    [],
  );

  const addSection = useCallback(
    async (pageId: string, sectionType: string) => {
      try {
        console.log("➕ Adding section:", sectionType, "to page:", pageId);
        const schema = sectionRegistry[sectionType];
        if (!schema) throw new Error("Unknown section type");

        const newSection: PageSection = {
          id: `section_${Date.now()}`,
          type: sectionType as any,
          title: schema.name,
          sortIndex: Date.now(),
          visible: true,
          props: { ...schema.defaultProps },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        updateGlobalCustomization((prev) => ({
          ...prev,
          pages: prev.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  sections: [...page.sections, newSection].sort(
                    (a, b) => a.sortIndex - b.sortIndex,
                  ),
                  updatedAt: new Date(),
                }
              : page,
          ),
        }));

        return newSection;
      } catch (err) {
        console.error("❌ Failed to add section:", err);
        throw new Error("Failed to add section");
      }
    },
    [],
  );

  const updateSection = useCallback(
    async (pageId: string, sectionId: string, data: Partial<PageSection>) => {
      try {
        console.log("✏️ Updating section:", sectionId);
        updateGlobalCustomization((prev) => ({
          ...prev,
          pages: prev.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  sections: page.sections.map((section) =>
                    section.id === sectionId
                      ? { ...section, ...data, updatedAt: new Date() }
                      : section,
                  ),
                  updatedAt: new Date(),
                }
              : page,
          ),
        }));
      } catch (err) {
        console.error("❌ Failed to update section:", err);
        throw new Error("Failed to update section");
      }
    },
    [],
  );

  const removeSection = useCallback(
    async (pageId: string, sectionId: string) => {
      try {
        console.log("🗑️ Removing section:", sectionId);
        updateGlobalCustomization((prev) => ({
          ...prev,
          pages: prev.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  sections: page.sections.filter(
                    (section) => section.id !== sectionId,
                  ),
                  updatedAt: new Date(),
                }
              : page,
          ),
        }));
      } catch (err) {
        console.error("❌ Failed to remove section:", err);
        throw new Error("Failed to remove section");
      }
    },
    [],
  );

  const reorderSections = useCallback(
    async (pageId: string, order: Array<{ id: string; sortIndex: number }>) => {
      try {
        console.log("🔄 Reordering sections for page:", pageId);
        updateGlobalCustomization((prev) => ({
          ...prev,
          pages: prev.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  sections: page.sections
                    .map((section) => {
                      const newOrder = order.find((o) => o.id === section.id);
                      return newOrder
                        ? { ...section, sortIndex: newOrder.sortIndex }
                        : section;
                    })
                    .sort((a, b) => a.sortIndex - b.sortIndex),
                  updatedAt: new Date(),
                }
              : page,
          ),
        }));
      } catch (err) {
        console.error("❌ Failed to reorder sections:", err);
        throw new Error("Failed to reorder sections");
      }
    },
    [],
  );

  const publishPage = useCallback(
    async (pageId: string, changelog?: string) => {
      try {
        console.log("🚀 Publishing page:", pageId);
        const page = pages.find((p) => p.id === pageId);
        if (!page) throw new Error("Page not found");

        // Create version
        const newVersion: PageVersion = {
          id: `version_${Date.now()}`,
          pageId,
          version: page.version + 1,
          sections: [...page.sections],
          seoMeta: { ...page.seoMeta },
          theme: page.theme ? { ...page.theme } : undefined,
          publishedBy: "current_user",
          publishedAt: new Date(),
          changelog,
        };

        updateGlobalCustomization((prev) => ({
          ...prev,
          pages: prev.pages.map((p) =>
            p.id === pageId
              ? {
                  ...p,
                  status: "published",
                  version: newVersion.version,
                  publishedAt: new Date(),
                }
              : p,
          ),
          versions: [...prev.versions, newVersion],
        }));

        // Simulate real-time broadcast
        setTimeout(() => {
          console.log("📡 Broadcasting page update to all clients");
          // In real app, this would trigger WebSocket/SSE events
        }, 100);
      } catch (err) {
        console.error("❌ Failed to publish page:", err);
        throw new Error("Failed to publish page");
      }
    },
    [pages],
  );

  const uploadAsset = useCallback(
    async (file: File, metadata?: Partial<Asset>) => {
      try {
        console.log("📤 Uploading asset:", file.name);

        // Simulate upload to CDN
        const mockUrl = URL.createObjectURL(file);
        const newAsset: Asset = {
          id: `asset_${Date.now()}`,
          tenantId,
          url: mockUrl,
          secureUrl: mockUrl,
          kind: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
          source: "device",
          metadata: {
            width: 1920,
            height: 1080,
            size: file.size,
            format: file.type,
            duration: file.type.startsWith("video/") ? 30 : undefined,
          },
          alt: metadata?.alt || "",
          caption: metadata?.caption || "",
          tags: metadata?.tags || [],
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        updateGlobalCustomization((prev) => ({
          ...prev,
          assets: [...prev.assets, newAsset],
        }));

        return newAsset;
      } catch (err) {
        console.error("❌ Failed to upload asset:", err);
        throw new Error("Failed to upload asset");
      }
    },
    [tenantId],
  );

  const importAssetFromUrl = useCallback(
    async (url: string, metadata?: Partial<Asset>) => {
      try {
        console.log("📥 Importing asset from URL:", url);

        const newAsset: Asset = {
          id: `asset_${Date.now()}`,
          tenantId,
          url,
          secureUrl: url,
          kind:
            url.includes("video") || url.includes(".mp4") ? "VIDEO" : "IMAGE",
          source: "url",
          metadata: {
            width: 1920,
            height: 1080,
            size: 0,
            format: "unknown",
          },
          alt: metadata?.alt || "",
          caption: metadata?.caption || "",
          tags: metadata?.tags || [],
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        updateGlobalCustomization((prev) => ({
          ...prev,
          assets: [...prev.assets, newAsset],
        }));

        return newAsset;
      } catch (err) {
        console.error("❌ Failed to import asset:", err);
        throw new Error("Failed to import asset");
      }
    },
    [tenantId],
  );

  const updateTheme = useCallback(async (themeData: Partial<Theme>) => {
    try {
      console.log("🎨 Updating theme");
      updateGlobalCustomization((prev) => ({
        ...prev,
        theme: {
          ...prev.theme,
          ...themeData,
          colors: themeData.colors
            ? { ...prev.theme.colors, ...themeData.colors }
            : prev.theme.colors,
          typography: themeData.typography
            ? { ...prev.theme.typography, ...themeData.typography }
            : prev.theme.typography,
          spacing: themeData.spacing
            ? { ...prev.theme.spacing, ...themeData.spacing }
            : prev.theme.spacing,
          borderRadius: themeData.borderRadius
            ? { ...prev.theme.borderRadius, ...themeData.borderRadius }
            : prev.theme.borderRadius,
          shadows: themeData.shadows
            ? { ...prev.theme.shadows, ...themeData.shadows }
            : prev.theme.shadows,
          updatedAt: new Date(),
        },
      }));
    } catch (err) {
      console.error("❌ Failed to update theme:", err);
      throw new Error("Failed to update theme");
    }
  }, []);

  return {
    pages,
    theme,
    assets,
    versions,
    loading,
    error,
    sectionRegistry,
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
  };
}
