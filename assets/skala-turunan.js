/* ============================================================================
   SKALA — skrip bersama halaman turunan (lacak.html, testimoni.html)
   API_URL HARUS SAMA dengan yang ada di index.html.
   ============================================================================ */
(function () {
  /* sama seperti index.html: isi API_URL_UJI dengan URL web app salinan uji */
  const API_URL_PRODUKSI = "https://script.google.com/macros/s/AKfycbxnw083hvsjFYWRQALxDWk8826I_JVqlWwPByUCeHL196w2S1mYSx6arabVaYhndO38/exec";
  const API_URL_UJI = "";
  const API_URL = (API_URL_UJI && location.hostname !== "skala.stekom.ac.id") ? API_URL_UJI : API_URL_PRODUKSI;

/* ============================================================ ANALITIK
     Umami (kunjungan & funnel) + Microsoft Clarity (peta panas & rekaman sesi).
     ID diatur dari spreadsheet (⚙️ SKALA → 📊 Analitik) dan dikirim lewat konfigurasi.
     Hanya aktif di domain resmi, dan TIDAK mengirim nama / nomor WA / email / NIM. */
    const DOMAIN_RESMI="skala.stekom.ac.id";
  const Analitik=(()=>{
    let siap=false, dipasang=false; const antre=[];
    const aktifDiSini=()=>location.hostname===DOMAIN_RESMI;
    function kirim(nama,data){
      try{ if(window.umami&&typeof umami.track==="function") umami.track(nama,data||{}); }catch(e){}
      try{ if(typeof window.clarity==="function") window.clarity("event",nama); }catch(e){}
    }
    function catat(nama,data){
      if(!aktifDiSini()) return;
      if(siap) kirim(nama,data); else { antre.push([nama,data]); if(antre.length>60) antre.shift(); }
    }
    function pasang(a){
      if(dipasang||!a||!aktifDiSini()) return; dipasang=true;
      if(a.clarity_id){
        (function(c,l,k,r,i){ c[k]=c[k]||function(){(c[k].q=c[k].q||[]).push(arguments)};
          const t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i; l.head.appendChild(t); })(window,document,"clarity","script",a.clarity_id);
      }
      if(a.umami_id){
        const s=document.createElement("script"); s.defer=true; s.src=a.umami_src||"https://cloud.umami.is/script.js";
        s.setAttribute("data-website-id",a.umami_id); s.setAttribute("data-domains",DOMAIN_RESMI);
        s.onload=()=>{ siap=true; antre.splice(0).forEach(x=>kirim(x[0],x[1])); };
        document.head.appendChild(s);
      } else { siap=true; antre.splice(0).forEach(x=>kirim(x[0],x[1])); }
    }
    /* seberapa jauh halaman digulir: 25 / 50 / 75 / 100 % (sekali per halaman) */
    const tanda={};
    addEventListener("scroll",()=>{
      const h=document.documentElement, p=Math.round((scrollY+innerHeight)/Math.max(1,h.scrollHeight)*100);
      [25,50,75,100].forEach(t=>{ if(p>=t&&!tanda[t]){ tanda[t]=1; catat("gulir_"+t); } });
    },{passive:true});
    /* klik yang ditangkap otomatis di seluruh halaman */
    document.addEventListener("click",ev=>{
      const a=ev.target.closest("a,button"); if(!a) return;
      const href=a.getAttribute("href")||"", bagian=(a.closest("section,header,footer,[id]")||{}).id||"";
      if(/pmb\.stekom\.ac\.id/.test(href)) catat("klik_pmb",{lokasi:bagian||"lain"});
      else if(/wa\.me\//.test(href)&&a.id!=="startWa") catat("klik_wa_admin",{lokasi:bagian||"lain"});
      else if(/\/lacak(\.html)?(\?|$)/.test(href)) catat("klik_ke_lacak",{lokasi:bagian||"lain"});
      else if(/\/testimoni(\.html)?(\?|$)/.test(href)) catat("klik_ke_testimoni",{lokasi:bagian||"lain"});
      else if(a.matches(".faq__q, .faq__q *")||a.closest(".faq__q")) catat("buka_faq");
    },{capture:true,passive:true});
    return {pasang,catat};
  })();
  window.skalaCatat=Analitik.catat;
  
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const rp = n => "Rp" + (Math.round(Number(n) || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let WA = "628888999920";
  const formatWa = n => { const d = String(n).replace(/\D/g, ""); const r = d.slice(2); return "+62 " + r.slice(0, 3) + "-" + r.slice(3, 7) + "-" + r.slice(7); };
  const waLink = t => "https://wa.me/" + WA + (t ? "?text=" + encodeURIComponent(t) : "");

  function toast(title, msg, type = "info", ms = 3800) {
    let wrap = $("#toasts");
    if (!wrap) { wrap = document.createElement("div"); wrap.id = "toasts"; wrap.className = "toasts"; wrap.setAttribute("role", "status"); document.body.appendChild(wrap); }
    const el = document.createElement("div");
    el.className = "toast toast--" + type; el.innerHTML = "<b>" + esc(title) + "</b>" + (msg ? esc(msg) : "");
    wrap.appendChild(el); setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, ms);
  }

  /* riak tombol */
  document.addEventListener("pointerdown", e => {
    const b = e.target.closest(".btn"); if (!b || b.disabled || kurangiGerak) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement("span");
    s.className = "ripple"; s.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
    b.appendChild(s); setTimeout(() => s.remove(), 650);
  });

  /* header & menu HP */
  function pasangHeader() {
    const header = $("#header"), burger = $("#burger"), nav = $("#mobileNav");
    const cek = () => header && header.classList.toggle("is-stuck", window.scrollY > 10);
    window.addEventListener("scroll", cek, { passive: true }); cek();
    if (burger && nav) {
      burger.addEventListener("click", () => { const o = nav.classList.toggle("is-open"); burger.setAttribute("aria-expanded", o ? "true" : "false"); });
      document.addEventListener("click", e => { if (nav.classList.contains("is-open") && !e.target.closest(".header")) { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); } });
    }
  }

  /* muncul saat digulir */
  let pengamat = null;
  function amatiReveal() {
    if (!("IntersectionObserver" in window) || kurangiGerak) { $$(".reveal").forEach(el => el.classList.add("is-in")); return; }
    pengamat = pengamat || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); pengamat.unobserve(e.target); } }), { threshold: .12 });
    $$(".reveal:not(.is-in)").forEach(el => pengamat.observe(el));
  }

  /* hitung naik angka */
  function hitungNaik(el, target, opsi = {}) {
    const tulis = v => el.textContent = opsi.rupiah ? rp(v) : Math.round(v).toLocaleString("id-ID");
    if (kurangiGerak) { tulis(target); return; }
    const t0 = performance.now() + (opsi.tunda || 200), dur = opsi.durasi || 1400;
    (function f(t) { const p = Math.max(0, Math.min(1, (t - t0) / dur)); tulis(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }

  /* ---------------- verifikasi keamanan (Cloudflare Turnstile) ---------------- */
  const Gerbang = (() => {
    let skripDimuat = false;
    const muatSkrip = () => { if (skripDimuat || window.turnstile) return; skripDimuat = true;
      const sc = document.createElement("script"); sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.async = true; document.head.appendChild(sc); };
    const KUNCI = "skala_sesi_v1", el = () => $("#gerbang");
    let siteKey = "", widgetId = null, menunggu = null, aktif = false;
    const status = (t, err) => { const s = $("#gerbangStatus"); if (!s) return; s.textContent = t || ""; s.classList.toggle("err", !!err); $("#gerbangUlang").hidden = !err; };
    const tiket = () => { try { const x = JSON.parse(sessionStorage.getItem(KUNCI) || "null"); if (x && x.exp > Date.now() + 60000) return x.t; } catch (e) {} return ""; };
    let kabar = () => {};
    const simpan = (t, m) => { Analitik.catat("verifikasi_lolos"); try { sessionStorage.setItem(KUNCI, JSON.stringify({ t: t, exp: Date.now() + (m || 60) * 60000 })); } catch (e) {} setTimeout(() => kabar(), 0); };
    const tutup = () => { if (!el()) return; el().classList.add("is-selesai"); document.body.classList.remove("gerbang-buka"); if (menunggu) { const f = menunggu; menunggu = null; f(); } };
    const buka = () => { if (!el()) return; el().classList.remove("is-selesai"); document.body.classList.add("gerbang-buka"); };
    async function kirim(token) {
      status("Memeriksa…");
      try {
        const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ aksi: "verifikasi", token: token }) });
        const d = await res.json();
        if (d && d.success && d.sesi) { simpan(d.sesi, d.berlaku_menit); status("Terverifikasi"); setTimeout(tutup, 350); return; }
        status((d && d.error) || "Verifikasi gagal.", true);
      } catch (e) { status("Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.", true); }
      try { window.turnstile && widgetId !== null && window.turnstile.reset(widgetId); } catch (e) {}
    }
    function pasang() {
      if (!siteKey) return; let coba = 0;
      (function tunggu() {
        if (window.turnstile && window.turnstile.render) {
          if (widgetId !== null) { try { window.turnstile.reset(widgetId); } catch (e) {} return; }
          status("");
          $("#tsWidget").innerHTML = "";
          widgetId = window.turnstile.render("#tsWidget", { size:(document.querySelector("#tsWidget").clientWidth>=300?"flexible":"compact"), sitekey: siteKey, language: "id", theme: "light", callback: kirim,
            "error-callback": () => status("Verifikasi gagal dimuat. Coba lagi.", true),
            "expired-callback": () => { try { window.turnstile.reset(widgetId); } catch (e) {} } });
          return;
        }
        if (++coba > 60) { status("Layanan verifikasi tidak dapat dimuat. Periksa koneksi internet.", true); return; }
        setTimeout(tunggu, 200);
      })();
    }
    return {
      tiket,
      /* halaman TIDAK digerbang saat dibuka; verifikasi hanya sebelum aksi yang dilindungi */
      mulai() { if (!el()) return; $("#gerbangUlang").addEventListener("click", () => { if (!window.turnstile) location.reload(); else { status("Memuat verifikasi…"); pasang(); } });
        const b = $("#gerbangBatal"); if (b) b.addEventListener("click", () => { menunggu = null; tutup(); }); },
      konfigurasi(c) { if (!el() || !c) return; siteKey = c.site_key || ""; aktif = !!c.aktif; if (!aktif) { tutup(); return; } if (!el().classList.contains("is-selesai")) pasang(); },
      perlu() { return !!(el() && aktif && siteKey && !tiket()); },
      captchaAktif() { return !!(el() && aktif); },
      padaBerubah(f) { kabar = f; },
      ulangi(aksi) { Analitik.catat("verifikasi_muncul"); try { sessionStorage.removeItem(KUNCI); } catch (e) {} menunggu = aksi || null; muatSkrip(); buka(); pasang(); },
      gagalMuat() { if (el() && !siteKey && !tiket()) status("Tidak dapat memuat halaman. Periksa koneksi lalu muat ulang.", true); }
    };
  })();

  /* ---------------- konfigurasi dari Apps Script (dipakai bersama index) ---------------- */
  const KUNCI_CFG = "skala_cfg_v1";
  const pendengar = [];
  function terapkan(cfg) {
    if (!cfg) return;
    if (cfg.wa_admin) WA = String(cfg.wa_admin).replace(/\D/g, "");
    $$("[data-wa-text]").forEach(e => e.textContent = formatWa(WA));
    $$("[data-wa]").forEach(a => { a.href = waLink("Halo Admin Beasiswa SKALA, saya ingin bertanya."); a.target = "_blank"; a.rel = "noopener"; });
    if (cfg.captcha) Gerbang.konfigurasi(cfg.captcha);
    if (cfg.sistem) {
      const bar = $("#maintBar"); const tutup = !!cfg.sistem.tutup;
      document.body.classList.toggle("mode-maint", tutup);
      if (bar) { bar.hidden = !tutup; if (tutup) { $("#maintBarTeks").textContent = cfg.sistem.buka_lagi ? "Perkiraan dibuka kembali: " + cfg.sistem.buka_lagi + "." : "";
        document.body.style.setProperty("--maint-h", (bar.offsetHeight || 44) + "px"); } }
    }
    if (Number(cfg.batas_tanggal_periode) > 0) PitaPeriode.aturBatas(cfg.batas_tanggal_periode);
    if ("banner" in cfg) pasangPromo($("#promo"), cfg.banner, API_URL);
    if (cfg.analitik) Analitik.pasang(cfg.analitik);
    if (cfg.mode_uji && !$(".pita-uji")) document.body.insertAdjacentHTML("beforeend", '<div class="pita-uji" role="status">🧪 LINGKUNGAN UJI</div>');
    pendengar.forEach(f => { try { f(cfg); } catch (e) {} });
  }
  async function muatKonfigurasi() {
    try { const s = JSON.parse(localStorage.getItem(KUNCI_CFG) || "null"); if (s && s.cfg && Date.now() - s.t < 7 * 86400000) terapkan(s.cfg); } catch (e) {}
    try {
      const res = await fetch(API_URL + "?aksi=konfigurasi"); const cfg = await res.json();
      if (cfg && cfg.success !== false) { terapkan(cfg); try { localStorage.setItem(KUNCI_CFG, JSON.stringify({ t: Date.now(), cfg: cfg })); } catch (e) {} }
    } catch (e) { Gerbang.gagalMuat(); }
  }

/* ============================================================ BANNER PROMOSI BERGILIR
     Data dari konfigurasi server: {interval, items:[{id,gambar,gambar_hp,link,alt,label,tab_baru}]}.
     Bisa digeser (swipe), berhenti saat disentuh/disorot, klik dicatat ke server. */
  function pasangPromo(wadah, data, apiUrl){
    if(!wadah) return;
    const items=(data&&data.items)||[];
    if(!items.length){ wadah.classList.remove("promo--tunggu"); wadah.hidden=true; wadah.innerHTML=""; return; }
    const sidik=JSON.stringify(data); if(wadah.dataset.sidik===sidik) return; wadah.dataset.sidik=sidik;
    const e=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    const semuaHp=items.every(x=>x.gambar_hp);
    wadah.classList.toggle("promo--hp",semuaHp);
    wadah.innerHTML='<div class="promo__rel">'+items.map((x,i)=>'<a class="promo__slide'+(i===0?' is-on':'')+'" data-id="'+e(x.id)+'" href="'+e(x.link)+'"'
        +(x.tab_baru!==false?' target="_blank" rel="noopener"':'')+' aria-label="'+e((x.alt||"Promosi")+(x.tab_baru!==false?" (membuka tab baru)":""))+'"'+(i?' tabindex="-1"':'')+'>'
        +'<picture>'+(x.gambar_hp?'<source media="(max-width:640px)" srcset="'+e(x.gambar_hp)+'">':'')
        +'<img src="'+e(x.gambar)+'" alt="'+e(x.alt||"")+'" width="1600" height="500" '+(i?'loading="lazy" ':'')+'decoding="async"></picture>'
        +(x.label?'<span class="promo__label">'+e(x.label)+'</span>':'')+'</a>').join("")+'</div>'
      +(items.length>1?'<button class="promo__nav promo__nav--kiri" type="button" aria-label="Banner sebelumnya">‹</button><button class="promo__nav promo__nav--kanan" type="button" aria-label="Banner berikutnya">›</button>'
        +'<div class="promo__titik" role="tablist">'+items.map((x,i)=>'<button type="button" role="tab" aria-label="Banner '+(i+1)+'"'+(i===0?' aria-selected="true"':'')+'></button>').join("")+'</div>':'');
    wadah.classList.remove("promo--tunggu"); wadah.removeAttribute("aria-hidden"); wadah.hidden=false;
    let slides=[...wadah.querySelectorAll(".promo__slide")], idx=0, jam=null, jeda=false;
    const kurangi=matchMedia("(prefers-reduced-motion: reduce)").matches, lama=Math.max(3,Number(data.interval)||6)*1000;
    const titik=()=>[...wadah.querySelectorAll(".promo__titik button")];
    function ke(n){
      if(!slides.length) return;
      idx=(n+slides.length)%slides.length;
      slides.forEach((s,i)=>{ s.classList.toggle("is-on",i===idx); s.tabIndex=i===idx?0:-1; });
      titik().forEach((t,i)=>t.setAttribute("aria-selected",String(i===idx)));
    }
    function mulai(){ berhenti(); if(!kurangi&&slides.length>1) jam=setInterval(()=>{ if(!jeda&&!document.hidden) ke(idx+1); },lama); }
    function berhenti(){ if(jam) clearInterval(jam); jam=null; }
    // gambar rusak → slide dibuang; semua rusak → banner disembunyikan
    slides.forEach(s=>{ const img=s.querySelector("img"); img.addEventListener("error",()=>{
      const i=slides.indexOf(s); s.remove(); slides=slides.filter(x=>x!==s);
      const t=titik()[i]; if(t) t.remove();
      if(!slides.length){ wadah.hidden=true; berhenti(); return; }
      if(slides.length<2) wadah.querySelectorAll(".promo__nav,.promo__titik").forEach(x=>x.remove());
      ke(Math.min(idx,slides.length-1)); }); });
    wadah.querySelectorAll(".promo__titik button").forEach((t,i)=>t.addEventListener("click",()=>{ ke(i); mulai(); }));
    const kiri=wadah.querySelector(".promo__nav--kiri"), kanan=wadah.querySelector(".promo__nav--kanan");
    if(kiri) kiri.addEventListener("click",()=>{ ke(idx-1); mulai(); });
    if(kanan) kanan.addEventListener("click",()=>{ ke(idx+1); mulai(); });
    wadah.addEventListener("mouseenter",()=>jeda=true); wadah.addEventListener("mouseleave",()=>jeda=false);
    wadah.addEventListener("focusin",()=>jeda=true); wadah.addEventListener("focusout",()=>jeda=false);
    // geser dengan jari
    let x0=null, geser=false;
    wadah.addEventListener("touchstart",ev=>{ x0=ev.touches[0].clientX; geser=false; jeda=true; },{passive:true});
    wadah.addEventListener("touchmove",ev=>{ if(x0!==null&&Math.abs(ev.touches[0].clientX-x0)>12) geser=true; },{passive:true});
    wadah.addEventListener("touchend",ev=>{ if(x0!==null&&geser){ const dx=ev.changedTouches[0].clientX-x0; if(Math.abs(dx)>40){ ke(idx+(dx<0?1:-1)); mulai(); } } x0=null; setTimeout(()=>jeda=false,2500); });
    slides.forEach(s=>s.addEventListener("click",ev=>{
      if(geser){ ev.preventDefault(); geser=false; return; }
      if(window.skalaCatat) skalaCatat("klik_banner",{id:s.dataset.id});
      if(apiUrl){ const body=JSON.stringify({aksi:"klikBanner",id:s.dataset.id});
        try{ navigator.sendBeacon ? navigator.sendBeacon(apiUrl,new Blob([body],{type:"text/plain;charset=utf-8"})) : fetch(apiUrl,{method:"POST",body,keepalive:true}); }catch(x){} }
    }));
    mulai();
  }
  
  /* ---- pita periode: hitung mundur batas pengajuan (WIB), diperbarui tiap menit ----
     Pengajuan tgl 1–batas masuk periode bulan itu; setelahnya masuk periode bulan berikutnya. */
  const PitaPeriode=(()=>{
    const BULAN=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    let batas=25, jam=null;
    function info(){
      const kini=Date.now(), wib=new Date(kini+7*3600e3), y=wib.getUTCFullYear(), m=wib.getUTCMonth(), d=wib.getUTCDate();
      const tutup=(th,bl)=>Date.UTC(th,bl,batas,23,59,59)-7*3600e3;
      if(d<=batas) return {buka:true,bl:m,sisa:tutup(y,m)-kini};
      const m2=(m+1)%12; return {buka:false,blLalu:m,bl:m2,sisa:tutup(m===11?y+1:y,m2)-kini};
    }
    function sisa(ms,pendek){
      const h=Math.floor(ms/864e5), j=Math.floor(ms%864e5/36e5), mn=Math.max(0,Math.floor(ms%36e5/6e4));
      if(pendek) return h>=1 ? h+"h "+j+"j lagi" : (j>=1 ? j+"j "+mn+"m lagi" : Math.max(1,mn)+"m lagi");
      return h>=1 ? h+" hari "+j+" jam lagi" : (j>=1 ? j+" jam "+mn+" menit lagi" : Math.max(1,mn)+" menit lagi");
    }
    function gambar(){
      const el=document.getElementById("pitaPeriode"); if(!el) return;
      const p=info(), nama=BULAN[p.bl], sing=nama.slice(0,3);
      const teks=document.getElementById("pitaTeks"), sis=document.getElementById("pitaSisa");
      if(p.buka){
        teks.innerHTML='<span class="panjang">Pengajuan periode <b>'+nama+'</b> ditutup '+batas+' '+sing+', 23.59 WIB</span>'
                      +'<span class="pendek">Ditutup '+batas+' '+sing+' 23.59</span>';
        sis.innerHTML='<span class="panjang">'+sisa(p.sisa,false)+'</span><span class="pendek">'+sisa(p.sisa,true)+'</span>';
      } else {
        teks.innerHTML='<span class="panjang">Periode '+BULAN[p.blLalu]+' ditutup · pengajuan kini masuk periode <b>'+nama+'</b> (ditutup '+batas+' '+sing+')</span>'
                      +'<span class="pendek">Kini periode <b>'+nama+'</b> · ditutup '+batas+' '+sing+'</span>';
        sis.innerHTML="";
      }
      el.classList.toggle("is-mepet",p.buka&&p.sisa<3*864e5);
      el.setAttribute("aria-label",teks.textContent.replace(/\s+/g," ")+" "+(sis.querySelector(".panjang")||{textContent:""}).textContent);
    }
    return {
      mulai(){ gambar(); if(!jam) jam=setInterval(gambar,60000); },
      aturBatas(b){ b=Number(b); if(b>0&&b<=28&&b!==batas){ batas=b; gambar(); } }
    };
  })();
  PitaPeriode.mulai();
  
  window.SKALA = { catat: Analitik.catat, API_URL, $, $$, esc, rp, toast, waLink, formatWa, hitungNaik, amatiReveal, Gerbang, kurangiGerak,
    padaKonfigurasi: f => pendengar.push(f),
    padaVerifikasi: f => Gerbang.padaBerubah(f),
    mulai(opsi = {}) { pasangHeader(); if (opsi.captcha) Gerbang.mulai(); amatiReveal(); muatKonfigurasi();
      setTimeout(() => { const p = $("#promo"); if (p && p.classList.contains("promo--tunggu")) { p.classList.remove("promo--tunggu"); p.hidden = true; } }, 10000);
      if ("serviceWorker" in navigator && location.protocol === "https:") window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {})); } };
})();
