export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const createSuccessHtml = (data: any, redirectPath: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Instagram Connection Successful</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script>
          window.onload = function() {
            window.opener.postMessage({ type: 'instagram-success', data: ${JSON.stringify(data)} }, '*');
            setTimeout(() => {
              window.location.href = '${redirectPath}';
            }, 1000);
          }
        </script>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f9fafb;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          }
          h1 { color: #10b981; margin-bottom: 1rem; }
          p { color: #374151; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Success!</h1>
          <p>Your Instagram account has been connected successfully.</p>
          <p>Redirecting you back...</p>
        </div>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html',
    },
  });
};

export const createErrorHtml = (error: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Instagram Connection Error</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script>
          window.onload = function() {
            window.opener.postMessage({ type: 'instagram-error', error: '${error}' }, '*');
          }
        </script>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f9fafb;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          }
          h1 { color: #ef4444; margin-bottom: 1rem; }
          p { color: #374151; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Error</h1>
          <p>${error}</p>
          <p>You can close this window and try again.</p>
        </div>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html',
    },
  });
};