STEP 3 - AUTHENTICATION FOR THIS PORTFOLIO

Files:
- index.html: your original portfolio with Login link and authentication modal added
- style.css: your original CSS plus modal styles
- auth-config.js: Supabase URL and browser publishable key placeholders
- auth.js: email registration/login, Google OAuth, TOTP MFA, logout
- dashboard.html / dashboard.js: separate dashboard guarded by session + AAL2 check

SETUP
1. Keep these files together in the same folder.
2. Create a Supabase project: https://supabase.com/dashboard
3. In auth-config.js, set supabaseUrl and supabasePublishableKey from your project.
   Never use a service_role/secret key in browser files.
4. Supabase Authentication -> Providers: enable Email. Keep email confirmation on.
5. Supabase Authentication -> URL Configuration:
   Site URL: http://localhost:5500
   Redirect URL allowlist: http://localhost:5500/**
6. Configure Google OAuth in Google Cloud Console:
   JavaScript origin: http://localhost:5500
   Authorized redirect URI: exact Supabase callback URL shown in Supabase's Google provider settings.
   Paste Google Client ID and Client Secret into Supabase Google provider settings.
   Never put the Google Client Secret in this website's files.
7. Open a terminal in this folder and run:
   python -m http.server 5500
8. Open http://localhost:5500/index.html
9. Create account -> confirm email -> login -> enroll TOTP MFA -> open dashboard -> logout.

IMPORTANT
- Test on localhost via HTTP server, not by double-clicking the HTML file.
- This static dashboard check is not sufficient to protect private data by itself: HTML can be downloaded by anyone. Use Supabase RLS policies and server-side authorization/AAL2 checks for any private database rows or APIs.
- Do not commit auth-config.js if your repository policy treats project identifiers as private; the publishable key is designed for browser apps, but do not add service secrets.
- Add your production HTTPS domain to Supabase redirect allowlist before deploying.


PROFILE DETAILS UPDATED FROM THE PROVIDED HTML
- Name: Rachamadugu Sri Lakshmi Himasri
- Integrated M.Tech in Computer Science Engineering, VIT-AP University, 2023–2028
- CGPA: 8.36 / 10
- Skills: Python, Java, JavaScript, HTML, CSS, MySQL, MATLAB
- Projects: Automatic Irrigation System Using Fuzzy Logic; Personal Portfolio Website
- Certificates: Agentic AI; Pinnacle
- Email: himasri756@gmail.com
- LinkedIn: https://www.linkedin.com/in/himasri-rachamadugu-5a755a382/
- GitHub: https://github.com/himasri756-gif

RESUME
Open resume.html in a browser and select "Print / Save as PDF" to save a PDF copy.

AUTHENTICATION
The existing Supabase authentication files and project structure are retained. Authentication still depends on the configured Supabase project and provider settings.
