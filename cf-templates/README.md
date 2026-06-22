# Content Fragment Overlay (json2html) Setup

This renders AEM Content Fragments as Edge Delivery pages using the json2html
overlay service. Once configured, fragments publish as EDS pages and can be
embedded with the existing `fragment` block — no client-side fetch required.

Reference: https://www.aem.live/developer/content-fragment-overlay

## Fragment

- Path: `/content/dam/wknd-universal/en/fragments/omni-hotels`
- Model: `/conf/ref-demo-eds/settings/dam/cfm/models/cta`
- Fields: `title`, `subtitle`, `description`, `bannerimage`, `ctalabel`, `ctaurl`
- Template: `cf-templates/omni-hotels.html`

## Admin steps (require AEM Cloud / Config Service access)

### 1. json2html service config

```json
[{
  "path": "/fragments/",
  "endpoint": "https://author-p95853-e878565.adobeaemcloud.com/api/assets/wknd-universal/en/fragments/{{id}}.json",
  "regex": "/(?<=\\/fragments\\/)(.+)$/",
  "template": "/cf-templates/omni-hotels.html",
  "relativeURLPrefix": "https://publish-p95853-e878565.adobeaemcloud.com",
  "headers": { "Accept": "application/json" }
}]
```

### 2. Config Service `public.json` — path mapping + model allow-list

```json
{
  "paths": {
    "mappings": ["/content/dam/wknd-universal/en/fragments/:/fragments/"],
    "includes": ["/content/dam/wknd-universal/en/fragments/"]
  },
  "xwalk": {
    "content-fragment-overlay": {
      "/content/dam/wknd-universal/en/fragments/**": {
        "includes": ["/conf/ref-demo-eds/settings/dam/cfm/models/cta"]
      }
    }
  }
}
```

### 3. Content source overlay (`content.json`)

Point the `overlay.url` at the json2html worker for this org/site/branch, then
re-publish the fragment. The Admin API checks the overlay, json2html transforms
the fragment JSON to HTML via the template above, and ingests it as an EDS page.

## Verification / caveat

The template's `{{...}}` field paths (e.g. `properties.elements.bannerimage.value`)
assume the classic Assets JSON shape returned by the `endpoint`. The CF Delivery
API uses a different shape, so the first render may reveal a path mismatch —
adjust the template field paths if fields render empty.
