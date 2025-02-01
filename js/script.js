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
			alert("Nur Bilddateien sind erlaubt!");
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
	const { generatePDF } = await import("./pdfGenerator.js");
	generatePDF(images);
});
