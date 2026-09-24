import contract from '../../../backend/config/route_metadata.json' with { type: 'json' };
export { contract };
export const ROUTE_META = contract.routes;
export const normalizePath = pathname => pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
export function getMetaForPath(pathname, project = null, status = 'ready') {
  const path = normalizePath(pathname);
  let meta = contract.routes[path];
  if (meta?.caseSlug) {
    meta = status === 'error' ? contract.unavailable
      : project?.slug === meta.caseSlug && project.is_published === true
        ? { title: `${project.title} — ${contract.siteName}`, description: project.blurb || '' }
        : contract.notFound;
  }
  const found = meta && meta !== contract.notFound && meta !== contract.unavailable;
  return { image: contract.image, ...meta || contract.notFound, path, canonical: found ? path : null };
}
export const fontPaths = path => [
  '/fonts/instrument-sans-latin.woff2', '/fonts/ibm-plex-mono-400-latin.woff2',
  ...(['/', '/start', '/start/define'].includes(path) ? ['/fonts/ibm-plex-mono-500-latin.woff2'] : []),
];
export function metaTags(meta, origin) {
  return {
    description: meta.description, robots: meta.noindex ? 'noindex, follow' : 'index, follow',
    'raccn:canonical-origin': origin, 'raccn:route': meta.path,
    'og:type': 'website', 'og:site_name': contract.siteName,
    'og:title': meta.title, 'og:description': meta.description,
    'og:url': meta.canonical ? origin + meta.canonical : null,
    'og:image': origin + meta.image, 'og:image:width': '1200', 'og:image:height': '630',
    'og:image:alt': contract.imageAlt,
    'twitter:card': 'summary_large_image', 'twitter:title': meta.title,
    'twitter:description': meta.description, 'twitter:image': origin + meta.image,
    'twitter:image:alt': contract.imageAlt,
  };
}
export function applyMetadata(meta) {
  const origin = document.querySelector('meta[name="raccn:canonical-origin"]')?.content || contract.origin;
  document.title = meta.title;
  for (const [name, value] of Object.entries(metaTags(meta, origin))) {
    const attribute = name.startsWith('og:') ? 'property' : 'name';
    let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (value === null) { element?.remove(); continue; }
    if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, name); document.head.appendChild(element); }
    element.content = value;
  }
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!meta.canonical) { canonical?.remove(); return; }
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = origin + meta.canonical;
}
export function renderMetadataHead(meta, origin = contract.origin) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[c]));
  return [`<title>${escape(meta.title)}</title>`,
    ...Object.entries(metaTags(meta, origin)).filter(([,value])=>value!==null).map(([name,value])=>`<meta ${name.startsWith('og:')?'property':'name'}="${name}" content="${escape(value)}" />`),
    ...(meta.canonical ? [`<link rel="canonical" href="${escape(origin + meta.canonical)}" />`] : []),
    ...fontPaths(meta.path).map(path=>`<link rel="preload" href="${path}" as="font" type="font/woff2" crossorigin />`),
  ].join('\n');
}
