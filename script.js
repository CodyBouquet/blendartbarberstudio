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
    },
    {
      name: "Dominic",
      role: "barber",
      google: "",
      url: "https://www.fresha.com/providers/blendart-barber-studio-rr5i6qng",
      urlLabel: "Book on Fresha",
    },
    {
      name: "Mo",
      role: "barber",
      google: "",
      url: "https://www.fresha.com/providers/blendart-barber-studio-rr5i6qng",
      urlLabel: "Book on Fresha",
    },
    {
      name: "Ashley",
      role: "barber",
      google: "",
      url: "https://app.thecut.co/barbers/barberashley",
      urlLabel: "Book on theCut",
    },
    {
      name: "Christina",
      role: "barber",
      google: "",
      url: "https://booksy.com/en-us/709062_lady-barber-smalls_barber-shop_19304_frankfort",
      urlLabel: "Book on Booksy",
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
