import type { InputField, RunInput } from "./types.ts";

/**
 * Pure input validation, with no Next, database or request dependency, so it can
 * be unit tested directly. `lib/auth.ts` and `lib/api.ts` re-export from here.
 */

export type Problem = string | null;

export const MAX_FIELD_CHARS = Number(process.env.MAX_FIELD_CHARS ?? 20_000);

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

/**
 * Length first, then one letter and one digit, then a small blocklist.
 *
 * No symbol requirement and no maximum below 200: composition rules push people
 * towards `Password1!` and away from length, which is the only property that
 * actually matters. The blocklist covers what genuinely appears in
 * credential-stuffing lists, which a length rule alone lets through.
 */
export function validatePassword(password: string): Problem {
  if (password.length < 10) return "Password must be at least 10 characters.";
  if (password.length > 200) return "Password must be under 200 characters.";
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  if (/^(password|passw0rd|12345678|qwerty|letmein|welcome|admin123|iloveyou|abc12345)/i.test(password)) {
    return "That password appears in every breach list. Choose something else.";
  }
  return null;
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Deliberately permissive. The only reliable proof an address exists is sending
 * mail to it, so this rejects what is obviously not an address and gets out of
 * the way — over-strict regexes are how you end up rejecting real customers.
 */
export function validateEmail(email: string): Problem {
  const e = normaliseEmail(email);
  if (e.length < 5 || e.length > 254) return "Enter a valid email address.";
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e)) return "Enter a valid email address.";
  return null;
}

// ---------------------------------------------------------------------------
// Product input
// ---------------------------------------------------------------------------

export type ParseFailure = {
  ok: false;
  status: 400;
  error: string;
  details: {
    missingRequiredFields: string[];
    fieldsThatMustBeStrings: string[];
    fieldsOverLengthLimit: string[];
    maxFieldChars: number;
    expected: { name: string; type: string; required: boolean; options?: string[] }[];
  };
};

/**
 * Validates and normalises a request body against the product's input schema.
 *
 * Every declared field is present in the output, empty string when absent, so an
 * engine can read `input.foo` without guarding. Numbers and booleans are coerced
 * to strings because a JSON client will send `5` where the form sends `"5"` and
 * both should work.
 */
export function parseInput(
  body: unknown,
  fields: InputField[],
): { ok: true; value: RunInput } | { ok: false; failure: ParseFailure } {
  const describe = () =>
    fields.map((f) => ({
      name: f.name,
      type: f.type,
      required: Boolean(f.required),
      ...(f.options ? { options: f.options } : {}),
    }));

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      failure: {
        ok: false,
        status: 400,
        error: "Request body must be a JSON object.",
        details: {
          missingRequiredFields: fields.filter((f) => f.required).map((f) => f.name),
          fieldsThatMustBeStrings: [],
          fieldsOverLengthLimit: [],
          maxFieldChars: MAX_FIELD_CHARS,
          expected: describe(),
        },
      },
    };
  }

  const raw = body as Record<string, unknown>;
  const value: RunInput = {};
  const missing: string[] = [];
  const badType: string[] = [];
  const tooLong: string[] = [];

  for (const field of fields) {
    const v = raw[field.name];
    if (v === undefined || v === null || v === "") {
      if (field.required) missing.push(field.name);
      value[field.name] = "";
      continue;
    }
    if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") {
      badType.push(field.name);
      continue;
    }
    const s = String(v);
    if (s.length > MAX_FIELD_CHARS) {
      tooLong.push(field.name);
      continue;
    }
    value[field.name] = s;
  }

  if (missing.length > 0 || badType.length > 0 || tooLong.length > 0) {
    return {
      ok: false,
      failure: {
        ok: false,
        status: 400,
        error: "Invalid request body.",
        details: {
          missingRequiredFields: missing,
          fieldsThatMustBeStrings: badType,
          fieldsOverLengthLimit: tooLong,
          maxFieldChars: MAX_FIELD_CHARS,
          expected: describe(),
        },
      },
    };
  }
  return { ok: true, value };
}
