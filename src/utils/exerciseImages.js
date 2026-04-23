// Centralized image resolver for exercises/trainings.
// Handles absolute URLs, data/blob, and GitHub Pages BASE_URL prefixed relative assets.

export function resolveExerciseImageSrc(image) {
  const baseUrl = import.meta.env.BASE_URL || '/';

  if (!image || typeof image !== 'string') return null;
  const trimmed = image.trim();
  if (!trimmed) return null;

  // Absolute (or protocol-relative) URLs
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed;

  // Inline / object URLs
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;

  // Already prefixed with BASE_URL
  if (trimmed.startsWith(baseUrl)) return trimmed;

  const noLeadingSlash = trimmed.replace(/^\/+/, '');

  // If the caller already passed a path like "exercises/foo.png" just prefix BASE_URL.
  if (noLeadingSlash.includes('/')) return baseUrl + noLeadingSlash;

  // Otherwise assume it's a filename under /exercises/
  return baseUrl + 'exercises/' + noLeadingSlash;
}

// Backward-compat alias (older code used this name by mistake)
export const resolverExercisesImageSrc = resolveExerciseImageSrc;

