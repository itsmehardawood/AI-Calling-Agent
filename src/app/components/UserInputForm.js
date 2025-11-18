// app/admin/users/page.jsx
'use client';

import React, { useState } from 'react';
import { Phone, Plus, Trash2, Loader2, User, Target, Info, Sparkles, Shield, Eye } from 'lucide-react';
import { apiFetch } from '../lib/api.js';
import PromptSideMenu from './PromptSideMenu';
// import { apiFetch } from '@/app/lib/api';

const UserInputForm = () => {
  // Get agent_id and prompt from localStorage (selected from dashboard)
  const getInitialAgentId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedAgentId') || '';
    }
    return '';
  };
  
  const getInitialPrompt = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('callAgentPrompt') || '';
    }
    return '';
  };

  const [formData, setFormData] = useState({
    customer_phone: '',
    agent_id: getInitialAgentId(),
    customer_info: '',
    sales_goals: '',
  });
  const [selectedPrompt, setSelectedPrompt] = useState(getInitialPrompt());
  const [isPromptSideMenuOpen, setIsPromptSideMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep agent_id and prompt in sync with localStorage (in case dashboard changes)
  React.useEffect(() => {
    const handleStorage = () => {
      setFormData(prev => ({ ...prev, agent_id: getInitialAgentId() }));
      setSelectedPrompt(getInitialPrompt());
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
      handleStorage();

      // Attempt to fetch server-side singleton selection
      (async () => {
        try {
          const res = await apiFetch('/api/selections/current');
          if (res.ok) {
            const json = await res.json();
            const { prompt_id, agent_id } = json || {};
            if (agent_id) {
              localStorage.setItem('selectedAgentId', agent_id);
              setFormData(prev => ({ ...prev, agent_id }));
            }
            if (prompt_id) {
              localStorage.setItem('selectedPromptId', prompt_id);
              try {
                const pRes = await apiFetch(`/api/prompts/${prompt_id}`);
                if (pRes.ok) {
                  const pJson = await pRes.json();
                  const promptText = pJson.generated_prompt || pJson.generatedPrompt || '';
                  if (promptText) {
                    localStorage.setItem('callAgentPrompt', promptText);
                    setSelectedPrompt(promptText);
                  } else {
                    const existing = localStorage.getItem('callAgentPrompt') || '';
                    if (existing) setSelectedPrompt(existing);
                  }
                } else {
                  const existing = localStorage.getItem('callAgentPrompt') || '';
                  if (existing) setSelectedPrompt(existing);
                }
              } catch (err) {
                const existing = localStorage.getItem('callAgentPrompt') || '';
                if (existing) setSelectedPrompt(existing);
              }
            } else {
              const existing = localStorage.getItem('callAgentPrompt') || '';
              if (existing) setSelectedPrompt(existing);
            }
          }
        } catch (err) {
          const existing = localStorage.getItem('callAgentPrompt') || '';
          if (existing) setSelectedPrompt(existing);
        }
      })();

      return () => window.removeEventListener('storage', handleStorage);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleListChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const constructPayload = () => {
    return {
      customer_phone: formData.customer_phone,
      agent_id: formData.agent_id,
      customer_info: formData.customer_info
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      sales_goals: formData.sales_goals
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      generated_message: selectedPrompt || '',
    };
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const payload = constructPayload();
      // console.log('Sending payload:', payload);

      const response = await apiFetch(`/api/calls/outbound`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      // console.log('Call initiated successfully:', result);

      if (result.call_id) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('current_call_id', result.call_id);
          localStorage.setItem('call_data', JSON.stringify(payload));
          window.location.href = `/call?call_id=${result.call_id}`;
        }
      } else {
        throw new Error('No call_id received from API');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isReady = formData.agent_id && selectedPrompt;

  return (
    <>
      <div className="space-y-6 py-10 px-30">
        {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Phone className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Initiate AI Call</h1>
            <p className="text-gray-600 mt-1">Start a new outbound call with your configured agent</p>
          </div>
        </div>
      </div>

      {/* Setup Status */}
      {!formData.agent_id || !selectedPrompt ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-amber-800 font-medium mb-1">Setup Required</h3>
              <p className="text-amber-700 text-sm">
                Please select both an agent and a prompt from the dashboard before starting a call.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-green-800 font-medium mb-1">Ready to Call</h3>
              <p className="text-green-700 text-sm">
                Agent and prompt are configured. You can now initiate a call.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer & Agent Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Customer & Agent Details</h2>
                <p className="text-gray-600 text-sm">Configure the call recipient and agent settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700">
                  Customer Phone Number *
                </label>
                <input
                  type="text"
                  name="customer_phone"
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="agent_id" className="block text-sm font-medium text-gray-700">
                  Agent ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="agent_id"
                    id="agent_id"
                    value={formData.agent_id}
                    readOnly
                    placeholder="Select agent on dashboard"
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed"
                  />
                  <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="customer_info" className="block text-sm font-medium text-gray-700">
                  Customer Information
                </label>
                <div className="relative">
                  <textarea
                    name="customer_info"
                    id="customer_info"
                    rows="3"
                    value={formData.customer_info}
                    onChange={handleListChange}
                    placeholder="e.g., Interested in luxury properties, Budget: 2M-5M AED, Previous customer, VIP status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                  <div className="absolute bottom-2 right-2">
                    <span className="text-xs text-gray-400 bg-white px-1">
                      {formData.customer_info.split(',').filter(item => item.trim()).length} items
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Enter comma-separated customer details and preferences</p>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="sales_goals" className="block text-sm font-medium text-gray-700">
                  Sales Goals & Objectives
                </label>
                <div className="relative">
                  <textarea
                    name="sales_goals"
                    id="sales_goals"
                    rows="3"
                    value={formData.sales_goals}
                    onChange={handleListChange}
                    placeholder="e.g., Convert leads to buyers, Promote luxury real estate, Schedule property viewing, Collect feedback"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                  {/* <div className="absolute bottom-2 right-2">
                    <span className="text-xs text-gray-400 bg-white px-1">
                      {formData.sales_goals.split(',').filter(item => item.trim()).length} goals
                    </span>
                  </div> */}
                </div>
                {/* <p className="text-xs text-gray-500">Define comma-separated objectives for this call</p> */}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-red-800 font-medium mb-1">Call Failed</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Prompt Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Active Prompt</h2>
                  <p className="text-gray-600 text-sm">Currently selected conversation guide</p>
                </div>
              </div>
              <button
                onClick={() => setIsPromptSideMenuOpen(true)}
                className="p-2 hover:bg-gray-100 bg-blue-100 rounded-lg text-gray-600 flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">View</span>
              </button>
            </div>

            <div className="bg-blue-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              {selectedPrompt ? (
                <p className="text-gray-700 text-md leading-relaxed whitespace-pre-line">
                  {selectedPrompt}
                </p>
              ) : (
                <div className="text-center py-4">
                  <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No prompt selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Call Action Card */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-xl p-6 text-white">
            <div className="text-center">
              {/* <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Connect</h3>
              <p className="text-blue-100 text-sm mb-6">
                Initiate an AI-powered call with your configured settings
              </p> */}
              
              <button
                onClick={handleSubmit}
                disabled={isLoading || !isReady}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting Call...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Start AI Call
                  </>
                )}
              </button>

              {!isReady && (
                <p className="text-blue-200 text-xs mt-3">
                  Configure agent and prompt in dashboard first
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    <PromptSideMenu
      isOpen={isPromptSideMenuOpen}
      onClose={() => setIsPromptSideMenuOpen(false)}
      prompt={{
        greetingMessage: "Hey there!",
        backgroundInfo: selectedPrompt,
        productInfo: "",
        targetAudience: "",
        objectionHandling: ""
      }}
    />
    </>
  );
};

export default UserInputForm;