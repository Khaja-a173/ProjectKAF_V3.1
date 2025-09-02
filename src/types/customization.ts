export interface Page {
  id: string;
  tenantId: string;
  locationId?: string;
  slug: string;
  name: string;
  version: number;
  status: "draft" | "published" | "scheduled";
  sections: PageSection[];
  seoMeta: SEOMeta;
  theme?: ThemeOverrides;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageSection {
  id: string;
  type: SectionType;
  title?: string;
  sortIndex: number;
  visible: boolean;
  props: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type SectionType =
  | "hero_video"
  | "image_gallery"
  | "achievements_counters"
  | "menu_sections_preview"
  | "event_cards"
  | "contact_block"
  | "cta_banner"
  | "image_slider"
  | "rich_text"
  | "faq_accordion"
  | "chef_spotlight"
  | "testimonials"
  | "map_fullscreen";

export interface SectionSchema {
  type: SectionType;
  name: string;
  description: string;
  icon: string;
  category: "content" | "media" | "interactive" | "data";
  schema: Record<string, any>;
  defaultProps: Record<string, any>;
  preview: string;
}

export interface Asset {
  id: string;
  tenantId: string;
  url: string;
  secureUrl: string;
  kind: "IMAGE" | "VIDEO" | "SLIDE";
  source: "device" | "url";
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
    duration?: number;
  };
  alt?: string;
  caption?: string;
  tags: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Theme {
  id: string;
  tenantId: string;
  locationId?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    headingFont?: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  logo?: Asset;
  favicon?: Asset;
  ogImage?: Asset;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_THEME: Theme = {
  id: "theme_default",
  tenantId: "default",
  colors: {
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
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    headingFont: undefined,
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
  },
  spacing: {
    unit: 8,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export interface ThemeOverrides {
  colors?: Partial<Theme["colors"]>;
  typography?: Partial<Theme["typography"]>;
  spacing?: Partial<Theme["spacing"]>;
  borderRadius?: Partial<Theme["borderRadius"]>;
  shadows?: Partial<Theme["shadows"]>;
  logo?: Asset;
  favicon?: Asset;
  ogImage?: Asset;
}

export interface SEOMeta {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: Asset;
  twitterCard?: "summary" | "summary_large_image";
  noIndex?: boolean;
}

export interface PageVersion {
  id: string;
  pageId: string;
  version: number;
  sections: PageSection[];
  seoMeta: SEOMeta;
  theme?: ThemeOverrides;
  publishedBy: string;
  publishedAt: Date;
  changelog?: string;
  diff?: Record<string, any>;
}

export interface CustomizationFilters {
  search: string;
  status: "all" | "draft" | "published" | "scheduled";
  page: string;
  location: string;
}

export interface BulkUploadResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    row: number;
    message: string;
    data: any;
  }>;
}

export interface RealtimeEvent {
  type: "page.updated" | "page.published" | "theme.updated" | "asset.uploaded";
  tenantId: string;
  locationId?: string;
  data: any;
  timestamp: Date;
}
