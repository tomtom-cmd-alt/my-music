/* profile.js — renders /profile (own, edit mode) and /profile?u=username */

(function () {
  const account = () => {
    try { return JSON.parse(localStorage.getItem("tm-music-account-v2") || "null"); }
    catch (_) { return null; }
  };

  const params = new URLSearchParams(location.search);
  const wanted = params.get("u");

  const bgEl = document.getElementById("profile-bg");
  const avatarEl = document.getElementById("profile-avatar");
  const nameEl = document.getElementById("profile-username");
  const bioEl = document.getElementById("profile-bio");
  const metaEl = document.getElementById("profile-meta");
  const badgeAdmin = document.getElementById("badge-admin");
  const badgeVis = document.getElementById("badge-visibility");
  const actions = document.getElementById("profile-actions");
  const editPanel = document.getElementById("edit-panel");

  const btnAdd = document.getElementById("btn-add-friend");
  const btnAccept = document.getElementById("btn-accept-incoming");
  const btnRemove = document.getElementById("btn-remove-friend");
  const btnMessage = document.getElementById("btn-message");
  const btnEdit = document.getElementById("btn-edit-profile");

  const friendCountEl = document.getElementById("friend-count");
  const friendListEl = document.getElementById("friend-list");
  const friendRequestsWrap = document.getElementById("friend-requests");
  const friendRequestList = document.getElementById("friend-request-list");
  const friendsLocked = document.getElementById("friends-locked");
  const profileCommentList = document.getElementById("profile-comment-list");
  const commentsLocked = document.getElementById("comments-locked");

  const editBio = document.getElementById("edit-bio");
  const bioCount = document.getElementById("bio-count");
  const editVisibility = document.getElementById("edit-visibility");
  const editDm = document.getElementById("edit-dm");
  const editAvatar = document.getElementById("edit-avatar");
  const editBg = document.getElementById("edit-bg");
  const editSave = document.getElementById("edit-save");
  const editCancel = document.getElementById("edit-cancel");
  const editStatus = document.getElementById("edit-status");
  const avatarChangeBtn = document.getElementById("avatar-change");

  let data = null;

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

  function songName(key) {
    const titles = {
      "whispers": "Whispers", "when-i-think-about-you": "When I Think About You",
      "deep-space": "Deep Space", "insterstellar-roadtrip-slowed": "Insterstellar Roadtrip (Slowed)",
      "interstellar-roadtrip-sped": "Interstellar Roadtrip (Sped)", "interstellar-roadtrip": "Interstellar Roadtrip",
      "late-night-disco": "Late Night Disco", "light-in-the-dark": "Light in the Dark",
      "sands-of-time": "Sands of Time", "solar-synth-relift": "Solar Synth Relift", "solar-synth": "Solar Synth"
    };
    return titles[key] || key;
  }

  function renderProfile() {
    if (!data) return;
    const u = data.user;
    const v = data.viewer || {};

    paintAvatar(avatarEl, u.username, u.avatar_url, "avatar profile-avatar");
    if (u.bg_url) {
      bgEl.style.backgroundImage = `url("${MusicAPI.mediaUrl(u.bg_url)}")`;
      bgEl.classList.add("has-img");
    } else {
      bgEl.style.backgroundImage = "";
      bgEl.classList.remove("has-img");
    }

    nameEl.textContent = u.username;
    badgeAdmin.hidden = !u.is_admin;
    badgeVis.hidden = v.is_self;
    if (!v.is_self) {
      badgeVis.textContent = u.profile_visibility === "public" ? "all visible" : "private";
      badgeVis.className = "vis-badge " + (u.profile_visibility === "public" ? "public" : "private");
    }

    bioEl.textContent = u.bio || (v.is_self ? "No bio yet — click Edit profile to write one." : "");
    const joined = u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long" }) : "";
    metaEl.textContent = `joined ${joined}` + (u.dm_policy && !v.is_self && u.dm_policy !== "anyone" ? ` · DMs: ${u.dm_policy === "friends" ? "friends only" : "off"}` : "");

    // actions
    btnAdd.hidden = !(v.signed_in && !v.is_self && v.relationship === "none" && !v.outgoing_request && !v.incoming_request);
    if (v.signed_in && !v.is_self && v.outgoing_request) {
      btnAdd.hidden = false;
      btnAdd.disabled = true;
      btnAdd.textContent = "Request sent";
    } else {
      btnAdd.disabled = false;
      btnAdd.textContent = "Add friend";
    }
    btnAccept.hidden = !v.incoming_request;
    btnRemove.hidden = v.relationship !== "friends";
    btnMessage.hidden = !(v.signed_in && !v.is_self);
    btnMessage.classList.toggle("disabled", !v.can_dm);
    btnMessage.title = v.can_dm ? "" : (v.dm_error || "DMs off");
    btnMessage.href = "/messages?to=" + encodeURIComponent(u.username);
    btnEdit.hidden = !v.is_self;
    avatarChangeBtn.hidden = !v.is_self;
    document.getElementById("bg-edit-hint")?.remove();

    // friends
    friendListEl.innerHTML = "";
    friendRequestsWrap.hidden = true;
    friendRequestList.innerHTML = "";
    if (data.friends) {
      friendCountEl.textContent = data.friends.length ? String(data.friends.length) : "";
      if (!data.friends.length) {
        const li = document.createElement("li");
        li.className = "muted-note";
        li.textContent = v.is_self ? "No friends yet — send some friend requests!" : "No friends yet.";
        friendListEl.append(li);
      }
      data.friends.forEach((f) => {
        const li = document.createElement("li");
        li.className = "friend-item";
        const av = document.createElement("span");
        paintAvatar(av, f.username, f.avatar_url, "avatar avatar-small");
        const link = document.createElement("a");
        link.href = "/profile?u=" + encodeURIComponent(f.username);
        link.textContent = f.username;
        li.append(av, link);
        friendListEl.append(li);
      });
      friendsLocked.hidden = true;
    } else {
      friendCountEl.textContent = "";
      const li = document.createElement("li");
      li.className = "muted-note";
      li.textContent = "Hidden for privacy.";
      friendListEl.append(li);
      friendsLocked.hidden = false;
    }

    // comments
    profileCommentList.innerHTML = "";
    if (data.comments) {
      if (!data.comments.length) {
        const li = document.createElement("li");
        li.className = "comment-empty";
        li.textContent = v.is_self ? "You haven't commented yet — drop one on a track!" : "No comments yet.";
        profileCommentList.append(li);
      }
      data.comments.forEach((c) => {
        const item = document.createElement("li");
        item.className = "comment-item" + (c.status === "hidden" ? " is-hidden" : "");
        const meta = document.createElement("div");
        meta.className = "comment-meta";
        const who = document.createElement("div");
        who.className = "comment-who";
        const song = document.createElement("a");
        song.className = "song-chip";
        song.href = "/music";
        song.textContent = songName(c.song_name);
        who.append(song);
        if (c.status === "hidden") {
          const chip = document.createElement("span");
          chip.className = "acct-badge";
          chip.textContent = "hidden by mods";
          who.append(chip);
        }
        const time = document.createElement("span");
        time.className = "comment-time";
        time.textContent = new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        meta.append(who, time);
        const text = document.createElement("p");
        text.textContent = c.text;
        item.append(meta, text);
        profileCommentList.append(item);
      });
      commentsLocked.hidden = true;
    } else {
      const li = document.createElement("li");
      li.className = "comment-empty";
      li.textContent = "Hidden for privacy.";
      profileCommentList.append(li);
      commentsLocked.hidden = false;
    }
  }

  function fillEditPanel() {
    if (!data || !data.viewer.is_self) return;
    editBio.value = data.user.bio || "";
    bioCount.textContent = `${editBio.value.length}/300`;
    editVisibility.value = data.user.profile_visibility || "private";
    editDm.value = data.user.dm_policy || "anyone";
  }

  async function load() {
    const me = account();
    const token = me ? me.token : undefined;
    if (!wanted) {
      // own profile — requires sign-in
      if (!me) {
        nameEl.textContent = "Not signed in";
        bioEl.textContent = "Sign in to view and edit your profile.";
        actions.innerHTML = "";
        const btn = document.createElement("button");
        btn.className = "btn small-btn";
        btn.textContent = "Sign in";
        btn.addEventListener("click", () => {
          const sb = document.getElementById("signin-btn");
          if (sb) sb.click();
        });
        actions.append(btn);
        return;
      }
      if (MusicAPI.mode !== "server") {
        nameEl.textContent = me.username;
        bioEl.textContent = "No backend reachable — profiles need the server.";
        return;
      }
    } else if (MusicAPI.mode !== "server") {
      nameEl.textContent = "Offline";
      bioEl.textContent = "Profiles need the backend server.";
      return;
    }

    const name = wanted || (me ? me.username : "");
    try {
      data = await MusicAPI.getUser(name, token);
      renderProfile();
      fillEditPanel();
      editPanel.hidden = !(data.viewer && data.viewer.is_self && btnEdit.classList.contains("open"));
      if (data.viewer && data.viewer.is_self) await loadMyRequests();
    } catch (error) {
      nameEl.textContent = wanted || "Profile";
      bioEl.textContent = error.status === 404 ? "No such user." : "Could not load: " + error.message;
      actions.innerHTML = "";
    }
  }

  /* -------- incoming friend requests (self view) -------- */

  async function loadMyRequests() {
    const me = account();
    if (!me) return;
    try {
      const data = await MusicAPI.friends(me.token);
      friendRequestList.innerHTML = "";
      if (data.requests && data.requests.length) {
        friendRequestsWrap.hidden = false;
        data.requests.forEach((r) => {
          const li = document.createElement("li");
          li.className = "friend-item";
          const av = document.createElement("span");
          paintAvatar(av, r.from_username, r.from_avatar, "avatar avatar-small");
          const link = document.createElement("a");
          link.href = "/profile?u=" + encodeURIComponent(r.from_username);
          link.textContent = r.from_username;
          const row = document.createElement("div");
          row.className = "friend-accept-row";
          const ok = document.createElement("button");
          ok.className = "mini-btn";
          ok.type = "button";
          ok.textContent = "Accept";
          ok.addEventListener("click", async () => {
            try {
              await MusicAPI.friendAccept(me.token, r.id);
              showToast("Friend added!", "success");
              load();
            } catch (error) { showToast(error.message, "error"); }
          });
          const no = document.createElement("button");
          no.className = "mini-btn decline";
          no.type = "button";
          no.textContent = "✕";
          no.addEventListener("click", async () => {
            try {
              await MusicAPI.friendDecline(me.token, r.id);
              load();
            } catch (error) { showToast(error.message, "error"); }
          });
          row.append(ok, no);
          li.append(av, link, row);
          friendRequestList.append(li);
        });
      } else {
        friendRequestsWrap.hidden = true;
      }
    } catch (_) {}
  }

  /* -------- actions -------- */

  if (btnAdd) btnAdd.addEventListener("click", async () => {
    const me = account();
    if (!me) { showToast("Sign in first", "info"); return; }
    btnAdd.disabled = true;
    try {
      await MusicAPI.friendRequest(me.token, data.user.username);
      showToast(`Friend request sent to ${data.user.username}`, "success");
      load();
    } catch (error) {
      showToast(error.message, "error");
      btnAdd.disabled = false;
    }
  });

  if (btnAccept) btnAccept.addEventListener("click", async () => {
    const me = account();
    if (!me || !data.viewer.incoming_request) return;
    try {
      await MusicAPI.friendAccept(me.token, data.viewer.incoming_request.id);
      showToast(`You are now friends with ${data.user.username}!`, "success");
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  if (btnRemove) btnRemove.addEventListener("click", async () => {
    const me = account();
    if (!me) return;
    if (!confirm(`Remove ${data.user.username} from your friends?`)) return;
    try {
      await MusicAPI.friendRemove(me.token, data.user.username);
      showToast("Friend removed.", "info");
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  if (btnEdit) btnEdit.addEventListener("click", () => {
    const open = editPanel.hidden;
    editPanel.hidden = !open;
    btnEdit.classList.toggle("open", open);
    if (open) fillEditPanel();
  });

  if (editCancel) editCancel.addEventListener("click", () => {
    editPanel.hidden = true;
    btnEdit.classList.remove("open");
  });

  if (editBio) editBio.addEventListener("input", () => {
    bioCount.textContent = `${editBio.value.length}/300`;
  });

  if (editSave) editSave.addEventListener("click", async () => {
    const me = account();
    if (!me) return;
    editSave.disabled = true;
    editStatus.textContent = "saving…";
    try {
      await MusicAPI.updateProfile(me.token, {
        bio: editBio.value,
        profile_visibility: editVisibility.value,
        dm_policy: editDm.value
      });
      editStatus.textContent = "saved ✓";
      showToast("Profile saved.", "success");
      load();
    } catch (error) {
      editStatus.textContent = "";
      showToast("Failed: " + error.message, "error");
    } finally {
      editSave.disabled = false;
      setTimeout(() => { editStatus.textContent = ""; }, 2500);
    }
  });

  async function uploadImage(kind, input) {
    const me = account();
    if (!me || !input.files.length) return;
    editStatus.textContent = "uploading…";
    try {
      await MusicAPI.uploadProfileImage(me.token, kind, input.files[0]);
      showToast(kind === "bg" ? "Background updated!" : "Profile picture updated!", "success");
      input.value = "";
      editStatus.textContent = "";
      load();
    } catch (error) {
      editStatus.textContent = "";
      showToast("Upload failed: " + error.message, "error");
    }
  }

  if (editAvatar) editAvatar.addEventListener("change", () => uploadImage("avatar", editAvatar));
  if (editBg) editBg.addEventListener("change", () => uploadImage("bg", editBg));
  if (avatarChangeBtn) avatarChangeBtn.addEventListener("click", () => {
    editPanel.hidden = false;
    btnEdit.classList.add("open");
    editAvatar.click();
  });

  const avatarClear = document.getElementById("avatar-clear");
  const bgClear = document.getElementById("bg-clear");
  if (avatarClear) avatarClear.addEventListener("click", async () => {
    const me = account();
    if (!me) return;
    try { await MusicAPI.clearProfileImage(me.token, "avatar"); load(); } catch (e) { showToast(e.message, "error"); }
  });
  if (bgClear) bgClear.addEventListener("click", async () => {
    const me = account();
    if (!me) return;
    try { await MusicAPI.clearProfileImage(me.token, "bg"); load(); } catch (e) { showToast(e.message, "error"); }
  });

  /* -------- boot -------- */

  MusicAPI.detect().then(() => load());
})();
