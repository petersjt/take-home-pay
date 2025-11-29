chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    filingStatus: 'single',
    state: 'other',
    incomeBand: '100k-200k',
    includeFica: true,
    includeMedicare: true,
    includeState: true,
    additionalDeductions: 0
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'profileUpdated') {
    chrome.tabs.query({ status: 'complete' }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'refreshProfile' }).catch(() => {});
        }
      });
    });
    sendResponse({ ok: true });
  }
});
