import { createStorage, StorageEnum } from '../base/index.js';

const storage = createStorage<TrackedProject[]>('tracked-projects-storage-key', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const trackedProjectsStorage = {
  ...storage,
  checkIn: async (id: string) => {
    await storage.set(projects => projects.map(p => (p.id === id ? { ...p, checkedInToday: true } : p)));
  },
  resetDailyCheckIn: async () => {
    await storage.set(projects => projects.map(p => (p.needDailyCheckIn ? { ...p, checkedInToday: false } : p)));
  },
};

export interface TrackedProject {
  id: string;
  name: string;
  status: string;
  url?: string;
  needDailyCheckIn: boolean;
  checkedInToday: boolean;
  lastCheckInDate?: string; // 新增：记录上次签到日期（东八区）
}
