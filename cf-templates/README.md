# Content Fragment Overlay (json2html) — Full Setup Guide

This renders the AEM Content Fragment as an Edge Delivery page using Adobe's
json2html overlay service. Once configured, the fragment publishes as an EDS
page (no client-side fetch, no CORS), and can be embedded with the existing
`fragment` block.

Reference: https://www.aem.live/developer/content-fragment-overlay

---

## Your specifics (fill-ins already resolved)

| Thing | Value |
|---|---|
| Org (GitHub owner) | `suladil` |
| Site (repo) | `omni` |
| Branch | `main` |
| Author host | `https://author-p95853-e878565.adobeaemcloud.com` |
| Publish host | `https://publish-p95853-e878565.adobeaemcloud.com` |
| Fragment path (DAM) | `/content/dam/wknd-universal/en/fragments/omni-hotels` |
| CF Model | `/conf/ref-demo-eds/settings/dam/cfm/models/cta` |
| Fields | `title`, `subtitle`, `description`, `bannerimage`, `ctalabel`, `ctaurl` |
| Template (in this repo) | `cf-templates/omni-hotels.html` |
| Target EDS path | `/fragments/omni-hotels` |

---

## Prerequisite: get an admin auth token

The Configuration Service (admin.hlx.page) needs an auth token tied to your
project. Easiest way:

1. Go to `https://admin.hlx.page/login/suladil/omni/main` in a browser and sign
   in with the account that administers the project.
2. After login, the token is set as a cookie `auth_token`. Copy its value.
   - In the browser: DevTools → Application → Cookies → `admin.hlx.page` →
     copy the `auth_token` value.
3. Use it below as the `x-auth-token` header. (Token expires; if calls return
   401, log in again and recopy.)

Export it once in your terminal so the commands below work as-is:

```bash
export AUTH_TOKEN="paste-the-auth_token-value-here"
```

---

## STEP 1 — Configure the json2html service

This tells the Adobe-hosted json2html worker how to fetch your fragment's JSON
and which template to render it with.

POST the config array to the worker's config endpoint for your org/site/branch:

```bash
curl -X POST \
  "https://json2html.adobeaem.workers.dev/config/suladil/omni/main" \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $AUTH_TOKEN" \
  -d '[
    {
      "path": "/fragments/",
      "endpoint": "https://author-p95853-e878565.adobeaemcloud.com/api/assets/wknd-universal/en/fragments/{{id}}.json",
      "regex": "/(?<=\\/fragments\\/)(.+)$/",
      "template": "/cf-templates/omni-hotels.html",
      "relativeURLPrefix": "https://publish-p95853-e878565.adobeaemcloud.com",
      "headers": { "Accept": "application/json" },
      "forwardHeaders": ["Authorization"]
    }
  ]'
```

Field meanings:
- **path** — the EDS URL prefix that triggers the overlay (`/fragments/`).
- **endpoint** — the AEM Assets JSON API for the fragment. `{{id}}` is filled
  from the published URL via `regex`. (For omni-hotels, `{{id}}` = `omni-hotels`.)
- **regex** — extracts the id portion after `/fragments/`.
- **template** — path to the Mustache template in THIS repo (already committed).
- **relativeURLPrefix** — makes asset (image) URLs absolute against publish.

---

## STEP 2 — Path mapping + model allow-list (`public.json`)

This maps the DAM fragment folder to the `/fragments/` EDS path and allow-lists
your CF model for the overlay.

```bash
curl -X POST \
  "https://admin.hlx.page/config/suladil/sites/omni/public.json" \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $AUTH_TOKEN" \
  -d '{
    "paths": {
      "mappings": [
        "/content/dam/wknd-universal/en/fragments/:/fragments/"
      ],
      "includes": [
        "/content/dam/wknd-universal/en/fragments/"
      ]
    },
    "xwalk": {
      "content-fragment-overlay": {
        "/content/dam/wknd-universal/en/fragments/**": {
          "includes": [
            "/conf/ref-demo-eds/settings/dam/cfm/models/cta"
          ]
        }
      }
    }
  }'
```

---

## STEP 3 — Point the content source at the overlay (`content.json`)

This makes the Admin API check the json2html overlay when publishing fragments
under the mapped path.

```bash
curl -X POST \
  "https://admin.hlx.page/config/suladil/sites/omni/content.json" \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $AUTH_TOKEN" \
  -d '{
    "source": {
      "url": "https://author-p95853-e878565.adobeaemcloud.com/bin/franklin.delivery/suladil/omni/main",
      "type": "markup",
      "suffix": ".html"
    },
    "overlay": {
      "url": "https://json2html.adobeaem.workers.dev/suladil/omni/main",
      "type": "markup"
    }
  }'
```

> NOTE: this REPLACES the existing content source config. The `source` block
> above mirrors your current `fstab.yaml` mountpoint so nothing else breaks.
> Confirm it matches before posting.

---

## STEP 4 — Publish the fragment

In AEM, select the fragment `omni-hotels` and **Publish** it. The Admin API
sees the overlay, json2html fetches the JSON, renders it through
`cf-templates/omni-hotels.html`, and ingests the result as an EDS page.

---

## Verify

```bash
# Preview tier
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://main--omni--suladil.aem.page/fragments/omni-hotels"

# Live tier
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://main--omni--suladil.aem.live/fragments/omni-hotels"
```

Expect `200`. Open the URL in a browser — it should be a standalone HTML page
with the title, subtitle, description, image, and CTA rendered.

Then on any page, the existing `fragment` block referencing
`/fragments/omni-hotels` will embed it.

---

## If fields render empty (template field-path mismatch)

The template uses `{{properties.elements.<field>.value}}`, which matches the
classic Assets JSON (`/api/assets/...json`). If the JSON your `endpoint`
returns is shaped differently, fields will be blank.

To check the real shape, open (logged in):
`https://author-p95853-e878565.adobeaemcloud.com/api/assets/wknd-universal/en/fragments/omni-hotels.json`

Then adjust the `{{...}}` paths in `cf-templates/omni-hotels.html` to match.
Paste me that JSON and I'll correct the template.
