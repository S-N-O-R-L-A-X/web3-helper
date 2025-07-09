import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log('[CEB] Content ui all loaded');
  }, []);

  return <div className="flex items-center justify-between gap-2 rounded bg-blue-100 px-2 py-1"></div>;
}
