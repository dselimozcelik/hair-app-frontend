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
    
    // ViewCanvas'ı temel resimle doldur
    drawBaseImage(pair, img, w, h);
    
    // Mask'taki beyaz çizgileri viewCanvas'a çiz
    // Sadece beyaz pikselleri çizmek için "lighten" mode kullan
    vctx.globalCompositeOperation = "lighten";
    vctx.drawImage(pair.mask, 0, 0);
    vctx.globalCompositeOperation = "source-over";
}
