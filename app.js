const samples = [
  { domain: 'infosys.com', type: 'Indian technology company', title: 'Navigate your next with Infosys', summary: 'Infosys helps enterprises in India and around the world with digital transformation, consulting, and technology services.', topics: ['IT services', 'Consulting', 'Digital'], points: ['Provides technology and consulting services to enterprises.', 'Works across cloud, AI, data, and digital engineering.', 'Publishes perspectives on business and technology change.'], audience: 'Enterprise leaders, technology teams, and business decision-makers', headings: ['Services', 'Industries', 'Insights'], links: 39 },
  { domain: 'india.gov.in', type: 'Indian public information', title: 'National Portal of India', summary: 'India.gov.in brings together government information and citizen services from across the Republic of India.', topics: ['Government', 'Citizen services', 'India'], points: ['Connects citizens with government services and information.', 'Organises content by states, ministries, and service areas.', 'Provides access to national news, documents, and resources.'], audience: 'Indian citizens, residents, and public service users', headings: ['Government', 'Services', 'Know India'], links: 76 },
  { domain: 'swayam.gov.in', type: 'Indian education', title: 'SWAYAM: Learn from the best', summary: 'SWAYAM offers online courses from Indian universities and institutions, supporting accessible learning across subjects and levels.', topics: ['Online learning', 'Universities', 'Skills'], points: ['Offers courses from Indian higher education institutions.', 'Covers school, university, and professional learning.', 'Supports learners with structured online course material.'], audience: 'Students, teachers, professionals, and lifelong learners in India', headings: ['Browse courses', 'National coordinators', 'About SWAYAM'], links: 28 },
  { domain: 'isro.gov.in', type: 'Indian research', title: 'Indian Space Research Organisation', summary: 'ISRO shares India’s space missions, scientific programmes, launch services, and applications that support national development.', topics: ['Space', 'Science', 'India'], points: ['Develops launch vehicles and space missions.', 'Uses satellite applications for communication and Earth observation.', 'Publishes mission updates, technology information, and opportunities.'], audience: 'Researchers, students, educators, and space technology professionals', headings: ['Missions', 'Applications', 'About ISRO'], links: 63 },
  { domain: 'tata.com', type: 'Indian business group', title: 'Tata: Leadership with trust', summary: 'Tata presents the businesses, purpose, and community impact of one of India’s long-standing global business groups.', topics: ['Business', 'Leadership', 'Impact'], points: ['Represents companies operating across multiple industries.', 'Connects business performance with a long-term purpose.', 'Highlights innovation, sustainability, and community initiatives.'], audience: 'Customers, investors, partners, and people interested in Indian business', headings: ['Our businesses', 'Community', 'Innovation'], links: 44 },
  { domain: 'pib.gov.in', type: 'Indian news and information', title: 'Press Information Bureau', summary: 'The Press Information Bureau shares official information, announcements, and updates from the Government of India.', topics: ['Government', 'News', 'Public affairs'], points: ['Publishes official government press releases and updates.', 'Organises information by ministry, region, and language.', 'Provides an accessible source for public announcements.'], audience: 'Citizens, journalists, researchers, and public affairs professionals', headings: ['Press releases', 'Features', 'Fact checks'], links: 52 }
];
const $ = (selector) => document.querySelector(selector);
const ANALYZE_ENDPOINT = window.WEBLENS_ANALYZE_ENDPOINT || '/functions/v1/analyze-website';
const SUPABASE_URL = 'https://pbvfpaerwntskhccyocj.supabase.co';
const SUPABASE_ANON_KEY = window.WEBLENS_SUPABASE_ANON_KEY || '';
const sampleGrid = $('#sample-grid');
const modal = $('#detail-modal');
const detailContent = $('#detail-content');
const usageKey = 'weblens-free-analyses';
const sessionKey = 'weblens-session';
const DAILY_LIMIT = 2;
let remaining = Number(localStorage.getItem(usageKey) ?? 5);
let session = null;
let profile = null;

/* ---------- Auth / session helpers ---------- */
function getStoredSession() { try { return JSON.parse(localStorage.getItem(sessionKey) ?? 'null'); } catch { return null; } }
function setStoredSession(value) { session = value; if (value) localStorage.setItem(sessionKey, JSON.stringify(value)); else localStorage.removeItem(sessionKey); }
function authFetch(path, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, { ...options, headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}), ...(options.headers ?? {}) } });
}
async function fetchProfile() {
  if (!session?.user?.id) { profile = null; return; }
  const response = await authFetch(`/rest/v1/profiles?id=eq.${session.user.id}&select=*`);
  if (!response.ok) { profile = null; return; }
  const rows = await response.json();
  profile = rows[0] ?? { id: session.user.id, trial_remaining: 5, daily_analysis_date: null, daily_analysis_count: 0 };
}
async function patchProfile(fields) {
  if (!session?.user?.id) return;
  await authFetch(`/rest/v1/profiles?id=eq.${session.user.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(fields) });
  profile = { ...profile, ...fields };
}
function updateAccountUI() {
  const statusEl = $('#account-status');
  const signinButton = $('#signin-button');
  if (session?.user?.email) { statusEl.hidden = false; $('#account-status-email').textContent = session.user.email; signinButton.hidden = true; }
  else { statusEl.hidden = true; signinButton.hidden = false; }
}
async function restoreSession() {
  const stored = getStoredSession();
  if (!stored) return;
  if (stored.expires_at && stored.expires_at * 1000 < Date.now() && stored.refresh_token) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: stored.refresh_token }) });
    if (!response.ok) { setStoredSession(null); return; }
    const refreshed = await response.json();
    setStoredSession({ access_token: refreshed.access_token, refresh_token: refreshed.refresh_token, expires_at: refreshed.expires_at, user: refreshed.user });
  } else {
    session = stored;
  }
  await fetchProfile();
  updateAccountUI();
}

/* ---------- Free-trial / usage rules ---------- */
function updateUsage() {
  const el = $('#usage-count');
  if (session?.user && profile) {
    const today = new Date().toISOString().slice(0, 10);
    const usedToday = profile.daily_analysis_date === today ? profile.daily_analysis_count : 0;
    el.textContent = `${profile.trial_remaining} registered free ${profile.trial_remaining === 1 ? 'analysis' : 'analyses'} available (${Math.max(DAILY_LIMIT - usedToday, 0)} left today)`;
  } else {
    el.textContent = `${remaining} free ${remaining === 1 ? 'analysis' : 'analyses'} available`;
  }
}
function checkTrialAllowed() {
  if (session?.user && profile) {
    const today = new Date().toISOString().slice(0, 10);
    const usedToday = profile.daily_analysis_date === today ? profile.daily_analysis_count : 0;
    if (usedToday >= DAILY_LIMIT) return { ok: false, message: `Registered users can analyse up to ${DAILY_LIMIT} websites per day. Please try again tomorrow.` };
    if (profile.trial_remaining < 1) return { ok: false, message: "You've used all your registered free analyses." };
    return { ok: true };
  }
  if (remaining < 1) return { ok: false, message: 'You have used your 5 free analyses. Create an account to continue.', promptSignup: true };
  return { ok: true };
}
async function recordAnalysisUsage() {
  if (session?.user && profile) {
    const today = new Date().toISOString().slice(0, 10);
    const usedToday = profile.daily_analysis_date === today ? profile.daily_analysis_count : 0;
    await patchProfile({ trial_remaining: profile.trial_remaining - 1, daily_analysis_date: today, daily_analysis_count: usedToday + 1 });
  } else {
    remaining -= 1; localStorage.setItem(usageKey, remaining);
  }
  updateUsage();
}

function renderSamples() {
  sampleGrid.innerHTML = samples.map((sample, index) => `<article class="sample-card reveal" style="animation-delay:${index * 70}ms"><div class="card-top"><span>${sample.domain}</span><span class="demo-badge">Demo analysis</span></div><h3>${sample.title}</h3><p class="summary">${sample.summary}</p><div class="topics">${sample.topics.map(topic => `<span class="topic">${topic}</span>`).join('')}</div><button class="card-button" data-sample="${index}">View full analysis <span aria-hidden="true">→</span></button></article>`).join('');
  sampleGrid.addEventListener('click', event => { const button = event.target.closest('[data-sample]'); if (button) openDetail(samples[Number(button.dataset.sample)]); });
}
function openDetail(sample, live = false) {
  detailContent.innerHTML = `<div class="detail-toolbar"><span class="detail-kicker">${live ? 'Live analysis' : 'Demo analysis'} / ${sample.type}</span><div><button class="export-button" id="pdf-export" type="button">Download PDF</button></div></div><h2 id="detail-title">${sample.title}</h2><p class="detail-url">${sample.url ?? `https://${sample.domain}`}</p><div class="detail-block"><h3>AI summary</h3><p>${sample.summary}</p></div><div class="detail-block"><h3>Key points</h3><ul>${sample.points.map(point => `<li>${point}</li>`).join('')}</ul></div><div class="detail-block"><h3>Key topics</h3><div class="topics">${sample.topics.map(topic => `<span class="topic">${topic}</span>`).join('')}</div></div><div class="detail-block"><h3>Target audience</h3><p>${sample.audience}</p></div><div class="detail-block"><h3>Page structure &amp; links</h3><p>${sample.headings.join(' · ')}<br><strong>${sample.links} useful links extracted</strong></p></div><div class="detail-block"><h3>Ask this webpage</h3><form class="question-form" id="question-form"><div class="input-row"><input id="question-input" placeholder="What is this webpage mainly about?" required><button>Ask <span aria-hidden="true">→</span></button></div><p class="answer" id="answer"></p></form></div>`;
  modal.hidden = false; document.body.style.overflow = 'hidden'; const saveButton = document.createElement('button'); saveButton.className = 'export-button'; saveButton.id = 'save-analysis'; saveButton.type = 'button'; saveButton.textContent = 'Save research'; detailContent.querySelector('.detail-toolbar > div').prepend(saveButton);
  saveButton.addEventListener('click', () => saveResearch(sample));
  $('#pdf-export').addEventListener('click', () => exportPdf(sample));
  $('#question-form').addEventListener('submit', event => { event.preventDefault(); $('#answer').textContent = `Based on this ${live ? 'live' : 'demo'} analysis: ${sample.summary}`; });
}
function downloadBlob(content, type, filename) { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }
function exportPdf(sample) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const generatedAt = new Date().toLocaleString();
  printWindow.document.write(`<html><head><title>WebLens Analysis - ${sample.title}</title><style>
    body{font-family:Arial,sans-serif;line-height:1.5;padding:70px 40px 50px;color:#162321;position:relative}
    h1{font-size:28px}
    h2{margin-top:28px;border-top:1px solid #ddd;padding-top:12px}
    .pdf-watermark{position:fixed;top:42%;left:0;right:0;text-align:center;font-size:70px;font-weight:700;color:rgba(31,115,103,0.12);transform:rotate(-28deg);z-index:0}
    .pdf-header{position:fixed;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:14px 40px;border-bottom:1px solid #ccc;font-size:13px;font-weight:700;color:#1f7367}
    .pdf-footer{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:10px 40px;border-top:1px solid #ccc;font-size:10px;color:#667572}
    .content{position:relative;z-index:1}
    @media print{@page{margin:70px 40px 50px}}
  </style></head><body>
    <div class="pdf-watermark">WebLens AI</div>
    <div class="pdf-header"><span>WebLens AI — Website Intelligence Report</span><span>${generatedAt}</span></div>
    <div class="content">
      <h1>${sample.title}</h1><p>${sample.url ?? `https://${sample.domain}`}</p>
      <h2>AI Summary</h2><p>${sample.summary}</p>
      <h2>Key Points</h2><ul>${sample.points.map(point => `<li>${point}</li>`).join('')}</ul>
      <h2>Key Topics</h2><p>${sample.topics.join(', ')}</p>
      <h2>Target Audience</h2><p>${sample.audience}</p>
      <h2>Page Structure</h2><p>${sample.headings.join(' | ')}</p>
    </div>
    <div class="pdf-footer"><span>Generated by WebLens AI — weblens.ai</span><span>Confidential research summary</span></div>
    <script>window.onload=()=>window.print();<\/script>
  </body></html>`);
  printWindow.document.close();
}
function openAccountModal(tab = 'signup') { $('#account-modal').hidden = false; document.body.style.overflow = 'hidden'; switchAccountTab(tab); }
function closeAccountModal() { $('#account-modal').hidden = true; document.body.style.overflow = ''; }
function switchAccountTab(tab) {
  document.querySelectorAll('.account-tab').forEach(button => { const active = button.dataset.tab === tab; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
  document.querySelectorAll('.account-form').forEach(form => { form.hidden = form.dataset.panel !== tab; });
}
function savedResearch() { return JSON.parse(localStorage.getItem('weblens-saved-research') ?? '[]'); }
function saveResearch(sample) { const saved = savedResearch().filter(item => item.domain !== sample.domain); saved.unshift({ ...sample, savedAt: new Date().toISOString() }); localStorage.setItem('weblens-saved-research', JSON.stringify(saved)); renderLibrary(); const button = $('#save-analysis'); if (button) button.textContent = 'Saved'; }
function renderLibrary(query = '') { const results = savedResearch().filter(item => `${item.domain} ${item.title} ${item.summary}`.toLowerCase().includes(query.toLowerCase())); $('#saved-list').innerHTML = results.length ? results.map((item, index) => `<div class="saved-item"><div><strong>${item.title}</strong><span>${item.domain}</span></div><button type="button" data-delete-saved="${index}">Delete</button></div>`).join('') : '<p class="library-empty">Your saved analyses will appear here.</p>'; }
$('#modal-close').addEventListener('click', () => { modal.hidden = true; document.body.style.overflow = ''; });
modal.addEventListener('click', event => { if (event.target === modal) $('#modal-close').click(); });
$('#analyser-form').addEventListener('submit', async event => {
  event.preventDefault(); const input = $('#url-input'); const error = $('#form-error'); error.textContent = '';
  try { const parsed = new URL(input.value); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Please enter a valid public webpage URL.'); } catch { error.textContent = 'Please enter a valid public webpage URL.'; return; }
  const gate = checkTrialAllowed();
  if (!gate.ok) { error.textContent = gate.message; if (gate.promptSignup) openAccountModal('signup'); return; }
  const status = $('#analysis-status'); status.hidden = false; let progress = 0; const steps = [...document.querySelectorAll('[data-step]')];
  const timer = setInterval(() => { progress = Math.min(progress + 25, 90); $('#progress-bar').style.width = `${progress}%`; $('#status-percent').textContent = `${progress}%`; steps.forEach((step, index) => step.classList.toggle('active', index <= Math.floor(progress / 25))); }, 500);
  try {
    const response = await fetch(ANALYZE_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: input.value }) });
    if (!response.ok) throw new Error('Live analysis is not connected yet. Try a demo analysis below.');
    const analysis = await response.json(); await recordAnalysisUsage(); clearInterval(timer); $('#progress-bar').style.width = '100%'; $('#status-percent').textContent = '100%'; openDetail({ ...analysis, title: analysis.title ?? analysis.page_title, summary: analysis.summary ?? analysis.executive_summary, domain: analysis.domain ?? new URL(input.value).hostname, points: analysis.points ?? analysis.key_points ?? [], topics: analysis.topics ?? analysis.key_topics ?? [], audience: analysis.audience ?? analysis.target_audience ?? 'Not found on the webpage.', headings: analysis.headings ?? [], links: Array.isArray(analysis.links) ? analysis.links.length : 0, type: 'Live webpage' }, true);
  } catch (requestError) { clearInterval(timer); status.hidden = true; error.textContent = requestError.message; }
});
$('#research-button').addEventListener('click', () => { document.querySelector('#research').scrollIntoView({ behavior: 'smooth' }); });
$('#library-search').addEventListener('input', event => renderLibrary(event.target.value));
$('#saved-list').addEventListener('click', event => { const button = event.target.closest('[data-delete-saved]'); if (!button) return; const saved = savedResearch(); saved.splice(Number(button.dataset.deleteSaved), 1); localStorage.setItem('weblens-saved-research', JSON.stringify(saved)); renderLibrary($('#library-search').value); });

/* ---------- Account modal wiring ---------- */
$('#signin-button').addEventListener('click', () => openAccountModal('signup'));
$('#account-close').addEventListener('click', closeAccountModal);
document.querySelectorAll('.account-tab').forEach(button => button.addEventListener('click', () => switchAccountTab(button.dataset.tab)));
$('#signout-button').addEventListener('click', () => { setStoredSession(null); profile = null; updateAccountUI(); updateUsage(); });

$('#signup-form').addEventListener('submit', async event => {
  event.preventDefault();
  const error = $('#signup-error'); error.textContent = '';
  if (!SUPABASE_ANON_KEY) { error.textContent = 'Account sign-up is not configured yet.'; return; }
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value;
  const confirm = $('#signup-confirm').value;
  if (password.length < 8) { error.textContent = 'Password must be at least 8 characters.'; return; }
  if (password !== confirm) { error.textContent = 'Passwords do not match.'; return; }
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!response.ok) { const body = await response.json().catch(() => ({})); error.textContent = body.msg || body.error_description || 'We could not create your account. Please try again.'; return; }
  const body = await response.json();
  if (body.access_token) {
    // Email confirmation is disabled on the project, so sign-up returns a session immediately.
    setStoredSession({ access_token: body.access_token, refresh_token: body.refresh_token, expires_at: body.expires_at, user: body.user });
    await fetchProfile(); updateAccountUI(); updateUsage(); closeAccountModal();
  } else {
    error.textContent = 'Account created. You can now sign in.';
    switchAccountTab('signin');
  }
});
$('#signin-form').addEventListener('submit', async event => {
  event.preventDefault();
  const error = $('#signin-error'); error.textContent = '';
  const email = $('#signin-email').value.trim(); const password = $('#signin-password').value;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!response.ok) { error.textContent = 'Incorrect email or password.'; return; }
  const body = await response.json();
  setStoredSession({ access_token: body.access_token, refresh_token: body.refresh_token, expires_at: body.expires_at, user: body.user });
  await fetchProfile(); updateAccountUI(); updateUsage(); closeAccountModal();
});
$('#forgot-form').addEventListener('submit', async event => {
  event.preventDefault();
  const error = $('#forgot-error'); error.textContent = '';
  const email = $('#forgot-email').value.trim();
  const redirectTo = `${location.origin}${location.pathname}#reset-password`;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, options: { redirect_to: redirectTo } }) });
  if (!response.ok) { error.textContent = 'We could not send a reset link. Please try again.'; return; }
  error.textContent = 'Reset link sent. Check your email and open it on this device.';
});
$('#reset-form').addEventListener('submit', async event => {
  event.preventDefault();
  const error = $('#reset-error'); error.textContent = '';
  const newPassword = $('#reset-password').value; const confirm = $('#reset-confirm').value;
  if (newPassword.length < 8) { error.textContent = 'Password must be at least 8 characters.'; return; }
  if (newPassword !== confirm) { error.textContent = 'Passwords do not match.'; return; }
  const updateResponse = await authFetch('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password: newPassword }) });
  if (!updateResponse.ok) { error.textContent = 'We could not set the new password. Please try again — the link may have expired.'; return; }
  await fetchProfile(); updateAccountUI(); updateUsage();
  error.textContent = ''; closeAccountModal();
});
$('#payment-button').addEventListener('click', () => { alert('Payments require a dedicated provider such as Stripe. An OpenAI API key is used for AI analysis, not payment processing.'); });

/* ---------- Password-reset link landing (Supabase redirects with #access_token=...&type=recovery) ---------- */
function decodeJwtUser(token) {
  try { const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); return { id: payload.sub, email: payload.email }; }
  catch { return null; }
}
function handleRecoveryRedirect() {
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (hashParams.get('type') !== 'recovery' || !hashParams.get('access_token')) return;
  const accessToken = hashParams.get('access_token');
  setStoredSession({ access_token: accessToken, refresh_token: hashParams.get('refresh_token'), expires_at: Number(hashParams.get('expires_at')), user: decodeJwtUser(accessToken) });
  history.replaceState(null, '', location.pathname + location.search);
  openAccountModal('reset');
}

renderSamples(); renderLibrary(); updateUsage();
handleRecoveryRedirect();
restoreSession().then(updateUsage);

