/**
 * Generates a beautiful, deterministic custom vector SVG avatar as a data URI.
 * Built with vibrant gradients, clean geometry, and high-contrast monograms.
 */
export function getAvatarSvg(name: string, email?: string): string {
  const seed = (name || email || 'User').trim();
  
  // Simple deterministic hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Refined palette of vibrant, professional modern gradients
  const gradients = [
    { from: '#4F46E5', to: '#06B6D4', text: '#FFFFFF' }, // Indigo -> Cyan
    { from: '#EC4899', to: '#8B5CF6', text: '#FFFFFF' }, // Pink -> Violet
    { from: '#10B981', to: '#3B82F6', text: '#FFFFFF' }, // Emerald -> Blue
    { from: '#F59E0B', to: '#EF4444', text: '#FFFFFF' }, // Amber -> Red
    { from: '#6366F1', to: '#A855F7', text: '#FFFFFF' }, // Indigo -> Purple
    { from: '#00F2FE', to: '#4FACFE', text: '#0F172A' }, // Bright Ice -> Deep Blue (Dark text)
    { from: '#FF0844', to: '#FFB199', text: '#FFFFFF' }, // Red -> Peach
    { from: '#11998e', to: '#38ef7d', text: '#FFFFFF' }, // Mint -> Emerald
    { from: '#FC466B', to: '#3F5EFB', text: '#FFFFFF' }, // Strawberry -> Cosmic Blue
  ];

  const paletteIndex = Math.abs(hash) % gradients.length;
  const { from, to, text } = gradients[paletteIndex];

  // Pick a pattern style deterministically
  const patternType = Math.abs(hash >> 2) % 4;
  const rotation = Math.abs(hash >> 4) % 360;

  // Extract up to 2 uppercase initials
  const initials = seed
    .split(/\s+/)
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || seed.substring(0, 2).toUpperCase() || 'U';

  // SVG graphic layers for depth and design value
  let geometricLayers = '';
  if (patternType === 0) {
    // Elegant intersecting arcs and bubble circles
    geometricLayers = `
      <circle cx="60" cy="60" r="45" fill="none" stroke="white" stroke-width="2" stroke-opacity="0.12" />
      <circle cx="25" cy="30" r="18" fill="white" fill-opacity="0.08" />
      <path d="M-10,120 Q60,50 130,120 Z" fill="white" fill-opacity="0.15" />
    `;
  } else if (patternType === 1) {
    // Dynamic abstract structural vectors (isometric style)
    geometricLayers = `
      <rect x="20" y="20" width="80" height="80" rx="40" transform="rotate(${rotation} 60 60)" fill="white" fill-opacity="0.06" />
      <path d="M120,0 L0,120 L120,120 Z" fill="white" fill-opacity="0.18" />
      <circle cx="60" cy="60" r="32" fill="none" stroke="white" stroke-width="4" stroke-opacity="0.1" />
    `;
  } else if (patternType === 2) {
    // Waves and concentric orbits
    geometricLayers = `
      <circle cx="60" cy="60" r="50" stroke="white" stroke-width="3" stroke-dasharray="6 4" stroke-opacity="0.15" fill="none" />
      <circle cx="60" cy="60" r="36" stroke="white" stroke-width="1.5" stroke-opacity="0.2" fill="none" />
      <path d="M15,60 C40,25 80,95 105,60" stroke="white" stroke-width="6" stroke-linecap="round" stroke-opacity="0.15" fill="none" />
    `;
  } else {
    // Minimal geometric alignment
    geometricLayers = `
      <line x1="0" y1="0" x2="120" y2="120" stroke="white" stroke-width="6" stroke-opacity="0.12" />
      <line x1="120" y1="0" x2="0" y2="120" stroke="white" stroke-width="6" stroke-opacity="0.12" />
      <circle cx="60" cy="60" r="40" fill="white" fill-opacity="0.08" />
      <circle cx="60" cy="60" r="28" fill="white" fill-opacity="0.15" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="avatar-grad-${paletteIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
        <clipPath id="circle-clip">
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>
      <g clip-path="url(#circle-clip)">
        <rect width="120" height="120" fill="url(#avatar-grad-${paletteIndex})" />
        ${geometricLayers}
        <text x="50%" y="54%" 
              dominant-baseline="middle" 
              text-anchor="middle" 
              fill="${text}" 
              font-family="'Inter', -apple-system, sans-serif" 
              font-size="44" 
              font-weight="700" 
              letter-spacing="-1.5px">
          ${initials}
        </text>
      </g>
    </svg>
  `.trim().replace(/\s+/g, ' ');

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
