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

	for (let i = 0; i < images.length; i++) {
		const imageData = images[i];
		const img = new Image();
		img.src = imageData;

		await new Promise((resolve) => {
			img.onload = () => {
				const pageWidth = pdf.internal.pageSize.getWidth();
				const pageHeight = pdf.internal.pageSize.getHeight();
				let imgWidth = pageWidth - 20;
				let imgHeight = (img.height / img.width) * imgWidth;

				if (imgHeight > pageHeight - 20) {
					imgHeight = pageHeight - 20;
					imgWidth = (img.width / img.height) * imgHeight;
				}

				if (i > 0) pdf.addPage();
				pdf.addImage(imageData, "JPEG", 10, 10, imgWidth, imgHeight);
				resolve();
			};
		});
	}

	pdf.save("generated.pdf");
});
