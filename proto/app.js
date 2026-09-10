/* ============================================================
   X.FUN 原型 — 共享外壳
   导航与页脚由此统一渲染，加一页只要改 NAV 一行。
   纯展示用途，不含任何真实业务逻辑与链上调用。
   ============================================================ */
(function(){
'use strict';

// 评审开关：URL 带 ?demo=1 时才出现身份切换条，正式站点看不到
var DEMO = /[?&]demo=1/.test(location.search);

var BASE = (function(){
  // 站点根：/xfun-preview/proto/  —— 从当前脚本地址推出来，本地与线上都对
  var s = document.currentScript || [].slice.call(document.getElementsByTagName('script')).pop();
  return s.src.replace(/app\.js.*$/, '');
})();

var NAV = [
  {href:'',           key:'home',      l:{zh:'首页',ft:'首頁',en:'Home',ja:'ホーム',ko:'홈',vi:'Trang chủ',th:'หน้าแรก',id:'Beranda'}},
  {href:'stake/',     key:'stake',     l:{zh:'质押',ft:'質押',en:'Stake',ja:'ステーキング',ko:'스테이킹',vi:'Stake',th:'สเตค',id:'Staking'}},
  {href:'engine/',    key:'engine',    neu:true,
                      l:{zh:'引擎质押',ft:'引擎質押',en:'Engine',ja:'エンジン',ko:'엔진',vi:'Engine',th:'เอนจิน',id:'Engine'}},
  {href:'launch/',    key:'launch',    l:{zh:'发射板',ft:'發射板',en:'Launch',ja:'ローンチ',ko:'런치패드',vi:'Launchpad',th:'ลอนช์',id:'Launchpad'}},
  {href:'builder/',   key:'builder',   l:{zh:'社区共建',ft:'社群共建',en:'Builders',ja:'ビルダー',ko:'빌더',vi:'Builders',th:'ผู้ร่วมสร้าง',id:'Builders'}},
  {href:'invite/',    key:'invite',    l:{zh:'邀请',ft:'邀請',en:'Invite',ja:'招待',ko:'초대',vi:'Mời',th:'เชิญ',id:'Undang'}},
  {href:'assets/',    key:'assets',    l:{zh:'我的资产',ft:'我的資產',en:'Assets',ja:'マイ資産',ko:'내 자산',vi:'Tài sản',th:'สินทรัพย์',id:'Aset'}}
];
var ABOUT_L = {zh:'关于',ft:'關於',en:'About',ja:'概要',ko:'소개',vi:'Giới thiệu',th:'เกี่ยวกับ',id:'Tentang'};

var MARK = '<svg class="logo-mark" viewBox="0 0 24 24" aria-hidden="true">'+
  '<path d="M3 3 L21 21 M21 3 L3 21" stroke="var(--accent)" stroke-width="2.1" stroke-linecap="round"/>'+
  '<circle cx="12" cy="12" r="3.1" fill="var(--bg)" stroke="var(--accent-2)" stroke-width="1.5"/></svg>';
var LOGO = '<a href="'+BASE+'" class="logo" aria-label="X.FUN"><span class="brandmark">'+MARK+
  '</span><span class="brand">X<b>.</b>FUN</span></a>';

function t(o){ return (o.l && (o.l[lang] || o.l.en)) || ''; }

function links(cur, cls){
  return NAV.map(function(n){
    return '<a href="'+BASE+n.href+'" class="'+(n.key===cur?'on':'')+'">'+t(n)+
      (n.neu? '<i class="hot" aria-hidden="true"><svg viewBox="0 0 12 14"><path d="M6 .4c.7 2.2 2.2 3.1 3.1 4.5.9 1.5 1 3.2.1 4.7-.9 1.6-2.8 2.6-4.6 2.4-1.8-.2-3.4-1.6-3.8-3.4-.4-1.9.4-3.8 1.8-4.9.1 1 .6 1.8 1.3 2.1C4 3.7 4.8 1.8 6 .4Z"/></svg></i>' : '')+'</a>';
  }).join('');
}

/* ---------- 语言：构建期抽字典，运行期按 key 换文案 ---------- */
var LANGS = [['zh','简体中文','中'],['ft','繁體中文','繁'],['en','English','EN'],
             ['ja','日本語','日'],['ko','한국어','한'],['vi','Tiếng Việt','VI'],
             ['th','ไทย','TH'],['id','Indonesia','ID']];
var HTMLLANG = {zh:'zh-CN',ft:'zh-TW',en:'en',ja:'ja',ko:'ko',vi:'vi',th:'th',id:'id'};
var DICT = {};            // code -> {key: text}
var lang = 'zh';
try { lang = localStorage.getItem('xfun.lang') || 'zh'; } catch(e){}
if(!HTMLLANG[lang]) lang = 'zh';

function applyLang(){
  var d = DICT[lang] || {}, en = DICT.en || {};
  [].forEach.call(document.querySelectorAll('t-x[data-i]'), function(el){
    var k = el.dataset.i, v = d[k];
    if(v === undefined && lang !== 'zh') v = en[k];      // 缺译回落英文
    if(v !== undefined) el.innerHTML = v;
  });
  // 导航与关于用自带的多语言表，切换后重绘
  var cur2 = document.body.dataset.page || '';
  [].forEach.call(document.querySelectorAll('.nav-links, .drawer__panel, .foot-links'), function(box){
    [].forEach.call(box.querySelectorAll('a[href]'), function(a){
      for(var i=0;i<NAV.length;i++){
        if(a.getAttribute('href') === BASE + NAV[i].href){
          a.innerHTML = t(NAV[i]) + (NAV[i].neu ? '<i class="hot" aria-hidden="true"><svg viewBox="0 0 12 14"><path d="M6 .4c.7 2.2 2.2 3.1 3.1 4.5.9 1.5 1 3.2.1 4.7-.9 1.6-2.8 2.6-4.6 2.4-1.8-.2-3.4-1.6-3.8-3.4-.4-1.9.4-3.8 1.8-4.9.1 1 .6 1.8 1.3 2.1C4 3.7 4.8 1.8 6 .4Z"/></svg></i>' : '');
          return;
        }
      }
      if(a.classList.contains('about-l')) a.textContent = ABOUT_L[lang] || ABOUT_L.en;
    });
  });
  document.documentElement.classList.remove('i18n-wait');
  [].forEach.call(document.querySelectorAll('.lang button'), function(b){
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
  var cur = document.querySelector('.lang .lang-cur');
  if(cur){
    for(var i=0;i<LANGS.length;i++) if(LANGS[i][0]===lang) cur.textContent = LANGS[i][2];
  }
}

function loadLang(code, cb){
  if(code === 'zh' || DICT[code]) return cb && cb();
  var x = new XMLHttpRequest();
  x.open('GET', BASE + 'lang/' + code + '.json', true);
  x.onreadystatechange = function(){
    if(x.readyState !== 4) return;
    try { DICT[code] = JSON.parse(x.responseText); } catch(e){ DICT[code] = {}; }
    cb && cb();
  };
  x.send();
}

function setLang(v){
  if(!HTMLLANG[v]) return;
  lang = v;
  document.documentElement.setAttribute('data-lang', v);
  document.documentElement.setAttribute('lang', HTMLLANG[v]);
  try { localStorage.setItem('xfun.lang', v); } catch(e){}
  // 非中文都需要英文兜底
  loadLang('en', function(){ loadLang(v, applyLang); });
}

/* ---------- 渲染外壳 ---------- */
function shell(){
  var cur = document.body.dataset.page || '';

  var nav = document.createElement('header');
  nav.className = 'nav';
  nav.innerHTML =
    '<div class="wrap nav-in">'+ LOGO +
      '<nav class="nav-links">'+ links(cur) +'</nav>'+
      '<div class="nav-right">'+
        '<div class="lang"><button class="lang-btn" data-act="langmenu" aria-haspopup="true" aria-expanded="false">'+
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">'+
          '<circle cx="8" cy="8" r="6.4"/><path d="M1.6 8h12.8M8 1.6c1.7 1.8 2.6 4 2.6 6.4S9.7 12.6 8 14.4C6.3 12.6 5.4 10.4 5.4 8S6.3 3.4 8 1.6z"/></svg>'+
          '<span class="lang-cur">中</span></button>'+
          '<div class="lang-menu" hidden>'+
            LANGS.map(function(L){ return '<button data-lang="'+L[0]+'" aria-pressed="false"><b>'+L[2]+'</b>'+L[1]+'</button>'; }).join('')+
          '</div></div>'+
        '<button class="btn btn-primary btn-sm wallet" data-act="wallet">'+
          '<span class="w-off"><t-x data-i="kbd246b1">连接钱包</t-x></span>'+
          '<span class="w-on addr" hidden>0x7C1f…93E</span></button>'+
        '<button class="nav-burger" data-act="drawer" aria-label="Menu">'+
          '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">'+
          '<path d="M3 6h14M3 10h14M3 14h14"/></svg></button>'+
      '</div>'+
    '</div>';
  document.body.insertBefore(nav, document.body.firstChild);

  var dr = document.createElement('div');
  dr.className = 'drawer'; dr.dataset.open = '0';
  dr.innerHTML = '<div class="drawer__bg" data-act="drawer-close"></div>'+
    '<div class="drawer__panel"><div class="drawer__top">'+ LOGO +
      '<button class="modal__x" data-act="drawer-close" aria-label="Close">'+
      '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">'+
      '<path d="M2 2l11 11M13 2L2 13"/></svg></button></div>'+
      links(cur) +
      '<a href="'+BASE+'about/" class="about-l '+(cur==='about'?'on':'')+'">'+(ABOUT_L[lang]||ABOUT_L.en)+'</a>'+
    '</div>';
  document.body.appendChild(dr);

  var f = document.createElement('footer');
  f.className = 'foot';
  f.innerHTML = '<div class="wrap"><div class="foot-in">'+
    '<div style="max-width:330px">'+ LOGO +
      '<p class="foot-note" style="margin-top:12px">'+
      '<t-x data-i="k3a609b6">社区驱动的 BSC meme 发射平台，配套链上套利引擎。</t-x>'+
      '</p></div>'+
    '<div class="foot-links">'+ links(cur) +
      '<a href="'+BASE+'about/" class="about-l">'+(ABOUT_L[lang]||ABOUT_L.en)+'</a>'+
      '<a href="#" data-act="soon"><t-x data-i="k3253695">文档</t-x></a>'+
      '<a href="#" data-act="soon"><t-x data-i="k76b6885">审计报告</t-x></a>'+
    '</div></div>'+
    '<div class="foot-bottom"><p class="foot-note">'+
      '<t-x data-i="k7c1e28a">加密资产存在价格波动与合约风险，参与前请自行评估。本页不构成投资建议。链上数据以合约为准，前端展示可能存在同步延迟。</t-x>'+
      '</p><span class="foot-meta">X.FUN © 2026</span></div></div>';
  document.body.appendChild(f);

  if(DEMO){
  var pb = document.createElement('div');
  pb.className = 'protobar';
  pb.innerHTML = '<b>REVIEW</b><span class="pbsep"></span>' +
    STATES.map(function(x){
      return '<button data-state="'+x.key+'" aria-pressed="false">'+(lang==='zh'||lang==='ft'?x.zh:x.en)+'</button>';
    }).join('') +
    '';
  document.body.appendChild(pb);
  }

  // 钱包弹窗（已连接时点头像打开）—— 每页都有，随外壳注入
  var wm = document.createElement('div');
  wm.className = 'modal'; wm.id = 'm-wallet'; wm.dataset.open = '0';
  wm.innerHTML = '<div class="modal__bg" data-close></div>'+
    '<div class="modal__box"><div class="modal-grab"></div>'+
      '<div class="modal__head">'+
        '<div><div class="h3"><t-x data-i="k2f47473">钱包</t-x></div>'+
          '<p class="scope" style="margin-top:5px"><t-x data-i="kff7ca6d">已连接 · BNB Smart Chain</t-x></p></div>'+
        '<button class="modal__x" data-close aria-label="Close">'+
        '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M2 2l11 11M13 2L2 13"/></svg></button>'+
      '</div>'+
      '<div class="modal__body">'+
        '<div class="addr-box" data-copy="0x7C1f9a4bA93E">'+
          '<span class="lb" style="letter-spacing:.12em"><t-x data-i="k7650487">地址</t-x></span>'+
          '<span style="margin-left:auto">0x7C1f9a…4bA93E</span>'+
          '<span class="go"><t-x data-i="k79d3abe">复制</t-x> ›</span></div>'+
        '<dl class="kv">'+
          '<div class="kv-row"><dt><t-x data-i="k7ddbe15">网络</t-x></dt><dd>BNB Smart Chain</dd></div>'+
          '<div class="kv-row"><dt><t-x data-i="k996a08e">共建者</t-x></dt>'+
            '<dd><span data-need-builder hidden class="chip chip-pos"><t-x data-i="k0a60ac8">是</t-x></span>'+
            '<span data-no-builder hidden class="chip chip-off"><t-x data-i="kc9744f4">否</t-x></span></dd></div>'+
          '<div class="kv-row"><dt><t-x data-i="k3d955ef">早期共识</t-x></dt>'+
            '<dd><span data-need-consensus hidden class="chip chip-pos"><t-x data-i="ke646904">有记录</t-x></span>'+
            '<span data-no-consensus hidden class="chip chip-off"><t-x data-i="kedd98a0">无记录</t-x></span></dd></div>'+
        '</dl>'+
        '<div class="note"><i>·</i><p><t-x data-i="k2db01d4">断开连接后页面只保留公开数据；重新连接即可恢复你的持仓与记录。</t-x></p></div>'+
      '</div>'+
      '<div class="modal__foot">'+
        '<button class="btn btn-quiet" data-close><t-x data-i="kb15d912">关闭</t-x></button>'+
        '<button class="btn btn-ghost" data-act="disconnect"><t-x data-i="k3fe7b5b">断开连接</t-x></button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(wm);

  var ts = document.createElement('div');
  ts.className = 'toast'; ts.dataset.show = '0';
  document.body.appendChild(ts);

  setLang(lang);
}

/* ---------- toast ---------- */
var toastTimer;
function toast(zh, en){
  var el = document.querySelector('.toast');
  if(!el) return;
  el.innerHTML = '<span class="dot"></span><span>'+((lang==='zh'||lang==='ft')?zh:(en||zh))+'</span>';
  el.dataset.show = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ el.dataset.show = '0'; }, 2600);
}

/* ---------- 演示状态：钱包 / 共建者 / 早期共识份额 ----------
   评审开关只在 URL 带 ?demo=1 时出现；正式站点这些状态来自链上与后端。 */
var STATES = [
  {key:'wallet',  zh:'钱包',     en:'Wallet',   def:false},
  {key:'builder', zh:'共建者',   en:'Builder',  def:false},
  {key:'consensus',zh:'早期共识', en:'Consensus',def:false}
];
/* URL 直接指定身份，方便发评审链接：
     ?as=full      钱包 + 共建者 + 早期共识（全量数据态）
     ?as=builder   钱包 + 共建者
     ?as=guest     未连钱包
   一进页面就写进 localStorage，后续站内跳转都保持这个身份。 */
var AS = (location.search.match(/[?&]as=([a-z]+)/) || [])[1];
var PRESET = {
  full:    {wallet:true,  builder:true,  consensus:true},
  builder: {wallet:true,  builder:true,  consensus:false},
  wallet:  {wallet:true,  builder:false, consensus:false},
  guest:   {wallet:false, builder:false, consensus:false}
}[AS];

var S = {};
STATES.forEach(function(x){
  var v = x.def;
  try { var r = localStorage.getItem('xfun.'+x.key); if(r !== null) v = (r === '1'); } catch(e){}
  if(PRESET){ v = PRESET[x.key];
    try { localStorage.setItem('xfun.'+x.key, v ? '1' : '0'); } catch(e){} }
  S[x.key] = v;
});
var connected = S.wallet;

function paintStates(){
  connected = S.wallet;
  document.documentElement.dataset.wallet = connected ? 'on' : 'off';
  var b = document.querySelector('[data-act="wallet"]');
  if(b){
    b.querySelector('.w-off').hidden = connected;
    b.querySelector('.w-on').hidden = !connected;
    b.classList.toggle('btn-primary', !connected);
    b.classList.toggle('btn-ghost', connected);
  }
  STATES.forEach(function(x){
    var on = S[x.key];
    // 除钱包外的状态，都以「已连钱包」为前提
    if(x.key !== 'wallet') on = on && connected;
    [].forEach.call(document.querySelectorAll('[data-need-'+x.key+']'), function(el){ el.hidden = !on; });
    [].forEach.call(document.querySelectorAll('[data-no-'+x.key+']'), function(el){
      el.hidden = (x.key === 'wallet') ? connected : (!connected || on);
    });
    var t = document.querySelector('.protobar [data-state="'+x.key+'"]');
    if(t) t.setAttribute('aria-pressed', String(S[x.key]));
  });
}
function paintWallet(){ paintStates(); }
function setState(k, v){
  S[k] = v;
  try { localStorage.setItem('xfun.'+k, v ? '1' : '0'); } catch(e){}
  paintStates();
}
function setWallet(v){
  setState('wallet', v);
  toast(v ? '钱包已连接' : '已断开连接', v ? 'Wallet connected' : 'Disconnected');
}

/* ---------- 弹窗 ---------- */
function openModal(id){
  var m = document.getElementById(id);
  if(!m) return;
  m.dataset.open = '1';
  document.body.style.overflow = 'hidden';
  var f = m.querySelector('input,button:not(.modal__x)');
  if(f) setTimeout(function(){ f.focus(); }, 60);
}
function closeModal(m){
  (m || document.querySelector('.modal[data-open="1"]') || {dataset:{}}).dataset.open = '0';
  document.body.style.overflow = '';
}

/* ---------- tabs ---------- */
function bindTabs(root){
  [].forEach.call((root||document).querySelectorAll('.tabs'), function(tabs){
    tabs.addEventListener('click', function(e){
      var b = e.target.closest('button[data-tab]');
      if(!b) return;
      [].forEach.call(tabs.querySelectorAll('button'), function(x){
        x.setAttribute('aria-selected', String(x === b));
      });
      var group = tabs.dataset.group;
      [].forEach.call(document.querySelectorAll('.tabpanel[data-group="'+group+'"]'), function(p){
        p.hidden = (p.dataset.tab || p.dataset.panel) !== b.dataset.tab;
      });
    });
  });
}

/* ---------- 全局事件 ---------- */
document.addEventListener('click', function(e){
  /* 注意：.drawer / .modal 自己用 data-open 存开合状态，必须排除，
     否则抽屉里和弹窗里的 <a> 会被当成弹窗触发器，preventDefault 掉，链接点了没反应。 */
  var el = e.target.closest('[data-act],[data-open]:not(.drawer):not(.modal),[data-close],[data-copy],[data-seg],[data-pick]');
  if(!el) return;

  if(el.dataset.act === 'drawer'){ document.querySelector('.drawer').dataset.open = '1'; document.body.style.overflow='hidden'; return; }
  if(el.dataset.act === 'drawer-close'){ document.querySelector('.drawer').dataset.open = '0'; document.body.style.overflow=''; return; }
  if(el.dataset.act === 'wallet'){ e.preventDefault(); connected ? openModal('m-wallet') : setWallet(true); return; }
  if(el.dataset.act === 'disconnect'){ closeModal(); setWallet(false); return; }
  if(el.dataset.act === 'soon'){ e.preventDefault(); toast('功能开发中，敬请期待', 'Coming soon'); return; }
  if(el.dataset.act === 'chain'){ e.preventDefault(); closeModal();
    toast('交易已提交，等待链上确认', 'Transaction submitted \u2014 awaiting confirmation'); return; }

  if(el.dataset.open){ e.preventDefault();
    if(el.dataset.addr){ var va = document.querySelector('[data-vaddr]');
      if(va) va.textContent = (el.querySelector('.vault-a')||{textContent:el.dataset.addr}).textContent; }
    openModal(el.dataset.open); return; }
  if(el.hasAttribute('data-close')){ closeModal(el.closest('.modal')); return; }

  if(el.dataset.copy !== undefined){
    var v = el.dataset.copy || el.textContent.trim();
    if(navigator.clipboard) navigator.clipboard.writeText(v).catch(function(){});
    toast('已复制', 'Copied'); return;
  }
  if(el.dataset.seg !== undefined){
    [].forEach.call(el.parentNode.children, function(x){ x.setAttribute('aria-pressed', String(x===el)); });
    var tgt = el.closest('[data-seg-target]');
    if(tgt){ var inp = document.querySelector(tgt.dataset.segTarget);
      if(inp && el.dataset.seg) inp.value = el.dataset.seg; }
    return;
  }
  if(el.dataset.pick !== undefined){
    [].forEach.call(el.parentNode.children, function(x){ x.setAttribute('aria-pressed', String(x===el)); });
    var name = el.dataset.pick;
    [].forEach.call(document.querySelectorAll('[data-picked="'+(el.closest('.pick').dataset.pickGroup||'')+'"]'), function(o){
      o.textContent = name;
    });
    var grp = el.closest('.pick');
    if(grp.dataset.xpair){
      /* LP 组队：X 配 SHARE，其余配 FSD（公版原逻辑）。预估 = 一半换成配对币的量。 */
      var g = grp.dataset.pickGroup || '';
      var BAL = {X:'86,000', SHARE:'62,400', SENTIS:'48,200'};
      var EST = {X:'5,120', SHARE:'2,480', SENTIS:'1,910'};
      [].forEach.call(document.querySelectorAll('[data-xpartner="'+g+'"]'), function(o){
        o.textContent = (name === 'X') ? 'SHARE' : 'FSD'; });
      var bal = document.querySelector('[data-xbal="'+g+'"]');
      if(bal && BAL[name]) bal.textContent = BAL[name];
      [].forEach.call(document.querySelectorAll('[data-xest="'+g+'"]'), function(o){
        if(EST[name]) o.textContent = EST[name]; });
    }
    return;
  }
});
document.addEventListener('click', function(e){
  if(e.target.classList && e.target.classList.contains('modal__bg')) closeModal(e.target.closest('.modal'));
});
document.addEventListener('keydown', function(e){
  if(e.key !== 'Escape') return;
  var d = document.querySelector('.drawer[data-open="1"]');
  if(d){ d.dataset.open='0'; document.body.style.overflow=''; return; }
  if(document.querySelector('.modal[data-open="1"]')) closeModal();
});
document.addEventListener('click', function(e){
  var menu = document.querySelector('.lang-menu'), tog = document.querySelector('[data-act="langmenu"]');
  var hit = e.target.closest('[data-act="langmenu"]');
  if(hit){ var open = menu.hidden; menu.hidden = !open; tog.setAttribute('aria-expanded', String(open)); }
  else if(menu && !menu.hidden && !e.target.closest('.lang-menu')){ menu.hidden = true; tog.setAttribute('aria-expanded','false'); }
  var b = e.target.closest('.lang-menu button[data-lang]');
  if(b){ setLang(b.dataset.lang); menu.hidden = true; tog.setAttribute('aria-expanded','false'); }
  var st = e.target.closest('.protobar button[data-state]');
  if(st){
    var k = st.dataset.state, v = !S[k];
    if(k !== 'wallet' && v && !S.wallet) setState('wallet', true);
    setState(k, v);
  }
});

/* ---------- 小工具 ---------- */
function sparkline(el, seed, n){
  n = n || 46;
  var W=600,H=104,pts=[],v=0,s=seed||20260906;
  function r(){ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }
  for(var i=0;i<n;i++){ v += (r()-.34)*1.5 + .55; pts.push(v); }
  var mn=Math.min.apply(null,pts), mx=Math.max.apply(null,pts), sp=(mx-mn)||1;
  var co = pts.map(function(p,i){ return [(i/(n-1))*W, H-8-((p-mn)/sp)*(H-22)]; });
  var line = co.map(function(c){ return c[0].toFixed(1)+','+c[1].toFixed(1); }).join(' ');
  var q = function(sel){ return el.querySelector(sel); };
  if(q('.eq-line')) q('.eq-line').setAttribute('points', line);
  if(q('.eq-area')) q('.eq-area').setAttribute('points', '0,'+H+' '+line+' '+W+','+H);
  var last = co[co.length-1];
  [].forEach.call(el.querySelectorAll('.eq-dot'), function(d){
    d.setAttribute('cx', last[0]); d.setAttribute('cy', last[1]);
  });
}

function tick(el, endHour){
  function paint(){
    var now = new Date(), t = new Date(now);
    t.setHours(endHour, 0, 0, 0);
    if(t <= now) t.setDate(t.getDate()+1);
    var d = Math.floor((t - now)/1000);
    var h = String(Math.floor(d/3600)).padStart(2,'0');
    var m = String(Math.floor(d%3600/60)).padStart(2,'0');
    var s = String(d%60).padStart(2,'0');
    el.textContent = h+':'+m+':'+s;
  }
  paint(); setInterval(paint, 1000);
}

/* ---------- 启动 ---------- */
function boot(){
  shell();
  paintStates();
  bindTabs();
  [].forEach.call(document.querySelectorAll('[data-spark]'), function(el){
    sparkline(el, parseInt(el.dataset.spark,10) || 0);
  });
  [].forEach.call(document.querySelectorAll('[data-tick]'), function(el){
    tick(el, parseInt(el.dataset.tick,10) || 18);
  });
  // 宽表加滑动提示
  [].forEach.call(document.querySelectorAll('.tscroll'), function(el){
    if(el.scrollWidth > el.clientWidth + 4) el.setAttribute('data-wide','');
  });
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

window.XF = { toast:toast, openModal:openModal, closeModal:closeModal, setLang:setLang, setState:setState, BASE:BASE };
})();
