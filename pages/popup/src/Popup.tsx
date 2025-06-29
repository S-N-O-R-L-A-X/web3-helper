import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { trackedProjectsStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import type { TrackedProject } from '@extension/storage';

const Popup = () => {
  const projects = useStorage(trackedProjectsStorage) as TrackedProject[];

  const handleCheckIn = async (id: string) => {
    await trackedProjectsStorage.checkIn(id);
  };

  return (
    <div className={cn('App')}>
      <h2 className="mb-2 text-lg font-bold">正在跟踪的Web3项目</h2>
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
