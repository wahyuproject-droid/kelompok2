(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const overlay = $('#modal-overlay');
  const content = $('#modal-content');
  const menu = $('#mobile-menu');
  const menuToggle = $('#menu-toggle');
  const toastNode = $('#toast');
  let lastFocus = null;
  let toastTimer;
  let surveyStep = -1;
  let answers = [];
  let reportData = {};
  let reportText = '';

  const questions = [
    'Saya diejek atau direndahkan oleh teman.',
    'Saya didorong, dipukul, atau disakiti secara fisik.',
    'Saya sengaja dikucilkan dari kelompok pertemanan.',
    'Saya menerima pesan atau unggahan yang merendahkan saya.',
    'Saya menyaksikan teman mengalami perundungan.',
    'Saya takut ke sekolah karena perlakuan orang lain.',
    'Saya menerima ancaman atau paksaan dari orang lain.',
    'Saya mengetahui teman yang takut bercerita tentang bullying.'
  ];
  const choices = ['Tidak pernah', 'Jarang', 'Kadang-kadang', 'Sering'];

  function icon(name) { return `<svg class="icon" aria-hidden="true"><use href="#i-${name}" /></svg>`; }
  function escapeHTML(str) {
    return String(str ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function renderMembers() {
    const grid = $('#member-grid');
    const members = Array.isArray(window.RUANG_AMAN_MEMBERS) ? window.RUANG_AMAN_MEMBERS.slice(0, 11) : [];
    if (!grid) return;
    grid.innerHTML = members.map((member, index) => {
      const number = String(index + 1).padStart(2, '0');
      const name = String(member.name || `Nama Anggota ${number}`);
      const placeholder = /^Nama Anggota \d+$/.test(name);
      const initials = placeholder ? number : name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase();
      return `<article class="member-card reveal"><div class="member-card-top"><span>${number} / 11</span>${icon('arrow-up')}</div><div class="member-avatar">${escapeHTML(initials)}</div><div class="member-meta"><small>${placeholder ? 'NAMA BELUM DIISI' : 'ANGGOTA KELOMPOK'}</small><h4>${escapeHTML(name)}</h4></div></article>`;
    }).join('');
  }
  function notify(message) {
    toastNode.textContent = message;
    toastNode.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastNode.classList.remove('show'), 3200);
  }
  function openModal(type) {
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (type === 'survey') {
      surveyStep = -1;
      answers = Array(questions.length).fill(null);
      renderSurvey();
    } else {
      reportData = {};
      reportText = '';
      renderReportForm();
    }
    $('#modal-close').focus();
  }
  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    content.replaceChildren();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function renderSurvey() {
    if (surveyStep === -1) {
      content.innerHTML = `
        <span class="form-kicker">ANGKET DIGITAL / RUANG AMAN</span>
        <h2>Ceritamu berarti.</h2>
        <p class="intro">Ada 8 pernyataan tentang pengalaman di sekolah selama <strong>30 hari terakhir</strong>. Pilih jawaban yang paling sesuai. Tidak ada jawaban benar atau salah.</p>
        <div class="privacy-banner">${icon('lock')}<span>Angket ini tidak meminta nama, tidak menyimpan jawaban di server, dan tidak mengirimkannya kepada sekolah. Kamu bisa mengunduh ringkasannya setelah selesai.</span></div>
        <div class="modal-cta-row"><button class="button button-dark" data-action="survey-start">Mulai Mengisi ${icon('arrow')}</button></div>`;
      return;
    }
    if (surveyStep === questions.length) {
      const selected = answers.map((a, i) => ({q: questions[i], a: choices[a]}));
      content.innerHTML = `
        <span class="success-icon">${icon('check')}</span>
        <span class="form-kicker">ANGKET SELESAI / 08 DARI 08</span>
        <h2>Terima kasih sudah jujur.</h2>
        <p class="intro">Kamu sudah menyelesaikan seluruh pertanyaan. Ringkasan ini adalah catatan pengalaman, <strong>bukan diagnosis atau penentuan hukuman</strong>. Jika merasa tidak aman, cerita kepada guru atau orang dewasa tepercaya.</p>
        <div class="summary-list">${selected.map((item,i) => `<div class="survey-summary-item"><div>${i+1}. ${escapeHTML(item.q)}</div><span>${escapeHTML(item.a)}</span></div>`).join('')}</div>
        <div class="privacy-banner">${icon('shield')}<span>Hasil belum dikirim ke siapa pun. Unduh atau salin jika kamu ingin menyerahkannya secara pribadi kepada guru pendamping.</span></div>
        <div class="modal-cta-row"><button class="button button-dark" data-action="survey-download">${icon('download')} Unduh Hasil</button><button class="button button-outline" data-action="survey-copy">${icon('copy')} Salin</button><button class="button button-outline" data-action="survey-restart">Ulangi</button></div>`;
      return;
    }

    const progress = (surveyStep + 1) / questions.length * 100;
    content.innerHTML = `
      <span class="form-kicker">ANGKET DIGITAL / 30 HARI TERAKHIR</span>
      <div class="survey-progress-row"><span>PERTANYAAN ${String(surveyStep + 1).padStart(2,'0')} / ${String(questions.length).padStart(2,'0')}</span><span>${Math.round(progress)}%</span></div>
      <div class="survey-real-progress" role="progressbar" aria-label="Kemajuan angket" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}"><span style="width:${progress}%"></span></div>
      <span class="question-number">Pilih satu jawaban</span>
      <h2 class="question-title">${escapeHTML(questions[surveyStep])}</h2>
      <div class="answer-list" role="radiogroup" aria-label="Frekuensi pengalaman">${choices.map((choice, i) => `<label class="answer-option"><input type="radio" name="survey-answer" value="${i}" ${answers[surveyStep] === i ? 'checked' : ''}/><span>${escapeHTML(choice)}</span></label>`).join('')}</div>
      <div class="modal-cta-row"><button class="button button-outline" data-action="survey-prev">Kembali</button><button class="button button-dark" data-action="survey-next">${surveyStep === questions.length - 1 ? 'Lihat Hasil' : 'Lanjut'} ${icon('arrow')}</button></div>`;
  }

  function surveySummaryText() {
    const date = new Date().toLocaleString('id-ID', {timeZone:'Asia/Jakarta'});
    return ['HASIL ANGKET ANTI-BULLYING — RUANG AMAN',`Tanggal: ${date} WIB`,'Periode: pengalaman selama 30 hari terakhir','Identitas: anonim','',...questions.map((q,i) => `${i+1}. ${q}\n   Jawaban: ${choices[answers[i]]}`),'','Catatan: Angket edukatif; bukan alat diagnosis atau penentuan sanksi.','Jika merasa tidak aman, ceritakan kepada guru, wali kelas, guru BK, atau orang dewasa tepercaya.','Dokumen ini dibuat di perangkat pengguna dan tidak otomatis dikirim kepada sekolah.'].join('\n');
  }
  function downloadText(filename, text) {
    const blob = new Blob(['\uFEFF', text], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify('Teks berhasil disalin.');
    } catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand('copy');
      field.remove();
      notify(ok ? 'Teks berhasil disalin.' : 'Gagal menyalin. Gunakan tombol unduh.');
    }
  }

  function fieldValue(name) { return escapeHTML(reportData[name] || ''); }
  function selected(name, value) { return reportData[name] === value ? 'selected' : ''; }
  function renderReportForm() {
    content.innerHTML = `
      <span class="form-kicker">LAPORAN / CATAT KEJADIAN</span>
      <h2>Mulai dengan ceritamu.</h2>
      <p class="intro">Formulir ini membantu merapikan kronologi. Isi seperlunya, jangan tuliskan identitas korban atau saksi jika tidak diperlukan.</p>
      <div class="privacy-banner">${icon('lock')}<span>Mode draf pribadi: laporan <strong>belum dikirim</strong> ke guru/sekolah. Setelah selesai, unduh atau salin dan serahkan melalui jalur resmi sekolah.</span></div>
      <form id="report-form" class="report-form">
        <div class="field"><label for="report-role">Kamu melapor sebagai *</label><select id="report-role" name="role" required><option value="">Pilih peran</option><option value="Korban" ${selected('role','Korban')}>Mengalami sendiri</option><option value="Saksi" ${selected('role','Saksi')}>Melihat kejadian</option><option value="Pendamping" ${selected('role','Pendamping')}>Mendampingi teman</option><option value="Lainnya" ${selected('role','Lainnya')}>Lainnya</option></select></div>
        <div class="field"><label for="report-type">Jenis kejadian *</label><select id="report-type" name="type" required><option value="">Pilih jenis</option><option value="Fisik" ${selected('type','Fisik')}>Fisik</option><option value="Verbal" ${selected('type','Verbal')}>Verbal</option><option value="Sosial" ${selected('type','Sosial')}>Sosial</option><option value="Digital" ${selected('type','Digital')}>Digital</option><option value="Lebih dari satu jenis" ${selected('type','Lebih dari satu jenis')}>Lebih dari satu jenis</option><option value="Belum yakin" ${selected('type','Belum yakin')}>Belum yakin</option></select></div>
        <div class="field"><label for="report-date">Waktu kejadian</label><input id="report-date" name="date" type="datetime-local" value="${fieldValue('date')}" /></div>
        <div class="field"><label for="report-place">Lokasi atau platform</label><input id="report-place" name="place" type="text" maxlength="120" placeholder="Contoh: kelas, kantin, grup chat" value="${fieldValue('place')}" /></div>
        <div class="field full"><label for="report-story">Apa yang terjadi? *</label><textarea id="report-story" name="story" required minlength="20" maxlength="4000" placeholder="Ceritakan kronologi dengan bahasa sendiri. Apa yang terjadi, kapan, dan bagaimana dampaknya?">${fieldValue('story')}</textarea><span class="field-help">Minimal 20 karakter. Hindari mengunggah bukti ke grup publik; simpan secara aman.</span></div>
        <div class="field"><label for="report-safety">Apakah ada bahaya saat ini?</label><select id="report-safety" name="safety"><option value="Belum disebutkan">Pilih jika ingin</option><option value="Ya, butuh bantuan segera" ${selected('safety','Ya, butuh bantuan segera')}>Ya, perlu bantuan segera</option><option value="Tidak saat ini" ${selected('safety','Tidak saat ini')}>Tidak saat ini</option><option value="Belum yakin" ${selected('safety','Belum yakin')}>Belum yakin</option></select></div>
        <div class="field"><label for="report-help">Sudah meminta bantuan?</label><select id="report-help" name="help"><option value="Belum disebutkan">Pilih jika ingin</option><option value="Belum" ${selected('help','Belum')}>Belum</option><option value="Sudah, guru atau wali kelas" ${selected('help','Sudah, guru atau wali kelas')}>Sudah, guru / wali kelas</option><option value="Sudah, orang tua" ${selected('help','Sudah, orang tua')}>Sudah, orang tua</option><option value="Sudah, pihak lain" ${selected('help','Sudah, pihak lain')}>Sudah, pihak lain</option></select></div>
        <div class="field full"><button type="submit" class="button button-dark">Siapkan Laporan ${icon('arrow')}</button></div>
      </form>`;
  }
  function buildReportText(data) {
    const formattedDate = data.date ? new Date(data.date).toLocaleString('id-ID',{dateStyle:'long',timeStyle:'short'}) : 'Tidak dicantumkan';
    const now = new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta'});
    return [
      'DRAF LAPORAN KEJADIAN PERUNDUNGAN',
      'RUANG AMAN — UNTUK DISAMPAIKAN SECARA PRIBADI',
      '',
      `Dibuat: ${now} WIB`,
      `Pelapor sebagai: ${data.role}`,
      `Jenis kejadian: ${data.type}`,
      `Waktu kejadian: ${formattedDate}`,
      `Lokasi/platform: ${data.place || 'Tidak dicantumkan'}`,
      '', 'KRONOLOGI KEJADIAN', data.story, '',
      `Keadaan keselamatan: ${data.safety || 'Belum disebutkan'}`,
      `Bantuan yang telah diminta: ${data.help || 'Belum disebutkan'}`,
      '', 'TINDAK LANJUT YANG DIHARAPKAN',
      'Mohon pihak pendamping menerima laporan dengan aman, menjaga kerahasiaan seperlunya, memeriksa fakta secara adil, dan memberikan perlindungan serta pemulihan sesuai kebutuhan.',
      '', 'CATATAN PRIVASI',
      'Dokumen ini dibuat secara lokal. Belum otomatis terkirim kepada sekolah/pihak lain.',
      'Sampaikan melalui guru BK, wali kelas, kepala sekolah, atau jalur pelaporan resmi.',
      'Jika ada bahaya langsung, segera minta bantuan orang dewasa tepercaya atau layanan darurat setempat.'
    ].join('\n');
  }
  function renderReportPreview() {
    content.innerHTML = `
      <span class="success-icon">${icon('check')}</span>
      <span class="form-kicker">DRAF LAPORAN / SIAP DIUNDUH</span>
      <h2>Laporanmu sudah disusun.</h2>
      <p class="intro">Baca kembali isi laporan. Unduh atau salin untuk diberikan secara <strong>pribadi</strong> kepada guru BK, wali kelas, atau pihak sekolah yang dipercaya.</p>
      <div class="report-preview" id="report-preview"></div>
      <div class="privacy-banner">${icon('alert')}<span><strong>Belum terkirim.</strong> Website ini tidak memiliki koneksi ke sistem pengaduan sekolah. Jika kamu sedang dalam bahaya, jangan menunggu proses dokumen—segera cari bantuan langsung.</span></div>
      <div class="modal-cta-row"><button class="button button-dark" data-action="report-download">${icon('download')} Unduh .txt</button><button class="button button-outline" data-action="report-copy">${icon('copy')} Salin</button><button class="button button-outline" data-action="report-edit">Edit</button></div>`;
    $('#report-preview').textContent = reportText;
  }

  menuToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  });
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
  $$('[data-open]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.open)));
  $('#modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeModal(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    if (event.key === 'Tab' && overlay.classList.contains('open')) {
      const focusables = $$('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]', overlay).filter(el => el.getClientRects().length);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  const printSurveyButton = $('#print-survey');
  if (printSurveyButton) printSurveyButton.addEventListener('click', () => window.print());

  $$('[data-law-tab]').forEach(tab => tab.addEventListener('click', () => {
    const selected = tab.dataset.lawTab;
    $$('[data-law-tab]').forEach(item => {
      const active = item.dataset.lawTab === selected;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    $$('[data-law-panel]').forEach(panel => { panel.hidden = panel.dataset.lawPanel !== selected; });
  }));
  $$('[data-copy-law]').forEach(button => button.addEventListener('click', () => {
    const article = $(`[data-law-text="${button.dataset.copyLaw}"]`);
    if (article) copyText(article.innerText.trim());
  }));

  content.addEventListener('submit', event => {
    if (event.target.id !== 'report-form') return;
    event.preventDefault();
    const fd = new FormData(event.target);
    reportData = Object.fromEntries(fd.entries());
    reportData.story = (reportData.story || '').trim();
    if (reportData.story.length < 20) { notify('Kronologi minimal 20 karakter.'); return; }
    reportText = buildReportText(reportData);
    renderReportPreview();
    content.scrollTop = 0;
  });
  content.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'survey-start') { surveyStep = 0; renderSurvey(); }
    else if (action === 'survey-prev') { surveyStep--; renderSurvey(); }
    else if (action === 'survey-next') {
      const checked = $('input[name="survey-answer"]:checked', content);
      if (!checked) { notify('Pilih satu jawaban terlebih dahulu.'); return; }
      answers[surveyStep] = Number(checked.value);
      surveyStep++;
      renderSurvey();
      content.scrollTop = 0;
    } else if (action === 'survey-download') { downloadText('angket-anti-bullying.txt',surveySummaryText()); notify('Hasil angket diunduh.'); }
    else if (action === 'survey-copy') copyText(surveySummaryText());
    else if (action === 'survey-restart') { surveyStep=-1; answers=Array(questions.length).fill(null); renderSurvey(); }
    else if (action === 'report-download') { downloadText('draf-laporan-bullying.txt',reportText); notify('Draf laporan diunduh.'); }
    else if (action === 'report-copy') copyText(reportText);
    else if (action === 'report-edit') renderReportForm();
  });
  content.addEventListener('change', event => {
    if (event.target.name === 'survey-answer') answers[surveyStep] = Number(event.target.value);
  });

  renderMembers();
  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    });
  }, {threshold:.08,rootMargin:'0px 0px -25px 0px'}) : null;
  $$('.reveal').forEach((el,i) => {
    if (revealObserver) { el.style.transitionDelay = `${Math.min(i % 4,3) * 65}ms`; revealObserver.observe(el); }
    else el.classList.add('visible');
  });
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  $$('.desktop-nav a, .mobile-menu a, .bottom-dock a').forEach(link => {
    const match = link.getAttribute('href') === currentFile;
    link.classList.toggle('current', match);
    if (link.closest('.bottom-dock')) link.classList.toggle('active', match);
    if (match) link.setAttribute('aria-current', 'page');
  });
})();
