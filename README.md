# MICRESS Extension for Visual Studio Code

Language support for MICRESS driving files (`.dri`) in Visual Studio Code.

## Features

- Syntax highlighting for MICRESS driving files.
- Section navigation through the **Outline** view.
- Folding of MICRESS section blocks.
- Optional horizontal separator lines between sections.

## Getting Started

1. Install the extension from the Visual Studio Code Marketplace.
2. Open a MICRESS driving file (`.dri`).
3. The file will automatically be recognized as **MICRESS**.
4. Use the **Outline** view to navigate between sections.
5. Fold and expand sections to focus on the relevant part of the driving file.

## Example

```py
# Geometry
# ========
# Grid size?
# (for 2D calculations: CellsY=1, for 1D calculations: CellsX=1, CellsY=1)
# Cells in X-direction (CellsX):
500
# Cells in Y-direction (CellsY):
1
# Cells in Z-direction (CellsZ):
1500
# Cell dimension (grid spacing in micrometers):
# (optionally followed by rescaling factor for the output in the form of '3/4')
1.0000
```

## Configuration

The extension provides the following setting:

| Setting                       | Description                                               | Default |
| ----------------------------- | --------------------------------------------------------- | ------- |
| `micress.decorations.enabled` | Draw horizontal separator lines between MICRESS sections. | `true`  |

## Requirements

- Visual Studio Code 1.100 or later.

## Release Notes

### 0.1.0

- Initial release.
- Syntax highlighting for MICRESS driving files.
- Outline navigation support.
- Section folding.
- Optional section separator decorations.

## Contributing

Issues and feature requests are welcome. Please open an issue in the project repository.

## About MICRESS

MICRESS® is a simulation software package for microstructure evolution developed by ACCESS e.V. This extension provides editing support for MICRESS driving files within Visual Studio Code.
