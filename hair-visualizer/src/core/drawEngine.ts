// src/core/drawEngine.ts
export type Point = { x: number; y: number };

export function drawStroke(
    ctx: CanvasRenderingContext2D,
    from: Point | null,
    to: Point,
    size: number,
    fillOrStrokeStyle: string
) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.strokeStyle = fillOrStrokeStyle;
    ctx.fillStyle = fillOrStrokeStyle;

    if (from) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(to.x, to.y, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function drawOnView(
    viewCtx: CanvasRenderingContext2D,
    from: Point | null,
    to: Point,
    size: number,
    isDrawMode: boolean
) {
    viewCtx.globalCompositeOperation = "source-over";
    const color = isDrawMode ? "rgba(255,255,255,0.9)" : "rgba(255,0,0,0.9)";
    drawStroke(viewCtx, from, to, size, color);
}

export function drawOnMask(
    maskCtx: CanvasRenderingContext2D,
    from: Point | null,
    to: Point,
    size: number,
    isDrawMode: boolean
) {
    if (isDrawMode) {
        maskCtx.globalCompositeOperation = "source-over";
        drawStroke(maskCtx, from, to, size, "white");
    } else {
        maskCtx.globalCompositeOperation = "destination-out";
        drawStroke(maskCtx, from, to, size, "black");
        maskCtx.globalCompositeOperation = "source-over";
    }
}
