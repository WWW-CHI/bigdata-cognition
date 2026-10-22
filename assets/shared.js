/* ============================================================
 * 共享交互脚本 - 全站通用（华丽升级版）
 * 包含：移动端菜单、滚动淡入(带交错)、导航栏高亮、图表resize、
 *       顶部滚动进度条、返回顶部、Hero粒子网络、极光背景、
 *       统计数字滚动、卡片3D倾斜
 * ============================================================ */

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 移动端汉堡菜单切换 */
function initMobileMenu(){
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');
  if(!btn || !menu) return;
  btn.addEventListener('click', function(){
    menu.classList.toggle('hidden');
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ menu.classList.add('hidden'); });
  });
}

/* 导航栏：当前页高亮 + 滚动阴影 */
function initNavbar(currentPage){
  var navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function(a){
    var href = a.getAttribute('href');
    if(href === currentPage) a.classList.add('active');
  });
  var navbar = document.getElementById('navbar');
  if(navbar){
    window.addEventListener('scroll', function(){
      if(window.scrollY > 10){
        navbar.classList.add('shadow-md');
      }else{
        navbar.classList.remove('shadow-md');
      }
    }, {passive:true});
  }
}

/* 滚动淡入动画（IntersectionObserver + 同级交错延迟） */
function initFadeIn(){
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('fade-in');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-target, section > div > *').forEach(function(el){
    // 同父容器内的序号决定延迟，形成 stagger 效果
    var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [el];
    var idx = siblings.indexOf(el);
    if(idx > 0) el.style.animationDelay = Math.min(idx * 90, 450) + 'ms';
    observer.observe(el);
  });
}

/* 顶部滚动进度条 */
function initScrollProgress(){
  var bar = document.createElement('div');
  bar.id = 'scrollProgress';
  document.body.appendChild(bar);
  var ticking = false;
  function update(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 0;
    bar.style.transform = 'scaleX(' + p + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, {passive:true});
  update();
}

/* 返回顶部按钮 */
function initBackToTop(){
  var btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', '返回顶部');
  btn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/></svg>';
  document.body.appendChild(btn);
  window.addEventListener('scroll', function(){
    btn.classList.toggle('show', window.scrollY > 500);
  }, {passive:true});
  btn.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* 全局极光背景（浅色页面的柔和氛围层） */
function initGlobalAurora(){
  var wrap = document.createElement('div');
  wrap.className = 'global-aurora';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = '<div class="orb orb-a"></div><div class="orb orb-b"></div><div class="orb orb-c"></div>';
  document.body.insertBefore(wrap, document.body.firstChild);
}

/* Hero 区特效：光晕球 + 粒子网络（自动注入 section.tech-bg） */
function initHeroFX(){
  var hero = document.querySelector('section.tech-bg');
  if(!hero) return;
  if(getComputedStyle(hero).position === 'static') hero.style.position = 'relative';

  // 光晕球
  ['o1','o2','o3'].forEach(function(c){
    var o = document.createElement('div');
    o.className = 'hero-orb ' + c;
    o.setAttribute('aria-hidden', 'true');
    hero.insertBefore(o, hero.firstChild);
  });

  if(reduceMotion) return;

  // 粒子网络画布
  var canvas = document.createElement('canvas');
  canvas.className = 'hero-particles';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, pts = [];
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize(){
    W = hero.offsetWidth; H = hero.offsetHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.min(90, Math.floor(W * H / 16000));
    pts = [];
    for(var i = 0; i < n; i++){
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
        r: Math.random() * 1.8 + .6
      });
    }
  }
  resize();
  window.addEventListener('resize', resize);

  var running = true;
  document.addEventListener('visibilitychange', function(){
    running = !document.hidden;
    if(running) requestAnimationFrame(step);
  });

  function step(){
    if(!running) return;
    ctx.clearRect(0, 0, W, H);
    for(var i = 0; i < pts.length; i++){
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > W) p.vx *= -1;
      if(p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fill();
    }
    for(var a = 0; a < pts.length; a++){
      for(var b = a + 1; b < pts.length; b++){
        var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
        var d2 = dx * dx + dy * dy;
        if(d2 < 16900){ // 130px 连接距离
          var o = (1 - Math.sqrt(d2) / 130) * .28;
          ctx.strokeStyle = 'rgba(255,255,255,' + o + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pts[a].x, pts[a].y);
          ctx.lineTo(pts[b].x, pts[b].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  step();
}

/* Hero 统计数字滚动（如 42.7% / 18K+ / 96.3%） */
function initCountUp(){
  var els = document.querySelectorAll('.tech-bg .grid .text-3xl');
  if(!els.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .4 });
  els.forEach(function(el, i){
    el.dataset.idx = i;
    io.observe(el);
  });
  function animate(el){
    var m = el.textContent.trim().match(/^(\d+(?:\.\d+)?)([\s\S]*)$/);
    if(!m) return;
    var target = parseFloat(m[1]);
    var suffix = m[2] || '';
    var dec = (m[1].split('.')[1] || '').length;
    if(reduceMotion){ el.textContent = target.toFixed(dec) + suffix; return; }
    var dur = 1500 + (+el.dataset.idx) * 180;
    var start = null;
    function frame(t){
      if(!start) start = t;
      var k = Math.min((t - start) / dur, 1);
      var e = 1 - Math.pow(1 - k, 4); // easeOutQuart
      el.textContent = (target * e).toFixed(dec) + suffix;
      if(k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
}

/* 卡片 3D 倾斜（仅桌面端精确指针设备） */
function initTilt(){
  if(reduceMotion) return;
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.querySelectorAll('.card-hover').forEach(function(card){
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      card.style.transition = 'transform .1s ease-out';
      card.style.transform = 'perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-6px)';
    });
    card.addEventListener('mouseleave', function(){
      card.style.transition = 'transform .4s ease';
      card.style.transform = '';
    });
  });
}

/* ECharts 图表响应式 resize 管理器 */
var chartInstances = [];
function registerChart(chart){
  chartInstances.push(chart);
}
window.addEventListener('resize', function(){
  chartInstances.forEach(function(c){ c.resize(); });
});

/* 页面加载后初始化所有通用模块 */
document.addEventListener('DOMContentLoaded', function(){
  initMobileMenu();
  initFadeIn();
  initScrollProgress();
  initBackToTop();
  initGlobalAurora();
  initHeroFX();
  initCountUp();
  initTilt();
});
