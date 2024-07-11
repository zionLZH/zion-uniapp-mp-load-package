import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { zionUniMpLoadPackagePlugin } from './script/zionUniMpLoadPackagePlugin/vite'

export default defineConfig({
  plugins: [
    uni(),
    zionUniMpLoadPackagePlugin()
  ],
});
