// Build & run a stubbed-DOM smoke test for index.html's <script>
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const src = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const pre = `
const stubElCached={textContent:''};
const stubEl=()=>({textContent:'',innerHTML:'',style:{},classList:{toggle(){},add(){},remove(){}},appendChild(){},querySelectorAll:()=>[],querySelector:()=>stubElCached,addEventListener(){},getContext:()=>new Proxy({},{get:()=>()=>{}}),width:920,height:500});
const document={getElementById:()=>stubEl(),createElement:()=>stubEl(),addEventListener(){}};
const performance={now:()=>Date.now()};
const requestAnimationFrame=()=>{};
`;
const post = `
startBattle();
state.perkTimer=0.01; update(0.02);
console.log('offer:',state.perkOffer.map(p=>p.name).join(','),'| aiPick:',state.aiPick);
choosePerk(0);
// tag-based synergies: wing(飛行·疾行)+ghost(魔法·疾行)x2+fast(疾行·野獸) → 疾風陣(疾行4)+奧術迷霧(魔法2)+空襲?(飛行1 no)
state.staged=['wing','ghost','ghost','fast'];
let syn=computeSynergy(state.staged,'P');
console.log('tag syn:',syn.names.join(','),'| evade:',syn.evade);
// rainbow: 5 distinct
state.staged=['fast','mid','tank','wing','titan'];
syn=computeSynergy(state.staged,'P');
console.log('rainbow:',syn.names.join(','));
// gourd via tags: mid has 護衛, wing/fast have 疾行 → fast,wing(疾行2)+mid,tank(護衛2)
state.staged=['fast','wing','mid','tank'];
syn=computeSynergy(state.staged,'P');
console.log('gourd check:',syn.names.includes('葫蘆小隊'));
// stage cap
state.staged=['fast','fast','fast','fast','fast']; state.pE=999; state.hand=[{kind:'creep',id:'fast'},{kind:'creep',id:'fast'},{kind:'creep',id:'fast'},{kind:'creep',id:'fast'},{kind:'creep',id:'fast'}];
playCard(0);
console.log('cap holds:',state.staged.length===5);
launchSquad();
for(let i=0;i<10;i++) update(0.2);
const g=state.creeps.find(k=>k.type==='fast');
console.log('creeps spawned:',state.creeps.length);
// 60s sim with AI to shake out healer/evade runtime paths
for(let i=0;i<600;i++) update(0.1);
console.log('60s sim OK | creeps alive:',state.creeps.length,'| ePerks:',state.ePerks.length);
console.log('ALL OK');
`;
const out = path.join(require('os').tmpdir(), 'hexa_run.js');
fs.writeFileSync(out, pre + src + post);
require('child_process').execFileSync('node', [out], { stdio: 'inherit' });
