document.addEventListener('DOMContentLoaded', function () {
	const resetButton = document.getElementById('reset-progress');
	const progressDisplay = document.getElementById('progress-display');

	function updateProgressDisplay() {
		chrome.storage.local.get(
			['totalImages', 'checkedImages'],
			function (result) {
				const total = result.totalImages || 0;
				const checked = result.checkedImages || 0;
				const percentage = total > 0 ? (checked / total) * 100 : 0;
				progressDisplay.textContent = `${checked}/${total}`;
				document.getElementById(
					'progress-bar-fill'
				).style.width = `${percentage}%`;
			}
		);
	}

	updateProgressDisplay();

	resetButton.addEventListener('click', function () {
		chrome.storage.local.set({ checkedImages: 0 }, function () {
			updateProgressDisplay();
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action: 'resetProgress' });
			});
		});
	});
});
