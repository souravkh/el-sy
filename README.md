# EL-SY

*Every Look, Still You.*

**EL-SY** is a browser-based studio that transforms photos into ASCII art,
pixel art, and retro-inspired effects while letting you control how detailed
and recognizable the result is.

Create text-based avatars, experiment with visual identity, or share a
stylized representation of yourself instead of the original photograph.

![Color mode](https://img.shields.io/badge/mode-color-blueviolet)
![Low detail mode](https://img.shields.io/badge/mode-low%20detail-teal)
![Black and white mode](https://img.shields.io/badge/mode-black%20%26%20white-lightgrey)
![Spectrum mode](https://img.shields.io/badge/mode-spectrum-orange)

## Why EL-SY?

The idea started with a simple thought: *What if you want to be seen, just not
exactly as you are? or Simple ELSE look*

Not everyone wants their actual face on a profile picture. Sometimes you want
something personal, something that feels like you, without putting your literal
face out there.

A generic avatar is one option, but it can feel too generic, like a random
illustration that says little about the person behind it.

That's where **EL-SY** comes in.

Inspired by the idea of **"Else"**, another version, another possibility, another
way of being seen, EL-SY offers a more personal alternative. It transforms your
own photo into a character-based representation, giving you something rooted in
*your* image rather than a one-size-fits-all avatar.

The name also has a little experimental-machine energy, like something built in
a workshop to see what happens.

Your original photo stays in your browser during processing, so you can
experiment without uploading it to an app server. The interface does load fonts
from Google Fonts, which requires a separate network request.

**Not your literal face. Not another generic avatar. A different representation
of you.**

That's EL-SY.

## What you can create

Choose ASCII Art to render the photo as a character grid, or pick an image
effect to transform the original image. Adjust the available color mode or
effect strength, zoom the preview, and download your result.

## Modes

### ASCII Art

Render the image as a grid of characters. Choose Color, Black & white, Spectrum,
or Low detail to change the character colors and style. ASCII Art supports PNG
and plain-text (`.txt`) downloads.

### Image effects

These modes apply to the original image, not to the ASCII rendering.

| Mode            | Effect |
|-----------------|--------|
| Pixel mosaic    | Combines image areas into colored blocks. |
| Dot matrix      | Renders the image with green dots on a dark background. |
| Glitch          | Shifts color channels and image rows. |
| Stained glass   | Divides the image into colored, glass-like cells. |
| Pop art         | Maps image brightness to a bold, limited palette. |
| Game Boy        | Uses a pixelated, four-shade green palette. |
| Thread scribble | Adds colorful thread-like strokes over the image. |
| Tetris blocks   | Builds a beveled block effect from the image colors. |

Image effects support PNG downloads. Use the effect-strength slider to adjust
the selected effect and the Zoom slider to change the preview size.

## Run locally

### Requirements

The project uses Vite 8, which requires Node.js `^20.19.0` or `>=22.12.0`.
npm is included with Node.js.

Check your installed versions:

```bash
node -v
npm -v
```

### Install dependencies

```bash
git clone https://github.com/souravkh/el-sy.git
cd el-sy
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Build and preview

Create a production build in `dist/`:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Run the linter

```bash
npm run lint
```

## Project structure

```text
el-sy/
├── public/                         # Static assets
├── src/
│   ├── feature/asciiimagechanger/
│   │   ├── components/             # Canvas, controls, and animated backgrounds
│   │   ├── hooks/                  # Image loading and rendering state
│   │   ├── utils/                  # ASCII grid, color, and export helpers
│   │   ├── AsciiArtConverter.tsx   # Main studio component
│   │   └── types.ts                # Shared ASCII data types
│   ├── lenses/                     # Image effect implementations
│   ├── App.tsx                     # Application root
│   ├── App.css                     # Studio layout and component styles
│   ├── index.css                   # Global styles
│   └── main.tsx                    # Application entry point
├── index.html
├── package.json
└── vite.config.ts
```

## Tech stack

* React 19 for the user interface
* TypeScript for application code
* Vite 8 for development and production builds
* Tailwind CSS 4 and regular CSS for styling

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
