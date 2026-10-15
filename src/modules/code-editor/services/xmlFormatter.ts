/**
 * Nusantara App Builder - XML & Code Formatter
 * Phase 4: Safe indentation and formatting for Android XML and informational feedback for other languages.
 */

export interface FormatResult {
  formatted: boolean;
  content: string;
  message?: string;
  messageId?: string;
}

/**
 * Format Android XML document with clean indentation and attribute wrapping
 */
export function formatXmlDocument(xml: string, indentSize: number = 4): FormatResult {
  if (!xml || !xml.trim()) {
    return { formatted: false, content: xml, message: 'File is empty.', messageId: 'Berkas kosong.' };
  }

  try {
    const PADDING = ' '.repeat(indentSize);
    let formatted = '';
    let indent = 0;

    // Preserve comments & metadata
    const lines = xml
      .replace(/>\s*</g, '>\n<')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // XML declaration <?xml ... ?>
      if (line.startsWith('<?') && line.endsWith('?>')) {
        formatted += `${line}\n`;
        continue;
      }

      // Comments <!-- ... -->
      if (line.startsWith('<!--') && line.endsWith('-->')) {
        formatted += `${PADDING.repeat(indent)}${line}\n`;
        continue;
      }

      // Closing tag </tag>
      if (line.startsWith('</')) {
        indent = Math.max(0, indent - 1);
        formatted += `${PADDING.repeat(indent)}${line}\n`;
        continue;
      }

      // Self-closing tag <tag ... />
      if (line.endsWith('/>')) {
        formatted += `${PADDING.repeat(indent)}${line}\n`;
        continue;
      }

      // Single line with open and close tag <tag>value</tag>
      if (/^<[^>]+>[^<]*<\/[^>]+>$/.test(line)) {
        formatted += `${PADDING.repeat(indent)}${line}\n`;
        continue;
      }

      // Opening tag <tag ...>
      if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
        formatted += `${PADDING.repeat(indent)}${line}\n`;
        indent++;
        continue;
      }

      // Inner text / attributes on newlines
      formatted += `${PADDING.repeat(indent)}${line}\n`;
    }

    return {
      formatted: true,
      content: formatted.trimEnd() + '\n',
      message: 'XML document formatted successfully.',
      messageId: 'Dokumen XML berhasil diformat.',
    };
  } catch (err) {
    return {
      formatted: false,
      content: xml,
      message: `Failed to format XML: ${(err as Error).message}`,
      messageId: `Gagal memformat XML: ${(err as Error).message}`,
    };
  }
}

/**
 * Main document formatter router
 */
export function formatDocument(language: string, content: string): FormatResult {
  if (language === 'xml') {
    return formatXmlDocument(content);
  }

  if (language === 'json') {
    try {
      const parsed = JSON.parse(content);
      return {
        formatted: true,
        content: JSON.stringify(parsed, null, 2) + '\n',
        message: 'JSON document formatted.',
        messageId: 'Dokumen JSON berhasil diformat.',
      };
    } catch {
      return {
        formatted: false,
        content,
        message: 'Invalid JSON syntax. Cannot format.',
        messageId: 'Sintaks JSON tidak valid. Tidak dapat memformat.',
      };
    }
  }

  if (language === 'kotlin' || language === 'groovy' || language === 'java') {
    return {
      formatted: false,
      content,
      message: 'Kotlin/Java formatter is not configured yet (requires ktfmt/ktlint daemon).',
      messageId: 'Formatter Kotlin/Java belum terkonfigurasi (memerlukan daemon ktfmt/ktlint).',
    };
  }

  return {
    formatted: false,
    content,
    message: `Formatting for "${language}" is not supported yet.`,
    messageId: `Format untuk "${language}" belum didukung.`,
  };
}
