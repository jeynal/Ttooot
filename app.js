let currentUserEmail = localStorage.getItem('lovey_current_email') || '';
let currentBotId = 'bot_1';
let currentRoomId = 'room_default';
let currentHubBot = null;
let editingReviewIndex = null;
let activeReplyIndex = null;

function getUserKey(k) { return `lovey_${currentUserEmail}_${k}`; }
function getCurrentTimeStr() { 
  const n = new Date(); 
  return `${n.getHours().toString().padStart(2, '0')}:${n.getMinutes().toString().padStart(2, '0')} น.`; 
}

let defaultBots = [{
  id: "bot_1", 
  name: "เร็น (Ren)", 
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  age: "22 ปี", 
  career: "นักศึกษาคณะดนตรี", 
  quote: "ต่อให้โลกนี้มืดมิดแค่ไหน เค้าจะส่องสว่างเพื่อเธอคนเดียว",
  shortPreview: "เพื่อนชายคนสนิทขี้อ้อน ปากหวานแต่คลั่งรักสุดใจ แอบชอบคุณมาตลอด", 
  story: "เร็นเติบโตมาในครอบครัวนักดนตรีคลาสสิก เขาดูเป็นคนอบอุ่น ใจดี และมักจะยิ้มแย้มอยู่เสมอ...",
  personality: "ขี้อ้อน อ่อนโยน ขี้หึงนิดๆ ปากหวาน",
  likesCount: 124, 
  likedUsers: [], 
  playedUsers: [], 
  reviews: [], 
  botSlots: [
    { title: "ความลับตอนซ้อมดนตรี", content: "ทุกเพลงรักที่เร็นแต่งขึ้นมาในห้องซ้อม ล้วนมีภาพของคุณอยู่เสมอ" }
  ],
  playerSlots: [
    { title: "สถานะความสัมพันธ์", content: "เพื่อนสนิทคนพิเศษที่รู้ใจกันทุกเรื่อง" }
  ],
  rooms: []
}];

let userProfile = { name: "คุณหนูนักท่องฝัน" };
let userPersonas = [{ id: "p1", name: "คุณหนูนักท่องฝัน", isSelected: true }];
let userEconomy = { coins: 10, catCoins: 50 };
let bots = defaultBots;

function loadUserData() {
  if (!currentUserEmail) return;
  bots = JSON.parse(localStorage.getItem(getUserKey('bots'))) || defaultBots;
  userProfile = JSON.parse(localStorage.getItem(getUserKey('profile'))) || userProfile;
  userPersonas = JSON.parse(localStorage.getItem(getUserKey('personas'))) || userPersonas;
  userEconomy = JSON.parse(localStorage.getItem(getUserKey('economy'))) || userEconomy;
}

function saveUserData() {
  if (!currentUserEmail) return;
  localStorage.setItem(getUserKey('bots'), JSON.stringify(bots));
  localStorage.setItem(getUserKey('profile'), JSON.stringify(userProfile));
  localStorage.setItem(getUserKey('personas'), JSON.stringify(userPersonas));
  localStorage.setItem(getUserKey('economy'), JSON.stringify(userEconomy));
}

function handleLogin() {
  const e = document.getElementById('login-email-input').value.trim();
  const n = document.getElementById('login-name-input').value.trim() || 'คุณหนูนักท่องฝัน';
  if (!e) return alert('กรุณากรอกอีเมล');
  currentUserEmail = e;
  userProfile.name = n;
  localStorage.setItem('lovey_current_email', e);
  saveUserData();
  document.getElementById('login-screen').classList.add('hidden');
  initApp();
}

function handleLogout() {
  localStorage.removeItem('lovey_current_email');
  location.reload();
}

function initApp() {
  document.getElementById('user-name').innerText = userProfile.name;
  document.getElementById('header-user-name').innerText = userProfile.name;
  renderExploreBotCards();
}

/* ==================== BOT HUB LOGIC ==================== */
function openBotHubPage(id) {
  currentHubBot = bots.find(b => b.id === id) || bots[0];
  document.getElementById('view-bot-hub').classList.remove('hidden');
  document.getElementById('explore-discovery-view').classList.add('hidden');

  document.getElementById('hub-avatar').src = currentHubBot.avatar;
  document.getElementById('hub-name').innerText = currentHubBot.name;
  document.getElementById('hub-meta').innerText = `${currentHubBot.age || 'ไม่ระบุอายุ'} • ${currentHubBot.career || 'ไม่ระบุอาชีพ'}`;
  document.getElementById('hub-quote').innerText = `"${currentHubBot.quote || 'ยินดีที่ได้พบกันนะ'}"`;
  document.getElementById('hub-preview').innerText = currentHubBot.shortPreview || '';

  updateHubLikeState();
  updatePlayerCountState();
  switchHubSubTab('story');
}

function backFromBotHub() {
  document.getElementById('view-bot-hub').classList.add('hidden');
  document.getElementById('explore-discovery-view').classList.remove('hidden');
}

/* LIKE SYSTEM (1 LIKE PER ACCOUNT) */
function updateHubLikeState() {
  if (!currentHubBot.likedUsers) currentHubBot.likedUsers = [];
  const hasLiked = currentHubBot.likedUsers.includes(currentUserEmail);
  document.getElementById('hub-like-count').innerText = currentHubBot.likesCount || 0;
  document.getElementById('hub-like-icon').className = hasLiked ? 'fa-solid fa-heart text-rose-500' : 'fa-regular fa-heart';
}

function toggleHubBotLike() {
  if (!currentHubBot.likedUsers) currentHubBot.likedUsers = [];
  const idx = currentHubBot.likedUsers.indexOf(currentUserEmail);
  if (idx > -1) {
    currentHubBot.likedUsers.splice(idx, 1);
    currentHubBot.likesCount = Math.max(0, (currentHubBot.likesCount || 1) - 1);
  } else {
    currentHubBot.likedUsers.push(currentUserEmail);
    currentHubBot.likesCount = (currentHubBot.likesCount || 0) + 1;
  }
  saveUserData();
  updateHubLikeState();
}

/* PLAYER COUNT SYSTEM (1 PLAYER PER ACCOUNT) */
function updatePlayerCountState() {
  if (!currentHubBot.playedUsers) currentHubBot.playedUsers = [];
  document.getElementById('hub-player-count').innerText = currentHubBot.playedUsers.length;
}

function registerPlayerAccount() {
  if (!currentHubBot.playedUsers) currentHubBot.playedUsers = [];
  if (!currentHubBot.playedUsers.includes(currentUserEmail)) {
    currentHubBot.playedUsers.push(currentUserEmail);
    saveUserData();
    updatePlayerCountState();
  }
}

function switchHubSubTab(tab) {
  ['story', 'slots', 'reviews'].forEach(t => {
    document.getElementById(`hub-content-${t}`).classList.toggle('hidden', t !== tab);
  });
  if (tab === 'story') renderHubStoryTab();
  if (tab === 'slots') renderHubSlotsTab();
  if (tab === 'reviews') renderReviewsTab();
}

function renderHubStoryTab() {
  document.getElementById('hub-story-text').innerText = currentHubBot.story || 'ไม่มีเรื่องราวเพิ่มเติม';
}

function renderHubSlotsTab() {
  const pList = document.getElementById('hub-player-slots-list');
  const bList = document.getElementById('hub-bot-slots-list');
  pList.innerHTML = '';
  bList.innerHTML = '';

  (currentHubBot.playerSlots || []).forEach(s => {
    pList.innerHTML += `<div class="p-2.5 bg-purple-50/50 rounded-2xl border border-purple-100"><span class="font-bold text-slate-800 text-xs">${s.title}</span><p class="text-[10px] text-slate-500">${s.content}</p></div>`;
  });

  (currentHubBot.botSlots || []).forEach(s => {
    bList.innerHTML += `<div class="p-2.5 bg-white rounded-2xl border border-purple-100"><span class="font-bold text-purple-700 text-xs">${s.title}</span><p class="text-[10px] text-slate-600">${s.content}</p></div>`;
  });
}

function addPlayerHubSlot() {
  if (!currentHubBot.playerSlots) currentHubBot.playerSlots = [];
  if (currentHubBot.playerSlots.length >= 5) return alert("เพิ่มได้สูงสุด 5 ช่องเท่านั้น");
  const t = prompt("หัวข้อข้อมูล:");
  const c = prompt("รายละเอียด (ไม่เกิน 1,500 คำ):");
  if (t && c) {
    currentHubBot.playerSlots.push({ title: t, content: c });
    saveUserData();
    renderHubSlotsTab();
  }
}

/* REVIEWS WITH EDIT, DELETE & REPLY */
function renderReviewsTab() {
  const container = document.getElementById('hub-reviews-container');
  container.innerHTML = '';
  if (!currentHubBot.reviews) currentHubBot.reviews = [];

  currentHubBot.reviews.forEach((r, idx) => {
    const div = document.createElement('div');
    div.className = 'p-3 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1.5 text-xs';

    const isOwner = r.author === userProfile.name;
    const isEditing = editingReviewIndex === idx;

    let actionBtns = isOwner ? `
      <button onclick="startEditReview(${idx})" class="hover:text-purple-600 text-[10px]"><i class="fa-solid fa-pen"></i> แก้ไข</button>
      <button onclick="deleteReview(${idx})" class="hover:text-rose-600 text-[10px]"><i class="fa-solid fa-trash"></i> ลบ</button>
    ` : '';

    let repliesHtml = '';
    if (r.replies) {
      r.replies.forEach((rep, repIdx) => {
        const isRepOwner = rep.author === userProfile.name;
        repliesHtml += `
          <div class="ml-3 p-2 bg-white rounded-xl border border-purple-100 space-y-1 text-[11px]">
            <div class="flex justify-between items-center font-bold text-purple-800">
              <span>${rep.author}</span>
              ${isRepOwner ? `<button onclick="deleteReply(${idx},${repIdx})" class="text-rose-500 text-[9px]"><i class="fa-solid fa-xmark"></i> ลบ</button>` : ''}
            </div>
            <p class="text-slate-600">${rep.text}</p>
          </div>
        `;
      });
    }

    if (isEditing) {
      div.innerHTML = `
        <textarea id="edit-review-input-${idx}" rows="2" class="w-full pastel-input rounded-xl p-2 text-xs">${r.text}</textarea>
        <div class="flex justify-end gap-2 pt-1">
          <button onclick="cancelEditReview()" class="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px]">ยกเลิก</button>
          <button onclick="saveEditReview(${idx})" class="px-2.5 py-1 pastel-btn-primary rounded-lg text-[10px] font-bold">บันทึก</button>
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="flex justify-between items-center font-bold text-slate-800">
          <span>${r.author}</span>
          <span class="text-[9px] text-slate-400 font-normal">${r.time}</span>
        </div>
        <p class="text-slate-600">${r.text}</p>
        <div class="flex gap-3 text-[10px] text-slate-400 pt-1">
          <button onclick="toggleReplyBox(${idx})" class="hover:text-purple-600"><i class="fa-solid fa-reply"></i> ตอบกลับ (${r.replies ? r.replies.length : 0})</button>
          ${actionBtns}
        </div>
        ${repliesHtml ? `<div class="space-y-1 pt-1">${repliesHtml}</div>` : ''}
        ${activeReplyIndex === idx ? `
          <div class="flex gap-1 pt-1">
            <input id="reply-input-${idx}" type="text" placeholder="ตอบกลับ..." class="flex-1 pastel-input text-xs px-2.5 py-1 rounded-xl">
            <button onclick="submitReply(${idx})" class="px-3 py-1 pastel-btn-primary rounded-xl text-[10px] font-bold">ส่ง</button>
          </div>
        ` : ''}
      `;
    }
    container.appendChild(div);
  });
}

function submitHubReview() {
  const text = document.getElementById('hub-review-input').value.trim();
  if (!text) return;
  if (!currentHubBot.reviews) currentHubBot.reviews = [];
  currentHubBot.reviews.unshift({ author: userProfile.name, text: text, time: getCurrentTimeStr(), replies: [] });
  document.getElementById('hub-review-input').value = '';
  saveUserData();
  renderReviewsTab();
}

function startEditReview(idx) { editingReviewIndex = idx; renderReviewsTab(); }
function cancelEditReview() { editingReviewIndex = null; renderReviewsTab(); }
function saveEditReview(idx) {
  const val = document.getElementById(`edit-review-input-${idx}`).value.trim();
  if (!val) return;
  currentHubBot.reviews[idx].text = val;
  editingReviewIndex = null;
  saveUserData();
  renderReviewsTab();
}

function deleteReview(idx) {
  if (!confirm("ต้องการลบความคิดเห็นนี้ใช่ไหม?")) return;
  currentHubBot.reviews.splice(idx, 1);
  saveUserData();
  renderReviewsTab();
}

function toggleReplyBox(idx) { activeReplyIndex = activeReplyIndex === idx ? null : idx; renderReviewsTab(); }
function submitReply(idx) {
  const input = document.getElementById(`reply-input-${idx}`);
  const text = input ? input.value.trim() : '';
  if (!text) return;
  if (!currentHubBot.reviews[idx].replies) currentHubBot.reviews[idx].replies = [];
  currentHubBot.reviews[idx].replies.push({ author: userProfile.name, text: text, time: getCurrentTimeStr() });
  activeReplyIndex = null;
  saveUserData();
  renderReviewsTab();
}

function deleteReply(reviewIdx, replyIdx) {
  currentHubBot.reviews[reviewIdx].replies.splice(replyIdx, 1);
  saveUserData();
  renderReviewsTab();
}

function startChatFromBotHub() {
  registerPlayerAccount();
  document.getElementById('view-lobby').classList.add('hidden');
  document.getElementById('view-room').classList.remove('hidden');
  document.getElementById('room-name').innerText = currentHubBot.name;
  renderRoomMessages();
}

function handleBackAction() {
  document.getElementById('view-room').classList.add('hidden');
  document.getElementById('view-lobby').classList.remove('hidden');
}

function renderExploreBotCards() {
  const c = document.getElementById('explore-bot-cards-container');
  if (!c) return;
  c.innerHTML = '';
  bots.forEach(b => {
    const div = document.createElement('div');
    div.className = 'p-3 bg-white border border-purple-100 rounded-2xl flex gap-3 cursor-pointer';
    div.onclick = () => openBotHubPage(b.id);
    div.innerHTML = `<img src="${b.avatar}" class="w-12 h-12 rounded-xl object-cover"><div><h4 class="text-xs font-bold text-slate-800">${b.name}</h4><p class="text-[10px] text-purple-600">${b.shortPreview || ''}</p></div>`;
    c.appendChild(div);
  });
}

function renderRoomMessages() {
  const container = document.getElementById('room-messages');
  container.innerHTML = `<div class="p-3 bg-purple-100/60 rounded-2xl text-purple-900">"ยินดีที่ได้พบกันนะ..."</div>`;
}

function handleSendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  const c = document.getElementById('room-messages');
  c.innerHTML += `<div class="text-right"><span class="pastel-btn-primary px-3 py-2 rounded-2xl inline-block">${text}</span></div>`;
  input.value = '';
  c.scrollTop = c.scrollHeight;
}

function switchLobbyTab(t) {
  ['home', 'explore', 'chats', 'settings'].forEach(x => {
    const el = document.getElementById(`tab-${x}`);
    if (el) el.classList.toggle('hidden', x !== t);
  });
}

function clearAllData() { me = confirm("ต้องการล้างข้อมูลทั้งหมด?"); if (me) { localStorage.clear(); location.reload(); } }

if (!currentUserEmail) {
  document.getElementById('login-screen').classList.remove('hidden');
} else {
  loadUserData();
  initApp();
}
