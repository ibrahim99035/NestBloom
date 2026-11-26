import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nestbloom',
  appName: 'نِست بلوم',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    url: 'https://nestbloom.vercel.app',
    cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath: '',
      keystorePassword: '',
      keyAlias: '',
      keyPassword: '',
    },
  },
};

export default config;
