const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileNameDisplay = document.getElementById('file-name');
const enhanceBtn = document.getElementById('enhance-btn');

let sourceImage = null;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

upload.addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];
    sourceImage = null;
    enhanceBtn.disabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fileNameDisplay.textContent = '';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
        fileNameDisplay.textContent = 'Please choose a valid image file.';
        upload.value = '';
        return;
    }
    if (file.size > MAX_FILE_SIZE) {
        fileNameDisplay.textContent = 'Image is too large. Choose a file under 20 MB.';
        upload.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
        fileNameDisplay.textContent = 'Could not read this file. Please try another image.';
    };
    reader.onload = () => {
        const image = new Image();
        image.onload = () => {
            const pixelCount = image.naturalWidth * image.naturalHeight;
            if (image.naturalWidth > 8192 || image.naturalHeight > 8192 || pixelCount > 40000000) {
                fileNameDisplay.textContent = 'Image dimensions are too large. Use an image no larger than 8192 × 8192 and 40 million pixels total.';
                upload.value = '';
                return;
            }
            sourceImage = image;
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            ctx.drawImage(image, 0, 0);
            fileNameDisplay.textContent = file.name;
            enhanceBtn.disabled = false;
        };
        image.onerror = () => {
            fileNameDisplay.textContent = 'This file could not be decoded as an image.';
        };
        image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
});

enhanceBtn.addEventListener('click', enhanceImage);

function enhanceImage() {
    if (!sourceImage || !sourceImage.complete || sourceImage.naturalWidth === 0) {
        fileNameDisplay.textContent = 'Please upload a valid image first.';
        return;
    }

    // Always start from the original upload so repeated clicks do not compound brightness.
    canvas.width = sourceImage.naturalWidth;
    canvas.height = sourceImage.naturalHeight;
    ctx.drawImage(sourceImage, 0, 0);

    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.round(data[i] * 1.2));
            data[i + 1] = Math.min(255, Math.round(data[i + 1] * 1.2));
            data[i + 2] = Math.min(255, Math.round(data[i + 2] * 1.2));
        }
        ctx.putImageData(imageData, 0, 0);
    } catch (error) {
        fileNameDisplay.textContent = error instanceof Error
            ? 'Could not enhance this image: ' + error.message
            : 'Could not enhance this image.';
    }
}
