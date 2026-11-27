import { api } from './api.js';

const app = document.querySelector('#app');
const dialog = document.querySelector('#editor');
const state = { user: null, subjects: [], topics: [], tasks: [], tags: [], dashboard: null,
  view: 'dashboard', subjectId: null, filters: { subjectId: '', status: '', tagId: '', q: '' }, filteredTasks: [], filterRequest: 0 };
let authMode = 'login';
let toastTimer;
const e = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const icons = {
 book: '<path d="M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v15h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3z"/><path d="M12 6v15"/>',
 grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 tasks: '<rect x="4" y="4" width="16" height="17" rx="3"/><path d="M9 4V2h6v2M8 10l2 2 5-5M8 16h8"/>',
 tag: '<path d="M20 13l-7 7a2 2 0 0 1-3 0l-8-8V3h9l9 8a2 2 0 0 1 0 2z"/><circle cx="7" cy="7" r="1"/>',
 user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12l4 4L19 6"/>',
 clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2"/>',
 trend: '<path d="M3 17l6-6 4 4 8-10M15 5h6v6"/>',
 edit: '<path d="M16 3l5 5-12 12-6 1 1-6zM13 6l5 5"/>',
 trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
 close: '<path d="M6 6l12 12M18 6L6 18"/>',
 logout: '<path d="M9 4H4v16h5M9 12h12M17 8l4 4-4 4"/>',
 folder: '<path d="M3 6V4h6l3 3h9v14H3z"/>',
 leaf: '<path d="M20 3C9 2 2 7 5 15c7 7 16-1 15-12zM5 21L15 10"/>',
 menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
 sparkle: '<path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>',
 back: '<path d="M15 5l-7 7 7 7"/>', code: '<path d="M8 5l-6 7 6 7M16 5l6 7-6 7M14 3l-4 18"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const brand = () => `<div class="brand"><span class="brand-mark">${icon('book')}</span>Lernraum<span style="color:#a99bdc">.</span></div>`;
const btn = (label, action, symbol = '', cls = '') => `<button class="btn ${cls}" data-action="${action}">${symbol ? icon(symbol) : ''}${label}</button>`;
const ib = (label, action, symbol, id = '') => `<button class="icon-btn" title="${e(label)}" aria-label="${e(label)}" data-action="${action}" data-id="${id}">${icon(symbol)}</button>`;
const names = { dashboard: 'Dashboard', subjects: 'Meine Fächer', tasks: 'Aufgaben', tags: 'Schlagwörter', profile: 'Mein Profil' };
const statusNames = { TODO: 'Offen', IN_PROGRESS: 'In Arbeit', DONE: 'Erledigt' };
const priorityNames = { LOW: 'Niedrig', NORMAL: 'Normal', HIGH: 'Hoch' };
const subjectOf = id => state.subjects.find(s => s.id === Number(id));
const topicOf = id => state.topics.find(t => t.id === Number(id));
const initials = name => Array.from(name || '?')[0].toUpperCase();
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const humanDate = date => !date ? 'Ohne Termin' : date === localToday() ? 'Heute' : new Intl.DateTimeFormat('de-AT', {day:'numeric',month:'short'}).format(new Date(date+'T12:00:00'));
const art = () => `<svg class="hero-art" viewBox="0 0 220 190" aria-hidden="true"><circle cx="119" cy="98" r="75" fill="#e3dcfa"/><ellipse cx="118" cy="165" rx="75" ry="9" fill="#d5cbed"/><g transform="rotate(-12 110 100)"><rect x="49" y="121" width="131" height="23" rx="5" fill="#9c8adb"/><path d="M59 125h116v12H59z" fill="#f4efff"/><rect x="38" y="98" width="126" height="25" rx="5" fill="#7460bd"/><path d="M47 103h111v13H47z" fill="#eee8fc"/><rect x="60" y="35" width="88" height="77" rx="6" fill="#8066cc"/><path d="M69 40h29q8 0 8 7v58q-5-6-12-6H69z" fill="#fff"/><path d="M106 47q0-7 8-7h25v59h-22q-6 0-11 6z" fill="#f4efff"/><path d="M78 54h18M78 64h18M78 74h13M116 54h14M116 64h14" stroke="#d3c6ec" stroke-width="3" stroke-linecap="round"/></g><path d="M170 44l4 9 10 3-10 4-4 9-3-9-10-4 10-3z" fill="#c29f57"/><circle cx="39" cy="65" r="4" fill="#b3a2dc"/><path d="M183 137c-12-17-5-27 2-20 9-4 11 8-2 20" fill="#99bda8"/></svg>`;

function toast(message, error = false) {
  const node = document.querySelector('#toast'); node.textContent = message;
  node.className = 'toast' + (error ? ' error' : ''); node.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { node.hidden = true; }, 5000);
}
function failure(error) {
  if (error.status === 401) { state.user = null; dialog.close(); renderLogin('Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.'); }
  else toast(error.message, true);
}
function showFormError(form, error) {
  const node = form.querySelector('.error-box');
  node.hidden = false;
  node.textContent = error.message + Object.entries(error.errors || {}).map(([key,value]) => `\n${key}: ${value}`).join('');
  node.scrollIntoView({ block: 'nearest' });
}
async function reload() {
  const [user, dashboard, subjects, topics, tasks, tags] = await Promise.all([api.me(), api.dashboard(), api.subjects(), api.topics(), api.tasks(), api.tags()]);
  Object.assign(state, {user,dashboard,subjects,topics,tasks,tags});
  if (state.subjectId && !subjectOf(state.subjectId)) state.subjectId = null;
}
function renderLogin(message = '') {
  app.innerHTML = `<div class="login-shell"><section class="login-art">${brand()}<div class="login-story"><div class="eyebrow">Dein nächster kleiner Schritt</div><h1>Wissen wächst.<br>Mit dir.</h1><p>Bring Ordnung in deine Themen und behalte im Blick, was du als Nächstes lernen möchtest.</p><div class="login-illustration" style="position:relative">${art()}</div></div><div class="login-footer">Ein Ort für deine Fächer. Und für deine Fortschritte.</div></section><main class="login-form-side"><div class="login-form-wrap"><div class="login-mobile-brand">${brand()}</div><h2>${authMode === 'login' ? 'Schön, dass du da bist.' : 'Dein Lernraum wartet.'}</h2><p>${authMode === 'login' ? 'Melde dich an und mach dort weiter, wo du aufgehört hast.' : 'Erstelle ein Konto und starte mit deinem ersten Fach.'}</p><div class="login-tabs"><button data-auth="login" class="${authMode === 'login' ? 'active' : ''}">Anmelden</button><button data-auth="register" class="${authMode === 'register' ? 'active' : ''}">Konto erstellen</button></div><form id="auth-form">${authMode === 'register' ? field('displayName','Dein Name','text','', 'required maxlength="80" autocomplete="name"') : ''}${field('username','Benutzername','text','','required maxlength="40" autocomplete="username"')}${field('password','Passwort','password','','required maxlength="128" '+(authMode === 'register' ? 'minlength="8" autocomplete="new-password"' : 'autocomplete="current-password"'))}<div class="error-box" role="alert" ${message ? '' : 'hidden'}>${e(message)}</div><button class="btn primary" type="submit">${authMode === 'login' ? 'Anmelden' : 'Konto erstellen'}</button></form><div class="demo-note">Einfach kennenlernen? <button data-action="demo">Demo ausprobieren</button><br><strong>demo</strong> · Passwort <strong>Lernen123!</strong></div></div></main></div>`;
}
function shell() {
  const user = state.user; const d = state.dashboard;
  app.innerHTML = `<aside class="sidebar">${brand()}<div class="nav-label">DEIN LERNRAUM</div><nav class="nav" aria-label="Hauptnavigation">${[['dashboard','grid'],['subjects','book'],['tasks','tasks'],['tags','tag']].map(([view,symbol])=>`<button data-view="${view}" class="${state.view === view ? 'active' : ''}" ${state.view === view ? 'aria-current="page"' : ''}>${icon(symbol)}${names[view]}${view === 'tasks' && d.openTasks ? `<span class="badge">${d.openTasks}</span>` : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="side-note">${icon('sparkle')}<h3>Kleine Schritte zählen.</h3><p>Eine erledigte Aufgabe ist ein Stück mehr verstanden.</p></div><nav class="nav"><button data-view="profile" class="${state.view === 'profile' ? 'active' : ''}">${icon('user')}Mein Profil</button></nav><div class="side-user"><div class="avatar">${e(initials(user.profile.displayName))}</div><div><div class="name">${e(user.profile.displayName)}</div><small>Dein Lernkonto</small></div>${ib('Abmelden','logout','logout')}</div></div></aside><div class="workspace"><header class="topbar"><div class="row"><button class="icon-btn mobile-menu" data-action="menu" aria-label="Menü öffnen">${icon('menu')}</button><div class="breadcrumb">Mein Lernraum&nbsp; / &nbsp;<strong>${names[state.view]}</strong></div></div><div class="top-right"><span class="today">${icon('calendar')}${e(new Intl.DateTimeFormat('de-AT',{day:'numeric',month:'long',year:'numeric'}).format(new Date()))}</span><button class="avatar" data-view="profile" aria-label="Mein Profil öffnen">${e(initials(user.profile.displayName))}</button></div></header><main class="content" id="main-content">${renderView()}</main></div>`;
}
function heading(title, subtitle, actions = '') { return `<div class="page-heading"><div><h1>${e(title)}</h1><p>${e(subtitle)}</p></div><div class="heading-actions">${actions}</div></div>`; }
function renderView() {
  if (state.view === 'dashboard') return dashboard();
  if (state.view === 'subjects') return state.subjectId ? subjectDetail() : subjectsPage();
  if (state.view === 'tasks') return tasksPage();
  if (state.view === 'tags') return tagsPage();
  return profilePage();
}
function dashboard() {
  const d = state.dashboard;
  return heading(`Hallo, ${d.displayName} ☀`, 'Ein guter Tag, um etwas Neues zu verstehen.', btn('Neue Aufgabe','new-task','plus','primary')) +
    `<div class="hero-grid"><section class="hero"><div class="hero-text"><div class="eyebrow">Dein Lernen. Dein Tempo.</div><h2>Große Ziele beginnen<br>mit kleinen Schritten.</h2><p>${e(d.learningGoal || 'Lege dein Lernziel im Profil fest und mach heute den ersten Schritt.')}</p></div>${art()}</section><section class="focus-card"><div class="focus-top">${icon('clock')}Dein tägliches Lernziel</div><div class="focus-number">${d.dailyMinutes}<span>Minuten</span></div><p>Ein Ziel für deinen Tag, ganz ohne Zeitdruck.</p><button class="text-button" data-view="profile">Lernziel anpassen</button></section></div>` +
    `<div class="stats">${stat('book','violet',d.subjectCount,'Meine Fächer')}${stat('tasks','orange',d.openTasks,'Offene Aufgaben')}${stat('check','green',d.doneTasks,'Erledigte Aufgaben')}${stat('calendar','red',d.overdueTasks,'Überfällige Aufgaben')}</div>` +
    `<section><div class="section-head"><h2>Deine Fächer</h2><button class="text-button" data-view="subjects">Alle Fächer ansehen</button></div><div class="subject-grid">${state.subjects.length ? state.subjects.slice(0,3).map(subjectCard).join('') : empty('Noch ein unbeschriebenes Blatt','Lege dein erstes Fach an und sammle deine Themen.',btn('Fach anlegen','new-subject','plus','primary'))}</div></section>` +
    `<div class="dashboard-lower"><section class="panel"><div class="panel-heading"><h2>Als Nächstes</h2><button class="text-button" data-view="tasks">Alle Aufgaben</button></div>${d.upcomingTasks.length ? d.upcomingTasks.map(taskRow).join('') : empty('Platz zum Durchatmen','Keine offenen Aufgaben mit Termin.')}</section><aside class="quote-card">${icon('leaf')}<h3>Du musst nicht alles<br>auf einmal können.</h3><p>${d.totalTasks ? `${d.doneTasks} von ${d.totalTasks} Aufgaben sind geschafft. Dein Fortschritt wächst mit jedem Schritt.` : 'Fang mit einer einzigen Aufgabe an.'}</p><div style="width:100%"><div class="row spread small"><span>Dein Fortschritt</span><strong>${d.progressPercent}%</strong></div><div class="progress"><span style="width:${d.progressPercent}%;background:#75a995"></span></div></div></aside></div>`;
}
function stat(symbol, cls, value, label) { return `<div class="stat"><div class="stat-icon ${cls}">${icon(symbol)}</div><div><div class="stat-number">${value}</div><div class="stat-label">${label}</div></div></div>`; }
function empty(title, text, actions='') { return `<div class="empty">${icon('book')}<h3>${e(title)}</h3><p>${e(text)}</p>${actions}</div>`; }
function subjectCard(subject) {
  const progress = state.dashboard.subjects.find(s=>s.id===subject.id) || {total:0,done:0,percent:0};
  const count = state.topics.filter(t=>t.subjectId===subject.id).length;
  return `<article class="subject-card" style="--subject-color:${e(subject.color)}"><div class="subject-symbol">${icon('book')}</div><span class="card-corner">${count} Themen</span><h3><button class="subject-title" data-action="open-subject" data-id="${subject.id}">${e(subject.name)}</button></h3><p>${e(subject.description || 'Hier ist Platz für neue Gedanken.')}</p><div class="meta"><span>${progress.done} von ${progress.total} Aufgaben erledigt</span><strong>${progress.percent}%</strong></div><div class="progress"><span style="width:${progress.percent}%"></span></div></article>`;
}
function subjectsPage() { return heading('Meine Fächer','Dein Wissen, gut sortiert.',btn('Neues Fach','new-subject','plus','primary'))+`<div class="subject-grid">${state.subjects.length ? state.subjects.map(subjectCard).join('') : empty('Dein erstes Fach wartet','Zum Beispiel Java, Datenbanken oder Spring Boot.',btn('Fach anlegen','new-subject','plus','primary'))}</div>`; }
function subjectDetail() {
  const s = subjectOf(state.subjectId);
  let rows = '';
  function children(parentId,depth) {
    for (const topic of state.topics.filter(t=>t.subjectId===s.id && t.parentId===parentId)) {
      const count = state.tasks.filter(t=>t.topicId===topic.id).length;
      rows += `<article class="topic-row" style="--depth:${depth}">${icon(depth?'book':'folder')}<div class="topic-info"><h3>${e(topic.name)}<span class="topic-badge">${count} Aufgaben</span></h3>${topic.notes ? `<p>${e(topic.notes)}</p>` : ''}</div><div class="topic-actions">${ib('Aufgabe in '+topic.name+' anlegen','topic-task','plus',topic.id)}${ib('Unterthema anlegen','subtopic','folder',topic.id)}${ib('Thema bearbeiten','edit-topic','edit',topic.id)}</div></article>`;
      children(topic.id,depth+1);
    }
  }
  children(null,0);
  const tasks = state.tasks.filter(t=>t.subjectId===s.id);
  return `<button class="text-button back-button" data-action="back-subjects">${icon('back')}Alle Fächer</button>`+
    heading(s.name,s.description,`${ib('Fach bearbeiten','edit-subject','edit',s.id)}${btn('Neues Thema','new-topic','plus','primary')}`)+
    `<section class="panel"><div class="panel-heading"><h2>Themen & Unterthemen</h2><span class="small muted">${state.topics.filter(t=>t.subjectId===s.id).length} Themen</span></div>${rows || empty('Was möchtest du lernen?','Lege ein Thema an. Unterthemen kannst du später ergänzen.',btn('Thema anlegen','new-topic','plus','primary'))}</section><section class="panel section-gap"><div class="panel-heading"><h2>Aufgaben in diesem Fach</h2>${btn('Aufgabe','new-task','plus')}</div>${tasks.length ? tasks.map(taskRow).join('') : empty('Noch keine Aufgaben','Erstelle zuerst ein Thema und dann deine erste Aufgabe.')}</section>`;
}
function taskRow(task) {
  const subject = subjectOf(task.subjectId); const topic = topicOf(task.topicId);
  const overdue = task.status!=='DONE' && task.dueDate && task.dueDate<localToday();
  return `<article class="task-row"><button class="status-toggle ${task.status}" aria-label="Status ändern: ${e(task.title)} (${statusNames[task.status]})" title="${statusNames[task.status]} – klicken zum Weiterschalten" data-action="toggle-task" data-id="${task.id}">${task.status==='DONE' ? icon('check') : task.status==='IN_PROGRESS' ? icon('clock') : ''}</button><div class="task-info"><button class="task-title" data-action="edit-task" data-id="${task.id}">${e(task.title)}</button><div class="task-meta"><span class="dot" style="--subject-color:${e(subject?.color)}"></span><span>${e(subject?.name)} / ${e(topic?.name)}</span>${task.tagIds.map(id=>`<span class="tag-chip">${e(state.tags.find(t=>t.id===id)?.name)}</span>`).join('')}</div></div>${task.priority==='HIGH' ? '<span class="priority HIGH">Hoch</span>' : ''}<div class="task-date ${overdue?'overdue':''}">${e(humanDate(task.dueDate))}<div>${task.status==='DONE' ? 'Erledigt' : overdue ? 'Überfällig' : statusNames[task.status]}</div></div></article>`;
}
function options(list,value,label,selected,placeholder='Bitte wählen') { return `<option value="">${placeholder}</option>`+list.map(item=>`<option value="${e(item[value])}" ${String(item[value])===String(selected)?'selected':''}>${e(item[label])}</option>`).join(''); }
function tasksPage() {
  const f=state.filters;
  return heading('Deine Aufgaben','Von „Das will ich lernen“ zu „Das habe ich verstanden“.',btn('Neue Aufgabe','new-task','plus','primary'))+
    `<div class="filters"><input id="task-search" aria-label="Aufgaben durchsuchen" placeholder="Aufgaben durchsuchen …" value="${e(f.q)}"><select data-filter="subjectId" aria-label="Nach Fach filtern">${options(state.subjects,'id','name',f.subjectId,'Alle Fächer')}</select><select data-filter="status" aria-label="Nach Status filtern">${options(Object.entries(statusNames).map(([id,name])=>({id,name})),'id','name',f.status,'Jeder Status')}</select><select data-filter="tagId" aria-label="Nach Schlagwort filtern">${options(state.tags,'id','name',f.tagId,'Alle Schlagwörter')}</select></div><p class="result-count" id="result-count"></p><section class="panel" id="task-results"></section>`;
}
async function filterTasks() {
  const requestId=++state.filterRequest;
  try {
    const result=await api.tasks(state.filters);
    if (requestId!==state.filterRequest || state.view!=='tasks') return;
    state.filteredTasks=result;
    document.querySelector('#result-count').textContent=`${result.length} Aufgaben gefunden`;
    document.querySelector('#task-results').innerHTML=result.length ? result.map(taskRow).join('') : empty('Hier ist es noch ruhig','Keine Aufgaben für diese Auswahl. Passe die Filter an oder lege eine Aufgabe an.');
  } catch(error) { failure(error); }
}
function tagsPage() {
  return heading('Schlagwörter','Ein Thema ist der Ort. Schlagwörter verbinden deine Aufgaben.',btn('Neues Schlagwort','new-tag','plus','primary'))+
    `<div class="tag-list">${state.tags.length ? state.tags.map(tag=>`<div class="tag-line"><div class="row">${icon('tag')}<span class="tag-name">${e(tag.name)}</span></div><div class="row"><small>${state.tasks.filter(t=>t.tagIds.includes(tag.id)).length} Aufgaben</small>${ib('Schlagwort bearbeiten','edit-tag','edit',tag.id)}</div></div>`).join('') : empty('Gut vernetzt lernen','Ein Schlagwort wie „prüfung“ kann Aufgaben aus mehreren Fächern verbinden.')}</div>`;
}
function profilePage() {
  const p=state.user.profile;
  return heading('Mein Profil','Dein Lernraum soll zu dir passen.')+`<form id="profile-form" class="profile-card"><div class="avatar">${e(initials(p.displayName))}</div><p class="profile-hint">Angemeldet als <strong>${e(state.user.username)}</strong></p>${field('displayName','Dein Name','text',p.displayName,'required maxlength="80"')}${area('learningGoal','Was möchtest du erreichen?',p.learningGoal,500)}${field('dailyMinutes','Tägliches Lernziel in Minuten','number',p.dailyMinutes,'required min="5" max="480"')}<p class="profile-hint">Das Lernziel ist eine persönliche Orientierung. Es werden keine Lernzeiten gemessen.</p><div class="error-box" role="alert" hidden></div><button class="btn primary" type="submit">Profil speichern</button></form>`;
}
function render() { shell(); if(state.view==='tasks') filterTasks(); }
function field(name,label,type,value='',attrs='') { return `<div class="form-field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${e(value)}" ${attrs}></div>`; }
function area(name,label,value='',max=4000) { return `<div class="form-field"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" maxlength="${max}">${e(value)}</textarea></div>`; }
function select(name,label,html) { return `<div class="form-field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}" required>${html}</select></div>`; }
function parentOptions(subjectId,currentId,selected) { return options(state.topics.filter(t=>t.subjectId===Number(subjectId)&&t.id!==currentId),'id','name',selected,'Kein Eltern-Thema (Hauptthema)'); }
function topicOptions(selected) { return options(state.topics.filter(t=>!state.subjectId || t.subjectId===state.subjectId).map(t=>({...t,label:`${subjectOf(t.subjectId)?.name} / ${t.name}`})),'id','label',selected); }
function edit(kind,id=null,extra={}) {
  let item, fields, title;
  if(kind==='subject') {
    item=state.subjects.find(s=>s.id===id)||{}; title=id?'Fach bearbeiten':'Neues Fach';
    fields=field('name','Name des Fachs','text',item.name,'required maxlength="80"')+area('description','Beschreibung',item.description,1000)+field('color','Farbe','color',item.color||'#6d5ce7');
  } else if(kind==='topic') {
    if(!state.subjects.length) return toast('Lege zuerst ein Fach an.',true);
    item=state.topics.find(t=>t.id===id)||{subjectId:state.subjectId||state.subjects[0].id,...extra};title=id?'Thema bearbeiten':extra.parentId?'Neues Unterthema':'Neues Thema';
    fields=select('subjectId','Fach',options(state.subjects,'id','name',item.subjectId))+`<div class="form-field"><label for="f-parentId">Übergeordnetes Thema</label><select id="f-parentId" name="parentId">${parentOptions(item.subjectId,id,item.parentId)}</select></div>`+field('name','Name des Themas','text',item.name,'required maxlength="100"')+area('notes','Notizen',item.notes);
  } else if(kind==='task') {
    if(!state.topics.length || (state.subjectId&&!state.topics.some(t=>t.subjectId===state.subjectId))) return toast('Lege zuerst ein Thema für deine Aufgabe an.',true);
    item=state.tasks.find(t=>t.id===id)||{status:'TODO',priority:'NORMAL',tagIds:[],...extra};title=id?'Aufgabe bearbeiten':'Neue Aufgabe';
    fields=field('title','Titel','text',item.title,'required maxlength="140"')+select('topicId','Thema',topicOptions(item.topicId))+area('description','Aufgabenstellung / Notizen',item.description)+`<div class="form-grid">${select('status','Status',Object.entries(statusNames).map(([k,v])=>`<option value="${k}" ${item.status===k?'selected':''}>${v}</option>`).join(''))}${select('priority','Priorität',Object.entries(priorityNames).map(([k,v])=>`<option value="${k}" ${item.priority===k?'selected':''}>${v}</option>`).join(''))}</div>`+field('dueDate','Fällig am (optional)','date',item.dueDate)+`<div class="form-field"><label>Schlagwörter</label><div class="checkboxes">${state.tags.length ? state.tags.map(tag=>`<label class="check-tag"><input type="checkbox" name="tagIds" value="${tag.id}" ${item.tagIds.includes(tag.id)?'checked':''}>${e(tag.name)}</label>`).join('') : '<small>Du kannst unter „Schlagwörter“ neue Begriffe anlegen.</small>'}</div></div>`;
  } else {
    item=state.tags.find(t=>t.id===id)||{};title=id?'Schlagwort bearbeiten':'Neues Schlagwort';
    fields=field('name','Name des Schlagworts','text',item.name,'required maxlength="30"')+'<p class="muted small">Zum Beispiel „praxis“, „wiederholen“ oder „prüfung“. Schlagwörter werden kleingeschrieben.</p>';
  }
  document.querySelector('#dialog-content').innerHTML=`<form id="edit-form" data-kind="${kind}" data-id="${id||''}"><div class="dialog-head"><h2 id="dialog-title">${title}</h2><button type="button" class="icon-btn" data-action="close-dialog" aria-label="Schließen">${icon('close')}</button></div><div class="dialog-body">${fields}<div class="error-box" role="alert" hidden></div></div><div class="dialog-actions">${id ? `<button type="button" class="btn danger" data-action="delete" data-kind="${kind}" data-id="${id}">${icon('trash')}Löschen</button>` : ''}<button type="button" class="btn" data-action="close-dialog">Abbrechen</button><button class="btn primary" type="submit">Speichern</button></div></form>`;
  // Ein bestehendes Thema kann laut Vertrag nicht in ein anderes Fach wechseln.
  if(kind==='topic'&&id) document.querySelector('#f-subjectId').disabled=true;
  dialog.showModal();
}
const resources={subject:'subjects',topic:'topics',task:'tasks',tag:'tags'};
async function action(button) {
  const id=Number(button.dataset.id), act=button.dataset.action;
  try {
    if(act==='menu') { document.querySelector('.sidebar').classList.toggle('open');return; }
    if(act==='close-dialog') {dialog.close();return;}
    if(act==='demo') {button.disabled=true;await api.login({username:'demo',password:'Lernen123!'});await reload();state.view='dashboard';state.subjectId=null;render();return;}
    if(act==='logout') {await api.logout();state.user=null;state.subjectId=null;state.view='dashboard';renderLogin();return;}
    if(act==='open-subject') {state.view='subjects';state.subjectId=id;render();return;}
    if(act==='back-subjects') {state.subjectId=null;render();return;}
    if(act.startsWith('new-')) {edit(act.slice(4));return;}
    if(act.startsWith('edit-')) {edit(act.slice(5),id);return;}
    if(act==='subtopic') {edit('topic',null,{subjectId:topicOf(id).subjectId,parentId:id});return;}
    if(act==='topic-task') {edit('task',null,{topicId:id});return;}
    if(act==='toggle-task') {
      button.disabled=true;
      const task=state.tasks.find(t=>t.id===id);const next={TODO:'IN_PROGRESS',IN_PROGRESS:'DONE',DONE:'TODO'};
      const {topicId,title,description,priority,dueDate,tagIds}=task;
      await api.save('tasks',id,{topicId,title,description,priority,dueDate,tagIds,status:next[task.status]});
      await reload();render();toast('Status gespeichert.');return;
    }
    if(act==='delete') {
      const text=button.dataset.kind==='tag'?'Schlagwort löschen? Die Aufgaben bleiben erhalten.':'Eintrag wirklich löschen?';
      if(!confirm(text)) return;
      await api.remove(resources[button.dataset.kind],id);dialog.close();await reload();render();toast('Eintrag gelöscht.');
    }
  } catch(error) {
    if(dialog.open) showFormError(document.querySelector('#edit-form'),error);
    else if(!state.user) { renderLogin(error.message); }
    else failure(error);
  } finally {button.disabled=false;}<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Dein Lernraum für Fächer, Themen und die nächsten kleinen Schritte.">
  <meta name="theme-color" content="#6d5ce7">
  <title>Lernraum · Deine Lernplattform</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
  <script src="config.js"></script><script type="module" src="app.js"></script>
</head>
<body>
  <div id="app"><div class="loading" role="status">Dein Lernraum wird geöffnet …</div></div>
  <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
  <dialog id="editor" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog>
</body>
</html>
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.auth){authMode=button.dataset.auth;renderLogin();return;}
  if(button.dataset.view){state.view=button.dataset.view;state.subjectId=null;render();return;}
  if(button.dataset.action) action(button);
});
let searchTimer;
document.addEventListener('input',event=>{
  if(event.target.id==='task-search') {state.filters.q=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(filterTasks,220);}
});
document.addEventListener('change',event=>{
  if(event.target.dataset.filter) {state.filters[event.target.dataset.filter]=event.target.value;filterTasks();}
  if(event.target.id==='f-subjectId'&&dialog.open) document.querySelector('#f-parentId').innerHTML=parentOptions(event.target.value,null,null);
});
document.addEventListener('submit',async event=>{
  const form=event.target;if(!['auth-form','edit-form','profile-form'].includes(form.id))return;
  event.preventDefault();const submit=form.querySelector('[type=submit]');submit.disabled=true;
  const data=Object.fromEntries(new FormData(form));
  try {
    if(form.id==='auth-form') {
      await api[authMode](data);await reload();state.view='dashboard';state.subjectId=null;render();
    } else if(form.id==='profile-form') {
      data.dailyMinutes=Number(data.dailyMinutes);await api.profile(data);await reload();render();toast('Profil gespeichert.');
    } else {
      const kind=form.dataset.kind;
      if(kind==='topic') {data.subjectId=Number(form.querySelector('[name=subjectId]').value);data.parentId=data.parentId?Number(data.parentId):null;}
      if(kind==='task') {data.topicId=Number(data.topicId);data.dueDate=data.dueDate||null;data.tagIds=new FormData(form).getAll('tagIds').map(Number);}
      await api.save(resources[kind],form.dataset.id||null,data);dialog.close();await reload();render();toast('Gespeichert. Weiter geht’s!');
    }
  } catch(error) {if(error.status===401&&form.id!=='auth-form')failure(error);else showFormError(form,error);}
  finally {submit.disabled=false;}
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
try {await reload();render();} catch(error) {renderLogin(error.status===401?'':error.message);}
