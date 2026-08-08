// Client-side image compression before upload — resizes to a max dimension
// and re-encodes as JPEG, so large phone-camera photos don't hit the 10MB
// limit or waste Cloudinary bandwidth. Returns a Promise<Blob>.
export function compressImage(file, { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return resolve(file) // not an image, pass through

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Image compression failed'))
          resolve(blob)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for compression'))
    }

    img.src = objectUrl
  })
}
