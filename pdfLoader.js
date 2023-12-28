var { pdfjsLib } = globalThis;

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.mjs';


export async function loadPdf(model, callback) {

	if (!model.previews) {

		var url = `static/numbers/${model.id}.pdf`;

		var pdf = await pdfjsLib.getDocument(url).promise;
		console.log("loaded: " + model.id + ", pages: " + pdf.numPages);

		var totalPages = pdf.numPages;

		model.previews = [];
		model.pages = totalPages;

		for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
			var page = await pdf.getPage(pageNum);

			var viewport = page.getViewport({ scale: 1 });

			var height = viewport.height;
			var scale = 500 / height;

			viewport = page.getViewport({ scale: scale });

			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			await page.render({ canvasContext: context, viewport: viewport }).promise;

			var base64Image = canvas.toDataURL('image/jpeg'); // Convert canvas to JPEG Base64
			model.previews.push(base64Image);

			console.log(model);

			if (pageNum == 1) {
				callback(base64Image);
			}
			// Clean up the canvas to free memory
			context.clearRect(0, 0, canvas.width, canvas.height);
			canvas = null;
		}
	} else {
		callback(model.previews[0]);
	}

	console.log("Done!");

}

export async function loadPdfToGallery(id) {
	var url = `static/numbers/${id}.pdf`;


	var pdf = await pdfjsLib.getDocument(url).promise;

	var totalPages = pdf.numPages;

	var result = [];

	for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
		var page = await pdf.getPage(pageNum);

		var viewport = page.getViewport({ scale: 2 });

		var width = viewport.width;
		console.log(width);

		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		await page.render({ canvasContext: context, viewport: viewport }).promise;

		var base64Image = canvas.toDataURL('image/jpeg'); // Convert canvas to JPEG Base64

		result.push({ src: base64Image, width: width });
		//result.push({ src: "static/2.jpg" });

		// Clean up the canvas to free memory
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas = null;
	}

	return result;

}

