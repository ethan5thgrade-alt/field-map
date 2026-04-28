"use client";

import ContourLines from "./ContourLines";
import CursorGlow from "./CursorGlow";
import CompassRose from "./CompassRose";

/**
 * All four background layers combined:
 * 1. Contour lines (SVG, animated)
 * 2. Cursor lantern glow
 * 3. Paper grain (CSS, in globals.css via .paper-grain class)
 * 4. Compass rose flourish
 */
export default function InteractiveWallpaper() {
  return (
    <>
      <ContourLines />
      <CursorGlow />
      <CompassRose />
      <div className="paper-grain" />
    </>
  );
}
