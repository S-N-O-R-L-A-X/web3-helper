import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //   if (message.action === "sendChatResponse") {
    //     console.log("test")
    //   }
    //   return true; // Indicates we want to send a response asynchronously
    // })
  }, []);
  return <div className="ceb-example-runtime-content-view-text">Example runtime content view</div>;
}
