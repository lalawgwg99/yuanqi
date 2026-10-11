const HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>怨氣發電廠 v0.1</title>
<style>
  :root { --bg: #fff; --fg: #000; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    background: var(--bg);
    color: var(--fg);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace;
    max-width: 480px;
    margin: 0 auto;
    padding: 12px;
    font-size: 15px;
    line-height: 1.6;
  }
  body.angel { --bg: #000; --fg: #fff; }
  hr { border: 0; border-top: 2px solid var(--fg); margin: 12px 0; }
  .top { display: flex; justify-content: space-between; font-weight: bold; }
  /* ---- meter ---- */
  .meter-row { display: flex; align-items: baseline; gap: 12px; margin: 8px 0; }
  .meter-num { font-size: 64px; font-weight: bold; line-height: 1; }
  .meter-label { font-size: 12px; }
  /* ---- blob ---- */
  .blob-wrap { display: flex; justify-content: center; padding: 24px 0 8px; min-height: 220px; align-items: center; }
  .demon {
    color: var(--fg);
    animation: jitter 0.9s steps(2) infinite;
  }
  .demon .halo { display: none; }
  body.angel .demon .halo { display: block; }
  body.angel .demon .horns { display: none; }
  .demon.rage { color: #d00; animation-duration: 0.45s; }
  .demon .spikes { display: none; }
  .demon.rage .spikes { display: block; }
  .demon.twin { display: none; margin-left: -24px; }
  #hpbar { display: flex; gap: 2px; margin: 6px 0 2px; }
  #hpbar span { flex: 1; height: 14px; border: 2px solid var(--fg); }
  #hpbar span.fill { background: var(--fg); }
  @keyframes jitter {
    0%   { transform: translate(0,0) rotate(0deg); border-radius: 58% 42% 55% 45% / 48% 55% 45% 52%; }
    50%  { transform: translate(3px,-2px) rotate(1.5deg); border-radius: 45% 55% 42% 58% / 55% 45% 58% 42%; }
    100% { transform: translate(-2px,2px) rotate(-1deg); border-radius: 52% 48% 60% 40% / 42% 58% 45% 55%; }
  }
  .headline { text-align: center; font-size: 22px; font-weight: bold; margin: 4px 0 8px; }
  /* ---- vent ---- */
  textarea {
    width: 100%; min-height: 90px;
    border: 2px solid var(--fg);
    background: var(--bg); color: var(--fg);
    font: inherit; padding: 8px; resize: vertical;
  }
  .btn-big {
    display: block; width: 100%;
    background: var(--fg); color: var(--bg);
    border: 2px solid var(--fg);
    font: inherit; font-weight: bold; font-size: 18px;
    padding: 12px; cursor: pointer;
  }
  .btn-big:active { background: var(--bg); color: var(--fg); }
  .btn-big:disabled { background: var(--bg); color: var(--fg); border-style: dashed; cursor: wait; }
  .hint { font-size: 12px; margin-top: 4px; }
  /* ---- plaza ---- */
  .card { border: 2px solid var(--fg); padding: 8px; margin: 8px 0; }
  .card .meta { font-size: 12px; }
  .btn-hug {
    border: 2px solid var(--fg); background: var(--bg); color: var(--fg);
    font: inherit; padding: 4px 12px; cursor: pointer;
  }
  .btn-hug:active { background: var(--fg); color: var(--bg); }
  .hug-count { font-weight: bold; }
  .stamp {
    position: fixed; left: 50%; top: 42%; z-index: 90;
    transform: translate(-50%, -50%) rotate(-12deg);
    font-size: 72px; font-weight: bold; letter-spacing: 8px;
    border: 8px solid var(--fg); padding: 4px 24px;
    background: var(--bg); color: var(--fg); pointer-events: none;
    animation: stamp-in .22s steps(2);
  }
  @keyframes stamp-in { from { transform: translate(-50%,-50%) rotate(-12deg) scale(2.4); } to { transform: translate(-50%,-50%) rotate(-12deg) scale(1); } }
  @media (prefers-reduced-motion: reduce) { .stamp { animation: none; } }
  .demon-say { color: #d00; font-weight: bold; }
  /* ---- 酒瓶 ---- */
  .bottle-fly { position: fixed; z-index: 97; color: var(--fg); pointer-events: none; }
  .shard { position: fixed; z-index: 97; width: 10px; height: 10px; background: var(--fg); pointer-events: none; }
  #blob.hit { animation: hit .45s steps(3); }
  @keyframes hit { 25%{transform:translateX(-10px) rotate(-6deg)} 50%{transform:translateX(6px) rotate(4deg) scaleY(.94)} 75%{transform:translateX(-4px)} }
  @media (prefers-reduced-motion: reduce) { #blob.hit { animation: none; } }
  /* ---- LV.5/6 ---- */
  .demon .thirdeye, .demon .crown { display: none; }
  body[data-lv="5"] .demon .thirdeye, body[data-lv="6"] .demon .thirdeye { display: block; }
  body[data-lv="6"] .demon .crown { display: block; }
  body[data-lv="6"] .demon .horns { display: none; }
  body.rage5 .drop { background: #d00; }
  /* ---- vent buttons ---- */
  .vent-btns { display: flex; gap: 8px; margin-top: 8px; }
  .vent-btns .btn-big { width: auto; margin: 0; }
  #dump { flex: 1; }
  #voice-btn { flex: 0 0 auto; font-size: 15px; padding: 12px 16px; }
  #voice-panel { margin-top: 8px; }
  #voice-panel .btn-mini { margin-right: 8px; }
  .flash { background: var(--fg); color: var(--bg); }
  /* ---- top bar ---- */
  .top { align-items: center; flex-wrap: wrap; gap: 8px; }
  .top-right { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .btn-mini {
    border: 2px solid var(--fg); background: var(--bg); color: var(--fg);
    font: inherit; font-size: 12px; padding: 3px 8px; cursor: pointer;
  }
  .btn-mini:active, .btn-mini.on { background: var(--fg); color: var(--bg); }
  #nick-line { margin-top: 6px; }
  #nick { font-weight: bold; }
  /* ---- overlays ---- */
  .layer { position: fixed; inset: 0; z-index: 96; display: flex; align-items: center; justify-content: center; pointer-events: none; padding: 16px; }
  .layer .box {
    pointer-events: auto; background: var(--bg); color: var(--fg);
    border: 4px solid var(--fg); padding: 16px; max-width: 92vw; max-height: 72vh; overflow: auto;
  }
  .layer .box .btn-mini { margin-top: 10px; margin-right: 8px; }
  .burst {
    position: fixed; left: 50%; top: 36%; z-index: 95; pointer-events: none;
    transform: translate(-50%,-50%) rotate(-6deg);
    font-size: 52px; font-weight: bold; white-space: nowrap;
  }
  body.shake { animation: bshake .45s steps(4); }
  @keyframes bshake { 25%{transform:translate(-7px,4px)} 50%{transform:translate(6px,-5px)} 75%{transform:translate(-5px,-4px)} }
  #blob { cursor: pointer; }
  #blob.pounce { animation: pounce .7s steps(3); }
  @keyframes pounce { 0%{transform:scale(1)} 35%{transform:scale(2.6)} 70%{transform:scale(2.6) rotate(-4deg)} 100%{transform:scale(1)} }
  #blob.burp { animation: burp .6s steps(2); }
  @keyframes burp { 50%{transform:scaleY(1.28) scaleX(.9)} }
  #blob.glare { animation: glare .5s steps(3); }
  @keyframes glare { 25%{transform:translateX(-9px)} 75%{transform:translateX(9px)} }
  #blob.shy { animation: shy .8s steps(2); }
  @keyframes shy { 50%{transform:scale(.9) rotate(4deg)} }
  .dan { pointer-events: auto; cursor: pointer; }
  .card .tbody { cursor: pointer; }
  .btn-boost {
    border: 2px solid var(--fg); background: var(--bg); color: var(--fg);
    font: inherit; padding: 4px 12px; cursor: pointer;
  }
  .btn-boost:active { background: var(--fg); color: var(--bg); }
  .btn-boost:disabled { border-style: dashed; cursor: default; }
  .boost-count { font-weight: bold; }
  @media (prefers-reduced-motion: reduce) {
    #blob.pounce, #blob.burp, #blob.glare, #blob.shy, body.shake { animation: none; }
  }
  #danmaku { position: fixed; top: 0; left: 0; width: 100%; height: 42%; pointer-events: none; overflow: hidden; z-index: 60; }
  .dan {
    position: absolute; left: 0; white-space: nowrap;
    border: 2px solid var(--fg); background: var(--bg); color: var(--fg);
    font-size: 15px; padding: 3px 10px; will-change: transform;
    animation-name: fly; animation-timing-function: linear; animation-fill-mode: forwards;
  }
  @keyframes fly { from { transform: translateX(100vw); } to { transform: translateX(-130%); } }
  #king { border-width: 4px; }
  #fx { position: fixed; inset: 0; pointer-events: none; z-index: 40; overflow: hidden; }
  .drop { position: absolute; top: -20px; width: 2px; height: 14px; background: var(--fg); animation: fall linear infinite; }
  @keyframes fall { to { transform: translateY(112vh); } }
  #flash { position: fixed; inset: 0; background: var(--fg); opacity: 0; pointer-events: none; z-index: 55; }
  #fire { position: fixed; left: 0; right: 0; bottom: 0; text-align: center; pointer-events: none; z-index: -1; line-height: 1; }
  .flame { display: inline-block; color: var(--fg); animation: flick 0.4s steps(2) infinite; margin: 0 2px; }
  @keyframes flick { 0% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } 100% { transform: scaleY(0.7); } }
  .spider { position: fixed; color: var(--fg); pointer-events: none; z-index: 46; }
  footer { font-size: 12px; }
  footer .hotline { font-weight: bold; font-size: 14px; }
  @media (prefers-reduced-motion: reduce) {
    #blob { animation: none; }
    #danmaku { display: none; }
    #fx, #flash, #fire, .spider { display: none; }
  }
</style>
</head>
<body>

<div class="top"><span id="site-title">怨氣發電廠</span><span class="top-right"><span id="lang-sw"><button class="btn-mini" data-lang="zh-TW">中文</button><button class="btn-mini" data-lang="en">EN</button><button class="btn-mini" data-lang="ja">日本語</button><button class="btn-mini" data-lang="ko">한국어</button></span><button class="btn-mini" id="sponsor-btn">贊助</button></span></div>
<div class="hint" id="nick-line"><span id="you-are">你是</span> <b id="nick"></b> <button class="btn-mini" id="reroll">換一個</button></div>
<hr>

<div id="danmaku" aria-hidden="true"></div>
<div id="fx" aria-hidden="true"></div>
<div id="flash" aria-hidden="true"></div>
<div id="fire" aria-hidden="true"></div>
<div class="layer" id="full-layer" style="display:none"><div class="box"><div id="full-text" style="white-space:pre-wrap"></div><br><button class="btn-mini" id="full-close">關閉</button></div></div>
<div class="layer" id="sponsor-layer" style="display:none"><div class="box"><div style="font-weight:bold;font-size:18px" id="sponsor-title">贊助</div><div id="sponsor-body" style="margin:8px 0"></div><button class="btn-mini" id="sponsor-go">帶我去捐錢 →</button><button class="btn-mini" id="sponsor-close">關閉</button><div class="hint" id="sponsor-note"></div></div></div>
<div class="burst" id="burst" style="display:none"></div>
<div class="hint" id="rm-hint" style="display:none"></div>
<div class="meter-row">
  <div class="meter-num" id="num">62</div>
  <div class="meter-label"><span id="meter-label">怨氣值</span> · <span id="state-txt">惡魔</span></div>
</div>
<div id="hpbar" aria-hidden="true"></div>
<div class="hint" id="stage-hint">LV.2 惡魔 · 70 點進化血魔</div>

<hr>

<div class="blob-wrap">
<svg id="blob" class="demon" viewBox="0 0 200 200" role="img" aria-label="潦草惡魔">
  <ellipse class="halo" cx="100" cy="20" rx="34" ry="10" fill="none" stroke="currentColor" stroke-width="6"/>
  <g class="horns" fill="currentColor">
    <path d="M58,52 L36,12 L78,36 Z"/>
    <path d="M142,52 L164,12 L122,36 Z"/>
  </g>
  <path d="M100,34 C142,32 170,64 172,108 C174,152 146,184 100,186 C54,184 26,152 28,108 C30,64 58,36 100,34 Z"
        fill="none" stroke="currentColor" stroke-width="5"/>
  <path d="M102,38 C140,36 166,66 168,110 C170,150 144,180 100,182 C58,180 30,150 32,110 C34,68 62,40 102,38 Z"
        fill="none" stroke="currentColor" stroke-width="3"/>
  <path d="M52,86 L88,98" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
  <path d="M148,86 L112,98" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
  <circle cx="72" cy="112" r="7" fill="currentColor"/>
  <circle cx="128" cy="112" r="7" fill="currentColor"/>
  <path d="M68,140 L82,132 L94,146 L108,132 L120,146 L132,136 L130,160 L70,160 Z" fill="currentColor"/>
  <g class="spikes" fill="currentColor">
    <path d="M32,108 L12,100 L30,122 Z"/>
    <path d="M168,108 L188,100 L170,122 Z"/>
    <path d="M100,184 L90,200 L110,198 Z"/>
  </g>
  <path d="M28,60 l-14,-8 M172,64 l14,-8 M20,122 l-12,4 M180,122 l12,4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  <g class="thirdeye">
    <circle cx="100" cy="62" r="10" fill="none" stroke="currentColor" stroke-width="4"/>
    <circle cx="100" cy="62" r="3.5" fill="currentColor"/>
  </g>
  <g class="crown">
    <path d="M68,36 L76,8 L88,28 L100,4 L112,28 L124,8 L132,36 Z" fill="none" stroke="currentColor" stroke-width="4"/>
  </g>
</svg>
</div>
<div class="headline" id="headline"></div>

<hr>

<textarea id="vent" placeholder="把今天最幹的事罵出來吧…（罵事不罵人／強度惡魔判定）"></textarea>
<div class="vent-btns"><button class="btn-big" id="dump">投入深淵</button><button class="btn-big" id="voice-btn">語音</button></div>
<div class="hint" id="dump-hint"></div>
<div class="hint" id="share-slot"></div>

<hr>

<div class="card" id="king" style="display:none"></div>
<div class="hint" id="reject-line" style="display:none"></div>
<div id="plaza"></div>

<div class="card" id="weather-card" style="display:none"></div>

<hr>
<footer>
  <div class="hotline" id="foot-hot">安心專線 1925（24h）· 生命線 1995</div>
  <div id="foot-line2">你的怨氣，是我的電力。惡魔只吃怨氣，不吃人命。</div>
  <div id="foot-privacy">無登入・無追蹤・暱稱只存在你的瀏覽器・本站沒有資料庫</div>
</footer>

<script>
(function(){
  var lowEnd = (navigator.deviceMemory || 8) <= 3;
  var yuanqi = 62;
  var num = document.getElementById('num'),
      blob = document.getElementById('blob'),
      headline = document.getElementById('headline'),
      stateTxt = document.getElementById('state-txt');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { document.getElementById('rm-hint').style.display = 'block'; }

  /* ---- i18n ---- */
  var LANG = localStorage.getItem('yq-lang') || (function(){
    var bl = (navigator.language || 'zh-TW').toLowerCase();
    return bl.indexOf('ja') === 0 ? 'ja' : (bl.indexOf('ko') === 0 ? 'ko' : (bl.indexOf('en') === 0 ? 'en' : 'zh-TW'));
  })();
  var T = {
  'zh-TW': {
    title: '怨氣發電廠', meter: '怨氣值', ventPh: '把今天最幹的事罵出來吧…（罵事不罵人／強度惡魔判定）',
    dump: '投入深淵', empty: '先罵點什麼再投。', tasting: '惡魔正在品嚐你的怨氣…',
    hug: '抱抱', boost: '推一把', youAre: '你是', reroll: '換一個',
    rmHint: '※ 偵測到你的裝置開了「減少動態效果」，彈幕和特效被系統關掉了。去設定關掉就能看。',
    rejected: '今日退件：', rejectUnit: ' 件正能量', stamp: '退件',
    scoreLine: function(s){ return ['本魔判定：怨氣 ' + s + '/100。', '（+' + s + '）']; },
    redline: '……咳。惡魔只吃怨氣，不吃人命。這題我不接——1925 有人 24 小時聽你說。',
    sponsor: '贊助', sponsorTitle: '贊助',
    sponsorBody: '怨氣發電廠不收你的錢——惡魔只吃怨氣，不吃新台幣。但如果你罵完覺得胸口鬆了一點，考慮把一杯飲料的錢，分給還在等家的小動物。下面的按鈕會隨機帶你去一個台灣的流浪動物之家，他們比惡魔更需要你的善意。',
    sponsorGo: '帶我去捐錢 →', close: '關閉',
    sponsorNote: '本站不經手任何款項，捐款直接在各單位網站完成。',
    footHot: '安心專線 1925（24h）· 生命線 1995',
    footLine2: '你的怨氣，是我的電力。惡魔只吃怨氣，不吃人命。',
    footPrivacy: '無登入・無追蹤・暱稱只存在你的瀏覽器・本站沒有資料庫',
    boosted: '已經推過了', thinking: '惡魔正在想怎麼嘴你…', praising: '惡魔正在記下這把火…',
    report: '檢舉', reported: '已檢舉', voice: '語音', voiceAsk: '等一下，正在跟瀏覽器要麥克風權限…', voiceNA: '這台裝置不支援錄音。',
    voiceRec: function(s){ return '錄音中 ' + s + 's…再點停止'; }, voiceListen: '試聽', voiceSend: '送出語音',
    voiceUploading: '上傳中…', voiceFx: '變聲處理中…', playVoice: '播放', voiceTag: '（語音留言）',
    share: '分享', shareCard: '生成分享卡',
    weatherLine: function(w){ return '昨日氣象：' + w.vents + ' 則／怨氣 +' + w.total + '／退件 ' + w.rejects + '／最高 ' + w.peak; },
    stages: ['天使', '怨靈', '惡魔', '血魔', '雙子魔王', '三目魔君', '混沌帝君'],
    stageLines: ['今晚，天使在人間。', '嘶……有怨氣的味道。', '今晚，牠在聽。', '朕還沒吃飽，再罵啊。', '哈哈哈哈！我們來了！', '三隻眼，全都盯著你罵。', '朕即混沌。跪下。'],
    evo: ' 點進化', maxed: ' · 已是完全體', angelWake: '（惡魔甦醒）',
    kingLine: function(n, s, x){ return '■ 今日怨氣王：' + n + '（怨氣 ' + s + '/100）<br>「' + x + '」'; }
  },
  'en': {
    title: 'Resentment Power Plant', meter: 'RESENTMENT', ventPh: "Dump today's bullshit here… (roast the situation, not people / the demon judges)",
    dump: 'FEED THE ABYSS', empty: 'Vent something first.', tasting: 'The demon is tasting your resentment…',
    hug: 'Hug', boost: 'Boost', youAre: 'You are', reroll: 'reroll',
    rmHint: '※ Your device has "Reduce Motion" on — danmaku and effects are disabled by the system. Turn it off in settings to see them.',
    rejected: 'Rejected today: ', rejectUnit: ' positivity posts', stamp: 'REJECTED',
    scoreLine: function(s){ return ['Demon verdict: resentment ' + s + '/100. ', ' (+' + s + ')']; },
    redline: '……cough. The demon eats resentment, not lives. I can\\'t take this one — please contact a local crisis helpline right now.',
    sponsor: 'Donate', sponsorTitle: 'Donate',
    sponsorBody: 'The Resentment Power Plant takes none of your money — the demon eats resentment, not cash. But if venting loosened the knot in your chest, consider giving the price of one drink to a stray animal waiting for a home. The button below takes you to a random stray-animal shelter. They need your kindness more than the demon does.',
    sponsorGo: 'Take me to donate →', close: 'Close',
    sponsorNote: 'This site handles no money. Donations happen directly on each organization\\'s website.',
    footHot: 'In crisis? Please contact your local crisis helpline.',
    footLine2: 'Your resentment is my electricity. The demon eats resentment, not lives.',
    footPrivacy: 'No login・No tracking・Nickname lives only in your browser・This site has no database',
    boosted: 'Already boosted', thinking: 'The demon is thinking up a roast…', praising: 'The demon notes this fire…',
    report: 'Report', reported: 'Reported', voice: 'Voice', voiceAsk: 'Hold on, asking the browser for mic permission…', voiceNA: 'This device does not support recording.',
    voiceRec: function(s){ return 'Recording ' + s + 's… tap to stop'; }, voiceListen: 'Preview', voiceSend: 'Send voice',
    voiceUploading: 'Uploading…', voiceFx: 'Pitch-shifting…', playVoice: 'Play', voiceTag: '(voice message)',
    share: 'Share', shareCard: 'Make share card',
    weatherLine: function(w){ return 'Yesterday: ' + w.vents + ' vents / +' + w.total + ' resentment / ' + w.rejects + ' rejected / peak ' + w.peak; },
    stages: ['Angel', 'Wraith', 'Demon', 'Blood Demon', 'Twin Demon Lords', 'Three-Eyed Demon Lord', 'Primal Chaos Emperor'],
    stageLines: ['Tonight, the angel walks among us.', 'Sss… smells like resentment.', 'Tonight, it listens.', 'Not full yet. Curse more.', 'Hahaha! We have arrived!', 'Three eyes. All watching you curse.', 'I AM chaos. Kneel.'],
    evo: ' pts to evolve', maxed: ' · FINAL FORM', angelWake: ' (demon awakening)',
    kingLine: function(n, s, x){ return '■ Today\\'s Resentment Royalty: ' + n + ' (resentment ' + s + '/100)<br>"' + x + '"'; }
  },
  'ja': {
    title: '怨気発電所', meter: '怨気値', ventPh: '今日のムカつきをぶちまけろ…（人を罵るな、事を罵れ／強さは悪魔が判定）',
    dump: '深淵に投入', empty: 'まず何か文句を書け。', tasting: '悪魔が怨気を味見中…',
    hug: 'ハグ', boost: '応援', youAre: 'あなたは', reroll: '変更',
    rmHint: '※ 端末の「モーションを減らす」がオン — 弾幕とエフェクトは無効化されています。設定でオフにすると見られます。',
    rejected: '今日の却下：', rejectUnit: ' 件のポジティブ', stamp: '却下',
    scoreLine: function(s){ return ['悪魔判定：怨気 ' + s + '/100。', '（+' + s + '）']; },
    redline: '……コホン。悪魔は怨気を食うが、命は食わない。この件はパスだ — つらい時は最寄りの相談窓口に連絡してくれ。',
    sponsor: '寄付', sponsorTitle: '寄付',
    sponsorBody: '怨気発電所は金を取らない — 悪魔は怨気を食い、現金は食わない。でも愚痴って胸が少し軽くなったなら、飲み物一杯分を、家を待つ野良動物に分けてやってくれ。下のボタンで台湾の動物保護団体のいずれかにランダムで飛ぶ。悪魔より彼らの方が君の優しさを必要としている。',
    sponsorGo: '寄付しに行く →', close: '閉じる',
    sponsorNote: '当サイトは金銭を扱いません。寄付は各団体のサイトで直接行われます。',
    footHot: 'つらい時は、最寄りの相談窓口に連絡してください。',
    footLine2: 'お前の怨気は俺の電力だ。悪魔は怨気を食うが、命は食わない。',
    footPrivacy: 'ログイン不要・追跡なし・ニックネームはあなたのブラウザにのみ保存・DBなし',
    boosted: '応援済み', thinking: '悪魔がツッコミを考え中…', praising: '悪魔がこの火を記録中…',
    report: '通報', reported: '通報済み', voice: '音声', voiceAsk: 'ちょっと待って、ブラウザにマイク許可を求めています…', voiceNA: 'この端末は録音に対応していません。',
    voiceRec: function(s){ return '録音中 ' + s + '秒…タップで停止'; }, voiceListen: '試聴', voiceSend: '音声を送る',
    voiceUploading: '送信中…', voiceFx: '変声処理中…', playVoice: '再生', voiceTag: '（音声メッセージ）',
    share: '共有', shareCard: '共有カード作成',
    weatherLine: function(w){ return '昨日の気象：' + w.vents + ' 件／怨気 +' + w.total + '／却下 ' + w.rejects + '／最高 ' + w.peak; },
    stages: ['天使', '怨霊', '悪魔', '血魔', '双子魔王', '三つ目魔君', '混沌帝君'],
    stageLines: ['今夜、天使が舞い降りた。', 'シーッ……怨気の匂い。', '今夜、奴は聞いている。', 'まだ食い足りん。もっと罵れ。', 'ハハハハ！我らが来た！', '三つの目が、お前の罵りを見ている。', '我こそ混沌。ひれ伏せ。'],
    evo: 'ptで進化', maxed: ' · 完全体', angelWake: '（悪魔覚醒）',
    kingLine: function(n, s, x){ return '■ 今日の怨気王：' + n + '（怨気 ' + s + '/100）<br>「' + x + '」'; }
  },
  'ko': {
    title: '울분발전소', meter: '울분 수치', ventPh: '오늘의 짜증을 쏟아내라…（사람 말고 일을 욕해／강도는 악마가 판정）',
    dump: '심연에 투입', empty: '일단 뭔가 써라.', tasting: '악마가 울분을 맛보는 중…',
    hug: '허그', boost: '응원', youAre: '당신은', reroll: '변경',
    rmHint: '※ 기기의 "동작 줄이기"가 켜져 있음 — 자막과 효과가 비활성화되었습니다. 설정에서 끄면 볼 수 있어.',
    rejected: '오늘의 반려: ', rejectUnit: ' 건의 긍정', stamp: '반려',
    scoreLine: function(s){ return ['악마 판정: 울분 ' + s + '/100. ', ' (+' + s + ')']; },
    redline: '……콜록. 악마는 울분은 먹어도 목숨은 안 먹어. 이건 패스 — 힘들면 가까운 상담 창구에 연락해.',
    sponsor: '후원', sponsorTitle: '후원',
    sponsorBody: '울분발전소는 돈을 받지 않아 — 악마는 울분을 먹지 현금은 안 먹어. 하지만 욕하고 가슴이 좀 가벼워졌다면, 음료 한 잔 값을 집을 기다리는 유기동물에게 나눠줘. 아래 버튼을 누르면 대만의 유기동물 보호단체 중 한 곳으로 랜덤 이동해. 악마보다 걔네가 네 친절을 더 필요로 해.',
    sponsorGo: '후원하러 가기 →', close: '닫기',
    sponsorNote: '이 사이트는 돈을 다루지 않아. 후원은 각 단체 사이트에서 직접 이루어져.',
    footHot: '힘들면 가까운 상담 창구에 연락하세요.',
    footLine2: '네 울분은 나의 전기다. 악마는 울분은 먹어도 목숨은 안 먹어.',
    footPrivacy: '로그인 없음・추적 없음・닉네임은 브라우저에만 저장・DB 없음',
    boosted: '이미 응원함', thinking: '악마가 독설 생각 중…', praising: '악마가 이 불을 기록 중…',
    report: '신고', reported: '신고됨', voice: '음성', voiceAsk: '잠깐, 브라우저에 마이크 권한 요청 중…', voiceNA: '이 기기는 녹음을 지원하지 않아.',
    voiceRec: function(s){ return '녹음 중 ' + s + '초…탭하여 정지'; }, voiceListen: '미리듣기', voiceSend: '음성 보내기',
    voiceUploading: '업로드 중…', voiceFx: '변조 처리 중…', playVoice: '재생', voiceTag: '(음성 메시지)',
    share: '공유', shareCard: '공유 카드 만들기',
    weatherLine: function(w){ return '어제 기상: ' + w.vents + ' 건／울분 +' + w.total + '／반려 ' + w.rejects + '／최고 ' + w.peak; },
    stages: ['천사', '원령', '악마', '혈마', '쌍둥이 마왕', '삼목마군', '혼돈제군'],
    stageLines: ['오늘 밤, 천사가 강림했다.', '쉬잇……울분 냄새.', '오늘 밤, 놈이 듣고 있다.', '아직 배고파. 더 욕해.', '하하하! 우리가 왔다!', '세 개의 눈이 네 욕을 지켜본다.', '짐이 곧 혼돈이다. 꿇어라.'],
    evo: 'pt에 진화', maxed: ' · 완전체', angelWake: '（악마 각성）',
    kingLine: function(n, s, x){ return '■ 오늘의 울분왕: ' + n + '（울분 ' + s + '/100）<br>"' + x + '"'; }
  }
  };
  function t(k){ return T[LANG][k]; }
  function applyLang(){
    document.documentElement.lang = LANG === 'zh-TW' ? 'zh-TW' : LANG;
    document.title = t('title') + ' v0.1';
    var $ = function(id){ return document.getElementById(id); };
    $('site-title').textContent = t('title');
    $('sponsor-btn').textContent = t('sponsor');
    $('meter-label').textContent = t('meter');
    $('vent').placeholder = t('ventPh');
    $('dump').textContent = t('dump');
    $('voice-btn').textContent = t('voice');
    $('you-are').textContent = t('youAre');
    $('reroll').textContent = t('reroll');
    $('rm-hint').textContent = t('rmHint');
    $('sponsor-title').textContent = t('sponsorTitle');
    $('sponsor-body').textContent = t('sponsorBody');
    $('sponsor-go').textContent = t('sponsorGo');
    $('sponsor-close').textContent = t('close');
    $('sponsor-note').textContent = t('sponsorNote');
    $('full-close').textContent = t('close');
    $('foot-hot').textContent = t('footHot');
    $('foot-line2').textContent = t('footLine2');
    $('foot-privacy').textContent = t('footPrivacy');
    if (weatherCache) renderWeather();
    var sw = document.querySelectorAll('#lang-sw button');
    for (var i = 0; i < sw.length; i++) sw[i].classList.toggle('on', sw[i].getAttribute('data-lang') === LANG);
    renderPlaza();
    render();
  }

  /* ---- 匿名暱稱：只活在你的瀏覽器 ---- */
  var ADJ = ['tired','burnt','cold','dark','sore','dizzy','grumpy','sleepy','hungry','damp'];
  var ANM = ['owl','rice','noodle','cloud','frog','cat','panda','toad','eel','moth'];
  function genNick(){ return ADJ[Math.floor(Math.random() * ADJ.length)] + '_' + ANM[Math.floor(Math.random() * ANM.length)] + '_' + (100 + Math.floor(Math.random() * 900)); }
  var nick = localStorage.getItem('yq-nick');
  if (!nick) { nick = genNick(); try { localStorage.setItem('yq-nick', nick); } catch (e) {} }
  document.getElementById('nick').textContent = nick;
  document.getElementById('reroll').addEventListener('click', function(){
    nick = genNick();
    try { localStorage.setItem('yq-nick', nick); } catch (e) {}
    document.getElementById('nick').textContent = nick;
  });
  var stageHint = document.getElementById('stage-hint');
  var twin = blob.cloneNode(true);
  twin.removeAttribute('id');
  twin.classList.add('twin');
  blob.parentNode.appendChild(twin);
  var hpbar = document.getElementById('hpbar'), hpCells = [];
  for (var hi = 0; hi < 10; hi++) { var hcell = document.createElement('span'); hpbar.appendChild(hcell); hpCells.push(hcell); }

  function level(){ return yuanqi < 30 ? 0 : yuanqi < 50 ? 1 : yuanqi < 70 ? 2 : yuanqi < 90 ? 3 : yuanqi < 150 ? 4 : yuanqi < 400 ? 5 : 6; }
  var stageNames = ['天使', '怨靈', '惡魔', '血魔', '雙子魔王'];
  var stageLines = ['今晚，天使在人間。', '嘶……有怨氣的味道。', '今晚，牠在聽。', '朕還沒吃飽，再罵啊。', '哈哈哈哈！我們來了！'];
  var nextEvo = [30, 50, 70, 90, 150, 400, Infinity];

  function render(){
    yuanqi = Math.max(0, yuanqi);
    num.textContent = yuanqi;
    var lv = level();
    document.body.classList.toggle('angel', lv === 0);
    document.body.setAttribute('data-lv', lv);
    document.body.classList.toggle('rage5', lv >= 5);
    stateTxt.textContent = t('stages')[lv];
    var raging = lv >= 3;
    blob.classList.toggle('rage', raging);
    twin.classList.toggle('rage', raging);
    var size = Math.min(240, Math.round((90 + yuanqi * 1.2) * (lv === 1 ? 0.75 : 1)));
    blob.style.width = size + 'px';
    blob.style.height = size + 'px';
    var tsize = Math.round(size * 0.55);
    twin.style.width = tsize + 'px';
    twin.style.height = tsize + 'px';
    twin.style.display = lv >= 4 ? 'block' : 'none';
    headline.textContent = t('stageLines')[lv];
    var filled = Math.min(10, Math.round(yuanqi / 10));
    for (var ci = 0; ci < hpCells.length; ci++) { hpCells[ci].classList.toggle('fill', ci < filled); }
    stageHint.textContent = 'LV.' + lv + ' ' + t('stages')[lv] +
      (lv >= 6 ? t('maxed') : ' · ' + nextEvo[lv] + t('evo') + (lv === 0 ? t('angelWake') : ''));
    setFx(lv);
  }

  /* 天氣系統：惡魔的背景隨等級加碼 */
  var fxLayer = document.getElementById('fx');
  var rainDrops = [];
  function setRain(n){
    if (lowEnd) n = Math.ceil(n / 2);
    while (rainDrops.length > n) rainDrops.pop().remove();
    while (rainDrops.length < n) {
      var d = document.createElement('div');
      d.className = 'drop';
      d.style.left = (Math.random() * 100) + 'vw';
      d.style.animationDuration = (0.6 + Math.random() * 0.7) + 's';
      d.style.animationDelay = (Math.random() * 1) + 's';
      fxLayer.appendChild(d);
      rainDrops.push(d);
    }
  }
  var fireEl = document.getElementById('fire');
  function setFire(n){
    if (fireEl.children.length === n) return;
    fireEl.innerHTML = '';
    for (var i = 0; i < n; i++) {
      var f = document.createElement('span');
      f.className = 'flame';
      f.textContent = '▲';
      f.style.fontSize = (14 + Math.random() * 16) + 'px';
      f.style.animationDelay = (Math.random() * 0.4) + 's';
      fireEl.appendChild(f);
    }
  }
  var spiders = [];
  var spiderSVG = '<svg viewBox="0 0 30 30" width="26" height="26"><ellipse cx="15" cy="16" rx="6" ry="8" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9,10 L2,4 M9,14 L1,12 M9,18 L2,22 M9,22 L4,28"/><path d="M21,10 L28,4 M21,14 L29,12 M21,18 L28,22 M21,22 L26,28"/></g></svg>';
  function setSpiders(n){
    if (lowEnd) return;
    while (spiders.length > n) spiders.pop().el.remove();
    while (spiders.length < n) {
      var el = document.createElement('div');
      el.className = 'spider';
      el.innerHTML = spiderSVG;
      document.body.appendChild(el);
      spiders.push({ el: el, x: Math.random() * (window.innerWidth - 30), y: Math.random() * (window.innerHeight - 30),
                     vx: (Math.random() - 0.5) * 16, vy: (Math.random() - 0.5) * 16 });
    }
  }
  setInterval(function(){
    if (reduceMotion || document.hidden) return;
    for (var si = 0; si < spiders.length; si++) {
      var sp = spiders[si];
      sp.x += sp.vx; sp.y += sp.vy;
      if (sp.x < 0 || sp.x > window.innerWidth - 28) sp.vx *= -1;
      if (sp.y < 0 || sp.y > window.innerHeight - 28) sp.vy *= -1;
      sp.el.style.left = sp.x + 'px';
      sp.el.style.top = sp.y + 'px';
    }
  }, 140);
  var flashTimer = null;
  function scheduleFlash(){
    clearTimeout(flashTimer);
    if (reduceMotion || lowEnd || level() < 3) return;
    flashTimer = setTimeout(function(){
      var fl = document.getElementById('flash');
      fl.style.opacity = '0.85';
      setTimeout(function(){ fl.style.opacity = '0';
        setTimeout(function(){ fl.style.opacity = '0.6';
          setTimeout(function(){ fl.style.opacity = '0'; scheduleFlash(); }, 120);
        }, 90);
      }, 70);
    }, 4000 + Math.random() * 5000);
  }
  var curFxLv = -1;
  function setFx(lv){
    if (reduceMotion || lv === curFxLv) return;
    curFxLv = lv;
    setRain(lv === 0 ? 0 : (lv === 1 ? 8 : (lv === 2 ? 18 : (lv >= 5 ? 40 : 28))));
    setFire(lv >= 6 ? 24 : (lv >= 4 ? 16 : (lv >= 3 ? 10 : 0)));
    setSpiders(lv >= 6 ? 6 : (lv >= 4 ? 4 : 0));
    scheduleFlash();
  }

  /* 惡魔品嚐：AI 自動判定怨氣分數（厚黑學惡魔廠長） */
  var QUIPS = {
  'zh-TW': [
    function(s){ return '就這？你罵得不夠狠。'; },
    function(s){ return '品嚐完畢。嗯，有內味了，本魔收下了。'; },
    function(s){ return '對方這招厚黑學裡有寫，叫「拖刀計」——你輸在讀書少。'; },
    function(s){ return '罵得好，下次記得開大，本魔愛吃重的。'; }
  ],
  'en': [
    function(s){ return 'That\\'s it? Curse harder.'; },
    function(s){ return 'Tasted. Mm, flavorful. The demon accepts.'; },
    function(s){ return 'Your enemy pulled a textbook thick-black move: "delay and deflect". You lost for reading too little.'; },
    function(s){ return 'Well cursed. Go bigger next time — the demon likes it heavy.'; }
  ],
  'ja': [
    function(s){ return 'それだけ？もっと罵れ。'; },
    function(s){ return '味見完了。うむ、味がある。悪魔が受け取った。'; },
    function(s){ return '相手の手口は厚黒学の「引き延ばし計」だ。お前は勉強不足で負けたな。'; },
    function(s){ return 'いい罵りだ。次はもっと激しくいけ、悪魔は濃いのが好きだ。'; }
  ],
  'ko': [
    function(s){ return '그게 다야? 더 세게 욕해.'; },
    function(s){ return '시식 완료. 음, 맛이 있군. 악마가 접수했다.'; },
    function(s){ return '상대 수법은 후흑학의 "질질끌기 전법"이야. 넌 공부가 부족해서 진 거다.'; },
    function(s){ return '잘 욕했다. 다음엔 더 세게, 악마는 진한 걸 좋아해.'; }
  ]
  };
  function localTaste(text){
    var hits = (text.match(/[幹靠媽死爛煩氣怒操]/g) || []).length;
    var bangs = (text.match(/！|!/g) || []).length;
    var score = 42 + Math.min(27, hits * 9) + Math.min(12, bangs * 4) + (text.length > 60 ? 8 : 0);
    score = Math.max(40, Math.min(100, score));
    var qp = QUIPS[LANG] || QUIPS['zh-TW'];
    return { score: score, red: false, quip: qp[Math.floor(Math.random() * qp.length)](score) };
  }

  /* 真 AI：惡魔品嚐＋抱抱嘲諷，失敗自動降級回本地 */
  var AI_URL = 'https://ai.taicalc.com/api/ai';
  var RED_RE = /自殺|想死|死一死|結束一切|不想活|了結/;
  var PII_RE = /(09\\d{2}-?\\d{3}-?\\d{3}|[A-Z][12]\\d{8})/;
  var PII_MSG = {
    'zh-TW': '想貼個資？本魔不吃這套。',
    'en': 'Personal info? The demon doesn\\'t eat that.',
    'ja': '個人情報？悪魔は食わん。',
    'ko': '개인정보? 악마는 안 먹어.'
  };
  function aiTaste(text){
    if (RED_RE.test(text)) return Promise.resolve({ score: 0, red: true, quip: '' });
    var ctl = new AbortController();
    var timer = setTimeout(function(){ ctl.abort(); }, 20000);
    return fetch(AI_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'yuanqi-taste', payload: { text: text, lang: LANG } }),
      signal: ctl.signal
    }).then(function(r){
      clearTimeout(timer);
      if (!r.ok) throw 0;
      return r.json();
    }).then(function(j){
      var o = JSON.parse(j.text);
      if (!o || typeof o.score !== 'number') throw 0;
      if (o.quip === '__REDLINE__') return { score: 0, red: true, quip: '' };
      var q = String(o.quip || '');
      if ((LANG === 'ja' || LANG === 'ko') && !o.reject) {
        var qp = QUIPS[LANG] || QUIPS['zh-TW'];
        q = qp[Math.floor(Math.random() * qp.length)](0);
      }
      return { score: Math.max(0, Math.min(100, Math.round(o.score))), red: false, quip: q, reject: o.reject === true };
    }).catch(function(){ return localTaste(text); });
  }
  var TAUNTS = {
  'zh-TW': [
    '抱個屁啊，抱一下你老闆會加薪嗎？',
    '哎喲好溫馨喔——才怪。抱完了記得回去加班。',
    '這個抱抱本魔給 3 分，不能再多。',
    '安慰要是有用，還需要惡魔嗎？',
    '抱抱？你房東會因為這個降租嗎？',
    '行了行了，抱一下得了，別演偶像劇。'
  ],
  'en': [
    'Hug my ass. Will a hug get you a raise?',
    'Aww, how wholesome — NOT. Done hugging? Back to overtime.',
    'The demon rates this hug 3/10. Can\\'t go higher.',
    'If hugs worked, why would we need a demon?',
    'A hug? Will your landlord lower the rent for that?',
    'Alright, alright, one hug\\'s enough. Stop acting in a drama.'
  ],
  'ja': [
    'ハグだと？ハグで給料上がるのか？',
    'おお温かいね — なんて嘘だ。ハグ終わったら残業に戻れ。',
    'このハグ、悪魔的評価3点。これ以上はやれん。',
    'ハグで解決するなら悪魔はいらん。',
    'ハグ？それで家賃下がるのか？',
    'わかったわかった、一回で十分だ。ドラマの真似はやめろ。'
  ],
  'ko': [
    '허그는 개뿔. 허그한다고 월급 올라?',
    '어머 따뜻해라 — 거짓말이고. 허그 끝났으면 야근 복귀.',
    '이 허그, 악마적 평가 3점. 이상은 못 줘.',
    '허그로 해결되면 악마가 왜 필요해?',
    '허그? 그걸로 월세가 내려가?',
    '알았어 알았어, 한 번이면 됐어. 드라마 찍지 마.'
  ]
  };
  function aiTaunt(text){
    if (LANG === 'ja' || LANG === 'ko') {
      var tp0 = TAUNTS[LANG] || TAUNTS['zh-TW'];
      return Promise.resolve(tp0[Math.floor(Math.random() * tp0.length)]);
    }
    var ctl = new AbortController();
    var timer = setTimeout(function(){ ctl.abort(); }, 15000);
    return fetch(AI_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'yuanqi-taunt', payload: { text: text, lang: LANG } }),
      signal: ctl.signal
    }).then(function(r){
      clearTimeout(timer);
      if (!r.ok) throw 0;
      return r.json();
    }).then(function(j){
      var t = (j.text || '').trim().slice(0, 80);
      if (!t) throw 0;
      return t;
    }).catch(function(){ var tp = TAUNTS[LANG] || TAUNTS['zh-TW']; return tp[Math.floor(Math.random() * tp.length)]; });
  }
  var REJECTS = {
  'zh-TW': [
    '呸，甜的。本魔不吃糖。退件！正能量請左轉，慢走不送。',
    '0 怨氣？你走錯棚了。這裡是怨氣發電廠，感恩請去別家。',
    '你的正能量讓本魔掉血了。再貼這種，本魔要報警。',
    '退件！本廠只收怨氣，不收心靈雞湯。',
    '這麼開心你來這幹嘛？去跟你朋友說啊。滾——（愛的推擠）'
  ],
  'en': [
    'Pah, sweet. The demon doesn\\'t do sugar. REJECTED! Positivity to the left, no need to see you out.',
    'Zero resentment? Wrong venue. This is the Resentment Power Plant — take your gratitude elsewhere.',
    'Your positivity is damaging the demon. Post that again and I\\'m calling the cops.',
    'REJECTED! We take resentment here, not chicken soup for the soul.',
    'So happy? Go tell your friends. Scram — (with love)'
  ],
  'ja': [
    'ペッ、甘い。悪魔は砂糖を食わん。却下！ポジティブは左へ、見送りは不要だ。',
    '怨気ゼロ？場違いだ。ここは怨気発電所、感謝は他所でやってくれ。',
    'お前のポジティブで悪魔がダメージを受けた。もう一度貼ったら通報する。',
    '却下！うちは怨気しか受け付けん。自己啓発本は持ち帰れ。',
    'そんなに幸せなら友達に言え。失せろ — （愛を込めて）'
  ],
  'ko': [
    '퉤, 달아. 악마는 설탕 안 먹어. 반려! 긍정은 왼쪽으로, 배웅은 됐어.',
    '울분 제로? 여긴 울분발전소야. 감사는 다른 데서 해.',
    '네 긍정 때문에 악마가 데미지를 입었다. 한 번 더 올리면 신고한다.',
    '반려! 여긴 울분만 받아. 힐링 책은 가져가.',
    '그렇게 행복하면 친구한테 가서 말해. 꺼져 — （사랑을 담아서）'
  ]
  };
  var rejected = 0;
  function showRejectStamp(){
    var s = document.createElement('div');
    s.className = 'stamp';
    s.textContent = t('stamp');
    document.body.appendChild(s);
    setTimeout(function(){ s.remove(); }, 2500);
  }
  /* 酒瓶砸惡魔：投擲 → 命中碎裂 → 惡魔被砸歪 */
  var BOTTLE_SVG = '<svg viewBox="0 0 30 82" width="34" height="92"><path d="M11,2 L11,18 L5,32 L5,80 L25,80 L25,32 L19,18 L19,2 Z" style="fill:var(--bg)" stroke="currentColor" stroke-width="3"/><path d="M8,46 L22,46 M8,60 L22,60" stroke="currentColor" stroke-width="2"/></svg>';
  function throwBottle(done){
    var b = document.createElement('div');
    b.className = 'bottle-fly';
    b.innerHTML = BOTTLE_SVG;
    document.body.appendChild(b);
    var vr = vent.getBoundingClientRect(), br = blob.getBoundingClientRect();
    var x0 = vr.left + vr.width / 2, y0 = vr.top + 20;
    var x1 = br.left + br.width / 2, y1 = br.top + br.height / 2;
    var steps = 10, i = 0;
    var iv = setInterval(function(){
      i++;
      var p = i / steps;
      var x = x0 + (x1 - x0) * p;
      var y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 60;
      b.style.left = x + 'px';
      b.style.top = y + 'px';
      b.style.transform = 'translate(-50%,-50%) rotate(' + Math.round(p * 300) + 'deg)';
      if (i >= steps) { clearInterval(iv); smashBottle(b, x1, y1, done); }
    }, 60);
  }
  function smashBottle(b, x, y, done){
    b.remove();
    var burstEl = document.getElementById('burst');
    burstEl.textContent = '鏘！';
    burstEl.style.display = 'block';
    for (var k = 0; k < 4; k++) {
      (function(dx){
        var sh = document.createElement('div');
        sh.className = 'shard';
        sh.style.left = x + 'px';
        sh.style.top = y + 'px';
        document.body.appendChild(sh);
        var n = 0;
        var iv2 = setInterval(function(){
          n++;
          sh.style.transform = 'translate(' + (dx * n) + 'px,' + (n * 14) + 'px) rotate(' + (n * 40) + 'deg)';
          if (n > 6) { clearInterval(iv2); sh.remove(); }
        }, 70);
      })((k - 1.5) * 14);
    }
    blob.classList.add('hit');
    setTimeout(function(){
      burstEl.style.display = 'none';
      blob.classList.remove('hit');
      done();
    }, 550);
  }

  /* 惡魔開口：一律紅字 */
  function demonSay(el, pre, quip, suf){
    el.innerHTML = '';
    el.appendChild(document.createTextNode(pre));
    var sp = document.createElement('span');
    sp.className = 'demon-say';
    sp.textContent = quip;
    el.appendChild(sp);
    el.appendChild(document.createTextNode(suf || ''));
  }

  /* 推一把：惡魔的誇獎池 */
  var PRAISE = {
  'zh-TW': [
    '好！罵得好！本魔給你加雞腿！',
    '有種！再罵狠一點，本魔愛看！',
    '推得好！他的怨氣就是我的晚餐！',
    '漂亮！這把火本魔記下了！'
  ],
  'en': [
    'Yes! Well cursed! The demon owes you a drumstick!',
    'Gutsy! Curse harder, the demon loves a show!',
    'Well boosted! His resentment is my dinner!',
    'Beautiful! The demon notes this fire!'
  ],
  'ja': [
    'よし！いい罵りだ！悪魔から骨付き肉を進呈！',
    '度胸あるな！もっと罵れ、悪魔は見世物が好きだ！',
    'いい応援だ！奴の怨気は俺の晩飯だ！',
    '見事！この火は悪魔が覚えたぞ！'
  ],
  'ko': [
    '좋아! 잘 욕했다! 악마가 치킨을 하사한다!',
    '배짱 있군! 더 세게 욕해, 악마는 구경을 좋아해!',
    '잘 밀어줬다! 놈의 울분은 내 저녁이야!',
    '훌륭해! 이 불은 악마가 기록했다!'
  ]
  };

  /* 點惡魔：四種反應 */
  var demonActs = [
    { cls: 'pounce', shake: true,
      burst: { 'zh-TW': '嗷嗚——！！', 'en': 'GRRRR——！！', 'ja': 'ガオーー！！', 'ko': '으르렁——！！' },
      line: { 'zh-TW': '看什麼看！有怨氣就投，沒怨氣就滾去投！', 'en': 'What are you staring at! Got resentment? Dump it!', 'ja': '何見てんだ！怨気があるなら投げろ！', 'ko': '뭘 봐! 울분 있으면 쏟아!' } },
    { cls: 'burp', shake: false,
      burst: { 'zh-TW': '嗝——', 'en': 'BURP——', 'ja': 'ゲプー', 'ko': '꺼억——' },
      line: { 'zh-TW': '吃太多了…你投的怨氣有點撐。', 'en': 'Ate too much… your resentment is filling.', 'ja': '食いすぎた…お前の怨気が効いてる。', 'ko': '너무 먹었어… 네 울분이 든든하군.' } },
    { cls: 'glare', shake: false,
      burst: { 'zh-TW': '哼。', 'en': 'Hmph.', 'ja': 'フン。', 'ko': '흥.' },
      line: { 'zh-TW': '點我幹嘛？本魔很忙，忙著吃。', 'en': 'Why poke me? The demon is busy. Busy eating.', 'ja': '何だ？悪魔は忙しい。食うのに忙しい。', 'ko': '왜 찔러? 악마는 바빠. 먹는다고 바빠.' } },
    { cls: 'shy', shake: false,
      burst: { 'zh-TW': '哎呀…', 'en': 'Oh my…', 'ja': 'あっ…', 'ko': '어머…' },
      line: { 'zh-TW': '別點啦…人家會害羞…', 'en': 'Stop poking… I\\'m shy…', 'ja': 'つつかないで…恥ずかしい…', 'ko': '찌르지 마… 부끄러워…' } }
  ];

  /* 贊助：隨機流浪動物之家（英文版走國際組織） */
  var DONATE_TW = [
    { name: '台灣之心愛護動物協會', url: 'https://www.hotac.org.tw/' },
    { name: '台灣SPCA', url: 'https://www.spca.org.tw/' },
    { name: '台灣動物緊急救援小組', url: 'https://www.savedogs.org/' }
  ];
  var DONATE_LINKS = {
    'zh-TW': DONATE_TW, 'ja': DONATE_TW, 'ko': DONATE_TW,
    'en': [
      { name: 'Taiwan SPCA', url: 'https://www.spca.org.tw/' },
      { name: 'ASPCA', url: 'https://www.aspca.org/' },
      { name: 'Best Friends', url: 'https://bestfriends.org/' }
    ]
  };

  /* dump into abyss: text eaten char by char (reverse typewriter) */
  var vent = document.getElementById('vent'),
      dump = document.getElementById('dump'),
      dhint = document.getElementById('dump-hint');
  dump.addEventListener('click', function(){
    var text = vent.value;
    if (!text.trim()) { dhint.textContent = t('empty'); return; }
    if (PII_RE.test(text)) { demonSay(dhint, '', PII_MSG[LANG] || PII_MSG['zh-TW'], ''); return; }
    function afterMeal(taste){
      var short = text.length > 18 ? text.slice(0, 18) + '…' : text;
      vent.value = '';
      if (taste.red) {
        dhint.textContent = t('redline');
      } else if (taste.reject || taste.score < 20) {
        rejected++;
        var rj = REJECTS[LANG] || REJECTS['zh-TW'];
        var rq = rj[Math.floor(Math.random() * rj.length)];
        demonSay(dhint, '', rq, '');
        showRejectStamp();
        var rl = document.getElementById('reject-line');
        rl.style.display = 'block';
        rl.textContent = t('rejected') + rejected + t('rejectUnit');
        var slot = document.getElementById('share-slot');
        slot.innerHTML = '';
        var shb = document.createElement('button');
        shb.className = 'btn-mini'; shb.type = 'button'; shb.style.fontWeight = 'bold';
        shb.textContent = t('shareCard');
        shb.addEventListener('click', function(){
          var cv = makeShareCard({ big: t('stamp'), small: '', quip: rq, nick: nick });
          shareCanvas(cv, 'yuanqi-reject.png');
          slot.innerHTML = '';
        });
        slot.appendChild(shb);
        setTimeout(function(){ slot.innerHTML = ''; }, 8000);
      } else {
        yuanqi += taste.score;
        var sl = t('scoreLine')(taste.score);
        demonSay(dhint, sl[0], taste.quip, sl[1]);
        spawnDan(nick, short);
        maybeKing(taste.score, nick, short);
        mineCards.unshift({ id: 'mine-' + Date.now(), name: nick, lv: taste.score, text: text, hugs: 0, boosts: 0, mine: true });
        renderPlaza();
        (function(cardRef){
          apiPost('/api/vent', { nick: nick, text: text, score: taste.score, quip: taste.quip, lang: LANG, reject: false })
            .then(function(r){ if (r && r.ok && r.id != null) cardRef.id = r.id; });
        })(mineCards[0]);
      }
      render();
      if (!taste.red && !taste.reject && taste.score >= 20) {
        var cur = parseInt(blob.style.width, 10) || 0;
        blob.style.width = (cur + 24) + 'px';
        blob.style.height = (cur + 24) + 'px';
      }
      setTimeout(function(){ render(); dump.disabled = false; }, 220);
    }
    if (RED_RE.test(text)) { vent.value = ''; afterMeal({ score: 0, red: true, quip: '' }); return; }
    dump.disabled = true;
    dhint.textContent = t('tasting');
    aiTaste(text).then(function(taste){
      if (reduceMotion) { afterMeal(taste); return; }
      throwBottle(function(){
        var iv = setInterval(function(){
          if (vent.value.length <= 1) { clearInterval(iv); afterMeal(taste); }
          else { vent.value = vent.value.slice(0, -8); }
        }, 40);
      });
    });
  });

  /* 語音留言：錄音 → 0.7x 惡魔變聲 → 試聽 → 上傳 */
  var voiceBtn = document.getElementById('voice-btn');
  var mrRef = null, recTimer = null, recLeft = 0, recOn = false;
  voiceBtn.addEventListener('click', function(){
    if (recOn) { stopRec(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined' ||
        typeof OfflineAudioContext === 'undefined') {
      dhint.textContent = t('voiceNA'); return;
    }
    voiceBtn.textContent = t('voiceAsk');
    voiceBtn.disabled = true;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
      voiceBtn.disabled = false;
      var mr;
      try { mr = new MediaRecorder(stream); } catch (e) { dhint.textContent = t('voiceNA'); return; }
      var chunks = [];
      mr.ondataavailable = function(e){ if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = function(){
        stream.getTracks().forEach(function(tr){ try { tr.stop(); } catch (e) {} });
        finishRec(new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
      };
      mrRef = mr; recOn = true;
      mr.start();
      recLeft = 60;
      voiceBtn.textContent = t('voiceRec')(recLeft);
      recTimer = setInterval(function(){
        recLeft--;
        if (recLeft <= 0) { stopRec(); return; }
        voiceBtn.textContent = t('voiceRec')(recLeft);
      }, 1000);
      setTimeout(function(){ if (recOn) stopRec(); }, 60000);
    }).catch(function(){ voiceBtn.disabled = false; voiceBtn.textContent = t('voice'); dhint.textContent = t('voiceNA'); });
  });
  function stopRec(){
    recOn = false;
    if (recTimer) { clearInterval(recTimer); recTimer = null; }
    voiceBtn.textContent = t('voice');
    try { if (mrRef && mrRef.state !== 'inactive') mrRef.stop(); } catch (e) {}
    mrRef = null;
  }
  function encodeWAV(buf){
    var ch = buf.getChannelData(0), n = ch.length, sr = buf.sampleRate;
    var ab = new ArrayBuffer(44 + n * 2), v = new DataView(ab);
    function ws(o, str){ for (var i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); }
    ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    ws(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) {
      var x = Math.max(-1, Math.min(1, ch[i]));
      v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7FFF, true);
    }
    return new Blob([ab], { type: 'audio/wav' });
  }
  function finishRec(blob){
    dhint.textContent = t('voiceFx');
    try {
      blob.arrayBuffer().then(function(ab){
        var AC = window.AudioContext || window.webkitAudioContext;
        var ac = new AC();
        ac.decodeAudioData(ab, function(buf){
          try {
            var rate = 0.7;
            var oc = new OfflineAudioContext(1, Math.max(1, Math.ceil(buf.length / rate)), buf.sampleRate);
            var src = oc.createBufferSource();
            src.buffer = buf; src.playbackRate.value = rate;
            src.connect(oc.destination); src.start();
            oc.startRendering().then(function(rb){
              showVoicePanel(encodeWAV(rb));
              dhint.textContent = '';
              try { ac.close(); } catch (e) {}
            }).catch(function(){ dhint.textContent = t('voiceNA'); });
          } catch (e) { dhint.textContent = t('voiceNA'); }
        }, function(){ dhint.textContent = t('voiceNA'); });
      }).catch(function(){ dhint.textContent = t('voiceNA'); });
    } catch (e) { dhint.textContent = t('voiceNA'); }
  }
  function showVoicePanel(wav){
    var old = document.getElementById('voice-panel');
    if (old) old.remove();
    var p = document.createElement('div');
    p.id = 'voice-panel';
    var b1 = document.createElement('button'); b1.className = 'btn-mini'; b1.type = 'button'; b1.textContent = t('voiceListen');
    var b2 = document.createElement('button'); b2.className = 'btn-mini'; b2.type = 'button'; b2.textContent = t('voiceSend');
    b1.addEventListener('click', function(){
      try { new Audio(URL.createObjectURL(wav)).play(); } catch (e) {}
    });
    b2.addEventListener('click', function(){
      b2.disabled = true;
      dhint.textContent = t('voiceUploading');
      var fd = new FormData();
      fd.append('audio', wav, 'voice.wav');
      fd.append('nick', nick);
      fetch('/api/voice', { method: 'POST', body: fd }).then(function(r){
        if (!r.ok) throw 0; return r.json();
      }).then(function(j){
        p.remove(); dhint.textContent = '';
        addVoiceCard(j && j.ok ? j : null, wav);
      }).catch(function(){
        p.remove(); dhint.textContent = '';
        addVoiceCard(null, wav);
      });
    });
    p.appendChild(b1); p.appendChild(document.createTextNode(' ')); p.appendChild(b2);
    vent.parentNode.insertBefore(p, vent.nextSibling);
  }
  function addVoiceCard(j, wav){
    var url = (j && j.url) || URL.createObjectURL(wav);
    var id = (j && j.id != null) ? j.id : 'voice-' + Date.now();
    yuanqi += 50;
    spawnDan(nick, t('voiceTag'));
    maybeKing(50, nick, t('voiceTag'));
    mineCards.unshift({ id: id, name: nick, lv: 50, text: '', voice: true, url: url, hugs: 0, boosts: 0, mine: true });
    renderPlaza(); render();
  }

  /* plaza */
  var data = [
    { id: 'seed-0', name: 'tired_owl_073', lv: 82, text: '開會三小時，結論是下週再開一次會。', hugs: 12, boosts: 0 },
    { id: 'seed-1', name: 'rain_frog_211', lv: 67, text: '說好準時下班，老闆五點五十九分丟了三件事過來。', hugs: 7, boosts: 0 },
    { id: 'seed-2', name: 'burnt_rice_058', lv: 94, text: '房東又漲租，薪水倒是三年沒動過。', hugs: 23, boosts: 0 }
  ];
  var mineCards = [];
  var plaza = document.getElementById('plaza');
  var boostedIds = [];
  try { boostedIds = JSON.parse(localStorage.getItem('yq-boosted') || '[]'); } catch (e) { boostedIds = []; }
  var reportedIds = {};
  try { JSON.parse(localStorage.getItem('yq-reported') || '[]').forEach(function(x){ reportedIds[x] = 1; }); } catch (e) {}
  function effLv(d){ return d.lv + d.boosts * 5; }
  function makeCard(d){
    var card = document.createElement('div');
    card.className = 'card';
    if (d.mine) card.style.borderWidth = '4px';
    var boosted = boostedIds.indexOf(d.id) >= 0;
    card.innerHTML = '<span class="meta">' + (d.mine ? '★ ' : '') + '<b class="cname"></b> <span class="clv"></span></span>：<span class="tbody"></span> ' +
      '<button class="btn-hug" type="button">' + t('hug') + ' <span class="hug-count">' + d.hugs + '</span></button> ' +
      '<button class="btn-boost" type="button"' + (boosted ? ' disabled' : '') + '>' + t('boost') + ' <span class="boost-count">' + d.boosts + '</span></button> ' +
      '<button class="btn-mini btn-report" type="button"' + (reportedIds[d.id] ? ' disabled' : '') + '>' + (reportedIds[d.id] ? t('reported') : t('report')) + '</button> ' +
      '<span class="hint card-msg"></span>';
    card.querySelector('.cname').textContent = d.name;
    card.querySelector('.clv').textContent = effLv(d) + '/100';
    var tb = card.querySelector('.tbody');
    var full = d.text || '';
    if (d.voice) {
      var pv = document.createElement('button');
      pv.className = 'btn-mini'; pv.type = 'button';
      pv.textContent = '▶ ' + t('playVoice');
      pv.addEventListener('click', function(){ if (d.url) { try { new Audio(d.url).play(); } catch (e) {} } });
      tb.appendChild(pv);
      var vtag = document.createElement('span');
      vtag.textContent = ' ' + t('voiceTag');
      tb.appendChild(vtag);
    } else if (full.length > 120) {
      tb.textContent = full.slice(0, 120) + '…';
      tb.setAttribute('data-exp', '0');
      tb.addEventListener('click', function(){
        var exp = tb.getAttribute('data-exp') === '1';
        tb.textContent = exp ? full.slice(0, 120) + '…' : full;
        tb.setAttribute('data-exp', exp ? '0' : '1');
      });
    } else {
      tb.textContent = full;
    }
    var b = card.querySelector('.btn-hug'),
        c = card.querySelector('.hug-count'),
        bb = card.querySelector('.btn-boost'),
        bc = card.querySelector('.boost-count'),
        m = card.querySelector('.card-msg');
    b.addEventListener('click', function(){
      d.hugs++; c.textContent = d.hugs;
      c.classList.add('flash');
      setTimeout(function(){ c.classList.remove('flash'); }, reduceMotion ? 0 : 180);
      yuanqi -= 2; render();
      m.textContent = t('thinking');
      aiTaunt(d.text).then(function(x){ demonSay(m, '', x, '（-2）'); });
      apiPost('/api/hug', { id: d.id });
    });
    bb.addEventListener('click', function(){
      if (boostedIds.indexOf(d.id) >= 0) { m.textContent = t('boosted'); return; }
      boostedIds.push(d.id);
      try { localStorage.setItem('yq-boosted', JSON.stringify(boostedIds)); } catch (e) {}
      d.boosts++; bc.textContent = d.boosts;
      bb.disabled = true;
      card.querySelector('.clv').textContent = effLv(d) + '/100';
      yuanqi += 1; render();
      m.textContent = t('praising');
      var pr = PRAISE[LANG] || PRAISE['zh-TW'];
      setTimeout(function(){ demonSay(m, '', pr[Math.floor(Math.random() * pr.length)], '（+5）'); }, 600);
      maybeKing(effLv(d), d.name, d.text);
      apiPost('/api/boost', { id: d.id });
    });
    var rp = card.querySelector('.btn-report');
    rp.addEventListener('click', function(){
      if (reportedIds[d.id]) return;
      reportedIds[d.id] = 1;
      try {
        var arr = []; for (var k in reportedIds) arr.push(k);
        localStorage.setItem('yq-reported', JSON.stringify(arr));
      } catch (e) {}
      rp.textContent = t('reported'); rp.disabled = true;
      try {
        fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: d.id, reason: '' }) }).catch(function(){});
      } catch (e) {}
    });
    return card;
  }
  function renderPlaza(){
    plaza.innerHTML = '';
    var all = mineCards.concat(data);
    for (var i = 0; i < all.length; i++) plaza.appendChild(makeCard(all[i]));
  }

  /* 彈幕：留言不在牆上，全在空中飄 */
  var danLayer = document.getElementById('danmaku');
  var samples = [
    { name: 'tired_owl_073', text: '開會三小時，結論是下週再開一次會。' },
    { name: 'rain_frog_211', text: '說好準時下班，老闆五點五十九分丟了三件事過來。' },
    { name: 'cold_noodle_114', text: '已讀不回，還敢在群組貼長輩圖。' },
    { name: 'dark_cloud_007', text: '捷運上被雨傘戳到三次，對方還在滑手機。' }
  ];
  function spawnDan(name, text){
    if (reduceMotion) return;
    var d = document.createElement('div');
    d.className = 'dan';
    d.textContent = name + '：' + (text.length > 26 ? text.slice(0, 26) + '…' : text);
    d.addEventListener('click', function(){
      document.getElementById('full-text').textContent = name + '：\\n' + text;
      document.getElementById('full-layer').style.display = 'flex';
    });
    d.style.top = (4 + Math.random() * 76) + '%';
    d.style.animationDuration = (8 + Math.random() * 7) + 's';
    d.addEventListener('animationend', function(){ d.remove(); });
    danLayer.appendChild(d);
  }
  document.getElementById('full-close').addEventListener('click', function(){
    document.getElementById('full-layer').style.display = 'none';
  });
  setInterval(function(){
    if (document.hidden) return;
    var s = samples[Math.floor(Math.random() * samples.length)];
    spawnDan(s.name, s.text);
  }, 5000);

  /* ---- 後端 API（失敗就當沒這回事，本地照玩） ---- */
  var weatherCache = null;
  function apiGet(path){
    return fetch(path).then(function(r){ if (!r.ok) throw 0; return r.json(); });
  }
  function apiPost(path, data){
    return fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function(r){ if (!r.ok) throw 0; return r.json(); })
      .catch(function(){ return null; });
  }
  function loadState(){
    apiGet('/api/state').then(function(st){
      if (!st) return;
      if (typeof st.yuanqi === 'number') yuanqi = Math.max(0, st.yuanqi);
      if (typeof st.rejects === 'number' && st.rejects > 0) {
        rejected = st.rejects;
        var rl = document.getElementById('reject-line');
        rl.style.display = 'block';
        rl.textContent = t('rejected') + rejected + t('rejectUnit');
      }
      if (st.king && typeof st.king.score === 'number') { king = null; maybeKing(st.king.score, st.king.nick || '?', st.king.text || ''); }
      if (Array.isArray(st.vents) && st.vents.length) {
        data.length = 0;
        st.vents.forEach(function(v){
          data.push({ id: v.id, name: v.nick || '?', lv: v.score || 0, text: v.text || '', hugs: v.hugs || 0, boosts: v.boosts || 0, voice: !!v.voice, url: v.url });
        });
        renderPlaza();
      }
      render();
    }).catch(function(){});
  }
  function pollState(){
    apiGet('/api/state').then(function(st){
      if (!st) return;
      if (typeof st.yuanqi === 'number') { yuanqi = Math.max(0, st.yuanqi); render(); }
      if (typeof st.rejects === 'number' && st.rejects !== rejected) {
        rejected = st.rejects;
        var rl = document.getElementById('reject-line');
        if (rejected > 0) { rl.style.display = 'block'; rl.textContent = t('rejected') + rejected + t('rejectUnit'); }
        else { rl.style.display = 'none'; }
      }
      if (st.king && typeof st.king.score === 'number' && (!king || st.king.score > king.score)) {
        king = null; maybeKing(st.king.score, st.king.nick || '?', st.king.text || '');
      }
    }).catch(function(){});
  }
  function renderWeather(){
    var wc = document.getElementById('weather-card');
    if (!weatherCache) { wc.style.display = 'none'; return; }
    wc.textContent = t('weatherLine')(weatherCache);
    wc.style.display = 'block';
  }
  function loadWeather(){
    apiGet('/api/weather').then(function(w){
      if (!w || typeof w.vents !== 'number') return;
      weatherCache = w;
      renderWeather();
    }).catch(function(){});
  }

  /* 今日怨氣王 */
  var kingBox = document.getElementById('king');
  var king = null;
  function maybeKing(score, name, text){
    if (score < 90) return;
    if (king && score <= king.score) return;
    king = { score: score, name: name, text: text, nick: name };
    var kt = text.length > 40 ? text.slice(0, 40) + '…' : text;
    kingBox.innerHTML = t('kingLine')(name, score, kt);
    kingBox.style.display = 'block';
    var sh = document.createElement('button');
    sh.className = 'btn-mini'; sh.type = 'button'; sh.style.marginTop = '8px';
    sh.textContent = t('share');
    sh.addEventListener('click', function(){
      if (!king) return;
      var cv = makeShareCard({ big: String(king.score), small: '/100', quip: king.text, nick: king.nick });
      shareCanvas(cv, 'yuanqi-king.png');
    });
    kingBox.appendChild(sh);
  }

  /* 分享卡：900x900 黑白 brutalism */
  function wrapText(c, text, x, y, maxW, lh, maxLines){
    var chars = String(text).split(''), line = '', yy = y, n = 0;
    for (var i = 0; i < chars.length; i++) {
      var t2 = line + chars[i];
      if (c.measureText(t2).width > maxW && line) {
        c.fillText(line, x, yy); line = chars[i]; yy += lh; n++;
        if (n >= maxLines) { line = line.slice(0, Math.max(0, line.length - 1)) + '…'; break; }
      } else { line = t2; }
    }
    c.fillText(line, x, yy);
    return yy + lh;
  }
  function makeShareCard(o){
    var cv = document.createElement('canvas');
    cv.width = 900; cv.height = 900;
    var c = cv.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, 900, 900);
    c.strokeStyle = '#000'; c.lineWidth = 24; c.strokeRect(28, 28, 844, 844);
    c.fillStyle = '#000'; c.textAlign = 'center';
    c.font = 'bold 60px ui-monospace, Menlo, monospace';
    c.fillText(t('title'), 450, 150);
    c.font = 'bold 260px ui-monospace, Menlo, monospace';
    c.fillText(o.big, 450, 440);
    if (o.small) { c.font = 'bold 70px ui-monospace, Menlo, monospace'; c.fillText(o.small, 450, 530); }
    c.textAlign = 'left';
    c.font = '42px ui-monospace, Menlo, monospace';
    wrapText(c, o.quip, 90, 630, 720, 58, 3);
    c.font = '34px ui-monospace, Menlo, monospace';
    c.fillText('@' + o.nick, 90, 810);
    c.textAlign = 'right';
    var d = new Date();
    var ds = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    c.fillText(ds, 810, 810);
    return cv;
  }
  function shareCanvas(cv, filename){
    cv.toBlob(function(blob){
      if (!blob) return;
      try {
        var file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          navigator.share({ files: [file] }).catch(function(){});
          return;
        }
      } catch (e) {}
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 5000);
    }, 'image/png');
  }

  /* 點惡魔：隨機搞怪反應 */
  var demonCd = 0;
  function pokeDemon(){
    var now = Date.now();
    if (now - demonCd < 1500) return;
    demonCd = now;
    var a = demonActs[Math.floor(Math.random() * demonActs.length)];
    var burstEl = document.getElementById('burst');
    burstEl.textContent = a.burst[LANG] || a.burst['zh-TW'];
    burstEl.style.display = 'block';
    if (a.shake && !reduceMotion && !lowEnd) document.body.classList.add('shake');
    if (!reduceMotion) blob.classList.add(a.cls);
    demonSay(dhint, '', a.line[LANG] || a.line['zh-TW'], '');
    setTimeout(function(){
      burstEl.style.display = 'none';
      document.body.classList.remove('shake');
      blob.classList.remove(a.cls);
    }, reduceMotion ? 1200 : 800);
  }
  blob.addEventListener('click', pokeDemon);
  try { twin.addEventListener('click', pokeDemon); } catch (e) {}

  /* 贊助：隨機流浪動物之家 */
  document.getElementById('sponsor-btn').addEventListener('click', function(){
    var links = DONATE_LINKS[LANG] || DONATE_LINKS['zh-TW'];
    var pick = links[Math.floor(Math.random() * links.length)];
    var go = document.getElementById('sponsor-go');
    go.textContent = t('sponsorGo') + '（' + pick.name + '）';
    go.onclick = function(){ window.open(pick.url, '_blank', 'noopener'); };
    document.getElementById('sponsor-layer').style.display = 'flex';
  });
  document.getElementById('sponsor-close').addEventListener('click', function(){
    document.getElementById('sponsor-layer').style.display = 'none';
  });

  /* 語言切換 */
  var langBtns = document.querySelectorAll('#lang-sw button');
  for (var li = 0; li < langBtns.length; li++) {
    (function(b){
      b.addEventListener('click', function(){
        LANG = b.getAttribute('data-lang');
        try { localStorage.setItem('yq-lang', LANG); } catch (e) {}
        applyLang();
      });
    })(langBtns[li]);
  }

  applyLang();
  maybeKing(94, 'burnt_rice_058', '房東又漲租，薪水倒是三年沒動過。');
  spawnDan('burnt_rice_058', '房東又漲租，薪水倒是三年沒動過。');
  setTimeout(function(){ spawnDan('tired_owl_073', '開會三小時，結論是下週再開一次會。'); }, 1800);
  setTimeout(function(){ spawnDan('cold_noodle_114', '已讀不回，還敢在群組貼長輩圖。'); }, 3600);
  loadState();
  loadWeather();
  setInterval(pollState, 20000);
})();
</script>
</body>
</html>
`;

// ===== API routes (from api-routes.js) =====
// 怨氣發電廠真後端：D1 + R2 API 路由
// 部署時整檔拼進 worker.js（handleApi 自包含，不依賴外部變數）

// ===== D1 schema（建表用，註解備用）=====
const D1_SCHEMA = [
"CREATE TABLE IF NOT EXISTS vents(id INTEGER PRIMARY KEY AUTOINCREMENT, nick TEXT, text TEXT, score INTEGER, quip TEXT, lang TEXT, reject INTEGER DEFAULT 0, ip TEXT, hugs INTEGER DEFAULT 0, boosts INTEGER DEFAULT 0, voice_key TEXT, created_at INTEGER)",
"CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT)",
"CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY AUTOINCREMENT, vent_id INTEGER, reason TEXT, ip TEXT, created_at INTEGER)",
"INSERT INTO kv(k,v) SELECT 'yuanqi','62' WHERE NOT EXISTS (SELECT 1 FROM kv WHERE k='yuanqi')"
].join(";\n");

function yqTwDate(ms){
  var t = new Date((ms || Date.now()) + 8 * 3600 * 1000);
  return t.toISOString().slice(0, 10); // YYYY-MM-DD（UTC+8）
}
function yqDayKey(ms){
  return 'rejects_' + yqTwDate(ms).replace(/-/g, '');
}
function yqDayStartMs(ymd){
  var p = ymd.split('-');
  return Date.UTC(+p[0], +p[1] - 1, +p[2]) - 8 * 3600 * 1000;
}
async function yqKvGet(env, k, def){
  var r = await env.DB.prepare('SELECT v FROM kv WHERE k=?').bind(k).first();
  return r ? r.v : def;
}
async function yqKvSet(env, k, v){
  await env.DB.prepare('INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind(k, String(v)).run();
}
function yqIp(request){
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

async function yqState(env){
  var y = parseInt(await yqKvGet(env, 'yuanqi', '62'), 10) || 0;
  var rejects = parseInt(await yqKvGet(env, yqDayKey(), '0'), 10) || 0;
  var kingRaw = await yqKvGet(env, 'king', null);
  var rows = await env.DB.prepare(
    'SELECT id,nick,text,score,hugs,boosts,voice_key,created_at FROM vents ORDER BY id DESC LIMIT 20'
  ).all();
  var vents = (rows.results || []).map(function(r){
    return { id: r.id, nick: r.nick, text: r.text, score: r.score, hugs: r.hugs || 0,
             boosts: r.boosts || 0, voice: !!r.voice_key, created: r.created_at };
  });
  return { yuanqi: y, rejects: rejects, king: kingRaw ? JSON.parse(kingRaw) : null, vents: vents };
}

async function yqVent(request, env){
  var ip = yqIp(request);
  var body = await request.json();
  var nick = String(body.nick || 'anon').slice(0, 40);
  var text = String(body.text || '').slice(0, 2000);
  var score = Math.max(0, Math.min(100, parseInt(body.score, 10) || 0));
  var quip = String(body.quip || '').slice(0, 200);
  var lang = String(body.lang || 'zh-TW').slice(0, 10);
  var reject = body.reject ? 1 : 0;
  // 限流：同 IP 1 小時內最多 30 筆
  var c = await env.DB.prepare('SELECT COUNT(*) AS n FROM vents WHERE ip=? AND created_at>?')
    .bind(ip, Date.now() - 3600 * 1000).first();
  if (c && c.n >= 30) return Response.json({ error: 'too many' }, { status: 429 });
  var info = await env.DB.prepare(
    'INSERT INTO vents(nick,text,score,quip,lang,reject,ip,created_at) VALUES(?,?,?,?,?,?,?,?)'
  ).bind(nick, text, score, quip, lang, reject, ip, Date.now()).run();
  var id = info.meta.last_row_id;
  var y = parseInt(await yqKvGet(env, 'yuanqi', '62'), 10) || 0;
  if (!reject) {
    y += score;
    await yqKvSet(env, 'yuanqi', y);
  } else {
    var rk = yqDayKey();
    var rc = (parseInt(await yqKvGet(env, rk, '0'), 10) || 0) + 1;
    await yqKvSet(env, rk, rc);
  }
  if (!reject && score >= 90) {
    var kingRaw = await yqKvGet(env, 'king', null);
    var king = kingRaw ? JSON.parse(kingRaw) : null;
    if (!king || score > king.score) {
      await yqKvSet(env, 'king', JSON.stringify({ nick: nick, score: score, text: text.slice(0, 120) }));
    }
  }
  return Response.json({ ok: true, id: id });
}

async function yqHug(request, env){
  var body = await request.json();
  var id = parseInt(body.id, 10) || 0;
  var row = await env.DB.prepare('SELECT hugs FROM vents WHERE id=?').bind(id).first();
  if (!row) return Response.json({ error: 'not found' }, { status: 404 });
  var hugs = (row.hugs || 0) + 1;
  await env.DB.prepare('UPDATE vents SET hugs=? WHERE id=?').bind(hugs, id).run();
  var y = Math.max(0, (parseInt(await yqKvGet(env, 'yuanqi', '62'), 10) || 0) - 2);
  await yqKvSet(env, 'yuanqi', y);
  return Response.json({ ok: true, hugs: hugs });
}

async function yqBoost(request, env){
  var body = await request.json();
  var id = parseInt(body.id, 10) || 0;
  var row = await env.DB.prepare('SELECT score,boosts,nick,text FROM vents WHERE id=?').bind(id).first();
  if (!row) return Response.json({ error: 'not found' }, { status: 404 });
  var boosts = (row.boosts || 0) + 1;
  await env.DB.prepare('UPDATE vents SET boosts=? WHERE id=?').bind(boosts, id).run();
  var lv = (row.score || 0) + boosts * 5;
  var y = (parseInt(await yqKvGet(env, 'yuanqi', '62'), 10) || 0) + 1;
  await yqKvSet(env, 'yuanqi', y);
  if (lv >= 90) {
    var kingRaw = await yqKvGet(env, 'king', null);
    var king = kingRaw ? JSON.parse(kingRaw) : null;
    if (!king || lv > king.score) {
      await yqKvSet(env, 'king', JSON.stringify({ nick: row.nick, score: lv, text: String(row.text || '').slice(0, 120) }));
    }
  }
  return Response.json({ ok: true, boosts: boosts, lv: lv });
}

async function yqReport(request, env){
  var body = await request.json();
  var id = parseInt(body.id, 10) || 0;
  var reason = String(body.reason || '').slice(0, 200);
  await env.DB.prepare('INSERT INTO reports(vent_id,reason,ip,created_at) VALUES(?,?,?,?)')
    .bind(id, reason, yqIp(request), Date.now()).run();
  return Response.json({ ok: true });
}

async function yqWeather(env){
  var today = yqTwDate();
  var yday = yqTwDate(Date.now() - 86400 * 1000);
  var st = await env.DB.prepare(
    'SELECT COUNT(*) AS n, COALESCE(SUM(score),0) AS total, COALESCE(SUM(reject),0) AS rej, COALESCE(MAX(score),0) AS peak FROM vents WHERE created_at>=? AND created_at<?'
  ).bind(yqDayStartMs(yday), yqDayStartMs(today)).first();
  return { date: yday, vents: st.n || 0, total: st.total || 0, rejects: st.rej || 0, peak: st.peak || 0 };
}

async function yqVoicePost(request, env){
  var form = await request.formData();
  var audio = form.get('audio');
  var nick = String(form.get('nick') || 'anon').slice(0, 40);
  if (!audio || typeof audio.arrayBuffer !== 'function') {
    return Response.json({ error: 'no audio' }, { status: 400 });
  }
  var buf = await audio.arrayBuffer();
  if (buf.byteLength > 8 * 1024 * 1024) {
    return Response.json({ error: 'too large' }, { status: 413 });
  }
  var ext = (audio.name || '').toLowerCase().indexOf('.wav') >= 0 ? 'wav' : 'webm';
  var ctype = audio.type || (ext === 'wav' ? 'audio/wav' : 'audio/webm');
  var key = 'v/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  await env.VOICE.put(key, buf, { httpMetadata: { contentType: ctype } });
  var info = await env.DB.prepare(
    "INSERT INTO vents(nick,text,score,lang,ip,voice_key,created_at) VALUES(?,'',50,'',?,?,?)"
  ).bind(nick, yqIp(request), key, Date.now()).run();
  var id = info.meta.last_row_id;
  return Response.json({ ok: true, id: id, url: '/api/voice?id=' + id });
}

async function yqVoiceGet(request, env){
  var id = new URL(request.url).searchParams.get('id');
  var row = await env.DB.prepare('SELECT voice_key FROM vents WHERE id=?').bind(id).first();
  if (!row || !row.voice_key) return Response.json({ error: 'not found' }, { status: 404 });
  var obj = await env.VOICE.get(row.voice_key);
  if (!obj) return Response.json({ error: 'not found' }, { status: 404 });
  var ct = (obj.httpMetadata && obj.httpMetadata.contentType) || 'audio/webm';
  return new Response(obj.body, { headers: { 'content-type': ct } });
}

async function handleApi(request, env){
  try {
    var url = new URL(request.url);
    var path = url.pathname;
    var method = request.method;
    if (path === '/api/state' && method === 'GET') return Response.json(await yqState(env));
    if (path === '/api/vent' && method === 'POST') return await yqVent(request, env);
    if (path === '/api/hug' && method === 'POST') return await yqHug(request, env);
    if (path === '/api/boost' && method === 'POST') return await yqBoost(request, env);
    if (path === '/api/report' && method === 'POST') return await yqReport(request, env);
    if (path === '/api/weather' && method === 'GET') return Response.json(await yqWeather(env));
    if (path === '/api/voice' && method === 'POST') return await yqVoicePost(request, env);
    if (path === '/api/voice' && method === 'GET') return await yqVoiceGet(request, env);
    return Response.json({ error: 'not found' }, { status: 404 });
  } catch (e) {
    return Response.json({ error: 'internal' }, { status: 500 });
  }
}


export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    if (url.pathname.indexOf('/api/') === 0) return handleApi(request, env);
    return new Response(HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
};
