import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;
  
  // Handle root redirect
  if (pathname === '/') {
    return redirect('/en', 302);
  }
  
  // Check if user is authenticated
  const session = cookies.get('session');
  const isLoggedIn = !!session?.value;
  
  // Protect panel routes
  if (pathname.startsWith('/en/panel') || pathname.startsWith('/es/panel')) {
    if (!isLoggedIn) {
      const lang = pathname.startsWith('/es') ? 'es' : 'en';
      return redirect(`/${lang}/login`, 302);
    }
  }
  
  // Redirect logged-in users away from login
  if (pathname.startsWith('/en/login') || pathname.startsWith('/es/login')) {
    if (isLoggedIn) {
      const lang = pathname.startsWith('/es') ? 'es' : 'en';
      return redirect(`/${lang}/panel`, 302);
    }
  }
  
  return next();
});
