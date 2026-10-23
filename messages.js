/* messages.js — DM inbox: conversation list + thread with polling */

(function () {
  const me = () => {
    try { return JSON.parse(localStorage.getItem("tm-music-account-v2") || "null"); }
    catch (_) { return null; }
  };

  const signedOut = document.getElementById("dm-signed-out");
  const app = document.getElementById("dm-app");
  const convList = document.getElementById("dm-conversations");
  const threadHead = document.getElementById("dm-thread-head");
  const threadEl = document.getElementById("dm-thread");
  const compose = document.getElementById("dm-compose");
  const dmInput = document.getElementById("dm-input");
  const dmBlocked = document.getElementById("dm-blocked");
  const newForm = document.getElementById("dm-new-form");
  const newUser = document.getElementById("dm-new-user");
  const dmSignin = document.getElementById("dm-signin");

  let activePartner = null;
  let pollTimer = null;
  let canSend = true;

  function showToast(message, type = "info", ms = 4200) {
    const root = document.getElementById("toast-root");
    if (!root) return;
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.textContent = message;
    root.append(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 350); }, ms);
  }

  function initialsFor(name) {
    return (String(name || "?").trim()[0] || "?").toUpperCase();
  }

  function hueFor(str) {
    let h = 0;
    for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) % 360;
    return h;
  }

  function paintAvatar(span, name, avatarUrl, cls) {
    span.className = cls;
    if (avatarUrl) {
      span.innerHTML = "";
      const img = document.createElement("img");
      img.src = MusicAPI.mediaUrl(avatarUrl);
      img.alt = "";
      img.onerror = () => {
        img.remove();
        span.textContent = initialsFor(name);
        span.style.background = `linear-gradient(135deg, hsl(${hueFor(name)} 70% 45%), hsl(${(hueFor(name) + 60) % 360} 70% 55%))`;
      };
      span.append(img);
    } else {
      span.textContent = initialsFor(name);
      span.style.background = `linear-gradient(135deg, hsl(${hueFor(name)} 70% 45%), hsl(${(hueFor(name) + 60) % 360} 70% 55%))`;
    }
  }

  function timeShort(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function initialFor(name) { return initialsFor(name); }

  async function loadConversations(selectUser) {
    const acct = me();
    if (!acct) return;
    try {
      const data = await MusicAPI.conversations(acct.token);
      convList.innerHTML = "";
      if (!data.conversations.length) {
        const li = document.createElement("li");
        li.className = "muted-note";
        li.textContent = "No conversations yet — open one with a username above.";
        convList.append(li);
      }
      data.conversations.forEach((c) => {
        const li = document.createElement("li");
        li.className = "dm-convo" + (c.partner_username === activePartner ? " active" : "");
        const av = document.createElement("span");
        paintAvatar(av, c.partner_username, c.partner_avatar, "avatar avatar-small");
        const wrap = document.createElement("div");
        wrap.className = "dm-convo-body";
        const name = document.createElement("strong");
        name.textContent = c.partner_username;
        const last = document.createElement("span");
        last.className = "dm-last";
        last.textContent = (c.last_from_me ? "You: " : "") + c.last_text;
        wrap.append(name, last);
        const side = document.createElement("div");
        side.className = "dm-convo-side";
        const when = document.createElement("span");
        when.className = "dm-time mono";
        when.textContent = timeShort(c.last_at);
        side.append(when);
        if (c.unread) {
          const badge = document.createElement("span");
          badge.className = "msg-badge";
          badge.textContent = c.unread > 99 ? "99+" : String(c.unread);
          side.append(badge);
        }
        li.append(av, wrap, side);
        li.addEventListener("click", () => openThread(c.partner_username));
        convList.append(li);
      });
      if (selectUser) openThread(selectUser);
    } catch (error) {
      if (error.status === 401) { showSignedOut(); }
    }
  }

  async function openThread(username) {
    const acct = me();
    if (!acct || !username) return;
    activePartner = username;
    newUser.value = "";

    try {
      const data = await MusicAPI.threadWith(acct.token, username);
      canSend = data.can_send;

      threadHead.innerHTML = "";
      const av = document.createElement("span");
      paintAvatar(av, username, data.partner.avatar_url, "avatar avatar-small");
      const link = document.createElement("a");
      link.href = "/profile?u=" + encodeURIComponent(username);
      link.textContent = username;
      const hint = document.createElement("a");
      hint.className = "muted-note mono dm-profile-link";
      hint.href = "/profile?u=" + encodeURIComponent(username);
      hint.textContent = "view profile ↗";
      threadHead.append(av, link, hint);

      dmBlocked.hidden = canSend;
      if (!canSend) dmBlocked.textContent = data.dm_error || "You can't message this person.";
      compose.hidden = !canSend;

      threadEl.innerHTML = "";
      if (!data.messages.length) {
        const li = document.createElement("li");
        li.className = "dm-empty muted-note";
        li.textContent = canSend
          ? `Say hi to ${username} — first message starts the chat.`
          : "You can't message this person.";
        threadEl.append(li);
      }
      data.messages.forEach((m) => {
        const mine = m.sender_id === acct.id;
        const li = document.createElement("li");
        li.className = "dm-msg" + (mine ? " mine" : "");
        const bubble = document.createElement("div");
        bubble.className = "dm-bubble";
        bubble.textContent = m.text;
        const when = document.createElement("span");
        when.className = "dm-msg-time mono";
        when.textContent = timeShort(m.created_at);
        li.append(bubble, when);
        threadEl.append(li);
      });
      threadEl.scrollTop = threadEl.scrollHeight;

      document.querySelectorAll(".dm-convo").forEach((el) => el.classList.remove("active"));
      for (const li of convList.children) {
        if (li.textContent.includes(username)) li.classList.add("active");
      }
    } catch (error) {
      if (error.status === 404) showToast("No such user.", "error");
      else showToast(error.message, "error");
    }
    loadConversations();
  }

  compose.addEventListener("submit", async (event) => {
    event.preventDefault();
    const acct = me();
    const text = dmInput.value.trim();
    if (!acct || !activePartner || !text) return;
    try {
      await MusicAPI.sendMessage(acct.token, activePartner, text);
      dmInput.value = "";
      await openThread(activePartner);
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  newForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = newUser.value.trim();
    if (name) openThread(name);
  });

  function showSignedOut() {
    signedOut.hidden = false;
    app.hidden = true;
  }

  function showApp() {
    signedOut.hidden = true;
    app.hidden = false;
  }

  dmSignin.addEventListener("click", () => {
    const sb = document.getElementById("signin-btn");
    if (sb) sb.click();
  });

  function boot() {
    const acct = me();
    const params = new URLSearchParams(location.search);
    const to = params.get("to");

    if (!acct || MusicAPI.mode !== "server") {
      showSignedOut();
      if (acct && MusicAPI.mode === "local") {
        signedOut.querySelector("p").textContent = "No backend reachable — messages need the server.";
      }
      return;
    }
    showApp();
    loadConversations(to);

    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => {
      if (!me()) { clearInterval(pollTimer); return; }
      loadConversations();
      if (activePartner) openThread(activePartner);
    }, 6000);
  }

  // re-boot when the shared script finishes account restore
  MusicAPI.detect().then(() => {
    setTimeout(boot, 400);
  });
})();
