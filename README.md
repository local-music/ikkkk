PHOTOBOOK STUDIO — ORIGINAL CONFIGURATOR

HOW TO USE
1. Unzip the folder.
2. Upload index.html, style.css and app.js to the root of a GitHub Pages repository.
3. Open the published website. The live 3D preview loads Three.js from jsDelivr, so the viewer requires internet access.
4. Change photo format, page count, colours, title and clearances.
5. Click Download .SCAD file. Open the downloaded file in OpenSCAD.
6. Press F6 to render. Change PART near the top of the SCAD file to export individual STL components.

WHAT THIS VERSION DOES
- A working web configurator with live 3D preview and orbit/zoom controls.
- Custom photo dimensions, 2–20 pages, opening direction, colours, cover title and print clearances.
- Generates a 3MF package with separate coloured mesh parts using the chosen settings.

IMPORTANT ENGINEERING STATUS
This is an original design prototype, not a validated production model. The web preview is illustrative and does not claim to be a precise print simulation. The generated CAD still needs mechanical review and physical testing. In particular, hinge knuckle engagement, pocket opening/retention, cover-to-page articulation and print clearances must be validated before printing a full book or selling it. This version exports a standards-based 3MF package, but it has not been tested in Bambu Studio. Geometry is still a simplified prototype and must not be treated as production-ready.

For a P1S, use a 0.4 mm nozzle and inspect the rendered STL in Bambu Studio. Start with a single page and hinge test coupon.
