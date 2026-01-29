/**
 * Utility functions for CSV and XLSX export
 */
import * as XLSX from 'xlsx';

/**
 * Convert calls data to CSV format
 * @param {Array} calls - Array of call objects from API
 * @returns {string} CSV formatted string
 */
export function convertCallsToCSV(calls) {
  if (!calls || calls.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = [
    'Lead Name',
    'Email',
    'Phone',
    'Company',
    'Call Status',
    'Call Duration (seconds)',
    'Call Date',
    'Meeting Summary',
    'Meeting Date/Time',
    'Meeting Link',
    'Invite Sent'
  ];

  // Create CSV rows
  const rows = calls.map(call => {
    const lead = call.lead?.raw_data || {};
    const meeting = call.meeting || {};
    const attendee = meeting.event_payload?.attendees?.[0] || {};

    return [
      attendee.displayName || lead.name || 'N/A',
      lead.email || meeting.attendee_email || 'N/A',
      lead.phone || 'N/A',
      lead.company || 'N/A',
      call.status || 'N/A',
      call.duration_seconds?.toFixed(2) || 'N/A',
      call.created_at ? new Date(call.created_at).toLocaleString() : 'N/A',
      meeting.summary || 'N/A',
      meeting.start_time ? new Date(meeting.start_time).toLocaleString() : 'N/A',
      meeting.eventLink || 'N/A',
      meeting.invite_sent ? 'Yes' : 'No'
    ];
  });

  // Escape CSV values (handle commas and quotes)
  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Combine headers and rows
  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map(row => row.map(escapeCSVValue).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export function downloadCSV(csvContent, filename = 'leads_export.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export calls data to CSV file
 * @param {Array} calls - Array of call objects from API
 * @param {string} startDate - Start date for filename
 * @param {string} endDate - End date for filename
 */
export function exportCallsToCSV(calls, startDate, endDate) {
  const csvContent = convertCallsToCSV(calls);
  
  if (!csvContent) {
    throw new Error('No data to export');
  }

  const filename = `leads_export_${startDate}_to_${endDate}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Convert calls data to array format for XLSX
 * @param {Array} calls - Array of call objects from API
 * @returns {Array} Array of objects for XLSX
 */
export function convertCallsToArray(calls) {
  if (!calls || calls.length === 0) {
    return [];
  }

  return calls.map(call => {
    const lead = call.lead?.raw_data || {};
    const meeting = call.meeting || {};
    const attendee = meeting.event_payload?.attendees?.[0] || {};

    return {
      'Lead Name': attendee.displayName || lead.name || 'N/A',
      'Email': lead.email || meeting.attendee_email || 'N/A',
      'Phone': lead.phone || 'N/A',
      'Company': lead.company || 'N/A',
      'Call Status': call.status || 'N/A',
      'Call Duration (seconds)': call.duration_seconds?.toFixed(2) || 'N/A',
      'Call Date': call.created_at ? new Date(call.created_at).toLocaleString() : 'N/A',
      'Meeting Summary': meeting.summary || 'N/A',
      'Meeting Date/Time': meeting.start_time ? new Date(meeting.start_time).toLocaleString() : 'N/A',
      'Meeting Link': meeting.eventLink || 'N/A',
      'Invite Sent': meeting.invite_sent ? 'Yes' : 'No'
    };
  });
}

/**
 * Download XLSX file
 * @param {Array} data - Array of objects
 * @param {string} filename - Name of the file to download
 */
export function downloadXLSX(data, filename = 'leads_export.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export calls data to XLSX file
 * @param {Array} calls - Array of call objects from API
 * @param {string} startDate - Start date for filename
 * @param {string} endDate - End date for filename
 */
export function exportCallsToXLSX(calls, startDate, endDate) {
  const data = convertCallsToArray(calls);
  
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const filename = `leads_export_${startDate}_to_${endDate}.xlsx`;
  downloadXLSX(data, filename);
}

/**
 * Export calls data to selected format
 * @param {Array} calls - Array of call objects from API
 * @param {string} startDate - Start date for filename
 * @param {string} endDate - End date for filename
 * @param {string} format - Export format ('csv' or 'xlsx')
 */
export function exportCalls(calls, startDate, endDate, format = 'csv') {
  if (format === 'xlsx') {
    exportCallsToXLSX(calls, startDate, endDate);
  } else {
    exportCallsToCSV(calls, startDate, endDate);
  }
}
