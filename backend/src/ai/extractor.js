import pdfParse from 'pdf-parse';
import { extractInvoiceJsonWithGroq } from './groqFailover.js';

export async function extractDocumentData(fileBuffer, mimeType, originalName = '') {
  let text = '';
  if (mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
    try {
      const parsed = await pdfParse(fileBuffer);
      text = parsed.text || '';
    } catch (e) {
      console.warn('PDF parsing error, falling back to string representation:', e.message);
      text = fileBuffer.toString('utf-8');
    }
  } else {
    text = fileBuffer.toString('utf-8');
  }

  // 1. Direct JSON check
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const json = JSON.parse(trimmed);
      return {
        rawText: text.slice(0, 4000),
        extracted: json,
      };
    }
  } catch (e) {
    // Not raw JSON, continue to AI extraction
  }

  // 2. Groq AI Extraction (Structured JSON conversion)
  try {
    const groqResult = await extractInvoiceJsonWithGroq(text);
    if (groqResult && groqResult.items && groqResult.items.length > 0) {
      return {
        rawText: text.slice(0, 4000),
        extracted: groqResult,
      };
    }
  } catch (e) {
    console.warn('Groq extraction encountered an error, falling back to heuristic parser:', e.message);
  }

  // 3. Fallback Heuristic / Regex Parser for Bills, Invoices, and MB records
  const items = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const parts = line.split(/[|,\t]/).map(p => p.trim());
    if (parts.length >= 3) {
      const numMatch = parts[0].match(/^[0-9.]+/);
      // Look for a numeric quantity in parts[2] or parts[3]
      const qtyMatch = parts[2]?.match(/[0-9.]+/);
      if (numMatch && qtyMatch) {
        items.push({
          item_no: numMatch[0],
          description: parts[1] || `Item ${numMatch[0]}`,
          executed_qty: parseFloat(qtyMatch[0]),
          billed_qty: parseFloat(qtyMatch[0]),
          unit: parts[3] && isNaN(parseFloat(parts[3])) ? parts[3].trim() : 'units',
          rate: parts[4] ? parseFloat(parts[4].replace(/[^0-9.]/g, '')) : (parts[3] ? parseFloat(parts[3].replace(/[^0-9.]/g, '')) : 0),
          billed_amount: parts[5] ? parseFloat(parts[5].replace(/[^0-9.]/g, '')) : 0,
        });
      }
    }
  }

  if (items.length === 0) {
    const qtyRegex = /(?:item|item no|s\.no)\s*[:#]?\s*([0-9.]+)[^0-9\n]*([A-Za-z\s]+)[^0-9\n]*([0-9.]+)\s*(cum|sqm|rmt|nos|lot|kg|m³|m²)/gi;
    let match;
    while ((match = qtyRegex.exec(text)) !== null) {
      items.push({
        item_no: match[1],
        description: match[2].trim(),
        executed_qty: parseFloat(match[3]),
        billed_qty: parseFloat(match[3]),
        unit: match[4],
      });
    }
  }

  const billNoMatch = text.match(/(?:bill\s*no|invoice\s*no|ra\s*bill)\s*[:#-]?\s*([A-Za-z0-9\/-]+)/i);
  const billNo = billNoMatch ? billNoMatch[1].trim() : null;

  return {
    rawText: text.slice(0, 4000),
    extracted: {
      bill_no: billNo,
      items: items,
      extraction_status: items.length > 0 ? 'COMPLETE' : 'EXTRACTION_FAILED',
      bill_no_status: billNo ? 'COMPLETE' : 'EXTRACTION_PARTIAL',
      extractedBy: 'Deterministic Heuristic Fallback',
    },
  };
}
