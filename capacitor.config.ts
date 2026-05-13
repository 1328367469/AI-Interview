import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexusai.app',
  appName: 'Nexus AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
