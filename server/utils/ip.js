import os from 'os';

/**
 * Get active Local Area Network (LAN) IPv4 address (e.g. Wi-Fi / Ethernet adapter)
 */
export function getLocalNetworkIp() {
  try {
    const interfaces = os.networkInterfaces();
    // Prefer Wi-Fi or Ethernet non-internal IPv4
    for (const name of Object.keys(interfaces)) {
      for (const alias of interfaces[name]) {
        if (alias.family === 'IPv4' && !alias.internal && alias.address !== '127.0.0.1') {
          return alias.address;
        }
      }
    }
  } catch (e) {}
  return '127.0.0.1';
}

/**
 * Extract and normalize client IP address
 * Handles IPv6 loopbacks, IPv6-mapped IPv4, Cloudflare, Nginx, and standard proxies.
 * When local loopback (localhost) is detected, resolves to the host machine's active network IP (e.g. 192.168.x.x).
 */
export function getClientIp(req) {
  if (!req) return getLocalNetworkIp();

  let rawIp =
    req.headers?.['cf-connecting-ip'] ||
    req.headers?.['x-real-ip'] ||
    req.headers?.['x-client-ip'] ||
    req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1';

  let ip = String(rawIp).trim();

  // Strip IPv6-mapped IPv4 prefix (e.g. ::ffff:192.168.1.10 -> 192.168.1.10)
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // If local loopback is detected, resolve to machine's active LAN IPv4 (e.g. 192.168.0.238)
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    return getLocalNetworkIp();
  }

  return ip;
}
