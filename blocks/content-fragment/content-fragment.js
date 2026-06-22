/*
 * Content Fragment Block
 * Embeds an AEM Content Fragment that is published to EDS via the json2html
 * overlay. The author references the fragment by its DAM path (through the
 * aem-content-fragment picker); the overlay serves the rendered fragment at a
 * mapped EDS path. This block converts the DAM path to the mapped path and
 * inlines the overlay's already-rendered HTML.
 */

// Maps the authored DAM fragment path to the EDS path the overlay serves.
// Mirrors the path mapping configured in the site config (public.json):
//   /content/dam/wknd-universal/en/fragments/  ->  /fragments/
const DAM_FRAGMENTS_PREFIX = '/content/dam/wknd-universal/en/fragments/';
const EDS_FRAGMENTS_PREFIX = '/fragments/';

/**
 * Converts an authored fragment reference to the EDS path served by the
 * json2html overlay. Leaves already-mapped or unknown paths untouched.
 * @param {string} ref
 * @returns {string}
 */
function toEdsPath(ref) {
  if (!ref) return '';
  let path = ref.trim();
  // Strip an absolute author/publish host if present.
  path = path.replace(/^https?:\/\/[^/]+/, '');
  if (path.startsWith(DAM_FRAGMENTS_PREFIX)) {
    path = EDS_FRAGMENTS_PREFIX + path.slice(DAM_FRAGMENTS_PREFIX.length);
  }
  // Drop a trailing extension (e.g. .html) if the picker added one.
  return path.replace(/\.html$/, '');
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const ref = link ? link.getAttribute('href') : block.textContent.trim();
  const path = toEdsPath(ref);

  block.textContent = '';
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

  // The overlay returns the rendered fragment wrapped in its own
  // .content-fragment div. Lift the inner content into this block (which is
  // already .content-fragment) so styling applies and no nested block is
  // re-decorated.
  const rendered = tmp.querySelector('.content-fragment') || tmp;
  block.append(...rendered.childNodes);
}
