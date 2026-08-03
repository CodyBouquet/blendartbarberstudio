/* ============================================================
   blendART Barber Studio — booking configuration
   ------------------------------------------------------------
   GOOGLE SCHEDULING SETUP (one line per calendar):

   1. In Google Calendar, open the appointment schedule
      (each artist can have their own, or the studio one).
   2. Click "Share" → copy the booking page link. It looks like:
      https://calendar.google.com/calendar/appointments/schedules/AcZs...
   3. Paste it into `google:` below — for the studio and/or any
      artist. Anyone with a google link gets an embedded calendar
      right on this page; artists without one fall back to the
      external booking link in `url:`.
   ============================================================ */

const BOOKING = {
  studio: {
    name: "Any artist",
    // Paste the studio-wide Google appointment schedule link here:
    google: "",
  },
  artists: [
    {
      name: "Marlowe",
      role: "owner / master barber",
      google: "", // paste Marlowe's Google appointment schedule link here
      url: "https://www.fresha.com/providers/blendart-barber-studio-rr5i6qng",
      urlLabel: "Book on Fresha",
      menuSource: "Fresha",
      services: [
        { name: "Men's haircut", note: "30 min", price: "$35" },
        { name: "High school teen", note: "30 min", price: "$30" },
        { name: "Kids 12 & under / seniors 65+", note: "30 min", price: "$25" },
        { name: "Haircut + beard / goatee trim", note: "1 hr", price: "$45" },
        { name: "Haircut + hot towel shave", note: "1 hr", price: "$55" },
      ],
    },
    {
      name: "Dominic",
      role: "barber",
      google: "",
      url: "https://www.fresha.com/providers/blendart-barber-studio-rr5i6qng",
      urlLabel: "Book on Fresha",
      menuSource: "Fresha",
      services: [
        { name: "Men's haircut", note: "30 min", price: "$35" },
        { name: "High school teen", note: "30 min", price: "$30" },
        { name: "Kids 12 & under / seniors 65+", note: "30 min", price: "$25" },
        { name: "Haircut + beard / goatee trim", note: "1 hr", price: "$45" },
        { name: "Haircut + hot towel shave", note: "1 hr", price: "$55" },
      ],
    },
    {
      name: "Mo",
      role: "barber",
      google: "",
      url: "https://www.fresha.com/providers/blendart-barber-studio-rr5i6qng",
      urlLabel: "Book on Fresha",
      menuSource: "",
      services: null, // no public menu online yet
    },
    {
      name: "Ashley",
      role: "barber",
      google: "",
      url: "https://app.thecut.co/barbers/barberashley",
      urlLabel: "Book on theCut",
      menuSource: "theCut",
      services: null, // theCut menu is behind their app — link out for live prices
    },
    {
      name: "Christina",
      role: "barber",
      google: "",
      url: "https://booksy.com/en-us/709062_lady-barber-smalls_barber-shop_19304_frankfort",
      urlLabel: "Book on Booksy",
      menuSource: "Booksy",
      services: [
        { name: "Haircut", note: "45 min", price: "$35" },
        { name: "Women's undercut", note: "35 min", price: "$25" },
        { name: "Kids 10 & under", note: "45 min — excludes specialty styles", price: "$30" },
        { name: "Haircut + beard", note: "1 hr 15 min", price: "$50+" },
        { name: "Haircut + beard + wax", note: "1 hr 20 min — nose, ear & brows", price: "$55" },
        { name: "Wax + eyebrows", note: "10 min", price: "$5" },
      ],
    },
  ],
};

/* ---------- helpers ---------- */

// Google embeds want ?gv=true appended to the booking-page link.
function googleEmbedSrc(link) {
  return link + (link.includes("?") ? "&" : "?") + "gv=true";
}

function bookHref(artist) {
  return artist.google || artist.url;
}

/* ---------- price menu (per-artist) ---------- */

const menuTabsEl = document.getElementById("menu-tabs");
const menuEl = document.getElementById("menu");
const menuSourceEl = document.getElementById("menu-source");
let currentMenuArtist = 0; // default: Marlowe

function renderMenuTabs() {
  menuTabsEl.innerHTML = BOOKING.artists
    .map(
      (a, i) => `
      <button class="menu-tab" role="tab" id="menu-tab-${i}"
        aria-selected="${i === currentMenuArtist}" aria-controls="menu">
        ${a.name}
      </button>`
    )
    .join("");
}

function renderMenu() {
  const a = BOOKING.artists[currentMenuArtist];

  if (a.services && a.services.length) {
    menuEl.innerHTML = a.services
      .map(
        (s) => `
        <li class="menu-item">
          <div class="menu-name"><h3>${s.name}</h3><p>${s.note}</p></div>
          <span class="menu-price marker">${s.price}</span>
        </li>`
      )
      .join("");
    menuSourceEl.innerHTML = a.menuSource
      ? `${a.name}'s menu, live from ${a.menuSource} —
         <a href="${bookHref(a)}" target="_blank" rel="noopener">lock it in</a>.`
      : "";
  } else {
    menuEl.innerHTML = `
      <li class="menu-item menu-item-empty">
        <div class="menu-name">
          <h3>${a.name}'s menu lives on ${a.menuSource || "their book"}</h3>
          <p>${
            a.menuSource
              ? `Live services and prices are on ${a.menuSource} — one tap away.`
              : "Prices aren't posted online yet. Call the studio and we'll sort you out."
          }</p>
        </div>
        <a class="btn btn-outline btn-small" href="${a.menuSource ? bookHref(a) : "tel:+17089951059"}"
           ${a.menuSource ? 'target="_blank" rel="noopener"' : ""}>
          ${a.menuSource ? a.urlLabel : "Call 708.995.1059"}
        </a>
      </li>`;
    menuSourceEl.innerHTML = "";
  }
}

function selectMenuTab(i) {
  currentMenuArtist = i;
  renderMenuTabs();
  renderMenu();
}

if (menuTabsEl && menuEl) {
  menuTabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".menu-tab");
    if (tab) selectMenuTab(Number(tab.id.replace("menu-tab-", "")));
  });
  selectMenuTab(0);
}

/* ---------- artist cards ---------- */

const grid = document.getElementById("artist-grid");
if (grid) {
  grid.innerHTML = BOOKING.artists
    .map(
      (a, i) => `
      <li class="artist-card">
        <h3>${a.name}</h3>
        <p class="artist-role">${a.role}</p>
        <a class="btn" href="#book" data-artist="${i}">Book with ${a.name}</a>
      </li>`
    )
    .join("");

  grid.addEventListener("click", (e) => {
    const link = e.target.closest("[data-artist]");
    if (link) selectTab(Number(link.dataset.artist) + 1); // +1: tab 0 is "Any artist"
  });
}

/* ---------- booking tabs + panel ---------- */

const tabsEl = document.getElementById("book-tabs");
const panelEl = document.getElementById("book-panel");
const bookables = [BOOKING.studio, ...BOOKING.artists];
let currentTab = 0;

function renderTabs() {
  tabsEl.innerHTML = bookables
    .map(
      (b, i) => `
      <button class="book-tab" role="tab" id="tab-${i}"
        aria-selected="${i === currentTab}" aria-controls="book-panel">
        ${b.name}
      </button>`
    )
    .join("");
}

function renderPanel() {
  const b = bookables[currentTab];
  if (b.google) {
    panelEl.innerHTML = `
      <iframe src="${googleEmbedSrc(b.google)}"
        title="Book an appointment with ${b.name} — Google Calendar"
        loading="lazy"></iframe>`;
  } else if (b.url) {
    panelEl.innerHTML = `
      <div class="book-external">
        <p>${b.name} keeps their book on ${b.urlLabel.replace("Book on ", "")} —
           live availability opens in a new tab.</p>
        <a class="btn btn-loud" href="${b.url}" target="_blank" rel="noopener">${b.urlLabel}</a>
      </div>`;
  } else {
    panelEl.innerHTML = `
      <div class="book-external">
        <p>Online booking is on its way. Call the studio and we'll get you on the list.</p>
        <a class="btn btn-loud" href="tel:+17089951059">Call 708.995.1059</a>
      </div>`;
  }
}

function selectTab(i) {
  currentTab = i;
  renderTabs();
  renderPanel();
}

if (tabsEl && panelEl) {
  tabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".book-tab");
    if (tab) selectTab(Number(tab.id.replace("tab-", "")));
  });
  selectTab(0);
}

/* ---------- footer year ---------- */

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
