// src/hooks/useCanvasController.ts
import { useEffect, useRef, useState } from "react";
import { loadImageFromFile } from "../core/imageLoader";
import { fitContain } from "../core/viewport";
import { sizeCanvases, drawBaseImage, resetMask, clearAll } from "../core/canvasPair";
import type { CanvasPair } from "../core/canvasPair";
import { drawOnView, drawOnMask } from "../core/drawEngine";
import { HistoryStack } from "../core/history";
import { downloadMask } from "../core/exporter";
import type { BrushMode, Viewport } from "../types";

type Point = { x: number; y: number };

export function useCanvasController() {
    // UI state
    const [brushSize, setBrushSize] = useState(12);
    const [mode, setMode] = useState<BrushMode>("draw");

    // image & layout
    const [file, setFile] = useState<File | null>(null);
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0, scale: 1 });

    // refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);
    const lastPt = useRef<Point | null>(null);
    const history = useRef(new HistoryStack(12));

    // 1) file -> img
    useEffect(() => {
        if (!file) { setImg(null); return; }
        let cancelled = false;
        loadImageFromFile(file).then((image) => {
            if (!cancelled) setImg(image);
        });
        return () => { cancelled = true; };
    }, [file]);

    // 2) img geldiyse canvasları hazırla
    useEffect(() => {
        if (!img || !containerRef.current || !viewCanvasRef.current || !maskCanvasRef.current) return;
        const { width, height } = fitToContainer();
        initPair(width, height, img);
    }, [img]);

    // 3) responsive
    useEffect(() => {
        if (!containerRef.current || !img) return;
        const ro = new ResizeObserver(() => {
            const { width, height } = fitToContainer();
            initPair(width, height, img);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [img]);

    function fitToContainer() {
        const box = containerRef.current!.getBoundingClientRect();
        const vp = fitContain(img!.width, img!.height, box.width, box.height);
        setViewport(vp);
        return vp;
    }

    function initPair(w: number, h: number, image: HTMLImageElement) {
        const pair: CanvasPair = { view: viewCanvasRef.current!, mask: maskCanvasRef.current! };
        sizeCanvases(pair, w, h);
        drawBaseImage(pair, image, w, h);
        resetMask(pair, w, h);
    }

    function getLocalXY(canvas: HTMLCanvasElement, e: React.PointerEvent) {
        const r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!img || !viewCanvasRef.current || !maskCanvasRef.current) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        isDrawing.current = true;
        lastPt.current = getLocalXY(e.currentTarget, e);
        drawStep(e);
    }

    function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!isDrawing.current) return;
        drawStep(e);
    }

    function handleUp(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!img || !maskCanvasRef.current) return;
        isDrawing.current = false;
        lastPt.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);

        // snapshot (undo için)
        const mctx = maskCanvasRef.current.getContext("2d")!;
        history.current.snapshot(mctx, maskCanvasRef.current.width, maskCanvasRef.current.height);
    }

    function drawStep(e: React.PointerEvent<HTMLCanvasElement>) {
        const v = viewCanvasRef.current!, m = maskCanvasRef.current!;
        const vctx = v.getContext("2d")!, mctx = m.getContext("2d")!;
        const pt = getLocalXY(v, e);
        drawOnView(vctx, lastPt.current, pt, brushSize, mode === "draw");
        drawOnMask(mctx, lastPt.current, pt, brushSize, mode === "draw");
        lastPt.current = pt;
    }

    function clearAllAction() {
        if (!img || !viewCanvasRef.current || !maskCanvasRef.current) return;
        clearAll({ view: viewCanvasRef.current, mask: maskCanvasRef.current }, img, viewport.width, viewport.height);
    }

    function exportMask() {
        if (!maskCanvasRef.current) return;
        downloadMask(maskCanvasRef.current);
    }

    function undo() {
        if (!maskCanvasRef.current) return;
        const mctx = maskCanvasRef.current.getContext("2d")!;
        history.current.undo(mctx, maskCanvasRef.current.width, maskCanvasRef.current.height);
        // viewCanvas'ı tekrar resimle doldur
        if (img && viewCanvasRef.current) {
            const vctx = viewCanvasRef.current.getContext("2d")!;
            vctx.clearRect(0, 0, viewport.width, viewport.height);
            vctx.drawImage(img, 0, 0, viewport.width, viewport.height);
        }
    }

    function redo() {
        if (!maskCanvasRef.current) return;
        const mctx = maskCanvasRef.current.getContext("2d")!;
        history.current.redo(mctx);
        if (img && viewCanvasRef.current) {
            const vctx = viewCanvasRef.current.getContext("2d")!;
            vctx.clearRect(0, 0, viewport.width, viewport.height);
            vctx.drawImage(img, 0, 0, viewport.width, viewport.height);
        }
    }

    return {
        // ui
        brushSize, setBrushSize, mode, setMode,

        // image/layout
        file, setFile, img, viewport,

        // refs
        containerRef, viewCanvasRef, maskCanvasRef,

        // events
        handleDown, handleMove, handleUp,

        // actions
        clearAll: clearAllAction,
        exportMask, undo, redo,
    };
}
