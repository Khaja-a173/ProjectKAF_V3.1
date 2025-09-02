import { useState, useEffect, useCallback } from "react";
import {
  MenuSection,
  MenuItem,
  MenuFilters,
  BulkUploadResult,
  BulkUploadItem,
} from "../types/menu";

// Global state for menu data (simulating real-time sync)
let globalMenuState: MenuSection[] = [
  {
    id: "sec_1",
    tenantId: "tenant_123",
    locationId: "location_456",
    name: "Appetizers",
    description: "Start your meal with our delicious appetizers",
    sortIndex: 100,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "itm_1",
        sectionId: "sec_1",
        tenantId: "tenant_123",
        locationId: "location_456",
        name: "Truffle Arancini",
        description: "Crispy risotto balls with black truffle and parmesan",
        price: 16.0,
        currency: "USD",
        cost: 6.5,
        imageUrl:
          "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
        isAvailable: true,
        sortIndex: 10,
        tags: ["signature", "popular"],
        allergens: ["dairy", "gluten"],
        isVegetarian: true,
        isVegan: false,
        spicyLevel: 0,
        preparationTime: 15,
        calories: 280,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "itm_2",
        sectionId: "sec_1",
        tenantId: "tenant_123",
        locationId: "location_456",
        name: "Pan-Seared Scallops",
        description: "Fresh diver scallops with cauliflower purée",
        price: 24.0,
        currency: "USD",
        cost: 12.0,
        imageUrl:
          "https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400",
        isAvailable: true,
        sortIndex: 20,
        tags: ["premium", "seafood"],
        allergens: ["shellfish"],
        isVegetarian: false,
        isVegan: false,
        spicyLevel: 0,
        preparationTime: 12,
        calories: 180,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: "sec_2",
    tenantId: "tenant_123",
    locationId: "location_456",
    name: "Main Courses",
    description: "Our signature main dishes",
    sortIndex: 200,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "itm_3",
        sectionId: "sec_2",
        tenantId: "tenant_123",
        locationId: "location_456",
        name: "Wagyu Beef Tenderloin",
        description: "Premium wagyu beef with seasonal vegetables",
        price: 65.0,
        currency: "USD",
        cost: 28.0,
        imageUrl:
          "https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400",
        isAvailable: true,
        sortIndex: 10,
        tags: ["premium", "signature"],
        allergens: [],
        isVegetarian: false,
        isVegan: false,
        spicyLevel: 0,
        preparationTime: 25,
        calories: 420,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "itm_4",
        sectionId: "sec_2",
        tenantId: "tenant_123",
        locationId: "location_456",
        name: "Grilled Atlantic Salmon",
        description: "Fresh salmon with herb crust and quinoa pilaf",
        price: 32.0,
        currency: "USD",
        cost: 14.0,
        imageUrl:
          "https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400",
        isAvailable: true,
        sortIndex: 20,
        tags: ["healthy", "seafood"],
        allergens: ["fish"],
        isVegetarian: false,
        isVegan: false,
        spicyLevel: 0,
        preparationTime: 20,
        calories: 350,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

const menuSubscribers: Set<(sections: MenuSection[]) => void> = new Set();

const notifySubscribers = () => {
  console.log(
    "🔄 Notifying subscribers of menu changes:",
    globalMenuState.length,
    "sections",
  );
  menuSubscribers.forEach((callback) => callback([...globalMenuState]));
};

const updateGlobalMenu = (updater: (prev: MenuSection[]) => MenuSection[]) => {
  globalMenuState = updater(globalMenuState);
  console.log("📝 Menu state updated:", {
    after: globalMenuState.length,
    totalItems: globalMenuState.reduce(
      (sum, s) => sum + (s.items?.length || 0),
      0,
    ),
  });
  notifySubscribers();
};

interface UseMenuManagementProps {
  tenantId: string;
  locationId: string;
}

export function useMenuManagement({
  tenantId,
  locationId,
}: UseMenuManagementProps) {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [filters, setFilters] = useState<MenuFilters>({
    search: "",
    section: "all",
    availability: "all",
    tags: [],
    allergens: [],
    dietary: [],
  });

  // Subscribe to global menu changes
  useEffect(() => {
    const updateSections = (newSections: MenuSection[]) => {
      console.log("🔄 Received menu update:", newSections.length, "sections");
      setSections(newSections);
      setLoading(false);
    };

    menuSubscribers.add(updateSections);

    // Initialize with current global state
    if (globalMenuState.length > 0) {
      setSections([...globalMenuState]);
      setLoading(false);
    }

    return () => {
      menuSubscribers.delete(updateSections);
    };
  }, []);

  const createSection = useCallback(
    async (data: Partial<MenuSection>) => {
      try {
        console.log("➕ Creating section:", data.name);
        const newSection: MenuSection = {
          id: `sec_${Date.now()}`,
          tenantId,
          locationId,
          name: data.name || "",
          description: data.description,
          sortIndex: (globalMenuState.length + 1) * 100,
          isActive: data.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        };

        updateGlobalMenu((prev) =>
          [...prev, newSection].sort((a, b) => a.sortIndex - b.sortIndex),
        );
        return newSection;
      } catch (err) {
        console.error("❌ Failed to create section:", err);
        throw new Error("Failed to create section");
      }
    },
    [tenantId, locationId],
  );

  const updateSection = useCallback(
    async (id: string, data: Partial<MenuSection>) => {
      try {
        console.log("✏️ Updating section:", id, data);
        updateGlobalMenu((prev) =>
          prev.map((section) =>
            section.id === id
              ? { ...section, ...data, updatedAt: new Date() }
              : section,
          ),
        );
      } catch (err) {
        console.error("❌ Failed to update section:", err);
        throw new Error("Failed to update section");
      }
    },
    [],
  );

  const reorderSections = useCallback(
    async (order: Array<{ id: string; sortIndex: number }>) => {
      try {
        console.log("🔄 Reordering sections:", order);
        updateGlobalMenu((prev) =>
          prev
            .map((section) => {
              const newOrder = order.find((o) => o.id === section.id);
              return newOrder
                ? { ...section, sortIndex: newOrder.sortIndex }
                : section;
            })
            .sort((a, b) => a.sortIndex - b.sortIndex),
        );
      } catch (err) {
        console.error("❌ Failed to reorder sections:", err);
        throw new Error("Failed to reorder sections");
      }
    },
    [],
  );

  const archiveSection = useCallback(async (id: string) => {
    try {
      console.log("🗑️ Archiving section:", id);
      updateGlobalMenu((prev) =>
        prev.map((section) =>
          section.id === id
            ? { ...section, isActive: false, updatedAt: new Date() }
            : section,
        ),
      );
    } catch (err) {
      console.error("❌ Failed to archive section:", err);
      throw new Error("Failed to archive section");
    }
  }, []);

  const createItem = useCallback(
    async (data: Partial<MenuItem>) => {
      try {
        console.log(
          "➕ Creating item:",
          data.name,
          "in section:",
          data.sectionId,
        );

        if (!data.sectionId) {
          throw new Error("Section ID is required");
        }

        const section = globalMenuState.find((s) => s.id === data.sectionId);
        if (!section) {
          throw new Error("Section not found");
        }

        const newItem: MenuItem = {
          id: `itm_${Date.now()}`,
          sectionId: data.sectionId,
          tenantId,
          locationId,
          name: data.name || "",
          description: data.description,
          price: data.price || 0,
          currency: data.currency || "USD",
          cost: data.cost,
          imageUrl: data.imageUrl,
          isAvailable: data.isAvailable ?? true,
          sortIndex: ((section.items?.length || 0) + 1) * 10,
          tags: data.tags || [],
          allergens: data.allergens || [],
          isVegetarian: data.isVegetarian || false,
          isVegan: data.isVegan || false,
          spicyLevel: data.spicyLevel || 0,
          preparationTime: data.preparationTime,
          calories: data.calories,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        updateGlobalMenu((prev) =>
          prev.map((section) =>
            section.id === data.sectionId
              ? {
                  ...section,
                  items: [...(section.items || []), newItem].sort(
                    (a, b) => a.sortIndex - b.sortIndex,
                  ),
                  updatedAt: new Date(),
                }
              : section,
          ),
        );

        console.log("✅ Item created successfully:", newItem.id);
        return newItem;
      } catch (err) {
        console.error("❌ Failed to create item:", err);
        throw new Error("Failed to create item");
      }
    },
    [tenantId, locationId],
  );

  const updateItem = useCallback(
    async (id: string, data: Partial<MenuItem>) => {
      try {
        console.log("✏️ Updating item:", id, data);
        updateGlobalMenu((prev) =>
          prev.map((section) => ({
            ...section,
            items: section.items?.map((item) =>
              item.id === id
                ? { ...item, ...data, updatedAt: new Date() }
                : item,
            ),
            updatedAt: new Date(),
          })),
        );
        console.log("✅ Item updated successfully:", id);
      } catch (err) {
        console.error("❌ Failed to update item:", err);
        throw new Error("Failed to update item");
      }
    },
    [],
  );

  const toggleItemAvailability = useCallback(
    async (id: string, isAvailable: boolean) => {
      try {
        console.log(
          "🔄 Toggling availability for item:",
          id,
          "to:",
          isAvailable,
        );
        updateGlobalMenu((prev) =>
          prev.map((section) => ({
            ...section,
            items: section.items?.map((item) =>
              item.id === id
                ? { ...item, isAvailable, updatedAt: new Date() }
                : item,
            ),
            updatedAt: new Date(),
          })),
        );
        console.log("✅ Availability toggled successfully");
      } catch (err) {
        console.error("❌ Failed to toggle availability:", err);
        throw new Error("Failed to toggle availability");
      }
    },
    [],
  );

  const archiveItem = useCallback(async (id: string) => {
    try {
      console.log("🗑️ Archiving item:", id);
      updateGlobalMenu((prev) =>
        prev.map((section) => ({
          ...section,
          items: section.items?.filter((item) => item.id !== id),
          updatedAt: new Date(),
        })),
      );
      console.log("✅ Item archived successfully");
    } catch (err) {
      console.error("❌ Failed to archive item:", err);
      throw new Error("Failed to archive item");
    }
  }, []);

  const reorderItems = useCallback(
    async (
      sectionId: string,
      order: Array<{ id: string; sortIndex: number }>,
    ) => {
      try {
        console.log("🔄 Reordering items in section:", sectionId);
        updateGlobalMenu((prev) =>
          prev.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  items: section.items
                    ?.map((item) => {
                      const newOrder = order.find((o) => o.id === item.id);
                      return newOrder
                        ? { ...item, sortIndex: newOrder.sortIndex }
                        : item;
                    })
                    .sort((a, b) => a.sortIndex - b.sortIndex),
                  updatedAt: new Date(),
                }
              : section,
          ),
        );
      } catch (err) {
        console.error("❌ Failed to reorder items:", err);
        throw new Error("Failed to reorder items");
      }
    },
    [],
  );

  const moveItem = useCallback(
    async (
      itemId: string,
      fromSectionId: string,
      toSectionId: string,
      sortIndex: number,
    ) => {
      try {
        console.log(
          "📦 Moving item:",
          itemId,
          "from:",
          fromSectionId,
          "to:",
          toSectionId,
        );
        updateGlobalMenu((prev) =>
          prev.map((section) => {
            if (section.id === fromSectionId) {
              return {
                ...section,
                items: section.items?.filter((item) => item.id !== itemId),
                updatedAt: new Date(),
              };
            }
            if (section.id === toSectionId) {
              const item = prev
                .find((s) => s.id === fromSectionId)
                ?.items?.find((i) => i.id === itemId);
              if (item) {
                return {
                  ...section,
                  items: [
                    ...(section.items || []),
                    { ...item, sectionId: toSectionId, sortIndex },
                  ].sort((a, b) => a.sortIndex - b.sortIndex),
                  updatedAt: new Date(),
                };
              }
            }
            return section;
          }),
        );
      } catch (err) {
        console.error("❌ Failed to move item:", err);
        throw new Error("Failed to move item");
      }
    },
    [],
  );

  const bulkUpload = useCallback(
    async (items: BulkUploadItem[]): Promise<BulkUploadResult> => {
      try {
        console.log("📤 Starting bulk upload:", items.length, "items");
        let created = 0;
        let updated = 0;
        let skipped = 0;
        const errors: Array<{ row: number; message: string; data: any }> = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          try {
            // Find or create section
            let section = globalMenuState.find(
              (s) => s.name.toLowerCase() === item.section.toLowerCase(),
            );
            if (!section) {
              section = await createSection({ name: item.section });
            }

            // Check if item exists
            const existingItem = section.items?.find(
              (itm) => itm.name.toLowerCase() === item.name.toLowerCase(),
            );

            if (existingItem) {
              await updateItem(existingItem.id, {
                description: item.description,
                price: item.price,
                cost: item.cost,
                imageUrl: item.imageUrl,
                tags: item.tags || [],
                allergens: item.allergens || [],
                isVegetarian: item.isVegetarian || false,
                isVegan: item.isVegan || false,
                spicyLevel: item.spicyLevel || 0,
              });
              updated++;
            } else {
              await createItem({
                sectionId: section.id,
                name: item.name,
                description: item.description,
                price: item.price,
                cost: item.cost,
                imageUrl: item.imageUrl,
                tags: item.tags || [],
                allergens: item.allergens || [],
                isVegetarian: item.isVegetarian || false,
                isVegan: item.isVegan || false,
                spicyLevel: item.spicyLevel || 0,
              });
              created++;
            }
          } catch (err) {
            errors.push({
              row: i + 1,
              message: err instanceof Error ? err.message : "Unknown error",
              data: item,
            });
          }
        }

        console.log("✅ Bulk upload complete:", {
          created,
          updated,
          skipped,
          errors: errors.length,
        });
        return { created, updated, skipped, errors };
      } catch (err) {
        console.error("❌ Bulk upload failed:", err);
        throw new Error("Bulk upload failed");
      }
    },
    [createSection, createItem, updateItem],
  );

  // Get all available tags and allergens
  const availableTags = [
    ...new Set(
      globalMenuState.flatMap((s) => s.items?.flatMap((i) => i.tags) || []),
    ),
  ];
  const availableAllergens = [
    ...new Set(
      globalMenuState.flatMap(
        (s) => s.items?.flatMap((i) => i.allergens) || [],
      ),
    ),
  ];

  return {
    sections,
    loading,
    error,
    filters,
    setFilters,
    availableTags,
    availableAllergens,
    createSection,
    updateSection,
    reorderSections,
    archiveSection,
    createItem,
    updateItem,
    toggleItemAvailability,
    archiveItem,
    reorderItems,
    moveItem,
    bulkUpload,
  };
}
