
const BPM = 80;             
const HIT_MS = 180;           
const SWING = 0;             

function rand(min, max){ return min + Math.random() * (max - min); }
function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }


const SENTENCES = [
  "바람은 우리가 잊고 있던 길을 기억하는지도 모른다.",
  "작은 불빛 하나가 방 안의 어둠을 설득했다.",
  "그의 침묵은 말보다 길고, 밤보다 깊었다.",
  "비가 그친 뒤 창문 위엔 아직 걷히지 않은 바다가 있었다.",
  "우리는 같은 강을 두 번 건너지 못하지만 같은 별은 두 번 바라볼 수 있다.",
  "별 하나에 추억과,",
  "별 하나에 사랑과,",
  "별 하나에 쓸쓸함과,",
  "별 하나에 동경과,",
  "별 하나에 시와,",
  "별 하나에 어머니, 어머니,,,",
  "겨울이 지나고 나의 별에도 봄이 오면,",
  "내 이름자 묻힌 언덕 위에도 자랑처럼 풀이 무성할 게외다.",
  "죽는날 까지 하늘을 우러러 한점 부끄럼이 없기를.",
  "별을 노래하는 마음으로 모든 죽어가는 것을 사랑해야지.",
  "오늘밤에도 별이 바람에 스치운다.",
  "내 어린 나날들은 아득하고 빌딩과 차들만 가득해도 이젠 여기가 나의 집인 걸.",
  "가만 있어도 풍경이 바뀌는 버스와 비슷한 듯 조금씩 다른 빌딩",
  "역한 듯 아닌 듯한 삶의 향과 따뜻한 척 하는 차가운 공원들",
  "늘 헤매야 하는 사람들과 너무 많은 한을 품는 한강들과 혼자 하늘을 볼 수 없는 그네들과 다 큰 애들과 조금 늦어버린 나.",
  "믿었던 게 다 멀어지던 때, 이 모든 영애가 이젠 멍에가 됐을 때.",
  "이 욕심을 제발 거둬가소서 어떤 일이 있어도 나를 나로 하게 하소서.",
  "문득 멈춰보니 차난한 맨발 원래 내 것은 아무것도 없었지.",
  "타는 불꽃에서 들꽃으로 소년에서 영원으로 나 이 황량한 들에 남으리",
  "두 발이 땅에 닿지 않을 때, 당신의 마음이 당신을 넘볼 때, 꿈이 나를 집어 삼킬 때, 내가 내가 아닐 때.",
  "서울시가 잠이 든 시간에 아무 말 없는 밤 하늘은 침착해",
  "살아있음을 느낄 때면, 난 산송장처럼 눕기 싫어.",
  "지금 이 순간이 훗날 죽이 되더라도 취침 시간을 뒤로 미뤄.",
  "모두가 등한시하는 밤 하늘에 뜬 달, 곁에 있는 별처럼 깨 있는 나.",
  "잠이 든 자에게는 내일이 와, 허나 난 내가 먼저 내일을 봐.",
  "난 내가 내 꿈의 근처라도 가보고는 죽어야지 싶더라고."
];


const $target = document.getElementById('target');
const $lane   = document.getElementById('lane');
const $input  = document.getElementById('input');
const $start  = document.getElementById('start');
const $acc    = document.getElementById('acc');
const $judge  = document.getElementById('judge');

const $echo = document.getElementById('typingEcho');
function setEcho(txt){ $echo.textContent = txt || ''; } 

function hitEl(){ return document.getElementById('hitline'); }


function setJudge(text, cls){
  if (!$judge) return;             
  $judge.className = '';       
  if (cls) $judge.classList.add(cls); 
  $judge.textContent = text ?? '-';
}


let st = null;         
let raf = null;       
let composing = false; 


function toChars(s){
  return s.replace(/\s+/g,' ').normalize('NFC').split('');
}


function makeTimes(n){
  const baseQ = 60000 / BPM;      
  const minGap = Math.max(110, HIT_MS * 2.2); 

  
  const t = [];
  let cur = 1800;                
  let beatInBar = 0;              
  for (let i=0; i<n; i++) {

    
    const r = Math.random();
    let mult; 
    if (r < 0.45)      mult = 1;
    else if (r < 0.80) mult = 0.5;
    else if (r < 0.92) mult = 0.25;
    else               mult = -1; 

   
    const swing = (beatInBar % 2 === 0) ? 0.95 : 1.05; 
    const tempoJitter = 1 + rand(-0.06, 0.06);         


    let gap = baseQ * (mult === -1 ? 1 : mult) * swing * tempoJitter;


    gap = Math.max(Math.abs(gap), minGap);

    cur += gap;


    if (mult === -1) { beatInBar = (beatInBar + 1) % 4; i--; continue; }

    t.push(Math.round(cur));


    if (Math.random() < 0.05 && t.length < n) {
      const burstGap = Math.max(minGap, baseQ * 0.22); 
      cur += burstGap;
      t.push(Math.round(cur));
      i++;
    }

    beatInBar = (beatInBar + 1) % 4;
    if (t.length >= n) break;
  }


  return t.slice(0, n);
}



function spawnNotes(chars,times,speed){
  const hitX = hitEl().getBoundingClientRect().left - $lane.getBoundingClientRect().left;
  st.notes = chars.map((ch,i)=>{
    const el = document.createElement('div');
    el.className = 'note';
    if(ch===' ') el.classList.add('space');
    if(/[.,!?;:“”"’'…]/.test(ch)) el.classList.add('punc');
    el.textContent = (ch===' ')?'␣':ch;  
    el.dataset.time = times[i];        
    el.dataset.char = ch;
    el.style.transform = `translateX(${hitX + (times[i]/1000)*speed}px)`; 
    $lane.appendChild(el);
    return el;
  });
}

function loop(now){
  const elapsed = now - st.t0;
  const hitX = st.hitX;

  for(const el of st.notes){
    const t  = +el.dataset.time;
    const dt = t - elapsed;                            
    const x  = hitX + (dt/1000) * st.speed;           
    el.style.transform = `translateX(${x}px)`;
    el.classList.toggle('target', Math.abs(dt) <= HIT_MS*1.2); 

    const inwin = Math.abs(dt) <= HIT_MS;   
    el.classList.toggle('inwindow', inwin);  

  }

const autoMissMS = HIT_MS *2.5; 
while (st.i < st.times.length && elapsed - st.times[st.i] > autoMissMS) {
  applyMiss();
  st.notes[st.i].style.opacity = .25;
  st.i++;
}

  const last = st.times[st.times.length-1];
  if(elapsed > last + 1500){ end(); return; } 
  raf = requestAnimationFrame(loop);
}



function handleCharInput(ch, isIME=false){
  const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if(!st) return;
  const now = performance.now() - st.t0;
  const tol = (isIME ? HIT_MS * 2.2 : HIT_MS) * (IS_MOBILE ? 1.5 : 1.0);

while (st.i < st.times.length && now - st.times[st.i] > tol) {
    applyMiss();                            
    st.notes[st.i].style.opacity = .25;
    st.i++;
  }

  const t  = st.times[st.i];
  const tg = st.chars[st.i];
  const diff = Math.abs(now - t);

 if(diff <= tol && equalChar(ch,tg)){
  if(diff <= HIT_MS*0.5) applyPerfect();
  else applyGood();
  st.notes[st.i].style.opacity = .3;
  flashAtHitline(true);     
  st.i++;
}else{
  applyMiss();
  flashAtHitline(false);    
}

}

function flashAtHitline(ok){
  const el = document.getElementById('matchFlash');
  if(!el) return;
  el.classList.remove('flash-ok','flash-bad');
  el.classList.add(ok ? 'flash-ok' : 'flash-bad');
  el.style.opacity = '1';
  setTimeout(()=>{ el.style.opacity = '0'; }, 150);
  
  if($echo){
    const old = $echo.style.color;
    $echo.style.color = ok ? '#76ff6b' : '#ff5d6c';
    setTimeout(()=>{ $echo.style.color = old || '#76a9ff'; }, 150);
  }
}


function equalChar(a,b){
  a = (a || '').normalize('NFC');
  b = (b || '').normalize('NFC');
  return a===b || (a.toLowerCase?.()===b.toLowerCase?.());
}

function applyPerfect(){ st.s+=100; st.c++; st.j++; st.h++; render(); setJudge('Perfect','perfect'); }
function applyGood(){    st.s+=70;  st.c++; st.j++; st.h++; render(); setJudge('Good','good'); }
function applyMiss(){    st.c=0;    st.j++;            render(); setJudge('Miss','miss'); }
function render(){
  const rawAcc = st.j ? (st.h / st.j) * 100 : 0;

  const shown = Math.min(100, Math.round(rawAcc * 1.5));

  if ($acc) $acc.textContent = shown + '%';
}


function start(){
  cancelAnimationFrame(raf);
  clearLane();

  const text  = SENTENCES[Math.floor(Math.random()*SENTENCES.length)]; 
  const chars = toChars(text);                
  const times = makeTimes(chars.length);      

  $target.textContent = text;                 
  $input.value = ''; $input.focus();          

  const speed = 420; 
  const hitX  = hitEl().getBoundingClientRect().left - $lane.getBoundingClientRect().left;

  st = {
    t0: performance.now(),  
    chars, times, speed, hitX,
    notes: [], i:0,         
    s:0,c:0, j:0, h:0       
  };


const $hitbox = document.getElementById('hitbox');
const $echoEl = document.getElementById('typingEcho');

const halfW = Math.max(2, (HIT_MS/1000) * st.speed);
$hitbox.style.left  = (st.hitX - halfW) + 'px';
$hitbox.style.width = (halfW * 2) + 'px';

$echoEl.style.left  = st.hitX + 'px';


  spawnNotes(chars,times,speed);  
  raf = requestAnimationFrame(loop);
  setJudge('-',null);
}

function end() {
  cancelAnimationFrame(raf);

  const acc = st.j ? Math.round((st.h / st.j) * 100) : 0;

  const finalScore = acc; 

  const isWin = finalScore >= 50;

  if (isWin) {
    setJudge(`WIN! 정확도 ${finalScore}%`, 'perfect');
  } else {
    setJudge(`LOSE... 정확도 ${finalScore}%`, 'miss');
  }
}

function clearLane(){
  const children = Array.from($lane.children);
  for (const el of children){
    if (el.id !== 'hitline' && el.id !== 'hitbox' && el.id !== 'typingEcho' && el.id !== 'matchFlash') {
      $lane.removeChild(el);
    }
  }
}




$input.addEventListener('compositionstart', () => composing = true);

$input.addEventListener('compositionupdate', (e) => {
  const txt = e.data;
  setEcho(txt);
  if (txt && txt.match(/[가-힣]/)) {
    handleCharInput(txt[txt.length - 1], true);
  }
});

$input.addEventListener('compositionend', (e) => {
  composing = false;
  const str = e.data || e.target.value.slice(-1);
  if (str && str.match(/[가-힣]/)) {
    handleCharInput(str[str.length - 1], true);
  }
  setEcho('');
});

$input.addEventListener('beforeinput', (e) => {
  if (e.inputType === 'insertText' && e.data) {
    const ch = e.data.normalize('NFC');
    handleCharInput(ch[ch.length - 1], true);
  }
});



$input.addEventListener('keydown', (e) => {
  if (composing) return;
  if (e.code === 'Space') {
    e.preventDefault();
    setEcho('␣'); 
    handleCharInput(' ');
    return;
  }
  if (e.key.length === 1 && !isKoreanJamo(e.key)) {
    setEcho(e.key); 
    handleCharInput(e.key);
  }
});

function isKoreanJamo(ch){
  const c = ch.charCodeAt(0);
  return (c>=0x1100 && c<=0x11FF) || (c>=0x3130 && c<=0x318F);
}


document.getElementById('start').addEventListener('click', start);

function focusInput(){
  $input.focus();
  setTimeout(() => $input.scrollIntoView({block:'center'}), 0);
}

document.getElementById('start').addEventListener('click', () => {
  start();
  focusInput(); 
});

$lane.addEventListener('touchstart', focusInput, {passive:true});

