/**
 * Universal Multi-OEM Part Code Canonical Template Helper
 * Supports Schneider, Mitsubishi, Innovance, Delta, Panasonic, Omron, etc.
 */
export function getBasePartCodeTemplate(partCode) {
  if (!partCode) return '';
  let str = String(partCode).trim();

  // 1. If partCode already contains explicit wildcard ('xx.x', 'xxM', 'xxx', or 'xx'),
  // it is ALREADY the canonical base model template! (e.g. VW3M8B11Rxx, S6-L-B107-xx.x, MR-J3ENSCBLxxM-L)
  if (/xx/i.test(str)) {
    return str;
  }

  // 2. Trailing decimal length like S6-L-B107-20.0 or S6-L-B107-05.0 -> S6-L-B107-xx.x
  if (/-\d{1,2}\.\d+$/.test(str)) {
    return str.replace(/-\d{1,2}\.\d+$/, '-xx.x');
  }

  // 3. Trailing dash like S6-L-B107- -> S6-L-B107-xx.x
  if (str.endsWith('-')) {
    return `${str}xx.x`;
  }

  // 4. Schneider / Lexium / Delta trailing R03, R05, R10, R20, R30 -> Rxx
  if (/R\d{2}$/i.test(str)) {
    return str.replace(/R\d{2}$/i, 'Rxx');
  }

  // 5. Mitsubishi / Panasonic specific infix: CBL<len>M- or -<len>M- or -<len>M$ (e.g. MR-J3ENSCBL5M-L -> MR-J3ENSCBLxxM-L)
  if (/(CBL|-)\d+M(-|$)/i.test(str)) {
    return str.replace(/(CBL|-)\d+M(-|$)/gi, '$1xxM$2');
  }

  // 6. Trailing integer length like CBL-5 -> CBL-xxM
  if (/-\d+$/.test(str)) {
    return str.replace(/-\d+$/, '-xxM');
  }

  return str;
}
