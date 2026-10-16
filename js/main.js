(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Mobile menu ---- */
  var toggle = $('#menu-toggle'), nav = $('#nav'), links = $$('.nav__link');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.forEach(function (l) {
    l.addEventListener('click', function () { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); });
  });

  /* ---- Active nav link while scrolling ---- */
  var map = {};
  links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });
  var navIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting && map[e.target.id]) {
        links.forEach(function (l) { l.classList.remove('is-active'); });
        map[e.target.id].classList.add('is-active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) navIO.observe(el); });

  /* ---- Services tabs ---- */
  var tabs = $$('.tab'), panels = $$('.svc');
  function showTab(i) {
    tabs.forEach(function (t, n) { t.classList.toggle('is-active', n === i); t.setAttribute('aria-selected', n === i); });
    panels.forEach(function (p, n) { p.hidden = n !== i; });
  }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { showTab(i); }); });
  $$('.fnav a[data-tab]').forEach(function (a) {
    a.addEventListener('click', function () { showTab(+a.getAttribute('data-tab')); });
  });

  /* ---- How it works: progress line fills as you scroll ---- */
  var steps = $('#steps'), fill = $('#steps-fill'), stepEls = $$('.step');
  function progress() {
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var h = Math.max(0, Math.min(r.height, vh * 0.6 - r.top));
    fill.style.height = h + 'px';
    stepEls.forEach(function (s) { s.classList.toggle('is-on', s.offsetTop + 20 <= h); });
  }
  window.addEventListener('scroll', progress, { passive: true });
  window.addEventListener('resize', progress); progress();

  /* ---- Scroll reveal (compliance slide-in) ---- */
  var revIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); revIO.unobserve(e.target); } });
  }, { threshold: 0.25 });
  revIO.observe($('#comp'));

  /* ---- FAQ accordion ---- */
  $$('.qa__q').forEach(function (b) {
    b.addEventListener('click', function () {
      var qa = b.parentNode, open = !qa.classList.contains('is-open');
      qa.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open);
    });
  });

  /* ---- Team cards: hover / tap / keyboard expands one card ---- */
  var members = $$('.member');
  function openMember(m) { members.forEach(function (x) { x.classList.toggle('is-open', x === m); }); }
  members.forEach(function (m) {
    m.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) openMember(m); });
    m.addEventListener('click', function () { openMember(m); });
    m.addEventListener('focus', function () { openMember(m); });
  });

  /* ---- Contact form (Web3Forms -> info@revxcare.com) ---- */
  var form = $('#contact-form'), status = $('#form-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    status.className = 'status full';
    if (!ok) { status.textContent = 'Please fill in your name, a valid work email, and tick the consent box.'; status.classList.add('err'); return; }
    var btn = $('button[type=submit]', form); btn.disabled = true; status.textContent = 'Sending...';
    var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
    fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.success) { form.reset(); status.textContent = 'Thank you! We have received your message and will reply within one business day.'; status.classList.add('ok'); }
      else throw new Error(j.message);
    }).catch(function () {
      status.textContent = 'Sorry, something went wrong. Please email us at info@revxcare.com.'; status.classList.add('err');
    }).then(function () { btn.disabled = false; });
  });

  $('#year').textContent = new Date().getFullYear();
})();
