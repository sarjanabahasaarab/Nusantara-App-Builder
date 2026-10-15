/**
 * Nusantara App Builder - Android Package ID Normalizer & Validator
 * Phase 5: Generates compliant Android package identifiers from app names and validates them strictly.
 */

const JAVA_RESERVED_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package',
  'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
  'try', 'void', 'volatile', 'while', 'true', 'false', 'null', 'android',
]);

/**
 * Normalizes an arbitrary app name or domain into a valid Android Package ID
 * e.g. "Website Saya" -> "id.nusantara.websitesaya"
 * e.g. "tokoku.co.id" -> "id.co.tokoku"
 */
export function normalizeAppNameToPackageId(appName: string, hostname?: string): string {
  if (hostname) {
    const cleanHost = hostname.toLowerCase().replace(/[^a-z0-9.]/g, '');
    const parts = cleanHost.split('.').filter(Boolean);

    if (parts.length >= 2) {
      // Reverse domain notation, skipping 'www'
      const nonWww = parts.filter((p) => p !== 'www');
      const reversed = [...nonWww].reverse();
      const sanitized = reversed.map((seg) => {
        const cleaned = seg.replace(/^[0-9]+/, '');
        return JAVA_RESERVED_KEYWORDS.has(cleaned) ? `${cleaned}app` : cleaned || 'app';
      });

      if (sanitized.length >= 2) {
        return sanitized.join('.');
      }
    }
  }

  // Fallback to id.nusantara.[appname]
  const cleanName = appName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 25);

  const safeSegment = cleanName || 'mywebsite';
  const prefix = 'id.nusantara';

  const finalSegment = JAVA_RESERVED_KEYWORDS.has(safeSegment)
    ? `${safeSegment}app`
    : safeSegment;

  return `${prefix}.${finalSegment}`;
}

/**
 * Validates whether a package ID satisfies strict Android standards
 */
export function validatePackageId(packageId: string): { isValid: boolean; error?: string; errorId?: string } {
  const trimmed = packageId.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Package ID cannot be empty.',
      errorId: 'Package ID tidak boleh kosong.',
    };
  }

  if (trimmed.length > 120) {
    return {
      isValid: false,
      error: 'Package ID cannot exceed 120 characters.',
      errorId: 'Package ID tidak boleh melebihi 120 karakter.',
    };
  }

  const segments = trimmed.split('.');

  if (segments.length < 2) {
    return {
      isValid: false,
      error: 'Package ID must contain at least two segments separated by a dot (e.g. id.nusantara.myapp).',
      errorId: 'Package ID harus memiliki minimal dua segmen yang dipisahkan titik (contoh: id.nusantara.myapp).',
    };
  }

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    if (!seg) {
      return {
        isValid: false,
        error: 'Package ID cannot contain empty segments or trailing dots.',
        errorId: 'Package ID tidak boleh memiliki segmen kosong atau titik di akhir.',
      };
    }

    if (!/^[a-zA-Z_]/.test(seg)) {
      return {
        isValid: false,
        error: `Segment "${seg}" must begin with a letter or underscore, not a number.`,
        errorId: `Segmen "${seg}" harus diawali dengan huruf atau garis bawah, bukan angka.`,
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(seg)) {
      return {
        isValid: false,
        error: `Segment "${seg}" contains illegal characters. Only alphanumeric and underscore are allowed.`,
        errorId: `Segmen "${seg}" mengandung karakter tidak valid. Hanya alfanumerik dan garis bawah yang diizinkan.`,
      };
    }

    if (JAVA_RESERVED_KEYWORDS.has(seg.toLowerCase())) {
      return {
        isValid: false,
        error: `Segment "${seg}" is a Java/Android reserved keyword and cannot be used in a package identifier.`,
        errorId: `Segmen "${seg}" adalah kata kunci khusus (reserved keyword) Java/Android dan tidak boleh digunakan.`,
      };
    }
  }

  return { isValid: true };
}
