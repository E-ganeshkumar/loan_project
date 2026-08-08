// Mirrors the backend's bre.py check_rules() logic so the "Run BRE Check"
// action can preview a decision in the browser before saving it to the lead.
// NOTE: there is no live backend endpoint for this yet — see README.

export function evaluateRules(lead, rules) {
  const active = rules.filter((r) => r.active);
  const failed = [];

  for (const rule of active) {
    const leadValue = lead[rule.field_name];

    if (leadValue === undefined || leadValue === null || leadValue === "") {
      failed.push(`${rule.field_name} is missing on this lead`);
      continue;
    }

    if (rule.operator === ">=") {
      if (Number(leadValue) < Number(rule.value)) {
        failed.push(`${rule.field_name} (${leadValue}) must be >= ${rule.value}`);
      }
    } else if (rule.operator === "<=") {
      if (Number(leadValue) > Number(rule.value)) {
        failed.push(`${rule.field_name} (${leadValue}) must be <= ${rule.value}`);
      }
    } else if (rule.operator === "==") {
      if (String(leadValue) !== String(rule.value)) {
        failed.push(`${rule.field_name} (${leadValue}) must equal ${rule.value}`);
      }
    }
  }

  return {
    passed: failed.length === 0,
    reasons: failed,
  };
}
