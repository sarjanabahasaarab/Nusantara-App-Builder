/**
 * Nusantara App Builder - Environment Store
 * Tracks real availability of Android SDK, JDK, and Gradle.
 */

import { create } from 'zustand';
import { EnvironmentStatus } from '../types/settings';
import { NativeBridge } from '../modules/filesystem/nativeBridge';
import { useSettingsStore } from './settingsStore';

interface EnvState {
  status: EnvironmentStatus;
  isChecking: boolean;
  checkEnvironment: () => Promise<void>;
}

const initialStatus: EnvironmentStatus = {
  isChecking: false,
  lastChecked: null,
  overallReady: false,
  components: {
    androidSdk: {
      name: 'Android SDK (API 34)',
      configuredPath: '',
      isAvailable: false,
      error: 'Belum dipindai',
    },
    jdk: {
      name: 'Java Development Kit (JDK 17/21)',
      configuredPath: '',
      isAvailable: false,
      error: 'Belum dipindai',
    },
    gradle: {
      name: 'Gradle Build Tool',
      configuredPath: 'Embedded Gradle Wrapper 8.5',
      isAvailable: true,
      version: '8.5',
    },
  },
};

export const useEnvStore = create<EnvState>((set) => ({
  status: initialStatus,
  isChecking: false,

  checkEnvironment: async () => {
    set({ isChecking: true });
    const toolchain = useSettingsStore.getState().settings.toolchain;

    try {
      const res = await NativeBridge.checkEnvironment({
        androidSdkPath: toolchain.androidSdkPath,
        jdkPath: toolchain.jdkPath,
        gradlePath: toolchain.gradlePath,
      });
      set({ status: res, isChecking: false });
    } catch {
      set({ isChecking: false });
    }
  },
}));
