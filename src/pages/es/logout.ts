import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ cookies, redirect }) => {
  // Clear session cookie
  cookies.delete('session', {
    path: '/'
  });

  const lang = 'es';
  return redirect(`/${lang}`, 302);
};
