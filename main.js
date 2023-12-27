import { loadPdf } from './pdfLoader.js';


$(document).ready(function () {
	console.log("Ready");

	let $container = $('.magazine-container');

	$('.year').click(function () {
		var year = parseInt($(this).data('year'));
		console.log('Year: ' + year);
		$('.year').removeClass('selected-year');
		// Add 'selected-year' class to the clicked div
		$(this).addClass('selected-year');

		$container.empty();

		magazines.forEach(m => {
			if (m.year === year) {
				let block = generateMagazineBlock(m);
				var $block = $container.append(block);

				var $elem = $block.find(`#preview-${m.id}`);

				loadPdf(m, img => {
					$elem.empty();
					$elem.append(`<img src="${img}"></img>`);
				});
			}
		})

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

});

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