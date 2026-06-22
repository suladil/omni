/*
 * Content Fragment Block
 * Renders a structured AEM Content Fragment referenced by an author.
 * The author references a CF via an aem-content field (a path). At runtime the
 * block calls the AEM Content Fragment Delivery API for that path and renders
 * the common fields (title, subtitle, description, image, cta) defensively.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

// AEM host that serves the Content Fragment Delivery API and DAM assets.
// Content references in the fragment (image, cta) are paths on this host.
const AEM_HOST = 'https://publish-p95853-e878565.adobeaemcloud.com';

/**
 * Normalizes the AEM CF Delivery API response into a flat map of
 * field name -> value. The delivery API returns fields as an array:
 *   { fields: [ { name, type, multiple, values: [...] }, ... ] }
 * Single-valued fields are unwrapped from their values array.
 * @param {object} data Parsed JSON from the CF Delivery API
 * @returns {object} flattened field map
 */
function normalizeFields(data) {
  if (!data || typeof data !== 'object') return {};

  if (Array.isArray(data.fields)) {
    return data.fields.reduce((acc, field) => {
      if (!field || !field.name) return acc;
      const values = Array.isArray(field.values) ? field.values : [];
      acc[field.name] = field.multiple ? values : values[0];
      return acc;
    }, {});
  }

  // Fallback: already-flat object (e.g. { fields: { title: ... } } or flat).
  if (data.fields && typeof data.fields === 'object') return data.fields;
  return data;
}

/**
 * Picks the first defined, non-empty value among the candidate keys.
 * @param {object} fields field map
 * @param {string[]} keys candidate field names (case-insensitive)
 * @returns {*} the matched value or undefined
 */
function pickField(fields, keys) {
  const lower = Object.keys(fields).reduce((acc, k) => {
    acc[k.toLowerCase()] = fields[k];
    return acc;
  }, {});
  return keys
    .map((k) => lower[k.toLowerCase()])
    .find((v) => v !== undefined && v !== null && v !== '');
}

/**
 * Prefixes an AEM content path (e.g. /content/dam/...) with the AEM host so it
 * resolves from an EDS page. Leaves absolute URLs untouched.
 * @param {string} ref
 * @returns {string}
 */
function resolveRef(ref) {
  if (!ref || typeof ref !== 'string') return '';
  if (/^https?:\/\//.test(ref)) return ref;
  if (ref.startsWith('/')) return `${AEM_HOST}${ref}`;
  return ref;
}

/**
 * Renders a body value into paragraph elements. Rich text may arrive as an HTML
 * string, an object with html/plaintext, or plain text with newlines.
 * @param {*} value
 * @returns {HTMLElement|null}
 */
function buildBody(value) {
  if (!value) return null;
  const container = document.createElement('div');
  container.className = 'content-fragment-text';

  const html = typeof value === 'object' ? (value.html || '') : '';
  if (html) {
    container.innerHTML = html;
    return container;
  }

  const plain = typeof value === 'object' ? (value.plaintext || '') : String(value);
  if (!plain.trim()) return null;
  plain
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((para) => {
      const p = document.createElement('p');
      // preserve single newlines within a paragraph as line breaks
      para.split('\n').forEach((line, i) => {
        if (i > 0) p.append(document.createElement('br'));
        p.append(document.createTextNode(line));
      });
      container.append(p);
    });
  return container.childElementCount ? container : null;
}

/**
 * Resolves the CF reference path from the authored block markup.
 * @param {Element} block
 * @returns {string}
 */
function getReferencePath(block) {
  const link = block.querySelector('a');
  if (link) return link.getAttribute('href');
  return block.textContent.trim();
}

/**
 * Fetches the Content Fragment Delivery API JSON for a given fragment path.
 * @param {string} path the DAM path of the fragment
 * @returns {Promise<object|null>}
 */
async function fetchFragmentData(path) {
  if (!path) return null;
  const url = `${AEM_HOST}/adobe/sites/cf/fragments?path=${encodeURIComponent(path)}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    // The query-by-path form returns a list; single-id form returns the object.
    if (Array.isArray(json.items)) return json.items[0] || null;
    return json;
  } catch (e) {
    return null;
  }
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const path = getReferencePath(block);
  const data = await fetchFragmentData(path);
  block.textContent = '';
  if (!data) return;

  const fields = normalizeFields(data);

  const title = pickField(fields, ['title', 'heading', 'name']);
  const subtitle = pickField(fields, ['subtitle', 'subheading', 'kicker']);
  const bodyRaw = pickField(fields, ['description', 'body', 'text', 'content']);
  const imagePath = pickField(fields, ['bannerimage', 'image', 'featuredImage', 'thumbnail', 'asset']);
  const imageAlt = pickField(fields, ['imageAlt', 'altText', 'alt']) || title || '';
  const ctaHref = pickField(fields, ['ctaurl', 'ctaLink', 'ctaHref', 'link', 'url', 'href']);
  const ctaLabel = pickField(fields, ['ctalabel', 'ctaText', 'linkLabel']) || 'Learn more';

  // Image. CF content references are DAM paths on the AEM host, so resolve them
  // and render a plain <img>. createOptimizedPicture only works for EDS media.
  if (imagePath && typeof imagePath === 'string') {
    const figure = document.createElement('div');
    figure.className = 'content-fragment-image';
    if (imagePath.includes('/media_')) {
      figure.append(createOptimizedPicture(imagePath, imageAlt, false, [{ width: '750' }]));
    } else {
      const img = document.createElement('img');
      img.src = resolveRef(imagePath);
      img.alt = imageAlt;
      img.loading = 'lazy';
      figure.append(img);
    }
    block.append(figure);
  }

  const bodyWrapper = document.createElement('div');
  bodyWrapper.className = 'content-fragment-body';

  if (title) {
    const h = document.createElement('h2');
    h.className = 'content-fragment-title';
    h.textContent = title;
    bodyWrapper.append(h);
  }

  if (subtitle) {
    const sub = document.createElement('p');
    sub.className = 'content-fragment-subtitle';
    sub.textContent = subtitle;
    bodyWrapper.append(sub);
  }

  const body = buildBody(bodyRaw);
  if (body) bodyWrapper.append(body);

  if (ctaHref) {
    const p = document.createElement('p');
    p.className = 'button-container content-fragment-cta';
    const a = document.createElement('a');
    a.className = 'button';
    a.href = resolveRef(ctaHref);
    a.textContent = ctaLabel;
    p.append(a);
    bodyWrapper.append(p);
  }

  if (bodyWrapper.childElementCount) block.append(bodyWrapper);
}
