"use client";
import { useState } from 'react';
import { Sparkles, Save, X } from 'lucide-react';
import { createPrompt, generatePrompt } from '../lib/promptApi';
// import { generatePrompt, createPrompt } from '../app/lib/promptApi';

export default function QuickPromptCreator({ onPromptCreated, onClose }) {
  const [formData, setFormData] = useState({
    business: '',
    tone: 'professional',
    prompt_type: 'sales',
  });
  const [product, setProduct] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    features: ['']
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...product.features];
    newFeatures[index] = value;
    setProduct(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setProduct(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    setProduct(prev => ({ 
      ...prev, 
      features: prev.features.filter((_, i) => i !== index) 
    }));
  };

  const handleGenerate = async () => {
    if (!formData.business || !product.name) {
      alert('Please fill in business name and product name');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generatePrompt({
        ...formData,
        products: [product]
      });
      setGeneratedPrompt(response.generated_prompt);
    } catch (error) {
      alert('Error generating prompt: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPrompt) {
      alert('Please generate a prompt first');
      return;
    }

    setIsSaving(true);
    try {
      const response = await createPrompt({
        ...formData,
        products: [product],
        generated_prompt: generatedPrompt
      });
      onPromptCreated?.(response);
      onClose?.();
    } catch (error) {
      alert('Error saving prompt: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quick Prompt Creator</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name *</label>
                <input
                  type="text"
                  name="business"
                  value={formData.business}
                  onChange={handleInputChange}
                  placeholder="e.g., Acme Corporation"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tone</label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="prompt_type"
                value={formData.prompt_type}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="sales">Sales</option>
                <option value="support">Support</option>
              </select>
            </div>

            {/* Product Info */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Product Information</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleProductChange}
                  placeholder="Product Name *"
                  className="border rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="category"
                  value={product.category}
                  onChange={handleProductChange}
                  placeholder="Category"
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  name="price"
                  value={product.price}
                  onChange={handleProductChange}
                  placeholder="Price"
                  className="border rounded px-3 py-2"
                />
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleProductChange}
                  placeholder="Description"
                  className="border rounded px-3 py-2"
                  rows="2"
                />
              </div>

              {/* Features */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Features</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Add Feature
                  </button>
                </div>
                {product.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      className="flex-1 border rounded px-3 py-1"
                    />
                    {product.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.business || !product.name}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              {isGenerating ? 'Generating...' : 'Generate AI Prompt'}
            </button>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <div>
                <label className="block text-sm font-medium mb-2">Generated Prompt</label>
                <textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="w-full border rounded px-3 py-2 h-32"
                  placeholder="Your generated prompt will appear here..."
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving || !generatedPrompt}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Prompt'}
              </button>
              <button
                onClick={onClose}
                className="px-6 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}