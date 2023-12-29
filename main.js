import { loadPdf, loadPdfToGallery } from './pdfLoader.js';



$(document).ready(function () {
	console.log("Ready");

	let $container = $('.magazine-container');
	let $authorsContainer = $('#authors-wrapper');

	createAuthorsLayout(magazines, $container);

	$('.year').click(function () {
		var year = parseInt($(this).data('year'));
		console.log('Year: ' + year);
		$('.year').removeClass('selected-item');
		// Add 'selected-year' class to the clicked div
		$(this).addClass('selected-item');
		$('.autors-link').removeClass('selected-item');

		const filtered = magazines.filter(m => m.year === year);

		generateMagazinesLayout(filtered, $container);

		$container.show();
		$authorsContainer.hide();

	});

	$('.autors-link').click(function () {
		console.log("Select authors");
		$('.year').removeClass('selected-item');
		$(this).addClass('selected-item');

		$container.hide();
		$authorsContainer.show();


	});

	$('.year:first').click();

	$container.on('click', '.left', function (e) {

		var magazineId = $(this).closest('.m-block').attr('id');
		console.log('click ' + magazineId);
		var magazine = magazines.find(m => m.id === parseInt(magazineId));

		if (!magazine) {
			console.error('Magazine not found');
			return;
		}

		var currentPage = magazine.currentPage ? magazine.currentPage : 0;
		currentPage = (currentPage === 0) ? magazine.pages - 1 : currentPage - 1;

		magazine.currentPage = currentPage;

		var img = magazine.previews[currentPage];

		if (!img) {
			console.error("No preview found");
			console.log(magazine);
		} else {
			var $elem = $(this).closest('.m-block').find("#preview-" + magazineId);
			if ($elem.children().length === 0) {
				$elem.append(`<img src="${img}"></img>`);
			} else {
				$elem.find('img').attr('src', img);
			}
		}
	});

	$container.on('click', '.right', function (e) {

		var magazineId = $(this).closest('.m-block').attr('id');
		console.log('click ' + magazineId);
		var magazine = magazines.find(m => m.id === parseInt(magazineId));

		if (!magazine) {
			console.error('Magazine not found');
			return;
		}

		var currentPage = magazine.currentPage ? magazine.currentPage : 0;
		currentPage = (currentPage === magazine.pages - 1) ? 0 : currentPage + 1;

		magazine.currentPage = currentPage;

		var img = magazine.previews[currentPage];

		if (!img) {
			console.error("No preview found");
			console.log(magazine);
		} else {
			var $elem = $(this).closest('.m-block').find("#preview-" + magazineId);
			if ($elem.children().length === 0) {
				$elem.append(`<img src="${img}"></img>`);
			} else {
				$elem.find('img').attr('src', img);
			}
		}
	})

	const $dynamicGallery = document.getElementById('gallery');
	const dynamicGallery = lightGallery($dynamicGallery, {
		dynamic: true,
		scale: 1,
		// showZoomInOutIcons: true,
		zoomOnMaxOnly: true,
		infiniteZoom: false,
		plugins: [lgZoom],
		dynamicEl: [

		],
	});

	$container.on('click', '.cover-wrapper', function (e) {
		var magazineId = $(this).closest('.m-block').attr('id');
		console.log('Show gallary ' + magazineId);

		$('#preloader').show();

		loadPdfToGallery(parseInt(magazineId)).then(imgs => {
			console.log(imgs);
			$('#preloader').hide();
			dynamicGallery.refresh(imgs);
			dynamicGallery.openGallery();

		});
	});


});

function generateMagazinesLayout(magazines, $container) {

	$container.empty();

	magazines.forEach(m => {
		let block = generateMagazineBlock(m);
		var $block = $container.append(block);

		var $elem = $block.find(`#preview-${m.id}`);

		loadPdf(m, img => {
			$elem.empty();
			$elem.append(`<img src="${img}"></img>`);
		});
	});
}


function createAuthorsLayout(magazines, $container) {
	let authorMap = new Map();

	magazines.forEach(magazine => {
		magazine.authors.forEach(author => {
			let firstLetter = author[0].toUpperCase();
			if (!authorMap.has(firstLetter)) {
				authorMap.set(firstLetter, new Set());
			}
			authorMap.get(firstLetter).add(author);
		});
	});

	// Convert Sets to arrays, sort the map by keys (letters) and the author arrays
	let sortedAuthorMap = new Map([...authorMap.entries()].sort().map(([key, authorsSet]) => [key, [...authorsSet].sort()]));

	console.log(sortedAuthorMap);

	let authorsLayout = generateAuthors(sortedAuthorMap);

	const $authors = $("#authors");

	$authors.append(authorsLayout);

	$authors.on('click', '.author-item:not(.author-letter)', function () {
		var name = $(this).text();
		console.log(name);

		const filtered = getMagazinesByAuthor(name);

		generateMagazinesLayout(filtered, $container);

		$container.show();
		$('#authors-wrapper').hide();

		// Additional code to handle the click event
		// For example, you can use 'name' here as needed
	});
}


function getMagazinesByAuthor(authorName) {
	return magazines.filter(magazine => magazine.authors.includes(authorName));
}

function generateMagazineBlock(magazine) {
	let block = `
            <div class="m-block" id="${magazine.id}">
                <div class="div-6">
                    <div class="div-wrapper-5">
                        <div class="m-year">${magazine.year}</div>
                    </div>
                    <div class="div-7">
                        <div class="text-wrapper-3 m-number">#${magazine.month}/${magazine.id}</div>
                        <p class="text-wrapper-3 m-date">${magazine.displayData}</p>
                    </div>
                </div>
                <div class="div-wrapper-6">
                    <div class="text-wrapper-4 m-title">${magazine.title.toUpperCase()}</div>
                </div>
                <div class="cover-wrapper" id="preview-${magazine.id}"></canvas></div>
                <div class="div-8">
                    <div class="arrows-box">
                        <img class="layer left" src="img/layer-1-1.svg" /> <img class="layer right" src="img/layer-1-1-1.svg" />
                    </div>
                    <div class="div-wrapper-7">
                        <div class="text-wrapper-5 pdf-link"><a href="static/numbers/${magazine.id}.pdf">смотреть pdf-версию</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

	return block;
}

function generateAuthors(authorsMap) {

	var result = "";

	authorsMap.forEach((v, k) => {
		result = result + `<div class='author-container'><div class="author-item author-letter">${k}</div>`
		v.forEach(n => {
			result = result + `<div class="author-item author-name">${n}</div>`
		})
		result = result + "</div>";
	})

	return result;

}