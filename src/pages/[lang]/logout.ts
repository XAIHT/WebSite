import type { APIRoute } from 'astro';
import { languages } from '../../lib/i18n';

export const GET: APIRoute = ({ params, cookies, redirect }) => {
  // Clear session cookie
  cookies.delete('session', {
    path: '/'
  });

  const lang = params.lang;
  const locale = lang && lang in languages ? lang : 'en';
  return redirect(`/${locale}`, 302);
};
