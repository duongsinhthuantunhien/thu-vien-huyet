/* Thư viện 100 huyệt đạo • JavaScript thuần • phiên bản 4.0 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const REGIONS = Object.freeze({
    back: 'Vai gáy và lưng',
    arm: 'Tay',
    chest: 'Ngực',
    abdomen: 'Bụng',
    'leg-front': 'Chân - mặt trước',
    'leg-back': 'Chân - mặt sau',
    head: 'Đầu và mặt'
  });
  const ALL_REGIONS = new Set(Object.values(REGIONS));
  const FAV_KEY = 'thu-vien-huyet-favorites-v1';
  const FONT_KEY = 'thu-vien-huyet-font-v1';
  const PAGE_SIZE = 12;
  const GROUP_PAGE_SIZE = 8;
  const FIELDS = ['id', 'ten', 'tenHanViet', 'tenPinyin', 'nhom', 'duongKinh',
    'viTri', 'cachXacDinh', 'tacDung', 'chiDinh', 'tuKhoa', 'hinhAnh', 'thumb', 'trangTaiLieu'];
  const state = {
    data: [], query: '', region: 'all', onlyFavorites: false, limit: PAGE_SIZE,
    favorites: new Set(), scale: 1, current: null
  };

  function norm(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function contains(text, query) {
    if (!query) return false;
    const raw = String(Array.isArray(text) ? text.join(' ') : text).toLowerCase();
    // Theo ví dụ tra cứu đã duyệt: gõ "than" ưu tiên "thận", không lẫn "thần".
    if (query === 'than') return raw.includes('thận');
    const hay = norm(raw);
    if (hay.includes(query)) return true;
    const words = query.split(' ').filter(Boolean);
    // Cụm lặp như "dau dau" phải khớp đúng cụm, không chỉ một chữ "dau".
    return words.length > 1 && new Set(words).size === words.length && words.every(word => hay.includes(word));
  }
  function element(tag, cls, txt) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (txt !== undefined) node.textContent = String(txt);
    return node;
  }
  function setText(id, value) { $(id).textContent = value || 'Chưa có thông tin'; }
  function storeGet(key, fallback) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }
  function storeSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* iframe riêng tư có thể hạn chế lưu trữ */ }
  }
  function validate(raw) {
    if (!Array.isArray(raw)) return [];
    const ids = new Set();
    return raw.filter((item) => {
      if (!item || typeof item !== 'object' || FIELDS.some(field => item[field] === undefined || item[field] === null)) return false;
      if (!/^huyet-(?:00[1-9]|0[1-9][0-9]|100)$/.test(item.id) || !ALL_REGIONS.has(item.nhom) || ids.has(item.id)) return false;
      const n = item.id.slice(-3);
      if (item.hinhAnh !== `images/huyet-${n}.jpg` || item.thumb !== `images/thumb/huyet-${n}.webp`) return false;
      if (!Number.isInteger(item.trangTaiLieu) || item.trangTaiLieu < 1 || item.trangTaiLieu > 100) return false;
      if (['ten', 'tenHanViet', 'tenPinyin', 'duongKinh', 'viTri', 'cachXacDinh'].some(k => typeof item[k] !== 'string')) return false;
      if (['tacDung', 'chiDinh', 'tuKhoa'].some(k => !Array.isArray(item[k]) || item[k].some(s => typeof s !== 'string'))) return false;
      ids.add(item.id);
      return true;
    }).sort((a, b) => a.id.localeCompare(b.id));
  }
  function loadOfflineData() {
    return new Promise((resolve, reject) => {
      if (window.HUYET_LOCAL_DATA) { resolve(validate(window.HUYET_LOCAL_DATA)); return; }
      const script = document.createElement('script');
      script.src = './data.local.js';
      script.onload = () => resolve(validate(window.HUYET_LOCAL_DATA));
      script.onerror = () => reject(new Error('Không thể đọc data.local.js'));
      document.head.appendChild(script);
    });
  }
  async function loadData() {
    if (location.protocol === 'file:') return await loadOfflineData();
    try {
      const response = await fetch('./data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const raw = await response.json();
      const checked = validate(raw);
      if (!checked.length || checked.length !== raw.length) throw new Error('Một số bản ghi không hợp lệ');
      return checked;
    } catch {
      // Fallback khi không đọc được JSON; không ép tải 100 bản ghi dự phòng nếu mạng bình thường.
      return await loadOfflineData();
    }
  }

  function matches(item, query) {
    if (!query) return { match: true, group: 0, score: 0 };
    const regionHit = contains(item.nhom, query);
    const useHit = contains(item.tacDung, query) || contains(item.chiDinh, query);
    const nameHit = contains(item.ten, query) || contains(item.tenHanViet, query) || contains(item.tenPinyin, query);
    const exactId = norm(item.id) === query;
    const related = nameHit || exactId || contains(item.tuKhoa, query) ||
      contains(item.duongKinh, query) || contains(item.viTri, query) || contains(item.cachXacDinh, query) ||
      contains(item.id, query);
    if (!regionHit && !useHit && !related) {
      // Cho phép nhiều từ nằm ở các trường khác nhau, tránh bỏ sót cụm từ có thứ tự khác.
      const combined = norm([item.ten, item.tenPinyin, item.nhom, item.duongKinh, item.viTri,
        item.cachXacDinh, ...item.tuKhoa, ...item.tacDung, ...item.chiDinh].join(' '));
      if (query === 'than' || !contains(combined, query)) return { match: false };
    }
    const group = regionHit ? 1 : useHit ? 2 : 3;
    const score = (exactId ? 100 : 0) + (norm(item.ten) === query ? 90 : nameHit ? 35 : 0) +
      (useHit ? 20 : 0) + (contains(item.tuKhoa, query) ? 8 : 0);
    return { match: true, group, score };
  }
  function getMatching() {
    const query = norm(state.query);
    return state.data.map(item => ({ item, ...matches(item, query) }))
      .filter(entry => entry.match && (state.region === 'all' || entry.item.nhom === REGIONS[state.region]) &&
        (!state.onlyFavorites || state.favorites.has(entry.item.id)))
      .sort((a, b) => query ? a.group - b.group || b.score - a.score || a.item.id.localeCompare(b.item.id) :
        a.item.id.localeCompare(b.item.id));
  }
  function imgPath(path) { return './' + path; }
  function makeCard(item, index, groupLabel = '') {
    const card = element('article', 'ac-card');
    const photo = element('button', 'card-photo');
    photo.type = 'button';
    photo.setAttribute('aria-label', 'Xem chi tiết huyệt ' + item.ten);
    photo.addEventListener('click', () => openDetail(item, true));
    const image = element('img');
    image.src = imgPath(item.thumb);
    image.alt = 'Ảnh thu nhỏ vị trí huyệt ' + item.ten;
    image.width = 320; image.height = 250; image.decoding = 'async';
    image.loading = index < 2 ? 'eager' : 'lazy';
    photo.append(image, element('span', 'card-code', item.id));
    const body = element('div', 'card-body');
    body.append(element('div', 'card-group', item.nhom));
    body.append(element('h3', 'card-title', item.ten));
    body.append(element('p', 'card-meridian', 'Đường kinh: ' + item.duongKinh));
    body.append(element('p', 'card-description', item.viTri));
    if (groupLabel) body.append(element('span', 'matched-note', groupLabel));
    const footer = element('div', 'card-footer');
    const openBtn = element('button', 'card-open', 'Xem chi tiết →');
    openBtn.type = 'button';
    openBtn.addEventListener('click', () => openDetail(item, true));
    const favoriteBtn = element('button', 'card-save', state.favorites.has(item.id) ? '★' : '☆');
    favoriteBtn.type = 'button';
    favoriteBtn.setAttribute('aria-label', (state.favorites.has(item.id) ? 'Bỏ yêu thích ' : 'Lưu yêu thích ') + item.ten);
    favoriteBtn.setAttribute('aria-pressed', String(state.favorites.has(item.id)));
    favoriteBtn.addEventListener('click', () => toggleFavorite(item.id));
    footer.append(openBtn, favoriteBtn);
    body.append(footer);
    card.append(photo, body);
    return card;
  }
  const GROUPS = [
    {id: 1, title: 'Huyệt nằm tại vùng đang tìm', tag: 'Vị trí cơ thể', description: 'Vị trí huyệt thuộc nhóm cơ thể khớp từ khóa.'},
    {id: 2, title: 'Huyệt có công dụng hoặc chỉ định liên quan', tag: 'Theo tài liệu', description: 'Từ khóa xuất hiện trong mục tác dụng hoặc chỉ định của tài liệu; không phải bằng chứng điều trị.'},
    {id: 3, title: 'Huyệt liên quan theo tên, đường kinh hoặc từ khóa', tag: 'Tham khảo thêm', description: 'Khớp tên huyệt, mô tả, đường kinh hoặc từ khóa tra cứu.'}
  ];
  function render() {
    const query = norm(state.query);
    const matching = getMatching();
    const cards = $('cards');
    const groupsRoot = $('result-groups');
    const groupSize = query ? Math.max(GROUP_PAGE_SIZE, state.limit - 4) : state.limit;
    let remaining = 0;
    if (!query) {
      groupsRoot.hidden = true;
      groupsRoot.replaceChildren();
      cards.hidden = false;
      cards.replaceChildren(...matching.slice(0, state.limit).map(({item}, i) => makeCard(item, i)));
      remaining = Math.max(0, matching.length - state.limit);
    } else {
      cards.hidden = true;
      cards.replaceChildren();
      groupsRoot.hidden = false;
      const fragments = [];
      let displayed = 0;
      for (const group of GROUPS) {
        const subset = matching.filter(e => e.group === group.id);
        if (!subset.length) continue;
        const section = element('section', 'result-group');
        const heading = element('div', 'result-group-heading');
        heading.append(element('h3', '', group.title));
        heading.append(element('span', 'result-group-count', subset.length + ' huyệt'));
        section.append(heading, element('p', 'result-group-description', group.description));
        const grid = element('div', 'card-grid');
        subset.slice(0, groupSize).forEach(({item}, i) => grid.append(makeCard(item, displayed + i, group.tag)));
        displayed += Math.min(groupSize, subset.length);
        remaining += Math.max(0, subset.length - groupSize);
        section.append(grid);
        fragments.push(section);
      }
      groupsRoot.replaceChildren(...fragments);
    }
    $('result-count').textContent = `${matching.length} huyệt phù hợp` +
      (state.query ? ` với “${state.query}”` : '') + ` · Đã nạp ${state.data.length}/100 huyệt`;
    $('empty-state').hidden = matching.length !== 0;
    $('show-more').hidden = remaining === 0;
    $('show-more').textContent = `Xem thêm (${remaining} huyệt còn lại)`;
    $('favorites-count').textContent = String([...state.favorites].filter(id => state.data.some(h => h.id === id)).length);
    $('favorites-toggle').setAttribute('aria-pressed', String(state.onlyFavorites));
    $('favorites-toggle').firstChild.textContent = state.onlyFavorites ? '★ Đang xem huyệt đã lưu ' : '☆ Huyệt đã lưu ';
    $('library-status').textContent = `Đã nạp ${state.data.length} huyệt · 7 nhóm cơ thể`;
  }
  function refreshRegions() {
    document.querySelectorAll('#regions [data-region]').forEach(button => {
      const active = button.dataset.region === state.region;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function resetSearch() {
    state.query = ''; state.region = 'all'; state.onlyFavorites = false; state.limit = PAGE_SIZE;
    $('search').value = ''; $('clear-search').hidden = true;
    refreshRegions(); render();
  }
  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
    storeSet(FAV_KEY, JSON.stringify([...state.favorites]));
    render();
    if (state.current?.id === id) refreshDetailFavorite();
  }
  function refreshDetailFavorite() {
    const active = !!state.current && state.favorites.has(state.current.id);
    $('detail-favorite').textContent = active ? '★ Đã lưu · Bỏ lưu' : '☆ Lưu huyệt';
    $('detail-favorite').setAttribute('aria-pressed', String(active));
  }
  function populateList(id, items) {
    $(id).replaceChildren(...(items.length ? items : ['Chưa có thông tin']).map(item => element('li', '', item)));
  }
  function detailUrl(id) {
    const url = new URL(location.href);
    url.searchParams.set('id', id);
    url.searchParams.delete('q');
    return url.href;
  }
  function changeUrl(id) {
    if (location.protocol === 'file:') return;
    try {
      const url = new URL(location.href);
      if (id) url.searchParams.set('id', id); else url.searchParams.delete('id');
      history.replaceState({huyetId: id || null}, '', url.pathname + url.search + url.hash);
    } catch { /* trình duyệt giới hạn cập nhật URL */ }
  }
  function openDetail(item, changeAddress = true) {
    if (!item) return;
    state.current = item;
    setText('detail-code', `HUYỆT ${item.id} · SỐ ${Number(item.id.slice(-3))}`);
    setText('detail-title', item.ten);
    setText('detail-hanviet', item.tenHanViet);
    setText('detail-pinyin', item.tenPinyin);
    setText('detail-region', item.nhom);
    setText('detail-meridian', 'Đường kinh: ' + item.duongKinh);
    setText('detail-position', item.viTri);
    setText('detail-howto', item.cachXacDinh);
    setText('detail-keywords', item.tuKhoa.join(' · '));
    setText('detail-page', String(item.trangTaiLieu));
    populateList('detail-effects', item.tacDung);
    populateList('detail-indications', item.chiDinh);
    setText('detail-source', `“Mẹo nhớ huyệt” · Mục dữ liệu số ${item.trangTaiLieu} (không phải số trang PDF)`);
    $('detail-review').textContent = 'Nội dung tổng hợp từ tài liệu tham khảo, chưa thay thế thẩm định chuyên môn y khoa.';
    // Chỉ tại thời điểm mở popup mới gán ảnh lớn; trang chủ chỉ tải WebP nhỏ.
    const img = $('detail-image');
    img.alt = 'Minh họa vị trí huyệt ' + item.ten;
    img.src = imgPath(item.hinhAnh);
    $('open-image').href = imgPath(item.hinhAnh);
    $('share-message').textContent = '';
    refreshDetailFavorite();
    if (changeAddress) changeUrl(item.id);
    if (!$('detail-modal').open) $('detail-modal').showModal();
  }
  function closeDetail(changeAddress = true) {
    if ($('detail-modal').open) $('detail-modal').close();
    state.current = null;
    $('detail-image').removeAttribute('src');
    if (changeAddress) changeUrl(null);
  }
  function syncUrlToModal() {
    const id = new URLSearchParams(location.search).get('id');
    const item = state.data.find(h => norm(h.id) === norm(id));
    if (item) openDetail(item, false);
    else if ($('detail-modal').open) closeDetail(false);
  }
  async function shareDetail() {
    if (!state.current) return;
    if (location.protocol === 'file:') {
      $('share-message').textContent = 'Chức năng chia sẻ liên kết sẽ dùng được sau khi đưa trang lên GitHub Pages.';
      return;
    }
    const url = detailUrl(state.current.id);
    if (navigator.share) {
      try {
        await navigator.share({title: 'Huyệt ' + state.current.ten, url});
        $('share-message').textContent = 'Đã mở bảng chia sẻ.';
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      $('share-message').textContent = 'Đã sao chép liên kết của huyệt.';
    } catch {
      const input = element('textarea');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* không hỗ trợ */ }
      input.remove();
      if (copied) $('share-message').textContent = 'Đã sao chép liên kết của huyệt.';
      else {
        $('share-message').textContent = 'Liên kết: ';
        const link = element('a', '', url);
        link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        $('share-message').append(link);
      }
    }
  }
  function changeFont(delta) {
    state.scale = Math.max(0.9, Math.min(1.3, Math.round((state.scale + delta) * 100) / 100));
    document.documentElement.style.setProperty('--font-scale', String(state.scale));
    storeSet(FONT_KEY, String(state.scale));
  }
  function bindEvents() {
    $('search').addEventListener('input', () => {
      state.query = $('search').value.trim(); state.limit = PAGE_SIZE;
      $('clear-search').hidden = !state.query; render();
    });
    $('clear-search').addEventListener('click', () => {
      $('search').value = ''; $('search').dispatchEvent(new Event('input')); $('search').focus();
    });
    document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => {
      $('search').value = button.dataset.query; $('search').dispatchEvent(new Event('input'));
      $('ket-qua').scrollIntoView({behavior: 'smooth', block: 'start'});
    }));
    document.querySelectorAll('#regions [data-region]').forEach(button => button.addEventListener('click', () => {
      state.region = button.dataset.region; state.limit = PAGE_SIZE; refreshRegions(); render();
    }));
    $('favorites-toggle').addEventListener('click', () => {
      state.onlyFavorites = !state.onlyFavorites; state.limit = PAGE_SIZE; render();
    });
    $('reset-search').addEventListener('click', resetSearch);
    $('show-more').addEventListener('click', () => { state.limit += PAGE_SIZE; render(); });
    $('close-modal').addEventListener('click', () => closeDetail());
    $('detail-modal').addEventListener('click', event => {
      if (event.target === $('detail-modal')) closeDetail();
    });
    $('detail-modal').addEventListener('cancel', event => { event.preventDefault(); closeDetail(); });
    $('detail-favorite').addEventListener('click', () => state.current && toggleFavorite(state.current.id));
    $('detail-share').addEventListener('click', shareDetail);
    $('font-up').addEventListener('click', () => changeFont(0.1));
    $('font-down').addEventListener('click', () => changeFont(-0.1));
    $('back-to-top').addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
    window.addEventListener('scroll', () => {
      $('back-to-top').hidden = window.scrollY < 350;
    }, {passive: true});
    window.addEventListener('popstate', syncUrlToModal);
  }
  async function init() {
    try {
      const stored = JSON.parse(storeGet(FAV_KEY, '[]'));
      if (Array.isArray(stored)) state.favorites = new Set(stored.filter(v => /^huyet-\d{3}$/.test(v)));
    } catch { /* storage không hợp lệ: bắt đầu rỗng */ }
    const font = Number(storeGet(FONT_KEY, '1'));
    if (font >= 0.9 && font <= 1.3) state.scale = font;
    changeFont(0);
    bindEvents();
    try {
      state.data = await loadData();
    } catch {
      state.data = [];
    }
    if (state.data.length === 0) {
      $('result-count').textContent = 'Không nạp được dữ liệu. Hãy kiểm tra data.json và data.local.js.';
      $('library-status').textContent = 'Lỗi tải dữ liệu';
      $('empty-state').hidden = false;
      return;
    }
    render();
    const q = new URLSearchParams(location.search).get('q');
    if (q) { $('search').value = q; $('search').dispatchEvent(new Event('input')); }
    syncUrlToModal();
    if (location.protocol === 'https:' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).catch(() => {}));
    }
  }
  init();
})();
