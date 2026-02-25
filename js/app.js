// Urban Apex — Main Application

// ─── Router ───────────────────────────────────────────────────────────────────
const Router = {
  current: null,
  params: {},

  navigate(path, replace = false) {
    const main = document.getElementById('main-content');
    const prog = document.getElementById('nav-progress');
    if (main) { main.style.transition = 'none'; main.style.opacity = '0'; main.style.transform = 'translateY(8px)'; }
    if (prog) { prog.className = ''; prog.style.width = '0%'; void prog.offsetWidth; prog.classList.add('running'); }

    if (replace) history.replaceState(null, '', path);
    else history.pushState(null, '', path);

    requestAnimationFrame(() => {
      setTimeout(() => {
        this.handle(path);
        if (main) requestAnimationFrame(() => {
          main.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          main.style.opacity = '1';
          main.style.transform = 'translateY(0)';
        });
        if (prog) { prog.classList.remove('running'); prog.classList.add('done'); setTimeout(() => prog.className = '', 500); }
      }, 30);
    });
  },

  handle(path) {
    const stickyBar = document.getElementById('mobile-sticky-cart');
    if (stickyBar) stickyBar.style.display = 'none';
    const filterOverlay = document.getElementById('filter-overlay');
    const filterDrawer  = document.getElementById('filter-drawer');
    if (filterOverlay) filterOverlay.classList.remove('open');
    if (filterDrawer)  filterDrawer.classList.remove('open');
    document.body.style.overflow = '';

    window.scrollTo({ top: 0, behavior: 'instant' });

    const [base, ...rest] = path.split('?')[0].replace(/^\//, '').split('/');
    const qs = new URLSearchParams(window.location.search);

    if (!base || base === '') return Pages.home();
    if (base === 'collection') return Pages.collection(rest[0] || 'all', qs);
    if (base === 'product') return Pages.product(rest[0]);
    if (base === 'cart') return Pages.cart();
    if (base === 'checkout') return Pages.checkout();
    if (base === 'wishlist') return Pages.wishlist();
    if (base === 'order-success') return Pages.orderSuccess();
    if (base === 'search') return Pages.search(qs.get('q') || '');
    Pages.notFound();
  },

  init() {
    window.addEventListener('popstate', () => this.handle(location.pathname + location.search));
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-route]');
      if (a) { e.preventDefault(); this.navigate(a.dataset.route); }
    });
    this.handle(location.pathname + location.search);
  }
};

// ─── App Init ────────────────────────────────────────────────────────────────
function initApp() {
  initHeader();
  initTimer();
  initAnnouncement();
  initCartDrawer();
  initMobileMenu();
  initSearchSuggestions();
  initScrollReveal();
  updateCartBadge();
  Store.on('cart:update', updateCartBadge);
  Store.on('cart:add', showCartAddedToast);
  // Real-time form validation: clear errors on input
  document.addEventListener('input', e => {
    if (e.target.classList.contains('form-input') && e.target.classList.contains('error')) {
      e.target.classList.remove('error');
      const err = e.target.parentNode.querySelector('.form-error');
      if (err) err.remove();
    }
  });
  // Expose filter functions globally before router runs
  window.toggleFilters      = toggleFilters;
  window.applyMobileFilters = applyMobileFilters;
  window.clearMobileFilters = clearMobileFilters;
  // ─── Ripple effect on .btn clicks ───────────────────────────────────────────
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  // ─── Prefers-reduced-motion: pause ticker animations ────────────────────────
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggleTickers = (reduced) => {
    ['offers-track', 'announcement-ticker'].forEach(id => {
      const el = document.getElementById(id) || document.querySelector('.' + id);
      if (el) el.style.animationPlayState = reduced ? 'paused' : 'running';
    });
  };
  toggleTickers(prefersReduced.matches);
  prefersReduced.addEventListener('change', e => toggleTickers(e.matches));

  // ─── Dark mode: respect system preference + toggle ────────────────────────
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = (() => { try { return localStorage.getItem('ua_theme'); } catch { return null; } })();
  if (savedTheme === 'dark' || (!savedTheme && prefersDark.matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  prefersDark.addEventListener('change', e => {
    if (!localStorage.getItem('ua_theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  // Add Escape key handler for quick view
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeQuickView();
      const filterOverlay = document.getElementById('filter-overlay');
      if (filterOverlay?.classList.contains('open')) toggleFilters();
    }
  });
  // Make sale timer clickable
  const saleTimer = document.getElementById('sale-timer');
  if (saleTimer) {
    saleTimer.style.cursor = 'pointer';
    saleTimer.addEventListener('click', () => Router.navigate('/collection/all'));
  }
  // Preload Unsplash connection (keep for other images)
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = 'https://images.unsplash.com';
  document.head.appendChild(link);

  Router.init();
}

// ─── Header ──────────────────────────────────────────────────────────────────
function initHeader() {
  // Throttled scroll handler
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        document.getElementById('header').classList.toggle('scrolled', window.scrollY > 10);
        // Show/hide back-to-top button
        const btn = document.getElementById('back-to-top');
        if (btn) btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Mega menu with aria-expanded
  document.querySelectorAll('.mega-menu-container').forEach(container => {
    const menu   = container.querySelector('.mega-menu');
    const trigger = container.querySelector('.nav-link');
    if (!menu) return;
    let timeout;
    const open = () => {
      clearTimeout(timeout);
      menu.classList.add('open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      timeout = setTimeout(() => {
        menu.classList.remove('open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }, 200);
    };
    container.addEventListener('mouseenter', open);
    container.addEventListener('mouseleave', close);
    // Keyboard support: open on Enter/Space, close on Escape
    if (trigger) {
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menu.classList.contains('open') ? close() : open(); }
        if (e.key === 'Escape') close();
      });
    }
  });

  // Cart icon hover preview (desktop only)
  const cartBtn = document.querySelector('.header-action-btn[onclick="openCart()"]');
  if (cartBtn) {
    let cartPreviewTimeout;
    cartBtn.addEventListener('mouseenter', () => {
      if (window.innerWidth < 768) return;
      clearTimeout(cartPreviewTimeout);
      showCartMiniPreview();
    });
    cartBtn.addEventListener('mouseleave', () => {
      cartPreviewTimeout = setTimeout(hideCartMiniPreview, 400);
    });
  }

  // Back to top button
  document.getElementById('back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function showCartMiniPreview() {
  let preview = document.getElementById('cart-mini-preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.id = 'cart-mini-preview';
    preview.className = 'cart-mini-preview';
    document.getElementById('header').appendChild(preview);
    preview.addEventListener('mouseenter', () => clearTimeout(window._cartPreviewTimeout));
    preview.addEventListener('mouseleave', () => { window._cartPreviewTimeout = setTimeout(hideCartMiniPreview, 300); });
  }
  const items = Store.cart.slice(0, 3);
  if (!items.length) {
    preview.innerHTML = `<div class="cart-mini-empty">Your cart is empty</div>`;
  } else {
    preview.innerHTML = `
      ${items.map(i => `
        <div class="cart-mini-item">
          <img src="${i.image}" alt="${i.name}" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80'">
          <div class="cart-mini-info">
            <div class="cart-mini-name">${i.name}</div>
            <div class="cart-mini-price">${formatPrice(i.price)} × ${i.qty}</div>
          </div>
        </div>`).join('')}
      ${Store.cart.length > 3 ? `<div class="cart-mini-more">+${Store.cart.length - 3} more items</div>` : ''}
      <div class="cart-mini-total">Total: <strong>${formatPrice(Store.getCartTotal())}</strong></div>
      <button class="btn btn-primary btn-full btn-sm" onclick="openCart()">View Cart</button>
    `;
  }
  preview.classList.add('visible');
}

function hideCartMiniPreview() {
  const preview = document.getElementById('cart-mini-preview');
  if (preview) preview.classList.remove('visible');
}

// ─── Timer ───────────────────────────────────────────────────────────────────
function initTimer() {
  // Persist the sale-end time in sessionStorage so navigating within the SPA
  // doesn't reset the countdown on every page load.
  const SESSION_KEY = 'ua_sale_end';
  let end;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    end = stored ? parseInt(stored, 10) : null;
  } catch { end = null; }

  if (!end || end <= Date.now()) {
    // ~4 days + some hours/mins so it looks specific
    end = Date.now() + (4 * 24 * 60 * 60 + 9 * 3600 + 7 * 60 + 22) * 1000;
    try { sessionStorage.setItem(SESSION_KEY, String(end)); } catch {}
  }

  function update() {
    const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
    const d = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    const el = id => document.getElementById(id);
    if (el('timer-d')) el('timer-d').textContent = String(d).padStart(2, '0');
    if (el('timer-h')) el('timer-h').textContent = String(h).padStart(2, '0');
    if (el('timer-m')) el('timer-m').textContent = String(m).padStart(2, '0');
    if (el('timer-s')) el('timer-s').textContent = String(s).padStart(2, '0');
    if (diff === 0) clearInterval(timerInterval);
  }
  update();
  const timerInterval = setInterval(update, 1000);
}

// ─── Announcement ────────────────────────────────────────────────────────────
function initAnnouncement() {
  const bar = document.getElementById('announcement-bar');
  if (bar) {
    document.querySelector('.announcement-close')?.addEventListener('click', () => {
      bar.style.height = bar.offsetHeight + 'px';
      bar.style.overflow = 'hidden';
      setTimeout(() => { bar.style.height = '0'; bar.style.padding = '0'; }, 10);
    });
  }
}

// ─── Cart Drawer ─────────────────────────────────────────────────────────────
function initCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  
  window.openCart = function() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
    // Focus trap: move focus to close button
    setTimeout(() => drawer.querySelector('.cart-close')?.focus(), 50);
  };

  window.closeCart = function() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // Return focus to cart button
    document.querySelector('.header-action-btn[onclick="openCart()"]')?.focus();
  };

  // Keyboard: close on Escape
  drawer.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });
  
  overlay.addEventListener('click', closeCart);
  Store.on('cart:update', () => {
    if (drawer.classList.contains('open')) renderCartDrawer();
    updateCartBadge();
  });
}

function renderCartDrawer() {
  const items = Store.cart;
  const container = document.getElementById('cart-items-container');
  const footer = document.getElementById('cart-footer');
  
  if (!items.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some beautiful furniture to get started</p>
        <button class="btn btn-primary" onclick="closeCart(); Router.navigate('/')">Browse Collection</button>
      </div>`;
    footer.style.display = 'none';
    return;
  }
  
  footer.style.display = 'block';
  container.innerHTML = items.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-color">${item.color}</div>
        <div class="cart-item-delivery">🚚 Delivery by ${getCartDeliveryDate(item.id)}</div>
        <div class="cart-item-bottom">
          <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn" type="button" aria-label="Decrease quantity of ${item.name}" onclick="Store.updateQty(${item.id}, ${item.qty - 1})">−</button>
            <span class="cart-qty-num" aria-label="Quantity: ${item.qty}">${item.qty}</span>
            <button class="cart-qty-btn" type="button" aria-label="Increase quantity of ${item.name}" onclick="Store.updateQty(${item.id}, ${item.qty + 1})">+</button>
          </div>
        </div>
        <div style="display:flex;gap:12px;align-items:center;margin-top:4px">
          <button class="cart-item-remove" type="button" onclick="removeCartItemWithUndo(${item.id}, '${item.name.replace(/'/g, "\\'")}')">Remove</button>
          <button class="cart-item-save-later" type="button" onclick="saveForLater(${item.id})">Save for later</button>
        </div>
      </div>
    </div>
  `).join('');
  
  renderCartTotals();
}

function renderCartTotals(couponDiscount = Store.getDiscount()) {
  const subtotal = Store.getCartTotal();
  const shipping = subtotal > 25000 ? 0 : 499;
  const discount = couponDiscount;
  const total = subtotal - discount + shipping;
  
  document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('cart-shipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  if (document.getElementById('cart-discount-row')) {
    document.getElementById('cart-discount-row').style.display = discount > 0 ? 'flex' : 'none';
    document.getElementById('cart-discount').textContent = '- ' + formatPrice(discount);
  }
  document.getElementById('cart-total').textContent = formatPrice(total);
}

// ─── Undo-remove for cart items (replaces confirm() dialog) ──────────────────
function removeCartItemWithUndo(productId, productName) {
  const item = Store.getItem(productId);
  if (!item) return;

  Store.removeFromCart(productId);

  // Show an undo toast for 4 s
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  let undone = false;
  toast.innerHTML = `<span aria-hidden="true">🗑️</span><span style="flex:1">${productName} removed</span><button type="button" style="background:rgba(255,255,255,0.2);border:none;color:white;font-size:0.78rem;font-weight:600;padding:4px 10px;border-radius:4px;cursor:pointer;flex-shrink:0;touch-action:manipulation" onclick="this.closest('.toast')._undo()">Undo</button>`;
  toast._undo = () => {
    if (undone) return;
    undone = true;
    Store.addToCart(item, item.qty);
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 200);
  };

  container.appendChild(toast);
  const removeTimer = setTimeout(() => {
    if (undone) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 200);
  }, 4000);
  // Allow the undo button to also clear the auto-remove timer
  toast._undo = () => {
    if (undone) return;
    undone = true;
    clearTimeout(removeTimer);
    Store.addToCart(item, item.qty);
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 200);
  };
}
window.removeCartItemWithUndo = removeCartItemWithUndo;

// ─── Mobile Menu ─────────────────────────────────────────────────────────────
function initMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  const menuBtn = document.querySelector('.mobile-menu-btn');

  const openNav = () => {
    nav.classList.add('open');
    document.body.style.overflow = 'hidden';
    menuBtn?.setAttribute('aria-expanded', 'true');
    // Focus first link for a11y
    setTimeout(() => nav.querySelector('.mobile-nav-link')?.focus(), 80);
  };
  const closeNav = () => {
    nav.classList.remove('open');
    document.body.style.overflow = '';
    menuBtn?.setAttribute('aria-expanded', 'false');
    menuBtn?.focus();
  };

  menuBtn?.setAttribute('aria-expanded', 'false');
  menuBtn?.setAttribute('aria-controls', 'mobile-nav');
  menuBtn?.addEventListener('click', openNav);
  // Overlay (backdrop) and close button are inside #mobile-nav per the CSS/HTML structure
  nav.querySelector('.mobile-nav-overlay')?.addEventListener('click', closeNav);
  nav.querySelector('.cart-close')?.addEventListener('click', closeNav);

  // Close on Escape
  nav.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  // ── Collapsible sub-links ─────────────────────────────────────────────────
  nav.querySelectorAll('.mobile-nav-link[data-has-sub]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const subId = link.getAttribute('data-has-sub');
      const sub = document.getElementById(subId);
      if (!sub) return;
      const open = sub.classList.contains('open');
      // Close all others
      nav.querySelectorAll('.mobile-nav-sub').forEach(s => {
        s.classList.remove('open');
        s.style.maxHeight = '0';
      });
      nav.querySelectorAll('.mobile-nav-link[data-has-sub]').forEach(l => l.classList.remove('sub-open'));
      if (!open) {
        sub.classList.add('open');
        sub.style.maxHeight = sub.scrollHeight + 'px';
        link.classList.add('sub-open');
        link.setAttribute('aria-expanded', 'true');
      } else {
        link.setAttribute('aria-expanded', 'false');
      }
    });
    link.setAttribute('aria-expanded', 'false');
    link.setAttribute('aria-haspopup', 'true');
  });
}

// ─── Search ──────────────────────────────────────────────────────────────────
function highlightMatch(text, query) {
  if (!query) return text;
  const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return text.replace(re, '<mark class="search-highlight">$1</mark>');
}

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem('ua_recent_searches') || '[]'); } catch { return []; }
}

function addRecentSearch(q) {
  try {
    let recent = getRecentSearches().filter(s => s !== q);
    recent.unshift(q);
    localStorage.setItem('ua_recent_searches', JSON.stringify(recent.slice(0, 5)));
  } catch {}
}

function renderSearchSuggestions(input, suggestions) {
  const q = input.value.trim();
  const ql = q.toLowerCase();

  if (q.length < 2) {
    const recent = getRecentSearches();
    if (recent.length) {
      suggestions.innerHTML = `
        <div class="suggestions-header">Recent Searches</div>
        ${recent.map(s => `
          <div class="suggestion-item suggestion-recent" onclick="document.getElementById('search-input').value='${s.replace(/'/g,"\'")}'; renderSearchSuggestions(document.getElementById('search-input'), document.getElementById('search-suggestions'));">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.72"/></svg>
            <div class="suggestion-info"><div class="suggestion-name">${s}</div></div>
          </div>`).join('')}
        <div class="suggestion-clear-recent" onclick="localStorage.removeItem('ua_recent_searches'); document.getElementById('search-suggestions').classList.remove('open')">Clear recent</div>
      `;
      suggestions.classList.add('open');
    } else {
      suggestions.classList.remove('open');
    }
    return;
  }

  const results = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(ql) || p.category.toLowerCase().includes(ql) ||
    p.subcategory.toLowerCase().includes(ql)
  ).slice(0, 6);

  if (!results.length) { suggestions.classList.remove('open'); return; }

  suggestions.innerHTML = results.map(p => `
    <div class="suggestion-item" role="option" onclick="document.getElementById('search-suggestions').classList.remove('open'); addRecentSearch('${p.name.replace(/'/g,"\\'").replace(/"/g,'&quot;')}'); Router.navigate('/product/${p.slug}')">
      <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100'">
      <div class="suggestion-info">
        <div class="suggestion-name">${highlightMatch(p.name, q)}</div>
        <div class="suggestion-price">${formatPrice(p.price)}</div>
      </div>
    </div>
  `).join('');
  suggestions.classList.add('open');
}

function initSearchSuggestions() {
  const input = document.getElementById('search-input');
  const suggestions = document.getElementById('search-suggestions');
  if (!input) return;

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', 'search-suggestions');
  input.setAttribute('aria-expanded', 'false');
  suggestions.setAttribute('role', 'listbox');

  let timeout;
  input.addEventListener('focus', () => {
    clearTimeout(timeout);
    renderSearchSuggestions(input, suggestions);
    input.setAttribute('aria-expanded', 'true');
  });

  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      renderSearchSuggestions(input, suggestions);
      input.setAttribute('aria-expanded', suggestions.classList.contains('open') ? 'true' : 'false');
    }, 180);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      suggestions.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      const q = input.value.trim();
      if (q) { addRecentSearch(q); Router.navigate('/search?q=' + encodeURIComponent(q)); }
    }
    if (e.key === 'Escape') {
      suggestions.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.header-search')) {
      suggestions.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
    }
  });

  // Voice search (progressive enhancement)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceBtn = document.getElementById('voice-search-btn');
  if (SpeechRecognition && voiceBtn) {
    voiceBtn.style.display = 'flex';
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    let isListening = false;

    voiceBtn.addEventListener('click', () => {
      if (isListening) { recognition.stop(); return; }
      recognition.start();
      isListening = true;
      voiceBtn.classList.add('listening');
      voiceBtn.setAttribute('aria-label', 'Listening… click to stop');
    });

    recognition.onresult = e => {
      const transcript = e.results[0][0].transcript;
      input.value = transcript;
      renderSearchSuggestions(input, suggestions);
      suggestions.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
    };

    recognition.onend = () => {
      isListening = false;
      voiceBtn.classList.remove('listening');
      voiceBtn.setAttribute('aria-label', 'Search by voice');
    };

    recognition.onerror = () => {
      isListening = false;
      voiceBtn.classList.remove('listening');
      showToast('Voice search not available', 'error');
    };
  }
}

// ─── Scroll Reveal ───────────────────────────────────────────────────────────
/**
 * Attach IntersectionObserver to every .reveal element inside `root`.
 * Defaults to the full document so the initial call on app boot works as before.
 * Pass a specific container (e.g. #main-content) after dynamic renders so only
 * the newly injected elements are observed — avoids re-observing already-visible ones.
 */
function initScrollReveal(root = document) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  
  root.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─── Cart Badge ───────────────────────────────────────────────────────────────
function updateCartBadge() {
  const count = Store.getCartCount();
  const badge = document.getElementById('cart-count');
  if (badge) {
    const wasVisible = badge.classList.contains('visible');
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
    if (count > 0 && wasVisible) {
      // Bounce animation on update
      badge.classList.remove('badge-bounce');
      void badge.offsetWidth; // reflow
      badge.classList.add('badge-bounce');
    }
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'default') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✓', error: '✕', default: '🛋️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `<span aria-hidden="true">${icons[type] || '✓'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

function showCartAddedToast(product) {
  showToast(`${product.name} added to cart`, 'success');
}

// ─── Form Validation ─────────────────────────────────────────────────────────
function validateCheckoutForm() {
  let valid = true;
  document.querySelectorAll('.form-error').forEach(e => e.remove());
  document.querySelectorAll('.form-input.error').forEach(e => e.classList.remove('error'));

  const form = document.querySelector('.checkout-form');
  if (!form) return true;

  const addError = (input, msg) => {
    input.classList.add('error');
    const span = document.createElement('span');
    span.className = 'form-error';
    span.textContent = msg;
    input.parentNode.appendChild(span);
    valid = false;
  };

  form.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"]').forEach(inp => {
    if (!inp.value.trim()) addError(inp, 'This field is required');
  });

  const email = form.querySelector('input[type="email"]');
  if (email && email.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value))
    addError(email, 'Enter a valid email address');

  const phone = form.querySelector('input[type="tel"]');
  if (phone && phone.value && phone.value.replace(/\D/g,'').length < 10)
    addError(phone, 'Enter a valid 10-digit phone number');

  const pin = form.querySelector('input[data-validate="pincode"]');
  if (pin && pin.value && !/^\d{6}$/.test(pin.value.trim()))
    addError(pin, 'Enter a valid 6-digit PIN code');

  if (!valid) {
    const first = form.querySelector('.form-input.error');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Please fix the errors before continuing', 'error');
  }
  return valid;
}

// ─── Pages ───────────────────────────────────────────────────────────────────
const Pages = {

  // ── Home ────────────────────────────────────────────────────────────────────
  home() {
    document.getElementById('main-content').innerHTML = `
      ${renderHero()}
      ${renderOffersStrip()}
      ${renderCategories()}
      ${renderDeals()}
      ${renderFeaturedBanner()}
      ${renderProductsSection('Bestsellers', PRODUCTS.filter(p => p.badge === 'Bestseller' || p.badge === 'Top Rated'), 'bestsellers')}
      ${renderBannerSplit()}
      ${renderProductsSection('New Arrivals', PRODUCTS.filter(p => p.badge === 'New' || p.badge === 'Trending'), 'new-arrivals')}
      ${renderBannerFull('https://i.postimg.cc/85C390rJ/1.png', 'Modern Living', 'Sculptural pieces for contemporary spaces', '/collection/living')}
      ${renderProductsSection('Under ₹15,000', PRODUCTS.filter(p => p.price < 15000), 'budget')}
      ${renderTrustmarks()}
      ${renderPopularSearches()}
      ${renderRecentlyViewed()}
    `;
    initHeroSlider();
    initOffersScroll();
    initScrollReveal(document.getElementById('main-content'));
  },

  // ── Collection ──────────────────────────────────────────────────────────────
  collection(category, qs = new URLSearchParams()) {
    // Normalize category: remove any extra spaces, lowercase
    const normalizedCategory = category.trim().toLowerCase();
    
    // Filter products by category (exact match)
    let products = PRODUCTS.filter(p => p.category.toLowerCase() === normalizedCategory);
    
    // If no products found, try a fallback (e.g., if category is 'all')
    if (category === 'all') {
      products = [...PRODUCTS];
    } else if (products.length === 0) {
      // Attempt partial match (e.g., 'living' matches 'living room'? but our categories are exact)
      products = PRODUCTS.filter(p => p.category.toLowerCase().includes(normalizedCategory));
    }

    const cat = CATEGORIES.find(c => c.id === normalizedCategory);
    const catName = cat ? cat.name : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Additional filter from query params: subcategory (type or sub)
    const subFilter = qs.get('type') || qs.get('sub') || '';
    if (subFilter) {
      const subLower = subFilter.toLowerCase();
      products = products.filter(p => p.subcategory.toLowerCase().includes(subLower));
    }

    // Price filters
    const urlMin = qs.get('min') ? parseFloat(qs.get('min')) : null;
    const urlMax = qs.get('max') ? parseFloat(qs.get('max')) : null;
    const urlSort = qs.get('sort') || 'default';

    let filteredProducts = [...products];
    if (urlMin) filteredProducts = filteredProducts.filter(p => p.price >= urlMin);
    if (urlMax) filteredProducts = filteredProducts.filter(p => p.price <= urlMax);
    if (urlSort === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
    if (urlSort === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
    if (urlSort === 'rating') filteredProducts.sort((a, b) => b.rating - a.rating);
    if (urlSort === 'discount') filteredProducts.sort((a, b) => b.discount - a.discount);

    const activeFilterCount = (urlMin ? 1 : 0) + (urlMax ? 1 : 0) + (subFilter ? 1 : 0);

    document.getElementById('main-content').innerHTML = `
      <div class="page-hero">
        <div class="container">
          <h1 class="fade-in">${catName}</h1>
          <p>${cat ? cat.description : 'Browse our curated collection of ' + catName}</p>
        </div>
      </div>
      <div class="container section">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a data-route="/" href="/">Home</a><span aria-hidden="true">/</span>
          <a data-route="/collection/all" href="/collection/all">All Furniture</a><span aria-hidden="true">/</span>
          <span aria-current="page">${catName}</span>
        </nav>
        <div class="shop-layout">
          <aside class="filters-sidebar" aria-label="Product Filters">
            ${renderFilters(urlMin, urlMax)}
          </aside>
          <div class="shop-main">
            <div class="sort-bar">
              <span class="results-count" aria-live="polite" aria-atomic="true">${filteredProducts.length} products</span>
              <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                <button class="mobile-filter-btn btn btn-outline btn-sm" onclick="toggleFilters()" aria-expanded="false" aria-controls="filter-drawer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
                  Filters${activeFilterCount > 0 ? ' <span class="filter-count-badge">' + activeFilterCount + '</span>' : ''}
                </button>
                ${activeFilterCount > 0 ? '<button class="btn btn-ghost btn-sm" onclick="clearFilters()" style="color:var(--accent)">✕ Clear Filters</button>' : ''}
                <select class="sort-select" onchange="handleSort(this.value)" aria-label="Sort products">
                  <option value="default" ${urlSort === 'default' ? 'selected' : ''}>Sort: Featured</option>
                  <option value="price-asc" ${urlSort === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                  <option value="price-desc" ${urlSort === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                  <option value="rating" ${urlSort === 'rating' ? 'selected' : ''}>Top Rated</option>
                  <option value="discount" ${urlSort === 'discount' ? 'selected' : ''}>Best Discount</option>
                  <option value="newest" ${urlSort === 'newest' ? 'selected' : ''}>Newest</option>
                </select>
              </div>
            </div>
            <div class="products-grid" id="products-grid">
              ${filteredProducts.length ? filteredProducts.map(p => renderProductCard(p)).join('') : '<div class="empty-state"><div class="empty-icon">🔍</div><h3>No products found</h3><p>Try adjusting your filters</p><button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button></div>'}
            </div>
          </div>
        </div>
      </div>
    `;

    window._currentProducts = products;
    window._currentCategory = category;
    window._currentSort = urlSort;
    initMobileFilters();
    initScrollReveal(document.getElementById('main-content'));
  },

  // ── Product Detail ───────────────────────────────────────────────────────────
  product(slug) {
    const product = PRODUCTS.find(p => p.slug === slug);
    if (!product) { Pages.notFound(); return; }
    
    let qty = 1;
    
    document.getElementById('main-content').innerHTML = `
      <div class="container">
        <nav class="breadcrumb">
          <a data-route="/" href="/">Home</a><span>/</span>
          <a data-route="/collection/${product.category}" href="/collection/${product.category}">${product.subcategory}</a><span>/</span>
          <span>${product.name}</span>
        </nav>
        <div class="product-detail-layout">
          <div class="product-gallery">
            <div class="gallery-main" id="gallery-main">
              <img id="gallery-main-img" src="${product.images[0]}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'">
            </div>
            <div class="gallery-thumbs">
              ${product.images.map((img, i) => `
                <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="selectThumb(${i})" id="thumb-${i}">
                  <img src="${img}" alt="" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'">
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="product-detail-info fade-in">
            <div class="product-detail-badge">
              ${product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase().replace(' ','')}">★ ${product.badge}</span>` : ''}
              <span class="product-badge badge-sale">${product.discount}% OFF</span>
            </div>
            <h1 class="product-detail-title">${product.name}</h1>
            <div class="product-detail-rating">
              <div style="display:flex;gap:2px">${renderStars(product.rating)}</div>
              <span class="detail-rating-text">${product.rating} (${product.reviews.toLocaleString()} reviews)</span>
            </div>
            
            <div class="product-detail-price">
              <div class="detail-price-main">${formatPrice(product.price)}</div>
              <div class="detail-price-row">
                <span class="detail-price-original">${formatPrice(product.originalPrice)}</span>
                <span class="detail-savings">You save ${formatPrice(product.originalPrice - product.price)} (${product.discount}%)</span>
              </div>
              <div class="detail-tax">Inclusive of all taxes</div>
            </div>

            <div class="product-options">
              <div class="option-label">Colour — <strong>${product.color}</strong></div>
              <div style="margin-bottom:16px">
                <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${getColorHex(product.color)};border:2px solid var(--bark);margin-right:8px;"></span>
              </div>
              <div class="option-label">Quantity</div>
              <div class="qty-control" id="qty-control">
                <button class="qty-btn" onclick="changeQty(-1)">−</button>
                <span class="qty-display" id="qty-display">1</span>
                <button class="qty-btn" onclick="changeQty(1)">+</button>
              </div>
            </div>
            
            <div class="product-ctas">
              <button class="btn btn-primary btn-lg" onclick="addToCartDetail()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Add to Cart
              </button>
              <button class="btn btn-accent btn-lg" onclick="buyNow()">Buy Now</button>
            </div>
            
            <button class="wishlist-toggle ${Store.isWishlisted(product.id) ? 'active' : ''}" id="wishlist-btn" onclick="toggleWishlistDetail()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${Store.isWishlisted(product.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ${Store.isWishlisted(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>
            
            <div class="product-divider"></div>
            
            <div class="viewer-count" id="viewer-count">
              <span class="viewer-dot"></span>
              <span id="viewer-num">...</span> people are viewing this right now
            </div>
            <div class="trust-badges">
              <div class="trust-badge"><span class="trust-badge-icon">🚚</span> Free Delivery above ₹25,000</div>
              <div class="trust-badge"><span class="trust-badge-icon">🔄</span> 30-Day Returns</div>
              <div class="trust-badge"><span class="trust-badge-icon">🛡️</span> ${product.warranty} Warranty</div>
              <div class="trust-badge"><span class="trust-badge-icon">✅</span> Verified Quality</div>
            </div>
            
            <div class="product-divider"></div>
            
            <div class="product-specs">
              ${[
                ['Category', product.subcategory],
                ['Material', product.material],
                ['Dimensions', product.dimensions],
                ['Weight', product.weight],
                ['Colour', product.color],
                product.warranty ? ['Warranty', product.warranty] : null
              ].filter(Boolean).map(([k,v]) => `
                <div class="spec-row">
                  <span class="spec-key">${k}</span>
                  <span class="spec-val">${v}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="detail-tabs">
          <button class="detail-tab active" onclick="switchTab('desc', this)">Description</button>
          <button class="detail-tab" onclick="switchTab('features', this)">Features</button>
          <button class="detail-tab" onclick="switchTab('specs', this)">Specifications</button>
          <button class="detail-tab" onclick="switchTab('reviews', this)">Reviews (${product.reviews})</button>
        </div>
        
        <div class="detail-tab-content active" id="tab-desc">
          <p style="font-size:1rem;line-height:1.8;max-width:720px;color:var(--text)">${product.description}</p>
        </div>
        <div class="detail-tab-content" id="tab-features">
          <div class="features-list">
            ${(product.features || []).map(f => `<div class="feature-item">${f}</div>`).join('')}
          </div>
        </div>
        <div class="detail-tab-content" id="tab-specs">
          <div class="product-specs" style="max-width:480px">
            ${[
              ['Name', product.name],
              ['Category', product.subcategory],
              ['Material', product.material],
              ['Dimensions', product.dimensions],
              ['Weight', product.weight],
              ['Colour', product.color],
              product.warranty ? ['Warranty', product.warranty] : null
            ].filter(Boolean).map(([k,v]) => `
              <div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>
            `).join('')}
          </div>
        </div>
        <div class="detail-tab-content" id="tab-reviews">
          ${renderReviews(product)}
        </div>
        
        <!-- Related -->
        <div class="section">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-eyebrow">You May Also Like</div>
              <h2 class="section-title">Related Products</h2>
            </div>
          </div>
          <div class="products-grid">
            ${PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map(p => renderProductCard(p)).join('')}
          </div>
        </div>
      </div>
    `;
    
    // Attach product-specific functions
    window._currentProduct = product;
    window._currentQty = 1;
    initScrollReveal(document.getElementById('main-content'));

    // Track recently viewed
    try {
      let rv = JSON.parse(localStorage.getItem('ua_recently_viewed') || '[]');
      rv = rv.filter(id => id !== product.id);
      rv.unshift(product.id);
      localStorage.setItem('ua_recently_viewed', JSON.stringify(rv.slice(0, 10)));
    } catch {}
    
    window.changeQty = function(delta) {
      window._currentQty = Math.max(1, Math.min(10, window._currentQty + delta));
      document.getElementById('qty-display').textContent = window._currentQty;
    };
    
    window.addToCartDetail = function() {
      Store.addToCart(product, window._currentQty);
      openCart();
    };
    
    window.buyNow = function() {
      Store.addToCart(product, window._currentQty);
      Router.navigate('/checkout');
    };
    
    window.toggleWishlistDetail = function() {
      const added = Store.toggleWishlist(product);
      const btn = document.getElementById('wishlist-btn');
      btn.classList.toggle('active', added);
      btn.querySelector('svg').setAttribute('fill', added ? 'currentColor' : 'none');
      btn.lastChild.textContent = added ? ' Saved to Wishlist' : ' Add to Wishlist';
      showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
    };
    
    window.selectThumb = function(i) {
      document.getElementById('gallery-main-img').src = product.images[i];
      document.querySelectorAll('.gallery-thumb').forEach((t, idx) => t.classList.toggle('active', idx === i));
    };
    
    window.switchTab = function(tab, btn) {
      document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.detail-tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    };

    // Simulated real-time viewer count
    (function initViewerCount() {
      const el = document.getElementById('viewer-num');
      if (!el) return;
      const base = Math.floor(Math.random() * 60) + 20;
      el.textContent = base;
      const interval = setInterval(() => {
        if (!document.getElementById('viewer-num')) { clearInterval(interval); return; }
        const delta = Math.random() < 0.5 ? -1 : 1;
        const current = parseInt(el.textContent) || base;
        el.textContent = Math.max(5, Math.min(120, current + delta));
      }, 4000 + Math.random() * 3000);
    })();

    // Show sticky add to cart bar on mobile when on product detail page
    const stickyBar = document.getElementById('mobile-sticky-cart');
    if (stickyBar) {
      stickyBar.style.display = 'block';
      // Ensure the button reflects the correct product name for screen readers
      const stickyBtn = stickyBar.querySelector('button');
      if (stickyBtn) stickyBtn.setAttribute('aria-label', `Add ${product.name} to cart`);
    }
  },

  // ── Cart Page ───────────────────────────────────────────────────────────────
  cart() {
    document.getElementById('main-content').innerHTML = `
      <div class="page-hero">
        <div class="container"><h1 class="fade-in">Shopping Cart</h1></div>
      </div>
      <div class="container section">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a data-route="/" href="/">Home</a><span aria-hidden="true">/</span>
          <span aria-current="page">Shopping Cart</span>
        </nav>
        <div class="cart-page-layout" id="cart-page-container">
          ${renderCartPage()}
        </div>
        <div id="saved-for-later-section" class="cart-page-items saved-later-container" style="display:none;margin-top:24px"></div>
      </div>
    `;
  // Clean up previous page's cart:update listener before attaching a new one
  // to prevent accumulating listeners across SPA navigations.
  if (window._cartPageUnsub) { window._cartPageUnsub(); window._cartPageUnsub = null; }
  window._cartPageUnsub = Store.on('cart:update', () => {
    document.getElementById('cart-page-container').innerHTML = renderCartPage();
    attachCartPageListeners();
  });
  attachCartPageListeners();
  setTimeout(renderSavedForLater, 0);
  },

  // ── Checkout ────────────────────────────────────────────────────────────────
  checkout() {
    if (!Store.cart.length) { Router.navigate('/cart'); return; }
    
    const subtotal = Store.getCartTotal();
    const shipping = subtotal > 25000 ? 0 : 499;
    const discount = Store.getDiscount();

    document.getElementById('main-content').innerHTML = `
      <div class="page-hero">
        <div class="container"><h1 class="fade-in">Checkout</h1></div>
      </div>
      <div class="container section">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a data-route="/" href="/">Home</a><span aria-hidden="true">/</span>
          <a data-route="/cart" href="/cart">Cart</a><span aria-hidden="true">/</span>
          <span aria-current="page">Checkout</span>
        </nav>
        <div class="checkout-layout">
          <div class="checkout-form">
            <div class="form-section">
              <h2 class="form-section-title">Delivery Address</h2>
              <div class="form-grid">
                <div class="form-field"><label class="form-label">First Name</label><input class="form-input" type="text" placeholder="John"></div>
                <div class="form-field"><label class="form-label">Last Name</label><input class="form-input" type="text" placeholder="Doe"></div>
                <div class="form-field"><label class="form-label">Phone</label><input class="form-input" type="tel" placeholder="+91 98765 43210"></div>
                <div class="form-field"><label class="form-label">Email</label><input class="form-input" type="email" placeholder="john@email.com"></div>
                <div class="form-field full"><label class="form-label">Address Line 1</label><input class="form-input" type="text" placeholder="House/Flat No, Street Name"></div>
                <div class="form-field full"><label class="form-label">Address Line 2</label><input class="form-input" type="text" placeholder="Locality, Landmark"></div>
                <div class="form-field"><label class="form-label">City</label><input class="form-input" type="text" placeholder="Bengaluru"></div>
                <div class="form-field"><label class="form-label">State</label>
                  <select class="form-input">
                    <option>Karnataka</option><option>Maharashtra</option><option>Delhi</option><option>Tamil Nadu</option><option>Telangana</option><option>Gujarat</option>
                  </select>
                </div>
                <div class="form-field"><label class="form-label">PIN Code</label><input class="form-input" type="text" data-validate="pincode" placeholder="560001" maxlength="6" inputmode="numeric"></div>
              </div>
            </div>
            
            <div class="form-section">
              <h2 class="form-section-title">Payment Method</h2>
              <div class="payment-methods">
                <label class="payment-option selected">
                  <input type="radio" name="payment" value="upi" checked>
                  <div>
                    <div class="payment-option-label">UPI</div>
                    <div style="font-size:0.75rem;color:var(--text-light)">Pay using any UPI app</div>
                  </div>
                  <div class="payment-icons">
                    <span class="payment-badge">UPI</span>
                  </div>
                </label>
                <label class="payment-option">
                  <input type="radio" name="payment" value="card">
                  <div>
                    <div class="payment-option-label">Credit / Debit Card</div>
                    <div style="font-size:0.75rem;color:var(--text-light)">All major cards accepted</div>
                  </div>
                  <div class="payment-icons">
                    <span class="payment-badge">VISA</span>
                    <span class="payment-badge">MC</span>
                  </div>
                </label>
                <label class="payment-option">
                  <input type="radio" name="payment" value="emi">
                  <div>
                    <div class="payment-option-label">EMI</div>
                    <div style="font-size:0.75rem;color:var(--text-light)">No cost EMI available on select cards</div>
                  </div>
                </label>
                <label class="payment-option">
                  <input type="radio" name="payment" value="cod">
                  <div>
                    <div class="payment-option-label">Cash on Delivery</div>
                    <div style="font-size:0.75rem;color:var(--text-light)">Pay when your order arrives</div>
                  </div>
                </label>
              </div>
            </div>
            
            <button class="btn btn-accent btn-lg btn-full" onclick="placeOrder()" style="font-size:1rem">
              Place Order — ${formatPrice(subtotal + shipping - discount)}
            </button>
          </div>
          
          <div class="cart-summary">
            <h2 class="summary-title">Order Summary</h2>
            ${Store.cart.map(item => `
              <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center">
                <img src="${item.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;background:var(--cream)" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100'">
                <div style="flex:1;min-width:0">
                  <div style="font-size:0.8rem;font-weight:500;color:var(--charcoal);line-height:1.3">${item.name}</div>
                  <div style="font-size:0.75rem;color:var(--text-light)">Qty: ${item.qty}</div>
                </div>
                <div style="font-size:0.875rem;font-weight:600">${formatPrice(item.price * item.qty)}</div>
              </div>
            `).join('')}
            <div style="height:1px;background:var(--tan);margin:16px 0"></div>
            <div class="cart-total-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
            <div class="cart-total-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            ${discount > 0 ? `<div class="cart-total-row" style="color:var(--green)"><span>Discount ${Store.coupon?.code ? `(${Store.coupon.code})` : ''}</span><span>- ${formatPrice(discount)}</span></div>` : ''}
            <div class="cart-total-row main"><span>Total</span><span>${formatPrice(subtotal + shipping - discount)}</span></div>
            <div style="font-size:0.75rem;color:var(--text-light);margin-top:8px">Inclusive of all taxes</div>
          </div>
        </div>
      </div>
    `;
    
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', function() {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
    
    window.placeOrder = function() {
      if (!validateCheckoutForm()) return;
      const btn = document.querySelector('.btn-accent.btn-lg');
      btn.textContent = 'Processing...';
      btn.disabled = true;
      setTimeout(() => {
        Store.clearCart();
        Store.clearCoupon();
        Router.navigate('/order-success');
      }, 2000);
    };
  },

  // ── Wishlist ────────────────────────────────────────────────────────────────
  wishlist() {
    const items = Store.wishlist;
    document.getElementById('main-content').innerHTML = `
      <div class="page-hero">
        <div class="container"><h1 class="fade-in">My Wishlist</h1></div>
      </div>
      <div class="container section">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a data-route="/" href="/">Home</a><span aria-hidden="true">/</span>
            <span aria-current="page">Wishlist</span>
          </nav>
          ${items.length ? '<button type="button" class="btn btn-outline btn-sm" onclick="shareWishlist()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share Wishlist</button>' : ''}
        </div>
        ${!items.length ? `
          <div class="wishlist-empty">
            <div class="wishlist-empty-icon">♡</div>
            <h2>Your wishlist is empty</h2>
            <p style="color:var(--text-light);margin-bottom:24px">Save items you love for later</p>
            <button class="btn btn-primary" data-route="/">Browse Collection</button>
          </div>
        ` : `
          <div class="products-grid">${items.map(p => renderProductCard(p)).join('')}</div>
        `}
      </div>
    `;
    initScrollReveal(document.getElementById('main-content'));
  },

  // ── Search ──────────────────────────────────────────────────────────────────
  search(query) {
    const results = query ? PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
      p.color.toLowerCase().includes(query.toLowerCase())
    ) : [];
    
    document.getElementById('main-content').innerHTML = `
      <div class="page-hero">
        <div class="container">
          <h1 class="fade-in">${query ? `Search: "${query}"` : 'Search'}</h1>
          <p>${results.length} products found</p>
        </div>
      </div>
      <div class="container section">
        ${results.length ? `<div class="products-grid">${results.map(p => renderProductCard(p)).join('')}</div>` : `
          <div class="wishlist-empty">
            <div class="wishlist-empty-icon">🔍</div>
            <h2>No results found</h2>
            <p style="color:var(--text-light);margin-bottom:24px">Try different keywords or browse our categories</p>
            <button class="btn btn-primary" data-route="/collection/all">Browse All</button>
          </div>
        `}
      </div>
    `;
    initScrollReveal(document.getElementById('main-content'));
  },

  // ── Order Success ────────────────────────────────────────────────────────────
  orderSuccess() {
    const orderId = 'UA' + Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('main-content').innerHTML = `
      <div class="container section">
        <div class="success-page fade-in">
          <div class="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for shopping with Urban Apex. Your order has been confirmed and will be delivered within 7-14 business days.</p>
          <div class="order-details">
            <div style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-light);margin-bottom:12px">Order Details</div>
            <div class="cart-total-row"><span>Order ID</span><strong>#${orderId}</strong></div>
            <div class="cart-total-row"><span>Status</span><span style="color:var(--green);font-weight:600">Confirmed</span></div>
            <div class="cart-total-row"><span>Estimated Delivery</span><span>${getDeliveryDate()}</span></div>
          </div>
          <button class="btn btn-primary btn-lg" data-route="/">Continue Shopping</button>
        </div>
      </div>
    `;
  },

  notFound() {
    document.getElementById('main-content').innerHTML = `
      <div style="text-align:center;padding:120px 20px">
        <div style="font-size:5rem;margin-bottom:16px">🛋️</div>
        <h1 style="font-family:'Cormorant Garamond',serif;font-size:3rem;margin-bottom:12px">Page Not Found</h1>
        <p style="color:var(--text-light);margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto">
          We couldn't find what you were looking for. Let's get you back on track.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary btn-lg" onclick="Router.navigate('/')">Go Home</button>
          <button class="btn btn-outline btn-lg" onclick="Router.navigate('/collection/all')">Browse Collection</button>
        </div>
      </div>
    `;
  }
};

// ─── Render Helpers ──────────────────────────────────────────────────────────

function renderHero() {
  const slides = [
    {
      img: 'https://i.postimg.cc/prYDB0cB/1-1.png', // Vanta Grand Sideboard
      badge: 'Storage Collection',
      title: 'Modern Storage<br>Redefined',
      sub: 'Sleek sideboards and cabinets for every room.',
      cta1: 'Shop Storage',
      cta1Link: '/collection/storage',
      cta2: 'View Sale',
      cta2Link: '/collection/all',
      sale: 'Upto<br>30%<br>OFF'
    },
    {
      img: 'https://i.postimg.cc/85C390rJ/1.png', // Flux Motion Coffee Table
      badge: 'Living Room',
      title: 'Coffee Tables<br>with Character',
      sub: 'Discover sculptural pieces that anchor your space.',
      cta1: 'Shop Living',
      cta1Link: '/collection/living',
      cta2: 'View All',
      cta2Link: '/collection/all',
      sale: 'From<br>₹12K'
    },
    {
      img: 'https://i.postimg.cc/htXPV2G5/2.png', // Mono Block Dining Table
      badge: 'Dining Collection',
      title: 'Every Meal<br>Deserves a Stage',
      sub: 'Dining tables that bring family and friends together.',
      cta1: 'Shop Dining',
      cta1Link: '/collection/dining',
      cta2: 'View Sale',
      cta2Link: '/collection/all',
      sale: 'Upto<br>40%<br>OFF'
    }
  ];

  return `
    <section id="hero">
      ${slides.map((s, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}">
          <img class="hero-bg" src="${s.img}" alt="" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400'">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <span class="hero-badge">${s.badge}</span>
            <h1 class="hero-title">${s.title}</h1>
            <p class="hero-subtitle">${s.sub}</p>
            <div class="hero-ctas">
              <a href="${s.cta1Link}" data-route="${s.cta1Link}" class="btn btn-primary btn-lg">${s.cta1}</a>
              <a href="${s.cta2Link}" data-route="${s.cta2Link}" class="btn btn-outline btn-lg" style="color:white;border-color:rgba(255,255,255,0.5)">${s.cta2}</a>
            </div>
          </div>
          <div class="hero-sale-badge">
            <div class="sale-percent" style="font-size:1.1rem;font-weight:700;text-align:center">${s.sale}</div>
          </div>
        </div>
      `).join('')}
      <button class="hero-nav hero-prev" onclick="heroNav(-1)">‹</button>
      <button class="hero-nav hero-next" onclick="heroNav(1)">›</button>
      <div class="hero-dots">
        ${slides.map((_, i) => `<div class="hero-dot ${i === 0 ? 'active' : ''}" onclick="heroGoTo(${i})"></div>`).join('')}
      </div>
    </section>
  `;
}

function initHeroSlider() {
  let current = 0;
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let autoPlay = setInterval(() => goTo((current + 1) % slides.length), 5000);
  
  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = i;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  
  window.heroNav = (dir) => { clearInterval(autoPlay); goTo((current + dir + slides.length) % slides.length); autoPlay = setInterval(() => goTo((current + 1) % slides.length), 5000); };
  window.heroGoTo = (i) => { clearInterval(autoPlay); goTo(i); autoPlay = setInterval(() => goTo((current + 1) % slides.length), 5000); };
}

function renderOffersStrip() {
  const offers = [
    { icon: '💳', text: '<strong>10% Instant Discount</strong> on HDFC Credit Card EMI' },
    { icon: '🎁', text: '<strong>Extra ₹1,000 Off</strong> on Orders Above ₹15,000 — Code: EXTRA1000' },
    { icon: '🚚', text: '<strong>Free Delivery</strong> on orders above ₹25,000' },
    { icon: '💳', text: '<strong>10% Instant Discount</strong> on IDFC FIRST Bank Credit Card EMI' },
    { icon: '🎁', text: '<strong>Extra ₹3,000 Off</strong> on Orders Above ₹30,000 — Code: EXTRA3000' },
    { icon: '🔄', text: '<strong>30-Day Easy Returns</strong> on all products' },
    { icon: '💳', text: '<strong>5% Savings</strong> on Reliance SBI Co-branded Cards' },
    { icon: '🎁', text: '<strong>Extra ₹5,000 Off</strong> on Orders Above ₹75,000 — Code: EXTRA5000' },
  ];
  const doubled = [...offers, ...offers];
  return `
    <div class="offers-strip">
      <div class="offers-track" id="offers-track">
        ${doubled.map(o => `<div class="offer-chip"><span class="offer-chip-icon">${o.icon}</span>${o.text}</div>`).join('')}
      </div>
    </div>
  `;
}

function initOffersScroll() { /* CSS animation handles it */ }

function renderCategories() {
  const cats = [
    { name: 'Accent Tables', icon: '🪑', link: '/collection/living?sub=Accent Tables' },
    { name: 'Coffee Tables', icon: '☕', link: '/collection/living?sub=Coffee Tables' },
    { name: 'Sideboards', icon: '🗄️', link: '/collection/storage?type=Sideboards & Buffets' },
    { name: 'Cabinets', icon: '📦', link: '/collection/storage?type=Cabinets' },
    { name: 'Display Cabinets', icon: '🪟', link: '/collection/storage?type=Display Cabinets' },
    { name: 'Dining Tables', icon: '🍽️', link: '/collection/dining?type=Dining Tables' }
  ];
  
  return `
    <section class="section">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-header-left">
            <div class="section-eyebrow">Everything for Your Home</div>
            <h2 class="section-title">Shop by Category</h2>
          </div>
          <a data-route="/collection/all" href="/collection/all" class="btn btn-outline btn-sm">View All</a>
        </div>
        <div class="categories-grid">
          ${cats.map(c => `
            <a href="${c.link}" data-route="${c.link}" class="category-card reveal">
              <div class="category-icon">${c.icon}</div>
              <div class="category-name">${c.name}</div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderDeals() {
  const deals = [
    { pct: 'Clearance Sale', sub: 'Limited Stock', label: 'Shop Now →', link: '/collection/all' },
    { pct: 'Upto 60%', sub: 'Mega Discounts', label: 'Shop Now →', link: '/collection/all' },
    { pct: 'Under ₹9,999', sub: 'Best Buys', label: 'Explore →', link: '/collection/all' },
    { pct: 'Free Delivery', sub: 'On ₹25K+', label: 'Shop Now →', link: '/collection/all' },
  ];
  
  return `
    <section class="section-sm" style="background:var(--cream)">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-header-left">
            <div class="section-eyebrow">Limited Time</div>
            <h2 class="section-title">Deal Zone</h2>
          </div>
        </div>
        <div class="deal-grid">
          ${deals.map(d => `
            <a href="${d.link}" data-route="${d.link}" class="deal-card reveal">
              <div class="deal-percent">${d.pct}</div>
              <div class="deal-label">${d.sub}</div>
              <div class="deal-cta">${d.label}</div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderProductsSection(title, products, id) {
  if (!products.length) return '';
  const subset = products.slice(0, 8);
  return `
    <section class="section" id="${id}">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-header-left">
            <div class="section-eyebrow">Curated for You</div>
            <h2 class="section-title">${title}</h2>
          </div>
          <a data-route="/collection/all" href="/collection/all" class="btn btn-outline btn-sm">View All</a>
        </div>
        <div class="products-grid">
          ${subset.map(p => renderProductCard(p)).join('')}
        </div>
      </div>
    </section>
  `;
}

// ========== UPDATED renderProductCard with error handling ==========
function renderProductCard(product) {
  // Defensive check: if product is missing critical fields, log error and return empty string
  if (!product || typeof product !== 'object') {
    console.error('renderProductCard called with invalid product:', product);
    return '';
  }
  if (!product.id || !product.slug || !product.name || !product.image) {
    console.error('Product missing required fields:', product);
    // Return a minimal placeholder so the grid doesn't break
    return `
      <div class="product-card reveal" style="opacity:0.5; pointer-events:none;">
        <div class="product-image-wrap">
          <div style="width:100%; height:100%; background:#eee; display:flex; align-items:center; justify-content:center;">
            <span style="color:#999;">Product data error</span>
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">${product.name || 'Unnamed'}</div>
        </div>
      </div>
    `;
  }

  try {
    const wishlisted = Store.isWishlisted(product.id);
    return `
      <div class="product-card reveal" onclick="Router.navigate('/product/${product.slug}')">
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy"
          style="filter:blur(6px);transition:filter 0.35s ease"
          onload="this.style.filter='none'"
          onerror="this.style.filter='none';this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'">
          ${product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase().replace(/\s+/g, '')}">${product.badge}</span>` : ''}
          <span class="product-discount-tag">-${product.discount}%</span>
          <button class="product-wishlist ${wishlisted ? 'active' : ''}" onclick="event.stopPropagation(); handleWishlistToggle(${product.id}, this)" title="Add to Wishlist">
            ${wishlisted ? '♥' : '♡'}
          </button>
          <div class="product-card-actions">
            <div class="product-quick-add" onclick="event.stopPropagation(); quickAddToCart(${product.id})" role="button" tabindex="0" aria-label="Quick add to cart">
              + Quick Add
            </div>
            <button class="product-quick-view-btn" type="button" onclick="event.stopPropagation(); openQuickView(${product.id})" aria-label="Quick view">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-category">${product.subcategory || ''}</div>
          <div class="product-name">${product.name}</div>
          ${product.stock !== undefined && product.stock <= 5 ? '<div class="product-stock-low">Only ' + product.stock + ' left!</div>' : ''}
          <div class="product-rating">
            ${renderStars(product.rating || 0)}
            <span class="rating-count">(${(product.reviews || 0).toLocaleString()})</span>
          </div>
          <div class="product-price">
            <span class="price-current">${formatPrice(product.price || 0)}</span>
            <span class="price-original">${formatPrice(product.originalPrice || 0)}</span>
            <span class="price-savings">Save ${formatPrice((product.originalPrice || 0) - (product.price || 0))}</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering product card for:', product, error);
    return ''; // skip this product entirely
  }
}

function renderFeaturedBanner() {
  return `
    <section class="section-sm">
      <div class="container">
        <div class="banner-split reveal">
          <div class="banner-half" onclick="Router.navigate('/collection/storage')">
            <img src="https://i.postimg.cc/prYDB0cB/1-1.png" alt="Vanta Grand Sideboard" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'">
            <div class="banner-half-overlay">
              <div class="banner-half-title">Storage Collection</div>
              <div class="banner-half-cta">Shop Now →</div>
            </div>
          </div>
          <div class="banner-half" onclick="Router.navigate('/collection/dining')">
            <img src="https://i.postimg.cc/htXPV2G5/2.png" alt="Mono Block Dining Table" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'">
            <div class="banner-half-overlay">
              <div class="banner-half-title">Dining Essentials</div>
              <div class="banner-half-cta">Shop Now →</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBannerSplit() {
  return `
    <section class="section-sm" style="background:var(--cream)">
      <div class="container">
        <div class="banner-split reveal">
          <div class="banner-half" onclick="Router.navigate('/collection/living')">
            <img src="https://i.postimg.cc/fTgxfgws/1.png" alt="Axis Bridge Coffee Table" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'">
            <div class="banner-half-overlay">
              <div class="banner-half-title">Living Room</div>
              <div class="banner-half-cta">Explore →</div>
            </div>
          </div>
          <div class="banner-half" onclick="Router.navigate('/collection/storage')">
            <img src="https://i.postimg.cc/sg1TVr07/1-7.png" alt="Nero Linear Buffet" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'">
            <div class="banner-half-overlay">
              <div class="banner-half-title">Storage Solutions</div>
              <div class="banner-half-cta">Explore →</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBannerFull(img, title, sub, link) {
  return `
    <section class="section-sm">
      <div class="container">
        <div class="banner-full reveal" onclick="Router.navigate('${link}')">
          <img src="${img}" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400'">
          <div class="banner-full-overlay">
            <div class="banner-content-inner">
              <div class="banner-label">Featured Collection</div>
              <div class="banner-title">${title}</div>
              <div class="banner-label">${sub}</div>
              <div style="margin-top:20px"><span class="btn btn-primary">Explore Now</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderTrustmarks() {
  const marks = [
    { icon: '🚚', title: 'Free Delivery', text: 'On orders above ₹25,000' },
    { icon: '🛡️', title: 'Genuine Quality', text: 'Verified materials & craftsmanship' },
    { icon: '🔄', title: '30-Day Returns', text: 'Hassle-free return policy' },
    { icon: '📞', title: '24/7 Support', text: 'Expert guidance always available' },
  ];
  return `
    <div class="trustmarks">
      <div class="container">
        <div class="trustmarks-inner">
          ${marks.map(m => `
            <div class="trustmark">
              <div class="trustmark-icon">${m.icon}</div>
              <div class="trustmark-title">${m.title}</div>
              <div class="trustmark-text">${m.text}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderRecentlyViewed() {
  let ids = [];
  try { ids = JSON.parse(localStorage.getItem('ua_recently_viewed') || '[]'); } catch {}
  const products = ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean).slice(0, 6);
  if (!products.length) return '';
  return `
    <div class="recently-viewed-section section">
      <div class="container">
        <div class="section-header">
          <div class="section-header-left">
            <div class="section-eyebrow">Continue Browsing</div>
            <h2 class="section-title">Recently Viewed</h2>
          </div>
        </div>
        <div class="products-grid">
          ${products.map(p => renderProductCard(p)).join('')}
        </div>
      </div>
    </div>`;
}

function renderPopularSearches() {
  const tags = ['Accent Tables', 'Coffee Tables', 'Sideboard', 'Cabinet', 'Display Cabinet', 'Dining Table'];
  return `
    <div class="popular-cats">
      <div class="container">
        <div class="popular-cats-inner">
          <span class="pop-cat-label">Popular</span>
          ${tags.map(t => `<a href="/search?q=${encodeURIComponent(t)}" data-route="/search?q=${encodeURIComponent(t)}" class="pop-cat-tag">${t}</a>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderFilters(urlMin = null, urlMax = null) {
  return `
    <h3 class="filter-title">Filters</h3>
    <div class="filter-group">
      <div class="filter-group-title">Category</div>
      ${CATEGORIES.map(c => `
        <label class="filter-option">
          <input type="checkbox" onchange="applyFilters()"> ${c.name}
        </label>
      `).join('')}
    </div>
    <div class="filter-group">
      <div class="filter-group-title">Price Range</div>
      <div class="price-range">
        <input type="number" placeholder="Min" id="price-min" min="0" onchange="applyFilters()">
        <span style="color:var(--text-light)">—</span>
        <input type="number" placeholder="Max" id="price-max" min="0" onchange="applyFilters()">
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-group-title">Discount</div>
      ${['30% or more', '40% or more', '50% or more'].map(d => `
        <label class="filter-option"><input type="checkbox" onchange="applyFilters()"> ${d}</label>
      `).join('')}
    </div>
    <div class="filter-group">
      <div class="filter-group-title">Rating</div>
      ${['4★ & above', '4.5★ & above'].map(r => `
        <label class="filter-option"><input type="checkbox" onchange="applyFilters()"> ${r}</label>
      `).join('')}
    </div>
    <div class="filter-group">
      <div class="filter-group-title">Material</div>
      ${['Solid Wood', 'Engineered Wood', 'Metal', 'Glass', 'Marble'].map(m => `
        <label class="filter-option"><input type="checkbox" onchange="applyFilters()"> ${m}</label>
      `).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-primary btn-sm btn-full" onclick="applyFilters()">Apply</button>
      <button class="btn btn-outline btn-sm" onclick="clearFilters()">Clear</button>
    </div>
  `;
}

function renderCartPage() {
  const items = Store.cart;
  if (!items.length) return `
    <div style="grid-column:1/-1">
      <div class="cart-empty" style="height:400px">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet</p>
        <button class="btn btn-primary" data-route="/">Start Shopping</button>
      </div>
    </div>
  `;
  
  const subtotal = Store.getCartTotal();
  const shipping = subtotal > 25000 ? 0 : 499;
  
  return `
    <div class="cart-page-items">
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.6rem;margin-bottom:20px">Cart (${Store.getCartCount()} items)</h2>
      ${items.map(item => `
        <div class="cart-page-item">
          <img class="cart-page-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'">
          <div style="flex:1;min-width:0">
            <div style="font-size:1rem;font-weight:500;margin-bottom:4px;color:var(--charcoal)">${item.name}</div>
            <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:12px">${item.color} · ${item.material}</div>
            <div style="font-size:0.8rem;color:var(--green);margin-bottom:12px">In stock · Delivery in 7-14 days</div>
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <div class="cart-item-qty">
                <button class="cart-qty-btn" type="button" onclick="Store.updateQty(${item.id}, ${item.qty - 1})">−</button>
                <span class="cart-qty-num" style="padding:0 12px">${item.qty}</span>
                <button class="cart-qty-btn" type="button" onclick="Store.updateQty(${item.id}, ${item.qty + 1})">+</button>
              </div>
              <button class="cart-item-remove" onclick="Store.removeFromCart(${item.id})">🗑 Remove</button>
              <button class="cart-item-remove" onclick="moveToWishlist(${item.id})">♡ Move to Wishlist</button>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:1.2rem;font-weight:600">${formatPrice(item.price * item.qty)}</div>
            <div style="font-size:0.8rem;color:var(--text-light);text-decoration:line-through">${formatPrice(item.originalPrice * item.qty)}</div>
            <div style="font-size:0.78rem;color:var(--green)">${item.discount}% off</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="cart-summary">
      <h2 class="summary-title">Order Summary</h2>
      <div class="cart-coupon">
        <input id="cart-coupon-input" class="form-input" placeholder="Enter coupon code" style="border:1.5px solid var(--tan)">
        <button class="btn btn-outline btn-sm" onclick="applyCartCoupon()">Apply</button>
      </div>
      <div id="cart-coupon-msg" class="cart-coupon-msg"></div>
      <div class="cart-totals">
        <div class="cart-total-row"><span>Subtotal (${Store.getCartCount()} items)</span><span>${formatPrice(subtotal)}</span></div>
        <div class="cart-total-row"><span>Discount</span><span style="color:var(--green)">-${formatPrice(subtotal - items.reduce((s,i) => s + (i.originalPrice * i.qty), 0) * -1 + subtotal - subtotal)}</span></div>
        <div class="cart-total-row" id="cp-discount-row" style="display:none;color:var(--green)"><span>Coupon Discount</span><span id="cp-discount-val"></span></div>
        <div class="cart-total-row"><span>Delivery</span><span>${shipping === 0 ? '<span style="color:var(--green)">FREE</span>' : formatPrice(shipping)}</span></div>
        <div class="cart-total-row main"><span>Total Amount</span><span>${formatPrice(subtotal + shipping)}</span></div>
      </div>
      <div style="background:var(--cream);border-radius:8px;padding:12px;font-size:0.8rem;color:var(--green);margin-bottom:16px">
        🎉 You save ${formatPrice(items.reduce((s,i) => s + ((i.originalPrice - i.price) * i.qty), 0))} on this order!
      </div>
      <a href="/checkout" data-route="/checkout" class="btn btn-accent btn-lg btn-full">Proceed to Checkout</a>
      <a href="/" data-route="/" class="btn btn-ghost btn-full" style="margin-top:8px;text-align:center">Continue Shopping</a>
    </div>
  `;
}

function renderReviews(product) {
  const reviews = [
    { name: 'Priya S.', rating: 5, date: '2 weeks ago', text: 'Absolutely love this piece! The quality is exceptional and it arrived well-packaged. The color is exactly as shown. Assembly was straightforward and the delivery team was professional.', verified: true },
    { name: 'Rahul M.', rating: 4, date: '1 month ago', text: 'Great product overall. Very sturdy and looks beautiful in my living room. Only minor gripe is the assembly instructions could be clearer. But the end result is stunning.', verified: true },
    { name: 'Anjali K.', rating: 5, date: '3 weeks ago', text: "I've been eyeing this for months and finally made the purchase. Zero regrets! The material quality is top-notch and it fits perfectly in my space.", verified: false },
  ];
  
  return `
    <div style="max-width:720px">
      <div style="display:flex;align-items:center;gap:24px;margin-bottom:32px;padding:24px;background:var(--cream);border-radius:var(--radius-lg)">
        <div style="text-align:center">
          <div style="font-size:3.5rem;font-weight:700;font-family:'Cormorant Garamond',serif">${product.rating}</div>
          <div style="display:flex;gap:2px;justify-content:center;margin-bottom:4px">${renderStars(product.rating)}</div>
          <div style="font-size:0.8rem;color:var(--text-light)">${product.reviews.toLocaleString()} reviews</div>
        </div>
        <div style="flex:1">
          ${[5,4,3,2,1].map(n => {
            const pct = n === 5 ? 68 : n === 4 ? 22 : n === 3 ? 7 : n === 2 ? 2 : 1;
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span style="font-size:0.75rem;width:16px">${n}★</span>
              <div style="flex:1;height:6px;background:var(--tan);border-radius:3px;overflow:hidden">
                <div style="width:${pct}%;height:100%;background:var(--gold);border-radius:3px"></div>
              </div>
              <span style="font-size:0.75rem;color:var(--text-light);width:28px">${pct}%</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      ${reviews.map(r => `
        <div style="padding:20px 0;border-bottom:1px solid var(--tan)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <div>
              <span style="font-weight:600;font-size:0.9rem">${r.name}</span>
              ${r.verified ? '<span style="background:#E8F5E9;color:var(--green);font-size:0.65rem;padding:2px 8px;border-radius:4px;margin-left:8px">✓ Verified Purchase</span>' : ''}
            </div>
            <span style="font-size:0.75rem;color:var(--text-light)">${r.date}</span>
          </div>
          <div style="display:flex;gap:2px;margin-bottom:8px">${renderStars(r.rating)}</div>
          <p style="font-size:0.875rem;color:var(--text);line-height:1.6">${r.text}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Quick View Modal ────────────────────────────────────────────────────────
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  let modal = document.getElementById('quick-view-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quick-view-modal';
    modal.className = 'quick-view-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Product Quick View');
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeQuickView(); });
  }

  modal.innerHTML = `
    <div class="quick-view-modal">
      <button class="quick-view-close" onclick="closeQuickView()" aria-label="Close quick view">×</button>
      <div class="quick-view-layout">
        <div class="quick-view-image">
          <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'">
          ${product.badge ? '<span class="product-badge badge-' + product.badge.toLowerCase().replace(' ','') + ' quick-view-badge">★ ' + product.badge + '</span>' : ''}
        </div>
        <div class="quick-view-info">
          <p class="product-category">${product.subcategory}</p>
          <h2 class="quick-view-title">${product.name}</h2>
          <div class="product-detail-rating" style="margin-bottom:12px">
            <div style="display:flex;gap:2px">${renderStars(product.rating)}</div>
            <span style="font-size:0.8rem;color:var(--text-light)">${product.rating} (${product.reviews.toLocaleString()})</span>
          </div>
          <div class="quick-view-price">
            <span class="detail-price-main">${formatPrice(product.price)}</span>
            <span class="detail-price-original" style="margin-left:10px">${formatPrice(product.originalPrice)}</span>
            <span class="detail-savings" style="margin-left:10px">${product.discount}% off</span>
          </div>
          <p style="font-size:0.875rem;color:var(--text-light);line-height:1.6;margin:16px 0">${product.description.slice(0,180)}…</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" style="flex:1" onclick="Store.addToCart(window.PRODUCTS.find(p=>p.id==${product.id}), 1); closeQuickView(); openCart();">Add to Cart</button>
            <button class="btn btn-outline" onclick="closeQuickView(); Router.navigate('/product/${product.slug}')">Full Details</button>
          </div>
          <div class="trust-badges" style="margin-top:16px">
            <div class="trust-badge"><span class="trust-badge-icon">🚚</span> Free above ₹25,000</div>
            <div class="trust-badge"><span class="trust-badge-icon">🔄</span> 30-Day Returns</div>
          </div>
        </div>
      </div>
    </div>
  `;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Focus close button for a11y
  setTimeout(() => modal.querySelector('.quick-view-close')?.focus(), 50);
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;

// ─── Event Handlers ──────────────────────────────────────────────────────────

function handleWishlistToggle(productId, btn) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const added = Store.toggleWishlist(product);
  btn.classList.toggle('active', added);
  btn.textContent = added ? '♥' : '♡';
  showToast(added ? 'Saved to wishlist' : 'Removed from wishlist', added ? 'success' : 'default');
}

function quickAddToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  Store.addToCart(product, 1);
  openCart();
}

function handleSort(value) {
  let products = [...(window._currentProducts || PRODUCTS)];
  if (value === 'price-asc')  products.sort((a, b) => a.price - b.price);
  else if (value === 'price-desc') products.sort((a, b) => b.price - a.price);
  else if (value === 'rating')     products.sort((a, b) => b.rating - a.rating);
  else if (value === 'discount')   products.sort((a, b) => b.discount - a.discount);
  else if (value === 'newest')     products = products.filter(p => p.badge === 'New').concat(products.filter(p => p.badge !== 'New'));

  // Persist to URL
  const qs = new URLSearchParams(window.location.search);
  if (value === 'default') qs.delete('sort'); else qs.set('sort', value);
  history.replaceState(null, '', window.location.pathname + (qs.toString() ? '?' + qs.toString() : ''));
  window._currentSort = value;

  document.getElementById('products-grid').innerHTML = products.map(p => renderProductCard(p)).join('');
  const rc = document.querySelector('.results-count');
  if (rc) rc.textContent = products.length + ' products';
  initScrollReveal(document.getElementById('products-grid'));
}

function applyFilters() {
  let products = [...(window._currentProducts || PRODUCTS)];
  const minPrice = parseFloat(document.getElementById('price-min')?.value || 0);
  const maxPrice = parseFloat(document.getElementById('price-max')?.value || 0);
  if (minPrice) products = products.filter(p => p.price >= minPrice);
  if (maxPrice) products = products.filter(p => p.price <= maxPrice);

  // Re-apply current sort
  const sort = window._currentSort || 'default';
  if (sort === 'price-asc')  products.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') products.sort((a,b) => b.price - a.price);
  else if (sort === 'rating')     products.sort((a,b) => b.rating - a.rating);
  else if (sort === 'discount')   products.sort((a,b) => b.discount - a.discount);

  // Persist to URL
  const qs = new URLSearchParams(window.location.search);
  if (minPrice) qs.set('min', minPrice); else qs.delete('min');
  if (maxPrice) qs.set('max', maxPrice); else qs.delete('max');
  history.replaceState(null, '', window.location.pathname + (qs.toString() ? '?' + qs.toString() : ''));

  const grid = document.getElementById('products-grid');
  if (grid) grid.innerHTML = products.length
    ? products.map(p => renderProductCard(p)).join('')
    : '<div class="empty-state"><div class="empty-icon">🔍</div><h3>No products found</h3><p>Try adjusting your filters</p><button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button></div>';
  const rc = document.querySelector('.results-count');
  if (rc) rc.textContent = products.length + ' products';
  if (grid) initScrollReveal(grid);

  // Update active filter count badge on the mobile filter button
  const activeCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);
  const filterBtn = document.querySelector('.mobile-filter-btn');
  if (filterBtn) {
    const badge = filterBtn.querySelector('.filter-count-badge');
    if (activeCount > 0) {
      if (!badge) {
        const b = document.createElement('span');
        b.className = 'filter-count-badge';
        b.textContent = activeCount;
        filterBtn.appendChild(b);
      } else {
        badge.textContent = activeCount;
      }
    } else if (badge) {
      badge.remove();
    }
  }
}

function clearFilters() {
  document.querySelectorAll('.filter-option input').forEach(cb => cb.checked = false);
  const pMin = document.getElementById('price-min');
  const pMax = document.getElementById('price-max');
  if (pMin) pMin.value = '';
  if (pMax) pMax.value = '';
  window._currentSort = 'default';

  // Clear URL params
  const qs = new URLSearchParams(window.location.search);
  qs.delete('min'); qs.delete('max'); qs.delete('sort');
  history.replaceState(null, '', window.location.pathname + (qs.toString() ? '?' + qs.toString() : ''));

  // Re-render all products
  const products = [...(window._currentProducts || PRODUCTS)];
  const grid = document.getElementById('products-grid');
  if (grid) grid.innerHTML = products.map(p => renderProductCard(p)).join('');
  const rc = document.querySelector('.results-count');
  if (rc) rc.textContent = products.length + ' products';
  if (grid) initScrollReveal(grid);

  // Reset sort dropdown
  const sortSelect = document.querySelector('.sort-select');
  if (sortSelect) sortSelect.value = 'default';

  // Remove filter count badge
  document.querySelector('.filter-count-badge')?.remove();
}

function applyCartCoupon() {
  const code = document.getElementById('cart-coupon-input').value;
  const result = Store.applyCoupon(code, Store.getCartTotal());
  const msg = document.getElementById('cart-coupon-msg');
  msg.textContent = result.message;
  msg.className = 'cart-coupon-msg ' + (result.valid ? 'success' : 'error');
  if (result.valid) {
    Store.setCoupon(code, result.discount);
    document.getElementById('cp-discount-row').style.display = 'flex';
    document.getElementById('cp-discount-val').textContent = '- ' + formatPrice(result.discount);
  }
}

function attachCartPageListeners() {
  window.moveToWishlist = function(productId) {
    const item = Store.cart.find(i => i.id === productId);
    if (!item) return;
    Store.toggleWishlist(item);
    Store.removeFromCart(productId);
    showToast('Moved to wishlist', 'success');
  };
  window.applyCartCoupon = applyCartCoupon;
}

// ─── NEW: Filter drawer functions ────────────────────────────────────────────
function toggleFilters() {
  const overlay = document.getElementById('filter-overlay');
  const drawer  = document.getElementById('filter-drawer');
  if (!overlay || !drawer) return;
  const isOpen = overlay.classList.contains('open');
  overlay.classList.toggle('open', !isOpen);
  drawer.classList.toggle('open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

function applyMobileFilters() {
  // Sync drawer inputs back to sidebar before applying
  syncDrawerToSidebar();
  applyFilters();
  toggleFilters();
}

function clearMobileFilters() {
  clearFilters();
  // Re-populate drawer to reflect cleared state
  initMobileFilters();
  toggleFilters();
}

/**
 * Clone the rendered sidebar filter HTML into the mobile drawer.
 * Called every time the collection page renders new filter HTML.
 */
function initMobileFilters() {
  const sidebar = document.querySelector('.filters-sidebar');
  const drawerContent = document.getElementById('filter-drawer-content');
  if (!sidebar || !drawerContent) return;

  // Deep-clone so the sidebar remains independent
  drawerContent.innerHTML = sidebar.innerHTML;

  // Prefix all input IDs / name attrs in the drawer to avoid DOM ID collisions
  drawerContent.querySelectorAll('[id]').forEach(el => {
    el.id = 'drawer-' + el.id;
  });
}

/**
 * Before applying filters from the mobile drawer, copy checkbox / input
 * values back to the original sidebar inputs so applyFilters() reads them.
 */
function syncDrawerToSidebar() {
  const sidebar = document.querySelector('.filters-sidebar');
  const drawer  = document.getElementById('filter-drawer-content');
  if (!sidebar || !drawer) return;

  // Price inputs
  const drawerMin = drawer.querySelector('[id$="price-min"]');
  const drawerMax = drawer.querySelector('[id$="price-max"]');
  const sideMin   = sidebar.querySelector('#price-min');
  const sideMax   = sidebar.querySelector('#price-max');
  if (drawerMin && sideMin) sideMin.value = drawerMin.value;
  if (drawerMax && sideMax) sideMax.value = drawerMax.value;

  // Checkboxes — match by name + value
  drawer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const match = sidebar.querySelector(`input[type="checkbox"][name="${cb.name}"][value="${cb.value}"]`);
    if (match) match.checked = cb.checked;
  });
}

// Expose for inline onclick attributes (set again after definition to be safe)
window.toggleFilters      = toggleFilters;
window.applyMobileFilters = applyMobileFilters;
window.clearMobileFilters = clearMobileFilters;

// ─── Dark Mode Toggle ────────────────────────────────────────────────────────
window.toggleDarkMode = function() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('ua_theme', next); } catch {}
  const btn = document.getElementById('dark-mode-btn');
  if (btn) {
    btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  // Persist theme toggle icon state is handled purely by CSS [data-theme="dark"] selectors
};

// ─── Wishlist Share ──────────────────────────────────────────────────────────
window.shareWishlist = function() {
  const items = Store.wishlist;
  if (!items.length) { showToast('Your wishlist is empty', 'error'); return; }
  const ids = items.map(p => p.id).join(',');
  const url = window.location.origin + '/wishlist?share=' + ids;
  if (navigator.share) {
    navigator.share({ title: 'My Urban Apex Wishlist', url })
      .catch(() => copyToClipboard(url));
  } else {
    copyToClipboard(url);
  }
};

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('Link copied to clipboard!', 'success'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('Link copied to clipboard!', 'success');
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function getColorHex(colorName) {
  const map = { 
    'Grey': '#9E9E9E', 
    'Blue': '#1565C0', 
    'Black': '#212121', 
    'Granite Weave': '#757575', 
    'Walnut': '#8B6914', 
    'White': '#F5F5F5', 
    'Cream': '#FFF8DC', 
    'Marble White': '#F0EDE8', 
    'Fantasy Grey Marble': '#9E9E9E', 
    'Natural Oak': '#D4A853', 
    'Matte Black': '#333', 
    'Terracotta': '#C1440E', 
    'Brass': '#B8860B', 
    'Classic Walnut': '#8B6914', 
    'Dark Chestnut': '#5D3419',
    'Natural Wood': '#A0522D',
    'Dark Walnut': '#5D3A1A',
    'Honey Oak': '#C19A6B',
    'Charcoal Grey': '#36454F',
    'Ebony': '#555D50',
    'Oak': '#D2B48C',
    'Light Oak': '#C19A6B',
    'Warm Grey': '#808080',
    'White Gloss': '#F8F8FF',
    'Clear Glass / Oak': '#F0E68C',
    'Light Grey': '#D3D3D3'
  };
  return map[colorName] || '#8B6F54';
}

function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 10);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Deterministic delivery date per product id — avoids a different date
 * showing on each re-render (e.g. after cart quantity updates).
 * Falls back to +7 days if no id is provided.
 */
function getCartDeliveryDate(productId = 0) {
  const d = new Date();
  // Use product id modulo to get 7–9 day range, deterministically
  d.setDate(d.getDate() + 7 + (productId % 3));
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Save For Later ───────────────────────────────────────────────────────────
const SaveForLater = {
  _key: 'ua_saved_for_later',
  get items() {
    try { return JSON.parse(localStorage.getItem(this._key) || '[]'); } catch { return []; }
  },
  save(items) {
    try { localStorage.setItem(this._key, JSON.stringify(items)); } catch {}
  },
  add(product) {
    const items = this.items.filter(i => i.id !== product.id);
    items.unshift(product);
    this.save(items);
  },
  remove(id) {
    this.save(this.items.filter(i => i.id !== id));
  },
  has(id) { return this.items.some(i => i.id === id); }
};
window.SaveForLater = SaveForLater;

window.saveForLater = function(productId) {
  const item = Store.cart.find(i => i.id === productId);
  if (!item) return;
  SaveForLater.add(item);
  Store.removeFromCart(productId);
  showToast('Saved for later', 'success');
};

window.moveToCartFromSaved = function(productId) {
  const item = SaveForLater.items.find(i => i.id === productId);
  if (!item) return;
  Store.addToCart(item, 1);
  SaveForLater.remove(productId);
  showToast('Moved to cart', 'success');
};

window.removeSavedItem = function(productId) {
  SaveForLater.remove(productId);
  // Re-render saved section
  renderSavedForLater();
};

function renderSavedForLater() {
  const items = SaveForLater.items;
  const container = document.getElementById('saved-for-later-section');
  if (!container) return;
  if (!items.length) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  container.innerHTML = `
    <h3 class="saved-later-title">Saved for Later (${items.length})</h3>
    ${items.map(item => `
      <div class="cart-page-item saved-item">
        <img class="cart-page-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'">
        <div style="flex:1;min-width:0">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-color">${item.color}</div>
          <div style="font-size:0.95rem;font-weight:600;margin:8px 0">${formatPrice(item.price)}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-outline btn-sm" onclick="moveToCartFromSaved(${item.id})">Move to Cart</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="removeSavedItem(${item.id})" style="color:var(--accent)">Remove</button>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initApp);
