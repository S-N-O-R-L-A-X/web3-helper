
// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "inputContent") {
    try {
      const content = message.content;
      const editor = document.querySelector('[data-slate-editor="true"]');

      if (!editor) {
        throw new Error("Editor element not found");
      }

      // 确保编辑器获得焦点
      editor.focus();

      // 模拟用户输入前的准备动作
      editor.dispatchEvent(new Event('focusin', { bubbles: true }));
      editor.dispatchEvent(new Event('keydown', { bubbles: true }));

      // 使用 document.execCommand 插入内容
      document.execCommand('insertText', false, content);

      // 模拟完整的输入事件序列
      const events = [
        new Event('input', { bubbles: true }),
        new Event('keyup', { bubbles: true }),
        new Event('change', { bubbles: true })
      ];

      events.forEach(event => editor.dispatchEvent(event));

      // 如果上述方法失败，尝试直接设置内容
      if (!editor.textContent.includes(content)) {
        editor.textContent = content;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }

      sendResponse({ 
        success: true, 
        message: "Content has been successfully input"
      });
    } catch (error) {
      console.error("Error inputting content:", error);
      sendResponse({ 
        success: false, 
        message: `Failed to input content: ${error.message}`
      });
    }
    return true;
  }
});
