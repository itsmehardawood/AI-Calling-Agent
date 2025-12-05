/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, useRef } from "react";
import { X, Trash2, Plus, Sparkles, Save, ArrowUp, ArrowDown, ChevronDown, Search } from "lucide-react";
import { generateProductPrompt } from "@/app/lib/productApi";

const SUPPORTED_LANGUAGES = [
  "Afrikaans", "Amharic", "Arabic", "Assamese", "Azerbaijani", "Bashkir", "Belarusian",
  "Bulgarian", "Bengali", "Breton", "Bosnian", "Catalan", "Chinese", "Croatian", "Czech",
  "Danish", "Dutch", "English", "Spanish", "Estonian", "Basque", "Persian (Farsi)", "Finnish",
  "Faroese", "French", "Galician", "German", "Greek", "Hebrew", "Hindi", "Hungarian",
  "Icelandic", "Indonesian", "Italian", "Japanese", "Javanese", "Georgian", "Kazakh",
  "Khmer", "Kannada", "Korean", "Latin", "Luxembourgish", "Lingala", "Lao", "Lithuanian",
  "Latvian", "Malagasy", "Māori", "Macedonian", "Malayalam", "Mongolian", "Marathi",
  "Malay", "Maltese", "Myanmar (Burmese)", "Nepali", "Norwegian Nynorsk / Norwegian",
  "Occitan", "Punjabi", "Polish", "Pashto", "Portuguese", "Romanian", "Russian", "Sanskrit",
  "Sindhi", "Sinhala", "Slovak", "Slovenian", "Shona", "Somali", "Albanian (sq)", "Serbian",
  "Sundanese", "Swedish", "Swahili", "Tamil", "Telugu", "Tajik", "Thai", "Turkmen",
  "Tagalog", "Turkish", "Tatar", "Ukrainian", "Urdu", "Uzbek", "Vietnamese", "Yiddish",
  "Yoruba", "Cantonese (yue) / Chinese dialect variant"
];

export default function ProductModal({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  editingProduct,
  showToast 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
        setLanguageSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter languages based on search
  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  // Auto-generate prompt when objectives change
  useEffect(() => {
    const hasValidData = formData.name && 
                        formData.description && 
                        formData.objectives.some(obj => obj.trim() !== "");

    if (hasValidData) {
      const timeoutId = setTimeout(() => {
        handleAutoGeneratePrompt();
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [formData.objectives, formData.name, formData.description]);

  const handleAutoGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await generateProductPrompt({
        name: formData.name,
        category: "Marketing", // Static value - always send Marketing
        description: formData.description,
        price: formData.price,
        objective: formData.objectives.filter(obj => obj.trim() !== ""),
        promptType: formData.promptType,
      });
      
      setGeneratedPrompt(response.prompt);
      setFormData((prev) => ({ ...prev, prompt: response.prompt }));
    } catch (error) {
      console.error("Error auto-generating prompt:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData((prev) => ({ ...prev, objectives: newObjectives }));
  };

  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ""],
    }));
  };

  const removeObjective = (index) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const moveObjective = (index, direction) => {
    const newObjectives = [...formData.objectives];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newObjectives.length) return;
    
    // Swap the objectives
    [newObjectives[index], newObjectives[targetIndex]] = 
    [newObjectives[targetIndex], newObjectives[index]];
    
    setFormData((prev) => ({ ...prev, objectives: newObjectives }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {editingProduct ? "Edit Product" : "Create New Product"}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {editingProduct ? "Update your product information" : "Add a new product to your collection"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    Product Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                        placeholder="Brief description of the product"
                        rows="3"
                        required
                      />
                    </div>

                    {/* Language Preference Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Agent Language Preference <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all flex items-center justify-between hover:border-gray-400"
                      >
                        <span>{formData.agent_language || "Select Language"}</span>
                        <ChevronDown size={18} className={`transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {showLanguageDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-hidden">
                          {/* Search Input */}
                          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="relative">
                              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                value={languageSearch}
                                onChange={(e) => setLanguageSearch(e.target.value)}
                                placeholder="Search languages..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          {/* Language List */}
                          <div className="max-h-60 overflow-y-auto">
                            {filteredLanguages.length > 0 ? (
                              filteredLanguages.map((language) => (
                                <button
                                  key={language}
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({ ...prev, agent_language: language }));
                                    setShowLanguageDropdown(false);
                                    setLanguageSearch("");
                                  }}
                                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors ${
                                    formData.agent_language === language 
                                      ? 'bg-blue-100 text-blue-900 font-medium' 
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {language}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-8 text-center text-gray-500">
                                <p className="text-sm">No languages found</p>
                                <p className="text-xs mt-1">Try a different search term</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Objectives Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                      Criteria 
                      <span className="text-sm font-normal text-gray-600">
                        ({formData.objectives.length})
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={addObjective}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Criteria
                    </button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {formData.objectives.map((objective, index) => (
                      <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-green-100">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveObjective(index, 'up')}
                            disabled={index === 0}
                            className="text-gray-500 hover:text-green-600 hover:bg-green-50 rounded p-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveObjective(index, 'down')}
                            disabled={index === formData.objectives.length - 1}
                            className="text-gray-500 hover:text-green-600 hover:bg-green-50 rounded p-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-center w-6 text-gray-400 text-sm font-medium">
                          {index + 1}.
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Enter objective"
                          value={objective}
                          onChange={(e) => handleObjectiveChange(index, e.target.value)}
                          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                          required
                        />
                        
                        {formData.objectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeObjective(index)}
                            className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - AI Generated Script */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                    AI-Generated Call Script
                    {isGenerating && (
                      <span className="text-xs text-purple-600 font-normal flex items-center gap-1">
                        <Sparkles size={14} className="animate-pulse" />
                        Generating...
                      </span>
                    )}
                  </h3>
                  
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Generated Call Script <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex-1">
                      <textarea
                        name="prompt"
                        value={formData.prompt}
                        onChange={handleInputChange}
                        placeholder="Script will be auto-generated as you fill in the details and objectives..."
                        className="w-full h-full min-h-[500px] bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                        required
                      />
                      {isGenerating && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                          <div className="flex items-center gap-2 text-purple-600">
                            <Sparkles size={20} className="animate-spin" />
                            <span className="font-medium">Generating script...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                     Script auto-generates when you add or update objectives
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
  type="submit"
  disabled={loading || isGenerating}
  className="
    bg-gradient-to-r from-slate-900 to-slate-800 
    hover:translate-y-[-2px] 
    hover:shadow-md
    disabled:bg-gray-400 
    text-white px-6 py-3 rounded-lg 
    flex items-center gap-2 
    transition-all duration-200 font-medium
  "
>
  <Save size={18} />
  {loading ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
</button>

              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
