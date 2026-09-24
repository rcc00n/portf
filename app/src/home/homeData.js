// Historical reference only. Never used as a publication fallback.
export const legacyCuratedProjects = [
  {
    key: "bad-guy-motors",
    match: ["bad guy motors", "motorcycle"],
    title: "Bad Guy Motors",
    href: "https://badguymotors.com",
    type: "Product & service website",
    blurb: "A fabrication and parts website bringing service information, project builds, and customer inquiries into one place.",
    image: "/home/media/bad-guy-motors.webp",
    imageAlt: "Bad Guy Motors fabrication and diesel shop website",
  },
  {
    key: "worlddoc",
    match: ["worlddoc", "doctor finder"],
    title: "WorldDoc",
    href: "https://rcc00n.github.io/prj_E/",
    type: "Directory system",
    blurb: "A global doctor directory shaped around specialty and region-based search.",
    image: "/home/media/worlddoc.webp",
    imageAlt: "WorldDoc doctor directory interface",
  },
];

export { loadHomepageProjects, selectHomepageProjects } from "../projects/catalog.js";

export const systemModes = [
  { id: "architecture", index: "01", label: "Architecture", route: "/systems/architecture" },
  { id: "control", index: "02", label: "Admin-first", route: "/systems#control" },
  { id: "readiness", index: "03", label: "Production", route: "/systems#production" },
];

export const approachSteps = [
  {
    index: "01",
    title: "Frame the problem",
    body: "Name the actors, constraints, and failure paths before choosing the shape of the product.",
  },
  {
    index: "02",
    title: "Choose the system",
    body: "Make architecture decisions explicit: what they enable, what they cost, and when they should change.",
  },
  {
    index: "03",
    title: "Build both sides",
    body: "Develop customer flows and operator controls together, so the product works beyond the happy path.",
  },
  {
    index: "04",
    title: "Ship for recovery",
    body: "Bring monitoring, audit trails, and rollback paths into production with the feature.",
  },
];
