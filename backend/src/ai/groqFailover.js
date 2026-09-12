import { config } from '../config.js';

async function callGroqEndpoint(apiKey, prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.groqModel || 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are SAKSHAM e-Governance AI Risk Engine for MPLADS.
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
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const err = new Error(`Groq HTTP ${response.status}: ${errorText.slice(0, 150)}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content);
}

export async function analyzeWithGroqFailover({ project, boqItems, ruleResult, extractedText }) {
  const prompt = `Project Code: ${project.project_code || project.id}
Category: ${project.category}
Sanctioned Amount: ${project.sanctioned_amount}
Released Amount: ${project.released_amount}
Physical Progress: ${project.physical_progress_percent}%
Rule Violations Triggered: ${JSON.stringify(ruleResult.flags)}
Extracted Text Sample: ${extractedText ? extractedText.slice(0, 600) : 'N/A'}
Provide compact risk assessment in required JSON schema.`;

  // 1. Try Key 1 if configured
  if (config.groqKey1 && config.groqKey1.trim()) {
    try {
      const result = await callGroqEndpoint(config.groqKey1.trim(), prompt);
      return {
        status: 'COMPLETED',
        model: config.groqModel,
        data: result,
      };
    } catch (err) {
      console.warn('Primary Groq key failed, evaluating failover...');
    }
  }

  // 2. Failover to Key 2 if configured
  if (config.groqKey2 && config.groqKey2.trim()) {
    try {
      const result = await callGroqEndpoint(config.groqKey2.trim(), prompt);
      return {
        status: 'COMPLETED',
        model: config.groqModel,
        data: result,
      };
    } catch (err) {
      console.warn('Secondary Groq key failed.');
    }
  }

  // 3. Both keys unavailable or failed -> Graceful fallback to Deterministic Rules Engine
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
