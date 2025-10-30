// app/admin/page.jsx
'use client';
import { useState, React } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/admin/AdminLayout';
import DashboardContent from '@/app/components/admin/HomeScreen';
import { BotIcon, Building, FileTextIcon, LucideLogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const handleLogout = () => {
    // Clear localStorage and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    router.push('/login');
  };
  return (
    <AdminLayout>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate pl-4">
            Admin Dashboard
          </h2>
        </div>

        <button
              onClick={() => handleLogout()}
              className="inline-flex items-center gap-2 bg-red-700 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <LucideLogOut size={16} />
              Logout
            </button>
      </div>

      {/* Stats cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 px-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Businesses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">4</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <FileTextIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Businesses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">1</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <BotIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Agents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">4</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-8 px-4">
        <div className="bg-white shadow rounded-lg">
          <DashboardContent/>
        </div>
      </div>
    </AdminLayout>
  );
}













// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Phone, Settings, FileText, ChevronRight, CheckCircle, AlertCircle, Users, LucideLogOut } from "lucide-react";
// // import { getPrompts } from "../../lib/promptApi";
// import { apiFetch } from "@/app/lib/api.js";
// import { getPrompts } from "@/app/lib/promptApi";
// // import { apiFetch } from "../../lib/api.js.js";

// export default function DashboardPage() {
//   const router = useRouter();
//   const [selectedPrompt, setSelectedPrompt] = useState(null);
//   const [selectedAgentId, setSelectedAgentId] = useState("");
//   const [prompts, setPrompts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Available agent IDs (you can modify this or make it dynamic)
//   const availableAgents = [
//     { id: "agent-001", name: "Alex - Sales Specialist", type: "sales" },
//     { id: "agent-002", name: "Sarah - Support Expert", type: "support" },
//     { id: "agent-003", name: "Mike - General Assistant", type: "general" },
//     { id: "agent-004", name: "Emma - Technical Support", type: "support" },
//   ];

//   useEffect(() => {
//     fetchPrompts();
//     // Check if there's a saved selection in server (singleton)
//     const fetchServerSelection = async () => {
//       try {
//         const res = await apiFetch('/api/selections/current');
//         if (res.ok) {
//           const json = await res.json();
//           const { prompt_id, agent_id } = json || {};
//           if (agent_id) {
//             setSelectedAgentId(agent_id);
//             localStorage.setItem('selectedAgentId', agent_id);
//           }
//           if (prompt_id) {
//             // save prompt id now; actual prompt content will be set when prompts load
//             localStorage.setItem('selectedPromptId', prompt_id);
//           }
//         }
//       } catch (err) {
//         // ignore - fallback to localStorage below
//       }
//     };

//     fetchServerSelection();
//   }, []);

//   useEffect(() => {
//     // Set selected prompt when prompts are loaded
//     const savedPromptId = localStorage.getItem("selectedPromptId");
//     if (savedPromptId && prompts.length > 0) {
//       const prompt = prompts.find(p => p.id === savedPromptId);
//       if (prompt) {
//         setSelectedPrompt(prompt);
//       }
//     }
//   }, [prompts]);

//   const fetchPrompts = async () => {
//     setLoading(true);
//     try {
//       const response = await getPrompts({ is_active: true });
//       setPrompts(response.prompts || []);
//     } catch (err) {
//       setError("Failed to fetch prompts");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePromptSelect = (prompt) => {
//     setSelectedPrompt(prompt);
//     localStorage.setItem("selectedPromptId", prompt.id);
//     localStorage.setItem("callAgentPrompt", prompt.generated_prompt);
//     // persist to server
//     persistCurrentSelection({ prompt_id: prompt.id, agent_id: selectedAgentId });
//   };

//   const handleAgentSelect = (agentId) => {
//     setSelectedAgentId(agentId);
//     localStorage.setItem("selectedAgentId", agentId);
//     // persist to server
//     persistCurrentSelection({ prompt_id: selectedPrompt?.id || null, agent_id: agentId });
//   };

//   // Persist singleton selection to server via PUT (upsert)
//   const persistCurrentSelection = async ({ prompt_id, agent_id }) => {
//     try {
//       await apiFetch('/api/selections/current', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt_id, agent_id }),
//       });
//     } catch (err) {
//       // non-blocking: keep localStorage as the source of truth for immediate UX
//       console.warn('Failed to persist selection to server', err);
//     }
//   };

//   const [saved, setSaved] = useState(false);
//   const [isClearing, setIsClearing] = useState(false);

//   const handleConfirmSelection = async () => {
//     if (!selectedPrompt || !selectedAgentId) return;

//     // Persist to localStorage
//     localStorage.setItem("callAgentPrompt", selectedPrompt.generated_prompt);
//     localStorage.setItem("selectedAgentId", selectedAgentId);
//     localStorage.setItem("selectedPromptId", selectedPrompt.id);

//     // Persist to server (non-blocking UI)
//     await persistCurrentSelection({ prompt_id: selectedPrompt.id, agent_id: selectedAgentId });

//     // Brief confirmation UI
//     setSaved(true);
//     // keep the panel visible for interaction; auto-hide after 10s
//     setTimeout(() => setSaved(false), 10000);
//   };

  // const handleLogout = () => {
  //   // Clear localStorage and redirect to login
  //   localStorage.removeItem('access_token');
  //   localStorage.removeItem('role');
  //   router.push('/login');
  // };

//   const canProceed = selectedPrompt && selectedAgentId;

//   return (
//     <div className="min-h-screen bg-gray-900 p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-white mb-1">Call Agent Dashboard</h1>
//               <p className="text-gray-400">Select a prompt and agent to start your call</p>
//             </div>

//             <button
//               onClick={() => handleLogout()}
//               className="inline-flex items-center gap-2 bg-red-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
//             >
//               <LucideLogOut size={16} />
//               Logout
//             </button>
//           </div>


//         {/* Progress Indicator */}
//         <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
//           <h2 className="text-lg font-semibold text-white mb-4">Setup Progress</h2>
//           <div className="flex items-center gap-4">
//             <div className={`flex items-center gap-2 ${selectedPrompt ? 'text-green-400' : 'text-gray-400'}`}>
//               {selectedPrompt ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
//               <span>Prompt Selected</span>
//             </div>
//             <ChevronRight size={20} className="text-gray-600" />
//             <div className={`flex items-center gap-2 ${selectedAgentId ? 'text-green-400' : 'text-gray-400'}`}>
//               {selectedAgentId ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
//               <span>Agent Selected</span>
//             </div>
//             <ChevronRight size={20} className="text-gray-600" />
//             <div className={`flex items-center gap-2 ${canProceed ? 'text-green-400' : 'text-gray-400'}`}>
//               <Phone size={20} />
//               <span>Ready to Call</span>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Prompt Selection */}
//           <div className="bg-gray-800 rounded-lg border border-gray-700">
//             <div className="p-6 border-b border-gray-700">
//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-3">
//                   <FileText size={24} className="text-blue-400" />
//                   <div>
//                     <h2 className="text-xl font-semibold text-white">Select Prompt</h2>
//                     <p className="text-gray-400 text-sm">Choose from your saved prompts</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => router.push("/prompts")}
//                   className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
//                 >
//                   Manage Prompts
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               {loading ? (
//                 <div className="text-center py-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
//                   <p className="text-gray-400 mt-2">Loading prompts...</p>
//                 </div>
//               ) : error ? (
//                 <div className="text-center py-8">
//                   <p className="text-red-400">{error}</p>
//                   <button
//                     onClick={fetchPrompts}
//                     className="mt-2 text-blue-400 hover:text-blue-300"
//                   >
//                     Retry
//                   </button>
//                 </div>
//               ) : prompts.length === 0 ? (
//                 <div className="text-center py-8">
//                   <FileText size={48} className="text-gray-600 mx-auto mb-4" />
//                   <p className="text-gray-400 mb-4">No prompts available</p>
//                   <button
//                     onClick={() => router.push("/prompts")}
//                     className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
//                   >
//                     Create Your First Prompt
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {prompts.map((prompt) => (
//                     <div
//                       key={prompt.id}
//                       onClick={() => handlePromptSelect(prompt)}
//                       className={`p-4 rounded-lg border cursor-pointer transition-all ${
//                         selectedPrompt?.id === prompt.id
//                           ? "border-blue-500 bg-blue-500/10"
//                           : "border-gray-600 hover:border-gray-500 bg-gray-750"
//                       }`}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-2">
//                             <h3 className="font-medium text-white">{prompt.business_name}</h3>
//                             <span className={`px-2 py-1 rounded text-xs ${
//                               prompt.prompt_type === 'sales' 
//                                 ? 'bg-green-600 text-green-100' 
//                                 : 'bg-blue-600 text-blue-100'
//                             }`}>
//                               {prompt.prompt_type}
//                             </span>
//                           </div>
//                           <p className="text-gray-400 text-sm line-clamp-2">
//                             {prompt.generated_prompt.substring(0, 120)}...
//                           </p>
//                           <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
//                             <span>Tone: {prompt.tone}</span>
//                             <span>Products: {prompt.products.length}</span>
//                           </div>
//                         </div>
//                         {selectedPrompt?.id === prompt.id && (
//                           <CheckCircle size={20} className="text-green-400 ml-2" />
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Agent Selection */}
//           <div className="bg-gray-800 rounded-lg border border-gray-700">
//             <div className="p-6 border-b border-gray-700">
//               <div className="flex items-center gap-3">
//                 <Users size={24} className="text-blue-400" />
//                 <div>
//                   <h2 className="text-xl font-semibold text-white">Select Agent</h2>
//                   <p className="text-gray-400 text-sm">Choose your AI agent</p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6">
//               <div className="space-y-3">
//                 {availableAgents.map((agent) => (
//                   <div
//                     key={agent.id}
//                     onClick={() => handleAgentSelect(agent.id)}
//                     className={`p-4 rounded-lg border cursor-pointer transition-all ${
//                       selectedAgentId === agent.id
//                         ? "border-blue-500 bg-blue-500/10"
//                         : "border-gray-600 hover:border-gray-500 bg-gray-750"
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="font-medium text-white">{agent.name}</h3>
//                         <p className="text-gray-400 text-sm capitalize">Specializes in {agent.type}</p>
//                         <p className="text-gray-500 text-xs mt-1">ID: {agent.id}</p>
//                       </div>
//                       {selectedAgentId === agent.id && (
//                         <CheckCircle size={20} className="text-green-400" />
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Selected Items Summary */}
//         {(selectedPrompt || selectedAgentId) && (
//           <div className="bg-gray-800 rounded-lg p-6 mt-8 border border-gray-700">
//             <h3 className="text-lg font-semibold text-white mb-4">Current Selection</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {selectedPrompt && (
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Prompt</h4>
//                   <div className="bg-gray-750 p-3 rounded border border-gray-600">
//                     <p className="text-white font-medium">{selectedPrompt.business_name}</p>
//                     <p className="text-gray-400 text-sm">Type: {selectedPrompt.prompt_type} | Tone: {selectedPrompt.tone}</p>
//                   </div>
//                 </div>
//               )}
//               {selectedAgentId && (
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Agent</h4>
//                   <div className="bg-gray-750 p-3 rounded border border-gray-600">
//                     <p className="text-white font-medium">
//                       {availableAgents.find(a => a.id === selectedAgentId)?.name}
//                     </p>
//                     <p className="text-gray-400 text-sm">ID: {selectedAgentId}</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Start Call Button */}
//         <div className="mt-8 text-center">
//           <button
//             onClick={handleConfirmSelection}
//             disabled={!canProceed}
//             className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
//               canProceed
//                 ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
//                 : "bg-gray-700 text-gray-400 cursor-not-allowed"
//             }`}
//           >
//             {canProceed ? (
//               <span className="flex items-center gap-2">
//                 <CheckCircle size={20} />
//                 Confirm Selection
//               </span>
//             ) : (
//               "Please select both prompt and agent"
//             )}
//           </button>

//           {saved && (
//             <div className="mt-4 flex flex-col items-center gap-3">
//               <div className="text-sm text-green-400">Selection saved</div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={async () => {
//                     try {
//                       setIsClearing(true);
//                       await apiFetch('/api/selections/current', { method: 'DELETE' });
//                       // clear local selection state
//                       localStorage.removeItem('selectedAgentId');
//                       localStorage.removeItem('selectedPromptId');
//                       localStorage.removeItem('callAgentPrompt');
//                       setSelectedAgentId('');
//                       setSelectedPrompt(null);
//                       setSaved(false);
//                     } catch (err) {
//                       console.warn('Failed to clear selection', err);
//                     } finally {
//                       setIsClearing(false);
//                     }
//                   }}
//                   disabled={isClearing}
//                   className={`px-3 py-1 rounded-md text-sm ${isClearing ? 'bg-gray-600 text-gray-200' : 'bg-red-600 hover:bg-red-500 text-white'}`}
//                 >
//                   {isClearing ? 'Clearing...' : 'Clear Selection'}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
