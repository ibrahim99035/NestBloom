import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nestbloom',
  appName: 'نِست بلوم',
  server: {
    url: 'https://nestbloom.vercel.app',
    cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath: '',
      keystorePassword: '',
      keystoreAlias: '',
      keystoreAliasPassword: '',
    },
  },
};

export default config;
