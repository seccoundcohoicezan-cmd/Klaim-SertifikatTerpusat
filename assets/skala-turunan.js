/* ============================================================================
   SKALA — skrip bersama halaman turunan (lacak.html, testimoni.html)
   API_URL HARUS SAMA dengan yang ada di index.html.
   ============================================================================ */
(function () {
  const API_URL = "https://script.google.com/macros/s/AKfycbxnw083hvsjFYWRQALxDWk8826I_JVqlWwPByUCeHL196w2S1mYSx6arabVaYhndO38/exec";

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
    const KUNCI = "skala_sesi_v1", el = () => $("#gerbang");
    let siteKey = "", widgetId = null, menunggu = null;
    const status = (t, err) => { const s = $("#gerbangStatus"); if (!s) return; s.textContent = t || ""; s.classList.toggle("err", !!err); $("#gerbangUlang").hidden = !err; };
    const tiket = () => { try { const x = JSON.parse(sessionStorage.getItem(KUNCI) || "null"); if (x && x.exp > Date.now() + 60000) return x.t; } catch (e) {} return ""; };
    const simpan = (t, m) => { try { sessionStorage.setItem(KUNCI, JSON.stringify({ t: t, exp: Date.now() + (m || 60) * 60000 })); } catch (e) {} };
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
          widgetId = window.turnstile.render("#tsWidget", { sitekey: siteKey, language: "id", theme: "light", callback: kirim,
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
      mulai() { if (!el()) return; if (!tiket()) buka(); $("#gerbangUlang").addEventListener("click", () => { if (!window.turnstile) location.reload(); else { status("Memuat verifikasi…"); pasang(); } }); },
      konfigurasi(c) { if (!el() || !c) return; siteKey = c.site_key || ""; if (!c.aktif) { tutup(); return; } if (!tiket()) { buka(); pasang(); } },
      ulangi(aksi) { try { sessionStorage.removeItem(KUNCI); } catch (e) {} menunggu = aksi || null; buka(); pasang(); },
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
    pendengar.forEach(f => { try { f(cfg); } catch (e) {} });
  }
  async function muatKonfigurasi() {
    try { const s = JSON.parse(localStorage.getItem(KUNCI_CFG) || "null"); if (s && s.cfg && Date.now() - s.t < 7 * 86400000) terapkan(s.cfg); } catch (e) {}
    try {
      const res = await fetch(API_URL + "?aksi=konfigurasi"); const cfg = await res.json();
      if (cfg && cfg.success !== false) { terapkan(cfg); try { localStorage.setItem(KUNCI_CFG, JSON.stringify({ t: Date.now(), cfg: cfg })); } catch (e) {} }
    } catch (e) { Gerbang.gagalMuat(); }
  }

  window.SKALA = { API_URL, $, $$, esc, rp, toast, waLink, formatWa, hitungNaik, amatiReveal, Gerbang, kurangiGerak,
    padaKonfigurasi: f => pendengar.push(f),
    mulai(opsi = {}) { pasangHeader(); if (opsi.captcha) Gerbang.mulai(); amatiReveal(); muatKonfigurasi(); } };
})();
