import { useCallback, useEffect, useRef, useState } from "react";
import type { Cell } from "../types";
import { DENSITY, COLS, ASPECT_CORRECTION } from "../constants";
import { lensById } from "../../../lenses";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface UseAsciiConverterResult {
  grid: Cell[][];
  effectImage: ImageData | null;
  hasImage: boolean;
  fileName: string;
  isProcessing: boolean;
  error: string;
  activeLens: string;
  lensStrength?: number;
  setActiveLens: (lensId: string) => void;
  setLensStrength: (strength: number) => void;
  processImage: (file: File) => void;
}

export function useAsciiConverter(): UseAsciiConverterResult {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [effectImage, setEffectImage] = useState<ImageData | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [activeLens, setActiveLensState] = useState("ascii");
  const [lensStrength, setLensStrengthState] = useState<number | undefined>(undefined);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const activeLensRef = useRef("ascii");
  const lensStrengthRef = useRef<number | undefined>(undefined);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    activeLensRef.current = activeLens;
    lensStrengthRef.current = lensStrength;
  }, [activeLens, lensStrength]);

  useEffect(
    () => () => {
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    },
    []
  );

  const generateAsciiGrid = useCallback(
    (img: HTMLImageElement, lensId: string, strength?: number) => {
      try {
        const lens = lensById(lensId);
        if (lens) {
          const sourceWidth = img.naturalWidth || img.width;
          const sourceHeight = img.naturalHeight || img.height;
          const previewScale = Math.min(1, 480 / Math.max(sourceWidth, sourceHeight));
          const targetW = Math.max(1, Math.round(sourceWidth * previewScale));
          const targetH = Math.max(1, Math.round(sourceHeight * previewScale));

          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = targetW;
          tempCanvas.height = targetH;
          const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
          if (!tempCtx) throw new Error("Canvas not supported");

          tempCtx.drawImage(img, 0, 0, targetW, targetH);
          const rawData = tempCtx.getImageData(0, 0, targetW, targetH);

          const s1 = strength ?? lens.param.default;
          const s2 = lens.param2?.default;
          setEffectImage(lens.apply(rawData, s1, s2));
          setGrid([]);
          return;
        }

        const rows = Math.max(
          1,
          Math.round((img.height / img.width) * COLS * ASPECT_CORRECTION)
        );

        const canvas = canvasRef.current ?? document.createElement("canvas");
        canvasRef.current = canvas;
        canvas.width = COLS;
        canvas.height = rows;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas not supported");

        ctx.clearRect(0, 0, COLS, rows);

        setEffectImage(null);
        ctx.drawImage(img, 0, 0, COLS, rows);

        const { data } = ctx.getImageData(0, 0, COLS, rows);
        const newGrid: Cell[][] = [];

        for (let y = 0; y < rows; y++) {
          const row: Cell[] = [];
          for (let x = 0; x < COLS; x++) {
            const idx = (y * COLS + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const alpha = data[idx + 3];

            const brightness =
              (0.299 * r + 0.587 * g + 0.114 * b) * (alpha / 255);

            if (alpha < 16) {
              row.push({ char: " ", r, g, b, brightness, isBlank: true });
              continue;
            }

            const normalized = clamp(brightness / 255, 0, 1);
            const shadowLift = Math.max(0, (0.36 - normalized) * 0.8);
            const contrastBoost = Math.pow(
              clamp(normalized + shadowLift, 0, 1),
              0.82
            );

            const level = Math.min(
              DENSITY.length - 1,
              Math.floor(contrastBoost * (DENSITY.length - 1))
            );
            const char = DENSITY[level];

            row.push({ char, r, g, b, brightness, isBlank: char === " " });
          }
          newGrid.push(row);
        }

        setGrid(newGrid);
      } catch {
        setError(
          lensId === "ascii"
            ? "Something went wrong turning that image into ASCII art."
            : "Something went wrong applying the image effect."
        );
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const scheduleRender = useCallback(
    (img: HTMLImageElement, lensId: string, strength: number | undefined, delay: number) => {
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
      renderTimerRef.current = setTimeout(() => {
        renderTimerRef.current = null;
        setIsProcessing(true);
        generateAsciiGrid(img, lensId, strength);
      }, delay);
    },
    [generateAsciiGrid]
  );

  const setActiveLens = useCallback(
    (newLensId: string) => {
      setError("");
      setActiveLensState(newLensId);
      activeLensRef.current = newLensId;
      const lensObj = lensById(newLensId);
      const defaultStrength = lensObj ? lensObj.param.default : undefined;
      lensStrengthRef.current = defaultStrength;
      setLensStrengthState(defaultStrength);
      if (imageRef.current) {
        setEffectImage(null);
        setGrid([]);
        scheduleRender(imageRef.current, newLensId, defaultStrength, 0);
      }
    },
    [scheduleRender]
  );

  const setLensStrength = useCallback(
    (strength: number) => {
      setError("");
      lensStrengthRef.current = strength;
      setLensStrengthState(strength);
      if (imageRef.current) {
        scheduleRender(imageRef.current, activeLensRef.current, strength, 140);
      }
    },
    [scheduleRender]
  );

  const processImage = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }

      setError("");
      setIsProcessing(true);
      setEffectImage(null);
      setGrid([]);
      setHasImage(false);
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
        renderTimerRef.current = null;
      }
      setFileName(file.name);

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          imageRef.current = img;
          setHasImage(true);
          scheduleRender(
            img,
            activeLensRef.current,
            lensStrengthRef.current,
            0
          );
        };

        img.onerror = () => {
          setError("Couldn't read that file as an image.");
          setIsProcessing(false);
        };
        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        setError("Couldn't read that file.");
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    },
    [scheduleRender]
  );

  return {
    grid,
    effectImage,
    hasImage,
    fileName,
    isProcessing,
    error,
    activeLens,
    lensStrength,
    setActiveLens,
    setLensStrength,
    processImage,
  };
}
