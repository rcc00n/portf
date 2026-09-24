const image = "/social/raccn-code.png";
const withSite = title => `${title} — RACCN Code`;
export const ROUTE_META = {
  "/": {title:"RACCN Code — Digital systems made visible",description:"Digital products and the systems, controls, and operational logic behind them."},
  "/work": {title:withSite("Selected work"),description:"Published product and operational interface evidence from RACCN Code."},
  "/work/renter": {title:withSite("Renter"),description:"A rental marketplace through its customer, provider, and operational control surfaces."},
  "/systems": {title:withSite("Systems"),description:"Architecture, operational control, production considerations, and explicit engineering decisions."},
  "/systems/architecture": {title:withSite("Architecture explorer"),description:"Explore conceptual system responsibilities by product type and operating scale."},
  "/systems/decisions": {title:withSite("Decision records"),description:"Architecture decisions with their context, trade-offs, and conditions for change."},
  "/systems/demo": {title:withSite("Operational demo"),description:"A clearly labelled fictional simulation of operator controls and customer views.",noindex:true},
  "/approach": {title:withSite("Approach"),description:"How RACCN moves from a product problem through system decisions, implementation, and production."},
  "/start": {title:withSite("Start a project"),description:"Send your name, email, and project context. RACCN replies by email to discuss the next step."},
  "/start/define": {title:withSite("Project definition"),description:"An optional estimator for indicative timeline, budget, and system responsibilities."},
  "/privacy": {title:withSite("Privacy Policy"),description:"How RACCN Code handles project inquiries, saved choices, and personal information."},
  "/terms": {title:withSite("Terms of Use"),description:"Terms for using the RACCN Code website, project examples, and third-party content."},
};
export const getMetaForPath = pathname => ({image,...(ROUTE_META[pathname] || {title:withSite("Page not found"),description:"This route is not available. Explore the work or start a project.",noindex:true})});
