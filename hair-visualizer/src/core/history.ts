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

    undo(ctx: CanvasRenderingContext2D) {
        // En az 2 snapshot olmalı (başlangıç + en az bir çizim)
        if (this.stack.length < 2) return;
        
        // Mevcut durumu (stack'in en son elemanı) redoStack'e ekle
        const current = this.stack.pop()!;
        this.redoStack.push(current);
        
        // Bir önceki snapshot'ı al ve uygula
        const prev = this.stack[this.stack.length - 1];
        ctx.putImageData(prev, 0, 0);
    }

    redo(ctx: CanvasRenderingContext2D) {
        if (!this.redoStack.length) return;
        
        // RedoStack'ten snapshot al
        const next = this.redoStack.pop()!;
        
        // Stack'e geri ekle
        this.stack.push(next);
        if (this.stack.length > this.limit) this.stack.shift();
        
        // Uygula
        ctx.putImageData(next, 0, 0);
    }
}
