function drawBorder(pdf) {
	pdf.setDrawColor(0);
	pdf.setLineWidth(1);
	pdf.rect(10, 10, pdf.internal.pageSize.getWidth() - 20, pdf.internal.pageSize.getHeight() - 20);
};

async function prepareImageData(imageData) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = imageData;
		img.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);
			const fixedImageData = canvas.toDataURL("image/jpeg");
			resolve({ fixedImageData, img });
		};
		img.onerror = () => {
			console.error("Fehler beim Laden des Bildes.");
			reject("Fehler beim Laden des Bildes.");
		};
	});
}

function addTextAndImageToPDF(pdf, fixedImageData, img, pageWidth, pageHeight) {
	drawBorder(pdf);
	let boundingBoxTop = 25;
	let boundingBoxHeight = pageHeight - 160;
	let boundingBoxWidth = pageWidth - 40;
	let imgWidth = boundingBoxWidth;
	let imgHeight = (img.height / img.width) * imgWidth;
	if (imgHeight > boundingBoxHeight) {
		imgHeight = boundingBoxHeight;
		imgWidth = (img.width / img.height) * imgHeight;
	}
	let xOffset = (pageWidth - imgWidth) / 2;
	let yOffset = boundingBoxTop + (boundingBoxHeight - imgHeight) / 2;
	pdf.addImage(fixedImageData, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
	yOffset = 200;
	pdf.setFontSize(12);
	if (!pdf.AcroForm) {
		pdf.addJS('this.needAppearances = true;');
		pdf.AcroForm = new pdf.AcroForm();
	}
	const addTextField = (name, x, y, width = 120, height = 10) => {
		const field = new pdf.AcroFormTextField();
		field.fieldName = name;
		field.Rect = [x, y, width, height];
		pdf.addField(field);
	};
	pdf.setTextColor(255, 0, 0);
	pdf.text("Wird erledigt von:", 20, yOffset);
	addTextField("wird_erledigt_von", 80, yOffset - 5, 120);
	yOffset += 15;
	pdf.text("Bis Datum:", 20, yOffset);
	addTextField("bis_datum", 60, yOffset - 5, 100);
	yOffset += 15;
	pdf.text("Weitere Notizen:", 20, yOffset);
	addTextField("weitere_notizen", 20, yOffset + 5, 170, 30);
	yOffset += 40;
	pdf.setTextColor(0, 128, 0);
	pdf.text("Erledigt von:", 20, yOffset);
	addTextField("erledigt_von", 80, yOffset - 5, 120);
	yOffset += 15;
	pdf.text("Erledigt am:", 20, yOffset);
	addTextField("erledigt_am", 70, yOffset - 5, 100);
	pdf.setTextColor(0, 0, 0);
};

async function addImagePage(pdf, imageData) {
	try {
		const { fixedImageData, img } = await prepareImageData(imageData);
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		addTextAndImageToPDF(pdf, fixedImageData, img, pageWidth, pageHeight);
	} catch (error) {
		console.error(error);
	}
}

function addCoverPage(pdf) {
	pdf.setFontSize(20);
	pdf.text("Restaurant To-Do Liste", 105, 40, { align: "center" });
	pdf.setFontSize(14);
	const selectedStore = sessionStorage.getItem("selectedStore") || "Unknown";
	pdf.text("Restaurant - Storenummer:", 20, 60);
	pdf.text(selectedStore, 80, 60);
	const selectedDate = sessionStorage.getItem("selectedDate") || "Unknown Date";
	const userName = sessionStorage.getItem("userName") || "Unknown";
	pdf.text("Datum: " + selectedDate, 20, 70);
	pdf.text("Rundgang gemacht mit: " + userName, 20, 80);
	pdf.setFontSize(14);
	pdf.text("Relevante Themen:", 20, 90);
	const topics = JSON.parse(sessionStorage.getItem("topics")) || [];
	let yOffset = 100;
	pdf.setFontSize(12);
	topics.forEach(topic => {
		pdf.text("• " + topic, 25, yOffset);
		yOffset += 8;
	});
	drawBorder(pdf);
};

function addChecklist(pdf) {
	pdf.setFontSize(14);
	pdf.text("Checkliste:", 20, 20);
	pdf.setFontSize(12);

	const addCheckbox = (name, x, y) => {
		const field = new pdf.AcroFormCheckBox();
		field.fieldName = name;
		field.Rect = [x, y, 10, 10];
		pdf.addField(field);
	};

	const checklistItems = [
		"Test 1", "Test 2", "Test 3", "Test 4", "Test 5",
		"Test 6", "Test 7", "Test 8", "Test 9", "Test 10"
	];

	let yOffset = 30;
	checklistItems.forEach((item, index) => {
		pdf.text(item, 20, yOffset);
		addCheckbox(`yes_${index + 1}`, 100, yOffset - 5);
		pdf.text("Ja", 115, yOffset);
		addCheckbox(`no_${index + 1}`, 140, yOffset - 5);
		pdf.text("Nein", 155, yOffset);
		yOffset += 15;
	});

	drawBorder(pdf);
}

export async function generatePDF(images) {
	if (images.length === 0) {
		alert("Bitte fügen Sie mindestens ein Bild hinzu.");
		return;
	}
	const { jsPDF } = window.jspdf;
	const pdf = new jsPDF();
	addCoverPage(pdf);
	pdf.addPage();
	addChecklist(pdf);
	pdf.addPage();
	for (let i = 0; i < images.length; i++) {
		await addImagePage(pdf, images[i]);
		if (i < images.length - 1) pdf.addPage();
	}
	pdf.save("To_Do_List.pdf");
}
