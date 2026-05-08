/**
 * Export a DOM element as a PNG image using native Canvas API.
 * No external dependencies required.
 */

export async function exportElementAsImage(element, filename = 'export.png') {
  if (!element) return;

  try {
    // Use the SVG foreignObject approach for DOM-to-Canvas
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const scale = 2; // Retina quality
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Serialize the element to SVG
    const data = new XMLSerializer().serializeToString(element);
    const svgBlob = new Blob([
      `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">${data}</div>
        </foreignObject>
      </svg>`
    ], { type: 'image/svg+xml;charset=utf-8' });

    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Canvas to blob failed')); return; }
          const link = document.createElement('a');
          link.download = filename;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
          resolve();
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = url;
    });
  } catch (err) {
    console.error('Export failed:', err);
    // Fallback: use SVG directly for SVG elements
    if (element.tagName === 'svg' || element.querySelector('svg')) {
      return exportSvgAsImage(element.querySelector('svg') || element, filename);
    }
  }
}

/**
 * Export an SVG element as PNG. More reliable for field canvases.
 */
export async function exportSvgAsImage(svgElement, filename = 'export.png') {
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const canvas = document.createElement('canvas');
  const scale = 3;
  const vb = svgElement.viewBox?.baseVal;
  canvas.width = (vb?.width || 550) * scale;
  canvas.height = (vb?.height || 366) * scale;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Blob creation failed')); return; }
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        resolve();
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Parse a YouTube/Vimeo URL and return an embeddable URL.
 * Returns null if the URL is not recognized.
 */
export function getEmbedUrl(url) {
  if (!url) return null;
  
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  
  return null;
}
