import { PRODUCT_OPTIONS, COMPLEXITY_OPTIONS, TEAM_OPTIONS, INTEGRATION_OPTIONS } from "../pages/engineering/estimateData.js";
export const fields={product:PRODUCT_OPTIONS,complexity:COMPLEXITY_OPTIONS,team:TEAM_OPTIONS,integrations:INTEGRATION_OPTIONS};
export const defaults={product:"CRM",complexity:"Lean",team:"Core",integrations:"Standard"};
export const budgetOptions=[{value:"under_5k",label:"Under $5k"},{value:"5_10k",label:"$5k–10k"},{value:"10_25k",label:"$10k–25k"},{value:"25_50k",label:"$25k–50k"},{value:"50k_plus",label:"$50k+"}];
export const timelineOptions=[{value:"urgent",label:"ASAP / 2–3 weeks"},{value:"soon",label:"4–8 weeks"},{value:"steady",label:"8–12 weeks"},{value:"flexible",label:"Flexible"}];
const projectMap={crm:"CRM",marketplace:"Marketplace",commerce:"E-commerce",saas:"SaaS"};
const complexityMap={simple:"Lean",medium:"Balanced",complex:"Advanced"};
const object=value=>value&&typeof value==="object"&&!Array.isArray(value)?value:{};
export function readStorage(key){try{return object(JSON.parse(localStorage.getItem(key)));}catch{return {};}}
export function saveStorage(key,value){try{localStorage.setItem(key,JSON.stringify({...value,updatedAt:new Date().toISOString()}));return true;}catch{return false;}}
export function validInputs(value={}){return Object.fromEntries(Object.entries(fields).filter(([key,options])=>options.some(option=>option.value===value?.[key])).map(([key])=>[key,value[key]]));}
export function loadDefinition(search=""){
  const raw=readStorage("qualificationGate");
  const qualification={};
  if(projectMap[raw.projectType]||raw.projectType==="unsure")qualification.projectType=raw.projectType;
  if(complexityMap[raw.complexity])qualification.complexity=raw.complexity;
  if(budgetOptions.some(x=>x.value===raw.budget))qualification.budget=raw.budget;
  if(timelineOptions.some(x=>x.value===raw.timeline))qualification.timeline=raw.timeline;
  const mapped=validInputs({product:projectMap[qualification.projectType],complexity:complexityMap[qualification.complexity]});
  const stored=validInputs(readStorage("estimateSnapshot"));
  const params=Object.fromEntries(new URLSearchParams(search));
  const query=validInputs({...params,product:projectMap[params.product]||params.product,complexity:complexityMap[params.complexity]||params.complexity});
  return {inputs:{...defaults,...mapped,...stored,...query},qualification,maturity:["idea","mvp","growth","scale","unknown"].includes(params.maturity)?params.maturity:null,hasInputs:Object.keys({...qualification,...stored,...query}).length>0};
}
export function inquiryQualification(inputs,qualification){
  const pair=(value,label)=>({value,label});
  const result={projectType:pair(inputs.product,inputs.product),complexity:pair(inputs.complexity,inputs.complexity)};
  for(const [key,options] of [["budget",budgetOptions],["timeline",timelineOptions]]){const option=options.find(x=>x.value===qualification[key]);if(option)result[key]=pair(option.value,option.label);}
  return result;
}
export function definitionSearch(inputs){return new URLSearchParams(validInputs(inputs)).toString();}
