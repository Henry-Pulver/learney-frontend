import React from "react";

export function TargetFinderIcon({ classes }: { classes: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={classes}
      fill="currentColor"
      viewBox="0 0 492.589 492.589"
    >
      <g>
        <path
          d="M468.467,222.168h-28.329c-9.712-89.679-80.46-161.18-169.71-172.258V24.135c0-13.338-10.791-24.134-24.134-24.134
		c-13.311,0-24.117,10.796-24.117,24.134V49.91C132.924,60.988,62.177,132.488,52.482,222.168H24.153
		C10.806,222.168,0,232.964,0,246.286c0,13.336,10.806,24.132,24.153,24.132h29.228c12.192,86.816,81.551,155.4,168.797,166.229
		v31.804c0,13.336,10.806,24.135,24.117,24.135c13.343,0,24.134-10.799,24.134-24.135v-31.804
		c87.228-10.829,156.607-79.413,168.775-166.229h29.264c13.33,0,24.122-10.796,24.122-24.132
		C492.589,232.964,481.797,222.168,468.467,222.168z M246.294,398.093c-85.345,0-154.804-69.453-154.804-154.813
		c0-85.363,69.459-154.813,154.804-154.813c85.376,0,154.823,69.45,154.823,154.813
		C401.117,328.639,331.671,398.093,246.294,398.093z"
        />
        <path
          d="M246.294,176.93c-36.628,0-66.34,29.704-66.34,66.349c0,36.635,29.711,66.349,66.34,66.349
		c36.66,0,66.34-29.713,66.34-66.349C312.634,206.635,282.955,176.93,246.294,176.93z"
        />
      </g>
    </svg>
  );
}

export function NextArrow() {
  return (
    <svg
      className="ml-1 h-5 w-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PrevArrow() {
  return (
    <svg
      className="mr-1 h-5 w-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function TrophyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="icon icon-tabler icon-tabler-trophy"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="7" y1="4" x2="17" y2="4" />
      <path d="M17 4v8a5 5 0 0 1 -10 0v-8" />
      <circle cx="5" cy="9" r="2" />
      <circle cx="19" cy="9" r="2" />
    </svg>
  );
}

export function BoltIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pl-1.5"
    >
      <path
        d="M8.8335 1.25V6.5H14.6668L7.16683 14.75V9.5H1.3335L8.8335 1.25Z"
        stroke="#3F3F46"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
