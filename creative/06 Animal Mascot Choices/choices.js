const animals = [
  {id:'hare',name:'Hare',summary:'Quick, bright, all ears.',description:'The lightest runner of the crew. Long ears, a quick grin and a silhouette you can spot from across the track.',motion:'Motion idea: ears lag behind each stride, then spring up before a big hop.'},
  {id:'fox',name:'Fox',summary:'Sharp, nimble, a little cheeky.',description:'The clever pace-setter. A pointed face and a big sweeping tail bring a little mischief to the morning.',motion:'Motion idea: ears perk up for an idea spark; the tail flicks after a clean jump.'},
  {id:'raccoon',name:'Raccoon',summary:'Scrappy, curious, ready to tinker.',description:'The maker of the crew. Expressive paws, a striped tail and a knowing look give this one a resourceful personality.',motion:'Motion idea: paws gather ideas, eyebrows react, and the striped tail curls at each stop.'},
  {id:'otter',name:'Otter',summary:'Easygoing, social, up for it.',description:'The one who brings everyone along. A compact shape, soft muzzle and sturdy tail make a warmer, more playful teammate.',motion:'Motion idea: a bouncy jog, a whole-body cheer, and a relaxed little recovery stretch.'},
  {id:'deer',name:'Deer',summary:'Light-footed. Quietly confident.',description:'The meadow native. Big ears, small antlers and a poised stance take the character closer to the midsummer direction.',motion:'Motion idea: a light springing stride, alert ear turns and a gentle nod at the finish.'}
];
const key='running-hackathon-animal-choice-v1';
let picked=null,current=0,opener=null;
try{const saved=localStorage.getItem(key);if(animals.some(a=>a.id===saved))picked=saved;}catch{}
const $=s=>document.querySelector(s),dialog=$('#preview');
$('#lineup').innerHTML=animals.map(a=>`<article class="animal" id="${a.id}"><button class="art-button" type="button" data-preview="${a.id}" aria-label="Preview ${a.name}"><img src="assets/${a.id}-preview.webp" alt="${a.name} mascot in a forest-green running kit and brick-orange shoes" width="1024" height="1536"></button><h2>${a.name}</h2><p>${a.summary}</p><button class="try" type="button" data-preview="${a.id}"><span class="try-label">Try ${a.name.toLowerCase()} on the track</span><span aria-hidden="true">↗</span></button></article>`).join('');
function showPicked(){
  for(const a of animals){const el=$('#'+a.id),selected=picked===a.id;el.classList.toggle('is-picked',selected);el.querySelector('.try-label').textContent=selected?'Your pick · see it again':`Try ${a.name.toLowerCase()} on the track`;}
  $('#selection').hidden=!picked;$('#picked-name').textContent=animals.find(a=>a.id===picked)?.name||'';
}
function render(){
  const a=animals[current];$('#preview-title').textContent=a.name;$('#preview-description').textContent=a.description;$('#motion-note').textContent=a.motion;
  $('#preview-image').src=`assets/${a.id}-preview.webp`;$('#preview-image').alt=`${a.name} mascot on the morning track`;$('#position').innerHTML=`<span class="sr-only">${a.name}, </span>${current+1} / ${animals.length}`;
  $('#pick').textContent=picked===a.id?`${a.name} is your pick ✓`:`Pick ${a.name.toLowerCase()}`;
  $('#download').href=`assets/${a.id}.png`;$('#download').download=`running-hackathon-${a.id}-concept.png`;
  const url=new URL(location.href);url.searchParams.set('animal',a.id);history.replaceState(null,'',url);
}
function open(id,source){current=Math.max(0,animals.findIndex(a=>a.id===id));opener=source;render();dialog.showModal();document.body.classList.add('preview-open');}
function close(){dialog.close();}
function advance(step){current=(current+step+animals.length)%animals.length;render();}
$('#lineup').addEventListener('click',e=>{const b=e.target.closest('[data-preview]');if(b)open(b.dataset.preview,b);});
$('#close-preview').addEventListener('click',close);$('#previous').addEventListener('click',()=>advance(-1));$('#next').addEventListener('click',()=>advance(1));
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();advance(1);}if(e.key==='ArrowLeft'){e.preventDefault();advance(-1);}});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('preview-open');const url=new URL(location.href);url.searchParams.delete('animal');history.replaceState(null,'',url);opener?.focus({preventScroll:true});});
$('#pick').addEventListener('click',()=>{const a=animals[current];picked=a.id;try{localStorage.setItem(key,picked);}catch{}showPicked();$('#announcement').textContent=`${a.name} is your pick. All five animals stay available.`;close();});
$('#clear-pick').addEventListener('click',()=>{picked=null;try{localStorage.removeItem(key);}catch{}showPicked();$('#announcement').textContent='Choice cleared. All five animals are available.';});
showPicked();
const requested=new URLSearchParams(location.search).get('animal');if(animals.some(a=>a.id===requested))open(requested,null);
