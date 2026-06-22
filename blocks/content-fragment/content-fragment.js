/*
 * Content Fragment Block
 * On the EDS delivery tier, embeds the fragment rendered by the json2html
 * overlay (inlines {mappedPath}.plain.html). In the Universal Editor / author
 * the overlay does not exist, so the block fetches the Content Fragment
 * Delivery API directly (same-origin in the editor) and renders the fields
 * itself, giving authors a faithful live preview.
 */

// Maps the authored DAM fragment path to the EDS path the overlay serves.
//   /content/dam/wknd-universal/en/fragments/  ->  /fragments/
const DAM_FRAGMENTS_PREFIX = '/content/dam/wknd-universal/en/fragments/';
const EDS_FRAGMENTS_PREFIX = '/fragments/';

/** Strips an absolute host and a trailing .html from a reference. */
function cleanRef(ref) {
  return (ref || '').trim().replace(/^https?:\/\/[^/]+/, '').replace(/\.html$/, '');
}

/** Converts an authored reference to the EDS overlay path. */
function toEdsPath(ref) {
  const path = cleanRef(ref);
  if (path.startsWith(DAM_FRAGMENTS_PREFIX)) {
    return EDS_FRAGMENTS_PREFIX + path.slice(DAM_FRAGMENTS_PREFIX.length);
  }
  return path;
}

/** Converts an authored reference to the DAM fragment path. */
function toDamPath(ref) {
  const path = cleanRef(ref);
  if (path.startsWith(EDS_FRAGMENTS_PREFIX)) {
    return DAM_FRAGMENTS_PREFIX + path.slice(EDS_FRAGMENTS_PREFIX.length);
  }
  return path;
}

/**
 * True when rendering inside the AEM author / Universal Editor, where the
 * json2html overlay does not exist (the editor previews from the author host).
 * @returns {boolean}
 */
function isAuthorEnvironment() {
  return window.location.hostname.includes('.adobeaemcloud.com');
}

/** Flattens the CF Delivery API `fields` array into a name -> value map. */
function normalizeFields(data) {
  if (!data || !Array.isArray(data.fields)) return {};
  return data.fields.reduce((acc, field) => {
    if (!field || !field.name) return acc;
    const values = Array.isArray(field.values) ? field.values : [];
    acc[field.name] = field.multiple ? values : values[0];
    return acc;
  }, {});
}

/** First non-empty value among candidate field names (case-insensitive). */
function pickField(fields, keys) {
  const lower = Object.keys(fields).reduce((acc, k) => {
    acc[k.toLowerCase()] = fields[k];
    return acc;
  }, {});
  return keys
    .map((k) => lower[k.toLowerCase()])
    .find((v) => v !== undefined && v !== null && v !== '');
}

/** Prefixes a root-relative AEM path with the current (author) origin. */
function resolveRef(ref) {
  if (!ref || typeof ref !== 'string') return '';
  if (/^https?:\/\//.test(ref)) return ref;
  if (ref.startsWith('/')) return `${window.location.origin}${ref}`;
  return ref;
}

/** Builds paragraph elements from a plain-text body (blank lines = paragraphs). */
function buildBody(value) {
  const plain = typeof value === 'object' ? (value && value.plaintext) : value;
  if (!plain || !String(plain).trim()) return null;
  const container = document.createElement('div');
  container.className = 'content-fragment-text';
  String(plain)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((para) => {
      const p = document.createElement('p');
      para.split('\n').forEach((line, i) => {
        if (i > 0) p.append(document.createElement('br'));
        p.append(document.createTextNode(line));
      });
      container.append(p);
    });
  return container.childElementCount ? container : null;
}

/**
 * Renders the fragment from the CF Delivery API for the author/editor preview.
 * @param {Element} block
 * @param {string} damPath the DAM path of the fragment
 */
async function renderAuthorPreview(block, damPath) {
  let data = null;
  try {
    const url = `/adobe/sites/cf/fragments?path=${encodeURIComponent(damPath)}`;
    const resp = await fetch(url, { credentials: 'include' });
    if (resp.ok) {
      const json = await resp.json();
      data = Array.isArray(json.items) ? json.items[0] : json;
    }
  } catch (e) {
    data = null;
  }
  if (!data) return;

  const fields = normalizeFields(data);
  const title = pickField(fields, ['title', 'heading', 'name']);
  const subtitle = pickField(fields, ['subtitle', 'subheading', 'kicker']);
  const bodyRaw = pickField(fields, ['description', 'body', 'text', 'content']);
  const imagePath = pickField(fields, ['bannerimage', 'image', 'featuredImage', 'thumbnail']);
  const ctaHref = pickField(fields, ['ctaurl', 'ctaLink', 'link', 'url', 'href']);
  const ctaLabel = pickField(fields, ['ctalabel', 'ctaText', 'linkLabel']) || 'Learn more';

  if (imagePath && typeof imagePath === 'string') {
    const figure = document.createElement('div');
    figure.className = 'content-fragment-image';
    const img = document.createElement('img');
    img.src = resolveRef(imagePath);
    img.alt = title || '';
    img.loading = 'lazy';
    figure.append(img);
    block.append(figure);
  }

  const body = document.createElement('div');
  body.className = 'content-fragment-body';
  if (title) {
    const h = document.createElement('h2');
    h.className = 'content-fragment-title';
    h.textContent = title;
    body.append(h);
  }
  if (subtitle) {
    const sub = document.createElement('p');
    sub.className = 'content-fragment-subtitle';
    sub.textContent = subtitle;
    body.append(sub);
  }
  const text = buildBody(bodyRaw);
  if (text) body.append(text);
  if (ctaHref) {
    const p = document.createElement('p');
    p.className = 'button-container content-fragment-cta';
    const a = document.createElement('a');
    a.className = 'button';
    a.href = resolveRef(ctaHref);
    a.textContent = ctaLabel;
    p.append(a);
    body.append(p);
  }
  if (body.childElementCount) block.append(body);
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const ref = link ? link.getAttribute('href') : block.textContent.trim();

  block.textContent = '';

  if (isAuthorEnvironment()) {
    await renderAuthorPreview(block, toDamPath(ref));
    return;
  }

  const path = toEdsPath(ref);
  if (!path || !path.startsWith('/')) return;

  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) return;

  const tmp = document.createElement('div');
  tmp.innerHTML = await resp.text();

  // The overlay's optimized images use paths relative to the fragment (./media_*).
  // Rebase them against the fragment path so they resolve on the host page.
  const rebase = (tag, attr) => {
    tmp.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((el) => {
      el[attr] = new URL(el.getAttribute(attr), new URL(path, window.location)).href;
    });
  };
  rebase('img', 'src');
  rebase('source', 'srcset');

  const rendered = tmp.querySelector('.content-fragment') || tmp;
  block.append(...rendered.childNodes);
}
