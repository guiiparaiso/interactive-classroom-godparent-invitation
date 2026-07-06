(function(){
  var envelope = document.getElementById('envelope');
  var openBtn = document.getElementById('open-btn');
  var envelopeScreen = document.getElementById('envelope-screen');
  var mainContent = document.getElementById('main-content');
  var body = document.body;

  function openEnvelope(){
    if (envelope.classList.contains('opened')) return;
    envelope.classList.add('opened');
    setTimeout(function(){
      envelopeScreen.classList.add('hidden');
      body.classList.remove('locked');
      mainContent.classList.add('show');
    }, 650);
  }

  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });
  openBtn.addEventListener('click', openEnvelope);

  /* ---------- "Deixa eu pensar" dodges the cursor ---------- */
  var thinkBtn = document.getElementById('btn-think');
  var chalkArea = document.getElementById('chalk-buttons');
  var dodges = 0;
  var MAX_DODGES = 5;
  var caught = false;

  function rectsOverlap(a, b){
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function dodge(){
    if (caught) return;
    dodges++;

    var areaRect = chalkArea.getBoundingClientRect();
    var yesRect = btnYes.getBoundingClientRect();
    var thinkW = thinkBtn.offsetWidth;
    var thinkH = thinkBtn.offsetHeight;
    var maxX = Math.max(areaRect.width - thinkW - 10, 20);
    var maxY = Math.max(areaRect.height - thinkH - 10, 20);
    var buffer = 20; // espaço extra ao redor do botão "Sim" que o outro botão nunca invade

    var yesLocal = {
      left: yesRect.left - areaRect.left - buffer,
      right: yesRect.right - areaRect.left + buffer,
      top: yesRect.top - areaRect.top - buffer,
      bottom: yesRect.bottom - areaRect.top + buffer
    };

    var randX, randY, candidate, tries = 0;
    do {
      randX = Math.random() * maxX;
      randY = Math.random() * maxY;
      candidate = { left: randX, right: randX + thinkW, top: randY, bottom: randY + thinkH };
      tries++;
    } while (rectsOverlap(candidate, yesLocal) && tries < 30);

    thinkBtn.classList.add('dodging');
    thinkBtn.style.left = randX + 'px';
    thinkBtn.style.top = randY + 'px';

    if (dodges >= MAX_DODGES){
      caught = true;
      thinkBtn.textContent = 'Tá bom, eu aceito também! 😄';
      // volta suavemente para o lugar original, ao lado do botão "Sim"
      setTimeout(function(){
        thinkBtn.classList.remove('dodging');
        thinkBtn.style.left = '';
        thinkBtn.style.top = '';
      }, 850);
    }
  }

  thinkBtn.addEventListener('mouseenter', dodge);
  thinkBtn.addEventListener('touchstart', function(e){
    if (!caught){ e.preventDefault(); dodge(); }
  }, {passive:false});
  thinkBtn.addEventListener('click', function(){
    if (caught){ celebrate(); }
  });

  /* ---------- celebration + confetti ---------- */
  var btnYes = document.getElementById('btn-yes');
  var celebration = document.getElementById('celebration');
  var celebrated = false;

  function celebrate(){
    if (celebrated) return;
    celebrated = true;
    celebration.classList.add('show');
    celebration.scrollIntoView({ behavior:'smooth', block:'start' });
    launchConfetti();
  }
  btnYes.addEventListener('click', celebrate);

  /* ---------- lightweight confetti ---------- */
  var canvas = document.getElementById('confetti-canvas');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var colors = ['#F5C84C', '#E2607A', '#F0924B', '#34406B', '#FFFDF8'];

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function launchConfetti(){
    if (reduceMotion) return;
    particles = [];
    var count = 140;
    for (var i=0; i<count; i++){
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.3,
        vx: (Math.random()-0.5) * 3,
        vy: 2 + Math.random() * 3,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random() * 360,
        vrot: (Math.random()-0.5) * 10,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    requestAnimationFrame(tick);
  }

  var startTime = null;
  function tick(ts){
    if (!startTime) startTime = ts;
    var elapsed = ts - startTime;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    var alive = false;
    particles.forEach(function(p){
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.rot += p.vrot;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect'){
        ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
      } else {
        ctx.beginPath();
        ctx.arc(0,0,p.size/2,0,Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (alive && elapsed < 6000){
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      startTime = null;
    }
  }
})();
