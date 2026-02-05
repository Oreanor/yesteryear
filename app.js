'use strict';

// ─── Config ─────────────────────────────────────────────────────────────
const CONFIG = {
  IMG_DIR: 'img/',
  LS: {
    SORT_KEY: 'mbx_sortKey',
    SORT_DESC: 'mbx_sortDesc',
    MODE: 'mbx_viewMode',
    FAVORITES: 'mbx_favorites',
    MIGRATE: { sortKey: 'sortKey', sortDesc: 'sortDesc', viewMode: 'viewMode' }
  },
  ROW_KEYS: ['name', 'year', 'code', 'image', 'link'],
  SORT_KEYS: ['name', 'code', 'year']
};

// ─── State ──────────────────────────────────────────────────────────────
let data = [];
let sortedData = [];
let sortKey = 'name';
let sortDesc = false;
let modalIndex = -1;
let searchQuery = '';
let favoritesFilter = false;
let currentMode = getMode();

// ─── Env ────────────────────────────────────────────────────────────────
function isLocal() {
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || window.location.protocol === 'file:';
}

// ─── Storage ────────────────────────────────────────────────────────────
function getSortPrefs() {
  try {
    let key = localStorage.getItem(CONFIG.LS.SORT_KEY) ?? localStorage.getItem(CONFIG.LS.MIGRATE.sortKey);
    let desc = localStorage.getItem(CONFIG.LS.SORT_DESC) ?? localStorage.getItem(CONFIG.LS.MIGRATE.sortDesc);
    return {
      key: CONFIG.SORT_KEYS.includes(key) ? key : 'name',
      desc: desc === 'true'
    };
  } catch (e) {
    return { key: 'name', desc: false };
  }
}

function setSortPrefs(key, desc) {
  try {
    localStorage.setItem(CONFIG.LS.SORT_KEY, key);
    localStorage.setItem(CONFIG.LS.SORT_DESC, String(desc));
  } catch (e) {}
}

function getMode() {
  if (window.location.hash === '#editor') return 'editor';
  try {
    const m = localStorage.getItem(CONFIG.LS.MODE) ?? localStorage.getItem(CONFIG.LS.MIGRATE.viewMode);
    return m === 'editor' ? 'editor' : 'gallery';
  } catch (e) {
    return 'gallery';
  }
}

function setMode(mode) {
  try {
    localStorage.setItem(CONFIG.LS.MODE, mode);
  } catch (e) {}
}

function getFavorites() {
  try {
    const raw = localStorage.getItem(CONFIG.LS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setFavorites(imageFiles) {
  try {
    localStorage.setItem(CONFIG.LS.FAVORITES, JSON.stringify(imageFiles));
  } catch (e) {}
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function isFavorite(imageFile) {
  return getFavorites().includes(imageFile);
}

function toggleFavorite(imageFile) {
  const fav = getFavorites();
  const idx = fav.indexOf(imageFile);
  if (idx >= 0) fav.splice(idx, 1);
  else fav.push(imageFile);
  setFavorites(fav);
}

// ─── Data ───────────────────────────────────────────────────────────────
function yearMatchesSearch(yearStr, searchStr) {
  if (!yearStr || !searchStr) return false;
  const s = searchStr.trim();
  const y = yearStr.trim();

  if (y.toLowerCase().includes(s.toLowerCase())) return true;

  const n = parseInt(s, 10);
  if (isNaN(n)) return false;

  const year = n < 100 ? 1900 + n : n;
  const range = y.match(/(\d{4})\s*-\s*(\d{4})/);
  if (range) {
    const start = parseInt(range[1], 10);
    const end = parseInt(range[2], 10);
    return year >= start && year <= end;
  }
  const single = y.match(/(\d{4})/);
  return single ? parseInt(single[1], 10) === year : false;
}

function matchesSearch(item, q) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const name = (item.name || '').toLowerCase();
  const code = (item.code || '').toLowerCase();
  return name.includes(s) || yearMatchesSearch(item.year || '', q) || code.includes(s);
}

function getFilteredGalleryData() {
  let out = searchQuery ? sortedData.filter(item => matchesSearch(item, searchQuery)) : sortedData;
  if (favoritesFilter) out = out.filter(item => isFavorite(item.image || ''));
  return out;
}


function imgPath(filename) {
  return CONFIG.IMG_DIR + (filename || '');
}

function sortComparator(a, b) {
  const va = (a[sortKey] || '').toString();
  const vb = (b[sortKey] || '').toString();
  const cmp = va.localeCompare(vb, undefined, { numeric: sortKey === 'code' });
  return sortDesc ? -cmp : cmp;
}

function sortBy(key, noToggle) {
  if (!noToggle && sortKey === key) {
    sortDesc = !sortDesc;
  } else {
    sortKey = key;
    sortDesc = false;
  }
  data.sort(sortComparator);
  sortedData = [...data];
  setSortPrefs(sortKey, sortDesc);
  renderCurrent();
}

function renderCurrent() {
  currentMode === 'gallery' ? renderGallery() : renderEditor();
}

function loadData(json) {
  data = Array.isArray(json) ? json : [];
  sortedData = [...data];
  sortBy(sortKey, true);
  renderCurrent();
}

function collectFromDOM() {
  const rows = document.querySelectorAll('#tbody tr');
  return Array.from(rows)
    .filter(tr => tr.querySelector('input[data-key]'))
    .map(tr => {
      const obj = {};
      CONFIG.ROW_KEYS.forEach(k => {
        const inp = tr.querySelector(`input[data-key="${k}"]`);
        obj[k] = inp ? inp.value : '';
      });
      return obj;
    });
}

function toJSON() {
  return JSON.stringify(collectFromDOM(), null, 2);
}

// ─── UI helpers ─────────────────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

function updateToolbarVisibility(mode) {
  document.getElementById('viewGallery').classList.toggle('hidden', mode !== 'gallery');
  document.getElementById('viewEditor').classList.toggle('hidden', mode !== 'editor');
  document.querySelectorAll('.mode-editor').forEach(el => el.style.display = mode === 'editor' ? '' : 'none');
  document.querySelectorAll('.mode-gallery').forEach(el => el.style.display = mode === 'gallery' ? '' : 'none');
  document.getElementById('modeToggle').textContent = mode === 'gallery' ? t('catalog') : t('editor');
  const favBtn = document.getElementById('favoritesBtn');
  if (favBtn) {
    favBtn.classList.toggle('active', favoritesFilter);
    favBtn.textContent = favoritesFilter ? '♥' : '♡';
    favBtn.title = t('favorites');
  }
}

// ─── Gallery ────────────────────────────────────────────────────────────
function renderGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  const filtered = getFilteredGalleryData();
  if (filtered.length === 0) {
    if (sortedData.length === 0) {
      gallery.innerHTML = '<div class="gallery-empty"><button type="button" class="empty-load-btn" data-t="loadJson">' + t('loadJson') + '</button></div>';
      gallery.querySelector('.empty-load-btn')?.addEventListener('click', () => document.getElementById('fileInput').click());
    } else {
      gallery.innerHTML = '<p class="gallery-empty">' + (favoritesFilter ? t('noFavorites') : t('searchNoResults')) + '</p>';
    }
    return;
  }
  filtered.forEach((item) => {
    const imgFile = item.image || '';
    const fav = isFavorite(imgFile);
    const card = document.createElement('div');
    card.className = 'gallery-card';
    const imgSrc = CONFIG.IMG_DIR + (item.image || '');
    card.innerHTML = `
      <button type="button" class="card-fav ${fav ? 'active' : ''}" data-image="${escapeHtml(imgFile)}" title="${t('favorites')}" aria-label="${t('favorites')}">${fav ? '♥' : '♡'}</button>
      <img class="gallery-img-lazy" data-src="${escapeHtml(imgSrc)}" alt="${escapeHtml(item.name || '')}">
      <div class="gallery-card-body">
        <div class="gallery-card-code">${escapeHtml(item.code || '')}</div>
        <div class="gallery-card-name">${escapeHtml(item.name || '—')}</div>
        <div class="gallery-card-meta">${escapeHtml(item.year || '')}</div>
      </div>
      ${item.link ? `<div class="gallery-card-link"><a href="${escapeHtml(item.link)}" target="_blank" rel="noopener" title="${t('link')}">↗</a></div>` : ''}
    `;
    card.querySelector('.card-fav').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(imgFile);
      renderGallery();
    });
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a') && !e.target.closest('.card-fav')) {
        const idx = sortedData.indexOf(item);
        showGalleryDetail(idx >= 0 ? idx : 0);
      }
    });
    gallery.appendChild(card);
  });
  observeLazyGalleryImages();
}

let lazyGalleryObserver = null;

function observeLazyGalleryImages() {
  const container = document.querySelector('.gallery-container');
  const imgs = document.querySelectorAll('.gallery-img-lazy');
  if (!container || imgs.length === 0) return;
  if (lazyGalleryObserver) lazyGalleryObserver.disconnect();
  lazyGalleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.remove('gallery-img-lazy');
        lazyGalleryObserver?.unobserve(img);
      }
    });
  }, { root: container, rootMargin: '100px', threshold: 0.01 });
  imgs.forEach((img) => lazyGalleryObserver.observe(img));
}

function showGalleryDetail(index) {
  if (sortedData.length === 0) return;
  modalIndex = ((index % sortedData.length) + sortedData.length) % sortedData.length;
  const item = sortedData[modalIndex];
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="modal-photo-wrap">
      <img class="modal-photo" src="${CONFIG.IMG_DIR + (item.image || '')}" alt="${escapeHtml(item.name || '')}">
    </div>
    <div class="modal-data">
      <div class="modal-name">${escapeHtml(item.name || '—')}</div>
      <dl class="modal-info">
      <dt>${t('code')}</dt>
      <dd>${escapeHtml(item.code || '—')}</dd>
      <dt>${t('year')}</dt>
      <dd>${escapeHtml(item.year || '—')}</dd>
      <dt>${t('file')}</dt>
      <dd>${escapeHtml(item.image || '—')}</dd>
      ${item.link ? `<dt>${t('link')}</dt><dd><a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">${t('linkWord')}</a></dd>` : ''}
      </dl>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('show');
  const navHidden = sortedData.length <= 1 ? ' modal-nav-hidden' : '';
  document.getElementById('modalPrev').className = 'modal-nav modal-nav-left' + navHidden;
  document.getElementById('modalNext').className = 'modal-nav modal-nav-right' + navHidden;
}

function modalPrev() {
  if (sortedData.length <= 1) return;
  modalIndex = (modalIndex - 1 + sortedData.length) % sortedData.length;
  showGalleryDetail(modalIndex);
}

function modalNext() {
  if (sortedData.length <= 1) return;
  modalIndex = (modalIndex + 1) % sortedData.length;
  showGalleryDetail(modalIndex);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}

// ─── Editor ─────────────────────────────────────────────────────────────
function updatePreviewImg(tr, src) {
  const img = tr?.querySelector('.preview img');
  const noImg = tr?.querySelector('.preview .no-img');
  if (!img) return;
  img.src = imgPath(src);
  img.style.display = '';
  noImg?.classList.remove('show');
  img.onerror = () => { img.style.display = 'none'; noImg?.classList.add('show'); };
}

function syncData(e) {
  const input = e.target;
  const i = +input.dataset.i;
  const key = input.dataset.key;
  if (data[i]) data[i][key] = input.value;
  if (key === 'image') updatePreviewImg(input.closest('tr'), input.value);
}

function applyEditorSearchFilter() {
  const rows = document.querySelectorAll('#tbody tr[data-i]');
  rows.forEach(tr => {
    const i = +tr.dataset.i;
    const row = data[i];
    tr.classList.toggle('search-hidden', searchQuery && row && !matchesSearch(row, searchQuery));
  });
}

function renderEditor() {
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty"><button type="button" class="empty-load-btn" data-t="loadJson">' + t('loadJson') + '</button></td></tr>';
    tbody.querySelector('.empty-load-btn')?.addEventListener('click', () => document.getElementById('fileInput').click());
    return;
  }

  data.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.dataset.i = i;
    tr.innerHTML = `
      <td class="preview">
        <img src="${imgPath(row.image)}" alt="" loading="lazy">
        <span class="no-img">${t('noImage')}</span>
      </td>
      <td><input type="text" data-i="${i}" data-key="name" value="${escapeHtml(row.name || '')}" placeholder="${t('modelNamePlaceholder')}"></td>
      <td><input type="text" data-i="${i}" data-key="year" value="${escapeHtml(row.year || '')}" placeholder="${t('yearPlaceholder')}"></td>
      <td><input type="text" data-i="${i}" data-key="code" value="${escapeHtml(row.code || '')}" placeholder="${t('codePlaceholder')}"></td>
      <td><input type="text" data-i="${i}" data-key="image" value="${escapeHtml(row.image || '')}" placeholder="${t('imagePlaceholder')}"></td>
      <td><input type="text" data-i="${i}" data-key="link" value="${escapeHtml(row.link || '')}" placeholder="${t('linkPlaceholder')}"></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.preview img').forEach(img => {
    img.onerror = () => {
      img.style.display = 'none';
      img.nextElementSibling?.classList.add('show');
    };
  });

  tbody.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', syncData);
    input.addEventListener('change', (e) => {
      if (e.target.dataset.key === 'image') updatePreviewImg(e.target.closest('tr'), e.target.value);
    });
  });
  applyEditorSearchFilter();
}

// ─── Mode switching ─────────────────────────────────────────────────────
function switchToGallery() {
  history.replaceState(null, '', location.pathname + location.search);
  if (currentMode === 'editor') {
    data = collectFromDOM();
    sortedData = [...data];
    sortBy(sortKey, true);
  }
  currentMode = 'gallery';
  setMode('gallery');
  updateToolbarVisibility('gallery');
  renderGallery();
}

function switchToEditor() {
  history.replaceState(null, '', location.pathname + location.search + '#editor');
  if (currentMode === 'gallery') {
    data = [...sortedData];
  }
  currentMode = 'editor';
  setMode('editor');
  updateToolbarVisibility('editor');
  renderEditor();
}

// ─── Init ───────────────────────────────────────────────────────────────
document.documentElement.lang = getLang();

(function initSort() {
  const p = getSortPrefs();
  sortKey = p.key;
  sortDesc = p.desc;
})();

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalPrev').addEventListener('click', (e) => { e.stopPropagation(); modalPrev(); });
document.getElementById('modalNext').addEventListener('click', (e) => { e.stopPropagation(); modalNext(); });
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (document.getElementById('modalOverlay').classList.contains('show')) {
    if (e.key === 'ArrowLeft') modalPrev();
    if (e.key === 'ArrowRight') modalNext();
  }
});

document.getElementById('fileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      let text = String(r.result).replace(/^\uFEFF/, '').trim();
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : (parsed?.items ?? parsed?.data ?? []);
      loadData(Array.isArray(arr) ? arr : []);
    } catch (err) {
      alert(t('errorInvalidJson') + '\n' + (err.message || ''));
    }
  };
  r.readAsText(file, 'UTF-8');
  e.target.value = '';
});

const applySearch = debounce(() => {
  searchQuery = document.getElementById('searchInput').value;
  if (currentMode === 'gallery') renderGallery();
  else applyEditorSearchFilter();
}, 300);

document.getElementById('searchInput').addEventListener('input', applySearch);

document.getElementById('sortSelect').addEventListener('change', (e) => sortBy(e.target.value, true));
document.getElementById('addPhotoBtn').addEventListener('click', () => document.getElementById('addPhotoInput').click());
document.getElementById('addPhotoInput').addEventListener('change', e => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  const newRows = Array.from(files).map(f => ({
    name: '', year: '', code: '', image: f.name, link: ''
  }));
  data = newRows.concat(data);
  if (currentMode === 'editor') renderEditor();
  else { sortedData = [...data]; sortBy(sortKey, true); }
  showToast(t('addPhotoAdded', { n: newRows.length }));
  e.target.value = '';
});

document.getElementById('copyBtn').addEventListener('click', () => {
  if (data.length === 0) { showToast(t('loadJsonFirst')); return; }
  navigator.clipboard.writeText(toJSON()).then(() => showToast(t('copiedToClipboard')));
});

document.getElementById('saveBtn').addEventListener('click', () => {
  if (data.length === 0) { showToast(t('loadJsonFirst')); return; }
  const blob = new Blob([toJSON()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast(t('fileDownloaded'));
});

document.getElementById('modeToggle').addEventListener('click', () => {
  if (currentMode === 'gallery') switchToEditor();
  else switchToGallery();
});

document.getElementById('favoritesBtn').addEventListener('click', () => {
  favoritesFilter = !favoritesFilter;
  updateToolbarVisibility(currentMode);
  renderGallery();
});

document.getElementById('themeSelect').value = getTheme();
document.getElementById('themeSelect').addEventListener('change', (e) => setTheme(e.target.value));
document.getElementById('sortSelect').value = sortKey;
document.getElementById('langSelect').value = getLang();
document.documentElement.lang = getLang();
document.getElementById('langSelect').addEventListener('change', (e) => {
  setLang(e.target.value);
  document.documentElement.lang = getLang();
  applyTranslations();
  document.title = t('pageTitle');
  document.getElementById('searchInput').placeholder = t('searchPlaceholder');
  updateToolbarVisibility(currentMode);
  renderCurrent();
});

applyTranslations();
document.title = t('pageTitle');
document.getElementById('searchInput').placeholder = t('searchPlaceholder');
updateToolbarVisibility(currentMode);

fetch('data.json')
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(loadData)
  .catch(() => loadData([]));
