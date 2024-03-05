document.addEventListener('DOMContentLoaded', function () {
	const resetButton = document.getElementById('reset-progress');
	const progressBarFill = document.getElementById('progress-bar-fill');
	const progressDisplay = document.getElementById('progress-display');

	resetButton.style.display = 'none';
	progressBarFill.style.display = 'none';
	progressDisplay.textContent = 'This extension is not available on this page.';

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const currentTab = tabs[0];
		if (
			currentTab.url &&
			currentTab.url.includes('https://ffxiv.consolegameswiki.com/wiki/')
		) {
			resetButton.style.display = 'block';
			progressBarFill.style.display = 'block';
			progressDisplay.textContent = '0/0 (0%)'; 

			chrome.tabs.sendMessage(currentTab.id, {
				action: 'requestProgressUpdate',
			});

			resetButton.addEventListener('click', function () {
				chrome.tabs.sendMessage(currentTab.id, { action: 'resetProgress' });
			});

			chrome.runtime.onMessage.addListener(function (
				request,
				sender,
				sendResponse
			) {
				if (request.action === 'updateProgress') {
					const progressText = `${request.progress.checked}/${
						request.progress.total
					} (${request.progress.percentage.toFixed(0)}%)`;
					progressDisplay.textContent = progressText;
					progressBarFill.style.width = `${request.progress.percentage}%`;
				}
			});
		} else {
			progressDisplay.textContent =
				'This extension is only available on the FFXIV wiki pages.';
		}
	});
});
