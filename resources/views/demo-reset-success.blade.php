<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-g">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo Reset</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 40px; background: #f9fafb; color: #111827; }
        h2 { font-size: 1.5rem; font-weight: 600; }
        p { color: #6b7280; }
        h1 { background: #e5e7eb; padding: 20px; border-radius: 5px; font-size: 2.5em; letter-spacing: 2px; margin-top: 0.5rem; }
    </style>
</head>
<body>
    <div>
        <h2>✅ Success! The demo account has been reset.</h2>
        <p>Previous users have been logged out.</p>
        <p style="margin-top: 1rem;">Give this new password to the next group:</p>
        <h1>{{ $password }}</h1>
    </div>
</body>
</html>