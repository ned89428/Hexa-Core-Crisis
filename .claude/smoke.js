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
console.log('offer:',state.perkOffer.map(p=>p.name).join(','),'| aiPick:',state.aiPick,'| ePerks:',state.ePerks.join(','));
choosePerk(0);
console.log('pPerks:',state.pPerks.join(','));
PERKS.find(p=>p.id==='drill').apply(state.pMods);
PERKS.find(p=>p.id==='gale').apply(state.pMods);
state.staged=['fast','fast'];
const syn=computeSynergy(state.staged,'P');
console.log('syn names:',syn.names.join(','),'| spdMul:',syn.spdMul);
PERKS.find(p=>p.id==='refund').apply(state.pMods);
state.pE=100; launchSquad();
console.log('pE after launch (expect refund +25/syn):',state.pE.toFixed(1));
for(let i=0;i<10;i++) update(0.2);
console.log('creeps spawned:',state.creeps.length,'first spdMul:',state.creeps[0]&&state.creeps[0].spdMul.toFixed(2));
// run 30 simulated seconds to shake out runtime errors
for(let i=0;i<300;i++) update(0.1);
console.log('30s sim OK | pPerks:',state.pPerks.length,'ePerks:',state.ePerks.length);
console.log('ALL OK');
`;
const out = path.join(require('os').tmpdir(), 'hexa_run.js');
fs.writeFileSync(out, pre + src + post);
require('child_process').execFileSync('node', [out], { stdio: 'inherit' });
