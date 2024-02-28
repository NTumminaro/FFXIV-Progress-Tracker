function toggleCompletion(img, index) {
	const imgName = img.src.split('/').pop();
	const stateKey = `item-${imgName}-${index}`;
	const row = img.closest('tr');
	const completed = localStorage.getItem(stateKey) === 'true';

	if (completed) {
		row.style.opacity = '1';
		row.style.textDecoration = 'none';
		localStorage.setItem(stateKey, false);
	} else {
		row.style.opacity = '0.5';
		row.style.textDecoration = 'line-through';
		localStorage.setItem(stateKey, true);
	}
	updateCounts();
}

function initializeRowState(img, index) {
	const imgName = img.src.split('/').pop();
	const stateKey = `item-${imgName}-${index}`;
	const completed = localStorage.getItem(stateKey) === 'true';
	const row = img.closest('tr');

	row.style.opacity = completed ? '0.5' : '1';
	row.style.textDecoration = completed ? 'line-through' : 'none';
}

document.querySelectorAll('table tr img').forEach((img, index) => {
	if (!img.closest('a')) {
		const wrapper = document.createElement('a');
		wrapper.href = '#';
		wrapper.style.cursor = 'pointer';
		img.before(wrapper);
		wrapper.append(img);
	}

	img.style.width = '46px';
	img.style.height = '46px';

	img
		.closest('a')
		.setAttribute('aria-label', `Mark item ${index + 1} as completed`);
	img.style.transition = 'transform 0.2s';
	img.closest('a').onmouseover = () => (img.style.transform = 'scale(1.1)');
	img.closest('a').onmouseout = () => (img.style.transform = 'scale(1)');

	img.closest('a').onclick = (e) => {
		e.preventDefault();
		toggleCompletion(img, index);
	};

	initializeRowState(img, index);

	const cell = img.closest('td');
	if (
		cell.getAttribute('width') === '5%' ||
		cell.getAttribute('width') === '95%'
	) {
		cell.removeAttribute('width');
	}
});

document.querySelectorAll('table tr td').forEach((cell) => {
	if (cell.querySelector('img')) {
		cell.style.display = 'flex';
		cell.style.justifyContent = 'center';
		cell.style.alignItems = 'center';
	}
});

document.querySelectorAll('table').forEach((table) => {
	table.style.borderCollapse = 'separate';
	table.style.borderSpacing = '0 5px';
});

document.querySelectorAll('table tr').forEach((row, rowIndex) => {
	if (row.querySelector('img') && rowIndex !== 0) {
		row.style.borderBottom = '5px solid transparent';

		row.querySelectorAll('td').forEach((cell) => {
			cell.style.border = '1px solid #969696';
			cell.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
			cell.style.padding = '5px';
			cell.style.borderRadius = '4px';
		});
	}
});

function updateCounts() {
	const items = document.querySelectorAll('table tr img');
	const totalImages = items.length;
	let checkedImages = [...items].reduce((count, img, index) => {
		const imgName = img.src.split('/').pop();
		const stateKey = `item-${imgName}-${index}`;
		return count + (localStorage.getItem(stateKey) === 'true' ? 1 : 0);
	}, 0);

	chrome.storage.local.set({ totalImages, checkedImages });
}

updateCounts();

function adjustColorStyles() {
	document.querySelectorAll('*').forEach((element) => {
		if (element.style.color === 'black') {
			element.style.color = 'white';
		}
		if (element.getAttribute('color') === 'black') {
			element.setAttribute('color', 'white');
		}
	});
}

adjustColorStyles();

const styleAdjustments = [
	{ selector: '.wiki.main', styles: { width: '100%' } },
	{ selector: '.sidebar', styles: { display: 'none' } },
	{
		selector: '.navbox, .navbox-title, .navbox-group, .navbox-even',
		styles: { backgroundColor: 'rgb(32, 33, 36)' },
	},
	{ selector: 'h1', styles: { color: 'white' } },
	{ selector: '.video', styles: { display: 'none' } },
	{
		selector: '.content, .container, .nav-page-actions',
		styles: { backgroundColor: 'rgb(32, 33, 36)', color: 'white' },
		adjustLinks: true,
	},
	{ selector: '.container', styles: { paddingTop: '0' } },
];

styleAdjustments.forEach(({ selector, styles, adjustLinks }) => {
	document.querySelectorAll(selector).forEach((element) => {
		Object.assign(element.style, styles);
		if (adjustLinks) {
			element
				.querySelectorAll('a')
				.forEach((link) => (link.style.color = '#4d90fe'));
		}
	});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'resetProgress') {
		document.querySelectorAll('table tr img').forEach((img, index) => {
			const imgName = img.src.split('/').pop();
			const stateKey = `item-${imgName}-${index}`;
			localStorage.setItem(stateKey, false);
			img.closest('tr').style.opacity = '1';
			img.closest('tr').style.textDecoration = 'none';
		});
		updateCounts();
	}
});
