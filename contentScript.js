const tables = document.querySelectorAll('.mech1.sortable.table');

let progressTracker = {
	totalCheckboxes: 0,
	checkedCheckboxes: 0,
};

function updateProgress() {
	const { totalCheckboxes, checkedCheckboxes } = progressTracker;
	const progress = {
		total: totalCheckboxes,
		checked: checkedCheckboxes,
		percentage: totalCheckboxes
			? (checkedCheckboxes / totalCheckboxes) * 100
			: 0,
	};

	chrome.runtime.sendMessage({ action: 'updateProgress', progress: progress });
}

tables.forEach((table, tableIndex) => {
	const headerRow = table.querySelector('tr');
	if (headerRow) {
		const th = document.createElement('th');
		headerRow.prepend(th); 
	}

	table.querySelectorAll('tr').forEach((row, rowIndex) => {
		if (rowIndex === 0) return;

		const checkboxCell = document.createElement('td');
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.style.transform = 'scale(1.5)';
		checkbox.style.marginRight = '10px';
		checkbox.style.verticalAlign = 'middle';

		const storageKey = `table${tableIndex}-row${rowIndex}`;
		chrome.storage.local.get([storageKey], (result) => {
			if (result[storageKey]) {
				checkbox.checked = true;
				updateRowStyle(row, true);
				progressTracker.checkedCheckboxes++;
			}
			progressTracker.totalCheckboxes++;
			updateProgress();
		});

		checkbox.addEventListener('change', (e) => {
			const isChecked = e.target.checked;
			updateRowStyle(row, isChecked);
			chrome.storage.local.set({ [storageKey]: isChecked }, () => {
				isChecked
					? progressTracker.checkedCheckboxes++
					: progressTracker.checkedCheckboxes--;
				updateProgress(); 
			});
		});

		checkboxCell.appendChild(checkbox);
		row.prepend(checkboxCell);
	});
});

function updateRowStyle(row, isChecked) {
	row.style.opacity = isChecked ? '0.5' : '1';
	row
		.querySelectorAll('td')
		.forEach(
			(cell) =>
				(cell.style.textDecoration = isChecked ? 'line-through' : 'none')
		);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'requestProgressUpdate') {
		updateProgress();
	} else if (request.action === 'resetProgress') {
		progressTracker.totalCheckboxes = 0;
		progressTracker.checkedCheckboxes = 0;
		tables.forEach((table, tableIndex) => {
			table
				.querySelectorAll('input[type="checkbox"]')
				.forEach((checkbox, rowIndex) => {
					checkbox.checked = false;
					const storageKey = `table${tableIndex}-row${rowIndex}`;
					chrome.storage.local.set({ [storageKey]: false });
					updateRowStyle(checkbox.closest('tr'), false);
				});
		});
		updateProgress();
	}
});
