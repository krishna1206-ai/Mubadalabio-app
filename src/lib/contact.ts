import { apiUrl } from './api';

export type ContactForm = {
  name: string;
  email: string;
  mobile: string;
  department: string;
  message: string;
};

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

/** Saves the message through the app's backend (src/app/api/contact+api.ts). Throws on failure. */
export async function submitContact(form: ContactForm): Promise<void> {
  const res = await fetch(apiUrl('/api/contact'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error(`Contact request failed (${res.status})`);
}
