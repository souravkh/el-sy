import type { ChangeEvent, ReactNode, RefObject } from "react";
import type { ColorMode } from "../types";
import { lenses, lensById } from "../../../lenses";
import { FluidBackground } from "./FluidBackground";
import { MatrixRainBackground } from "./MatrixRainBackground";

interface ControlsProps {
  fileInputRef: RefObject<HTMLInputElement>;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  hasImage?: boolean;
  fileName: string;
  onDownloadPng: () => void;
  activeLens?: string;
  onLensChange?: (lensId: string) => void;
  lensStrength?: number;
  onLensStrengthChange?: (strength: number) => void;
  children?: ReactNode;
  colorMode?: ColorMode;
  onColorModeChange?: (mode: ColorMode) => void;
  onDownloadText?: () => void;
  isAscii?: boolean;
  hasGrid?: boolean;
}

export function Controls({
  fileInputRef,
  onFileChange,
  zoom,
  onZoomChange,
  hasImage: hasImageProp,
  fileName,
  onDownloadPng,
  onDownloadText,
  activeLens = "ascii",
  onLensChange,
  lensStrength,
  onLensStrengthChange,
  children,
  colorMode = "color",
  onColorModeChange,
  isAscii = false,
  hasGrid = false,
}: ControlsProps) {
  const hasImage = hasImageProp ?? hasGrid;
  const activeLensObject = lensById(activeLens);
  const modes = [{ id: "ascii", label: "ASCII Art" }, ...lenses];
  const pixelSize = lensStrength ?? activeLensObject?.param.default ?? 3;
  const pixelSizeMin = activeLensObject?.param.min ?? 1;
  const pixelSizeMax = activeLensObject?.param.max ?? 24;
  const pixelSizeStep = activeLensObject?.param.step ?? 1;

  return (
    <div className="studio-app">
      <MatrixRainBackground />
      <FluidBackground />
      <header className="studio-header">
        <h1>EL-SY</h1>
        <div className="studio-header-actions">
          <span className="studio-filename" title={fileName || "No image selected"}>
            {fileName || "No image selected"}
          </span>
          <button
            type="button"
            className="studio-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose image
          </button>
          <input
            ref={fileInputRef}
            className="studio-file-input"
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
          {isAscii && (
            <button
              type="button"
              className="studio-button"
              onClick={onDownloadText}
              disabled={!hasImage}
            >
              Download TXT
            </button>
          )}
          <button
            type="button"
            className="studio-button studio-button-primary"
            onClick={onDownloadPng}
            disabled={!hasImage}
          >
            Download PNG
          </button>
        </div>
      </header>

      <div className="studio-workspace">
        <aside className="studio-sidebar">
          <h2>CHOOSE A MODE</h2>
          <nav aria-label="Image mode" className="studio-mode-list">
            {modes.map((mode) => (
              <div key={mode.id} className="studio-mode-group">
                <button
                  type="button"
                  aria-pressed={activeLens === mode.id}
                  className={`studio-mode-button${activeLens === mode.id ? " is-active" : ""}`}
                  onClick={() => onLensChange?.(mode.id)}
                >
                  {mode.label}
                </button>
                {mode.id === "ascii" && isAscii && (
                  <div className="studio-submode-list" aria-label="ASCII color mode">
                    {(["color", "bw", "spectrum", "soft"] as const).map((submode) => (
                      <button
                        key={submode}
                        type="button"
                        aria-pressed={colorMode === submode}
                        className={`studio-submode-button${colorMode === submode ? " is-active" : ""}`}
                        onClick={() => onColorModeChange?.(submode)}
                      >
                        {submode === "color"
                          ? "Color"
                          : submode === "bw"
                            ? "Black & white"
                            : submode === "spectrum"
                              ? "Spectrum"
                              : "Low detail"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="studio-stage" aria-label="Image preview">
          {children}

          <div className="studio-slider-bar">
            <label className="studio-slider">
              <span className="studio-slider-label">Pixel size</span>
              <input
                type="range"
                min={pixelSizeMin}
                max={pixelSizeMax}
                step={pixelSizeStep}
                value={pixelSize}
                disabled={!activeLensObject}
                onChange={(event) => onLensStrengthChange?.(Number(event.target.value))}
              />
              <output>{pixelSize}</output>
            </label>

            <label className="studio-slider">
              <span className="studio-slider-label">Zoom</span>
              <input
                type="range"
                min={1}
                max={300}
                step={1}
                value={zoom}
                onChange={(event) => onZoomChange(Number(event.target.value))}
              />
              <output>{zoom}%</output>
            </label>
          </div>
        </main>
      </div>
    </div>
  );
}
