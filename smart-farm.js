const fmt = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
const num = id => Math.max(0,Number(document.getElementById(id).value)||0);
const defaults={area:2,yieldA:1200,price:32,production:18000,marketcost:5000,fixed:3000,techcost:10000,life:4,uplift:0,saving:5,loss:5,priceDrop:20};
function model(yieldFactor=1,priceFactor=1,tech=false){
 const area=num("area"), y=num("yieldA")*yieldFactor, price=num("price")*priceFactor;
 const loss=Math.min(80,num("loss"))/100;
 const quantity=area*y*(1-loss);
 const revenue=quantity*price;
 const production=area*num("production")*(tech?(1-Math.min(80,num("saving"))/100):1);
 const market=area*num("marketcost");
 const fixed=num("fixed");
 const techAnnual=tech?(num("techcost")/Math.max(1,num("life"))):0;
 const costs=production+market+fixed+techAnnual;
 return {area,quantity,revenue,production,market,fixed,techAnnual,costs,net:revenue-costs,price};
}
function moneyMetric(id,value){const el=document.getElementById(id);el.textContent=fmt(value);el.closest(".metric").classList.toggle("negative",value<0)}
function calculate(){
 const base=model(1,1,false);
 const tech=model(1+Math.max(-50,Math.min(100,Number(document.getElementById("uplift").value)||0))/100,1,true);
 const downside=model(.85,1-Math.min(90,num("priceDrop"))/100,true);
 moneyMetric("baselineMetric",base.net);moneyMetric("techMetric",tech.net);moneyMetric("differenceMetric",tech.net-base.net);
 const be=tech.quantity>0?tech.costs/tech.quantity:0;
 document.getElementById("breakEvenMetric").textContent=fmt(be)+"/kg";
 const rows=[
  {label:"Baseline revenue",v:base.revenue,type:""},
  {label:"Baseline total cost",v:base.costs,type:"cost"},
  {label:"Baseline net profit/loss",v:base.net,type:"net"},
  {label:"Technology revenue",v:tech.revenue,type:""},
  {label:"Technology total cost*",v:tech.costs,type:"cost"},
  {label:"Technology net profit/loss",v:tech.net,type:"net"}
 ];
 const max=Math.max(1,...rows.map(r=>Math.abs(r.v)));
 document.getElementById("barChart").innerHTML=rows.map(r=>`<div class="bar-row"><span>${r.label}</span><div class="bar-track"><div class="bar-fill ${r.type}" style="width:${Math.min(100,Math.abs(r.v)/max*100)}%;${r.v<0?"background:#b75b48":""}"></div></div><span class="bar-value">${r.v<0?"−":""}${fmt(Math.abs(r.v))}</span></div>`).join("");
 const scenarios=[
 {title:"Baseline",desc:"Current method and current costs.",v:base.net},
 {title:"Technology scenario",desc:"Uses your assumed yield change and production-cost saving; annualises tech cost.",v:tech.net},
 {title:"Downside stress test",desc:`Yield 15% lower and price ${num("priceDrop")}% lower than the base assumption.`,v:downside.net}
 ];
 document.getElementById("scenarioGrid").innerHTML=scenarios.map(s=>`<article class="scenario"><h4>${s.title}</h4><p>${s.desc}</p><strong style="color:${s.v<0?"#a44931":"#214d35"}">${fmt(s.v)}</strong></article>`).join("");
 const difference=tech.net-base.net;
 const paybackAnnual=tech.net-base.net;
 const payback=paybackAnnual>0&&num("techcost")>0?num("techcost")/paybackAnnual:null;
 document.getElementById("calcExplanation").innerHTML=`<strong>How to read this:</strong> Baseline net = saleable revenue − production costs − harvest/marketing costs − fixed costs. Technology net also includes annualised equipment cost (${fmt(tech.techAnnual)} per season). Break-even price is the technology scenario's total cost divided by saleable quantity. ${payback!==null?`If the assumed improvement repeats, the simple indicative payback is about ${payback.toFixed(1)} crop seasons; this is not a guarantee and excludes financing, tax, breakdowns and changes in prices.`:"The technology scenario does not improve net profit under these inputs, so a payback period cannot be estimated."} *Technology scenario cost savings and yield change are assumptions you entered, not promised results. All amounts are before any tax treatment and may omit costs you have not entered.`;
}
document.getElementById("calculate").addEventListener("click",calculate);
document.getElementById("resetCalc").addEventListener("click",()=>{Object.entries(defaults).forEach(([id,v])=>document.getElementById(id).value=v);const savedArea=Number(localStorage.getItem("krushiPathAcres"));if(savedArea>0) document.getElementById("area").value=savedArea;calculate();});
document.querySelectorAll(".calc-field input").forEach(el=>el.addEventListener("change",calculate));
const savedArea=Number(localStorage.getItem("krushiPathAcres"));
if(savedArea>0) document.getElementById("area").value=savedArea;
calculate();
