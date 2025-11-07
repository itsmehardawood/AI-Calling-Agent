'use client';

import { useEffect } from 'react';
import { collectDeviceInfo } from '../utils/collectDeviceInfo';

export default function DeviceInfoLogger() {
  useEffect(() => {
    const logDeviceInfo = async () => {
      try {
        console.log('🔍 Collecting device information...');
        const deviceInfo = await collectDeviceInfo({ includeLocation: true });
        
        console.log('📱 DEVICE INFORMATION:', deviceInfo);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🖥️  Device & Environment:');
        console.log('   • User Agent:', deviceInfo.userAgent);
        console.log('   • Platform:', deviceInfo.platform);
        console.log('   • Hardware Concurrency:', deviceInfo.hardwareConcurrency);
        console.log('   • Device Memory:', deviceInfo.deviceMemory);
        console.log('   • Max Touch Points:', deviceInfo.maxTouchPoints);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📺 Screen:');
        console.log('   • Resolution:', `${deviceInfo.screen.width}x${deviceInfo.screen.height}`);
        console.log('   • Pixel Ratio:', deviceInfo.screen.pixelRatio);
        console.log('   • Orientation:', deviceInfo.screen.orientation);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🌐 Locale & Language:');
        console.log('   • Language:', deviceInfo.language);
        console.log('   • Languages:', deviceInfo.languages);
        console.log('   • Timezone:', deviceInfo.timezone);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🌍 Network:');
        console.log('   • Online:', deviceInfo.connection.online);
        console.log('   • Effective Type:', deviceInfo.connection.effectiveType);
        console.log('   • Downlink:', deviceInfo.connection.downlink);
        console.log('   • RTT:', deviceInfo.connection.rtt);
        console.log('   • Save Data:', deviceInfo.connection.saveData);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔋 Battery:');
        console.log('   • Battery Info:', deviceInfo.battery);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📍 Location:');
        console.log('   • Location:', deviceInfo.location);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⏰ Timestamp:', deviceInfo.timestamp);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
      } catch (error) {
        console.error('❌ Error collecting device info:', error);
      }
    };

    logDeviceInfo();
  }, []);

  // This component doesn't render anything visible
  return null;
}
