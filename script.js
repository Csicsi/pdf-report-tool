const fileInput = document.getElementById("file-input");
const imagePreview = document.getElementById("image-preview");
let images = [];

fileInput.addEventListener("change", (event) => {
	handleFiles(event.target.files);
});

function handleFiles(files) {
	for (let file of files) {
		if (file.type.startsWith("image/")) {
			addImage(file);
		} else {
			alert("Only image files are allowed!");
		}
	}
}

function addImage(file) {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = (e) => {
		const imageData = e.target.result;

		if (images.includes(imageData)) return;

		images.push(imageData);

		const container = document.createElement("div");
		container.classList.add("image-container");

		const img = document.createElement("img");
		img.src = imageData;
		img.classList.add("image-thumbnail");

		const removeBtn = document.createElement("button");
		removeBtn.innerHTML = "x";
		removeBtn.classList.add("remove-button");
		removeBtn.onclick = () => {
			imagePreview.removeChild(container);
			images = images.filter((img) => img !== imageData);
		};

		container.appendChild(img);
		container.appendChild(removeBtn);
		imagePreview.appendChild(container);
	};
}

document.getElementById("generate-pdf").addEventListener("click", async () => {
	if (images.length === 0) {
		alert("Please add at least one image.");
		return;
	}

	const { jsPDF } = window.jspdf;
	const pdf = new jsPDF();

	// Function to Draw the Rahmen (Border)
	function drawBorder(pdf) {
		pdf.setDrawColor(0); // Black color
		pdf.setLineWidth(1);
		pdf.rect(10, 10, pdf.internal.pageSize.getWidth() - 20, pdf.internal.pageSize.getHeight() - 20);
	}

	// Cover Page
	pdf.setFontSize(20);
	pdf.text("Restaurant To-Do Liste", 105, 40, { align: "center" });

	pdf.setFontSize(14);
	pdf.text("Restaurant - Storenummer:", 20, 60);
	pdf.text("180", 80, 60);

	pdf.text("Datum: 02. Januar 2025", 20, 70);
	pdf.text("Rundgang gemacht mit: Admir Brenner", 20, 80);

	drawBorder(pdf); // Draw the border

	// New Page for Images
	pdf.addPage();

	// Format Each Image Page
	for (let i = 0; i < images.length; i++) {
		const imageData = images[i];
		const img = new Image();
		img.src = imageData;

		await new Promise((resolve) => {
			img.onload = () => {
				drawBorder(pdf); // Draw the border

				const pageWidth = pdf.internal.pageSize.getWidth();
				const pageHeight = pdf.internal.pageSize.getHeight();

				// Create a canvas to draw the image before adding to the PDF
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");

				// **Force correct orientation**
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0, img.width, img.height);

				// Convert to base64 (removes any rotation issues)
				const fixedImageData = canvas.toDataURL("image/jpeg");

				// **Resize image to fit in PDF correctly**
				let imgWidth = pageWidth - 40;
				let imgHeight = (img.height / img.width) * imgWidth;

				// Ensure the image is not too large
				if (imgHeight > pageHeight - 150) {
					imgHeight = pageHeight - 150;
					imgWidth = (img.width / img.height) * imgHeight;
				}

				// Add corrected image to PDF
				pdf.addImage(fixedImageData, "JPEG", 20, 25, imgWidth, imgHeight);

				// Move text closer to the image
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

				if (i < images.length - 1) pdf.addPage();
				resolve();
			};
		});
	}

	pdf.save("To_Do_List.pdf");
});
