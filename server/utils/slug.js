/**
 * Convert string into URL-friendly slug
 * @param {string} text
 * @returns {string}
 */
export function generateSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing -
}
