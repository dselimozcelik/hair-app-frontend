import { useEffect, useRef, useState } from "react";
import { fitContain } from "../lib/fit";
import type { BrushMode, Viewport } from "../types";

export function useCanvasDrawing() {
    // public state (App tarafından da okunabilir)
    const [file, setFile] = useState<File | null>(null);
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0, scale: 1 });
    const [brushSize, setBrushSize] = useState(12);
    const [mode, setMode] = useState<BrushMode>("draw");

    // internal
    const [isDrawing, setIsDrawing] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const lastPt = useRef<{ x: number; y: number } | null>(null);

    // file -> img
    useEffect(() => {
        if (!file) { setImg(null); return; }
        const url = URL.createObjectURL(file);
        const im = new Image();
        im.onload = () => { setImg(im); URL.revokeObjectURL(url); };
        im.src = url;
    }, [file]);

    // img -> viewport & canvas init
    useEffect(() => {
        if (!img || !containerRef.current) return;
        const box = containerRef.current.getBoundingClientRect();
        const vp = fitContain(img.width, img.height, box.width, box.height);
        setViewport(vp);
        initCanvases(vp.width, vp.height, img);
    }, [img]);

    // resize observe
    useEffect(() => {
        if (!containerRef.current || !img) return;
        const ro = new ResizeObserver(() => {
            const box = containerRef.current!.getBoundingClientRect();
            const vp = fitContain(img.width, img.height, box.width, box.height);
            setViewport(vp);
            initCanvases(vp.width, vp.height, img);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [img]);

    function initCanvases(w: number, h: number, image: HTMLImageElement) {
        const v = viewCanvasRef.current, m = maskCanvasRef.current;
        if (!v || !m) return;
        v.width = w; v.height = h; m.width = w; m.height = h;

        const vctx = v.getContext("2d")!;
        vctx.clearRect(0, 0, w, h);
        vctx.drawImage(image, 0, 0, w, h);

        const mctx = m.getContext("2d")!;
        mctx.fillStyle = "black";
        mctx.fillRect(0, 0, w, h);
    }

    function getLocalXY(canvas: HTMLCanvasElement, e: React.PointerEvent) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function drawStroke(
        ctx: CanvasRenderingContext2D,
        from: { x: number; y: number } | null,
        to: { x: number; y: number },
        size: number
    ) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = size;
        if (from) {
            ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.arc(to.x, to.y, size / 2, 0, Math.PI * 2); ctx.fill();
        }
    }

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!img || !viewCanvasRef.current || !maskCanvasRef.current) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDrawing(true);
        lastPt.current = getLocalXY(e.currentTarget, e);
        drawStep(e);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!isDrawing) return;
        drawStep(e);
    }

    function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
        setIsDrawing(false);
        lastPt.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
    }

    function drawStep(e: React.PointerEvent<HTMLCanvasElement>) {
        const v = viewCanvasRef.current, m = maskCanvasRef.current;
        if (!v || !m) return;
        const vctx = v.getContext("2d")!;
        const mctx = m.getContext("2d")!;
        const pt = getLocalXY(v, e);

        // görünüm
        vctx.globalCompositeOperation = "source-over";
        vctx.strokeStyle = mode === "draw" ? "rgba(255,255,255,0.9)" : "rgba(255,0,0,0.9)";
        vctx.fillStyle = vctx.strokeStyle;
        drawStroke(vctx, lastPt.current, pt, brushSize);

        // maske: beyaz çiz, erase'te beyazı sil
        if (mode === "draw") {
            mctx.globalCompositeOperation = "source-over";
            mctx.strokeStyle = "white";
            mctx.fillStyle = "white";
            drawStroke(mctx, lastPt.current, pt, brushSize);
        } else {
            mctx.globalCompositeOperation = "destination-out";
            mctx.strokeStyle = "black";
            mctx.fillStyle = "black";
            drawStroke(mctx, lastPt.current, pt, brushSize);
            mctx.globalCompositeOperation = "source-over";
        }

        lastPt.current = pt;
    }

    function clearAll() {
        if (!viewCanvasRef.current || !maskCanvasRef.current || !img) return;
        const { width, height } = viewport;
        const vctx = viewCanvasRef.current.getContext("2d")!;
        vctx.clearRect(0, 0, width, height);
        vctx.drawImage(img, 0, 0, width, height);

        const mctx = maskCanvasRef.current.getContext("2d")!;
        mctx.fillStyle = "black";
        mctx.fillRect(0, 0, width, height);
    }

    function exportMask() {
        if (!maskCanvasRef.current) return;
        const url = maskCanvasRef.current.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url; a.download = "mask.png"; a.click();
    }

    return {
        // state
        file, setFile, img, viewport, brushSize, setBrushSize, mode, setMode,
        // refs
        containerRef, viewCanvasRef, maskCanvasRef,
        // actions
        handlePointerDown, handlePointerMove, handlePointerUp,
        clearAll, exportMask,
    };
}
