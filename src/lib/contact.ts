export type ContactForm = {
  name: string;
  email: string;
  mobile: string;
  department: string;
  message: string;
};

/**
 * Endpoint that receives contact form submissions as JSON.
 * The website's own form is not exposed as a public API, so set this to a
 * backend URL (e.g. a WordPress REST route or form service) before release.
 */
export const CONTACT_ENDPOINT = '';

type ErrorMessages = { errName: string; errEmail: string; errDepartment: string; errMessage: string };

/** Returns an error message per invalid field, in the language of `messages`. */
export function validate(form: ContactForm, messages: ErrorMessages) {
  const errors: Partial<Record<keyof ContactForm, string>> = {};
  if (!form.name.trim()) errors.name = messages.errName;
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = messages.errEmail;
  if (!form.department) errors.department = messages.errDepartment;
  if (!form.message.trim()) errors.message = messages.errMessage;
  return errors;
}

/** Returns true when the message was delivered to CONTACT_ENDPOINT. */
export async function submitContact(form: ContactForm): Promise<boolean> {
  if (!CONTACT_ENDPOINT) return false;
  const res = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error(`Contact request failed (${res.status})`);
  return true;
}
