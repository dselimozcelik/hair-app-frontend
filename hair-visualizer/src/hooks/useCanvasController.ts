// src/hooks/useCanvasController.ts
import { useEffect, useRef, useState } from "react";
import { loadImageFromFile } from "../core/imageLoader";
import { fitContain } from "../core/viewport";
import { sizeCanvases, drawBaseImage, resetMask, clearAll, syncViewFromMask } from "../core/canvasPair";
import type { CanvasPair } from "../core/canvasPair";
import { HistoryStack } from "../core/history";
import { downloadMask, createMaskFromView } from "../core/exporter";
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
    const currentStrokePath = useRef<Point[]>([]); // Mevcut stroke için path biriktir
    const strokeSnapshot = useRef<{ view: ImageData; mask: ImageData } | null>(null); // Stroke başlamadan önceki durum

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
        
        // İlk durum için snapshot al (undo/redo için)
        const mctx = maskCanvasRef.current!.getContext("2d")!;
        history.current.snapshot(mctx, w, h);
    }

    function getLocalXY(canvas: HTMLCanvasElement, e: React.PointerEvent) {
        const r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!img || !viewCanvasRef.current || !maskCanvasRef.current) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        isDrawing.current = true;
        const pt = getLocalXY(e.currentTarget, e);
        lastPt.current = pt;
        
        // Stroke başlamadan önceki durumu kaydet
        const vctx = viewCanvasRef.current.getContext("2d")!;
        const mctx = maskCanvasRef.current.getContext("2d")!;
        strokeSnapshot.current = {
            view: vctx.getImageData(0, 0, viewCanvasRef.current.width, viewCanvasRef.current.height),
            mask: mctx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height)
        };
        
        // Path'i başlat
        currentStrokePath.current = [pt];
        drawStep(e);
    }

    function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!isDrawing.current) return;
        drawStep(e);
    }

    function handleUp(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!img || !maskCanvasRef.current) return;
        isDrawing.current = false;
        
        // Path'i temizle
        currentStrokePath.current = [];
        strokeSnapshot.current = null;
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
        const isDrawMode = mode === "draw";
        
        // Path'e yeni noktayı ekle
        currentStrokePath.current.push(pt);
        
        // Stroke başlamadan önceki durumu geri yükle
        if (strokeSnapshot.current) {
            vctx.putImageData(strokeSnapshot.current.view, 0, 0);
            mctx.putImageData(strokeSnapshot.current.mask, 0, 0);
        }
        
        // Tüm path'i tek bir stroke olarak çiz (üst üste binme olmaz)
        drawCompletePath(vctx, mctx, currentStrokePath.current, brushSize, isDrawMode);
        
        // Erase modunda mask'tan silme yapıldıktan sonra viewCanvas'ı güncelle
        if (!isDrawMode && img) {
            syncViewFromMask(
                { view: v, mask: m },
                img,
                viewport.width,
                viewport.height
            );
        }
        
        lastPt.current = pt;
    }
    
    function drawCompletePath(
        vctx: CanvasRenderingContext2D,
        mctx: CanvasRenderingContext2D,
        path: Point[],
        size: number,
        isDrawMode: boolean
    ) {
        if (path.length < 1) return;
        
        // View canvas için
        if (isDrawMode) {
            vctx.globalCompositeOperation = "source-over";
            vctx.lineCap = "round";
            vctx.lineJoin = "round";
            vctx.lineWidth = size;
            vctx.strokeStyle = "rgba(255,255,255,0.4)";
            vctx.fillStyle = "rgba(255,255,255,0.4)";
            
            vctx.beginPath();
            if (path.length === 1) {
                // Tek nokta için circle
                vctx.arc(path[0].x, path[0].y, size / 2, 0, Math.PI * 2);
                vctx.fill();
            } else {
                // Tüm path'i tek bir stroke olarak çiz
                vctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) {
                    vctx.lineTo(path[i].x, path[i].y);
                }
                vctx.stroke();
            }
        }
        // Erase modunda view canvas'a dokunmuyoruz, sadece mask'tan siliyoruz
        
        // Mask canvas için
        if (isDrawMode) {
            mctx.globalCompositeOperation = "source-over";
            mctx.lineCap = "round";
            mctx.lineJoin = "round";
            mctx.lineWidth = size;
            mctx.strokeStyle = "white";
            
            mctx.beginPath();
            if (path.length === 1) {
                mctx.arc(path[0].x, path[0].y, size / 2, 0, Math.PI * 2);
                mctx.fill();
            } else {
                mctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) {
                    mctx.lineTo(path[i].x, path[i].y);
                }
                mctx.stroke();
            }
        } else {
            // Erase mode
            mctx.globalCompositeOperation = "destination-out";
            mctx.lineCap = "round";
            mctx.lineJoin = "round";
            mctx.lineWidth = size;
            mctx.strokeStyle = "black";
            
            mctx.beginPath();
            if (path.length === 1) {
                mctx.arc(path[0].x, path[0].y, size / 2, 0, Math.PI * 2);
                mctx.fill();
            } else {
                mctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) {
                    mctx.lineTo(path[i].x, path[i].y);
                }
                mctx.stroke();
            }
            mctx.globalCompositeOperation = "source-over";
        }
    }

    function clearAllAction() {
        if (!img || !viewCanvasRef.current || !maskCanvasRef.current) return;
        clearAll({ view: viewCanvasRef.current, mask: maskCanvasRef.current }, img, viewport.width, viewport.height);
        
        // Clear sonrası snapshot al (undo/redo için)
        const mctx = maskCanvasRef.current.getContext("2d")!;
        history.current.snapshot(mctx, maskCanvasRef.current.width, maskCanvasRef.current.height);
    }

    function exportMask() {
        if (!viewCanvasRef.current || !maskCanvasRef.current || !img) return;
        
        // View canvas'taki çizimlerden mask oluştur
        createMaskFromView(
            viewCanvasRef.current,
            maskCanvasRef.current,
            img,
            viewport.width,
            viewport.height
        );
        
        // Oluşturulan mask'ı indir
        downloadMask(maskCanvasRef.current);
    }

    function undo() {
        if (!maskCanvasRef.current || !viewCanvasRef.current || !img) return;
        const mctx = maskCanvasRef.current.getContext("2d")!;
        history.current.undo(mctx);
        // ViewCanvas'ı mask'a göre güncelle
        syncViewFromMask(
            { view: viewCanvasRef.current, mask: maskCanvasRef.current },
            img,
            viewport.width,
            viewport.height
        );
    }

    function redo() {
        if (!maskCanvasRef.current || !viewCanvasRef.current || !img) return;
        const mctx = maskCanvasRef.current.getContext("2d")!;
        history.current.redo(mctx);
        // ViewCanvas'ı mask'a göre güncelle
        syncViewFromMask(
            { view: viewCanvasRef.current, mask: maskCanvasRef.current },
            img,
            viewport.width,
            viewport.height
        );
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
