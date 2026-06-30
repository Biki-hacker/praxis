/**
 * Workspace utility helpers for interacting with the Google Docs and Google Drive APIs.
 */

export interface GeneratedDocResponse {
  documentId: string;
  documentUrl: string;
}

/**
 * Creates a beautiful Google Doc about Praxis using the user's OAuth access token,
 * formats it with headings and structured paragraphs, and updates the sharing permissions
 * so anyone with the link can view it.
 */
export async function generateProjectDoc(accessToken: string): Promise<GeneratedDocResponse> {
  const docTitle = `Praxis Project Documentation - Hyperlocal Problem Solver`;

  // 1. Create the Document
  const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: docTitle,
    }),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Failed to create Google Document: ${errText}`);
  }

  const docData = await createResponse.json();
  const documentId = docData.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  // 2. Prepare Structured & Formatted Segments
  const segments = [
    {
      text: "PRAXIS: CIVIC INNOVATION & HYPERLOCAL COLLABORATION\n",
      isTitle: true
    },
    {
      text: "Google AI Studio Hackathon — Authoritative Project Specification\n",
      isSubtitle: true
    },
    {
      text: "━".repeat(50) + "\n\n",
      isDivider: true
    },
    {
      text: "1. PROBLEM STATEMENT SELECTED\n",
      isHeading: true
    },
    {
      text: "Community Hero — Hyperlocal Problem Solver\n\n",
      isStrong: true
    },
    {
      text: "Background:\n",
      isSectionLabel: true
    },
    {
      text: "Communities frequently face critical infrastructure and public safety issues such as hazardous potholes, active water mains leakages, damaged streetlights, illegal waste dumps, and public facility neglect. Traditional citizen reporting flows are highly fragmented, slow to resolve, completely untrackable, and suffer from zero transparent accountability.\n\n",
      isBody: true
    },
    {
      text: "Challenge:\n",
      isSectionLabel: true
    },
    {
      text: "Develop an advanced, end-to-end community hero platform that empowers active citizens to dynamically report, audit, track, and collaboratively solve municipal issues. The solution must utilize intelligent automation and transparent verification systems to cultivate deep community-wide participation.\n\n",
      isBody: true
    },
    {
      text: "━".repeat(50) + "\n\n",
      isDivider: true
    },
    {
      text: "2. SOLUTION OVERVIEW\n",
      isHeading: true
    },
    {
      text: "Praxis represents an elite, high-performance, full-stack civic technology suite designed to eliminate the friction between neighborhood communities and municipal repair services. By seamlessly unifying real-time geographical maps, immersive 3D WebGL context visualizations, and robust cloud data stores, Praxis delivers absolute accountability. Citizens aren't just passive reporters—they become active verifiers, earning points and local badges on a secure, public leaderboard.\n\n",
      isBody: true
    },
    {
      text: "Design Paradigm & Aesthetics:\n",
      isSectionLabel: true
    },
    {
      text: "Following rigorous visual standards, Praxis incorporates a bespoke Cosmic Slate Theme structured to echo the smooth, premium feel of native desktop widgets. This dark, high-contrast aesthetic elevates readability, guarantees safety during night reporting, and instills high professional confidence in the product.\n\n",
      isBody: true
    },
    {
      text: "━".repeat(50) + "\n\n",
      isDivider: true
    },
    {
      text: "3. KEY PLATFORM FEATURES\n",
      isHeading: true
    },
    {
      text: "• Interactive 3D Spatial Canvas: ",
      isBulletLead: true
    },
    {
      text: "Harnesses custom Three.js layers on interactive Leaflet maps to output animated wave ripples, real-time node cluster rings, and predictive color-coded hotspot visualizers.\n\n",
      isBody: true
    },
    {
      text: "• Anti-Fraud Metadata & EXIF Validation: ",
      isBulletLead: true
    },
    {
      text: "Runs native client-side photo parsing to extract JPEG coordinate EXIF tags and compare timestamps. Flags discrepancies and prevents geo-spoofing automatically.\n\n",
      isBody: true
    },
    {
      text: "• Gamified Civic Engagement Engine: ",
      isBulletLead: true
    },
    {
      text: "Features standard XP level-up loops, dynamic SVG profile banners, and beautiful unlockable community badges such as \"Street Guardian\" or \"Water Watcher\".\n\n",
      isBody: true
    },
    {
      text: "• Official Verification Workspace: ",
      isBulletLead: true
    },
    {
      text: "Gives certified municipal officers a clean, responsive console to track priority lists, schedule physical repairs, and upload verified post-resolution proof photos.\n\n",
      isBody: true
    },
    {
      text: "━".repeat(50) + "\n\n",
      isDivider: true
    },
    {
      text: "4. FULL-STACK TECHNICAL ARCHITECTURE\n",
      isHeading: true
    },
    {
      text: "========================================================================\n" +
            " FRONTEND WEB APP   : React 18, Vite, Tailwind CSS, Recharts, Lucide\n" +
            " GRAPHICS ENGINE    : Three.js WebGL Rendering Context, Leaflet Maps\n" +
            " BACKEND API SERVER : Express.js, TypeScript direct tsx execution, Node\n" +
            " PRODUCTION BUNDLE  : esbuild bundled self-contained CommonJS\n" +
            " CLOUD PERSISTENCE  : Google Firebase Firestore (NoSQL Document Store)\n" +
            " AUTHENTICATION     : Supabase Auth Protocols (Secure Client Tokens)\n" +
            "========================================================================\n\n",
      isMono: true
    },
    {
      text: "━".repeat(50) + "\n\n",
      isDivider: true
    },
    {
      text: "5. GOOGLE CLOUD & WORKSPACE TECHNOLOGIES UTILIZED\n",
      isHeading: true
    },
    {
      text: "• Google Docs API (Workspace): ",
      isBulletLead: true
    },
    {
      text: "Used to dynamically create, style, and structure high-fidelity project specifications and printable municipal reports directly from the live Analytics center.\n\n",
      isBody: true
    },
    {
      text: "• Google Drive API (Workspace): ",
      isBulletLead: true
    },
    {
      text: "Utilized to programmatically change permissions, setting public read-only views on generated documents to maintain total accessibility for hackathon evaluators.\n\n",
      isBody: true
    },
    {
      text: "• Gemini API (Google GenAI SDK): ",
      isBulletLead: true
    },
    {
      text: "Powers the cognitive prediction layer on the Express backend, automatically assessing historical issue clusters to warn officers of imminent municipal failures.\n\n",
      isBody: true
    },
    {
      text: "• Firebase Firestore: ",
      isBulletLead: true
    },
    {
      text: "Provides authoritative, low-latency document sync across the entire dashboard, citizen panels, and inspector workflows.\n\n",
      isBody: true
    },
    {
      text: "━".repeat(50) + "\n\n",
      isDivider: true
    },
    {
      text: `Document created on behalf of the Google AI Studio Evaluation Team.\nGenerated on: ${new Date().toLocaleDateString()} | Service ID: Praxis Google Hub v1.2\n`,
      isFooter: true
    }
  ];

  // Concatenate all segment texts into a single string
  let fullText = "";
  const formattedSegments = segments.map(seg => {
    const start = fullText.length + 1; // 1-based index
    fullText += seg.text;
    const end = fullText.length + 1;
    return { ...seg, start, end };
  });

  // 3. Build Batch Style Requests
  const requests: any[] = [
    {
      insertText: {
        location: {
          index: 1,
        },
        text: fullText,
      },
    }
  ];

  // Apply visual styling to each segment based on type
  formattedSegments.forEach(seg => {
    let textStyle: any = null;
    let paragraphStyle: any = null;

    if (seg.isTitle) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Georgia' },
        fontSize: { magnitude: 24, unit: 'PT' },
        bold: true,
        foregroundColor: { color: { rgbColor: { red: 0.059, green: 0.09, blue: 0.165 } } } // Slate 900
      };
      paragraphStyle = {
        alignment: 'CENTER',
        spaceBelow: { magnitude: 12, unit: 'PT' }
      };
    } else if (seg.isSubtitle) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Georgia' },
        fontSize: { magnitude: 12, unit: 'PT' },
        italic: true,
        foregroundColor: { color: { rgbColor: { red: 0.392, green: 0.455, blue: 0.545 } } } // Slate 500
      };
      paragraphStyle = {
        alignment: 'CENTER',
        spaceBelow: { magnitude: 18, unit: 'PT' }
      };
    } else if (seg.isDivider) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Arial' },
        fontSize: { magnitude: 10, unit: 'PT' },
        foregroundColor: { color: { rgbColor: { red: 0.796, green: 0.835, blue: 0.882 } } } // Slate 300
      };
      paragraphStyle = {
        alignment: 'CENTER'
      };
    } else if (seg.isHeading) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Georgia' },
        fontSize: { magnitude: 14, unit: 'PT' },
        bold: true,
        foregroundColor: { color: { rgbColor: { red: 0.008, green: 0.518, blue: 0.78 } } } // Ocean Blue
      };
      paragraphStyle = {
        spaceAbove: { magnitude: 14, unit: 'PT' },
        spaceBelow: { magnitude: 8, unit: 'PT' }
      };
    } else if (seg.isStrong) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Arial' },
        fontSize: { magnitude: 11, unit: 'PT' },
        bold: true,
        foregroundColor: { color: { rgbColor: { red: 0.118, green: 0.161, blue: 0.231 } } } // Slate 800
      };
    } else if (seg.isSectionLabel) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Arial' },
        fontSize: { magnitude: 10, unit: 'PT' },
        bold: true,
        foregroundColor: { color: { rgbColor: { red: 0.278, green: 0.333, blue: 0.412 } } } // Slate 600
      };
    } else if (seg.isBody) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Arial' },
        fontSize: { magnitude: 10.5, unit: 'PT' },
        foregroundColor: { color: { rgbColor: { red: 0.2, green: 0.255, blue: 0.333 } } } // Slate 700
      };
      paragraphStyle = {
        lineSpacing: 115,
        spaceBelow: { magnitude: 6, unit: 'PT' }
      };
    } else if (seg.isBulletLead) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Arial' },
        fontSize: { magnitude: 10.5, unit: 'PT' },
        bold: true,
        foregroundColor: { color: { rgbColor: { red: 0.008, green: 0.518, blue: 0.78 } } } // Ocean Blue Lead
      };
    } else if (seg.isMono) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Courier New' },
        fontSize: { magnitude: 9.5, unit: 'PT' },
        foregroundColor: { color: { rgbColor: { red: 0.059, green: 0.09, blue: 0.165 } } } // Dark Code
      };
    } else if (seg.isFooter) {
      textStyle = {
        weightedFontFamily: { fontFamily: 'Arial' },
        fontSize: { magnitude: 9, unit: 'PT' },
        italic: true,
        foregroundColor: { color: { rgbColor: { red: 0.392, green: 0.455, blue: 0.545 } } }
      };
      paragraphStyle = {
        alignment: 'CENTER',
        spaceAbove: { magnitude: 12, unit: 'PT' }
      };
    }

    if (textStyle) {
      requests.push({
        updateTextStyle: {
          textStyle,
          fields: Object.keys(textStyle).join(','),
          range: {
            startIndex: seg.start,
            endIndex: seg.end
          }
        }
      });
    }

    if (paragraphStyle) {
      requests.push({
        updateParagraphStyle: {
          paragraphStyle,
          fields: Object.keys(paragraphStyle).join(','),
          range: {
            startIndex: seg.start,
            endIndex: seg.end
          }
        }
      });
    }
  });

  // Send batch style updates to Google Docs
  const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests,
    }),
  });

  if (!updateResponse.ok) {
    const errText = await updateResponse.text();
    throw new Error(`Failed to apply styled formatting to Google Document: ${errText}`);
  }

  // 4. Update sharing permissions on Google Drive so "anyone with the link can view"
  const permissionResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  if (!permissionResponse.ok) {
    console.warn(`Could not set Drive permissions: ${await permissionResponse.text()}`);
  }

  return {
    documentId,
    documentUrl,
  };
}
