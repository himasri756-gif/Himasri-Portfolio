// The dashboard stays hidden until a valid user session and MFA AAL2 are verified.
(async () => {
  const cfg = window.PORTFOLIO_AUTH_CONFIG;
  const loading = document.getElementById("loading");
  const content = document.getElementById("dashboard-content");
  const errorLabel = document.getElementById("dashboard-error");
  const goLogin = () => window.location.replace(new URL("index.html?login=1", window.location.href));

  if (!window.supabase?.createClient || !cfg?.supabaseUrl ||
      cfg.supabaseUrl.includes("YOUR_PROJECT_ID") ||
      !cfg.supabasePublishableKey ||
      cfg.supabasePublishableKey.includes("YOUR_PUBLISHABLE_KEY")) {
    loading.textContent = "Configure auth-config.js before testing authentication.";
    return;
  }

  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
  try {
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) return goLogin();

    const { data: assurance, error: assuranceError } =
      await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError) throw assuranceError;

    if (assurance.currentLevel !== "aal2" || assurance.nextLevel !== "aal2") {
      return goLogin();
    }

    document.getElementById("user-email").textContent = user.email || "";
    document.getElementById("user-id").textContent = user.id || "";
    loading.hidden = true;
    content.hidden = false;

    document.getElementById("dashboard-logout").addEventListener("click", async () => {
      const { error } = await client.auth.signOut();
      if (error) {
        errorLabel.textContent = error.message;
        return;
      }
      window.location.replace(new URL("index.html", window.location.href));
    });

    client.auth.onAuthStateChange(event => {
      if (event === "SIGNED_OUT") goLogin();
    });
  } catch (error) {
    loading.textContent = "Unable to verify access.";
    errorLabel.textContent = error?.message || "Unknown error.";
  }
})();
