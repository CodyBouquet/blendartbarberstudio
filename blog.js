/* ============================================================
   blendART — blog page
   ------------------------------------------------------------
   Posts are written in the Vyrel Labs client portal and served
   by its public feed. This page fetches the feed at load time,
   so a publish shows up here within a minute — no redeploy.

   The post body arrives as HTML already rendered (and escaped)
   server-side by the same code that powers the portal preview,
   which is why innerHTML is safe for `post.html` and nothing
   else. Titles/excerpts are plain text and get escaped here.
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

function renderPost(post) {
  stateEl.hidden = true;
  document.title = post.title + " — blendART Barber Studio";
  contentEl.innerHTML = `
    <article class="post-full">
      <p class="post-date marker">${escapeHtml(niceDate(post.publishedAt))}</p>
      <h1 class="post-heading">${escapeHtml(post.title)}</h1>
      <div class="post-body">${post.html || ""}</div>
      <a class="btn btn-outline btn-small post-back" href="blog.html">← All posts</a>
    </article>
  `;
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
      renderPost(data.post);
    } else {
      const { data } = await feed();
      renderList((data && data.posts) || []);
    }
  } catch (_) {
    stateEl.textContent = "couldn't load posts right now — try a refresh.";
  }
})();

document.getElementById("year").textContent = new Date().getFullYear();
