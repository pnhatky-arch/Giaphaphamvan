(() => {
  const root = document.documentElement;
  const familyTree = document.getElementById('familyTree');
  const treeViewport = document.getElementById('treeViewport');
  const generationButtons = [...document.querySelectorAll('.generation')];
  const people = [...document.querySelectorAll('.person')];
  const columns = [...document.querySelectorAll('[data-generation-column]')];
  const visibleCount = document.getElementById('visibleCount');
  const zoomValue = document.getElementById('zoomValue');
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const treeView = document.getElementById('treeView');
  const placeholderView = document.getElementById('placeholderView');
  const placeholderTitle = document.getElementById('placeholderTitle');
  const navItems = [...document.querySelectorAll('.nav-item')];
  let zoom = 1;

  const titles = {
    overview: 'Tổng quan', members: 'Thành viên', events: 'Sự kiện',
    documents: 'Tư liệu', settings: 'Cài đặt', account: 'Tài khoản'
  };

  function applyZoom(next) {
    zoom = Math.max(.6, Math.min(1.35, next));
    familyTree.style.transform = `scale(${zoom})`;
    familyTree.style.width = `${100 / zoom}%`;
    zoomValue.textContent = `${Math.round(zoom * 100)}%`;
  }

  function filterGeneration(value) {
    generationButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.generation === value));
    if (value === 'all') {
      people.forEach(person => person.hidden = false);
      columns.forEach(column => column.hidden = false);
      visibleCount.textContent = '16';
    } else {
      people.forEach(person => person.hidden = person.dataset.generation !== value);
      columns.forEach(column => column.hidden = column.dataset.generationColumn !== value);
      visibleCount.textContent = String(people.filter(person => person.dataset.generation === value).length);
    }
    treeViewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }

  generationButtons.forEach(btn => btn.addEventListener('click', () => filterGeneration(btn.dataset.generation)));
  document.getElementById('zoomOut').addEventListener('click', () => applyZoom(zoom - .1));
  document.getElementById('zoomIn').addEventListener('click', () => applyZoom(zoom + .1));
  document.getElementById('fitButton').addEventListener('click', () => {
    const available = Math.max(320, treeViewport.clientWidth - 16);
    const natural = 930;
    applyZoom(Math.min(1, available / natural));
    treeViewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  });

  function closeMenu() {
    sidebar.classList.remove('open');
    scrim.classList.remove('show');
  }
  document.getElementById('menuButton').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    scrim.classList.toggle('show');
  });
  scrim.addEventListener('click', closeMenu);

  navItems.forEach(item => item.addEventListener('click', () => {
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    const view = item.dataset.view;
    if (view === 'tree') {
      treeView.hidden = false;
      placeholderView.hidden = true;
    } else {
      treeView.hidden = true;
      placeholderView.hidden = false;
      placeholderTitle.textContent = titles[view] || 'Gia phả họ Phạm';
    }
    closeMenu();
  }));

  const savedTheme = localStorage.getItem('pham-gia-theme');
  if (savedTheme === 'dark') root.classList.add('dark');
  document.getElementById('themeButton').addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('pham-gia-theme', root.classList.contains('dark') ? 'dark' : 'light');
  });

  if (window.innerWidth < 720) requestAnimationFrame(() => document.getElementById('fitButton').click());
})();
