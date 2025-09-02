import { useState } from "react";
import { Link } from "react-router-dom";
import { useMenuManagement } from "../hooks/useMenuManagement";
import SectionList from "../components/menu/SectionList";
import ItemGrid from "../components/menu/ItemGrid";
import ItemEditor from "../components/menu/ItemEditor";
import SectionEditor from "../components/menu/SectionEditor";
import BulkUploader from "../components/menu/BulkUploader";
import MenuFilters from "../components/menu/MenuFilters";
import {
  ChefHat,
  Plus,
  Upload,
  Download,
  Bell,
  RefreshCw,
  BarChart3,
  Eye,
  Zap,
} from "lucide-react";
import { MenuSection, MenuItem } from "../types/menu";

export default function MenuManagement() {
  // Use the menu management hook
  const {
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
  } = useMenuManagement({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(
    null,
  );
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [showBulkUploader, setShowBulkUploader] = useState(false);

  // Get items for selected section or all items
  const displayItems = selectedSection
    ? sections.find((s) => s.id === selectedSection)?.items || []
    : sections.flatMap((s) => s.items || []);

  const selectedSectionData = selectedSection
    ? sections.find((s) => s.id === selectedSection)
    : null;

  const stats = {
    totalItems: sections.reduce(
      (total, section) => total + (section.items?.length || 0),
      0,
    ),
    availableItems: sections.reduce(
      (total, section) =>
        total + (section.items?.filter((item) => item.isAvailable).length || 0),
      0,
    ),
    totalSections: sections.filter((s) => s.isActive).length,
    avgPrice:
      sections.reduce((total, section) => {
        const sectionTotal =
          section.items?.reduce((sum, item) => sum + item.price, 0) || 0;
        return total + sectionTotal;
      }, 0) /
      Math.max(
        1,
        sections.reduce(
          (total, section) => total + (section.items?.length || 0),
          0,
        ),
      ),
  };

  const handleCreateSection = () => {
    setEditingSection(null);
    setShowSectionEditor(true);
  };

  const handleEditSection = (section: MenuSection) => {
    setEditingSection(section);
    setShowSectionEditor(true);
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setShowItemEditor(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowItemEditor(true);
  };

  const handleSaveSection = async (sectionData: Partial<MenuSection>) => {
    try {
      if (editingSection) {
        await updateSection(editingSection.id, sectionData);
      } else {
        const newSection = await createSection(sectionData);
        setSelectedSection(newSection.id);
      }
      setShowSectionEditor(false);
    } catch (err) {
      console.error("Failed to save section:", err);
      alert("Failed to save section. Please try again.");
    }
  };

  const handleSaveItem = async (itemData: Partial<MenuItem>) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, itemData);
      } else {
        // If no section selected, use the first section or prompt user
        if (!itemData.sectionId && selectedSection) {
          itemData.sectionId = selectedSection;
        } else if (!itemData.sectionId && sections.length > 0) {
          itemData.sectionId = sections[0].id;
        }

        if (!itemData.sectionId) {
          alert("Please select a section first or create a section.");
          return;
        }

        await createItem(itemData);
      }
      setShowItemEditor(false);
    } catch (err) {
      console.error("Failed to save item:", err);
      alert("Failed to save item. Please try again.");
    }
  };

  const handleArchiveItem = async (itemId: string) => {
    if (confirm("Are you sure you want to remove this item?")) {
      try {
        await archiveItem(itemId);
      } catch (err) {
        console.error("Failed to archive item:", err);
        alert("Failed to remove item. Please try again.");
      }
    }
  };

  const handleArchiveSection = async (sectionId: string) => {
    if (
      confirm(
        "Are you sure you want to archive this section? Items will be hidden from customers.",
      )
    ) {
      try {
        await archiveSection(sectionId);
        if (selectedSection === sectionId) {
          setSelectedSection(null);
        }
      } catch (err) {
        console.error("Failed to archive section:", err);
        alert("Failed to archive section. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading menu: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/menu"
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
            >
              Menu Management
            </Link>
            <Link
              to="/orders"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Orders
            </Link>
            <Link
              to="/table-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Table Management
            </Link>
            <Link
              to="/staff-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Staff Management
            </Link>
            <Link
              to="/admin/kitchen"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Kitchen Dashboard
            </Link>
            <Link
              to="/analytics"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Analytics
            </Link>
            <Link
              to="/application-customization"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Customization
            </Link>
            <Link
              to="/settings"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Settings
            </Link>
          </div>
        </nav>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalItems}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.availableItems}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sections</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSections}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.avgPrice.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateSection}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>

              <button
                onClick={handleCreateItem}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>

              <button
                onClick={() => setShowBulkUploader(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Upload</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/menu"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Customer Menu</span>
              </Link>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Sections & Filters */}
          <div className="lg:col-span-1 space-y-6">
            <SectionList
              sections={sections}
              selectedSection={selectedSection}
              onSelectSection={setSelectedSection}
              onCreateSection={handleCreateSection}
              onEditSection={handleEditSection}
              onArchiveSection={handleArchiveSection}
              onReorderSections={reorderSections}
            />

            <MenuFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableTags={availableTags}
              availableAllergens={availableAllergens}
            />
          </div>

          {/* Main Content - Items Grid */}
          <div className="lg:col-span-3">
            <ItemGrid
              section={selectedSectionData || null}
              items={displayItems}
              onEditItem={handleEditItem}
              onToggleAvailability={toggleItemAvailability}
              onArchiveItem={handleArchiveItem}
              onReorderItems={reorderItems}
            />
          </div>
        </div>

        {/* Modals */}
        <SectionEditor
          section={editingSection}
          isOpen={showSectionEditor}
          onClose={() => setShowSectionEditor(false)}
          onSave={handleSaveSection}
        />

        <ItemEditor
          item={editingItem}
          sections={sections}
          isOpen={showItemEditor}
          onClose={() => setShowItemEditor(false)}
          onSave={handleSaveItem}
        />

        <BulkUploader
          isOpen={showBulkUploader}
          onClose={() => setShowBulkUploader(false)}
          onUpload={bulkUpload}
        />
      </div>
    </div>
  );
}
