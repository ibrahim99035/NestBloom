import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nestbloom',
  appName: 'نِست بلوم',
  server: {
    url: 'https://nest-bloom.vercel.app',
    cleartext: false,
  },
  webDir: 'www',
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
