/**
 * Generates deterministic, beautifully styled, and responsive representational vector SVGs
 * as fallback placeholders for different municipal issue categories.
 * Designed with a premium, smooth, iOS/macOS-style widget aesthetic (glassmorphism, 
 * vibrant gradients, soft shadows, and clean minimalist geometry).
 */
export function getIssuePlaceholderSvg(category: string): string {
  const normalized = (category || 'Other').toLowerCase().trim();

  let svgContent = '';

  if (normalized.includes('pothole') || normalized === 'pothole') {
    // Premium iOS Pothole placeholder
    // Cosmic dark graphite gradient with warning amber glowing rings and neon-orange construction geometry
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
        <defs>
          <linearGradient id="pothole-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1E2022" />
            <stop offset="60%" stop-color="#121314" />
            <stop offset="100%" stop-color="#0A0A0B" />
          </linearGradient>
          <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FF9500" />
            <stop offset="100%" stop-color="#FF5E00" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.02" />
          </linearGradient>
          <filter id="ios-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45" />
          </filter>
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Premium Dark Background -->
        <rect width="600" height="400" fill="url(#pothole-bg)" />

        <!-- Aesthetic Grid Pattern (Apple-style design lines) -->
        <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1">
          <line x1="100" y1="0" x2="100" y2="400" />
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="300" y1="0" x2="300" y2="400" />
          <line x1="400" y1="0" x2="400" y2="400" />
          <line x1="500" y1="0" x2="500" y2="400" />
          <line x1="0" y1="100" x2="600" y2="100" />
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="0" y1="300" x2="600" y2="300" />
        </g>

        <!-- Ambient Glow behind the sign -->
        <circle cx="300" cy="180" r="120" fill="#FF9500" fill-opacity="0.08" filter="url(#neon-glow)" />

        <!-- Concentric Smooth Ripples representing road impact waves -->
        <ellipse cx="300" cy="220" rx="200" ry="60" fill="none" stroke="#FF9500" stroke-width="1.5" stroke-opacity="0.1" />
        <ellipse cx="300" cy="220" rx="140" ry="42" fill="none" stroke="#FF9500" stroke-width="2" stroke-opacity="0.2" />
        <ellipse cx="300" cy="220" rx="80" ry="24" fill="none" stroke="url(#accent-grad)" stroke-width="3" stroke-opacity="0.4" />

        <!-- 3D Smooth Crater -->
        <ellipse cx="300" cy="220" rx="40" ry="12" fill="#0A0A0B" stroke="#2C2C2E" stroke-width="3" />

        <!-- Modern Premium Warning Sign (Squircle widget design) -->
        <g transform="translate(300, 150)" filter="url(#ios-shadow)">
          <!-- Glassmorphic backing plate -->
          <rect x="-65" y="-65" width="130" height="130" rx="36" fill="url(#glass-grad)" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
          
          <!-- Inner Orange Warning Ring -->
          <circle cx="0" cy="0" r="42" fill="none" stroke="url(#accent-grad)" stroke-width="4.5" stroke-linecap="round" filter="url(#neon-glow)" />

          <!-- Minimal Warning Cone Icon -->
          <g transform="translate(0, -2)">
            <!-- Cone Base -->
            <path d="M-22,20 L22,20" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
            <!-- Cone Body -->
            <path d="M-15,14 L15,14 L6,-16 L-6,-16 Z" fill="url(#accent-grad)" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round" />
            <!-- White Reflective Stripes -->
            <polygon points="-11,4 11,4 8,-4 -8,-4" fill="#FFFFFF" />
          </g>
        </g>

        <!-- Clean iOS Bottom Metadata Ribbon -->
        <rect x="180" y="325" width="240" height="34" rx="17" fill="#1C1C1E" fill-opacity="0.75" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1" />
        <text x="300" y="347" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="12" font-weight="600" fill="#FF9500" text-anchor="middle" letter-spacing="1.5">
          POTHOLE &amp; ROAD DAMAGE
        </text>
      </svg>
    `;
  } else if (normalized.includes('water') || normalized === 'water') {
    // Premium iOS Water Leak / Overflow placeholder
    // Vivid ocean/sky blue gradient, glassy dropping beads, and smooth minimalist wave crests
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
        <defs>
          <linearGradient id="water-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0A5075" />
            <stop offset="50%" stop-color="#022E47" />
            <stop offset="100%" stop-color="#011624" />
          </linearGradient>
          <linearGradient id="drop-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#00D2FF" />
            <stop offset="100%" stop-color="#0066FF" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.03" />
          </linearGradient>
          <filter id="ios-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45" />
          </filter>
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Gradient Background -->
        <rect width="600" height="400" fill="url(#water-bg)" />

        <!-- Aesthetic Grid Pattern -->
        <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1">
          <line x1="100" y1="0" x2="100" y2="400" />
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="300" y1="0" x2="300" y2="400" />
          <line x1="400" y1="0" x2="400" y2="400" />
          <line x1="500" y1="0" x2="500" y2="400" />
          <line x1="0" y1="100" x2="600" y2="100" />
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="0" y1="300" x2="600" y2="300" />
        </g>

        <!-- Ambient Blue/Teal Light Leak -->
        <circle cx="300" cy="180" r="130" fill="#00D2FF" fill-opacity="0.07" filter="url(#neon-glow)" />

        <!-- Waves with Beautiful Smooth Bezier Curves -->
        <path d="M0 310 C 150 280, 200 340, 300 310 C 400 280, 450 340, 600 310 L 600 400 L 0 400 Z" fill="#0066FF" fill-opacity="0.15" />
        <path d="M0 335 C 120 315, 240 355, 360 335 C 480 315, 540 345, 600 335 L 600 400 L 0 400 Z" fill="#00D2FF" fill-opacity="0.2" />

        <!-- Ripple rings -->
        <ellipse cx="300" cy="270" rx="160" ry="40" fill="none" stroke="#00D2FF" stroke-width="1.5" stroke-opacity="0.1" />
        <ellipse cx="300" cy="270" rx="100" ry="25" fill="none" stroke="#00D2FF" stroke-width="2.5" stroke-opacity="0.25" filter="url(#neon-glow)" />

        <!-- Modern droplet inside high-end Squircle layout -->
        <g transform="translate(300, 150)" filter="url(#ios-shadow)">
          <!-- Glass backing -->
          <rect x="-65" y="-65" width="130" height="130" rx="36" fill="url(#glass-grad)" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          
          <!-- Outer glowing circle -->
          <circle cx="0" cy="0" r="42" fill="none" stroke="#00D2FF" stroke-width="1.5" stroke-opacity="0.4" />
          
          <!-- Giant iOS Droplet Glyph -->
          <g transform="translate(0, 5)">
            <path d="M0,-42 C22,-14 26,14 0,30 C-26,14 -22,-14 0,-42 Z" fill="url(#drop-grad)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
            <!-- Droplet Shimmer Effect -->
            <path d="M-8,-14 C-15,0 -12,12 -4,18 C-10,12 -12,2 -8,-14 Z" fill="#FFFFFF" fill-opacity="0.35" />
          </g>
        </g>

        <!-- Bottom Metadata Badge -->
        <rect x="180" y="325" width="240" height="34" rx="17" fill="#1C1C1E" fill-opacity="0.75" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1" />
        <text x="300" y="347" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="12" font-weight="600" fill="#00D2FF" text-anchor="middle" letter-spacing="1.5">
          WATER LEAK &amp; UTILITIES
        </text>
      </svg>
    `;
  } else if (normalized.includes('light') || normalized === 'light') {
    // Premium iOS Streetlight Failure / Light Outage placeholder
    // Cosmic midnight purple to starry black, sleek minimalist neon lightning-struck warning
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
        <defs>
          <linearGradient id="night-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1B1230" />
            <stop offset="60%" stop-color="#0E091A" />
            <stop offset="100%" stop-color="#05030A" />
          </linearGradient>
          <linearGradient id="yellow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFCC00" />
            <stop offset="100%" stop-color="#FF9500" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.02" />
          </linearGradient>
          <filter id="ios-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45" />
          </filter>
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Gradient Background -->
        <rect width="600" height="400" fill="url(#night-bg)" />

        <!-- Aesthetic Grid Pattern -->
        <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1">
          <line x1="100" y1="0" x2="100" y2="400" />
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="300" y1="0" x2="300" y2="400" />
          <line x1="400" y1="0" x2="400" y2="400" />
          <line x1="500" y1="0" x2="500" y2="400" />
          <line x1="0" y1="100" x2="600" y2="100" />
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="0" y1="300" x2="600" y2="300" />
        </g>

        <!-- Ambient Violet Warning Light Leak -->
        <circle cx="300" cy="180" r="130" fill="#AF52DE" fill-opacity="0.07" filter="url(#neon-glow)" />

        <!-- Beautiful Constellation Lines in Background -->
        <path d="M100 80 L180 160 L240 100 L350 200" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="1.5" stroke-dasharray="4 4" fill="none" />
        <path d="M420 120 L500 80 L540 180" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="1.5" stroke-dasharray="4 4" fill="none" />
        
        <!-- Elegant Moon Crescent -->
        <path d="M520 60 A 30 30 0 1 0 550 90 A 24 24 0 1 1 520 60 Z" fill="#FFFFFF" fill-opacity="0.12" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1" />

        <!-- Glowing unlit/fault utility icon inside premium Squircle layout -->
        <g transform="translate(300, 150)" filter="url(#ios-shadow)">
          <!-- Glass backing -->
          <rect x="-65" y="-65" width="130" height="130" rx="36" fill="url(#glass-grad)" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          
          <!-- Outer glowing circle representing warning focus -->
          <circle cx="0" cy="0" r="42" fill="none" stroke="url(#yellow-grad)" stroke-width="3" stroke-opacity="0.4" filter="url(#neon-glow)" />

          <!-- Minimalist iOS Broken Lightbulb Icon -->
          <g transform="translate(0, -6)">
            <!-- Glass dome -->
            <path d="M-18,-10 C-18,-24 -10,-32 0,-32 C10,-32 18,-24 18,-10 C18,-2 10,6 10,12 L-10,12 C-10,6 -18,-2 -18,-10 Z" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
            <!-- Thread Base -->
            <path d="M-7,16 L7,16 M-5,21 L5,21 M-3,26 L3,26" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
            
            <!-- Sleek Neon Lightning bolt representing failure/spark -->
            <path d="M-4,-22 L6,-12 L-2,-8 L4,2" fill="none" stroke="url(#yellow-grad)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#neon-glow)" />
          </g>
        </g>

        <!-- Bottom Metadata Badge -->
        <rect x="180" y="325" width="240" height="34" rx="17" fill="#1C1C1E" fill-opacity="0.75" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1" />
        <text x="300" y="347" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="12" font-weight="600" fill="#FFCC00" text-anchor="middle" letter-spacing="1.5">
          STREETLIGHT FAILURE
        </text>
      </svg>
    `;
  } else if (normalized.includes('garbage') || normalized.includes('waste') || normalized === 'waste') {
    // Premium iOS Waste & Trash Dump placeholder
    // Fresh Forest green & emerald gradient representing environment care, glossy trash/recycle hazard system
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
        <defs>
          <linearGradient id="waste-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0E3021" />
            <stop offset="60%" stop-color="#051C11" />
            <stop offset="100%" stop-color="#020E08" />
          </linearGradient>
          <linearGradient id="green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34C759" />
            <stop offset="100%" stop-color="#248A3D" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.02" />
          </linearGradient>
          <filter id="ios-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45" />
          </filter>
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Gradient Background -->
        <rect width="600" height="400" fill="url(#waste-bg)" />

        <!-- Aesthetic Grid Pattern -->
        <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1">
          <line x1="100" y1="0" x2="100" y2="400" />
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="300" y1="0" x2="300" y2="400" />
          <line x1="400" y1="0" x2="400" y2="400" />
          <line x1="500" y1="0" x2="500" y2="400" />
          <line x1="0" y1="100" x2="600" y2="100" />
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="0" y1="300" x2="600" y2="300" />
        </g>

        <!-- Ambient Green Healing Light Leak -->
        <circle cx="300" cy="180" r="135" fill="#34C759" fill-opacity="0.07" filter="url(#neon-glow)" />

        <!-- Organic Smooth Layered Leaves in Background representing restoration -->
        <path d="M150 280 C180 250, 240 250, 270 280 Z" fill="#34C759" fill-opacity="0.06" />
        <path d="M330 280 C360 250, 420 250, 450 280 Z" fill="#34C759" fill-opacity="0.06" />

        <!-- Glowing Environment icon inside premium Squircle layout -->
        <g transform="translate(300, 150)" filter="url(#ios-shadow)">
          <!-- Glass backing -->
          <rect x="-65" y="-65" width="130" height="130" rx="36" fill="url(#glass-grad)" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          
          <!-- Outer glowing circle indicating environmental action -->
          <circle cx="0" cy="0" r="42" fill="none" stroke="url(#green-grad)" stroke-width="3" stroke-opacity="0.35" filter="url(#neon-glow)" />

          <!-- Modern iOS-style minimalist Trash/Eco canister glyph -->
          <g transform="translate(0, -6)">
            <!-- Canister Container -->
            <rect x="-14" y="-12" width="28" height="34" rx="6" fill="none" stroke="#FFFFFF" stroke-width="3" />
            <!-- Lid -->
            <path d="M-18,-12 L18,-12" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
            <path d="M-6,-12 L-4,-17 L4,-17 L6,-12" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
            
            <!-- Inside Glowing Eco symbol (Leaf or warning) -->
            <circle cx="0" cy="5" r="4" fill="url(#green-grad)" filter="url(#neon-glow)" />
            <path d="M-4,11 L4,11" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
            <path d="M0,0 L0,10" stroke="#FFFFFF" stroke-width="2" />
          </g>
        </g>

        <!-- Bottom Metadata Badge -->
        <rect x="180" y="325" width="240" height="34" rx="17" fill="#1C1C1E" fill-opacity="0.75" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1" />
        <text x="300" y="347" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="12" font-weight="600" fill="#30D158" text-anchor="middle" letter-spacing="1.5">
          GARBAGE &amp; WASTE CLEANUP
        </text>
      </svg>
    `;
  } else if (normalized.includes('infrastructure') || normalized === 'infrastructure') {
    // Premium iOS Infrastructure Fault placeholder
    // Industrial steel blue/cobalt blueprint grid background with glowing hazard sign and clean vector framework
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
        <defs>
          <linearGradient id="infra-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#141E30" />
            <stop offset="60%" stop-color="#0E1624" />
            <stop offset="100%" stop-color="#05080E" />
          </linearGradient>
          <linearGradient id="red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF453A" />
            <stop offset="100%" stop-color="#FF3B30" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.02" />
          </linearGradient>
          <filter id="ios-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45" />
          </filter>
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Gradient Background -->
        <rect width="600" height="400" fill="url(#infra-bg)" />

        <!-- Technical Architect Grid Blueprint -->
        <g stroke="#3A82F6" stroke-opacity="0.06" stroke-width="1">
          <line x1="50" y1="0" x2="50" y2="400" />
          <line x1="100" y1="0" x2="100" y2="400" />
          <line x1="150" y1="0" x2="150" y2="400" />
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="250" y1="0" x2="250" y2="400" />
          <line x1="300" y1="0" x2="300" y2="400" />
          <line x1="350" y1="0" x2="350" y2="400" />
          <line x1="400" y1="0" x2="400" y2="400" />
          <line x1="450" y1="0" x2="450" y2="400" />
          <line x1="500" y1="0" x2="500" y2="400" />
          <line x1="550" y1="0" x2="550" y2="400" />
          
          <line x1="0" y1="50" x2="600" y2="50" />
          <line x1="0" y1="100" x2="600" y2="100" />
          <line x1="0" y1="150" x2="600" y2="150" />
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="0" y1="250" x2="600" y2="250" />
          <line x1="0" y1="300" x2="600" y2="300" />
          <line x1="0" y1="350" x2="600" y2="350" />
        </g>

        <!-- Ambient Crimson Danger Light Leak -->
        <circle cx="300" cy="180" r="130" fill="#FF453A" fill-opacity="0.06" filter="url(#neon-glow)" />

        <!-- Abstract smooth structural scaffolding outline in background -->
        <polygon points="100,340 300,140 500,340" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="2.5" />
        <line x1="100" y1="340" x2="500" y2="340" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="2.5" />

        <!-- Glowing Construction/Hazard sign inside premium Squircle layout -->
        <g transform="translate(300, 150)" filter="url(#ios-shadow)">
          <!-- Glass backing -->
          <rect x="-65" y="-65" width="130" height="130" rx="36" fill="url(#glass-grad)" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          
          <!-- Outer glowing indicator indicating structural alert -->
          <circle cx="0" cy="0" r="42" fill="none" stroke="url(#red-grad)" stroke-width="3" stroke-opacity="0.4" filter="url(#neon-glow)" />

          <!-- Modern iOS minimalist Architect T-Square/Structural Crane warning glyph -->
          <g transform="translate(0, -6)">
            <!-- Triangle hazard outline -->
            <polygon points="0,-24 -20,12 20,12" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
            <!-- Inside Warning Exclamation -->
            <line x1="0" y1="-10" x2="0" y2="1" stroke="url(#red-grad)" stroke-width="3" stroke-linecap="round" filter="url(#neon-glow)" />
            <circle cx="0" cy="7" r="2" fill="#FFFFFF" />
          </g>
        </g>

        <!-- Bottom Metadata Badge -->
        <rect x="180" y="325" width="240" height="34" rx="17" fill="#1C1C1E" fill-opacity="0.75" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1" />
        <text x="300" y="347" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="12" font-weight="600" fill="#FF453A" text-anchor="middle" letter-spacing="1.5">
          INFRASTRUCTURE FAULT
        </text>
      </svg>
    `;
  } else {
    // Premium iOS General Other Community Issue placeholder
    // Spectacular Royal Purple to Twilight Pink Sunrise gradient with celestial nodes
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
        <defs>
          <linearGradient id="other-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2D114C" />
            <stop offset="60%" stop-color="#160829" />
            <stop offset="100%" stop-color="#090312" />
          </linearGradient>
          <linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#BF5AF2" />
            <stop offset="100%" stop-color="#FF2D55" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.02" />
          </linearGradient>
          <filter id="ios-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45" />
          </filter>
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Gradient Background -->
        <rect width="600" height="400" fill="url(#other-bg)" />

        <!-- Aesthetic Grid Pattern -->
        <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1">
          <line x1="100" y1="0" x2="100" y2="400" />
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="300" y1="0" x2="300" y2="400" />
          <line x1="400" y1="0" x2="400" y2="400" />
          <line x1="500" y1="0" x2="500" y2="400" />
          <line x1="0" y1="100" x2="600" y2="100" />
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="0" y1="300" x2="600" y2="300" />
        </g>

        <!-- Dynamic Ambient Twilight Light Leak -->
        <circle cx="300" cy="180" r="140" fill="#FF2D55" fill-opacity="0.06" filter="url(#neon-glow)" />

        <!-- Sophisticated Glowing Network Nodes constellation in background -->
        <g stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="1.5">
          <line x1="150" y1="150" x2="300" y2="80" />
          <line x1="300" y1="80" x2="450" y2="150" />
          <line x1="450" y1="150" x2="370" y2="280" />
          <line x1="370" y1="280" x2="230" y2="280" />
          <line x1="230" y1="280" x2="150" y2="150" />
          <line x1="300" y1="80" x2="300" y2="280" />
        </g>
        <circle cx="150" cy="150" r="4" fill="#BF5AF2" />
        <circle cx="300" cy="80" r="4" fill="#FF2D55" />
        <circle cx="450" cy="150" r="4" fill="#FF9500" />
        <circle cx="370" cy="280" r="4" fill="#00D2FF" />
        <circle cx="230" cy="280" r="4" fill="#30D158" />

        <!-- Glowing general community constellation icon inside premium Squircle layout -->
        <g transform="translate(300, 150)" filter="url(#ios-shadow)">
          <!-- Glass backing -->
          <rect x="-65" y="-65" width="130" height="130" rx="36" fill="url(#glass-grad)" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          
          <!-- Outer glowing circle representing multi-purpose alerts -->
          <circle cx="0" cy="0" r="42" fill="none" stroke="url(#purple-grad)" stroke-width="3" stroke-opacity="0.4" filter="url(#neon-glow)" />

          <!-- Minimalist iOS Chat Bubble with Exclamation symbol -->
          <g transform="translate(0, -6)">
            <!-- Speech bubble outline -->
            <path d="M-16,-14 C-16,-22 -8,-24 0,-24 C8,-24 16,-22 16,-14 C16,-6 8,-4 0,-4 C-4,-4 -12,-2 -16,2 C-15,-2 -16,-10 -16,-14 Z" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
            <!-- Inside Exclamation exclamation sign -->
            <line x1="0" y1="-17" x2="0" y2="-11" stroke="url(#purple-grad)" stroke-width="3" stroke-linecap="round" filter="url(#neon-glow)" />
            <circle cx="0" cy="-7" r="2.2" fill="#FFFFFF" />
          </g>
        </g>

        <!-- Bottom Metadata Badge -->
        <rect x="180" y="325" width="240" height="34" rx="17" fill="#1C1C1E" fill-opacity="0.75" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1" />
        <text x="300" y="347" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="12" font-weight="600" fill="#BF5AF2" text-anchor="middle" letter-spacing="1.5">
          COMMUNITY &amp; CIVIL OUTAGE
        </text>
      </svg>
    `;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim().replace(/\s+/g, ' '))}`;
}
