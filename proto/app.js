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

/* 区块浏览器域名 —— 由 build.py 顶部的 EXPLORER 注入，改那一行全站生效。 */
var EXPLORER = 'https://hypurrscan.io';

/* ---------- 全局事件 ---------- */
document.addEventListener('click', function(e){
  /* 注意：.drawer / .modal 自己用 data-open 存开合状态，必须排除，
     否则抽屉里和弹窗里的 <a> 会被当成弹窗触发器，preventDefault 掉，链接点了没反应。 */
  /* 真外链先放行。区块浏览器链接嵌在 .vault-row[data-open] 和表格单元格里，
     不放行就会被下面的 preventDefault 吃掉 —— 和当初抽屉链接点不动是同一个坑。 */
  var lk = e.target.closest('a[href]');
  /* 原型里的链上地址/交易哈希是占位值，点过去是 404。
     拦下来给个明确提示，而不是把人送去一个「未找到」页面。
     项目方填入真实地址后，build.py 把 DEMO_LINKS 置 False，这个标记就没了，链接直接生效。 */
  if(lk && lk.hasAttribute('data-demo')){
    e.preventDefault();
    toast('原型示例地址，正式环境会跳转区块浏览器',
          'Sample address \u2014 links to the block explorer in production');
    return;
  }
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
      var vx = document.querySelector('[data-vexp]');
      if(vx) vx.href = EXPLORER + '/address/' + el.dataset.addr; }
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
  markWide();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

var wideT;
window.addEventListener('resize', function(){
  clearTimeout(wideT); wideT = setTimeout(function(){ markWide(); }, 160);
});

window.XF = { toast:toast, openModal:openModal, closeModal:closeModal, setLang:setLang, setState:setState, BASE:BASE };
})();

/* ============================================================
   聪明钱筛选 —— 页面运行时
   地址不是配置出来的，是当场筛出来的：排行榜 → 体检 → 打分 → 取前 6。
   全程只打 Hyperliquid 的公开接口，无密钥、无后端。
   筛选规则与完整实现见 smartmoney/，这里是给页面用的精简版。
   ============================================================ */
(function(){
  var EX     = 'https://hypurrscan.io';
  var INFO   = 'https://api.hyperliquid.xyz/info';
  var BOARD  = 'https://stats-data.hyperliquid.xyz/Mainnet/leaderboard';
  /* 键里带规则指纹 —— 改了阈值缓存自动失效，否则改完代码还会吃到旧名单 */
  var CACHE;
  var TTL    = 6 * 3600 * 1000;   // 与筛选规则里的复筛周期一致
  var TAKE   = 6;
  var VET    = 36;                // 体检名额。实测出线率约 15%，只体检 10 个常常凑不满 6 个
  var MIN_OK = 3;                 // 少于这个数就别渲染半张榜，保留页面内置内容
  var DAY    = 86400000;

    /* 规模区间 —— 跟随对象的资金量要和引擎体量匹配：
     对方几千万时，你的跟单相对他微不足道，他一笔大单的滑点你也吃不下，
     策略容量更是两回事。所以不是「越大越好」，是「规模彼此可比」。

     中心规模不写死：默认取候选池自身的中位数，让它随市场自适应，
     不需要任何人去维护一个数字。引擎自有资金量确定后，把 TARGET_EQUITY
     设成那个数即可（跟随对象与自己体量相当时最好跟），设为 0 表示用中位数。 */
  var TARGET_EQUITY = 0;

  var R = { minEquity:400000, maxEquity:3000000, minAllPnl:100000, maxTurnover:300,
            maxDrawdown:.35, minTrackDays:90,
            minClosed:200, minProfitFactor:2.0,   /* 实测中位 4.93、25 分位 2.41，原来的 1.3 形同虚设 */ maxTop3Share:.5, maxIdleDays:14 };

  CACHE = 'xfun.sm.' + [TAKE, VET, R.minEquity, R.maxEquity,
                        R.maxDrawdown, R.minProfitFactor].join('-');

  var n = function(v){ return Number(v) || 0; };

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

  /* ---------- 格式化 ---------- */
  function usd(v){ return '$' + Math.round(v).toLocaleString('en-US'); }
  function usdS(v){ return (v<0?'−':'+') + '$' + Math.abs(v).toLocaleString('en-US',
                      {minimumFractionDigits:2, maximumFractionDigits:2}); }
  function compact(v){
    var a = Math.abs(v);
    if(a >= 1e9) return '$' + (v/1e9).toFixed(2) + 'B';
    if(a >= 1e6) return '$' + (v/1e6).toFixed(2) + 'M';
    if(a >= 1e3) return '$' + Math.round(v/1e3) + 'K';
    return usd(v);
  }
  function compactS(v){ return (v<0?'−':'+') + compact(Math.abs(v)); }
  /* 卡片里的数值一律走这两个：百万以上转紧凑写法。
     真实账户动辄七八位数，带两位小数直接铺进去会顶破 .stat 卡片、压到隔壁列。 */
  function usdAuto(v){ return Math.abs(v) >= 1e6 ? compact(v) : usd(v); }
  function usdAutoS(v){ return Math.abs(v) >= 1e6 ? compactS(v)
                        : (v<0?'−':'+') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US'); }
  function shortAddr(a){ return a.slice(0,8) + '…' + a.slice(-6); }
  function hhmm(ts){
    var d = new Date(ts), p = function(x){ return ('0'+x).slice(-2); };
    return p(d.getUTCMonth()+1) + '-' + p(d.getUTCDate()) + ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes());
  }
  var DIR = { 'Close Long':'平多', 'Close Short':'平空', 'Open Long':'开多', 'Open Short':'开空',
              'Long > Short':'反手做空', 'Short > Long':'反手做多' };
  function dirText(d){ return DIR[d] || d || ''; }

  /* ---------- 回撤：用累计盈亏曲线，不能用账户净值（出入金会把提现看成暴跌）---------- */
  function drawdown(pnlHistory){
    var peak = -Infinity, mdd = 0;
    for(var i=0;i<pnlHistory.length;i++){
      var p = n(pnlHistory[i][1]);
      if(p > peak) peak = p;
      if(peak - p > mdd) mdd = peak - p;
    }
    return peak > 0 ? mdd / peak : 1;
  }

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

  /* ---------- 筛选 ---------- */
  function screen(){
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
      /* 预排序：近月风险调整收益为主、规模为辅。
         别按「历史总收益/净值」排 —— 会把一堆早已停摆的老账户顶到前面。 */
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

      var vet = pool.slice(0, VET);

      return inBatches(vet, 4, function(c){
        return Promise.all([
          post({ type:'portfolio',  user:c.addr }).catch(function(){ return null; }),
          post({ type:'userFills',  user:c.addr }).catch(function(){ return null; })
        ]).then(function(res){
          var pf = res[0], fills = res[1] || [];
          if(!pf || !fills.length) return null;
          var pick = function(k){
            var x = pf.filter(function(y){ return y[0]===k; })[0]; return x ? x[1] : null;
          };
          var all = pick('allTime') || pick('perpAllTime');
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
          c.fills = fills.filter(function(f){ return n(f.closedPnl) !== 0; }).slice(0,5);
          c.score = score(c);
          return c;
        }).catch(function(){ return null; });
      }).then(function(list){
        return list.filter(Boolean).sort(function(a,b){ return b.score - a.score; }).slice(0, TAKE);
      });
    });
  }

  /* ---------- 渲染 ---------- */
  var DATA = null;

  function set(key, html){
    [].forEach.call(document.querySelectorAll('[data-f="'+key+'"]'), function(el){
      el.innerHTML = html;
    });
  }

  function render(list){
    if(!list || list.length < MIN_OK) return;
    DATA = {};
    list.forEach(function(c){ DATA[c.addr.toLowerCase()] = c; });

    var eq = list.reduce(function(s,c){ return s + c.equity; }, 0);
    var pnl = list.reduce(function(s,c){ return s + c.allPnl; }, 0);
    var gw  = list.reduce(function(s,c){ return s + c.gross; }, 0);
    var gl  = list.reduce(function(s,c){ return s + c.grossLoss; }, 0);
    var nw  = list.reduce(function(s,c){ return s + c.nWin; }, 0);
    var nl  = list.reduce(function(s,c){ return s + c.nLoss; }, 0);
    var wr  = (nw+nl) ? nw/(nw+nl)*100 : 0;
    var pnl30 = 0;
    for(var z = 0; z < list.length; z++) pnl30 += list[z].monPnl || 0;

    set('aggEquity', compact(eq));
    set('aggEquityFull', usdAuto(eq));
    set('aggPnl', compactS(pnl));
    set('aggPnlFull', usdAutoS(pnl));
    set('aggRoi', (pnl/Math.max(eq,1)*100 >= 0 ? '+' : '') + (pnl/Math.max(eq,1)*100).toFixed(1) + '%');
    set('winRate', wr.toFixed(1));
    set('grossWin', usdAutoS(gw));
    set('grossLoss', usdAutoS(-gl));
    set('winLabel', '盈利 ' + nw.toLocaleString('en-US'));
    set('lossLabel', '亏损 ' + nl.toLocaleString('en-US'));
    set('nAddrNote', list.length + ' 个金库地址合计');
    set('boardNote', list.length + ' 个聪明钱地址聚合，每一个都能在链上查到');
    set('nAddrShort', list.length + ' 个地址合计');

    /* 右侧曲线卡底部那三个数原先是写死的，左右一对比就露馅 */
    var vol = 0, execN = 0;
    for(var i = 0; i < list.length; i++){ vol += list[i].monVlm || 0; execN += list[i].closed || 0; }
    set('vol30d', compact(vol));
    set('execCount', execN.toLocaleString('en-US'));
    set('monRoi', (eq > 0 ? (pnl30 / eq * 100 >= 0 ? '+' : '') + (pnl30 / eq * 100).toFixed(2) : '0.00') + '%');

    /* 索引区间：userFills 只返回最近若干笔，这里如实标出覆盖的时间范围 */
    /* 用全量成交的时间跨度，不是弹窗里截取的那 5 条 */
    var t0 = Infinity, t1 = 0;
    list.forEach(function(c){
      if(c.firstTs && c.firstTs < t0) t0 = c.firstTs;
      if(c.lastTs && c.lastTs > t1) t1 = c.lastTs;
    });
    if(t1 > 0){
      var md = function(ts){ var d = new Date(ts), p2 = function(x){ return ('0'+x).slice(-2); };
                             return p2(d.getUTCMonth()+1) + '-' + p2(d.getUTCDate()); };
      set('indexRange', '最近 ' + execN.toLocaleString('en-US') + ' 笔 · ' + md(t0) + ' ~ ' + md(t1));
    }

    /* 地址是筛出来的真地址，弹窗底部那个按钮不该再被 demo 拦截 */
    [].forEach.call(document.querySelectorAll('[data-vexp]'), function(a){ a.removeAttribute('data-demo'); });
    var wb = document.querySelector('[data-f="winBar"]'), lb = document.querySelector('[data-f="lossBar"]');
    if(wb) wb.style.width = wr.toFixed(1) + '%';
    if(lb) lb.style.width = (100-wr).toFixed(1) + '%';

    var box = document.querySelector('[data-f="vaults"]');
    if(box){
      box.innerHTML = list.map(function(c, i){
        return '<div class="vault-row" data-open="m-vault" data-addr="'+c.addr+'">'
             + '<span class="vault-i">'+('0'+(i+1)).slice(-2)+'</span>'
             + '<span class="vault-a">'+shortAddr(c.addr)+'</span>'
             + '<span class="vault-v mono">'+usd(c.equity)+'</span>'
             + '<a class="vault-x" href="'+EX+'/address/'+c.addr+'" target="_blank" '
             + 'rel="noopener noreferrer" aria-label="View on explorer">'
             + '<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" '
             + 'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'
             + '<path d="M4.6 2H2.6A.6.6 0 0 0 2 2.6v6.8a.6.6 0 0 0 .6.6h6.8a.6.6 0 0 0 .6-.6V7.4"/>'
             + '<path d="M7.2 2H10v2.8"/><path d="M5.1 6.9 10 2"/></svg></a>'
             + '<span class="vault-go">›</span></div>';
      }).join('');
    }

    var src = document.querySelector('[data-f="source"]');
    if(src){
      src.classList.remove('chip-quiet');
      src.innerHTML = '实时 ' + hhmm(Date.now()) + ' UTC';
    }
  }

  /* 弹窗：用筛选时already拉到的成交，不再多打一次接口 */
  document.addEventListener('click', function(e){
    var row = e.target.closest && e.target.closest('.vault-row[data-addr]');
    if(!row || !DATA) return;
    var c = DATA[(row.dataset.addr||'').toLowerCase()];
    if(!c) return;
    var m = document.getElementById('m-vault');
    if(!m) return;
    var sv = m.querySelectorAll('.stats .stat-v');
    if(sv[0]) sv[0].textContent = usdAuto(c.equity);
    if(sv[1]) sv[1].textContent = usdAutoS(c.monPnl);
    if(sv[2]) sv[2].textContent = c.closed.toLocaleString('en-US');
    var tb = m.querySelector('tbody');
    if(tb && c.fills && c.fills.length){
      tb.innerHTML = c.fills.map(function(f){
        var p = n(f.closedPnl);
        return '<tr><td class="num">'+hhmm(n(f.time))+'</td>'
             + '<td>'+f.coin+' '+dirText(f.dir)+'</td>'
             + '<td class="num">'+usd(n(f.px)*n(f.sz))+'</td>'
             + '<td class="num '+(p>=0?'pos':'neg')+'">'+usdS(p)+'</td>'
             + '<td class="hash"><a href="'+EX+'/tx/'+f.hash+'" target="_blank" '
             + 'rel="noopener noreferrer">'+f.hash.slice(0,10)+'…'+f.hash.slice(-4)+'</a></td></tr>';
      }).join('');
    }
  });

  /* ---------- 启动：先用缓存秒出，再后台刷新 ---------- */
  function boot(){
    if(!document.querySelector('[data-f="vaults"]')) return;   // 只有首页有这块
    try{
      var raw = localStorage.getItem(CACHE);
      if(raw){
        var c = JSON.parse(raw);
        if(Date.now() - c.at < TTL && c.list && c.list.length){ render(c.list); return; }
      }
    }catch(e){}

    screen().then(function(list){
      if(list.length < MIN_OK) return;          // 过关太少就保留页面内置内容，不渲染半张榜
      render(list);
      try{ localStorage.setItem(CACHE, JSON.stringify({ at:Date.now(), list:list })); }catch(e){}
    }).catch(function(e){ if(window.__SMDEBUG) console.error('SM-FAIL', e && e.message, e && e.stack); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
