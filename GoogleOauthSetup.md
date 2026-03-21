# Google OAuth Setup Guide

To fully enable the "Sign in with Google" functionality you see on the Login and Registration pages, you must configure a Google Cloud Project to obtain your OAuth assets (`Client ID` and `Client Secret`).

Follow this detailed step-by-step guide:

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown in the top navigation bar and select **New Project**.
3. Give your project a name (e.g., "XAIHT Web App") and click **Create**.
4. Once created, make sure that project is selected in the top navigation bar.

## 2. Configure the OAuth Consent Screen
*This screen tells users who is requesting access to their Google data.*
1. In the left sidebar, navigate to **APIs & Services** > **OAuth consent screen**.
2. Choose **External** (unless you only want organization members to log in) and click **Create**.
3. Fill in the required App information:
   - **App name**: XAIHT
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue**.
5. *Scopes*: You can skip adding specific scopes for now (the default `email`, `profile`, and `openid` are sufficient). Click **Save and Continue**.
6. *Test users*: If your app is not yet published, add your own email address here so you can test it. Click **Save and Continue**, then skip back to the Dashboard.

## 3. Create Credentials (Client ID & Secret)
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. Select **Web application** under Application type.
4. Give it a name, like "XAIHT Web Client".
5. **Authorized JavaScript origins**:
   - Add `http://localhost:4321` (for local development).
   - Add your production URL (e.g., `https://xaiht.com`) later.
6. **Authorized redirect URIs**:
   - Add `http://localhost:4321/api/auth/callback/google` (or whatever specific callback route you establish).
7. Click **Create**.

## 4. Save Your Credentials to the Project
You will be presented with a **Client ID** and a **Client Secret**. Never commit these to your repository!

1. Create a `.env` file in the root of your `e:\XAIHT\WebSite` directory (if it doesn't already exist).
2. Add your credentials like so:
```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

> [!TIP]
> To handle the backend functionality of these credentials securely in Astro, it is recommended to use an authentication library like [Auth.js (NextAuth for Astro)](https://authjs.dev/reference/astro) or [Lucia Auth](https://lucia-auth.com/).
