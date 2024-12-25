export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function createSuccessHtml(profile: { username: string }, redirectPath: string) {
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Instagram Connected</title>
        <script>
          window.opener.postMessage({ 
            type: 'INSTAGRAM_AUTH_SUCCESS',
            profile: ${JSON.stringify(profile)}
          }, '*');
          window.location.href = '${redirectPath}';
        </script>
      </head>
      <body>
        <h1>Successfully connected Instagram!</h1>
        <p>Redirecting you to your dashboard...</p>
      </body>
    </html>
    `,
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    }
  );
}

export function createErrorHtml(error: string) {
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Connection Failed</title>
        <script>
          window.opener.postMessage({ 
            type: 'INSTAGRAM_AUTH_ERROR',
            error: ${JSON.stringify(error)}
          }, '*');
          window.close();
        </script>
      </head>
      <body>
        <h1>Failed to connect Instagram</h1>
        <p>${error}</p>
        <p>You can close this window now.</p>
      </body>
    </html>
    `,
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    }
  );
}