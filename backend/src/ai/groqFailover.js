import { config } from '../config.js';
import { validateFlag } from '../constants/taxonomy.js';

/**
 * Universal Groq API caller with dual-key failover and JSON output enforcement.
 */
async function callGroqWithFailover(systemPrompt, userPrompt, maxTokens = 1200) {
  const payload = {
    model: config.groqModel || 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: maxTokens,
  };

  const keys = [config.groqKey1, config.groqKey2].filter(k => k && k.trim());

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i].trim();
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`Groq Key ${i + 1} error (HTTP ${response.status}):`, errorText.slice(0, 150));
        continue; // Try next key
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) continue;

      const parsed = JSON.parse(rawContent);
      return {
        success: true,
        data: parsed,
        model: config.groqModel || 'openai/gpt-oss-120b',
        keyIndex: i + 1,
      };
    } catch (err) {
      console.warn(`Groq Key ${i + 1} call exception:`, err.message);
    }
  }

  return { success: false, error: 'All Groq keys exhausted or failed.' };
}

/**
 * Converts unformatted OCR document text into clean, structured JSON format.
 */
export async function extractInvoiceJsonWithGroq(rawText) {
  if (!rawText || !rawText.trim()) {
    return {
      bill_no: null,
      items: [],
      extraction_status: 'EXTRACTION_FAILED',
      bill_no_status: 'EXTRACTION_FAILED',
    };
  }

  const systemPrompt = `You are SAKSHAM's AI Document Intelligence Engine for Government of India MPLADS works.
Your task is to parse unstructured text extracted from Contractor Bills, RA Bills, Measurement Books, and Invoices.
Output ONLY a valid JSON object strictly matching this schema:
{
  "bill_no": "STRING (e.g. RA BILL-02, INV-101, or null if absent)",
  "contractor_name": "STRING or null",
  "vendor_id": "STRING (e.g. VND-007, or null)",
  "project_id": "STRING (e.g. PRJ-004, or null)",
  "submission_date": "YYYY-MM-DD or null",
  "measurement_book_ref": "STRING (e.g. MB-P14 / Page 42, or null)",
  "total_claimed_amount": NUMBER or null,
  "items": [
    {
      "item_no": "STRING (e.g. 1.1, 1.2, 2)",
      "description": "STRING (item description)",
      "executed_qty": NUMBER,
      "billed_qty": NUMBER,
      "unit": "STRING (e.g. cum, sqm, rmt, kg, nos, lot)",
      "rate": NUMBER,
      "billed_amount": NUMBER
    }
  ],
  "discrepancy_notes": "STRING (any explicit alert text in the document)"
}`;

  const userPrompt = `Parse this document text into the required JSON schema:\n\n${rawText.slice(0, 4000)}`;

  const result = await callGroqWithFailover(systemPrompt, userPrompt, 1200);

  if (result.success && result.data && Array.isArray(result.data.items)) {
    return {
      bill_no: result.data.bill_no || null,
      contractor_name: result.data.contractor_name || null,
      vendor_id: result.data.vendor_id || null,
      project_id: result.data.project_id || null,
      submission_date: result.data.submission_date || null,
      measurement_book_ref: result.data.measurement_book_ref || null,
      total_claimed_amount: result.data.total_claimed_amount || 0,
      items: result.data.items.map(item => ({
        item_no: String(item.item_no || ''),
        description: String(item.description || ''),
        executed_qty: Number(item.executed_qty || item.billed_qty || 0),
        billed_qty: Number(item.billed_qty || item.executed_qty || 0),
        unit: String(item.unit || 'units'),
        rate: Number(item.rate || 0),
        billed_amount: Number(item.billed_amount || 0),
      })),
      extraction_status: result.data.items.length > 0 ? 'COMPLETE' : 'EXTRACTION_PARTIAL',
      bill_no_status: result.data.bill_no ? 'COMPLETE' : 'EXTRACTION_PARTIAL',
      discrepancy_notes: result.data.discrepancy_notes || null,
      extractedBy: `Groq AI (${result.model})`,
    };
  }

  return null; // Fallback to heuristic parser
}

/**
 * Analyzes extracted document data & rule violations with Groq to provide explainable risk assessment.
 */
export async function analyzeWithGroqFailover({ project, boqItems, ruleResult, extractedData, extractedText }) {
  const prompt = `Project Code: ${project.project_code || project.id}
Project Title: ${project.title}
Category: ${project.category}
Sanctioned Amount: ₹${Number(project.sanctioned_amount || 0).toLocaleString('en-IN')}
Released Amount: ₹${Number(project.released_amount || 0).toLocaleString('en-IN')}
Physical Progress: ${project.physical_progress_percent}%
Rule Violations Triggered: ${JSON.stringify(ruleResult.flags)}
Extracted Invoice/Bill Data: ${JSON.stringify(extractedData || {})}
Extracted Text Sample: ${extractedText ? extractedText.slice(0, 600) : 'N/A'}
Evaluate risk severity and provide compact assessment in required JSON schema.`;

  const systemPrompt = `You are SAKSHAM e-Governance AI Risk Engine for MPLADS.
Analyze anomalies and output ONLY valid JSON matching this schema:
{
  "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "Brief explanation under 2 sentences",
  "recommended_action": "PROCEED" | "REQUEST_VERIFICATION" | "HOLD_PAYMENT" | "ESCALATE",
  "flags": [
    {
      "flag_code": "STRING",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "title": "Short title",
      "explanation": "Reasoning citing statutory guidelines"
    }
  ]
}`;

  const res = await callGroqWithFailover(systemPrompt, prompt, 800);

  if (res.success && res.data) {
    const rawFlags = Array.isArray(res.data.flags) ? res.data.flags : [];
    const validatedFlags = rawFlags.map(f => validateFlag(f)).filter(Boolean);
    return {
      status: 'COMPLETED',
      model: res.model,
      data: {
        ...res.data,
        flags: validatedFlags,
      },
    };
  }

  // Graceful fallback to Deterministic Rules Engine
  return {
    status: 'DEGRADED_RULE_BASED',
    model: 'SAKSHAM-DETERMINISTIC-ENGINE-V1',
    data: {
      risk_level: ruleResult.calculatedRiskLevel,
      summary: ruleResult.hasAnomalies
        ? `Deterministic rule analysis identified ${ruleResult.flags.length} statutory variance(s). External LLM unavailable; deterministic fallback active.`
        : 'All statutory quantity and financial checks verified within permissible parameters.',
      recommended_action: ruleResult.suggestedAction,
      flags: ruleResult.flags,
    },
  };
}
