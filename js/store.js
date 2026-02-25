// Urban Apex — Store (State Management)
// Improvements: off() for listener removal, safe localStorage helpers,
// getItem(), max-qty enforcement, coupon guard, and clearListeners().

/** Safe localStorage read — returns parsed value or fallback on any error */
function _lsGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
}

/** Safe localStorage write — silently swallows QuotaExceededError etc. */
function _lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const Store = {
  cart:     _lsGet('ua_cart',     []),
  wishlist: _lsGet('ua_wishlist', []),
  user:     _lsGet('ua_user',     null),
  coupon:   _lsGet('ua_coupon',   null), // { code, discount } or null

  /** Maximum quantity per cart line-item */
  MAX_QTY: 99,

  listeners: {},

  /** Subscribe to an event. Returns an unsubscribe function. */
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
    return () => this.off(event, cb); // unsubscribe handle
  },

  /** Unsubscribe a specific callback from an event. */
  off(event, cb) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(fn => fn !== cb);
  },

  /** Remove ALL listeners for every event (useful on SPA navigation teardown). */
  clearListeners() {
    this.listeners = {};
  },

  emit(event, data) {
    (this.listeners[event] || []).slice().forEach(cb => {
      try { cb(data); } catch (err) { console.error('Store listener error:', err); }
    });
  },

  // ── Cart ───────────────────────────────────────────────────────────────────

  addToCart(product, qty = 1) {
    if (!product || !product.id) return;
    qty = Math.max(1, Math.min(qty, this.MAX_QTY));
    const existing = this.cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, this.MAX_QTY);
    } else {
      this.cart.push({ ...product, qty });
    }
    this._saveCart();
    this.emit('cart:update', this.cart);
    this.emit('cart:add', product);
  },

  removeFromCart(productId) {
    this.cart = this.cart.filter(i => i.id !== productId);
    this._saveCart();
    this.emit('cart:update', this.cart);
  },

  updateQty(productId, qty) {
    const item = this.cart.find(i => i.id === productId);
    if (!item) return;
    if (qty <= 0) { this.removeFromCart(productId); return; }
    item.qty = Math.min(qty, this.MAX_QTY);
    this._saveCart();
    this.emit('cart:update', this.cart);
  },

  clearCart() {
    this.cart = [];
    this._saveCart();
    this.emit('cart:update', this.cart);
  },

  // ── Coupon ─────────────────────────────────────────────────────────────────

  /** Persist a validated coupon. */
  setCoupon(code, discount) {
    this.coupon = { code: code.trim().toUpperCase(), discount };
    _lsSet('ua_coupon', this.coupon);
    this.emit('coupon:update', this.coupon);
  },

  /** Remove the active coupon. */
  clearCoupon() {
    this.coupon = null;
    _lsSet('ua_coupon', null);
    this.emit('coupon:update', null);
  },

  /** Return the active discount amount (0 if none). */
  getDiscount() {
    return this.coupon?.discount ?? 0;
  },

  /** Get a single cart line-item by product id, or null. */
  getItem(productId) {
    return this.cart.find(i => i.id === productId) ?? null;
  },

  getCartTotal() {
    return this.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  },

  getCartCount() {
    return this.cart.reduce((sum, i) => sum + i.qty, 0);
  },

  _saveCart() {
    _lsSet('ua_cart', this.cart);
  },

  // ── Wishlist ───────────────────────────────────────────────────────────────

  toggleWishlist(product) {
    if (!product || !product.id) return false;
    const idx = this.wishlist.findIndex(i => i.id === product.id);
    if (idx >= 0) {
      this.wishlist.splice(idx, 1);
    } else {
      this.wishlist.push(product);
    }
    _lsSet('ua_wishlist', this.wishlist);
    this.emit('wishlist:update', this.wishlist);
    return idx < 0; // true = added
  },

  isWishlisted(productId) {
    return this.wishlist.some(i => i.id === productId);
  },

  // ── Coupon ─────────────────────────────────────────────────────────────────

  /**
   * Validate and calculate a coupon discount.
   * Guards against OFFERS not being defined yet (script load-order safety).
   */
  applyCoupon(code, cartTotal) {
    if (typeof OFFERS === 'undefined' || !Array.isArray(OFFERS)) {
      return { valid: false, message: 'Coupon service unavailable' };
    }
    if (!code || !code.trim()) {
      return { valid: false, message: 'Please enter a coupon code' };
    }
    const offer = OFFERS.find(o => o.code === code.trim().toUpperCase());
    if (!offer) return { valid: false, message: 'Invalid coupon code' };
    if (cartTotal < offer.minOrder) {
      return {
        valid: false,
        message: 'Minimum order \u20b9' + offer.minOrder.toLocaleString() + ' required'
      };
    }
    if (offer.discountPercent) {
      const discount = Math.round(cartTotal * offer.discountPercent / 100);
      return {
        valid: true,
        discount,
        message: offer.discountPercent + '% off applied! You save \u20b9' + discount.toLocaleString()
      };
    }
    return {
      valid: true,
      discount: offer.discount,
      message: '\u20b9' + offer.discount.toLocaleString() + ' off applied!'
    };
  },
};

// ── Utilities ────────────────────────────────────────────────────────────────

/** Format a number as Indian Rupee currency string */
function formatPrice(n) {
  if (typeof n !== 'number' || isNaN(n)) return '\u20b90';
  return '\u20b9' + Math.round(n).toLocaleString('en-IN');
}

/**
 * Render 5-star rating HTML.
 * Uses filled/half/empty spans styled via CSS.
 */
function renderStars(rating) {
  const clamped = Math.max(0, Math.min(5, rating));
  const full    = Math.floor(clamped);
  const half    = clamped % 1 >= 0.5;
  let stars     = '';
  for (let i = 0; i < full; i++)
    stars += '<span class="star filled" aria-hidden="true">\u2605</span>';
  if (half)
    stars += '<span class="star half" aria-hidden="true">\u2605</span>';
  for (let i = full + (half ? 1 : 0); i < 5; i++)
    stars += '<span class="star" aria-hidden="true">\u2605</span>';
  return stars;
}
