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
var DICT = { zh:{} };     // code -> {key: text}。中文那份不读文件，由 say() 从页面上收集
var lang = 'zh';
try { lang = localStorage.getItem('xfun.lang') || 'zh'; } catch(e){}
if(!HTMLLANG[lang]) lang = 'zh';

/* 一句文案按当前语言重写。
   · 字典里的句子可以带 {名字}，换成这个元素 data-名字 的值
     （例：元素上有 data-n="6"，句子是「{n} 个地址合计」，写出来就是「6 个地址合计」）。
   · 中文不读字典文件：每句第一次出现时页面上的原文就是中文，记进 DICT.zh；
     从别的语言切回中文时用它还原。 */
function say(el){
  var k = el.dataset.i;
  if(!(k in DICT.zh)) DICT.zh[k] = el.innerHTML;
  var v = (DICT[lang] || {})[k];
  if(v === undefined) v = (DICT.en || {})[k];            // 缺译回落英文
  if(v === undefined) v = DICT.zh[k];
  v = v.replace(/\{([a-z]+)\}/g, function(m, name){
    var x = el.dataset[name];
    return x === undefined ? '\u2014' : String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  });
  if(el.innerHTML !== v) el.innerHTML = v;
}

/* JS 里现拼的文案走这个：传入一段带 t-x 标签的片段和要填的变量，返回按当前语言写好的 HTML。
   变量记在元素的 data-* 上，之后切语言时 applyLang 会按新语言重写。用法见 sm-board.js 的 TEXT。 */
function text(html, vars){
  var box = document.createElement('div');
  box.innerHTML = html || '';
  [].forEach.call(box.querySelectorAll('t-x[data-i]'), function(el){
    for(var k in (vars || {})) el.dataset[k] = vars[k];
    say(el);
  });
  return box.innerHTML;
}

function applyLang(){
  [].forEach.call(document.querySelectorAll('t-x[data-i]'), function(el){ say(el); });
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
/* 宽表滑动提示。
   原来只在 boot() 跑一次 —— 弹窗那会儿还是隐藏的，scrollWidth/clientWidth 都是 0，
   于是弹窗里的宽表从来没拿到过提示。改成弹窗打开和窗口变化时都重算。 */
function markWide(root){
  [].forEach.call((root || document).querySelectorAll('.tscroll'), function(el){
    if(el.scrollWidth > el.clientWidth + 4) el.setAttribute('data-wide','');
    else el.removeAttribute('data-wide');
  });
}

function openModal(id){
  var m = document.getElementById(id);
  if(!m) return;
  m.dataset.open = '1';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(function(){ markWide(m); });
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
  /* 真外链先放行（build.py 里 EXPLORER 填了域名时，实时渲染的金库行和弹窗哈希是外链）。
     它们嵌在 .vault-row[data-open] 和表格单元格里，不放行就会被下面的 preventDefault 吃掉
     —— 和当初抽屉链接点不动是同一个坑。 */
  var lk = e.target.closest('a[href]');
  if(lk && lk.getAttribute('href') !== '#' &&
     !lk.matches('[data-act],[data-open],[data-close],[data-copy],[data-seg],[data-pick]')) return;

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
      if(va) va.textContent = (el.querySelector('.vault-a')||{textContent:el.dataset.addr}).textContent;
      /* 弹窗底部「复制地址」跟着当前这一行走 */
      var vx = document.querySelector('[data-vexp]');
      if(vx) vx.dataset.copy = el.dataset.addr; }
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
  [].forEach.call(document.querySelectorAll('[data-tick]'), function(el){
    tick(el, parseInt(el.dataset.tick,10) || 18);
  });
  markWide();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

var wideT;
window.addEventListener('resize', function(){
  clearTimeout(wideT); wideT = setTimeout(function(){ markWide(); }, 160);
});

window.XF = { toast:toast, openModal:openModal, closeModal:closeModal, setLang:setLang, setState:setState, text:text, BASE:BASE };
})();

/* ============================================================
   聪明钱看板 · 数据（取数与筛选）

   这个文件不碰页面，浏览器和 Node 都能跑：
     · 页面用它读数、当场筛选（首页 sm-board.js，链上详情页 sm-tx.js）
     · smartmoney/snapshot.js 用同一份代码生成随站点发布的快照
   地址不是配置出来的，是筛出来的：排行榜 → 体检 → 打分 → 取前 6。
   全程只用公开接口，无密钥、无后端。筛选规则的说明见 smartmoney/README.md。

   一份数据长这样（浏览器缓存、快照文件、当场筛选的结果，三者同一个格式）：
     { at:    数据取回的时刻（毫秒时间戳）
       list:  [ { addr, equity, allPnl, monPnl, monVlm,                     ← 来自排行榜
                  closed, nWin, nLoss, gross, grossLoss, firstTs, lastTs,   ← 逐条成交的统计
                  trades: [ 最近 5 笔交易 ] } ]                              ← 逐条成交按哈希合并
       curve: [ [时间, 各地址近 30 日累计盈亏之和], … ] }

   目录：① 常量与规则  ② 调接口  ③ 筛选  ④ 成交明细  ⑤ 近 30 日曲线  ⑥ 页面读数的三个来源
   ============================================================ */
(function(){

  /* ---------- ① 常量与规则 ---------- */
  var INFO   = 'https://api.hyperliquid.xyz/info';
  var BOARD  = 'https://stats-data.hyperliquid.xyz/Mainnet/leaderboard';
  var DAY    = 86400000;
  var TTL    = 6 * 3600 * 1000;   // 数据超过 6 小时算旧：页面先照常显示，同时重新筛选
  var TAKE   = 6;                 // 上榜地址数
  var VET    = 36;                // 体检名额。实测出线率约 15%，只体检 10 个常常凑不满 6 个
  var MIN_OK = 3;                 // 过关地址少于这个数，这份数据不用（不渲染半张榜）
  var SHOW   = 5;                 // 每个地址列最近几笔交易
  var CURVE_N = 40;               // 曲线取多少个点

  /* 规模区间 —— 跟随对象的资金量要和引擎体量匹配：
     对方几千万时，你的跟单相对他微不足道，他一笔大单的滑点你也吃不下，
     策略容量更是两回事。所以不是「越大越好」，是「规模彼此可比」。

     中心规模不写死：默认取候选池自身的中位数，让它随市场自适应，
     不需要任何人去维护一个数字。引擎自有资金量确定后，把 TARGET_EQUITY
     设成那个数即可（跟随对象与自己体量相当时最好跟），设为 0 表示用中位数。 */
  var TARGET_EQUITY = 0;

  var R = { minEquity:400000, maxEquity:3000000, minAllPnl:100000, maxTurnover:300,
            maxDrawdown:.35, minTrackDays:90,
            minClosed:200, minProfitFactor:2.0,   /* 实测中位 4.93、25 分位 2.41，原来的 1.3 形同虚设 */
            maxTop3Share:.5, maxIdleDays:14 };

  /* 浏览器缓存的键。键里带规则指纹 —— 改了阈值缓存自动失效，否则改完代码还会吃到旧名单。
     末尾的 f4 是数据格式的版本号：格式变了要换一个值（f3 → f4：成交按哈希合并，多了 curve）。 */
  var CACHE = 'xfun.sm.' + [TAKE, VET, R.minEquity, R.maxEquity,
                            R.maxDrawdown, R.minProfitFactor, 'f4'].join('-');

  var n = function(v){ return Number(v) || 0; };

  /* ---------- ② 调接口 ---------- */
  function post(body, retry){
    return fetch(INFO, { method:'POST', headers:{'Content-Type':'application/json'},
                         body: JSON.stringify(body) }).then(function(r){
      if(!r.ok) throw new Error('HTTP '+r.status); return r.json();
    }).catch(function(e){
      /* 并发打满时接口会零星拒绝 —— 实测 40 个候选有 13 个因此空手而归，
         那是限流不是质量问题。退避重试一次再判死刑。 */
      if(retry) throw e;
      return new Promise(function(res){ setTimeout(res, 700 + Math.random()*600); })
               .then(function(){ return post(body, true); });
    });
  }

  /* 分批跑，别一次把几十个请求全甩出去 */
  function inBatches(items, size, fn){
    var out = [], i = 0;
    function step(){
      if(i >= items.length) return Promise.resolve(out);
      var slice = items.slice(i, i + size); i += size;
      return Promise.all(slice.map(fn)).then(function(r){
        out = out.concat(r);
        return new Promise(function(res){ setTimeout(res, 120); }).then(step);
      });
    }
    return step();
  }

  /* ---------- ③ 筛选 ---------- */

  /* 回撤：用累计盈亏曲线，不能用账户净值（出入金会把提现看成暴跌） */
  function drawdown(pnlHistory){
    var peak = -Infinity, mdd = 0;
    for(var i=0;i<pnlHistory.length;i++){
      var p = n(pnlHistory[i][1]);
      if(p > peak) peak = p;
      if(peak - p > mdd) mdd = peak - p;
    }
    return peak > 0 ? mdd / peak : 1;
  }

  /* 逐条成交的统计。这里按接口给的「逐条成交」算，不按合并后的交易算。 */
  function fillStats(fills){
    var closed = fills.filter(function(f){ return n(f.closedPnl) !== 0; });
    var wins = [], loss = [];
    closed.forEach(function(f){
      var v = n(f.closedPnl);
      if(v > 0) wins.push(v); else loss.push(-v);
    });
    var gp = wins.reduce(function(a,b){return a+b;},0);
    var gl = loss.reduce(function(a,b){return a+b;},0);
    var top3 = wins.slice().sort(function(a,b){return b-a;}).slice(0,3)
                   .reduce(function(a,b){return a+b;},0);
    var last = 0, first = Infinity;
    fills.forEach(function(f){ var t = n(f.time);
      if(t > last) last = t; if(t > 0 && t < first) first = t; });
    return { closed:closed.length, nWin:wins.length, nLoss:loss.length,
             gross:gp, grossLoss:gl,
             pf: gl>0 ? gp/gl : (gp>0 ? 99 : 0),
             top3Share: gp>0 ? top3/gp : 1,
             firstTs: first === Infinity ? 0 : first, lastTs: last,
             idleDays: (Date.now()-last)/DAY,
             liquidated: fills.some(function(f){
               return /liquidat/i.test(f.dir||'') && Date.now()-n(f.time) < 180*DAY; }) };
  }

  function score(c){
    var cl = function(v){ return Math.max(0, Math.min(1, v)); };
    return cl((c.pf-1)/1.5)*20 + cl(Math.log10(Math.max(1,c.allPnl))/7)*15
         + cl(1 - c.mdd/R.maxDrawdown)*18 + cl(1 - c.top3Share/R.maxTop3Share)*5
         + cl(c.trackDays/365)*12 + (c.monPnl>0?5:0)
         + cl((Math.log10(c.equity)-5.4)/1.6)*10 + cl(1 - c.idleDays/14)*5;
  }

  /* 第一步：排行榜粗筛 + 预排序。一个请求，返回按优先级排好的候选池。 */
  function candidates(){
    return fetch(BOARD).then(function(r){ return r.json(); }).then(function(d){
      var rows = d.leaderboardRows || d;
      var w = function(r,k){
        var x = (r.windowPerformances||[]).filter(function(y){ return y[0]===k; })[0];
        return x ? { pnl:n(x[1].pnl), roi:n(x[1].roi), vlm:n(x[1].vlm) } : null;
      };
      var pool = [];
      for(var i=0;i<rows.length;i++){
        var r = rows[i], all = w(r,'allTime'), mon = w(r,'month'), wk = w(r,'week');
        if(!all || !mon || !wk) continue;
        var eq = n(r.accountValue);
        if(eq < R.minEquity || eq > R.maxEquity) continue;
        if(all.pnl < R.minAllPnl || mon.pnl <= 0) continue;
        if(wk.pnl < -0.05*eq) continue;
        if(eq>0 && mon.vlm/eq > R.maxTurnover) continue;
        if(wk.vlm <= 0) continue;               /* 停摆 —— 必须在这一级筛掉，免费 */
        pool.push({ addr:r.ethAddress, equity:eq, allPnl:all.pnl, allRoi:all.roi,
                    monPnl:mon.pnl, monRoi:mon.roi, monVlm:mon.vlm });
      }
      /* 中心规模：没配就用候选池中位数 —— 自适应，无需维护 */
      var eqs = [];
      for(var q = 0; q < pool.length; q++) eqs.push(pool[q].equity);
      eqs.sort(function(a,b){ return a-b; });
      var center = TARGET_EQUITY || eqs[Math.floor(eqs.length/2)] || 1;

      /* 按「历史累计回报率 × 规模接近度」排，不按近月 ROI。
         按近月 ROI 排等于挑最近一个月最激进或最走运的那批 —— 实测选出来的
         都是月收益率七八成的极端账户，不是能长期跟的对象。
         近月为正已经是上面的硬门槛，这里只用来排长期能力。 */
      pool.sort(function(a,b){
        var f = function(x){
          var longRoi = x.allPnl / Math.max(x.equity, 1);
          var d = Math.log(x.equity / center);
          return longRoi * Math.exp(-(d*d) / 0.9);   /* 钟形：离中心规模越远权重越低 */
        };
        return f(b) - f(a);
      });
      return pool;
    });
  }

  /* 第二步：体检一个候选（两个请求）。过关返回补全了统计的候选，不过关返回 null。 */
  function vet(c){
    return Promise.all([
      post({ type:'portfolio',  user:c.addr }).catch(function(){ return null; }),
      post({ type:'userFills',  user:c.addr }).catch(function(){ return null; })
    ]).then(function(res){
      var port = res[0], fills = res[1] || [];
      if(!port || !fills.length) return null;
      var win = function(k){
        var x = port.filter(function(y){ return y[0]===k; })[0]; return x ? x[1] : null;
      };
      var all = win('allTime') || win('perpAllTime');
      if(!all || !all.pnlHistory || !all.pnlHistory.length) return null;
      var ts = all.pnlHistory;
      c.trackDays = (ts[ts.length-1][0] - ts[0][0]) / DAY;
      c.mdd = drawdown(ts);
      if(c.trackDays < R.minTrackDays || c.mdd > R.maxDrawdown) return null;

      var st = fillStats(fills);
      if(st.liquidated || st.idleDays > R.maxIdleDays) return null;
      if(st.closed < R.minClosed || st.pf < R.minProfitFactor) return null;
      if(st.top3Share > R.maxTop3Share) return null;

      for(var k in st) c[k] = st[k];
      c.score  = score(c);
      c.trades = pickTrades(toTrades(fills));                                   /* 见 ④ */
      c.month  = (win('month') || win('perpMonth') || {}).pnlHistory || [];     /* 见 ⑤ */
      return c;
    }).catch(function(){ return null; });
  }

  /* 一个地址只留页面要用的这些项 */
  function slim(c){
    return { addr:c.addr, equity:c.equity, allPnl:c.allPnl, monPnl:c.monPnl, monVlm:c.monVlm,
             closed:c.closed, nWin:c.nWin, nLoss:c.nLoss, gross:c.gross, grossLoss:c.grossLoss,
             firstTs:c.firstTs, lastTs:c.lastTs, trades:c.trades };
  }

  /* 完整跑一遍筛选，返回一份数据。过关地址不足时 list 会少于 MIN_OK，由 valid() 把关。 */
  function screen(){
    return candidates().then(function(pool){
      return inBatches(pool.slice(0, VET), 4, vet);
    }).then(function(res){
      var top = res.filter(Boolean).sort(function(a,b){ return b.score - a.score; }).slice(0, TAKE);
      return { at: Date.now(), list: top.map(slim),
               curve: curve30(top.map(function(c){ return c.month; })) };
    });
  }

  /* ---------- ④ 成交明细：逐条成交 → 交易 ----------
     接口给的是逐条成交，一笔交易（一个哈希）可能分几次成交。页面上一个哈希只占一行、
     对应一个详情页，所以这里按哈希合并：数量、成交额、盈亏、手续费相加，价格取均价，
     方向、时间、订单号、成交号取第一条的；n 记这笔交易由几条成交合成，oids 记涉及几个订单。
       · 只收永续合约的开平仓成交（方向在 DIRS 里的）；现货、强平、结算不收
       · 没有哈希的成交（全零哈希）不收：没有哈希就没有可查的详情
       · 同一个哈希下出现第二个标的时，只算第一个标的的，不把不同标的的数量加在一起
     标的名去掉场所自己的写法：'xyz:CL' → 'CL'，'kPEPE' → '1000PEPE'（千倍合约，按通行写法；
     写成 PEPE 的话价格就差了一千倍）。场所自己的标的（VENUE_COIN）一看就知道出处，写成 PERP。
     这一节只决定页面上列哪几笔、怎么写，不参与筛选，也不影响任何统计数字。 */
  var DIRS = /^(Open Long|Open Short|Close Long|Close Short|Long > Short|Short > Long)$/;
  var VENUE_COIN = /^(HYPE|PURR)$/;
  var HASH = /^0x[0-9a-f]{64}$/i, ZERO_HASH = /^0x0+$/;

  function coinName(c){
    c = String(c || '').replace(/^[^:]+:/, '');
    return /^k[A-Z]/.test(c) ? '1000' + c.slice(1) : c;
  }
  function canShow(f){
    return !!f && DIRS.test(f.dir || '') && !/^@|\//.test(f.coin || '') &&
           HASH.test(f.hash || '') && !ZERO_HASH.test(f.hash);
  }
  function decimals(s){ return (String(s).split('.')[1] || '').length; }
  function round(v, d){ var k = Math.pow(10, d); return Math.round(v * k) / k; }

  /* 同一哈希、同一标的的几条成交 → 一笔交易 */
  function merge(g){
    var a = g[0], coin = coinName(a.coin), sz = 0, ntl = 0, pnl = 0, fee = 0, dp = 0, oids = {};
    g.forEach(function(f){
      sz += n(f.sz); ntl += n(f.px) * n(f.sz); pnl += n(f.closedPnl); fee += n(f.fee);
      dp = Math.max(dp, decimals(f.sz)); oids[f.oid] = 1;
    });
    var one = g.length === 1;      /* 只有一条成交时，数量和价格用接口原值 */
    return { hash:a.hash, time:n(a.time), coin: VENUE_COIN.test(coin) ? 'PERP' : coin, dir:a.dir,
             sz: one ? String(a.sz) : sz.toFixed(dp),
             px: one || !(sz > 0) ? String(a.px) : String(Number((ntl / sz).toPrecision(6))),
             ntl:round(ntl, 2), closedPnl:round(pnl, 6), fee:round(fee, 6), feeToken:a.feeToken,
             oid:a.oid, tid:a.tid, n:g.length, oids:Object.keys(oids).length };
  }
  function toTrades(fills){
    var groups = [], byHash = {};
    (fills || []).forEach(function(f){
      if(!canShow(f)) return;
      var g = byHash[f.hash];
      if(!g){ g = byHash[f.hash] = []; groups.push(g); }
      if(!g.length || g[0].coin === f.coin) g.push(f);
    });
    return groups.map(merge);
  }
  /* 每个地址列哪几笔：有盈亏的（平仓）交易里最近 SHOW 笔。
     有别的标的可列时不列 PERP；某个地址的平仓交易全是 PERP 时，照常列。 */
  function pickTrades(trades){
    var closed = trades.filter(function(t){ return t.closedPnl !== 0; });
    var named  = closed.filter(function(t){ return t.coin !== 'PERP'; });
    return (named.length ? named : closed).slice(0, SHOW);
  }
  /* 某个地址的全部交易（合并后）。链上详情页被直接打开、本地找不到这笔时用。 */
  function tradesOf(addr){
    return post({ type:'userFills', user:addr }).then(toTrades);
  }

  /* ---------- ⑤ 近 30 日曲线 ----------
     每个地址的 month.pnlHistory 是 [时间, 累计盈亏]，从 0 起算，各自的取样时刻不一样。
     这里把它们对齐到同一组时刻（CURVE_N 个，等间隔）再相加：
     某个时刻取该地址「此刻之前最近的一个值」，它的第一个点之前按 0 算。 */
  function curve30(series){
    var t0 = Infinity, t1 = 0;
    series.forEach(function(s){
      if(!s || !s.length) return;
      t0 = Math.min(t0, n(s[0][0])); t1 = Math.max(t1, n(s[s.length-1][0]));
    });
    if(!(t1 > t0)) return [];
    var out = [];
    for(var k = 0; k < CURVE_N; k++){
      var t = k === CURVE_N - 1 ? t1 : Math.round(t0 + (t1 - t0) * k / (CURVE_N - 1)), sum = 0;
      series.forEach(function(s){
        var v = 0;
        for(var i = 0; s && i < s.length && n(s[i][0]) <= t; i++) v = n(s[i][1]);
        sum += v;
      });
      out.push([t, round(sum, 2)]);
    }
    return out;
  }

  /* ---------- ⑥ 页面读数的三个来源 ----------
     浏览器缓存、随站点发布的快照、当场筛选（上面的 screen）。谁先谁后由页面决定，见 sm-board.js 的 boot。 */
  var ADDR = /^0x[0-9a-f]{40}$/i;

  /* 一份数据能不能用：格式对、地址够数 */
  function valid(d){
    return !!d && d.at > 0 && Array.isArray(d.list) && d.list.length >= MIN_OK && Array.isArray(d.curve) &&
           d.list.every(function(c){ return !!c && ADDR.test(c.addr || '') && c.equity > 0 && Array.isArray(c.trades); });
  }
  function readCache(){
    try{ var d = JSON.parse(localStorage.getItem(CACHE) || 'null'); return valid(d) ? d : null; }
    catch(e){ return null; }
  }
  function writeCache(d){
    try{ localStorage.setItem(CACHE, JSON.stringify(d)); }catch(e){}
  }
  /* 快照文件 data/smartmoney.json，由 smartmoney/snapshot.js 生成。没有这个文件、或文件内容不对，都当它不存在。
     no-cache：每次都向服务器确认文件有没有更新（没更新时服务器只回一个 304，不重新下载）。 */
  function readSnapshot(base){
    return fetch(base + 'data/smartmoney.json', { cache:'no-cache' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ return valid(d) ? d : null; })
      .catch(function(){ return null; });
  }

  var API = { TTL:TTL, MIN_OK:MIN_OK, screen:screen, valid:valid,
              readCache:readCache, writeCache:writeCache, readSnapshot:readSnapshot,
              toTrades:toTrades, pickTrades:pickTrades, tradesOf:tradesOf, curve30:curve30 };
  if(typeof module !== 'undefined' && module.exports) module.exports = API;   /* Node：snapshot.js、自检脚本 */
  else window.XFSM = API;                                                     /* 浏览器 */
})();

/* ============================================================
   聪明钱看板 · 数字与时间的写法（首页看板和链上详情页共用）
   负数的负号一律用「−」，金额千分位用英文逗号，时间一律 UTC。
   ============================================================ */
(function(SM){
  var n = function(v){ return Number(v) || 0; };
  var p2 = function(x){ return ('0' + x).slice(-2); };
  var sign = function(v){ return v < 0 ? '−' : '+'; };
  var fixed2 = function(v){ return v.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); };

  function int(v){ return Math.round(v).toLocaleString('en-US'); }            /* 1,560 */
  function usd(v){ return '$' + int(v); }                                      /* $10,511 */
  function usd2(v){ return '$' + fixed2(n(v)); }                               /* $10,510.50 */
  function usdS(v){ v = n(v); return sign(v) + '$' + fixed2(Math.abs(v)); }    /* +$1,580.00 / −$220.00 */
  function compact(v){                                                         /* $7.35M / $240.00M / $512K */
    var a = Math.abs(v);
    if(a >= 1e9) return '$' + (v/1e9).toFixed(2) + 'B';
    if(a >= 1e6) return '$' + (v/1e6).toFixed(2) + 'M';
    if(a >= 1e3) return '$' + Math.round(v/1e3) + 'K';
    return usd(v);
  }
  function compactS(v){ return sign(v) + compact(Math.abs(v)); }               /* +$5.10M */
  /* 卡片里的数值走这两个：百万以上转紧凑写法。
     真实账户动辄七八位数，带两位小数直接铺进去会顶破卡片、压到隔壁列。 */
  function usdAuto(v){ return Math.abs(v) >= 1e6 ? compact(v) : usd(v); }
  function usdAutoS(v){ return Math.abs(v) >= 1e6 ? compactS(v) : sign(v) + '$' + Math.abs(Math.round(v)).toLocaleString('en-US'); }
  function pct(v, d){ return sign(v) + Math.abs(v).toFixed(d) + '%'; }         /* +186.2% */

  function day(ts){ var d = new Date(ts); return p2(d.getUTCMonth()+1) + '-' + p2(d.getUTCDate()); }                 /* 10-04 */
  function stamp(ts){ var d = new Date(ts); return day(ts) + ' ' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()); }  /* 10-04 16:52 */
  function utc(ts){ var d = new Date(n(ts)); return isNaN(d) ? '' : d.toISOString().replace('T',' ').slice(0,19) + ' UTC'; } /* 2026-10-04 16:52:07 UTC */

  function shortAddr(a){ return a.slice(0,8) + '…' + a.slice(-6); }            /* 0x7C1f9a…4bA93E */
  function shortHash(h){ return h.slice(0,10) + '…' + h.slice(-4); }           /* 0x3d9a1c40…b721 */
  /* 数字串加千分位，小数部分原样保留（'112000.0' → '112,000.0'） */
  function sep(s){
    s = String(s == null ? '' : s);
    var m = s.match(/^(-?)(\d+)(\.\d+)?$/);
    return m ? m[1] + m[2].replace(/\B(?=(\d{3})+$)/g, ',') + (m[3] || '') : s;
  }
  /* 写进 innerHTML 之前过一遍：标的名这类文字来自接口，不能当成标记直接插进页面 */
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  SM.fmt = { n:n, int:int, usd:usd, usd2:usd2, usdS:usdS, compact:compact, compactS:compactS,
             usdAuto:usdAuto, usdAutoS:usdAutoS, pct:pct, day:day, stamp:stamp, utc:utc,
             shortAddr:shortAddr, shortHash:shortHash, sep:sep, esc:esc };
})(window.XFSM);

/* ============================================================
   聪明钱看板 · 首页

   读数（boot）   ① 浏览器缓存 → ② 随站点发布的快照 → ③ 当场筛选。
                  ①② 里谁新用谁；最新的那份也超过 6 小时，才走 ③。
   画页面（paint） 把一份数据写到页面上带 data-f="…" 的位置；每个数字怎么算，都在 paint 里。
   弹窗与跳转     点地址行开「金库套利记录」，点一笔交易进站内「链上详情」页（tx/，见 sm-tx.js）。

   数据的格式与来源见 sm-data.js，数字写法见 sm-format.js。
   ============================================================ */
(function(){
  var SM = window.XFSM, F = SM.fmt, XF = window.XF;
  /* 区块浏览器域名，build.py 的 EXPLORER 注入。空串 = 不外跳：行内不出图标，哈希链到站内详情页。 */
  var EX   = '';
  var BACK = 'xfun.vault.back';   /* 返回标记：详情页（sm-tx.js）点返回时写，这里的 reopen 读 */
  var DATA = null;                /* 当前画在页面上的那份数据 */

  /* 带数字的句子。{n} 这类位置在画页面时填进实际的值。
     这里写中、英两种，其余六种语言的译文在 protosrc/lang/；切语言时由 shell.js 重写。 */
  var TEXT = {
    source:     '<t-x data-i="k5c327f7">更新于 {t}</t-x>',
    boardNote:  '<t-x data-i="k15ee0fa">{n} 个聪明钱地址聚合，逐笔成交记录可查</t-x>',
    nAddrNote:  '<t-x data-i="kee6b96c">{n} 个金库地址合计</t-x>',
    nAddrShort: '<t-x data-i="ke85da49">{n} 个地址合计</t-x>',
    winLabel:   '<t-x data-i="kf988a1d">盈利 {n}</t-x>',
    lossLabel:  '<t-x data-i="k69396a6">亏损 {n}</t-x>',
    indexRange: '<t-x data-i="k4c137c9">最近 {n} 笔 · {a} ~ {b}</t-x>'
  };
  /* 成交方向：接口给的写法 → 页面上的写法 */
  var DIR = {
    'Close Long':   '<t-x data-i="k36cf290">平多</t-x>',
    'Close Short':  '<t-x data-i="k444c416">平空</t-x>',
    'Open Long':    '<t-x data-i="kb585ade">开多</t-x>',
    'Open Short':   '<t-x data-i="k2f482df">开空</t-x>',
    'Long > Short': '<t-x data-i="kf242e56">反手做空</t-x>',
    'Short > Long': '<t-x data-i="k7e13969">反手做多</t-x>'
  };

  function set(key, html){
    [].forEach.call(document.querySelectorAll('[data-f="'+key+'"]'), function(el){ el.innerHTML = html; });
  }
  function say(key, vars){ set(key, XF.text(TEXT[key], vars)); }

  /* ---------- 画页面 ----------
     d 为空 = 手上没有数据：数字位一律「—」，地址行和曲线都不画，页面上不放任何内容。
     state 是这份数据走的哪条路（cache / snapshot / live），和数据时刻一起记在徽标的
     data-state、data-at 上，只给排查和自检用，页面上不显示。 */
  function paint(d, state){
    DATA = d || null;
    var list = d ? d.list : [];
    var sum = function(k){ return list.reduce(function(s, c){ return s + (c[k] || 0); }, 0); };
    var eq = sum('equity'), pnl = sum('allPnl'), nw = sum('nWin'), nl = sum('nLoss'), closed = sum('closed');
    var roi30   = eq > 0 ? sum('monPnl') / eq * 100 : 0;
    var winRate = nw + nl ? nw / (nw + nl) * 100 : 0;

    /* —— 数字 —— */
    var num = {
      aggEquity:     F.compact(eq),                  // 聚合本金      各地址账户净值之和
      aggEquityFull: F.usdAuto(eq),
      aggPnl:        F.compactS(pnl),                // 累计套利净利  各地址全周期盈亏之和
      aggPnlFull:    F.usdAutoS(pnl),
      monRoi:        F.pct(roi30, 2),                // 近 30 日      各地址近 30 日盈亏之和 ÷ 聚合本金
      aggRoi:        F.pct(roi30 * 365 / 30, 1),     // 年化 APR      近 30 日收益率 × 365/30
      vol30d:        F.compact(sum('monVlm')),       // 成交额        各地址近 30 日成交额之和
      execCount:     F.int(closed),                  // 执行笔数      各地址有盈亏的成交条数之和
      winRate:       winRate.toFixed(1),             // 已平仓胜率    盈利条数 ÷（盈利条数 + 亏损条数）
      grossWin:      F.usdAutoS(sum('gross')),       // 盈利一侧      盈利成交的盈亏之和
      grossLoss:     F.usdAutoS(-sum('grossLoss'))   // 亏损一侧      亏损成交的盈亏之和
    };
    Object.keys(num).forEach(function(k){ set(k, d ? num[k] : '—'); });

    /* —— 带数字的句子 —— */
    var count = d ? String(list.length) : '—';
    var first = Math.min.apply(null, list.map(function(c){ return c.firstTs || Infinity; }));
    var last  = Math.max.apply(null, list.map(function(c){ return c.lastTs || 0; }));
    say('source',     { t: d ? F.stamp(d.at) + ' UTC' : '—' });             // 数据取回的时刻
    say('boardNote',  { n: count });
    say('nAddrNote',  { n: count });
    say('nAddrShort', { n: count });
    say('winLabel',   { n: d ? F.int(nw) : '—' });
    say('lossLabel',  { n: d ? F.int(nl) : '—' });
    /* 索引区间：接口只返回每个地址最近若干条成交，这里如实标出这些成交覆盖的日期 */
    say('indexRange', { n: d ? F.int(closed) : '—',
                        a: isFinite(first) ? F.day(first) : '—', b: last > 0 ? F.day(last) : '—' });

    /* —— 胜率条、地址行、曲线、徽标 —— */
    var bar = function(key, w){ var el = document.querySelector('[data-f="'+key+'"]'); if(el) el.style.width = w; };
    bar('winBar',  d ? winRate.toFixed(1) + '%' : '0');
    bar('lossBar', d ? (100 - winRate).toFixed(1) + '%' : '0');
    set('vaults', list.map(vaultRow).join(''));
    drawCurve(d ? d.curve : []);
    var src = document.querySelector('[data-f="source"]');
    if(src && d){ src.dataset.state = state; src.dataset.at = d.at; }
    if(d) reopen();
  }

  var ICON = '<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" '
           + 'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'
           + '<path d="M4.6 2H2.6A.6.6 0 0 0 2 2.6v6.8a.6.6 0 0 0 .6.6h6.8a.6.6 0 0 0 .6-.6V7.4"/>'
           + '<path d="M7.2 2H10v2.8"/><path d="M5.1 6.9 10 2"/></svg>';
  function vaultRow(c, i){
    return '<div class="vault-row" data-open="m-vault" data-addr="'+c.addr+'">'
         + '<span class="vault-i">'+('0'+(i+1)).slice(-2)+'</span>'
         + '<span class="vault-a">'+F.shortAddr(c.addr)+'</span>'
         + '<span class="vault-v mono">'+F.usd(c.equity)+'</span>'
         + (EX ? '<a class="vault-x" href="'+EX+'/address/'+c.addr+'" target="_blank" '
               + 'rel="noopener noreferrer" aria-label="View on explorer">'+ICON+'</a>' : '')
         + '<span class="vault-go">›</span></div>';
  }

  /* 曲线：数据里的 curve 有几个点就画几个点。横轴按时间，纵轴按数值范围铺满画布（600×104）。 */
  function drawCurve(curve){
    var card = document.querySelector('[data-f="curve"]');
    if(!card) return;
    var W = 600, H = 104, pts = curve && curve.length > 1 ? curve : [];
    var t0 = pts.length ? pts[0][0] : 0, span = pts.length ? (pts[pts.length-1][0] - t0) || 1 : 1;
    var vs = pts.map(function(p){ return p[1]; });
    var lo = Math.min.apply(null, vs), range = (Math.max.apply(null, vs) - lo) || 1;
    var xy = pts.map(function(p){ return [(p[0] - t0) / span * W, H - 8 - (p[1] - lo) / range * (H - 22)]; });
    var line = xy.map(function(c){ return c[0].toFixed(1) + ',' + c[1].toFixed(1); }).join(' ');
    card.querySelector('.eq-line').setAttribute('points', line);
    card.querySelector('.eq-area').setAttribute('points', line ? '0,'+H+' '+line+' '+W+','+H : '');
    var end = xy[xy.length - 1];
    [].forEach.call(card.querySelectorAll('.eq-dot'), function(dot){
      if(end){ dot.setAttribute('cx', end[0].toFixed(1)); dot.setAttribute('cy', end[1].toFixed(1)); }
    });
    card.querySelector('.eq').toggleAttribute('data-on', !!end);    /* 没有曲线时末端的圆点不显示（见 app.css） */
  }

  /* ---------- 弹窗「金库套利记录」 ---------- */
  function find(addr){
    addr = String(addr || '').toLowerCase();
    return ((DATA && DATA.list) || []).filter(function(c){ return c.addr.toLowerCase() === addr; })[0] || null;
  }
  /* 站内「链上详情」页的网址，相对首页写（首页就在站点根）：tx/?a=<金库地址>&h=<交易哈希> */
  function txUrl(addr, hash){ return 'tx/?a=' + addr + '&h=' + hash; }

  function tradeRow(addr, t){
    var hash = F.esc(t.hash), short = F.esc(F.shortHash(t.hash));
    return '<tr data-tx="'+hash+'"><td class="num">'+F.stamp(t.time)+'</td>'
         + '<td>'+F.esc(t.coin)+' '+XF.text(DIR[t.dir] || '')+'</td>'
         + '<td class="num">'+F.usd(t.ntl)+'</td>'
         + '<td class="num '+(t.closedPnl >= 0 ? 'pos' : 'neg')+'">'+F.usdS(t.closedPnl)+'</td>'
         + '<td class="hash">'
         + (EX ? '<a href="'+EX+'/tx/'+hash+'" target="_blank" rel="noopener noreferrer">'+short+'</a>'
               : '<a class="txlink" href="'+txUrl(addr, hash)+'">'+short+'</a>')
         + '</td></tr>';
  }

  /* 点地址行：shell.js 负责打开弹窗、写上地址；这里把这个地址的三个数字和最近几笔交易填进去 */
  document.addEventListener('click', function(e){
    var row = e.target.closest && e.target.closest('.vault-row[data-addr]');
    var m = document.getElementById('m-vault'), c = row && find(row.dataset.addr);
    if(!m || !c) return;
    var put = function(k, v){ var el = m.querySelector('[data-v="'+k+'"]'); if(el) el.textContent = v; };
    put('equity', F.usdAuto(c.equity));       // 本金
    put('monPnl', F.usdAutoS(c.monPnl));      // 近 30 日净利
    put('closed', F.int(c.closed));           // 执行笔数
    m.querySelector('tbody').innerHTML = c.trades.length
      ? c.trades.map(function(t){ return tradeRow(c.addr, t); }).join('')
      : '<tr><td colspan="5" style="text-align:center;color:var(--muted)">—</td></tr>';   /* 没有可列的交易 */
  });

  /* 点一笔交易 → 站内「链上详情」页。整行可点；点在哈希链接上就让链接自己走。 */
  document.addEventListener('click', function(e){
    var tr = e.target.closest && e.target.closest('#m-vault tbody tr[data-tx]');
    if(!tr || e.target.closest('a[href]')) return;
    var vx = document.querySelector('#m-vault [data-vexp]');        /* shell.js 打开弹窗时把当前地址记在这个按钮上 */
    location.href = txUrl((vx && vx.dataset.copy) || '', tr.dataset.tx);
  });

  /* 从详情页返回首页时，回到刚才那个地址的金库套利记录。标记只管一次。 */
  function reopen(){
    var addr = '';
    try{ addr = sessionStorage.getItem(BACK) || ''; sessionStorage.removeItem(BACK); }catch(e){}
    if(!addr) return;
    var rows = document.querySelectorAll('.vault-row[data-addr]');
    for(var i = 0; i < rows.length; i++)
      if(rows[i].dataset.addr.toLowerCase() === addr.toLowerCase()){ rows[i].click(); return; }
  }
  /* 浏览器从后退缓存里原样恢复首页时弹窗本来就开着，标记用不上，清掉 */
  window.addEventListener('pageshow', function(ev){
    if(ev.persisted){ try{ sessionStorage.removeItem(BACK); }catch(e){} }
  });

  /* ---------- 启动：读数的顺序 ---------- */
  function boot(){
    if(!document.querySelector('[data-f="vaults"]')) return;      // 只有首页有看板
    paint(null);                                                   // 先画空的：数字位都是「—」
    var cache = SM.readCache();                                    // ① 浏览器缓存（上一次当场筛选的结果）
    if(cache) paint(cache, 'cache');
    SM.readSnapshot(XF.BASE).then(function(snap){                  // ② 随站点发布的快照
      var best = cache;
      if(snap && (!cache || snap.at > cache.at)){ best = snap; paint(snap, 'snapshot'); }
      if(best && Date.now() - best.at < SM.TTL) return;            // 手上最新的一份不到 6 小时：到此为止
      return SM.screen().then(function(d){                         // ③ 当场筛选（十几秒到几十秒）
        if(!SM.valid(d)) return;                                   // 过关地址太少：保留页面上现有的
        paint(d, 'live');
        SM.writeCache(d);
      });
    }).catch(function(e){ if(window.__SMDEBUG) console.error('SM-FAIL', e && e.message, e && e.stack); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* ============================================================
   聪明钱看板 · 链上详情页（tx/）

   网址：tx/?a=<金库地址>&h=<交易哈希>
   找这笔交易的顺序：① 浏览器缓存 → ② 随站点发布的快照 → ③ 按地址去接口取。
   前两处就是首页看板用的那两份数据，从首页点进来时一定找得到，不用发请求；
   ③ 只在直接打开网址、而这笔交易又不在本地数据里时才用。

   做法对应 FLC 的 TxDetailView：链路在站内闭环，不外跳区块浏览器。
   字段名固定用英文、数值按记录原样显示，不走多语言。
   数据的格式与来源见 sm-data.js，数字写法见 sm-format.js。
   ============================================================ */
(function(){
  var SM = window.XFSM, F = SM.fmt, XF = window.XF;
  var HASH = /^0x[0-9a-f]{64}$/i, ADDR = /^0x[0-9a-f]{40}$/i;
  var BACK = 'xfun.vault.back';   /* 返回标记：这里点返回时写，首页（sm-board.js 的 reopen）读 */
  var addr = '';                  /* 这笔交易所属的金库地址 */

  /* 页面有三种状态：loading 读取中 / none 未找到 / ok 显示这笔交易 */
  function show(name){
    [].forEach.call(document.querySelectorAll('[data-tx-state]'), function(el){
      el.hidden = el.dataset.txState !== name;
    });
  }
  function byHash(trades, hash){
    return (trades || []).filter(function(t){ return String(t.hash).toLowerCase() === hash; })[0] || null;
  }
  /* 在一份数据里找这笔交易；网址里带了地址，就只在这个地址名下找 */
  function findIn(d, hash){
    var list = d ? d.list : [];
    for(var i = 0; i < list.length; i++){
      if(addr && list[i].addr.toLowerCase() !== addr.toLowerCase()) continue;
      var t = byHash(list[i].trades, hash);
      if(t){ addr = list[i].addr; return t; }
    }
    return null;
  }

  /* 一笔交易 → 页面上的十一项。由几条成交合并成的交易（t.n > 1）：
     数量、成交额、盈亏、手续费是合计，价格是均价（标 Avg Price），成交号后面注明另有几条。 */
  function paint(t){
    var more = function(k){ return k > 1 ? ' (+' + (k - 1) + ')' : ''; };
    var v = { hash:String(t.hash), coin:t.coin, dir:t.dir, sz:F.sep(t.sz), px:'$' + F.sep(t.px),
              notional:F.usd2(t.ntl), pnl:F.usdS(t.closedPnl),
              fee:(F.n(t.fee).toFixed(4) + ' ' + (t.feeToken || '')).trim(),
              oid:String(t.oid) + more(t.oids), time:F.utc(t.time), tid:String(t.tid) + more(t.n) };
    Object.keys(v).forEach(function(k){
      [].forEach.call(document.querySelectorAll('[data-tx-f="'+k+'"],[data-tx-a="'+k+'"]'), function(el){
        el.textContent = v[k];
      });
    });
    var one = function(s){ return document.querySelector(s) || {}; };
    one('[data-tx-k="px"]').textContent = t.n > 1 ? 'Avg Price' : 'Price';
    one('[data-tx-addr]').textContent = addr ? F.shortAddr(addr) : '';
    var cp = document.querySelector('[data-tx-copy]');
    if(cp) cp.dataset.copy = v.hash;
    show('ok');
  }

  function boot(){
    if(!document.querySelector('[data-txp]')) return;             // 只有链上详情页有这块
    var q = {};
    location.search.replace(/[?&]([ah])=([^&]*)/g, function(_, k, val){ q[k] = decodeURIComponent(val); });
    var hash = (q.h || '').toLowerCase();
    if(ADDR.test(q.a || '')) addr = q.a;
    if(!HASH.test(hash)) return show('none');

    var t = findIn(SM.readCache(), hash);                         // ① 浏览器缓存
    if(t) return paint(t);
    SM.readSnapshot(XF.BASE).then(function(snap){                 // ② 随站点发布的快照
      t = findIn(snap, hash);
      if(t || !addr) return t;
      return SM.tradesOf(addr).then(function(all){ return byHash(all, hash); });   // ③ 按地址去接口取
    }).then(function(t){ if(t) paint(t); else show('none'); })
      .catch(function(){ show('none'); });
  }

  /* 页面上的两个返回入口：回首页，并让首页回到这个地址的金库套利记录 */
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-tx-back]');
    if(!b) return;
    e.preventDefault();
    try{ if(addr) sessionStorage.setItem(BACK, addr); }catch(err){}
    var ref = document.referrer || '';
    if(history.length > 1 && ref.indexOf(XF.BASE) === 0 && !/\/tx\//.test(ref)) history.back();
    else location.href = XF.BASE;
  });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
