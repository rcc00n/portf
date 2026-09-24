export const redirects={
  "/projects":"/work", "/cases/renter-architecture":"/work/renter", "/engineering":"/systems",
  "/architecture-preview":"/systems/architecture", "/admin-first":"/systems#control", "/production-ready":"/systems#production",
  "/decisions":"/systems/decisions", "/journal":"/systems/decisions", "/admin-demo":"/systems/demo", "/demo/admin":"/systems/demo",
  "/services":"/approach#scope", "/process":"/approach#working-together", "/tech":"/approach#engineering", "/about":"/approach#practice", "/not-for-everyone":"/approach#fit", "/pricing":"/approach#engagement",
  "/contact":"/start", "/estimate":"/start/define", "/summary":"/start/define#summary", "/pre-call":"/start#next-step",
};
export const queryValues={
  product:["CRM","SaaS","Marketplace","E-commerce","crm","saas","marketplace","commerce","unsure","unknown","not sure","Not sure","not sure yet"],
  complexity:["Lean","Balanced","Advanced","simple","medium","complex"], team:["Small","Core","Expanded"], integrations:["None","Standard","Heavy"],
  maturity:["idea","mvp","growth","scale","unknown"],source:["homepage"],definition:["1"],
};
export function migrationDestination(path,search="",hash=""){
  const target=redirects[path];if(!target)return null;
  const [base,anchor]=target.split("#");const result=new URLSearchParams();
  if(base.startsWith("/start"))for(const [key,value] of new URLSearchParams(search))if(queryValues[key]?.includes(value))result.set(key,value);
  if(path==="/contact"&&(result.has("product")||result.has("complexity")))result.set("definition","1");
  return base+(result.size?`?${result}`:"")+(anchor?`#${anchor}`:hash);
}
