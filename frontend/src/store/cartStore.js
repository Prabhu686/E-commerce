import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('nexaCart') || '[]'),
  isOpen: false,

  save: (items) => {
    localStorage.setItem('nexaCart', JSON.stringify(items));
    set({ items });
  },

  addItem: (product, qty = 1) => {
    const items = get().items;
    const existing = items.find(i => i._id === product._id);
    const updated = existing
      ? items.map(i => i._id === product._id ? { ...i, qty: i.qty + qty } : i)
      : [...items, { ...product, qty }];
    get().save(updated);
  },

  removeItem: (id) => {
    get().save(get().items.filter(i => i._id !== id));
  },

  updateQty: (id, qty) => {
    if (qty < 1) return get().removeItem(id);
    get().save(get().items.map(i => i._id === id ? { ...i, qty } : i));
  },

  clearCart: () => get().save([]),

  toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

  get total() {
    return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  get count() {
    return get().items.reduce((sum, i) => sum + i.qty, 0);
  },
}));

export default useCartStore;



