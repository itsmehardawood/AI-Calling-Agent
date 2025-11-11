// lib/settingsApi.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

// Helper function to get user ID from localStorage
const getUserId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_id') || localStorage.getItem('userId');
  }
  return null;
};

// Save business profile
export const saveBusinessProfile = async (businessData) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const payload = {
      businessId: userId,
      businessName: businessData.businessName,
      businessType: "sales",
      agentTone: businessData.agentTone,
    };

    const response = await fetch(`${API_BASE_URL}/api/settings/business-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save business profile: ${response.statusText}`);
    }

    const data = await response.json();
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
        id: region.id,
        name: region.name,
        startTime: region.startTime,
        endTime: region.endTime,
        enabled: region.enabled,
        retrySettings: {
          attempts: region.retrySettings?.attempts || 1,
          intervals: region.retrySettings?.intervals || [0]
        },
        recordingRetentionDays: region.recordingRetentionDays
      })),
      instantCallEnabled: schedulingData.instantCallEnabled,
    };

    const response = await fetch(`${API_BASE_URL}/api/settings/call-scheduling`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save call scheduling: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Call scheduling respone: ", data)
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

    const response = await fetch(`${API_BASE_URL}/api/settings/regions?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call scheduling: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching call scheduling:', error);
    throw error;
  }
};


/*
    PUT: Update Call Scheduling Region
*/
export const updateCallSchedulingRegion = async (regionId, retrySettings) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    if (!regionId) {
      throw new Error('Region ID is required');
    }

    const payload = {
      regionId: regionId,
      retrySettings: {
        attempts: retrySettings.attempts,
        intervals: retrySettings.intervals || [0]
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/settings/call-scheduling/${userId}/region/${regionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update call scheduling region: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating call scheduling region:', error);
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
      period: retentionData.period,
      customDays: retentionData.customDays || 0,
    };

    const response = await fetch(`${API_BASE_URL}/api/settings/recording-retention`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save recording retention settings: ${response.statusText}`);
    }

    const data = await response.json();
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

    const response = await fetch(`${API_BASE_URL}/api/settings/business/${userId}/settings/recording-retention`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recording retention: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recording retention:', error);
    throw error;
  }
};


// // GET: Retry Policy
// export const getRetryPolicy = async () => {
//   try {
//     const userId = getUserId();
//     if (!userId) {
//       throw new Error('User ID not found');
//     }

//     const response = await fetch(`${API_BASE_URL}/api/settings/business/${userId}/settings/retry-policy`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch retry policy: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching retry policy:', error);
//     throw error;
//   }
// };

// GET: Consent Policy
export const getConsentPolicy = async () => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await fetch(`${API_BASE_URL}/api/settings/business/${userId}/consent-policy`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch consent policy: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Get policy', data)
    return data;
  } catch (error) {
    console.error('Error fetching consent policy:', error);
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


