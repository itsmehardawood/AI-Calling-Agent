"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {Plus, Trash, Trash2 } from "lucide-react";
// import { apiFetch } from "../app/lib/api.js";
import { motion } from 'framer-motion';
import { apiFetch } from "../lib/api.js";

const initialProduct = {
  name: "",
  category: "",
  description: "",
  price: "",
  features: "",
};

export function GeneratePrompt() {
  const router = useRouter();
  const [tone, setTone] = useState("");
  const [business, setBusiness] = useState("");
  const [promptType, setPromptType] = useState("sales"); // <-- NEW STATE
  const [products, setProducts] = useState([initialProduct]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedPrompt = localStorage.getItem("callAgentPrompt");
    if (storedPrompt) {
      setGeneratedPrompt(storedPrompt);
    }
  }, []);

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...products];
    updated[index][name] = value;
    setProducts(updated);
  };

  const handleFeatureChange = (index, e) => {
    const updated = [...products];
    updated[index].features = e.target.value;
    setProducts(updated);
  };

  // Update delete function
  const handleDelete = () => {
    localStorage.removeItem("callAgentPrompt");
    setGeneratedPrompt(""); // Clear state
  };


  const addProduct = () => {
    setProducts([...products, initialProduct]);
  };

  const removeProduct = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const processedProducts = products.map((product) => ({
        ...product,
        features:
          typeof product.features === "string"
            ? product.features.split(",").map((f) => f.trim()).filter(Boolean)
            : product.features,
      }));

      const res = await apiFetch("/api/calls/generate-initial-and-generic-prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tone,
            business,
            products: processedProducts,
            prompt_type: promptType, // <-- Include in request
          }),
        }
      );

      const data = await res.json();
      if (data.call_agent_prompt) {
        setGeneratedPrompt(data.call_agent_prompt);
        localStorage.setItem("callAgentPrompt", data.call_agent_prompt);
      } else {
        setGeneratedPrompt("No prompt generated.");
      }
    } catch (err) {
      setGeneratedPrompt("Error generating prompt.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (generatedPrompt) {
      localStorage.setItem("callAgentPrompt", generatedPrompt);
      router.push("/start-call");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col lg:flex-row items-start justify-center p-4 gap-6">
      {/* Left Form Section */}
      <form
        onSubmit={handleGenerate}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-xl shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4">Generate AI Call Prompt</h2>

        {/* Prompt Type Selection */}
        <label className="block mb-2">Prompt Type</label>
        <select
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700"
          value={promptType}
          onChange={(e) => setPromptType(e.target.value)}
        >
          <option value="sales">Sales</option>
          <option value="support">Customer Support</option>
        </select>

        <label className="block mb-2">Tone</label>
        <input
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="e.g., persuasive, friendly"
        />

        <label className="block mb-2">Business</label>
        <input
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          placeholder="e.g., Neurovise"
        />

        <div className="flex justify-between items-center mb-2">
          <label className="text-lg font-semibold">Products</label>
          <button
            type="button"
            onClick={addProduct}
            className="text-teal-400 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {products.map((product, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded mb-4 relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-bold">Product {index + 1}</h3>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>

            <input
              name="name"
              placeholder="Name"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600"
              value={product.name}
              onChange={(e) => handleProductChange(index, e)}
            />
            <input
              name="category"
              placeholder="Category"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600"
              value={product.category}
              onChange={(e) => handleProductChange(index, e)}
            />
            <input
              name="description"
              placeholder="Description"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600"
              value={product.description}
              onChange={(e) => handleProductChange(index, e)}
            />
            <input
              name="price"
              placeholder="Price"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600"
              value={product.price}
              onChange={(e) => handleProductChange(index, e)}
            />
            <textarea
              name="features"
              placeholder="Features (comma-separated)"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600"
              value={
                typeof product.features === "string"
                  ? product.features
                  : product.features.join(", ")
              }
              onChange={(e) => handleFeatureChange(index, e)}
            />
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate Prompt"}
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Continue to Call
          </button>
        </div>
      </form>

      {/* Right Preview Section */}
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-xl shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Generated Prompt</h2>
          {generatedPrompt && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-red-400"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        <textarea
          className="w-full h-64 p-3 rounded bg-gray-800 border border-gray-700 resize-none"
          value={generatedPrompt}
          onChange={(e) => setGeneratedPrompt(e.target.value)}
          placeholder="Your generated prompt will appear here..."
        />
      </div>
    </div>
  );
}
