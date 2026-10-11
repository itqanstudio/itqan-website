/**
 * A host slug ("ibrahim", "bisma"): the `?with=` value on /book and the CRM's
 * `booking_hosts.slug`. Same pattern as the CRM's check constraint.
 */
export const HOST_SLUG = /^[a-z][a-z0-9-]{1,30}$/;

/** The slug when the value is one, else undefined (a bad `?with=` is ignored, never echoed). */
export function parseHostSlug(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' && HOST_SLUG.test(first) ? first : undefined;
}
