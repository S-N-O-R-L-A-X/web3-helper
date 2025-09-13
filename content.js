
// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "inputContent") {
    alert("Received")
    const content = message.content;
    const input = document.querySelector("[role='textbox']");

    
    if (input) {
      // 使用原生的input事件模拟用户输入
      input.value = content;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      // 如果需要，也可以模拟focus事件
      input.focus();
    }

    sendResponse({ success: true, message: "Content has been input" });
    return true;
  }
});
