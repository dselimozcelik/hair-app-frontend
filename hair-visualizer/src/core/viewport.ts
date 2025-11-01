// src/core/viewport.ts
import type { Viewport } from "../types";

export function fitContain(imgW: number, imgH: number, boxW: number, boxH: number): Viewport {
    const r = Math.min(boxW / imgW, boxH / imgH);
    return {
        width: Math.max(1, Math.floor(imgW * r)),
        height: Math.max(1, Math.floor(imgH * r)),
        scale: r,
    };
}
