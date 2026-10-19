import {createHybrid} from './base-hybrids.js';
const versions = [
  {id:'current',name:'Current Meadow lane',description:'The starting point. Original photograph, colour and typography.',change:'The current version'},
  {id:'warm-negative',name:'Warm negative',description:'Softer contrast, a touch of warm film colour and slightly more breathing room in the headline.',change:'A little softer and warmer'},
  {id:'club-print',name:'Club print',description:'A little more weight in the type. Quiet run-club character, with the photograph kept close to the original.',change:'A little more ink'},
  {id:'sun-faded',name:'Sun-faded stock',description:'Gently lifted shadows, mellow greens and warmer paper. The lightest type of the three new directions.',change:'A little more sun-worn'},
];
const known=new Set(['compare',...versions.map(v=>v.id)]);
const root=document.querySelector('#concept-root');
const comparison=document.querySelector('#comparison');
const picker=document.querySelector('#version');
const compareButton=document.querySelector('#compare-button');
const notes=document.querySelector('#study-notes');
const embedded=new URLSearchParams(location.search).get('embed')==='1';
if(embedded){document.body.classList.add('embedded');document.documentElement.classList.add('is-embedded')}

const sponsorSubject = 'Sponsorship enquiry | Running Hackathon San Francisco';
const sponsorBody = [
  'Hi Running Hackathon team,',
  '',
  'I’d like to explore sponsoring the San Francisco event.',
  '',
  'Name: [Your name]',
  'Company: [Company name]',
  'Website: [Company website]',
  'How we’d like to get involved: [A few words about your ideas or support]',
  '',
  'Please send over the sponsorship options and next steps.',
  '',
  'Thanks,',
  '[Your name]',
].join('\r\n');
const sponsorEmail = `mailto:runninghackathon@gmail.com?subject=${encodeURIComponent(sponsorSubject)}&body=${encodeURIComponent(sponsorBody)}`;

function buildPreviews(){
if(embedded||document.querySelector('#studies-grid').childElementCount)return;
document.querySelector('#studies-grid').innerHTML=versions.map(v=>`<article class="study-card" data-study="${v.id}"><div class="study-card-heading"><h2>${v.name}</h2><a href="?version=${v.id}">Explore <span aria-hidden="true">↗</span></a></div><a class="study-preview" href="?version=${v.id}" aria-label="Explore ${v.name}"><iframe src="?version=${v.id}&amp;embed=1" title="${v.name} desktop preview" width="1440" height="1260" tabindex="-1" aria-hidden="true" loading="eager"></iframe></a><p>${v.description}</p></article>`).join('');
}

function scalePreviews(){
  document.querySelectorAll('.study-preview').forEach(stage=>stage.style.setProperty('--preview-scale',stage.clientWidth/1440));
}
function mount(choice,updateURL=false){
  const next=known.has(choice)?choice:'compare';
  document.body.dataset.version=next;
  picker.value=next;
  comparison.hidden=next!=='compare';
  root.hidden=next==='compare';
  notes.hidden=next==='compare';
  compareButton.setAttribute('aria-pressed',String(next==='compare'));
  if(next==='compare'){
    buildPreviews();
    root.replaceChildren();
    document.title='Meadow lane · Logo studies';
    scalePreviews();
  }else{
    const v=versions.find(item=>item.id===next);
    root.replaceChildren(createHybrid('hybrid-2'));
    root.querySelector('[data-nav]').replaceWith(document.querySelector('#shared-nav').content.cloneNode(true));
    const brands = document.createElement('nav');
    brands.className = 'brand-row';
    brands.setAttribute('aria-label', 'Featured brands');
    brands.innerHTML = `<a class="brand-red-bull" href="https://www.redbull.com/" target="_blank" rel="noopener noreferrer"><img src="assets/brands/red-bull.svg" alt="Red Bull" width="225" height="36"></a><a class="brand-posthog" href="https://posthog.com/" target="_blank" rel="noopener noreferrer"><img src="assets/brands/posthog.svg" alt="PostHog" width="200" height="54"></a><a class="brand-cognition" href="https://cognition.com/" target="_blank" rel="noopener noreferrer"><img src="assets/brands/cognition.png" alt="Cognition" width="220" height="54"></a>`;
    root.querySelector('.meadow-lede').after(brands);
    const contact = document.createElement('section');
    contact.className = 'brand-contact';
    contact.setAttribute('aria-labelledby', 'contact-title');
    contact.innerHTML = `<h2 id="contact-title">Sponsor the San Francisco event.</h2><p><a href="${sponsorEmail}">Join as a sponsor <span aria-hidden="true">↗</span></a></p>`;
    brands.after(contact);
    document.querySelector('#study-title').textContent=v.name+'.';
    document.querySelector('#study-description').textContent=v.description;
    document.title=`Meadow lane · ${v.name}`;
  }
  if(updateURL){const url=new URL(location.href);url.searchParams.set('version',next);url.hash='';history.pushState(null,'',url)}
  window.scrollTo({top:0,behavior:'instant'});
}
picker.addEventListener('change',()=>mount(picker.value,true));
compareButton.addEventListener('click',()=>mount('compare',true));
window.addEventListener('popstate',()=>mount(new URLSearchParams(location.search).get('version')));
new ResizeObserver(scalePreviews).observe(document.querySelector('#studies-grid'));
mount(new URLSearchParams(location.search).get('version')||'compare');
