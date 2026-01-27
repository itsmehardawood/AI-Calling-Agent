/**
 * Utility functions for CSV export
 */

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
