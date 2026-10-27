import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useAsciiConverter } from "./hooks/useAsciiConverter";
import { toDisplayGrid } from "./utils/gridUtils";
import {
  renderGridToCanvas,
  renderImageDataToCanvas,
  downloadCanvasAsPng,
} from "./utils/exportUtils";
import { downloadTextFile, gridToText } from "./utils/gridUtils";
import { Controls } from "./components/Controls";
import { AsciiCanvas } from "./components/AsciiCanvas";
import { ImageEffectCanvas } from "./components/ImageEffectCanvas";
import { lensById } from "../../lenses";
import type { ColorMode } from "./types";

/**
 * Container component. It owns two kinds of state:
 *  1. Delegated to useAsciiConverter — the actual conversion logic
 *     (grid, isProcessing, error, fileName). This is "business logic".
 *  2. Local UI-only state — zoom and colorMode. These don't need a
 *     hook of their own because nothing about them is reusable or
 *     complex; they're just view preferences.
 *
 * Everything below this component is presentational and stateless.
 */
export default function AsciiArtConverter() {
  const {
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
  } = useAsciiConverter();

  const [zoom, setZoom] = useState(37);
  const [colorMode, setColorMode] = useState<ColorMode>("color");
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const coloredGrid = useMemo(
    () => toDisplayGrid(grid, colorMode),
    [grid, colorMode]
  );

  const isAscii = activeLens === "ascii";
  const activeEffectName = lensById(activeLens)?.label ?? "image";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setZoom(isAscii ? 37 : 100);
    processImage(file);
  };

  const handleLensChange = (lensId: string) => {
    setZoom(lensId === "ascii" ? 37 : 100);
    setActiveLens(lensId);
  };

  const handleDownloadPng = () => {
    const canvas = isAscii
      ? renderGridToCanvas(coloredGrid, 2)
      : effectImage
        ? renderImageDataToCanvas(effectImage)
        : null;
    if (!canvas) return;
    const name = `${fileName.replace(/\.[^/.]+$/, "") || "image"}${isAscii ? "-ascii-art" : "-effect"}.png`;
    downloadCanvasAsPng(canvas, name);
  };

  const handleDownloadText = () => {
    const text = gridToText(grid);
    const name = `${fileName.replace(/\.[^/.]+$/, "") || "ascii-art"}.txt`;
    downloadTextFile(text, name);
  };

  return (
    <Controls
      fileInputRef={fileInputRef}
      onFileChange={handleFileChange}
      zoom={zoom}
      onZoomChange={setZoom}
      hasImage={hasImage}
      fileName={fileName}
      onDownloadPng={handleDownloadPng}
      onDownloadText={handleDownloadText}
      isAscii={isAscii}
      colorMode={colorMode}
      onColorModeChange={setColorMode}
      activeLens={activeLens}
      onLensChange={handleLensChange}
      lensStrength={lensStrength}
      onLensStrengthChange={setLensStrength}
    >
          {isAscii ? (
            <AsciiCanvas
              coloredGrid={coloredGrid}
              zoom={zoom}
              isProcessing={isProcessing}
              hasImage={grid.length > 0}
              error={error}
            />
          ) : (
            <ImageEffectCanvas
              imageData={effectImage}
              zoom={zoom}
              isProcessing={isProcessing}
              hasImage={hasImage}
              error={error}
              effectName={activeEffectName}
            />
          )}
    </Controls>
  );
}
