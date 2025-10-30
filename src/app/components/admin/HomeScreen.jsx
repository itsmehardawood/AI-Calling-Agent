"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Phone, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Building,
  Sparkles,
  Shield,
  Bot,
  MoreVertical,
  Filter,
  Plus
} from "lucide-react";
import { getPrompts } from "@/app/lib/promptApi";
import { apiFetch } from "@/app/lib/api.js";

export default function DashboardContent() {
  const router = useRouter();
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [activeTab, setActiveTab] = useState("prompts");

  const availableAgents = [
    { 
      id: "agent-001", 
      name: "Alex Johnson", 
      type: "sales", 
      role: "Sales Specialist",
      description: "Expert in lead conversion and customer acquisition",
      efficiency: "98%",
      calls: "1.2k",
      color: "emerald"
    },
    { 
      id: "agent-002", 
      name: "Sarah Chen", 
      type: "support", 
      role: "Support Expert",
      description: "Specialized in customer service and issue resolution",
      efficiency: "95%",
      calls: "2.1k",
      color: "blue"
    },
    { 
      id: "agent-003", 
      name: "Mike Rodriguez", 
      type: "general", 
      role: "General Assistant",
      description: "Versatile agent for various business needs",
      efficiency: "92%",
      calls: "1.8k",
      color: "blue"
    },
    { 
      id: "agent-004", 
      name: "Emma Wilson", 
      type: "support", 
      role: "Technical Support",
      description: "Technical expert for complex product inquiries",
      efficiency: "96%",
      calls: "1.5k",
      color: "orange"
    },
  ];

  useEffect(() => {
    fetchPrompts();
    fetchServerSelection();
  }, []);

  useEffect(() => {
    const savedPromptId = localStorage.getItem("selectedPromptId");
    if (savedPromptId && prompts.length > 0) {
      const prompt = prompts.find(p => p.id === savedPromptId);
      if (prompt) {
        setSelectedPrompt(prompt);
      }
    }
  }, [prompts]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await getPrompts({ is_active: true });
      setPrompts(response.prompts || []);
    } catch (err) {
      setError("Failed to fetch prompts");
    } finally {
      setLoading(false);
    }
  };

  const fetchServerSelection = async () => {
    try {
      const res = await apiFetch('/api/selections/current');
      if (res.ok) {
        const json = await res.json();
        const { prompt_id, agent_id } = json || {};
        if (agent_id) {
          setSelectedAgentId(agent_id);
          localStorage.setItem('selectedAgentId', agent_id);
        }
        if (prompt_id) {
          localStorage.setItem('selectedPromptId', prompt_id);
        }
      }
    } catch (err) {
      // Fallback to localStorage
    }
  };

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt);
    localStorage.setItem("selectedPromptId", prompt.id);
    localStorage.setItem("callAgentPrompt", prompt.generated_prompt);
    persistCurrentSelection({ prompt_id: prompt.id, agent_id: selectedAgentId });
  };

  const handleAgentSelect = (agentId) => {
    setSelectedAgentId(agentId);
    localStorage.setItem("selectedAgentId", agentId);
    persistCurrentSelection({ prompt_id: selectedPrompt?.id || null, agent_id: agentId });
  };

  const persistCurrentSelection = async ({ prompt_id, agent_id }) => {
    try {
      await apiFetch('/api/selections/current', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_id, agent_id }),
      });
    } catch (err) {
      console.warn('Failed to persist selection to server', err);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedPrompt || !selectedAgentId) return;

    localStorage.setItem("callAgentPrompt", selectedPrompt.generated_prompt);
    localStorage.setItem("selectedAgentId", selectedAgentId);
    localStorage.setItem("selectedPromptId", selectedPrompt.id);

    await persistCurrentSelection({ prompt_id: selectedPrompt.id, agent_id: selectedAgentId });

    setSaved(true);
    setTimeout(() => setSaved(false), 10000);
  };

  const handleClearSelection = async () => {
    try {
      setIsClearing(true);
      await apiFetch('/api/selections/current', { method: 'DELETE' });
      localStorage.removeItem('selectedAgentId');
      localStorage.removeItem('selectedPromptId');
      localStorage.removeItem('callAgentPrompt');
      setSelectedAgentId('');
      setSelectedPrompt(null);
      setSaved(false);
    } catch (err) {
      console.warn('Failed to clear selection', err);
    } finally {
      setIsClearing(false);
    }
  };

  const canProceed = selectedPrompt && selectedAgentId;

  const getTypeColor = (type) => {
    const colors = {
      sales: 'bg-green-100 text-green-800',
      support: 'bg-blue-100 text-blue-800',
      general: 'bg-blue-100 text-blue-800'
    };
    return colors[type] || colors.general;
  };

  const getAgentColor = (color) => {
    const colors = {
      emerald: 'bg-emerald-500',
      blue: 'bg-blue-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Select your prompt and agent to start calling</p>
        </div> */}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("prompts")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "prompts"
                    ? "bg-blue-500 text-gray-100"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText size={18} />
                Businesses
              </button>
              <button
                onClick={() => setActiveTab("agents")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "agents"
                    ? "bg-blue-500 text-gray-100"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Bot size={18} />
                Agents
              </button>
            </div>
            
            {/* <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push("/prompts")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Create New
              </button>
            </div> */}
          </div>

          {/* Prompts Table */}
          {activeTab === "prompts" && (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading prompts...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={fetchPrompts}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : prompts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No prompts available</p>
                  <button
                    onClick={() => router.push("/prompts")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create First Prompt
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Business Name
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Prompt Type
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tone
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Products/Services
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-3 px-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {prompts.map((prompt) => (
                        <tr 
                          key={prompt.id}
                          onClick={() => handlePromptSelect(prompt)}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedPrompt?.id === prompt.id ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building size={18} className="text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{prompt.business_name}</div>
                                <div className="text-sm text-gray-500">
                                  {prompt.generated_prompt.substring(0, 40)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(prompt.prompt_type)}`}>
                              {prompt.prompt_type}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-gray-700">{prompt.tone}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-600">
                              <div>Products: {prompt.products?.length || 0}</div>
                              {/* <div>Services: {prompt.services?.length || 0}</div> */}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {selectedPrompt?.id === prompt.id ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <CheckCircle size={16} />
                                Selected
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">Available</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Agents Table */}
          {activeTab === "agents" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Agent Name
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Efficiency
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Calls
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {availableAgents.map((agent) => (
                    <tr 
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent.id)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedAgentId === agent.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getAgentColor(agent.color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Shield size={18} className="text-white" />
                          </div>
                          <div className="font-semibold text-gray-900">{agent.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{agent.role}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(agent.type)}`}>
                          {agent.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-yellow-500" />
                          <span className="text-gray-700 font-medium">{agent.efficiency}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-gray-700 font-medium">{agent.calls}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {selectedAgentId === agent.id ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle size={16} />
                            Selected
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Available</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {(selectedPrompt || selectedAgentId) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Configuration</h3>
              <button
                onClick={handleClearSelection}
                disabled={isClearing}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isClearing 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                {isClearing ? 'Clearing...' : 'Clear Selection'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {selectedPrompt && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Selected Prompt</h4>
                  </div>
                  <p className="text-blue-800 font-medium">{selectedPrompt.business_name}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-blue-700">
                    <span>Type: {selectedPrompt.prompt_type}</span>
                    <span>•</span>
                    <span>Tone: {selectedPrompt.tone}</span>
                  </div>
                </div>
              )}
              
              {selectedAgentId && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={18} className="text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Selected Agent</h4>
                  </div>
                  <p className="text-blue-800 font-medium">
                    {availableAgents.find(a => a.id === selectedAgentId)?.name}
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    {availableAgents.find(a => a.id === selectedAgentId)?.role}
                  </p>
                </div>
              )}
            </div>

            {/* <div className="flex justify-center">
              <button
                onClick={handleConfirmSelection}
                disabled={!canProceed}
                className={`flex items-center gap-3 px-8 py-3 rounded-lg font-semibold transition-all ${
                  canProceed
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Play size={20} />
                {canProceed ? "Start Calling Session" : "Select Prompt & Agent"}
              </button>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}