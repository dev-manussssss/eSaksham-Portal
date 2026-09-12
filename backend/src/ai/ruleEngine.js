/**
 * SAKSHAM Deterministic Anomaly & Risk Rules Engine
 * Enforces MPLADS statutory financial and quantity constraints before AI invocation.
 */

export function runDeterministicChecks({ project, boqItems = [], measurements = [], bills = [], extractedDocument = {} }) {
  const flags = [];
  let compositeImpact = 0;

  // 1. BOQ Item vs Extracted / Billed Quantity Check
  if (extractedDocument.items && Array.isArray(extractedDocument.items)) {
    for (const docItem of extractedDocument.items) {
      // Find matching BOQ item by item_no or description match
      const boqMatch = boqItems.find(b => 
        b.item_no === docItem.item_no || 
        b.description.toLowerCase().includes((docItem.description || '').toLowerCase().slice(0, 10))
      );

      if (boqMatch) {
        const billedQty = parseFloat(docItem.executed_qty || docItem.billed_qty || 0);
        const sanctionedQty = parseFloat(boqMatch.sanctioned_qty || 0);
        const rate = parseFloat(docItem.rate || boqMatch.rate || 0);
        const billedAmt = parseFloat(docItem.billed_amount || billedQty * rate);
        const boqAmt = parseFloat(boqMatch.total_amount || sanctionedQty * rate);

        // Rule 1.1: Billed Qty exceeds BOQ Qty
        if (billedQty > sanctionedQty && sanctionedQty > 0) {
          const overagePct = Math.round(((billedQty - sanctionedQty) / sanctionedQty) * 100);
          flags.push({
            flag_code: 'BOQ_QTY_EXCEEDED',
            severity: 'CRITICAL',
            title: `Billed Quantity Exceeds BOQ Allocation (+${overagePct}%)`,
            explanation: `Item "${boqMatch.description}" was billed for ${billedQty} ${boqMatch.unit}, exceeding sanctioned allocation of ${sanctionedQty} ${boqMatch.unit}.`,
            recommended_action: 'HOLD_PAYMENT',
            primary_evidence: {
              item_no: boqMatch.item_no,
              sanctioned_qty: sanctionedQty,
              billed_qty: billedQty,
              overage_pct: overagePct,
              unit: boqMatch.unit,
            },
          });
          compositeImpact += 40;
        }

        // Rule 1.2: Billed Amount exceeds Allowed BOQ Total
        if (billedAmt > boqAmt && boqAmt > 0) {
          flags.push({
            flag_code: 'BOQ_AMOUNT_EXCEEDED',
            severity: 'CRITICAL',
            title: 'Billed Amount Exceeds Sanctioned BOQ Item Cost',
            explanation: `Total billed amount (₹${billedAmt.toLocaleString('en-IN')}) for Item "${boqMatch.description}" exceeds BOQ sanctioned total (₹${boqAmt.toLocaleString('en-IN')}).`,
            recommended_action: 'HOLD_PAYMENT',
            primary_evidence: {
              item_no: boqMatch.item_no,
              sanctioned_amount: boqAmt,
              billed_amount: billedAmt,
            },
          });
          compositeImpact += 35;
        }
      }
    }
  }

  // 2. Measurement Book vs Physical Progress Divergence
  if (project.physical_progress_percent && project.expenditure_amount && project.sanctioned_amount) {
    const finProgress = (parseFloat(project.expenditure_amount) / parseFloat(project.sanctioned_amount)) * 100;
    const physProgress = parseFloat(project.physical_progress_percent);

    if (finProgress - physProgress > 25) {
      flags.push({
        flag_code: 'FINANCIAL_PHYSICAL_DIVERGENCE',
        severity: 'HIGH',
        title: 'Financial Expenditure Leads Physical Progress (>25% Gap)',
        explanation: `Financial utilization is ${finProgress.toFixed(1)}% while verified physical progress is only ${physProgress.toFixed(1)}%. Statutory guidelines require expenditure to trail or match physical milestones.`,
        recommended_action: 'REQUEST_PHYSICAL_VERIFICATION',
        primary_evidence: {
          financial_progress_pct: finProgress.toFixed(1),
          physical_progress_pct: physProgress.toFixed(1),
          variance: (finProgress - physProgress).toFixed(1),
        },
      });
      compositeImpact += 25;
    }
  }

  // 3. Measurement Record Mismatch with Field Observation
  for (const m of measurements) {
    const rec = parseFloat(m.recorded_qty || 0);
    const obs = parseFloat(m.observed_qty || 0);
    if (rec > obs && obs > 0) {
      const gap = rec - obs;
      flags.push({
        flag_code: 'MB_OBSERVED_MISMATCH',
        severity: 'HIGH',
        title: `Measurement Book Discrepancy (${m.description})`,
        explanation: `Measurement Book entry #${m.mb_number} records ${rec} ${m.unit}, but physical inspection observed ${obs} ${m.unit} (Variance: -${gap} ${m.unit}).`,
        recommended_action: 'REQUEST_PHYSICAL_VERIFICATION',
        primary_evidence: {
          mb_number: m.mb_number,
          recorded_qty: rec,
          observed_qty: obs,
          shortfall: gap,
        },
      });
      compositeImpact += 30;
    }
  }

  // 4. Critical Flag Payment Hold Recommendation
  const hasCritical = flags.some(f => f.severity === 'CRITICAL');
  const recommendedProjectStatus = hasCritical ? 'ON_HOLD' : (project.status || 'UNDER_IMPLEMENTATION');
  const suggestedAction = hasCritical ? 'HOLD_PAYMENT' : 'PROCEED_NORMAL';
  const calculatedRiskScore = Math.min(100, Math.max(10, (project.risk_score || 10) + compositeImpact));
  const calculatedRiskLevel = calculatedRiskScore >= 75 ? 'CRITICAL' : calculatedRiskScore >= 50 ? 'HIGH' : calculatedRiskScore >= 30 ? 'MEDIUM' : 'LOW';

  return {
    flags,
    hasAnomalies: flags.length > 0,
    compositeImpact,
    calculatedRiskScore,
    calculatedRiskLevel,
    recommendedProjectStatus,
    suggestedAction,
  };
}
