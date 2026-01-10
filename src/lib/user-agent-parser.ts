/**
 * Parse user-agent string to extract device, browser, and OS information
 */

export interface ParsedUserAgent {
  device: string;
  browser: string;
  os: string;
}

/**
 * Parse user-agent string into device, browser, and OS
 */
export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) {
    return {
      device: 'Unknown Device',
      browser: 'Unknown Browser',
      os: 'Unknown OS',
    };
  }

  const ua = userAgent.toLowerCase();

  // Detect device
  let device = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
    device = 'Tablet';
  } else if (
    /mobile|iphone|ipod|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(
      userAgent
    )
  ) {
    device = 'Mobile';
  }

  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('edg/') || ua.includes('edge/')) {
    browser = 'Edge';
  } else if (ua.includes('opr/') || ua.includes('opera/')) {
    browser = 'Opera';
  } else if (ua.includes('chrome/') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
  } else if (ua.includes('msie') || ua.includes('trident/')) {
    browser = 'Internet Explorer';
  }

  // Extract browser version
  let version = '';
  const versionPatterns = [
    { name: 'edg/', browser: 'Edge' },
    { name: 'edge/', browser: 'Edge' },
    { name: 'opr/', browser: 'Opera' },
    { name: 'opera/', browser: 'Opera' },
    { name: 'chrome/', browser: 'Chrome' },
    { name: 'safari/', browser: 'Safari' },
    { name: 'firefox/', browser: 'Firefox' },
    { name: 'msie ', browser: 'Internet Explorer' },
  ];

  for (const pattern of versionPatterns) {
    const idx = ua.indexOf(pattern.name);
    if (idx !== -1 && browser.toLowerCase().includes(pattern.browser.toLowerCase().split(' ')[0])) {
      const versionStart = idx + pattern.name.length;
      const versionEnd = ua.indexOf(' ', versionStart);
      version = ua.substring(versionStart, versionEnd !== -1 ? versionEnd : versionStart + 10).split('.')[0];
      break;
    }
  }

  if (version && browser !== 'Unknown Browser') {
    browser = `${browser} ${version}`;
  }

  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('windows nt 10.0')) {
    os = 'Windows 10';
  } else if (ua.includes('windows nt 6.3')) {
    os = 'Windows 8.1';
  } else if (ua.includes('windows nt 6.2')) {
    os = 'Windows 8';
  } else if (ua.includes('windows nt 6.1')) {
    os = 'Windows 7';
  } else if (ua.includes('windows nt')) {
    os = 'Windows';
  } else if (ua.includes('mac os x')) {
    const match = userAgent.match(/mac os x ([\d_]+)/i);
    if (match) {
      const version = match[1].replace(/_/g, '.');
      os = `macOS ${version.split('.').slice(0, 2).join('.')}`;
    } else {
      os = 'macOS';
    }
  } else if (ua.includes('android')) {
    const match = userAgent.match(/android ([\d.]+)/i);
    if (match) {
      os = `Android ${match[1].split('.')[0]}`;
    } else {
      os = 'Android';
    }
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    const match = userAgent.match(/os ([\d_]+)/i);
    if (match) {
      const version = match[1].replace(/_/g, '.');
      os = `iOS ${version.split('.')[0]}`;
    } else {
      os = 'iOS';
    }
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('ubuntu')) {
    os = 'Ubuntu';
  } else if (ua.includes('fedora')) {
    os = 'Fedora';
  }

  return {
    device,
    browser,
    os,
  };
}

/**
 * Get a friendly display name for the device
 */
export function getDeviceDisplayName(device: string, _browser: string, os: string): string {
  if (device === 'Mobile') {
    if (os.includes('iOS')) {
      return 'iPhone';
    } else if (os.includes('Android')) {
      return 'Android Phone';
    }
    return 'Mobile Device';
  } else if (device === 'Tablet') {
    if (os.includes('iOS')) {
      return 'iPad';
    } else if (os.includes('Android')) {
      return 'Android Tablet';
    }
    return 'Tablet';
  } else {
    // Desktop
    if (os.includes('Windows')) {
      return 'Windows PC';
    } else if (os.includes('macOS') || os.includes('Mac OS')) {
      return 'Mac';
    } else if (os.includes('Linux') || os.includes('Ubuntu') || os.includes('Fedora')) {
      return 'Linux PC';
    }
    return 'Desktop';
  }
}
