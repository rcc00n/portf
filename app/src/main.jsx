import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import RouteMetadata from "./components/RouteMetadata.jsx";
import LegacyRedirect from "./site/LegacyRedirect.jsx";
import { redirects } from "./site/routeMigration.js";

const HomePage=lazy(()=>import("./home/HomePage.jsx"));
const SiteShell=lazy(()=>import("./site/SiteShell.jsx"));
const WorkPage=lazy(()=>import("./site/WorkPages.jsx").then(m=>({default:m.WorkPage})));
const RenterPage=lazy(()=>import("./site/WorkPages.jsx").then(m=>({default:m.RenterPage})));
const SystemsPage=lazy(()=>import("./site/SystemsPages.jsx").then(m=>({default:m.SystemsPage})));
const ArchitecturePage=lazy(()=>import("./site/SystemsPages.jsx").then(m=>({default:m.ArchitecturePage})));
const DecisionsPage=lazy(()=>import("./site/SystemsPages.jsx").then(m=>({default:m.DecisionsPage})));
const DemoPage=lazy(()=>import("./site/DemoPage.jsx"));
const ApproachPage=lazy(()=>import("./site/ApproachPage.jsx"));
const StartPage=lazy(()=>import("./site/StartPages.jsx").then(m=>({default:m.StartPage})));
const DefinePage=lazy(()=>import("./site/StartPages.jsx").then(m=>({default:m.DefinePage})));
const PrivacyPage=lazy(()=>import("./pages/legal/LegalPages.jsx").then(m=>({default:m.PrivacyPage})));
const TermsPage=lazy(()=>import("./pages/legal/LegalPages.jsx").then(m=>({default:m.TermsPage})));
const NotFound=lazy(()=>import("./site/SiteShell.jsx").then(m=>({default:m.NotFound})));
const TracePrototype=lazy(()=>import("./prototype/TracePrototype.jsx"));
const loader=<div style={{minHeight:"100svh",background:"#0d0e0c"}}/>;
const page=element=><Suspense fallback={loader}>{element}</Suspense>;

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><BrowserRouter><RouteMetadata/><Routes>
  <Route path="/" element={page(<HomePage/>)}/>
  {Object.keys(redirects).map(path=><Route key={path} path={path} element={<LegacyRedirect/>}/>)}
  <Route path="/prototype/*" element={page(<TracePrototype/>)}/>
  <Route element={page(<SiteShell/>)}>
    <Route path="/work" element={page(<WorkPage/>)}/><Route path="/work/renter" element={page(<RenterPage/>)}/>
    <Route path="/systems" element={page(<SystemsPage/>)}/><Route path="/systems/architecture" element={page(<ArchitecturePage/>)}/><Route path="/systems/decisions" element={page(<DecisionsPage/>)}/><Route path="/systems/demo" element={page(<DemoPage/>)}/>
    <Route path="/approach" element={page(<ApproachPage/>)}/><Route path="/start" element={page(<StartPage/>)}/><Route path="/start/define" element={page(<DefinePage/>)}/>
    <Route path="/privacy" element={page(<PrivacyPage/>)}/><Route path="/terms" element={page(<TermsPage/>)}/>
    <Route path="*" element={page(<NotFound/>)}/>
  </Route>
</Routes></BrowserRouter></React.StrictMode>);
