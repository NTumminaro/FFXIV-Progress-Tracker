chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.set({ extensionEnabled: true });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (
		request.action === 'toggleExtension' ||
		request.action === 'resetProgress'
	) {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, request);
		});
	}
});
