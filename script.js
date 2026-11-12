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
   Room rates and inventory below are DEMO / example figures approved
   for this site, not confirmed hotel rates.
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
  rooms: {
    double: {
      name: "Double Room",
      rate: 1200,
      inventory: 6,
      sleeps: 2,
      summary: "Double bed, walk-in shower, 25 m², sleeps 2"
    },
    twin: {
      name: "Twin Room",
      rate: 1200,
      inventory: 5,
      sleeps: 2,
      summary: "Two single beds, 25 m², sleeps 2"
    },
    presidential: {
      name: "Presidential Suite",
      rate: 2500,
      inventory: 2,
      sleeps: 2,
      summary: "King bed, hot tub, 30 m², sleeps 2"
    }
  },
  facebook: ""                         // full URL of the hotel's Facebook page, if any
};
/* ===================================================================== */

const STORAGE_KEY = "fatmols-demo-bookings-v1";
const SEED_KEY = "fatmols-demo-seeded-v1";

(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const phones = (CONFIG.phones || []).filter(p => p && p.tel);
  const toTel = t => "tel:" + String(t).replace(/[^\d+]/g, "");
  const wa = (CONFIG.whatsapp || "").replace(/\D/g, "");
  const email = (CONFIG.email || "").trim();
  const waLink = msg => "https://wa.me/" + wa + "?text=" + encodeURIComponent(msg);
  const rooms = CONFIG.rooms || {};

  const pad = n => String(n).padStart(2, "0");
  const isoDate = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const todayISO = () => isoDate(new Date());
  const parseISO = iso => new Date(iso + "T00:00:00");
  const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return isoDate(d); };
  const nightsBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);
  const eachNight = (checkIn, checkOut) => {
    const out = [];
    let cur = checkIn;
    while (cur < checkOut) { out.push(cur); cur = addDays(cur, 1); }
    return out;
  };
  const fmtDate = iso => parseISO(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const kwacha = n => "K" + Math.round(Number(n) || 0).toLocaleString("en-US");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

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

  // Room rates + per-room booking links
  $$(".room").forEach(card => {
    const id = card.dataset.room;
    const room = rooms[id];
    const p = card.querySelector(".rate");
    if (p && room) {
      p.innerHTML = "<strong>" + kwacha(room.rate) + "</strong> / night <span class=\"example-flag\">Example price</span>";
    }
    const b = card.querySelector(".room-book");
    if (b) b.addEventListener("click", () => {
      const sel = $("#f-room");
      if (sel && id) sel.value = id;
      updateSummary();
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

  // ---------- Demo inventory (localStorage) ----------
  function loadBookings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }
  function saveBookings(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* private mode */ }
  }
  function seedBookings() {
    try {
      if (localStorage.getItem(SEED_KEY)) return;
    } catch (e) { return; }
    const start = addDays(todayISO(), 10);
    const end = addDays(todayISO(), 13);
    const seeds = [
      { ref: "FCH-SEED01", roomId: "presidential", checkIn: start, checkOut: end, guests: 2, name: "Demo Guest A", phone: "0970000001", email: "", notes: "", nights: 3, total: 7500, payment: "Card (demo)", createdAt: new Date().toISOString(), seeded: true },
      { ref: "FCH-SEED02", roomId: "presidential", checkIn: start, checkOut: end, guests: 2, name: "Demo Guest B", phone: "0970000002", email: "", notes: "", nights: 3, total: 7500, payment: "Airtel Money (demo)", createdAt: new Date().toISOString(), seeded: true }
    ];
    const existing = loadBookings();
    const have = new Set(existing.map(b => b.ref));
    seeds.forEach(s => { if (!have.has(s.ref)) existing.push(s); });
    saveBookings(existing);
    try { localStorage.setItem(SEED_KEY, "1"); } catch (e) { /* ignore */ }
  }
  function occupiedOn(roomId, night, bookings) {
    return bookings.filter(b => b.roomId === roomId && b.checkIn <= night && night < b.checkOut).length;
  }
  function availability(roomId, checkIn, checkOut) {
    const room = rooms[roomId];
    if (!room) return { ok: false, reason: "Please choose a room type." };
    const nights = eachNight(checkIn, checkOut);
    if (!nights.length) return { ok: false, reason: "Check-out must be after check-in." };
    const bookings = loadBookings();
    for (let i = 0; i < nights.length; i++) {
      if (occupiedOn(roomId, nights[i], bookings) >= room.inventory) {
        return { ok: false, soldOut: true, reason: "Sold out for those dates" };
      }
    }
    return { ok: true, nights: nights.length };
  }
  function makeRef() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    const arr = new Uint8Array(6);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
    else for (let i = 0; i < 6; i++) arr[i] = Math.floor(Math.random() * 256);
    for (let i = 0; i < 6; i++) s += chars[arr[i] % chars.length];
    return "FCH-" + s;
  }

  // ---------- Direct booking flow ----------
  seedBookings();

  const form = $("#booking-form");
  const confirmEl = $("#book-confirm");
  let currentStep = 1;

  function val(id) { const el = $(id); return el ? (el.value || "").trim() : ""; }

  function stayState() {
    const checkIn = val("#f-in");
    const checkOut = val("#f-out");
    const roomId = val("#f-room");
    const guests = parseInt(val("#f-guests"), 10) || 0;
    const room = rooms[roomId];
    const today = todayISO();
    const result = { checkIn, checkOut, roomId, room, guests, today };
    if (!checkIn || !checkOut) { result.error = "Please choose a check-in and check-out date."; return result; }
    if (checkIn < today) { result.error = "Check-in cannot be in the past."; return result; }
    if (checkOut <= checkIn) { result.error = "Check-out must be after check-in. Please stay at least 1 night."; return result; }
    const n = nightsBetween(checkIn, checkOut);
    if (n < 1) { result.error = "Check-out must be after check-in. Please stay at least 1 night."; return result; }
    result.nights = n;
    if (!room) { result.error = "Please choose a room type."; return result; }
    if (guests < 1) { result.error = "Please choose the number of guests."; return result; }
    if (guests > room.sleeps) {
      result.error = room.name + " sleeps " + room.sleeps + ". For a larger group, send us a WhatsApp enquiry.";
      return result;
    }
    const avail = availability(roomId, checkIn, checkOut);
    if (!avail.ok) { result.error = avail.reason; result.soldOut = !!avail.soldOut; return result; }
    result.total = n * room.rate;
    result.ok = true;
    return result;
  }

  function showError(id, msg) {
    const el = $(id);
    if (!el) return;
    if (msg) { el.textContent = msg; el.hidden = false; }
    else { el.textContent = ""; el.hidden = true; }
  }

  function updateSummary() {
    const empty = $("#book-summary-empty");
    const details = $("#book-summary-details");
    const avail = $("#book-avail");
    const next = $("#step1-next");
    const s = stayState();
    if (!val("#f-in") && !val("#f-out") && !val("#f-room")) {
      if (empty) empty.hidden = false;
      if (details) { details.hidden = true; details.innerHTML = ""; }
      if (avail) avail.hidden = true;
      showError("#step1-error", "");
      return;
    }
    if (empty) empty.hidden = true;
    if (details) {
      details.hidden = false;
      const rows = [];
      if (s.checkIn) rows.push(["Check-in", fmtDate(s.checkIn)]);
      if (s.checkOut) rows.push(["Check-out", fmtDate(s.checkOut)]);
      if (s.nights) rows.push(["Nights", String(s.nights)]);
      if (s.guests) rows.push(["Guests", String(s.guests)]);
      if (s.room) {
        rows.push(["Room", s.room.name]);
        rows.push(["Rate", kwacha(s.room.rate) + " / night"]);
      }
      if (s.ok) rows.push(["Total", kwacha(s.total)]);
      details.innerHTML = rows.map(([k, v], i) => {
        const cls = k === "Total" ? ' class="is-total"' : "";
        return "<div" + cls + "><dt>" + esc(k) + "</dt><dd>" + esc(v) + "</dd></div>";
      }).join("") + (s.room ? '<p class="example-flag summary-flag">Example prices for this demo</p>' : "");
    }
    if (avail) {
      if (s.soldOut) {
        avail.hidden = false;
        avail.className = "book-avail is-soldout";
        avail.textContent = "Sold out for those dates";
      } else if (s.ok) {
        avail.hidden = false;
        avail.className = "book-avail is-ok";
        avail.textContent = s.room.name + " is available · " + s.nights + " night" + (s.nights > 1 ? "s" : "") + " · " + kwacha(s.total);
      } else {
        avail.hidden = true;
      }
    }
    if (next) next.disabled = !s.ok;
    if (s.error && (s.soldOut || (val("#f-in") && val("#f-out")))) showError("#step1-error", s.error);
    else showError("#step1-error", "");
  }

  function showStep(n) {
    currentStep = n;
    $$(".book-step").forEach(p => { p.hidden = String(p.dataset.stepPanel) !== String(n); });
    $$(".book-steps li").forEach(li => {
      const step = Number(li.dataset.step);
      li.classList.toggle("is-current", step === n);
      li.classList.toggle("is-done", step < n);
    });
    if (form) form.hidden = n === 4;
    if (confirmEl) confirmEl.hidden = n !== 4;
    if (n === 4) document.body.classList.add("confirming");
    else document.body.classList.remove("confirming");
    const panel = n === 4 ? confirmEl : $('[data-step-panel="' + n + '"]');
    if (panel) {
      const focusable = panel.querySelector("input, select, textarea, button, a");
      if (focusable) focusable.focus();
    }
  }

  function paymentLabel(method) {
    if (method === "airtel") return "Airtel Money (demo)";
    if (method === "mtn") return "MTN Mobile Money (demo)";
    return "Card (demo)";
  }

  function selectedPayMethod() {
    const el = $("input[name='pay-method']:checked");
    return el ? el.value : "card";
  }

  function togglePayFields() {
    const method = selectedPayMethod();
    const card = $("#pay-card");
    const momo = $("#pay-momo");
    if (card) card.hidden = method !== "card";
    if (momo) momo.hidden = method === "card";
  }

  function validatePay() {
    const method = selectedPayMethod();
    if (method === "card") {
      const name = val("#f-card-name");
      const num = val("#f-card-num").replace(/\s+/g, "");
      const exp = val("#f-card-exp");
      const cvv = val("#f-card-cvv");
      if (!name) return "Please enter the name on the card.";
      if (!/^\d{13,19}$/.test(num)) return "Enter a test card number (13–19 digits). Nothing is charged.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) return "Enter a test expiry as MM/YY.";
      if (!/^\d{3,4}$/.test(cvv)) return "Enter a test CVV (3 or 4 digits).";
      return "";
    }
    const phone = val("#f-momo");
    if (phone.replace(/\D/g, "").length < 9) return "Enter a test mobile money number. Nothing is charged.";
    return "";
  }

  function confirmationMessage(b) {
    return "Hello " + CONFIG.hotelName + ", here is my booking confirmation.\n\n" +
      "Reference: " + b.ref + "\n" +
      "Name: " + b.name + "\n" +
      "Phone: " + b.phone + "\n" +
      (b.email ? "Email: " + b.email + "\n" : "") +
      "Room: " + (rooms[b.roomId] ? rooms[b.roomId].name : b.roomId) + "\n" +
      "Check-in: " + fmtDate(b.checkIn) + "\n" +
      "Check-out: " + fmtDate(b.checkOut) + " (" + b.nights + " night" + (b.nights > 1 ? "s" : "") + ")\n" +
      "Guests: " + b.guests + "\n" +
      "Total: " + kwacha(b.total) + " (example demo price)\n" +
      "Payment: " + b.payment + "\n" +
      (b.notes ? "Requests: " + b.notes + "\n" : "") +
      "\nThis was booked on the demo website.";
  }

  function showConfirmation(b) {
    $("#c-ref").textContent = b.ref;
    const rows = [
      ["Guest", b.name],
      ["Phone", b.phone],
      b.email ? ["Email", b.email] : null,
      ["Room", rooms[b.roomId] ? rooms[b.roomId].name : b.roomId],
      ["Check-in", fmtDate(b.checkIn) + " (from 14:00)"],
      ["Check-out", fmtDate(b.checkOut) + " (07:30 – 10:00)"],
      ["Guests", String(b.guests)],
      ["Nights", String(b.nights)],
      ["Total", kwacha(b.total) + " (example price)"],
      ["Payment", b.payment],
      b.notes ? ["Requests", b.notes] : null
    ].filter(Boolean);
    $("#confirm-dl").innerHTML = rows.map(([k, v]) => "<div><dt>" + esc(k) + "</dt><dd>" + esc(v) + "</dd></div>").join("");
    const waBtn = $("#c-whatsapp");
    if (waBtn) {
      if (wa) { waBtn.href = waLink(confirmationMessage(b)); waBtn.hidden = false; }
      else waBtn.hidden = true;
    }
    showStep(4);
    confirmEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (form) {
    const ci = $("#f-in"), co = $("#f-out");
    const today = todayISO();
    ci.min = today;
    co.min = addDays(today, 1);
    const onDates = () => {
      if (ci.value) co.min = addDays(ci.value, 1);
      else co.min = addDays(today, 1);
      if (co.value && ci.value && co.value <= ci.value) co.value = "";
      updateSummary();
    };
    ci.addEventListener("change", onDates);
    co.addEventListener("change", onDates);
    $("#f-room").addEventListener("change", updateSummary);
    $("#f-guests").addEventListener("change", updateSummary);

    $("#step1-next").addEventListener("click", () => {
      const s = stayState();
      if (!s.ok) { showError("#step1-error", s.error || "Please fill in your dates and room type."); return; }
      showError("#step1-error", "");
      showStep(2);
    });
    $("#step2-back").addEventListener("click", () => showStep(1));
    $("#step2-next").addEventListener("click", () => {
      const name = val("#f-name");
      const phone = val("#f-phone");
      const em = val("#f-email");
      if (!name) { showError("#step2-error", "Please enter your full name."); $("#f-name").focus(); return; }
      if (phone.replace(/\D/g, "").length < 9) { showError("#step2-error", "Please enter a valid phone number."); $("#f-phone").focus(); return; }
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showError("#step2-error", "Please enter a valid email, or leave it blank."); $("#f-email").focus(); return; }
      const s = stayState();
      if (!s.ok) { showError("#step2-error", s.error || "Those dates are no longer available."); showStep(1); return; }
      showError("#step2-error", "");
      if (val("#f-card-name") === "") $("#f-card-name").value = name;
      showStep(3);
    });
    $("#step3-back").addEventListener("click", () => showStep(2));
    $$("input[name='pay-method']").forEach(r => r.addEventListener("change", togglePayFields));
    togglePayFields();

    const cardNum = $("#f-card-num");
    if (cardNum) cardNum.addEventListener("input", () => {
      const digits = cardNum.value.replace(/\D/g, "").slice(0, 16);
      cardNum.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    });
    const exp = $("#f-card-exp");
    if (exp) exp.addEventListener("input", () => {
      let v = exp.value.replace(/\D/g, "").slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
      exp.value = v;
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      const s = stayState();
      if (!s.ok) { showError("#step3-error", s.error || "Those dates are no longer available."); showStep(1); return; }
      const payErr = validatePay();
      if (payErr) { showError("#step3-error", payErr); return; }
      showError("#step3-error", "");
      const payBtn = $("#pay-btn");
      const status = $("#pay-status");
      payBtn.disabled = true;
      $("#step3-back").disabled = true;
      status.hidden = false;
      status.textContent = "Processing demo payment…";
      window.setTimeout(() => {
        // Re-check inventory in case another booking landed in this tab's storage
        const again = stayState();
        if (!again.ok) {
          payBtn.disabled = false;
          $("#step3-back").disabled = false;
          status.hidden = true;
          showError("#step3-error", again.error || "Sold out for those dates");
          if (again.soldOut) showStep(1);
          return;
        }
        const booking = {
          ref: makeRef(),
          roomId: again.roomId,
          checkIn: again.checkIn,
          checkOut: again.checkOut,
          guests: again.guests,
          name: val("#f-name"),
          phone: val("#f-phone"),
          email: val("#f-email"),
          notes: val("#f-notes"),
          nights: again.nights,
          total: again.total,
          payment: paymentLabel(selectedPayMethod()),
          createdAt: new Date().toISOString()
        };
        const list = loadBookings();
        list.push(booking);
        saveBookings(list);
        status.hidden = true;
        payBtn.disabled = false;
        $("#step3-back").disabled = false;
        showConfirmation(booking);
      }, 900);
    });

    $("#c-print").addEventListener("click", () => window.print());
    $("#c-new").addEventListener("click", () => {
      form.reset();
      const t = todayISO();
      ci.min = t;
      co.min = addDays(t, 1);
      $$("input[name='pay-method']").forEach(r => { r.checked = r.value === "card"; });
      togglePayFields();
      updateSummary();
      showStep(1);
      $("#booking").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    updateSummary();
  }

  // WhatsApp enquiry (secondary)
  const enquiry = $("#enquiry-form");
  if (enquiry) {
    const today = todayISO();
    const ei = $("#e-in"), eo = $("#e-out"), err = $("#enquiry-error");
    ei.min = today; eo.min = addDays(today, 1);
    ei.addEventListener("change", () => { eo.min = ei.value ? addDays(ei.value, 1) : addDays(today, 1); if (eo.value && ei.value && eo.value <= ei.value) eo.value = ""; });
    const enquiryAlt = $("#enquiry-alt");
    if (enquiryAlt) enquiryAlt.addEventListener("toggle", () => {
      if (!enquiryAlt.open) return;
      if (!ei.value && val("#f-in")) ei.value = val("#f-in");
      if (!eo.value && val("#f-out")) eo.value = val("#f-out");
      if (val("#f-room") && rooms[val("#f-room")]) $("#e-room").value = rooms[val("#f-room")].name;
      if (!val("#e-name") && val("#f-name")) $("#e-name").value = val("#f-name");
      if (!val("#e-phone") && val("#f-phone")) $("#e-phone").value = val("#f-phone");
      if (!val("#e-notes") && val("#f-notes")) $("#e-notes").value = val("#f-notes");
      if (val("#f-guests")) $("#e-guests").value = val("#f-guests");
    });
    enquiry.addEventListener("submit", e => {
      e.preventDefault();
      const v = id => ($(id).value || "").trim();
      if (!enquiry.checkValidity() || !v("#e-in") || !v("#e-out") || !v("#e-room") || !v("#e-name")) {
        enquiry.reportValidity();
        err.textContent = "Please fill in your dates, room type and name.";
        err.hidden = false;
        return;
      }
      if (v("#e-out") <= v("#e-in")) { err.textContent = "Check-out must be after check-in."; err.hidden = false; return; }
      err.hidden = true;
      const n = nightsBetween(v("#e-in"), v("#e-out"));
      const msg = "Hello " + CONFIG.hotelName + ", I would like to book a room.\n\n" +
        "Name: " + v("#e-name") + "\n" +
        (v("#e-phone") ? "Phone: " + v("#e-phone") + "\n" : "") +
        "Check-in: " + fmtDate(v("#e-in")) + "\n" +
        "Check-out: " + fmtDate(v("#e-out")) + " (" + n + " night" + (n > 1 ? "s" : "") + ")\n" +
        "Guests: " + v("#e-guests") + "\n" +
        "Room type: " + v("#e-room") + "\n" +
        (v("#e-notes") ? "Notes: " + v("#e-notes") + "\n" : "") +
        "\nPlease confirm availability and rates. Thank you.";
      if (wa) window.open(waLink(msg), "_blank", "noopener");
    });
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
