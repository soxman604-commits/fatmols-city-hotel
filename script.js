/* =====================================================================
   FATMOLS CITY HOTEL - SITE CONFIG
   Edit these values, then redeploy. Leave a value as "" (or a list
   empty) to show a graceful "Coming soon" placeholder instead.
   Sources for the current values (checked 2 Oct 2026):
   - phone +260 765 206420: fatmolshotels.com contact block + Google Maps
     listing "Fatmols City Hotels"  -> CONFIRM it reaches the Ndola branch
   - whatsapp: PROVISIONAL, same number; not confirmed as a WhatsApp line
   - address: Booking.com + Google Maps listing
   - check-in/out times: Booking.com listing -> CONFIRM
   - email: none confirmed for this branch (fatmolshotels.com shows
     "salesandmarketing@gmail.com", which looks incomplete), so left blank
   ===================================================================== */
const CONFIG = {
  hotelName: "Fatmols City Hotel",
  phones: [
    { display: "+260 765 206 420", tel: "+260765206420" }
  ],
  whatsapp: "260765206420",            // digits only, international format (provisional)
  email: "",                           // e.g. "reservations@fatmolshotels.com"
  address: "Plot 36213, Kitwe Road (Ndola–Kitwe dual carriageway), opposite Levy Mwanawasa Stadium, Ndola, Zambia",
  mapQuery: "-12.969644,28.613599",    // Google Maps listing coordinates
  checkIn: "From 14:00",
  checkOut: "07:30 – 10:00",
  reception: "24-hour front desk",
  // Room rates per night, keyed by room id below, e.g. { charlotte: "K850" }.
  // Rooms without a rate show "Ask for rates".
  rates: {},
  facebook: ""                         // full URL of the hotel's Facebook page, if any
};
/* ===================================================================== */

(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const phones = (CONFIG.phones || []).filter(p => p && p.tel);
  const toTel = t => "tel:" + String(t).replace(/[^\d+]/g, "");
  const wa = (CONFIG.whatsapp || "").replace(/\D/g, "");
  const email = (CONFIG.email || "").trim();
  const waLink = msg => "https://wa.me/" + wa + "?text=" + encodeURIComponent(msg);

  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  const set = (key, html, href) => $$('[data-contact="' + key + '"]').forEach(el => {
    if (html) { el.innerHTML = href ? '<a href="' + href + '">' + html + "</a>" : html; el.classList.remove("pending"); }
    else { el.textContent = "Coming soon"; el.classList.add("pending"); }
  });
  $$('[data-contact="phone"]').forEach(el => {
    if (!phones.length) { el.textContent = "Coming soon"; el.classList.add("pending"); return; }
    el.textContent = "";
    phones.forEach((p, i) => {
      if (i) el.appendChild(document.createTextNode(" / "));
      const a = document.createElement("a"); a.href = toTel(p.tel); a.textContent = p.display || p.tel; el.appendChild(a);
    });
  });
  const waPhone = phones.find(p => String(p.tel).replace(/\D/g, "") === wa);
  set("whatsapp", wa ? (waPhone ? waPhone.display : "+" + wa) : "", wa ? "https://wa.me/" + wa : "");
  set("email", email, email ? "mailto:" + email : "");
  set("address", CONFIG.address);
  set("checkin", CONFIG.checkIn);
  set("checkout", CONFIG.checkOut);
  set("reception", CONFIG.reception);
  if (CONFIG.facebook) set("facebook", "Facebook page", CONFIG.facebook); else $$('[data-contact="facebook"]').forEach(e => e.closest("li") && e.closest("li").remove());

  // Buttons
  $$("[data-wa]").forEach(el => {
    if (wa) { el.href = waLink("Hello " + CONFIG.hotelName + ", I would like to make a booking enquiry."); el.hidden = false; }
    else if (el.dataset.wa === "primary") { el.href = "#booking"; el.textContent = "Booking enquiry"; }
    else el.hidden = true;
  });
  $$("[data-call]").forEach(el => {
    if (phones.length) { el.href = toTel(phones[0].tel); el.hidden = false; }
    else if (el.dataset.call === "primary") { el.href = "#contact"; el.textContent = "Contact us"; }
    else el.hidden = true;
  });
  $$("[data-email]").forEach(el => { if (email) { el.href = "mailto:" + email; el.hidden = false; } else el.hidden = true; });

  // Room rates + per-room enquiry links
  $$(".room").forEach(card => {
    const id = card.dataset.room, name = card.querySelector("h3").textContent;
    const r = (CONFIG.rates || {})[id];
    const p = card.querySelector(".rate");
    if (p) p.innerHTML = r ? "<strong>" + r + "</strong> / night" : "Ask for rates";
    const b = card.querySelector(".room-book");
    if (b) b.addEventListener("click", () => {
      const sel = $("#f-room"); if (sel) sel.value = name;
    });
  });

  // Map
  const map = $("#map");
  if (map && CONFIG.mapQuery) {
    const q = encodeURIComponent(CONFIG.mapQuery);
    map.innerHTML = '<iframe title="Map showing Fatmols City Hotel, Ndola" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + q + '&z=15&output=embed"></iframe>';
    $$("[data-directions]").forEach(a => a.href = "https://www.google.com/maps/search/?api=1&query=" + q);
  }

  // Mobile menu
  const btn = $(".menu-btn"), menu = $("#menu");
  if (btn && menu) {
    btn.addEventListener("click", () => { const o = menu.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
    $$("a", menu).forEach(a => a.addEventListener("click", () => { menu.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }));
  }

  // Booking form -> WhatsApp / email
  const form = $("#booking-form");
  if (form) {
    const today = new Date().toISOString().slice(0, 10);
    const ci = $("#f-in"), co = $("#f-out"), err = $(".form-error");
    ci.min = today; co.min = today;
    ci.addEventListener("change", () => { co.min = ci.value || today; if (co.value && co.value <= ci.value) co.value = ""; });
    const compose = () => {
      const v = id => ($(id).value || "").trim();
      if (!form.checkValidity()) { form.reportValidity(); err.hidden = false; return null; }
      if (v("#f-out") <= v("#f-in")) { err.textContent = "Check-out must be after check-in."; err.hidden = false; return null; }
      err.hidden = true;
      const fmt = d => new Date(d + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
      const nights = Math.round((new Date(v("#f-out")) - new Date(v("#f-in"))) / 864e5);
      return "Hello " + CONFIG.hotelName + ", I would like to book a room.\n\n" +
        "Name: " + v("#f-name") + "\n" +
        (v("#f-phone") ? "Phone: " + v("#f-phone") + "\n" : "") +
        "Check-in: " + fmt(v("#f-in")) + "\n" +
        "Check-out: " + fmt(v("#f-out")) + " (" + nights + " night" + (nights > 1 ? "s" : "") + ")\n" +
        "Guests: " + v("#f-guests") + "\n" +
        "Rooms: " + v("#f-rooms") + "\n" +
        "Room type: " + v("#f-room") + "\n" +
        (v("#f-notes") ? "Notes: " + v("#f-notes") + "\n" : "") +
        "\nPlease confirm availability and rates. Thank you.";
    };
    const sendWa = $("#send-wa"), sendEm = $("#send-email"), fb = $(".form-fallback");
    if (!wa) sendWa.hidden = true;
    if (!email) sendEm.hidden = true;
    if (!wa && !email) fb.hidden = false;
    form.addEventListener("submit", e => { e.preventDefault(); const m = compose(); if (m && wa) window.open(waLink(m), "_blank", "noopener"); });
    sendEm.addEventListener("click", () => { const m = compose(); if (m && email) location.href = "mailto:" + email + "?subject=" + encodeURIComponent("Booking enquiry") + "&body=" + encodeURIComponent(m); });
    const copy = $(".copy-btn");
    if (copy) copy.addEventListener("click", async () => { const m = compose(); if (!m) return; try { await navigator.clipboard.writeText(m); copy.textContent = "Copied ✓"; } catch (_) { copy.textContent = "Copy failed"; } });
  }

  // Gallery lightbox
  const items = $$(".g-item"), lb = $(".lightbox");
  if (items.length && lb) {
    const img = $("img", lb), cap = $("figcaption", lb); let i = 0;
    const show = n => { i = (n + items.length) % items.length; const it = items[i]; img.src = it.dataset.full; img.alt = it.querySelector("img").alt; cap.textContent = it.dataset.caption || ""; };
    items.forEach((it, n) => it.addEventListener("click", () => { show(n); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lb-close", lb).focus(); }));
    const close = () => { lb.hidden = true; document.body.style.overflow = ""; items[i].focus(); };
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", () => show(i - 1));
    $(".lb-next", lb).addEventListener("click", () => show(i + 1));
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    document.addEventListener("keydown", e => { if (lb.hidden) return; if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(i - 1); if (e.key === "ArrowRight") show(i + 1); });
  }

  // Header shadow / reveal
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    $$(".reveal").forEach(el => io.observe(el));
  } else $$(".reveal").forEach(el => el.classList.add("in"));
})();
