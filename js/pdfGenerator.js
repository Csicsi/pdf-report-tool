export async function generatePDF(images) {
	if (images.length === 0) {
		alert("Bitte fügen Sie mindestens ein Bild hinzu.");
		return;
	}

	const { jsPDF } = window.jspdf;
	const pdf = new jsPDF();

	const drawBorder = (pdf) => {
		pdf.setDrawColor(0);
		pdf.setLineWidth(1);
		pdf.rect(10, 10, pdf.internal.pageSize.getWidth() - 20, pdf.internal.pageSize.getHeight() - 20);
	};

	const addCoverPage = (pdf) => {
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

	const addImagePage = async (pdf, imageData) => {
		const img = new Image();
		img.src = imageData;

		await new Promise((resolve) => {
			img.onload = () => {
				drawBorder(pdf);

				const pageWidth = pdf.internal.pageSize.getWidth();
				const pageHeight = pdf.internal.pageSize.getHeight();

				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");

				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0, img.width, img.height);

				const fixedImageData = canvas.toDataURL("image/jpeg");

				let imgWidth = pageWidth - 40;
				let imgHeight = (img.height / img.width) * imgWidth;

				if (imgHeight > pageHeight - 150) {
					imgHeight = pageHeight - 150;
					imgWidth = (img.width / img.height) * imgHeight;
				}

				pdf.addImage(fixedImageData, "JPEG", 20, 25, imgWidth, imgHeight);

				let yOffset = 25 + imgHeight + 15;

				pdf.setFontSize(12);
				pdf.text("Wird erledigt von: _______________________", 20, yOffset);
				yOffset += 8;
				pdf.text("Bis Datum: _____________________________", 20, yOffset);
				yOffset += 8;
				pdf.text("Weitere Notizen:", 20, yOffset);
				yOffset += 8;
				pdf.text("________________________________________________", 20, yOffset);
				yOffset += 15;
				pdf.text("Erledigt von: ____________________________", 20, yOffset);
				yOffset += 8;
				pdf.text("Erledigt am: _____________________________", 20, yOffset);
				yOffset += 8;
				pdf.text("Unterschrift: ____________________________", 20, yOffset);

				resolve();
			};
		});
	};

	addCoverPage(pdf);
	pdf.addPage();

	for (let i = 0; i < images.length; i++) {
		await addImagePage(pdf, images[i]);
		if (i < images.length - 1) pdf.addPage();
	}

	pdf.save("To_Do_List.pdf");
}
