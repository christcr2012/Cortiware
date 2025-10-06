// Federation configuration flags
// These flags allow enabling/disabling federation and toggling OIDC readiness.

function envBool(name: string, def: boolean): boolean {
  const v = process.env[name];
  if (v == null) return def;
  const s = String(v).trim().toLowerCase();
  return ['1','true','yes','on','y','t'].includes(s);
}

export const FED_ENABLED = envBool('FED_ENABLED', false);
export const FED_OIDC_ENABLED = envBool('FED_OIDC_ENABLED', false);

