const button=document.querySelector('.menu-button');
const links=document.querySelector('.nav-links');
button.addEventListener('click',()=>{const open=links.classList.toggle('open');button.setAttribute('aria-expanded',String(open));});
links.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>links.classList.remove('open')));

const hero=document.querySelector('.hero');
const musicButton=document.querySelector('.music-toggle');
const musicLabel=document.querySelector('.music-label');
let audioContext=null;
let masterGain=null;
let musicTimer=null;
let musicEnabled=true;
let heroVisible=true;

const chords=[
  [110,130.81,164.81],
  [98,123.47,146.83],
  [87.31,110,130.81],
  [82.41,103.83,123.47]
];

function playChord(notes){
  if(!audioContext||audioContext.state!=='running'||!heroVisible||!musicEnabled)return;
  const now=audioContext.currentTime;
  notes.forEach((frequency,index)=>{
    const oscillator=audioContext.createOscillator();
    const gain=audioContext.createGain();
    oscillator.type=index===0?'sine':'triangle';
    oscillator.frequency.value=frequency;
    oscillator.detune.value=index===1?-5:index===2?4:0;
    gain.gain.setValueAtTime(0,now);
    gain.gain.linearRampToValueAtTime(index===0?.035:.018,now+1.8);
    gain.gain.setValueAtTime(index===0?.035:.018,now+5.5);
    gain.gain.exponentialRampToValueAtTime(.0001,now+8);
    oscillator.connect(gain).connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now+8.1);
  });
}

function startSequence(){
  if(musicTimer||!heroVisible||!musicEnabled)return;
  let chordIndex=0;
  playChord(chords[chordIndex]);
  musicTimer=setInterval(()=>{chordIndex=(chordIndex+1)%chords.length;playChord(chords[chordIndex]);},7000);
}

function stopSequence(){
  if(musicTimer){clearInterval(musicTimer);musicTimer=null;}
  if(masterGain&&audioContext){masterGain.gain.cancelScheduledValues(audioContext.currentTime);masterGain.gain.setTargetAtTime(0,audioContext.currentTime,.35);}
}

async function activateMusic(){
  if(!audioContext){
    audioContext=new (window.AudioContext||window.webkitAudioContext)();
    masterGain=audioContext.createGain();
    masterGain.gain.value=.75;
    masterGain.connect(audioContext.destination);
  }
  await audioContext.resume();
  masterGain.gain.setTargetAtTime(.75,audioContext.currentTime,.4);
  musicEnabled=true;
  musicButton.classList.add('playing');
  musicButton.setAttribute('aria-pressed','true');
  musicLabel.textContent='Musique active';
  startSequence();
}

musicButton.addEventListener('click',async()=>{
  if(musicEnabled&&audioContext?.state==='running'){
    musicEnabled=false;stopSequence();musicButton.classList.remove('playing');musicButton.setAttribute('aria-pressed','false');musicLabel.textContent='Activer la musique';
  }else await activateMusic();
});

const heroObserver=new IntersectionObserver(([entry])=>{
  heroVisible=entry.isIntersecting&&entry.intersectionRatio>.35;
  if(heroVisible&&musicEnabled&&audioContext?.state==='running'){masterGain.gain.setTargetAtTime(.75,audioContext.currentTime,.5);startSequence();}
  else stopSequence();
},{threshold:[.35]});
heroObserver.observe(hero);

activateMusic().catch(()=>{musicButton.classList.add('needs-action');});
