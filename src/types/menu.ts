export interface MenuSection {
  id: string;
  tenantId: string;
  locationId: string;
  name: string;
  description?: string;
  sortIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  sectionId: string;
  tenantId: string;
  locationId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  cost?: number;
  imageUrl?: string;
  images?: string[];
  isAvailable: boolean;
  sortIndex: number;
  tags: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  spicyLevel: number;
  preparationTime?: number;
  calories?: number;
  nutritionalInfo?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkUploadItem {
  section: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  imageUrl?: string;
  tags?: string[];
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  spicyLevel?: number;
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

export interface MenuRealtimeEvent {
  type:
    | "section.created"
    | "section.updated"
    | "section.reordered"
    | "section.archived"
    | "item.created"
    | "item.updated"
    | "item.moved"
    | "item.reordered"
    | "item.availability"
    | "item.archived"
    | "bulk.summary";
  tenantId: string;
  locationId: string;
  data: any;
  timestamp: Date;
}

export interface ImageUpload {
  source: "url" | "device";
  value: string | File;
}

export interface MenuFilters {
  search: string;
  section: string;
  availability: "all" | "available" | "out-of-stock" | "archived";
  tags: string[];
  allergens: string[];
  dietary: string[];
}
