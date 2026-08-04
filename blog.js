/* ============================================================
   blendART — blog page
   ------------------------------------------------------------
   Posts are written in the Vyrel Labs client portal and served
   by its public feed. This page fetches the feed at load time,
   so a publish shows up here within a minute — no redeploy.

   The post body arrives as HTML already rendered (and escaped)
   server-side by the same code that powers the portal preview,
   which is why innerHTML is safe for `post.html` and nothing
   else. Titles/excerpts — and every comment — are plain text
   and get escaped here.

   Comments POST to the same feed endpoint. The `website` field
   in the form is a honeypot: visually hidden, so a human never
   fills it and a bot usually does.
   ============================================================ */

const BLOG_API = "https://vyrellabs.com/api/blog";
const BLOG_SITE = "blendartbarberstudio";

const stateEl = document.getElementById("blog-state");
const contentEl = document.getElementById("blog-content");

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function niceDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

async function feed(params) {
  const url = BLOG_API + "?site=" + BLOG_SITE + (params || "");
  const res = await fetch(url);
  if (!res.ok && res.status !== 404) throw new Error("feed " + res.status);
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

/* ---------- views ---------- */

function renderList(posts) {
  if (!posts.length) {
    stateEl.textContent = "nothing posted yet — check back soon.";
    return;
  }
  stateEl.hidden = true;
  contentEl.innerHTML = posts.map((p) => `
    <article class="post-card">
      <p class="post-date marker">${escapeHtml(niceDate(p.publishedAt))}</p>
      <h3 class="post-title"><a href="blog.html?post=${encodeURIComponent(p.id)}">${escapeHtml(p.title)}</a></h3>
      ${p.excerpt ? `<p class="post-excerpt">${escapeHtml(p.excerpt)}</p>` : ""}
      <a class="btn btn-outline btn-small" href="blog.html?post=${encodeURIComponent(p.id)}">Read it →</a>
    </article>
  `).join("");
}

function renderPost(post, comments, commentsOn) {
  stateEl.hidden = true;
  document.title = post.title + " — blendART Barber Studio";

  // The canonical address of THIS post — what every share points at.
  const url = window.location.origin + window.location.pathname
    + "?post=" + encodeURIComponent(post.id);

  contentEl.innerHTML = `
    <article class="post-full">
      <p class="post-date marker">${escapeHtml(niceDate(post.publishedAt))}</p>
      <h1 class="post-heading">${escapeHtml(post.title)}</h1>
      <div class="post-body">${post.html || ""}</div>

      <div class="share-row">
        <span class="share-label marker">share this →</span>
        <a class="btn btn-outline btn-small" target="_blank" rel="noopener"
           href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}">Facebook</a>
        <a class="btn btn-outline btn-small" target="_blank" rel="noopener"
           href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}">X</a>
        <button type="button" class="btn btn-outline btn-small" id="share-copy">Copy link</button>
        <button type="button" class="btn btn-outline btn-small" id="share-native" hidden>More…</button>
      </div>

      ${commentsOn ? `
      <section class="comments" aria-label="Comments">
        <h2 class="comments-title">Comments</h2>
        <div id="comment-list">${renderComments(comments)}</div>

        <form id="comment-form" class="comment-form">
          <label class="comment-label">Name
            <input type="text" id="c-name" maxlength="60" required autocomplete="name">
          </label>
          <label class="comment-label">Comment
            <textarea id="c-text" maxlength="2000" rows="4" required></textarea>
          </label>
          <!-- honeypot — humans never see it, bots love it -->
          <input type="text" id="c-website" class="hp-field" tabindex="-1"
                 autocomplete="off" aria-hidden="true">
          <button type="submit" class="btn btn-loud btn-small" id="c-submit">Post comment</button>
          <p class="comment-msg marker" id="c-msg" role="status" aria-live="polite"></p>
        </form>
      </section>` : ""}

      <a class="btn btn-outline btn-small post-back" href="blog.html">← All posts</a>
    </article>
  `;

  wireShare(post, url);
  if (commentsOn) wireCommentForm(post);
}

function renderComments(comments) {
  if (!comments || !comments.length) {
    return `<p class="comment-empty marker">no comments yet — say something.</p>`;
  }
  return comments.map((c) => `
    <div class="comment">
      <p class="comment-who"><strong>${escapeHtml(c.name)}</strong>
        <span class="comment-when">${escapeHtml(niceDate(c.createdAt))}</span></p>
      <p class="comment-text">${escapeHtml(c.text)}</p>
    </div>
  `).join("");
}

/* ---------- sharing ---------- */

function wireShare(post, url) {
  const copyBtn = document.getElementById("share-copy");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      copyBtn.textContent = "Copied!";
    } catch (_) {
      // Clipboard can be blocked — fall back to the prompt dialog.
      window.prompt("Copy this link:", url);
    }
    setTimeout(() => { copyBtn.textContent = "Copy link"; }, 2000);
  });

  // The device's own share sheet (texts, IG, whatever's installed) —
  // only where the browser actually supports it, i.e. mostly phones.
  const nativeBtn = document.getElementById("share-native");
  if (navigator.share) {
    nativeBtn.hidden = false;
    nativeBtn.addEventListener("click", () => {
      navigator.share({ title: post.title, url }).catch(() => {});
    });
  }
}

/* ---------- comments ---------- */

function wireCommentForm(post) {
  const form = document.getElementById("comment-form");
  const msg = document.getElementById("c-msg");
  const submit = document.getElementById("c-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("c-name").value.trim();
    const text = document.getElementById("c-text").value.trim();
    if (!name || text.length < 2) {
      msg.textContent = "give it a name and a couple words first.";
      return;
    }

    submit.disabled = true;
    msg.textContent = "posting…";
    try {
      const res = await fetch(BLOG_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site: BLOG_SITE,
          post: post.id,
          name,
          text,
          website: document.getElementById("c-website").value,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "failed");

      // Show it immediately — the feed cache catches up within a minute.
      if (data.comment) {
        const list = document.getElementById("comment-list");
        const empty = list.querySelector(".comment-empty");
        if (empty) empty.remove();
        list.insertAdjacentHTML("beforeend", renderComments([data.comment]));
      }
      form.reset();
      msg.textContent = "posted. thanks!";
    } catch (_) {
      msg.textContent = "couldn't post that right now — try again in a minute.";
    }
    submit.disabled = false;
    setTimeout(() => { msg.textContent = ""; }, 4000);
  });
}

/* ---------- boot ---------- */

(async function init() {
  const postId = new URLSearchParams(window.location.search).get("post");
  try {
    if (postId) {
      const { status, data } = await feed("&post=" + encodeURIComponent(postId));
      if (status === 404 || !data.post) {
        stateEl.textContent = "that post is gone — here's everything else.";
        const list = await feed();
        renderList((list.data && list.data.posts) || []);
        stateEl.hidden = false;
        return;
      }
      renderPost(data.post, data.comments || [], data.commentsEnabled === true);
    } else {
      const { data } = await feed();
      renderList((data && data.posts) || []);
    }
  } catch (_) {
    stateEl.textContent = "couldn't load posts right now — try a refresh.";
  }
})();

document.getElementById("year").textContent = new Date().getFullYear();
