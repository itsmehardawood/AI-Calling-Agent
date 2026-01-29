// components/admin/leads/ExportLeadsButton.jsx
"use client";
import { useState } from "react";
import { Download, Calendar, X, FileSpreadsheet } from "lucide-react";
import { getCallsByUser } from "../../../lib/leadsApi";
import { exportCalls } from "../../../utils/csvExport";

export default function ExportLeadsButton({ showToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('csv');
  const [startDate, setStartDate] = useState(() => {
    // Default to 7 days ago
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    // Default to today
    return new Date().toISOString().split('T')[0];
  });

  const handleExport = async () => {
    try {
      setLoading(true);

      // Validate dates
      if (!startDate || !endDate) {
        showToast("Please select both start and end dates", 'error');
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        showToast("Start date must be before end date", 'error');
        return;
      }

      // Get user_id from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        showToast("User ID not found. Please login again.", 'error');
        return;
      }

      // Fetch calls data
      const calls = await getCallsByUser(userId, startDate, endDate);

      if (!calls || calls.length === 0) {
        showToast("No data found for the selected date range", 'info');
        return;
      }

      // Export to selected format
      exportCalls(calls, startDate, endDate, format);
      showToast(`Successfully exported ${calls.length} leads to ${format.toUpperCase()}`, 'success');
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting leads:', error);
      showToast("Error exporting leads: " + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Export to CSV</span>
        <span className="sm:hidden">Export</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex text-gray-800 items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Download className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Export Leads</h3>
                  <p className="text-sm text-gray-500">Select date range</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={16} />
                    Export Format
                  </div>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('csv')}
                    className={`flex-1 px-4 py-2 border rounded-lg transition-all ${
                      format === 'csv'
                        ? 'bg-green-50 border-green-500 text-green-700 font-medium'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('xlsx')}
                    className={`flex-1 px-4 py-2 border rounded-lg transition-all ${
                      format === 'xlsx'
                        ? 'bg-green-50 border-green-500 text-green-700 font-medium'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    XLSX (Excel)
                  </button>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <div className="flex items-center gap-2 ">
                    <Calendar size={16} />
                    Start Date
                  </div>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    End Date
                  </div>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  This will export all leads with appointment details for the selected date range in {format.toUpperCase()} format.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Export {format.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
