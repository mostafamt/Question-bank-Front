function getImageDimensions(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = function () {
      resolve({
        width: this.naturalWidth, // Or this.width for rendered dimensions
        height: this.naturalHeight, // Or this.height for rendered dimensions
      });
    };

    img.onerror = function () {
      reject(new Error("Failed to load image at URL: " + imageUrl));
    };

    img.src = imageUrl;
  });
}

export { getImageDimensions };
