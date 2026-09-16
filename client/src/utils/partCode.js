/**
 * Universal Multi-OEM Part Code Canonical & Length Helper
 * 
 * Truly brand-agnostic & manufacturer-neutral.
 * Works universally for ANY cable type and ANY brand (Delta, Schneider, 
 * Innovance, Mitsubishi, Panasonic, Omron, Siemens, Yaskawa, etc.)
 * based strictly on structural part-code patterns.
 */

/**
 * Derives the canonical base model template from any specific length part code.
 * (e.g. ACS3-CAEN0105 -> ACS3-CAEN01xx, VW3M8B11R05 -> VW3M8B11Rxx, 
 *       MR-EKCBL8M-L -> MR-EKCBLxxM-L, S6-L-B107-20.0 -> S6-L-B107-xx.x)
 */
export function getBasePartCodeTemplate(partCode) {
  if (!partCode) return '';
  let str = String(partCode).trim();

  // 1. If partCode already contains explicit wildcard ('xx', 'xx.x', 'xxM', 'xxx', 'xxxx'),
  // it is ALREADY the canonical base model template!
  if (/xx/i.test(str)) {
    return str;
  }

  // 2. Trailing decimal length like "-20.0" or "-05.0" (e.g. S6-L-B107-20.0 -> S6-L-B107-xx.x)
  if (/-\d{1,2}\.\d+$/.test(str)) {
    return str.replace(/-\d{1,2}\.\d+$/, '-xx.x');
  }

  // 3. Trailing dash (e.g. S6-L-B107- -> S6-L-B107-xx.x)
  if (str.endsWith('-')) {
    return `${str}xx.x`;
  }

  // 4. Infix or suffix meter length token like "8M" or "20M"
  // (e.g. MR-EKCBL8M-L -> MR-EKCBLxxM-L, MR-PWCNS4-12M -> MR-PWCNS4-xxM)
  if (/(?:CBL|-|\b)\d+M(?=[A-Za-z0-9/_-]|$)/i.test(str)) {
    return str.replace(/(\d+)M(?=[A-Za-z0-9/_-]|$)/gi, 'xxM');
  }

  // 5. Trailing hyphenated integer length like "-5" or "-20" (e.g. CBL-5 -> CBL-xxM)
  if (/-\d+$/.test(str)) {
    return str.replace(/-\d+$/, '-xxM');
  }

  // 6. Universal trailing length digits (2 digits at end of alphanumeric code)
  // (e.g. ACS3-CAEN0105 -> ACS3-CAEN01xx, VW3M8B11R05 -> VW3M8B11Rxx,
  //       ASD-CAPW2105 -> ASD-CAPW21xx, ASDBCAEN0120 -> ASDBCAEN01xx)
  if (str.length >= 6 && /[A-Za-z0-9_-]\d{2}$/.test(str)) {
    return str.replace(/\d{2}$/, 'xx');
  }

  return str;
}

/**
 * Formats a canonical base template with a specific length.
 * Inverse of getBasePartCodeTemplate.
 */
export function formatPartCodeWithLength(basePartCode, length) {
  if (!basePartCode) return '';
  const lenNum = Number(length) || 5;
  const decimalSuffix = lenNum < 10 ? `0${lenNum.toFixed(1)}` : `${lenNum.toFixed(1)}`;
  const twoDigitSuffix = lenNum < 10 ? `0${Math.round(lenNum)}` : `${Math.round(lenNum)}`;
  const threeDigitSuffix = lenNum < 10 ? `00${Math.round(lenNum)}` : lenNum < 100 ? `0${Math.round(lenNum)}` : `${Math.round(lenNum)}`;
  const meterSuffix = `${lenNum}M`;

  let result = String(basePartCode).trim();

  // 1. Explicit 'xx.x' wildcard (e.g. S6-L-B107-xx.x -> S6-L-B107-20.0)
  if (/xx\.x/i.test(result)) {
    return result.replace(/xx\.x/gi, decimalSuffix);
  }

  // 2. Explicit 'xxM' wildcard (e.g. MR-J3ENSCBLxxM-L -> MR-J3ENSCBL20M-L)
  if (/xxM/i.test(result)) {
    return result.replace(/xxM/gi, meterSuffix);
  }

  // 3. Explicit 'xxx' wildcard (e.g. CBL-xxx-PWR -> CBL-020-PWR)
  if (/xxx/i.test(result)) {
    return result.replace(/xxx/gi, threeDigitSuffix);
  }

  // 4. Explicit 'xx' wildcard anywhere (e.g. ACS3-CAEN01xx -> ACS3-CAEN0105, VW3M8B11Rxx -> VW3M8B11R05)
  if (/xx/i.test(result)) {
    return result.replace(/xx/gi, twoDigitSuffix);
  }

  // 5. Trailing decimal like "-05.0"
  if (/-\d{1,2}\.\d+$/.test(result)) {
    return result.replace(/-\d{1,2}\.\d+$/, `-${decimalSuffix}`);
  }

  // 6. Infix or suffix meter token
  if (/(?:CBL|-|\b)\d+M(?=[A-Za-z0-9/_-]|$)/i.test(result)) {
    return result.replace(/(\d+)M(?=[A-Za-z0-9/_-]|$)/gi, meterSuffix);
  }

  // 7. Trailing hyphenated integer like "-5"
  if (/-\d+$/.test(result)) {
    return result.replace(/-\d+$/, `-${lenNum}`);
  }

  // 8. Trailing 2-digit length
  if (result.length >= 6 && /[A-Za-z0-9_-]\d{2}$/.test(result)) {
    return result.replace(/\d{2}$/, twoDigitSuffix);
  }

  return `${result}-${meterSuffix}`;
}

/**
 * Extracts numerical length from a variant or part code
 */
export function getVariantLength(variant) {
  if (!variant) return 5;
  if (variant.default_length !== undefined && variant.default_length !== null && !isNaN(Number(variant.default_length))) {
    const dLen = Number(variant.default_length);
    if (dLen > 0) return dLen;
  }
  const pc = String(variant.part_code || '');

  // If part code has explicit wildcard 'xx', default to 5
  if (/xx/i.test(pc)) return 5;

  // Decimal suffix: -05.0, -20.0
  const decMatch = pc.match(/-(\d{1,2})\.\d+$/);
  if (decMatch) return Number(decMatch[1]);

  // Meter suffix/infix: 8M, 12M
  const mMatch = pc.match(/(?:CBL|-|\b)(\d+)M(?:[A-Za-z0-9/_-]|$)/i);
  if (mMatch) return Number(mMatch[1]);

  // Trailing 2 digits (e.g. ACS3-CAEN0105 -> 5, VW3M8B11R20 -> 20)
  const trailingMatch = pc.match(/[A-Za-z0-9_-](\d{2})$/);
  if (trailingMatch) return Number(trailingMatch[1]);

  return 5;
}

/**
 * Uniquely identifies a Cable Model by its base part code template and motor/power spec.
 * Differentiates models that share the same part code pattern but differ by motor rating
 * (e.g. 100W-750W vs 1KW & Above).
 */
export function getModelGroupKey(partCode, motorType = '') {
  const base = getBasePartCodeTemplate(partCode).toLowerCase();
  const motor = (motorType || '').trim().replace(/\s+/g, ' ').toLowerCase();
  return motor ? `${base}__${motor}` : base;
}
