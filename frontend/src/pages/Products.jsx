import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATS = ['all', 'electronics', 'fashion', 'sports', 'home', 'beauty', 'books'];
const MOODS = ['all', 'energetic', 'chill', 'luxurious', 'adventurous', 'creative', 'romantic'];
const SORTS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
];
const CAT_ICONS = {
  all:         <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16"/></svg>,
  electronics: <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={1.8}/><path d="M8 21h8M12 17v4" strokeWidth={1.8}/></svg>,
  fashion:     <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>,
  sports:      <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={1.8}/><path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" strokeWidth={1.8}/></svg>,
  home:        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" strokeWidth={1.8}/></svg>,
  beauty:      <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  books:       <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
};

function SideSection({ title, children }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#111113' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#475569' }}>{title}</p>
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [category, setCategory]     = useState(searchParams.get('category') || 'all');
  const [mood, setMood]             = useState(searchParams.get('mood') || 'all');
  const [sort, setSort]             = useState(searchParams.get('sort') || 'newest');
  const [page, setPage]             = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState(searchParams.get('q') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  const fetchProducts = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: { category, mood, sort, page: pg, limit: 12, search: search || '' },
      });
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotal(data.total || data.products.length);
    } catch {}
    setLoading(false);
  }, [category, mood, sort, page, search]);

  useEffect(() => {
    const p = {};
    if (category !== 'all') p.category = category;
    if (mood !== 'all') p.mood = mood;
    if (sort !== 'newest') p.sort = sort;
    if (page > 1) p.page = page;
    if (search) p.q = search;
    setSearchParams(p, { replace: true });
  }, [category, mood, sort, page, search]);

  useEffect(() => { setPage(1); fetchProducts(1); }, [category, mood, sort, search]);
  useEffect(() => { if (page > 1) { fetchProducts(page); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim().toLowerCase();
    if (CATS.includes(q)) { setCategory(q); setSearch(''); setSearchInput(''); }
    else setSearch(searchInput.trim());
    setPage(1);
  };

  const reset = () => { setCategory('all'); setMood('all'); setSort('newest'); setSearch(''); setSearchInput(''); setPage(1); };
  const activeFilters = (category !== 'all' ? 1 : 0) + (mood !== 'all' ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: '#09090b' }}>
      <div className="max-w-[1400px] mx-auto px-5">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#f1f5f9' }}>
              {category !== 'all' ? <span className="capitalize">{category}</span> : 'All Products'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#475569' }}>
              {loading ? 'Loading...' : `${total.toLocaleString()} product${total !== 1 ? 's' : ''}`}
              {activeFilters > 0 && (
                <span style={{ color: '#10b981' }}> · {activeFilters} filter{activeFilters > 1 ? 's' : ''} active</span>
              )}
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex items-center flex-1 sm:w-64">
              <svg className="absolute left-3 w-4 h-4 pointer-events-none" style={{ color: '#475569' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl text-sm"
                style={{ paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.6rem', paddingBottom: '0.6rem', background: '#111113', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }}
              />
            </div>
            <button type="submit" className="btn-primary px-4 text-sm shrink-0">Search</button>
            {(search || activeFilters > 0) && (
              <button type="button" onClick={reset}
                className="px-3 text-sm shrink-0 rounded-xl transition"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                Reset
              </button>
            )}
          </form>
        </div>

        <div className="flex gap-6">

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col gap-4 shrink-0" style={{ width: '200px' }}>

            <SideSection title="Sort By">
              {SORTS.map(s => (
                <button key={s.value} onClick={() => { setSort(s.value); setPage(1); }}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg transition flex items-center justify-between"
                  style={{
                    color: sort === s.value ? '#34d399' : '#64748b',
                    background: sort === s.value ? 'rgba(16,185,129,0.1)' : 'transparent',
                    fontWeight: sort === s.value ? 600 : 400,
                  }}>
                  {s.label}
                  {sort === s.value && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  )}
                </button>
              ))}
            </SideSection>

            <SideSection title="Category">
              {CATS.map(c => (
                <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                  className="w-full flex items-center gap-2.5 text-left text-sm px-3 py-2 rounded-lg transition capitalize"
                  style={{
                    color: category === c ? '#34d399' : '#64748b',
                    background: category === c ? 'rgba(16,185,129,0.1)' : 'transparent',
                    fontWeight: category === c ? 600 : 400,
                  }}>
                  <span style={{ color: category === c ? '#10b981' : '#334155' }}>{CAT_ICONS[c]}</span>
                  {c}
                </button>
              ))}
            </SideSection>

            <SideSection title="Shop by Mood">
              {MOODS.map(m => (
                <button key={m} onClick={() => { setMood(m); setPage(1); }}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg transition capitalize"
                  style={{
                    color: mood === m ? '#10b981' : '#64748b',
                    background: mood === m ? 'rgba(16,185,129,0.07)' : 'transparent',
                    fontWeight: mood === m ? 600 : 400,
                  }}>
                  {m === 'all' ? 'All Moods' : m}
                </button>
              ))}
            </SideSection>

          </aside>

          {/* ── MAIN ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile category strip */}
            <div className="flex lg:hidden gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
              {CATS.map(c => (
                <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition"
                  style={{
                    background: category === c ? '#10b981' : 'rgba(255,255,255,0.04)',
                    color: category === c ? '#fff' : '#64748b',
                    border: `1px solid ${category === c ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Active search tag */}
            {search && (
              <div className="flex items-center gap-2 mb-5">
                <span className="text-sm" style={{ color: '#475569' }}>Results for</span>
                <span className="text-sm font-semibold px-2.5 py-0.5 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                  "{search}"
                </span>
                <button onClick={() => { setSearch(''); setSearchInput(''); }} style={{ color: '#475569' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="rounded-2xl animate-pulse" style={{ height: '340px', background: '#111113', border: '1px solid rgba(255,255,255,0.05)' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <svg className="w-7 h-7" style={{ color: '#334155' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <p className="font-semibold mb-1" style={{ color: '#94a3b8' }}>No products found</p>
                <p className="text-sm mb-6" style={{ color: '#334155' }}>Try adjusting your filters or search term</p>
                <button onClick={reset} className="btn-primary text-sm px-6 py-2.5">Clear All Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-1.5 mt-12">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-30"
                  style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className="w-9 h-9 rounded-xl text-sm font-semibold transition"
                    style={{
                      background: page === n ? '#10b981' : '#111113',
                      color: page === n ? '#fff' : '#64748b',
                      border: `1px solid ${page === n ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-30"
                  style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



