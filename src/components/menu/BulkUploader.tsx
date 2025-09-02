import { useState, useCallback } from "react";
import { BulkUploadItem, BulkUploadResult } from "../../types/menu";
import {
  Upload,
  Download,
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface BulkUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (items: BulkUploadItem[]) => Promise<BulkUploadResult>;
}

export default function BulkUploader({
  isOpen,
  onClose,
  onUpload,
}: BulkUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BulkUploadItem[]>([]);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = e.target.files?.[0];
      if (!uploadedFile) return;

      setFile(uploadedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          let items: BulkUploadItem[] = [];

          if (uploadedFile.name.endsWith(".json")) {
            items = JSON.parse(content);
          } else if (uploadedFile.name.endsWith(".csv")) {
            const lines = content.split("\n").filter((line) => line.trim());
            const headers = lines[0].split(",").map((h) => h.trim());

            items = lines
              .slice(1)
              .map((line) => {
                const values = line.split(",").map((v) => v.trim());
                const item: any = {};

                headers.forEach((header, index) => {
                  const value = values[index];
                  switch (header.toLowerCase()) {
                    case "section":
                      item.section = value;
                      break;
                    case "name":
                      item.name = value;
                      break;
                    case "description":
                      item.description = value;
                      break;
                    case "price":
                      item.price = parseFloat(value) || 0;
                      break;
                    case "cost":
                      item.cost = parseFloat(value) || 0;
                      break;
                    case "imageurl":
                    case "image_url":
                      item.imageUrl = value;
                      break;
                    case "tags":
                      item.tags = value
                        ? value.split(";").map((t) => t.trim())
                        : [];
                      break;
                    case "allergens":
                      item.allergens = value
                        ? value.split(";").map((a) => a.trim())
                        : [];
                      break;
                    case "vegetarian":
                    case "isvegetarian":
                      item.isVegetarian =
                        value.toLowerCase() === "true" || value === "1";
                      break;
                    case "vegan":
                    case "isvegan":
                      item.isVegan =
                        value.toLowerCase() === "true" || value === "1";
                      break;
                    case "spicylevel":
                    case "spicy_level":
                      item.spicyLevel = parseInt(value) || 0;
                      break;
                  }
                });

                return item;
              })
              .filter((item) => item.name && item.section);
          }

          setPreview(items);
        } catch (err) {
          alert("Error parsing file. Please check the format.");
        }
      };

      reader.readAsText(uploadedFile);
    },
    [],
  );

  const handleUpload = async () => {
    if (preview.length === 0) return;

    setLoading(true);
    try {
      const uploadResult = await onUpload(preview);
      setResult(uploadResult);
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `section,name,description,price,cost,imageUrl,tags,allergens,isVegetarian,isVegan,spicyLevel
Appetizers,Bruschetta,Tomato and basil on toasted bread,8.50,3.00,https://example.com/bruschetta.jpg,popular;vegetarian,gluten,true,false,0
Main Courses,Grilled Salmon,Fresh Atlantic salmon with herbs,28.00,12.00,https://example.com/salmon.jpg,healthy;seafood,fish,false,false,0`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Bulk Upload Menu Items
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!result ? (
            <div className="space-y-6">
              {/* Upload Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Upload Instructions
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Supported formats: CSV, JSON</li>
                  <li>• Required fields: section, name, price</li>
                  <li>
                    • Optional: description, cost, imageUrl, tags, allergens,
                    dietary info
                  </li>
                  <li>
                    • Existing items will be updated, new items will be created
                  </li>
                </ul>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV Template</span>
                </button>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="bulk-upload"
                />
                <label htmlFor="bulk-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {file ? file.name : "Choose file to upload"}
                  </p>
                  <p className="text-sm text-gray-600">
                    CSV or JSON files up to 10MB
                  </p>
                </label>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Preview ({preview.length} items)
                  </h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Section</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Price</th>
                          <th className="px-3 py-2 text-left">Tags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(0, 10).map((item, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="px-3 py-2">{item.section}</td>
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2">${item.price}</td>
                            <td className="px-3 py-2">
                              {item.tags?.join(", ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.length > 10 && (
                      <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-200">
                        ... and {preview.length - 10} more items
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={preview.length === 0 || loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>
                    {loading
                      ? "Uploading..."
                      : `Upload ${preview.length} Items`}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Upload Results */
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Complete!
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {result.created}
                  </div>
                  <div className="text-sm text-green-800">Created</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.updated}
                  </div>
                  <div className="text-sm text-blue-800">Updated</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {result.skipped}
                  </div>
                  <div className="text-sm text-gray-800">Skipped</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Errors ({result.errors.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto border border-red-200 rounded-lg">
                    {result.errors.map((error, index) => (
                      <div
                        key={index}
                        className="p-3 border-b border-red-200 last:border-b-0"
                      >
                        <div className="text-sm text-red-800">
                          Row {error.row}: {error.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
