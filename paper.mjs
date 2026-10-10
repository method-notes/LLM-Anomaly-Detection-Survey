const $ = id => document.getElementById(id);
const toolbar = $('reader-toolbar');
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--toolbar-height', `${toolbar.offsetHeight}px`);
}).observe(toolbar);
window.lucide?.createIcons();

try {
  const pdfjs = await import('./assets/pdfjs/pdf.min.mjs');
  const { EventBus, PDFLinkService, PDFFindController, PDFViewer } = await import('./assets/pdfjs/pdf_viewer.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./assets/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
  const events = new EventBus();
  const links = new PDFLinkService({ eventBus: events, externalLinkTarget: 2, externalLinkRel: 'noopener noreferrer' });
  const find = new PDFFindController({ eventBus: events, linkService: links });
  const viewer = new PDFViewer({ container: $('viewerContainer'), eventBus: events, linkService: links, findController: find, annotationMode: 1, imageResourcesPath: 'assets/pdfjs/' });
  links.setViewer(viewer);
  const initialPage = Number(new URLSearchParams(location.hash.slice(1)).get('page')) || 1;
  let pageCount = 0;

  function syncPage(page) {
    $('page-number').value = page;
    $('previous-page').disabled = page <= 1;
    $('next-page').disabled = page >= pageCount;
    history.replaceState(null, '', `#page=${page}`);
  }
  function goToPage(page) {
    if (!Number.isInteger(page) || page < 1 || page > pageCount) {
      $('page-number').value = viewer.currentPageNumber;
      return;
    }
    viewer.scrollPageIntoView({ pageNumber: page });
  }
  events.on('pagesinit', () => {
    viewer.currentScaleValue = innerWidth <= 600 ? 'page-width' : 'auto';
    goToPage(Math.min(Math.max(initialPage, 1), pageCount));
    syncPage(viewer.currentPageNumber);
  });
  events.on('pagerendered', ({ error }) => {
    if (error) {
      $('status-text').textContent = 'This page could not be displayed.';
      $('reader-status').hidden = false;
    } else {
      $('reader-status').hidden = true;
    }
  });
  events.on('pagechanging', ({ pageNumber }) => syncPage(pageNumber));
  events.on('scalechanging', ({ scale, presetValue }) => {
    const value = presetValue || String(scale);
    const select = $('zoom');
    if (Array.from(select.options).some(option => option.value === value)) {
      select.value = value;
    } else {
      select.options[select.options.length - 1].textContent = `${Math.round(scale * 100)}%`;
      select.value = 'custom';
    }
  });
  $('previous-page').addEventListener('click', () => goToPage(viewer.currentPageNumber - 1));
  $('next-page').addEventListener('click', () => goToPage(viewer.currentPageNumber + 1));
  $('page-number').addEventListener('change', () => goToPage(Number($('page-number').value)));
  $('page-number').addEventListener('keydown', event => {
    if (event.key === 'Enter') { goToPage(Number(event.target.value)); event.target.blur(); }
  });
  $('zoom').addEventListener('change', event => { viewer.currentScaleValue = event.target.value; });
  $('zoom-in').addEventListener('click', () => { viewer.currentScaleValue = String(Math.min(4, viewer.currentScale * 1.2)); });
  $('zoom-out').addEventListener('click', () => { viewer.currentScaleValue = String(Math.max(0.25, viewer.currentScale / 1.2)); });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (['auto', 'page-width', 'page-fit'].includes(viewer.currentScaleValue)) viewer.currentScaleValue = viewer.currentScaleValue;
    }, 100);
  });

  function setFindOpen(open) {
    $('find-bar').hidden = !open;
    $('toggle-find').setAttribute('aria-expanded', String(open));
    if (open) { $('find-query').focus(); $('find-query').select(); }
    else { events.dispatch('findbarclose', {}); $('toggle-find').focus(); }
  }
  function search(again = false, previous = false) {
    events.dispatch('find', { source: toolbar, type: again ? 'again' : '', query: $('find-query').value, caseSensitive: false, entireWord: false, highlightAll: true, findPrevious: previous, matchDiacritics: false });
  }
  $('toggle-find').addEventListener('click', () => setFindOpen($('find-bar').hidden));
  $('close-find').addEventListener('click', () => setFindOpen(false));
  $('find-query').addEventListener('input', () => search());
  $('find-query').addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); search(true, event.shiftKey); }
    if (event.key === 'Escape') setFindOpen(false);
  });
  $('find-previous').addEventListener('click', () => search(true, true));
  $('find-next').addEventListener('click', () => search(true));
  events.on('updatefindmatchescount', ({ matchesCount }) => {
    $('find-result').textContent = matchesCount.total ? `${matchesCount.current} / ${matchesCount.total}` : '';
  });
  events.on('updatefindcontrolstate', ({ state, matchesCount }) => {
    $('find-result').textContent = state === 1 ? 'No matches' : matchesCount?.total ? `${matchesCount.current} / ${matchesCount.total}` : '';
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault(); setFindOpen(true);
    }
  });

  const pdf = await pdfjs.getDocument({ url: 'assets/preprint-v1.pdf', isEvalSupported: false }).promise;
  pageCount = pdf.numPages;
  $('page-count').textContent = `/ ${pageCount}`;
  $('page-number').max = pageCount;
  for (const id of ['page-number', 'zoom', 'zoom-in', 'zoom-out', 'toggle-find']) $(id).disabled = false;
  viewer.setDocument(pdf);
  links.setDocument(pdf);
} catch (error) {
  console.error(error);
  $('status-text').textContent = 'The paper could not be loaded.';
  $('reader-status').hidden = false;
}
