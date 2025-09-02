import { useState } from "react";
import { MenuItem, MenuSection } from "../../types/menu";
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Star,
  Leaf,
  Flame,
  DollarSign,
  GripVertical,
  Plus,
} from "lucide-react";

interface ItemGridProps {
  section: MenuSection | null;
  items: MenuItem[];
  onEditItem: (item: MenuItem) => void;
  onToggleAvailability: (itemId: string, isAvailable: boolean) => void;
  onArchiveItem: (itemId: string) => void;
  onReorderItems: (
    sectionId: string,
    order: Array<{ id: string; sortIndex: number }>,
  ) => void;
}

export default function ItemGrid({
  section,
  items,
  onEditItem,
  onToggleAvailability,
  onArchiveItem,
  onReorderItems,
}: ItemGridProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    if (!draggedItem || !section || draggedItem === targetItemId) return;

    const draggedIndex = items.findIndex((i) => i.id === draggedItem);
    const targetIndex = items.findIndex((i) => i.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...items];
    const [draggedItemData] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItemData);

    const reorderedItems = newOrder.map((item, index) => ({
      id: item.id,
      sortIndex: (index + 1) * 10,
    }));

    onReorderItems(section.id, reorderedItems);
    setDraggedItem(null);
  };

  const getDietaryIcons = (item: MenuItem) => {
    const icons = [];
    if (item.isVegan)
      icons.push(
        <Leaf
          key="vegan"
          className="w-4 h-4 text-green-600"
          aria-label="Vegan"
        />,
      );
    else if (item.isVegetarian)
      icons.push(
        <Leaf
          key="vegetarian"
          className="w-4 h-4 text-green-500"
          aria-label="Vegetarian"
        />,
      );

    if (item.spicyLevel > 0) {
      icons.push(
        <div
          key="spicy"
          className="flex"
          aria-label={`Spicy Level: ${item.spicyLevel}`}
        >
          {[...Array(item.spicyLevel)].map((_, i) => (
            <Flame key={i} className="w-3 h-3 text-red-500" />
          ))}
        </div>,
      );
    }

    return icons;
  };

  const getMarginColor = (item: MenuItem) => {
    if (!item.cost) return "text-gray-500";
    const margin = ((item.price - item.cost) / item.price) * 100;
    if (margin >= 70) return "text-green-600";
    if (margin >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getMarginPercentage = (item: MenuItem) => {
    if (!item.cost) return "N/A";
    return Math.round(((item.price - item.cost) / item.price) * 100) + "%";
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {section ? `No items in ${section.name}` : "No items found"}
        </h3>
        <p className="text-gray-600 mb-6">
          {section
            ? "Add your first menu item to get started"
            : "Select a section or adjust your filters"}
        </p>
        {section && (
          <button
            onClick={() => onEditItem({} as MenuItem)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Item</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {section ? section.name : "All Menu Items"} ({items.length})
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              draggable={!!section}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all ${
                draggedItem === item.id ? "opacity-50" : ""
              } ${!item.isAvailable ? "opacity-75" : ""}`}
            >
              <div className="relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div className="absolute top-2 right-2 flex space-x-1">
                  {item.tags.includes("popular") && (
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Popular
                    </span>
                  )}
                  {item.tags.includes("signature") && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Signature
                    </span>
                  )}
                  {!item.isAvailable && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="absolute top-2 left-2">
                  <GripVertical className="w-5 h-5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {item.name}
                  </h4>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${item.price}
                    </div>
                    {item.cost && (
                      <div className={`text-xs ${getMarginColor(item)}`}>
                        {getMarginPercentage(item)} margin
                      </div>
                    )}
                  </div>
                </div>

                {item.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getDietaryIcons(item)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {item.preparationTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.preparationTime}m</span>
                      </div>
                    )}
                    {item.calories && <span>{item.calories} cal</span>}
                  </div>
                </div>

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        onToggleAvailability(item.id, !item.isAvailable)
                      }
                      className={`p-1 rounded transition-colors ${
                        item.isAvailable
                          ? "text-green-600 hover:text-green-800"
                          : "text-red-600 hover:text-red-800"
                      }`}
                      title={
                        item.isAvailable
                          ? "Mark as unavailable"
                          : "Mark as available"
                      }
                    >
                      {item.isAvailable ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onEditItem(item)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onArchiveItem(item.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={(e) =>
                        onToggleAvailability(item.id, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
