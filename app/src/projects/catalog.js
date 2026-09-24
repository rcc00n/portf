export const approvedCases = { renter: "/work/renter" };
export const safeLink = href => {
  try { return ["https:", "http:"].includes(new URL(href).protocol) ? href : null; } catch { return null; }
};
const byOrder = (a, b) => a.order - b.order || a.id - b.id;
const byFeatured = (a, b) => a.featured_order - b.featured_order || byOrder(a, b);
export const publishedProjects = projects => projects.filter(project => project.is_published === true).sort(byOrder);
export const casePath = project => Object.hasOwn(approvedCases, project.slug) ? approvedCases[project.slug] : null;
export const projectLinks = project => [...(project.links || []), ...(project.url ? [{label:"Visit project", href:project.url}] : [])].filter(link => safeLink(link.href));
export const imageAlt = (project, image, index = 0) => image?.alt?.trim() || `${project.title} — project image ${index + 1}`;
export function presentProject(project) {
  const image = project.media?.[0];
  return {...project, key:project.slug, type:project.impact, href:casePath(project) || projectLinks(project)[0]?.href || "", image:image?.url, imageAlt:imageAlt(project,image)};
}
export function selectProjectEvidence(projects = []) {
  const published = publishedProjects(projects);
  return {
    lead:published.filter(project => project.featured_placement === "lead").sort(byFeatured)[0] || null,
    supporting:published.filter(project => project.featured_placement === "supporting").sort(byFeatured),
    archive:published.filter(project => !project.featured_placement),
  };
}
export const selectHomepageProjects = projects => selectProjectEvidence(projects).supporting.map(presentProject);
export async function loadHomepageProjects({apiBase = "", signal} = {}) {
  const response = await fetch(`${apiBase}/api/projects/`, {signal, cache:"no-store"});
  if (!response.ok) throw new Error(`Project catalog unavailable (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data) || data.some(project => !project || typeof project.slug !== "string" || typeof project.title !== "string" || typeof project.is_published !== "boolean" || !Number.isInteger(project.id) || !Number.isInteger(project.order) || !Number.isInteger(project.featured_order) || !["","lead","supporting"].includes(project.featured_placement) || (!Array.isArray(project.media) || project.media.some(image => !image || !Number.isInteger(image.id) || !Number.isInteger(image.order) || typeof image.alt !== "string" || !safeLink(image.url))))) {
    throw new Error("Invalid project catalog response");
  }
  return publishedProjects(data);
}
