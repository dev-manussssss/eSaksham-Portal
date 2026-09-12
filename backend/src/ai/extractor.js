import pdfParse from 'pdf-parse';

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

  // Check if text is JSON
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const json = JSON.parse(trimmed);
      return {
        rawText: text.slice(0, 1000),
        extracted: json,
      };
    }
  } catch (e) {
    // Not valid JSON, continue regex parsing
  }

  // Regex-based heuristic parser for Bills, Invoices, and MB records
  const items = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Heuristic item matcher: e.g. "Item 1: Concrete 800 cum @ 6000 = 4800000" or tabular "1 | Earthwork | 2000 | 150"
  for (const line of lines) {
    // Match line with numbers: e.g. "1.2 | RCC M25 | 880 | 6000 | 5280000"
    const parts = line.split(/[|,\t]/).map(p => p.trim());
    if (parts.length >= 3) {
      const numMatch = parts[0].match(/^[0-9.]+/);
      const qtyMatch = parts[2].match(/[0-9.]+/);
      if (numMatch && qtyMatch) {
        items.push({
          item_no: numMatch[0],
          description: parts[1] || `Item ${numMatch[0]}`,
          executed_qty: parseFloat(qtyMatch[0]),
          billed_qty: parseFloat(qtyMatch[0]),
          rate: parts[3] ? parseFloat(parts[3].replace(/[^0-9.]/g, '')) : 0,
          billed_amount: parts[4] ? parseFloat(parts[4].replace(/[^0-9.]/g, '')) : 0,
        });
      }
    }
  }

  // If no tabular items found, look for explicit quantity overrides in text
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

  // Extract metadata like Bill No
  const billNoMatch = text.match(/(?:bill\s*no|invoice\s*no|ra\s*bill)\s*[:#-]?\s*([A-Za-z0-9\/-]+)/i);
  // ZERO-FABRICATION: return null if bill number cannot be extracted, never invent a value
  const billNo = billNoMatch ? billNoMatch[1].trim() : null;

  return {
    rawText: text.slice(0, 2000),
    extracted: {
      bill_no: billNo,
      // ZERO-FABRICATION: if no items found, return empty array and EXTRACTION_FAILED status
      // Never insert synthetic/assumed quantities — callers must check extraction_status
      items: items,
      extraction_status: items.length > 0 ? 'COMPLETE' : 'EXTRACTION_FAILED',
      bill_no_status: billNo ? 'COMPLETE' : 'EXTRACTION_PARTIAL',
    },
  };
}
