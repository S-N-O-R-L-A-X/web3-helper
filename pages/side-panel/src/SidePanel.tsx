import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { trackedProjectsStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect, useState } from 'react';
import type { TrackedProject } from '@extension/storage';

async function getBeijingDateStr() {
  try {
    const resp = await fetch('https://worldtimeapi.org/api/timezone/Asia/Shanghai');
    const data = await resp.json();
    const date = new Date(data.datetime);
    if (date.getHours() < 4) {
      date.setDate(date.getDate() - 1);
    }
    return date.toISOString().slice(0, 10);
  } catch {
    const now = new Date();
    now.setHours(now.getHours() + 8 - now.getTimezoneOffset() / 60);
    if (now.getHours() < 4) now.setDate(now.getDate() - 1);
    return now.toISOString().slice(0, 10);
  }
}

const SidePanel = () => {
  const projects = useStorage(trackedProjectsStorage) as TrackedProject[];
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [needDailyCheckIn, setNeedDailyCheckIn] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [beijingDate, setBeijingDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>('ongoing');

  useEffect(() => {
    // 页面可见时立即刷新
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        update();
      }
    };
    const update = async () => {
      const d = await getBeijingDateStr();
      setBeijingDate(prev => (prev !== d ? d : prev));
    };
    update();
    const timer: NodeJS.Timeout = setInterval(update, 60 * 1000);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // 签到/取消签到
  const handleCheckIn = async (id: string, checkedIn: boolean) => {
    if (!beijingDate) return;
    await trackedProjectsStorage.set((prev: TrackedProject[]) =>
      prev.map(p =>
        p.id === id
          ? checkedIn
            ? { ...p, checkedInToday: false }
            : { ...p, checkedInToday: true, lastCheckInDate: beijingDate }
          : p,
      ),
    );
  };

  useEffect(() => {
    if (!projects || projects.length === 0 || !beijingDate) return;
    let cancelled = false;
    (async () => {
      const todayStr = beijingDate;
      let needUpdate = false;
      const updated = projects.map(p => {
        if (p.needDailyCheckIn && p.lastCheckInDate !== todayStr) {
          needUpdate = true;
          return { ...p, checkedInToday: false, lastCheckInDate: todayStr };
        }
        return p;
      });
      if (needUpdate && !cancelled) {
        await trackedProjectsStorage.set(() => updated);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [beijingDate, projects]); // 只依赖 beijingDate，避免 projects 变化导致重复重置

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    if (editId) {
      // 编辑模式
      await trackedProjectsStorage.set((prev: TrackedProject[]) =>
        prev.map(p =>
          p.id === editId
            ? {
                ...p,
                name: newProjectName,
                status: newProjectStatus,
                url: newProjectUrl,
                needDailyCheckIn,
              }
            : p,
        ),
      );
    } else {
      // 新增模式
      const newProject: TrackedProject = {
        id: Date.now().toString(),
        name: newProjectName,
        status: newProjectStatus,
        url: newProjectUrl,
        needDailyCheckIn,
        checkedInToday: false,
      };
      await trackedProjectsStorage.set((prev: TrackedProject[]) => [...prev, newProject]);
    }
    setNewProjectName('');
    setNewProjectStatus('');
    setNewProjectUrl('');
    setNeedDailyCheckIn(false);
    setShowModal(false);
    setEditId(null);
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

  // Tab 分类
  const ongoingProjects = projects.filter(p => p.status !== '已结束');
  const endedProjects = projects.filter(p => p.status === '已结束');

  return (
    <div className={cn('App')}>
      <h2 className="mb-2 text-lg font-bold">正在跟踪的Web3项目</h2>
      <div className="mb-2 flex justify-end gap-2">
        <button
          className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
          onClick={() => setShowModal(true)}>
          添加项目
        </button>
        <button className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600" onClick={handleExport}>
          导出项目JSON
        </button>
      </div>
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex" role="tablist">
          <button
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-xs font-semibold',
              activeTab === 'ongoing'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400',
            )}
            role="tab"
            aria-selected={activeTab === 'ongoing'}
            onClick={() => setActiveTab('ongoing')}>
            当前进行中
          </button>
          <button
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-xs font-semibold',
              activeTab === 'ended'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400',
            )}
            role="tab"
            aria-selected={activeTab === 'ended'}
            onClick={() => setActiveTab('ended')}>
            已结束
          </button>
        </nav>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded bg-white p-4 shadow-lg dark:bg-gray-800">
            <h3 className="mb-2 text-base font-bold">{editId ? '编辑项目' : '添加新项目'}</h3>
            <input
              className="mb-2 w-full rounded border px-2 py-1 text-sm"
              placeholder="项目名称"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
            />
            <input
              className="mb-2 w-full rounded border px-2 py-1 text-sm"
              placeholder="项目链接（可选，需带 http(s)://）"
              value={newProjectUrl}
              onChange={e => setNewProjectUrl(e.target.value)}
            />
            <select
              className="mb-2 w-full rounded border px-2 py-1 text-sm"
              value={newProjectStatus}
              onChange={e => setNewProjectStatus(e.target.value)}>
              <option value="">请选择项目状态</option>
              <option value="正进行">正进行</option>
              <option value="已完成任务等待空投">已完成任务等待空投</option>
              <option value="已发放一期空投">已发放空投继续任务</option>
              <option value="已结束">已结束</option>
            </select>
            <label className="mb-2 flex items-center gap-2 text-xs">
              <input type="checkbox" checked={needDailyCheckIn} onChange={e => setNeedDailyCheckIn(e.target.checked)} />
              需要每日签到
            </label>
            <div className="flex justify-end gap-2">
              <button
                className="rounded bg-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setShowModal(false);
                  setEditId(null);
                }}>
                取消
              </button>
              <button
                className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                onClick={handleAddProject}>
                {editId ? '保存' : '提交'}
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'ongoing' ? (
        ongoingProjects.length === 0 ? (
          <div className="text-gray-500">暂无进行中的项目</div>
        ) : (
          <ul className="space-y-2">
            {ongoingProjects.map(p => (
              <li key={p.id} className="flex flex-col gap-1 rounded bg-white p-2 dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  {p.url ? (
                    <a
                      className="font-medium text-blue-600 hover:underline"
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer">
                      {p.name}
                    </a>
                  ) : (
                    <span className="font-medium">{p.name}</span>
                  )}
                  <div className="flex items-center gap-2">
                    {/* 状态下拉框，可编辑 */}
                    <select
                      className="rounded border bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800"
                      value={p.status}
                      onChange={async e => {
                        const newStatus = e.target.value;
                        await trackedProjectsStorage.set((prev: TrackedProject[]) =>
                          prev.map(item => (item.id === p.id ? { ...item, status: newStatus } : item)),
                        );
                      }}>
                      <option value="正进行">正进行</option>
                      <option value="已完成任务等待空投">已完成任务等待空投</option>
                      <option value="已发放一期空投">已发放空投继续任务</option>
                      <option value="已结束">已结束</option>
                    </select>
                    <button
                      className="ml-1 rounded bg-yellow-500 px-2 py-0.5 text-xs text-white hover:bg-yellow-600"
                      title="编辑项目"
                      onClick={() => {
                        setEditId(p.id);
                        setShowModal(true);
                        setNewProjectName(p.name);
                        setNewProjectStatus(p.status);
                        setNewProjectUrl(p.url || '');
                        setNeedDailyCheckIn(!!p.needDailyCheckIn);
                      }}>
                      编辑
                    </button>
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
                      <button
                        className="rounded bg-gray-300 px-2 py-1 text-xs text-green-600 hover:bg-gray-400 dark:bg-gray-700 dark:text-green-400 dark:hover:bg-gray-600"
                        onClick={() => handleCheckIn(p.id, true)}>
                        已签到（点击取消）
                      </button>
                    ) : (
                      <button
                        className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                        onClick={() => handleCheckIn(p.id, false)}>
                        签到
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      ) : endedProjects.length === 0 ? (
        <div className="text-gray-500">暂无已结束的项目</div>
      ) : (
        <ul className="space-y-2">
          {endedProjects.map(p => (
            <li key={p.id} className="flex flex-col gap-1 rounded bg-white p-2 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                {p.url ? (
                  <a
                    className="font-medium text-blue-600 hover:underline"
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer">
                    {p.name}
                  </a>
                ) : (
                  <span className="font-medium">{p.name}</span>
                )}
                <div className="flex items-center gap-2">
                  {/* 状态下拉框，可编辑 */}
                  <select
                    className="rounded border bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800"
                    value={p.status}
                    onChange={async e => {
                      const newStatus = e.target.value;
                      await trackedProjectsStorage.set((prev: TrackedProject[]) =>
                        prev.map(item => (item.id === p.id ? { ...item, status: newStatus } : item)),
                      );
                    }}>
                    <option value="正进行">正进行</option>
                    <option value="已完成任务等待空投">已完成任务等待空投</option>
                    <option value="已发放一期空投">已发放空投继续任务</option>
                    <option value="已结束">已结束</option>
                  </select>
                  <button
                    className="ml-1 rounded bg-yellow-500 px-2 py-0.5 text-xs text-white hover:bg-yellow-600"
                    title="编辑项目"
                    onClick={() => {
                      setEditId(p.id);
                      setShowModal(true);
                      setNewProjectName(p.name);
                      setNewProjectStatus(p.status);
                      setNewProjectUrl(p.url || '');
                      setNeedDailyCheckIn(!!p.needDailyCheckIn);
                    }}>
                    编辑
                  </button>
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
                    <button
                      className="rounded bg-gray-300 px-2 py-1 text-xs text-green-600 hover:bg-gray-400 dark:bg-gray-700 dark:text-green-400 dark:hover:bg-gray-600"
                      onClick={() => handleCheckIn(p.id, true)}>
                      已签到（点击取消）
                    </button>
                  ) : (
                    <button
                      className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      onClick={() => handleCheckIn(p.id, false)}>
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

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
