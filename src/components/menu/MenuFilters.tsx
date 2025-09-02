import { MenuFilters as MenuFiltersType } from "../../types/menu";
import { Search, Filter, X } from "lucide-react";

interface MenuFiltersProps {
  filters: MenuFiltersType;
  onFiltersChange: (filters: MenuFiltersType) => void;
  availableTags: string[];
  availableAllergens: string[];
}

export default function MenuFilters({
  filters,
  onFiltersChange,
  availableTags,
  availableAllergens,
}: MenuFiltersProps) {
  const updateFilter = (key: keyof MenuFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: "tags" | "allergens" | "dietary",
    value: string,
  ) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    updateFilter(key, newArray);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      section: "all",
      availability: "all",
      tags: [],
      allergens: [],
      dietary: [],
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.section !== "all" ||
    filters.availability !== "all" ||
    filters.tags.length > 0 ||
    filters.allergens.length > 0 ||
    filters.dietary.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <select
            value={filters.availability}
            onChange={(e) => updateFilter("availability", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Items</option>
            <option value="available">Available</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Dietary Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary
          </label>
          <div className="flex flex-wrap gap-2">
            {["vegetarian", "vegan"].map((diet) => (
              <button
                key={diet}
                onClick={() => toggleArrayFilter("dietary", diet)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.dietary.includes(diet)
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {diet.charAt(0).toUpperCase() + diet.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleArrayFilter("tags", tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.tags.includes(tag)
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Allergens Filter */}
        {availableAllergens.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergens
            </label>
            <div className="flex flex-wrap gap-2">
              {availableAllergens.slice(0, 6).map((allergen) => (
                <button
                  key={allergen}
                  onClick={() => toggleArrayFilter("allergens", allergen)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.allergens.includes(allergen)
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
