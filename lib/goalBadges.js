const tailwindColors = {
  red: [
    [244, 67, 54],
    "bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900",
  ],
  pink: [
    [233, 30, 99],
    "bg-pink-100 text-pink-800 dark:bg-pink-200 dark:text-pink-900",
  ],
  purple: [
    [156, 39, 176],
    "bg-purple-100 text-purple-800 dark:bg-purple-200 dark:text-purple-900",
  ],
  "deep-purple": [
    [103, 58, 183],
    "bg-deep-purple-100 text-deep-purple-800 dark:bg-deep-purple-200 dark:text-deep-purple-900",
  ],
  indigo: [
    [63, 81, 181],
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-200 dark:text-indigo-900",
  ],
  blue: [
    [33, 150, 243],
    "bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900",
  ],
  "light-blue": [
    [3, 169, 244],
    "bg-light-blue-100 text-light-blue-800 dark:bg-light-blue-200 dark:text-light-blue-900",
  ],
  cyan: [
    [0, 188, 212],
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-200 dark:text-cyan-900",
  ],
  teal: [
    [0, 150, 136],
    "bg-teal-100 text-teal-800 dark:bg-teal-200 dark:text-teal-900",
  ],
  green: [
    [76, 175, 80],
    "bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900",
  ],
  "light-green": [
    [139, 195, 74],
    "bg-light-green-100 text-light-green-800 dark:bg-light-green-200 dark:text-light-green-900",
  ],
  lime: [
    [205, 220, 57],
    "bg-lime-100 text-lime-800 dark:bg-lime-200 dark:text-lime-900",
  ],
  yellow: [
    [255, 235, 59],
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900",
  ],
  amber: [
    [255, 193, 7],
    "bg-amber-100 text-amber-800 dark:bg-amber-200 dark:text-amber-900",
  ],
  orange: [
    [255, 152, 0],
    "bg-orange-100 text-orange-800 dark:bg-orange-200 dark:text-orange-900",
  ],
  "deep-orange": [
    [255, 87, 34],
    "bg-deep-orange-100 text-deep-orange-800 dark:bg-deep-orange-200 dark:text-deep-orange-900",
  ],
  brown: [
    [121, 85, 72],
    "bg-brown-100 text-brown-800 dark:bg-brown-200 dark:text-brown-900",
  ],
  gray: [
    [158, 158, 158],
    "bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-900",
  ],
  "blue-gray": [
    [96, 125, 139],
    "bg-blue-gray-100 text-blue-gray-800 dark:bg-blue-gray-200 dark:text-blue-gray-900",
  ],
};

export function getBadgeColour(parentId, mapJson) {
  let badgeColour = null;
  mapJson.nodes.forEach((node) => {
    if (node.data.nodetype === "field" && node.data.id === parentId) {
      badgeColour = node.data.colour;
    }
  });
  if (badgeColour === null)
    throw new Error(`Topic with ID=${parentId} isn't in the map!`);
  return badgeColour;
}

export function getBadgeTailwindCSSFromColour(hexColor) {
  let closestColourDist = Infinity;
  let closestColourTailwindCSS = null;
  Object.entries(tailwindColors).forEach(([color, [rgb, tailwindCSS]]) => {
    const dist = euclideanDistance(rgb, hexToRGB(hexColor));
    if (dist < closestColourDist) {
      closestColourTailwindCSS = tailwindCSS;
      closestColourDist = dist;
    }
  });
  console.log(closestColourTailwindCSS);
  return closestColourTailwindCSS;
}

function euclideanDistance(rgb1, rgb2) {
  const differences = [rgb1[0] - rgb2[0], rgb1[1] - rgb2[1], rgb1[2] - rgb2[2]];
  return differences.reduce((a, b) => a + b, 0);
}

function hexToRGB(hex) {
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
}
