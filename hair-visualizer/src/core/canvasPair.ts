// src/core/canvasPair.ts
export type CanvasPair = {
    view: HTMLCanvasElement;
    mask: HTMLCanvasElement;
};

export function sizeCanvases(pair: CanvasPair, w: number, h: number) {
    pair.view.width = w; pair.view.height = h;
    pair.mask.width = w; pair.mask.height = h;
}

export function drawBaseImage(pair: CanvasPair, img: HTMLImageElement, w: number, h: number) {
    const vctx = pair.view.getContext("2d")!;
    vctx.clearRect(0, 0, w, h);
    vctx.drawImage(img, 0, 0, w, h);
}

export function resetMask(pair: CanvasPair, w: number, h: number) {
    const mctx = pair.mask.getContext("2d")!;
    mctx.fillStyle = "black";
    mctx.fillRect(0, 0, w, h);
}

export function clearAll(pair: CanvasPair, img: HTMLImageElement, w: number, h: number) {
    drawBaseImage(pair, img, w, h);
    resetMask(pair, w, h);
}

// Mask'taki çizimleri viewCanvas'a yansıtır
export function syncViewFromMask(pair: CanvasPair, img: HTMLImageElement, w: number, h: number) {
    const vctx = pair.view.getContext("2d")!;
    const mctx = pair.mask.getContext("2d")!;
    
    // ViewCanvas'ı temel resimle doldur
    drawBaseImage(pair, img, w, h);
    
    // Mask'taki beyaz çizgileri viewCanvas'a yarı saydam beyaz olarak çiz
    // Mask'taki pikselleri al
    const maskData = mctx.getImageData(0, 0, w, h);
    
    // View canvas'taki pikselleri al
    const viewData = vctx.getImageData(0, 0, w, h);
    
    // Mask'taki beyaz pikselleri view canvas'a yarı saydam beyaz olarak ekle
    for (let i = 0; i < maskData.data.length; i += 4) {
        const maskR = maskData.data[i];
        const maskG = maskData.data[i + 1];
        const maskB = maskData.data[i + 2];
        
        // Mask'ta beyaz ise (RGB değerleri yüksekse)
        if (maskR > 128 || maskG > 128 || maskB > 128) {
            // Temel resim pikseli (viewData'daki mevcut değer)
            const baseR = viewData.data[i];
            const baseG = viewData.data[i + 1];
            const baseB = viewData.data[i + 2];
            
            // Yarı saydam beyaz ekle: base + (255 - base) * 0.4
            viewData.data[i] = Math.min(255, baseR + (255 - baseR) * 0.4);
            viewData.data[i + 1] = Math.min(255, baseG + (255 - baseG) * 0.4);
            viewData.data[i + 2] = Math.min(255, baseB + (255 - baseB) * 0.4);
        }
    }
    
    vctx.putImageData(viewData, 0, 0);
}
