// src/core/history.ts
export class HistoryStack {
    private stack: ImageData[] = [];
    private redoStack: ImageData[] = [];
    private limit: number;
    constructor(limit = 10) {
        this.limit = limit;
    }

    snapshot(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const data = ctx.getImageData(0, 0, w, h);
        this.stack.push(data);
        if (this.stack.length > this.limit) this.stack.shift();
        this.redoStack = [];
    }

    undo(ctx: CanvasRenderingContext2D, w: number, h: number) {
        if (!this.stack.length) return;
        const curr = ctx.getImageData(0, 0, w, h);
        this.redoStack.push(curr);
        const prev = this.stack.pop()!;
        ctx.putImageData(prev, 0, 0);
    }

    redo(ctx: CanvasRenderingContext2D) {
        if (!this.redoStack.length) return;
        const next = this.redoStack.pop()!;
        ctx.putImageData(next, 0, 0);
    }
}
