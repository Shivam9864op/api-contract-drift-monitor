const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

function schemaType(schema) {
  if (!schema || typeof schema !== 'object') return 'unknown';
  if (schema.type) return schema.type;
  if (schema.$ref) return schema.$ref;
  return 'object';
}

function operationMap(document) {
  const result = new Map();
  for (const [path, item] of Object.entries(document?.paths ?? {})) {
    if (!item || typeof item !== 'object') continue;
    for (const method of METHODS) {
      const operation = item[method];
      if (operation && typeof operation === 'object') result.set(`${method.toUpperCase()} ${path}`, operation);
    }
  }
  return result;
}

function responseContent(response) {
  const content = response?.content;
  if (!content || typeof content !== 'object') return null;
  const first = Object.values(content)[0];
  return first?.schema ?? null;
}

export function compareContracts(before, after) {
  const changes = [];
  const oldOps = operationMap(before);
  const newOps = operationMap(after);

  for (const key of oldOps.keys()) {
    if (!newOps.has(key)) changes.push({ severity: 'breaking', code: 'operation_removed', target: key, message: `${key} was removed` });
  }

  for (const [key, oldOperation] of oldOps) {
    const nextOperation = newOps.get(key);
    if (!nextOperation) continue;
    const oldResponses = oldOperation.responses ?? {};
    const nextResponses = nextOperation.responses ?? {};
    for (const status of Object.keys(oldResponses)) {
      if (!nextResponses[status]) changes.push({ severity: 'breaking', code: 'response_removed', target: `${key} ${status}`, message: `Response ${status} was removed` });
    }
    const oldSuccess = responseContent(oldResponses['200'] ?? oldResponses['201'] ?? oldResponses.default);
    const nextSuccess = responseContent(nextResponses['200'] ?? nextResponses['201'] ?? nextResponses.default);
    if (oldSuccess && nextSuccess && schemaType(oldSuccess) !== schemaType(nextSuccess)) {
      changes.push({ severity: 'breaking', code: 'response_type_changed', target: key, message: `Success response type changed from ${schemaType(oldSuccess)} to ${schemaType(nextSuccess)}` });
    }
    const oldRequired = new Set((oldOperation.parameters ?? []).filter((p) => p.required).map((p) => `${p.in}:${p.name}`));
    const nextRequired = new Set((nextOperation.parameters ?? []).filter((p) => p.required).map((p) => `${p.in}:${p.name}`));
    for (const parameter of nextRequired) {
      if (!oldRequired.has(parameter)) changes.push({ severity: 'breaking', code: 'required_parameter_added', target: `${key} ${parameter}`, message: `Required parameter ${parameter} was added` });
    }
  }

  for (const key of newOps.keys()) {
    if (!oldOps.has(key)) changes.push({ severity: 'non_breaking', code: 'operation_added', target: key, message: `${key} was added` });
  }

  return changes;
}

export function summary(changes) {
  return {
    breaking: changes.filter((change) => change.severity === 'breaking').length,
    nonBreaking: changes.filter((change) => change.severity === 'non_breaking').length,
    total: changes.length,
    status: changes.some((change) => change.severity === 'breaking') ? 'blocked' : 'safe'
  };
}
