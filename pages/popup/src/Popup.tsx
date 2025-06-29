import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { trackedProjectsStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';
import type { TrackedProject } from '@extension/storage';

const Popup = () => {
  const projects = useStorage(trackedProjectsStorage) as TrackedProject[];
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState('');
  const [needDailyCheckIn, setNeedDailyCheckIn] = useState(false);

  const handleCheckIn = async (id: string) => {
    await trackedProjectsStorage.checkIn(id);
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    const newProject: TrackedProject = {
      id: Date.now().toString(),
      name: newProjectName,
      status: newProjectStatus,
      needDailyCheckIn,
      checkedInToday: false,
    };
    await trackedProjectsStorage.set((prev: TrackedProject[]) => [...prev, newProject]);
    setNewProjectName('');
    setNewProjectStatus('');
    setNeedDailyCheckIn(false);
  };

  return (
    <div className={cn('App')}>
      <h2 className="mb-2 text-lg font-bold">正在跟踪的Web3项目</h2>
      <div className="mb-4 flex flex-col gap-2 rounded bg-gray-100 p-2 dark:bg-gray-800">
        <input
          className="rounded border px-2 py-1 text-sm"
          placeholder="项目名称"
          value={newProjectName}
          onChange={e => setNewProjectName(e.target.value)}
        />
        <input
          className="rounded border px-2 py-1 text-sm"
          placeholder="项目状态（可选）"
          value={newProjectStatus}
          onChange={e => setNewProjectStatus(e.target.value)}
        />
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={needDailyCheckIn} onChange={e => setNeedDailyCheckIn(e.target.checked)} />
          需要每日签到
        </label>
        <button
          className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
          onClick={handleAddProject}>
          添加项目
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="text-gray-500">暂无项目</div>
      ) : (
        <ul className="space-y-2">
          {projects.map(p => (
            <li key={p.id} className="flex flex-col gap-1 rounded bg-white p-2 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-gray-400">{p.status}</span>
              </div>
              {p.needDailyCheckIn && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs">每日签到：</span>
                  {p.checkedInToday ? (
                    <span className="text-green-500">已签到</span>
                  ) : (
                    <button
                      className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      onClick={() => handleCheckIn(p.id)}>
                      签到
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
