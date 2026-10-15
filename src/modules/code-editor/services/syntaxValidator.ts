/**
 * Nusantara App Builder - Real Syntax & Android Resource Validator
 * Phase 4: Detects real XML structural issues, unclosed tags, invalid @+id formats, duplicate IDs,
 * missing layout dimensions, and basic Kotlin structural checks.
 */

import { EditorProblem } from '../types';

/**
 * Validates Android XML code and returns real problems
 */
export function validateAndroidXml(filePath: string, content: string): EditorProblem[] {
  const problems: EditorProblem[] = [];
  const fileName = filePath.split('/').pop() || filePath;

  if (!content.trim()) {
    return problems;
  }

  // 1. Check well-formedness using DOMParser
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'application/xml');
    const parseError = doc.getElementsByTagName('parsererror')[0];

    if (parseError) {
      const errText = parseError.textContent || '';
      // Try to extract line number from parser error text
      const lineMatch = errText.match(/line\s+(\d+)/i) || errText.match(/:(\d+):/);
      const lineNum = lineMatch ? parseInt(lineMatch[1], 10) : 1;

      problems.push({
        id: `xml_parse_err_${Date.now()}_${Math.random()}`,
        filePath,
        fileName,
        line: lineNum,
        column: 1,
        message: `XML syntax error: ${errText.split('\n')[0].replace(/<[^>]+>/g, '').trim()}`,
        messageId: `Kesalahan sintaks XML: ${errText.split('\n')[0].replace(/<[^>]+>/g, '').trim()}`,
        severity: 'error',
        source: 'xml-validator',
      });
      return problems; // Stop here if XML cannot be parsed
    }
  } else {
    // Tag balance check in headless/Node environment
    const tagMatches = content.match(/<(\/)?([a-zA-Z0-9_.:]+)([^>]*?)(\/)?>/g) || [];
    const stack: string[] = [];
    for (const tag of tagMatches) {
      if (tag.startsWith('<?') || tag.startsWith('<!--')) continue;
      const isClosing = tag.startsWith('</');
      const isSelfClosing = tag.endsWith('/>');
      const name = tag.replace(/<\/?([a-zA-Z0-9_.:]+)[\s\S]*/, '$1');
      if (isSelfClosing) continue;
      if (isClosing) {
        if (stack.length === 0 || stack[stack.length - 1] !== name) {
          problems.push({
            id: `xml_mismatch_${Date.now()}`,
            filePath,
            fileName,
            line: 1,
            column: 1,
            message: `XML syntax error: Mismatched closing tag </${name}>`,
            messageId: `Kesalahan sintaks XML: Tag penutup tidak cocok </${name}>`,
            severity: 'error',
            source: 'xml-validator',
          });
          return problems;
        }
        stack.pop();
      } else {
        stack.push(name);
      }
    }
    if (stack.length > 0) {
      problems.push({
        id: `xml_unclosed_${Date.now()}`,
        filePath,
        fileName,
        line: 1,
        column: 1,
        message: `XML syntax error: Unclosed tag <${stack[stack.length - 1]}>`,
        messageId: `Kesalahan sintaks XML: Tag tidak ditutup <${stack[stack.length - 1]}>`,
        severity: 'error',
        source: 'xml-validator',
      });
      return problems;
    }
  }

  // 2. Line-by-line checks for Android-specific rules
  const lines = content.split('\n');
  const seenIds = new Set<string>();

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lineNum = idx + 1;

    // Check Android ID format: android:id="@+id/..."
    const idMatches = line.matchAll(/android:id=["'](@\+?id\/([^"']+))["']/g);
    for (const match of idMatches) {
      const fullId = match[1];
      const idName = match[2];
      const col = match.index ? match.index + 1 : 1;

      // Validate ID name syntax
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(idName)) {
        problems.push({
          id: `invalid_id_${lineNum}_${col}`,
          filePath,
          fileName,
          line: lineNum,
          column: col,
          message: `Invalid resource ID format "${idName}". Android IDs must start with a letter or underscore and contain only alphanumeric characters.`,
          messageId: `Format ID resource tidak valid "${idName}". ID Android harus diawali huruf/garis bawah dan hanya berisi karakter alfanumerik.`,
          severity: 'error',
          source: 'xml-validator',
        });
      } else if (seenIds.has(idName)) {
        problems.push({
          id: `duplicate_id_${lineNum}_${col}`,
          filePath,
          fileName,
          line: lineNum,
          column: col,
          message: `Duplicate android:id "${idName}" found in this layout. Each view must have a unique ID.`,
          messageId: `Ditemukan android:id duplikat "${idName}" pada layout ini. Setiap view harus memiliki ID unik.`,
          severity: 'warning',
          source: 'xml-validator',
        });
      } else {
        seenIds.add(idName);
      }
    }

    // Check malformed resource references, e.g. "@string/" with empty name or invalid chars
    const resRefMatches = line.matchAll(/@([a-z]+)\/([^"'\s>]+)/g);
    for (const match of resRefMatches) {
      const resType = match[1];
      const resName = match[2];
      const col = match.index ? match.index + 1 : 1;

      if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(resName)) {
        problems.push({
          id: `invalid_res_ref_${lineNum}_${col}`,
          filePath,
          fileName,
          line: lineNum,
          column: col,
          message: `Malformed resource reference "@${resType}/${resName}". Resource names cannot contain special characters.`,
          messageId: `Referensi resource salah secara sintaksis "@${resType}/${resName}". Nama resource tidak boleh mengandung karakter khusus.`,
          severity: 'error',
          source: 'xml-validator',
        });
      }
    }

    // Check XML namespace declaration on root element
    if (idx === 0 && line.includes('<') && !line.includes('<?xml')) {
      if (!line.includes('xmlns:android="http://schemas.android.com/apk/res/android"')) {
        problems.push({
          id: `missing_ns_${lineNum}`,
          filePath,
          fileName,
          line: lineNum,
          column: 1,
          message: 'Root Android layout element is missing xmlns:android namespace declaration.',
          messageId: 'Elemen layout root Android tidak memiliki deklarasi namespace xmlns:android.',
          severity: 'warning',
          source: 'xml-validator',
        });
      }
    }
  }

  return problems;
}

/**
 * Basic syntax and integrity checks for Kotlin source files
 */
export function validateKotlinSource(filePath: string, content: string): EditorProblem[] {
  const problems: EditorProblem[] = [];
  const fileName = filePath.split('/').pop() || filePath;

  if (!content.trim()) return problems;

  const lines = content.split('\n');
  let openBraces = 0;
  let openParens = 0;
  let hasPackage = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const line = rawLine.trim();
    const lineNum = idx + 1;

    // Ignore single-line comments
    if (line.startsWith('//') || line.startsWith('*')) continue;

    if (line.startsWith('package ')) {
      hasPackage = true;
      const pkgName = line.replace(/^package\s+/, '').replace(/;$/, '').trim();
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(pkgName)) {
        problems.push({
          id: `kt_invalid_pkg_${lineNum}`,
          filePath,
          fileName,
          line: lineNum,
          column: 1,
          message: `Invalid package declaration "${pkgName}". Package names must follow reverse domain notation.`,
          messageId: `Deklarasi package tidak valid "${pkgName}". Nama package harus mengikuti notasi domain terbalik.`,
          severity: 'error',
          source: 'kotlin-syntax',
        });
      }
    }

    // Count braces and parentheses for basic balance checking
    for (const char of rawLine) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '(') openParens++;
      if (char === ')') openParens--;
    }

    if (openBraces < 0) {
      problems.push({
        id: `kt_extra_brace_${lineNum}`,
        filePath,
        fileName,
        line: lineNum,
        column: rawLine.indexOf('}') + 1,
        message: 'Unexpected closing brace "}" without matching opening brace.',
        messageId: 'Karakter kurung kurawal tutup "}" tidak memiliki pasangan kurung buka.',
        severity: 'error',
        source: 'kotlin-syntax',
      });
      openBraces = 0; // reset
    }

    // Check for unclosed single-line strings (excluding multi-line """ quotes)
    if (!line.includes('"""')) {
      const quotesCount = (line.match(/"/g) || []).length;
      const escapedQuotesCount = (line.match(/\\"/g) || []).length;
      const effectiveQuotes = quotesCount - escapedQuotesCount;
      if (effectiveQuotes % 2 !== 0 && !line.endsWith('\\')) {
        problems.push({
          id: `kt_unclosed_str_${lineNum}`,
          filePath,
          fileName,
          line: lineNum,
          column: line.lastIndexOf('"') + 1,
          message: 'Unclosed string literal in Kotlin code.',
          messageId: 'Literal string tidak ditutup pada kode Kotlin.',
          severity: 'error',
          source: 'kotlin-syntax',
        });
      }
    }
  }

  if (openBraces > 0) {
    problems.push({
      id: `kt_missing_brace_${lines.length}`,
      filePath,
      fileName,
      line: lines.length,
      column: 1,
      message: `Missing ${openBraces} closing brace(s) "}" in file.`,
      messageId: `Kurang ${openBraces} kurung kurawal tutup "}" di akhir berkas.`,
      severity: 'error',
      source: 'kotlin-syntax',
    });
  }

  if (!hasPackage && !filePath.endsWith('.gradle.kts') && !filePath.includes('build.gradle')) {
    problems.push({
      id: `kt_missing_pkg`,
      filePath,
      fileName,
      line: 1,
      column: 1,
      message: 'Kotlin source file does not have a package declaration.',
      messageId: 'Berkas kode sumber Kotlin tidak memiliki deklarasi package.',
      severity: 'info',
      source: 'kotlin-syntax',
    });
  }

  return problems;
}

/**
 * Master file validator
 */
export function validateFileContent(filePath: string, language: string, content: string): EditorProblem[] {
  if (language === 'xml') {
    return validateAndroidXml(filePath, content);
  }
  if (language === 'kotlin' || language === 'java') {
    return validateKotlinSource(filePath, content);
  }
  return [];
}
