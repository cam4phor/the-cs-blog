import { PluginAPI } from "tailwindcss/types/config";
import path from "path";
import fs from "fs";

const bootstrapIconsPlugin = (api: PluginAPI): void => {
  const { addUtilities } = api;

  // Path to the Bootstrap Icons folder
  const iconsPath = path.resolve("node_modules/bootstrap-icons/icons");
  // Read all SVG files in the icons directory
  const files = fs
    .readdirSync(iconsPath)
    .filter((file) => file.endsWith(".svg"));

  // Generate utilities for each icon
  const utilities = files.reduce(
    (acc: Record<string, Record<string, string>>, file) => {
      const iconName = file.replace(".svg", ""); // Get icon name without .svg
      const svgContent = fs.readFileSync(path.join(iconsPath, file), "utf-8");
      // Convert SVG content to a data URL
      const svgDataUrl = `url('data:image/svg+xml;utf8,${encodeURIComponent(
        svgContent
      )}')`;

      // Create a Tailwind utility class
      acc[`.icon-${iconName}`] = {
        backgroundImage: svgDataUrl,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        display: "flex",
        width: "18px", // Default size, adjustable with Tailwind utilities
        height: "18px", // Default size, adjustable with Tailwind utilities
        marginTop: "2px", // Default spacing, adjustable with Tailwind utilities
        verticalAlign: "-0.25em", // Default spacing, adjustable with Tailwind utilities
        opacity: "0.8", // Default opacity, adjustable with Tailwind utilities
      };

      return acc;
    },
    {}
  );
  // Add the utilities to Tailwind CSS
  addUtilities(utilities);
}

export default bootstrapIconsPlugin;