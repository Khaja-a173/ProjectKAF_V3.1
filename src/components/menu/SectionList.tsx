import { useState } from "react";
import { MenuSection } from "../../types/menu";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";

interface SectionListProps {
  sections: MenuSection[];
  selectedSection: string | null;
  onSelectSection: (sectionId: string | null) => void;
  onCreateSection: () => void;
  onEditSection: (section: MenuSection) => void;
  onArchiveSection: (sectionId: string) => void;
  onReorderSections: (order: Array<{ id: string; sortIndex: number }>) => void;
}

export default function SectionList({
  sections,
  selectedSection,
  onSelectSection,
  onCreateSection,
  onEditSection,
  onArchiveSection,
  onReorderSections,
}: SectionListProps) {
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) return;

    const draggedIndex = sections.findIndex((s) => s.id === draggedSection);
    const targetIndex = sections.findIndex((s) => s.id === targetSectionId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...sections];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    const reorderedSections = newOrder.map((section, index) => ({
      id: section.id,
      sortIndex: (index + 1) * 100,
    }));

    onReorderSections(reorderedSections);
    setDraggedSection(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Menu Sections</h3>
          <button
            onClick={onCreateSection}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        <button
          onClick={() => onSelectSection(null)}
          className={`w-full text-left p-3 rounded-lg transition-colors ${
            selectedSection === null
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">All Sections</span>
            <span className="text-sm text-gray-500">
              {sections.reduce(
                (total, section) => total + (section.items?.length || 0),
                0,
              )}{" "}
              items
            </span>
          </div>
        </button>

        {sections.map((section) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section.id)}
            className={`group cursor-pointer border border-gray-200 rounded-lg transition-all ${
              selectedSection === section.id
                ? "bg-blue-50 border-blue-200"
                : "hover:bg-gray-50 hover:border-gray-300"
            } ${draggedSection === section.id ? "opacity-50" : ""}`}
          >
            <div onClick={() => onSelectSection(section.id)} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {section.name}
                    </div>
                    {section.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {section.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {section.items?.length || 0} items
                  </span>
                  {!section.isActive && (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="px-3 pb-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSection(section);
                }}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchiveSection(section.id);
                }}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
