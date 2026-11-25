import { BLOCKS } from "../pages/engineering/architectureData.js";
const layouts = {
  MVP: [[140,95],[500,95],[860,95],[140,350],[500,350],[860,350]],
  Growth: [[140,95],[500,180],[860,95],[140,350],[500,350],[860,350]],
  Scale: [[140,95],[500,95],[860,210],[140,350],[500,350],[860,350]],
};
const nodes = ["frontend","backend","integrations","admin","database","analytics"].map(id=>BLOCKS.find(block=>block.id===id));
const connections = [[0,1],[1,2],[1,4],[3,1],[4,5]];
export default function SystemGraph({ active, onSelect, scale="MVP", product="CRM" }) {
  const points = layouts[scale] || layouts.MVP;
  return <div className="site-system-graph" data-scale={scale}>
    <svg viewBox="0 0 1000 450" preserveAspectRatio="none" aria-hidden="true"><g className="site-graph-grid"><path d="M0 95H1000M0 350H1000M140 0V450M500 0V450M860 0V450" /></g>{connections.map(([from,to],i)=>{
      const a=points[from],b=points[to];const selected=[nodes[from].id,nodes[to].id].includes(active);
      const d=`M${a[0]} ${a[1]}H${(a[0]+b[0])/2}V${b[1]}H${b[0]}`;
      return <g key={i} className={selected ? "is-active" : ""}><path d={d} /><path key={`${scale}-${product}-${active}`} className="site-graph-signal" pathLength="1" d={d} /></g>;
    })}</svg>
    {nodes.map((block,i)=><button key={block.id} style={{left:`${points[i][0]/10}%`,top:`${points[i][1]/4.5}%`}} type="button" aria-pressed={active===block.id} onClick={()=>onSelect(block.id)}><span>0{i+1}</span>{block.label}<i aria-hidden="true" /></button>)}
  </div>;
}
