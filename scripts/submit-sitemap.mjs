// Submit sitemap.xml to Google Search Console, using a service account.
//
// Why this exists: submitting a sitemap requires OAuth as a verified owner of the
// Search Console property. There is no anonymous API for it (the old
// google.com/ping?sitemap= endpoint was retired and now 404s for every URL), so an
// agent acting on the owner's behalf needs a credential the owner creates.
//
// Why node:https instead of fetch: in a restricted environment this script runs in,
// undici's fetch cannot reach the site host (UND_ERR_CONNECT_TIMEOUT) while a raw
// TLS connection on the same IP succeeds. node:https is used throughout so the
// check and the API calls behave identically everywhere, including Node versions
// older than 18 that have no global fetch.
//
// Zero new dependencies: the service-account JWT is RS256-signed with node:crypto
// and exchanged for an access token, rather than pulling in the ~40 MB `googleapis`
// package for a single API call.
//
// Setup (one time, by the site owner):
//   1. Create a service account in Google Cloud and download its JSON key.
//   2. In Search Console, add the service account's `client_email` as an OWNER
//      (Settings -> Users and permissions).
//   3. Set GSC_SERVICE_ACCOUNT_KEY to the JSON file path, or GSC_SERVICE_ACCOUNT_JSON
//      to the JSON itself, and GSC_SITE_URL to the property
//      (default "sc-domain:shairaambrosio.com").
//
// Usage: node scripts/submit-sitemap.mjs [--dry-run]

import crypto from "crypto";
import fs from "fs";
import https from "https";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters";
const DRY_RUN = process.argv.includes("--dry-run");

const SITE_URL = process.env.GSC_SITE_URL || "sc-domain:shairaambrosio.com";
const SITEMAP_URL = process.env.SITEMAP_URL || "https://shairaambrosio.com/sitemap.xml";

const fail = (msg) => {
  console.error(`\n  ERROR: ${msg}\n`);
  process.exit(1);
};

// Minimal promise wrapper around node:https. Follows redirects, returns
// { status, headers, body }.
const request = (url, { method = "GET", headers = {}, body = null, timeout = 20000 } = {}) =>
  new Promise((resolve, reject) => {
    const target = new URL(url);
    const req = https.request(
      {
        method,
        hostname: target.hostname,
        path: target.pathname + target.search,
        headers: { ...headers, ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}) },
        timeout,
      },
      (res) => {
        // Follow 3xx so the sitemap check tolerates http->https or locale redirects.
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          resolve(request(new URL(res.headers.location, url).toString(), { method, headers, body, timeout }));
          return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      },
    );
    req.on("timeout", () => req.destroy(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" })));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });

const base64url = (input) =>
  Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const loadCredentials = () => {
  const inline = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (inline) {
    try {
      return JSON.parse(inline);
    } catch (e) {
      fail(`GSC_SERVICE_ACCOUNT_JSON is not valid JSON: ${e.message}`);
    }
  }

  const file = process.env.GSC_SERVICE_ACCOUNT_KEY;
  if (file && fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }

  fail(
    [
      "No service-account credential found.",
      "",
      "  Set one of:",
      "    GSC_SERVICE_ACCOUNT_KEY   path to the service-account JSON key file",
      "    GSC_SERVICE_ACCOUNT_JSON  the JSON itself",
      "",
      '  Then add the key\'s "client_email" as an Owner in Search Console:',
      "    https://search.google.com/search-console/users",
    ].join("\n"),
  );
};

const getAccessToken = async (creds) => {
  if (!creds.client_email || !creds.private_key) {
    fail('Credential is missing "client_email" or "private_key" - is it a service-account key?');
  }
  if (creds.type !== "service_account") {
    fail(`Credential type is "${creds.type}"; a "service_account" key is required.`);
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: creds.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${signer.sign(creds.private_key).toString("base64url")}`;

  const res = await request(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString(),
  }).catch((e) => fail(`Could not reach Google's token endpoint: ${e.code || e.message}`));

  let parsed = {};
  try {
    parsed = JSON.parse(res.body);
  } catch {
    /* fall through to the status check */
  }

  if (res.status !== 200) {
    const detail = parsed.error_description || parsed.error || `${res.status}`;
    if (/invalid_grant|unauthorized_client/i.test(String(detail))) {
      fail(
        [
          `Google rejected the token request: ${detail}`,
          "",
          "  Common causes:",
          "  - The key was deleted or the service account was disabled.",
          "  - The machine clock is skewed by more than a few minutes.",
        ].join("\n"),
      );
    }
    fail(`Token request failed (${res.status}): ${detail}`);
  }

  return parsed.access_token;
};

const listSites = async (token) => {
  const res = await request("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) return [];
  try {
    return (JSON.parse(res.body).siteEntry || []).map((s) => ({ url: s.siteUrl, level: s.permissionLevel }));
  } catch {
    return [];
  }
};

const run = async () => {
  console.log("Search Console sitemap submission");
  console.log(`  property : ${SITE_URL}`);
  console.log(`  sitemap  : ${SITEMAP_URL}`);
  if (DRY_RUN) console.log("  mode     : DRY RUN (no submission sent)");

  console.log("\n[1/3] Checking the sitemap is publicly reachable...");
  const res = await request(SITEMAP_URL).catch((e) => fail(`Could not reach ${SITEMAP_URL}: ${e.code || e.message}`));
  if (res.status !== 200) fail(`Sitemap returned ${res.status}: ${SITEMAP_URL}`);

  const urlCount = (res.body.match(/<loc>/g) || []).length;
  const hasNamespace = /sitemaps\.org\/schemas\/sitemap/.test(res.body);
  console.log(`      ok: 200, ${urlCount} URLs, valid namespace: ${hasNamespace}`);
  if (!hasNamespace) fail("Sitemap is missing the sitemaps.org namespace; Google will reject it.");

  console.log("\n[2/3] Authenticating service account...");
  const creds = loadCredentials();
  console.log(`      account: ${creds.client_email}`);
  const token = await getAccessToken(creds);
  console.log("      ok: access token acquired");

  const sites = await listSites(token);
  const match = sites.find((s) => s.url === SITE_URL);
  if (!match) {
    const known = sites.map((s) => `        ${s.url} (${s.level})`).join("\n");
    fail(
      [
        `The service account does not have access to "${SITE_URL}".`,
        "",
        "  Grant it Owner access in Search Console:",
        "    https://search.google.com/search-console/users",
        `  Account to add: ${creds.client_email}`,
        known ? `\n  Properties this account can see:\n${known}` : "\n  This account can see no properties yet.",
      ].join("\n"),
    );
  }
  console.log(`      ok: ${match.level} access to ${match.url}`);

  if (DRY_RUN) {
    console.log(`\n[3/3] DRY RUN - would PUT ${SITEMAP_URL}`);
    console.log("\nDry run complete: credentials and access verified.\n");
    return;
  }

  console.log("\n[3/3] Submitting the sitemap...");
  const submit = await request(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`,
    { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
  ).catch((e) => fail(`Submission request failed: ${e.code || e.message}`));

  if (submit.status >= 300) {
    fail(`Submission failed (${submit.status}): ${submit.body.slice(0, 300)}`);
  }

  console.log(`      ok: accepted (${submit.status}). Google will fetch and process it.`);
  console.log("\nDone. Processing usually takes about a day. Status:");
  console.log(`  https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(SITE_URL)}\n`);
};

await run();
