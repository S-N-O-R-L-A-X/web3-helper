import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { trackedProjectsStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';
import type { TrackedProject } from '@extension/storage';

const Popup = () => {
  const projects = useStorage(trackedProjectsStorage) as TrackedProject[];
  const [showModal, setShowModal] = useState(false);
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
    setShowModal(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tracked-projects.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteProject = async (id: string) => {
    await trackedProjectsStorage.set((prev: TrackedProject[]) => prev.filter(p => p.id !== id));
  };

  return (
    <div className={cn('App')}>
      <h2 className="mb-2 text-lg font-bold">正在跟踪的Web3项目</h2>
      <button
        className="mb-4 rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
        onClick={() => setShowModal(true)}>
        添加项目
      </button>
      <button
        className="mb-4 ml-2 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
        onClick={handleExport}>
        导出项目JSON
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded bg-white p-4 shadow-lg dark:bg-gray-800">
            <h3 className="mb-2 text-base font-bold">添加新项目</h3>
            <input
              className="mb-2 w-full rounded border px-2 py-1 text-sm"
              placeholder="项目名称"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
            />
            <select
              className="mb-2 w-full rounded border px-2 py-1 text-sm"
              value={newProjectStatus}
              onChange={e => setNewProjectStatus(e.target.value)}>
              <option value="">请选择项目状态</option>
              <option value="已发放空投">已发放空投</option>
              <option value="已完成任务">已完成任务</option>
              <option value="正进行">正进行</option>
            </select>
            <label className="mb-2 flex items-center gap-2 text-xs">
              <input type="checkbox" checked={needDailyCheckIn} onChange={e => setNeedDailyCheckIn(e.target.checked)} />
              需要每日签到
            </label>
            <div className="flex justify-end gap-2">
              <button
                className="rounded bg-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => setShowModal(false)}>
                取消
              </button>
              <button
                className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                onClick={handleAddProject}>
                提交
              </button>
            </div>
          </div>
        </div>
      )}
      {projects.length === 0 ? (
        <div className="text-gray-500">暂无项目</div>
      ) : (
        <ul className="space-y-2">
          {projects.map(p => (
            <li key={p.id} className="flex flex-col gap-1 rounded bg-white p-2 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{p.status}</span>
                  <button
                    className="ml-1 rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                    title="删除项目"
                    onClick={() => handleDeleteProject(p.id)}>
                    删除
                  </button>
                </div>
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
