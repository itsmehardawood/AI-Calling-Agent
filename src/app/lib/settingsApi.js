// lib/settingsApi.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

// Helper function to get user ID from localStorage
const getUserId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_id') || localStorage.getItem('userId');
  }
  return null;
};

// Helper function to safely parse JSON response
const parseJsonResponse = async (response, operationName) => {
  const contentType = response.headers.get('content-type');
  
  // console.log(`[${operationName}] Response status:`, response.status);
  // console.log(`[${operationName}] Content-Type:`, contentType);
  
  // Check if response is actually JSON
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error(`[${operationName}] Received non-JSON response:`, text.substring(0, 200));
    
    // If it's an HTML response, it might be a Next.js error page or ngrok issue
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error(`API endpoint returned HTML instead of JSON. This might be a routing issue or the ngrok tunnel is down. Please verify the API is running at: ${API_BASE_URL}`);
    }
    
    throw new Error(`Expected JSON response but received: ${contentType || 'unknown content type'}`);
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${operationName}] Error response:`, errorText);
    throw new Error(`${operationName} failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  // console.log(`[${operationName}] Success:`, JSON.stringify(data, null, 2));
  return data;
};

/*
    GET: Business Profile
*/
export const getBusinessProfile = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const url = `${API_BASE_URL}/api/settings/business-profile/${userId}`;
    // console.log('[getBusinessProfile] Request URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
      },
    });

    return await parseJsonResponse(response, 'getBusinessProfile');
  } catch (error) {
    console.error('[getBusinessProfile] Error:', error.message);
    throw error;
  }
};

/*
    POST: Save Business Profile
*/
export const saveBusinessProfile = async (businessData) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const payload = {
      businessId: userId,
      businessName: businessData.businessName,
      agentTone: businessData.agentTone,
    };

    // console.log('Saving business profile:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/settings/business-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to save business profile: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('Business profile saved:', data);
    return data;
  } catch (error) {
    console.error('Error saving business profile:', error);
    throw error;
  }
};


/* 
    POST : call scheduling API  
*/
export const saveCallScheduling = async (schedulingData) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const payload = {
      businessId: userId,
      regions: schedulingData.regions.map(region => ({
        name: region.name,
        startTime: region.startTime, // ISO 8601 timestamp
        endTime: region.endTime, // ISO 8601 timestamp
        enabled: region.enabled,
        retrySettings: {
          attempts: region.retrySettings?.attempts || 1,
          intervals: region.retrySettings?.intervals || [2] // Only digits in minutes
        },
        recordingRetentionDays: region.recordingRetentionDays || 1
      })),
      instantCallEnabled: schedulingData.instantCallEnabled,
    };

    // console.log('Sending call scheduling payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/settings/call_scheduling`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save call scheduling: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    // console.log("Call scheduling response: ", data);
    return data;
  } catch (error) {
    console.error('Error saving call scheduling:', error);
    throw error;
  }
};


/* 
    GET: Call Scheduling ***
*/
export const getCallScheduling = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const url = `${API_BASE_URL}/api/settings/get_call_schedulings?businessId=${userId}`;
    // console.log('[getCallScheduling] Request URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
      },
    });

    const data = await parseJsonResponse(response, 'getCallScheduling');
    // console.log('[getCallScheduling] Regions:', data.regions, 'Is array?', Array.isArray(data.regions));
    return data;
  } catch (error) {
    console.error('[getCallScheduling] Error:', error.message);
    throw error;
  }
};


/*
    PUT: Update Call Scheduling Region
*/
export const updateCallSchedulingRegion = async (regionId, regionData) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    if (!regionId) {
      throw new Error('Region ID is required');
    }

    const payload = {
      name: regionData.name,
      startTime: regionData.startTime, // ISO 8601 timestamp
      endTime: regionData.endTime, // ISO 8601 timestamp
      enabled: regionData.enabled,
      retrySettings: {
        attempts: regionData.retrySettings?.attempts || 1,
        intervals: regionData.retrySettings?.intervals || [2]
      },
      recordingRetentionDays: regionData.recordingRetentionDays || 1
    };

    // console.log('Updating region:', regionId, 'with data:', JSON.stringify(payload, null, 2));
    const url = `${API_BASE_URL}/api/settings/update_call_scheduling/${userId}/region/${regionId}`;
    // console.log('Update URL:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // console.log('Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update error response:', errorText);
      throw new Error(`Failed to update call scheduling region: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('Update response data:', data);
    return data;
  } catch (error) {
    console.error('Error updating call scheduling region:', error);
    throw error;
  }
};

/*
    DELETE: Delete Call Scheduling Region
*/
export const deleteCallSchedulingRegion = async (regionId) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    if (!regionId) {
      throw new Error('Region ID is required');
    }

    // console.log('Deleting region:', regionId, 'for business:', userId);
    const url = `${API_BASE_URL}/api/settings/delete_call_scheduling/${userId}/region/${regionId}`;
    // console.log('Delete URL:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // console.log('Delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete error response:', errorText);
      throw new Error(`Failed to delete call scheduling region: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('Delete response data:', data);
    return data;
  } catch (error) {
    console.error('Error deleting call scheduling region:', error);
    throw error;
  }
};

/*
    POST: Save Recording Retention Settings
*/
export const saveRecordingRetention = async (retentionData) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const payload = {
      businessId: userId,
      period: retentionData.period || 0,
      customDays: retentionData.customDays || 0,
    };

    // console.log('Saving recording retention:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/settings/recording-retention`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to save recording retention settings: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('Recording retention saved:', data);
    return data;
  } catch (error) {
    console.error('Error saving recording retention settings:', error);
    throw error;
  }
};


/* 
    GET: Recording Retention
*/
export const getRecordingRetention = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const url = `${API_BASE_URL}/api/settings/business/${userId}/settings/recording-retention`;
    // console.log('[getRecordingRetention] Request URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    return await parseJsonResponse(response, 'getRecordingRetention');
  } catch (error) {
    console.error('[getRecordingRetention] Error:', error.message);
    throw error;
  }
};


// // GET: Retry Policy


// GET: Consent Policy
export const getConsentPolicy = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const url = `${API_BASE_URL}/api/settings/business/${userId}/consent-policy`;
    // console.log('[getConsentPolicy] Request URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    return await parseJsonResponse(response, 'getConsentPolicy');
  } catch (error) {
    console.error('[getConsentPolicy] Error:', error.message);
    throw error;
  }
};


// Save consent policy
export const saveConsentPolicy = async (script) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const payload = {
      businessId: userId,
      script: script,
    };

    const response = await fetch(`${API_BASE_URL}/api/settings/consent-policy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save consent policy: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving consent policy:', error);
    throw error;
  }
};


/*
    PUT: Update Consent Policy
*/
export const updateConsentPolicy = async (script) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const payload = {
      script: script,
    };

    const response = await fetch(`${API_BASE_URL}/api/settings/consent-policy/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update consent policy: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating consent policy:', error);
    throw error;
  }
};


