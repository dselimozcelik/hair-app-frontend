// src/core/exporter.ts
export function downloadMask(mask: HTMLCanvasElement, name = "mask.png") {
    const url = mask.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
}

// View canvas'taki çizimlerden mask oluşturur
export function createMaskFromView(
    viewCanvas: HTMLCanvasElement,
    maskCanvas: HTMLCanvasElement,
    originalImage: HTMLImageElement,
    width: number,
    height: number
) {
    const viewCtx = viewCanvas.getContext("2d")!;
    const maskCtx = maskCanvas.getContext("2d")!;
    
    // Mask'ı siyahla doldur
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, width, height);
    
    // View canvas'ın ImageData'sını al
    const viewData = viewCtx.getImageData(0, 0, width, height);
    
    // Orijinal resmi geçici bir canvas'a çiz
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.drawImage(originalImage, 0, 0, width, height);
    const originalData = tempCtx.getImageData(0, 0, width, height);
    
    // Mask için ImageData oluştur
    const maskData = maskCtx.createImageData(width, height);
    
    // Her pikseli karşılaştır ve farkları mask'a beyaz olarak çiz
    for (let i = 0; i < viewData.data.length; i += 4) {
        const viewR = viewData.data[i];
        const viewG = viewData.data[i + 1];
        const viewB = viewData.data[i + 2];
        const viewA = viewData.data[i + 3];
        
        const origR = originalData.data[i];
        const origG = originalData.data[i + 1];
        const origB = originalData.data[i + 2];
        
        // View canvas'taki piksel orijinal resimden farklı mı?
        // Beyaz veya açık renkli çizimleri algıla
        const isWhiteOrLight = viewR > 200 && viewG > 200 && viewB > 200 && viewA > 100;
        const isDifferent = Math.abs(viewR - origR) > 10 || 
                           Math.abs(viewG - origG) > 10 || 
                           Math.abs(viewB - origB) > 10;
        
        if (isWhiteOrLight && isDifferent) {
            // Beyaz çizim olarak mask'a ekle
            maskData.data[i] = 255;     // R
            maskData.data[i + 1] = 255; // G
            maskData.data[i + 2] = 255; // B
            maskData.data[i + 3] = 255; // A
        } else {
            // Siyah (transparent)
            maskData.data[i] = 0;
            maskData.data[i + 1] = 0;
            maskData.data[i + 2] = 0;
            maskData.data[i + 3] = 255;
        }
    }
    
    // Mask'ı uygula
    maskCtx.putImageData(maskData, 0, 0);
}
