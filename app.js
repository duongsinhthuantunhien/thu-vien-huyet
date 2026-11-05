/* Thư viện 100 huyệt đạo • JavaScript thuần • FIX2: từ ghép và dấu tiếng Việt */
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

  // FIX2: truy vấn 1–2 âm tiết giữ nguyên dấu và kiểm tra ranh giới từ.
  // Chỉ khi người dùng gõ >=3 âm tiết KHÔNG DẤU mới dùng đối chiếu gỡ dấu,
  // vẫn giữ thứ tự cụm từ và áp dụng ngoại lệ với từ ghép có thể gây hiểu nhầm.
  function accentedTokens(value) {
    return String(value ?? '').normalize('NFC').toLocaleLowerCase('vi-VN')
      .match(/[\p{L}\p{M}\p{N}]+/gu) || [];
  }
  function plainTokens(value) {
    return accentedTokens(value).map(word => word.normalize('NFD')
      .replace(/\p{M}/gu, '').replace(/đ/g, 'd'));
  }
  function normalizeQuery(value) { return accentedTokens(value).join(' '); }
  function containsVietnameseMarks(value) {
    return /[\u00c0-\u1ef9đĐ]/iu.test(value);
  }
  function sameWordBlock(words, from, phraseWords) {
    const p = phraseWords.join(' ');
    const next = words[from + phraseWords.length] || '';
    // Không đồng nhất bộ phận cơ thể với từ ghép khác.
    if (p === 'đau cổ' && (next === 'tay' || next === 'chân')) return true;
    if (p === 'đau mắt' && next === 'cá') return true;
    if (p === 'đau đầu' && next === 'gối') return true;
    // “phù chính” là thuật ngữ Đông y, không có nghĩa phù thũng.
    if (p === 'phù' && (next === 'chính' || next === 'hợp')) return true;
    return false;
  }
  function phraseHit(text, phrase, allowNoMarkLong = false) {
    const needle = accentedTokens(phrase);
    const original = accentedTokens(text);
    if (!needle.length || original.length < needle.length) return false;
    // Yêu cầu duyệt: 1–2 âm tiết tuyệt đối không so khớp bỏ dấu.
    const fold = allowNoMarkLong && needle.length >= 3 && !containsVietnameseMarks(phrase);
    const haystack = fold ? plainTokens(text) : original;
    const comparedNeedle = fold ? plainTokens(phrase) : needle;
    for (let i = 0; i <= haystack.length - comparedNeedle.length; i++) {
      let equal = true;
      for (let j = 0; j < comparedNeedle.length; j++) {
        if (haystack[i + j] !== comparedNeedle[j]) { equal = false; break; }
      }
      if (!equal) continue;
      // Kiểm tra ngoại lệ theo bản có dấu, dù truy vấn gõ không dấu.
      if (sameWordBlock(original, i, needle)) continue;
      if (fold && sameWordBlock(haystack, i, comparedNeedle)) continue;
      return true;
    }
    return false;
  }

  // Mỗi nhóm một chiều; chỉ khai báo cách diễn đạt tương đương khi ý nghĩa tương ứng.
  // `related` KHÔNG PHẢI từ đồng nghĩa; tuyệt đối không dùng nhãn "Trị" cho nhóm này.
  const QUERY_ALIASES = Object.freeze({
    'đau gáy': {equivalent: ['đau cứng cổ gáy', 'đau cổ vai gáy', 'đau cổ gáy', 'đau vai gáy', 'cổ gáy đau cứng'], related: ['cứng cổ gáy']},
    'đau cổ': {equivalent: ['đau cứng cổ gáy', 'đau cổ vai gáy', 'đau cổ gáy', 'cổ gáy đau cứng']},
    'đau khớp gối': {equivalent: ['đau đầu gối', 'đau gối']},
    'hen suyễn': {equivalent: ['ho suyễn', 'suyễn']},
    'phù thũng': {equivalent: ['phù nề'], related: ['phù']},
    'đau tai': {related: ['ù tai', 'tai ù', 'điếc', 'viêm tai', 'lãng tai']},
    'khó tiêu': {equivalent: ['ăn không tiêu', 'tiêu hóa kém']},
    'đau dạ dày': {equivalent: ['dạ dày đau']},
    'đau đầu': {equivalent: ['nhức đầu', 'đầu đau'], related: ['đau nửa đầu']},
    'đau bụng': {equivalent: ['bụng đau']},
    'mất ngủ': {equivalent: ['khó ngủ', 'ngủ không ngon']},
    'táo bón': {equivalent: ['đi cầu khó', 'đại tiện khó']},
    'đau răng': {equivalent: ['răng đau']},
    'đau mắt': {equivalent: ['mắt đau', 'mắt sưng đau'], related: ['đau thần kinh vành mắt']},
    'đau họng': {related: ['viêm họng']},
    'đau ngực': {equivalent: ['đau tức ngực', 'ngực đau'], related: ['tức ngực']},
    'đau thắt lưng': {equivalent: ['thắt lưng đau', 'đau lưng dưới']},
    'liệt mặt': {equivalent: ['liệt thần kinh mặt', 'thần kinh mặt liệt', 'liệt dây thần kinh vii', 'liệt dây thần kinh số vii', 'liệt dây thần kinh mặt']},
    'cao huyết áp': {equivalent: ['tăng huyết áp']},
    'rối loạn kinh nguyệt': {equivalent: ['kinh nguyệt rối loạn', 'kinh nguyệt không đều', 'kinh không đều']},
    'nghẹt mũi': {equivalent: ['tắc mũi']},
    'ù tai': {equivalent: ['tai ù']}
  });
  function expandQuery(text) {
    const key = normalizeQuery(text);
    const rule = QUERY_ALIASES[key] || {};
    const all = [{phrase: key, kind: 'direct'}];
    for (const term of rule.equivalent || []) all.push({phrase: term, kind: 'equivalent'});
    for (const term of rule.related || []) all.push({phrase: term, kind: 'related'});
    return {key, variants: all, isSymptom: Boolean(QUERY_ALIASES[key])};
  }
  const FIELD_ORDER = ['tacDung', 'chiDinh', 'ten', 'tenHanViet', 'tenPinyin', 'nhom',
    'tuKhoa', 'viTri', 'cachXacDinh', 'duongKinh', 'id'];
  const FIELD_LABELS = Object.freeze({
    tacDung: 'tác dụng', chiDinh: 'chỉ định', ten: 'tên huyệt', tenHanViet: 'tên Hán',
    tenPinyin: 'Pinyin', nhom: 'nhóm', tuKhoa: 'từ khóa', viTri: 'vị trí',
    cachXacDinh: 'cách xác định', duongKinh: 'đường kinh', id: 'mã huyệt'
  });
  function hitPriority(hit) {
    const treatment = hit.field === 'tacDung' || hit.field === 'chiDinh';
    if (treatment && hit.kind === 'direct') return 1;
    if (treatment && hit.kind === 'equivalent') return 2;
    if (treatment && hit.kind === 'related') return 3;
    if (['ten', 'tenHanViet', 'tenPinyin', 'id'].includes(hit.field) && hit.kind !== 'related') return 4;
    if (hit.field === 'nhom' && hit.kind !== 'related') return 5;
    return 6;
  }
  function matches(item, expanded) {
    if (!expanded.key) return {match: true, group: 0, score: 0, benefits: [], evidence: []};
    const hits = [];
    for (const field of FIELD_ORDER) {
      const list = Array.isArray(item[field]) ? item[field] : [item[field]];
      for (const raw of list) {
        // Không cho phép từ "liên quan" biến thành nhãn công dụng qua metadata.
        for (const variant of expanded.variants) {
          if (!variant.phrase) continue;
          // Triệu chứng chỉ liên quan phải được chứng minh từ tác dụng/chỉ định,
          // không dùng vị trí/tên khác: Thừa Phù trong mô tả không phải phù thũng.
          if (variant.kind === 'related' && !['tacDung', 'chiDinh'].includes(field)) continue;
          const matched = phraseHit(raw, variant.phrase, variant.kind === 'direct');
          if (matched) hits.push({field, text: String(raw), phrase: variant.phrase, kind: variant.kind});
        }
      }
    }
    if (!hits.length) return {match: false};
    hits.sort((a, b) => hitPriority(a) - hitPriority(b) ||
      (a.field === 'tacDung' ? -1 : 0) - (b.field === 'tacDung' ? -1 : 0) ||
      b.phrase.length - a.phrase.length);
    const primary = hits[0];
    const group = hitPriority(primary);
    const score = 1000 - group * 100 + Math.min(20, hits.filter(h => hitPriority(h) === group).length);
    const benefits = hits.filter(h => ['tacDung','chiDinh'].includes(h.field) && h.kind !== 'related');
    return {match: true, group, score, benefits, evidence: hits, primary};
  }
  function getMatching() {
    const expanded = expandQuery(state.query);
    return state.data.map(item => ({item, ...matches(item, expanded)}))
      .filter(entry => entry.match && (state.region === 'all' || entry.item.nhom === REGIONS[state.region]) &&
        (!state.onlyFavorites || state.favorites.has(entry.item.id)))
      .sort((a, b) => expanded.key
        ? a.group - b.group || b.score - a.score || a.item.id.localeCompare(b.item.id)
        : a.item.id.localeCompare(b.item.id));
  }
  function reasonForCard(entry) {
    const primary = entry?.primary;
    if (!primary) return null;
    const dedup = new Set();
    const matched = (entry.evidence || []).filter(e =>
      e.field === primary.field && e.kind === primary.kind).map(e => e.text)
      .filter(text => {
        const key = norm(text);
        if (dedup.has(key)) return false;
        dedup.add(key);
        return true;
      }).slice(0, 3);
    if (primary.field === 'tacDung' || primary.field === 'chiDinh') {
      if (primary.kind === 'related') return {lead: '🔎 Liên quan đến: ', text: matched.join(' · ')};
      return {lead: '👉 Trị (theo tài liệu): ', text: matched.map(text => text.replace(/^\s*Trị\s+/iu, '')).join(' · ')};
    }
    return {lead: `🔎 Liên quan đến (${FIELD_LABELS[primary.field]}): `, text: matched.join(' · ')};
  }

  function imgPath(path) { return './' + path; }
  function makeCard(item, index, groupLabel = '', entry = null) {
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
    if (state.query.trim()) {
      const reason = reasonForCard(entry);
      if (reason) {
        const line = element('p', 'card-benefits');
        line.append(element('strong', '', reason.lead), document.createTextNode(reason.text));
        line.title = 'Trích từ dữ liệu 100 huyệt; chỉ là nội dung tham khảo, không phải khẳng định hiệu quả điều trị.';
        body.append(line);
      }
    }
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
    {id: 1, title: 'Khớp trực tiếp trong tác dụng/chỉ định', tag: 'Khớp triệu chứng', description: 'Có đúng cụm từ bạn tìm trong tác dụng hoặc chỉ định của tài liệu.'},
    {id: 2, title: 'Khớp cách diễn đạt tương đương', tag: 'Từ đồng nghĩa', description: 'Có cụm từ tương đương đã kiểm soát trong tác dụng/chỉ định.'},
    {id: 3, title: 'Thông tin liên quan, không phải đồng nghĩa', tag: 'Chỉ liên quan', description: 'Ví dụ: tìm đau tai có thể xem thêm thông tin về ù tai hoặc viêm tai. Không khẳng định trị đau tai.'},
    {id: 4, title: 'Khớp tên hoặc mã huyệt', tag: 'Tên huyệt', description: 'Tên huyệt, tên Hán/Pinyin hoặc mã khớp truy vấn.'},
    {id: 5, title: 'Khớp vùng cơ thể', tag: 'Vùng cơ thể', description: 'Vị trí thuộc nhóm cơ thể khớp từ khóa.'},
    {id: 6, title: 'Liên quan theo từ khóa hoặc mô tả', tag: 'Tham khảo', description: 'Chỉ liên quan theo từ khóa, vị trí hoặc cách xác định; không gán công dụng điều trị.'}
  ];
  function render() {
    const query = normalizeQuery(state.query);
    const matching = getMatching();
    const cards = $('cards');
    const groupsRoot = $('result-groups');
    const groupSize = query ? Math.max(GROUP_PAGE_SIZE, state.limit - 4) : state.limit;
    let remaining = 0;
    if (!query) {
      groupsRoot.hidden = true;
      groupsRoot.replaceChildren();
      cards.hidden = false;
      cards.replaceChildren(...matching.slice(0, state.limit).map((entry, i) => makeCard(entry.item, i, '', entry)));
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
        subset.slice(0, groupSize).forEach((entry, i) => grid.append(makeCard(entry.item, displayed + i, group.tag, entry)));
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
