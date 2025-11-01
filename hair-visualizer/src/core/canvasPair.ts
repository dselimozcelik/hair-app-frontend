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
