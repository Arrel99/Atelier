'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import HeroSlotGrid from '@/components/HeroSlotGrid'

/* ── Mock creator data untuk showcase ───────────────────── */
const MOCK_CREATORS = [
  {
    id: '1',
    name: 'Hana Artworks',
    handle: '@hana_art',
    role: 'Illustrator',
    bio: 'Spesialis ilustrasi karakter OC dan fanart. Pengalaman 5 tahun, lebih dari 200 klien puas. Slot terbatas setiap bulan.',
    tags: ['Illustration', 'Character', 'OC Design'],
    available: true,
    slots: 2,
    initials: 'HA',
    color: 'hsl(197 55% 52%)',
  },
  {
    id: '2',
    name: 'Reno Studio',
    handle: '@renostudio',
    role: 'Graphic Designer',
    bio: 'Brand identity, logo, dan aset visual untuk Vtuber dan streamer. Turnaround cepat, revisi hingga puas.',
    tags: ['Logo', 'Brand', 'Vtuber'],
    available: true,
    slots: 4,
    initials: 'RS',
    color: 'hsl(197 45% 38%)',
  },
  {
    id: '3',
    name: 'Miko Creative',
    handle: '@mikocreative',
    role: 'Illustrator',
    bio: 'Chibi dan fanart anime berkualitas tinggi. Spesialis gaya anime Jepang modern dengan sentuhan detail yang khas.',
    tags: ['Chibi', 'Anime', 'Fanart'],
    available: false,
    slots: 0,
    initials: 'MC',
    color: 'hsl(197 65% 60%)',
  },
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      <style>{`
        @keyframes slotPulse {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.65; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-text { animation: fadeIn 0.55s ease 0.1s both; }
        .hero-sub  { animation: fadeIn 0.55s ease 0.22s both; }
        .hero-cta  { animation: fadeIn 0.55s ease 0.34s both; }
        .hero-card { animation: fadeIn 0.6s ease 0.45s both; }
        .tag-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.65rem;
          background: hsl(0 0% 95%);
          color: hsl(197 20% 30%);
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 500;
          border: 1px solid hsl(0 0% 90%);
        }
        .creator-card {
          background: #fff;
          border: 1px solid hsl(197 20% 91%);
          border-radius: 16px;
          overflow: hidden;
          transition: box-shadow 0.15s;
        }
        .creator-card:hover {
          box-shadow: 0 4px 20px hsl(197 30% 20% / 0.08);
        }
        .send-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.4rem 0.9rem;
          background: hsl(0 0% 96%);
          color: hsl(197 20% 20%);
          border: 1px solid hsl(0 0% 88%);
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.12s;
          text-decoration: none;
          white-space: nowrap;
        }
        .send-btn:hover { background: hsl(197 50% 93%); border-color: #87CEEB; color: hsl(197 45% 32%); }
        .feature-card {
          border-radius: 14px;
          padding: 1.75rem;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
        }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#fff',
        borderBottom: '1px solid hsl(197 20% 93%)',
        height: 52,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <div style={{
              width: 28, height: 28, background: '#87CEEB',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="5" cy="5" r="2" fill="white" />
                <circle cx="11" cy="5" r="2" fill="white" opacity="0.6" />
                <circle cx="5" cy="11" r="2" fill="white" opacity="0.4" />
                <circle cx="11" cy="11" r="2" fill="white" opacity="0.9" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-headline)', fontWeight: 700, fontStyle: 'italic',
              fontSize: '1.1rem', color: 'hsl(197 20% 12%)',
            }}>Atelier</span>
          </Link>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/creators" style={{
              fontSize: '0.85rem', color: 'hsl(197 20% 40%)',
              textDecoration: 'none', padding: '0.3rem 0.6rem', borderRadius: 6,
            }}>
              Kreator
            </Link>
            <Link href="/auth/register" style={{
              fontSize: '0.85rem', fontWeight: 500, color: 'hsl(197 20% 12%)',
              textDecoration: 'none',
              padding: '0.35rem 0.9rem',
              border: '1px solid hsl(197 20% 85%)',
              borderRadius: 8,
              transition: 'all 0.12s',
            }}>
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO — Full width banner style ────────────────── */}
      <section style={{ paddingTop: 52 }}>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, hsl(197 60% 88%) 0%, hsl(210 50% 92%) 40%, hsl(197 72% 93%) 100%)',
          minHeight: 480,
          display: 'flex', alignItems: 'center',
          overflow: 'hidden',
          margin: '0 1rem',
          borderRadius: '0 0 20px 20px',
        }}>
          {/* BG pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `radial-gradient(circle, hsl(197 50% 70% / 0.15) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
          }} />

          <div style={{
            maxWidth: 1200, margin: '0 auto', padding: '3.5rem 2.5rem',
            width: '100%', display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '2rem', alignItems: 'center',
          }}>
            {/* Left: text */}
            <div>
              <p className="hero-text" style={{
                fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'hsl(197 45% 38%)',
                marginBottom: '0.9rem',
              }}>
                Untuk Klien Kreatif
              </p>
              <h1 className="hero-text" style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 700, lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'hsl(197 25% 10%)',
                marginBottom: '1rem',
              }}>
                Jasa kreatif<br />berbasis antrean.
              </h1>
              <p className="hero-sub" style={{
                fontSize: '1.05rem', color: 'hsl(197 20% 35%)',
                lineHeight: 1.65, maxWidth: '40ch', marginBottom: '2rem',
              }}>
                Pesan ilustrasi, desain, dan aset visual dari kreator Indonesia. Transparan, terukur, terlindungi.
              </p>
              <div className="hero-cta" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <Link href="/auth/register" style={{
                  padding: '0.7rem 1.6rem',
                  background: 'hsl(197 25% 12%)',
                  color: '#fff', borderRadius: 10,
                  fontWeight: 600, fontSize: '0.9rem',
                  textDecoration: 'none', transition: 'background 0.12s',
                }}>
                  Daftar Sekarang
                </Link>
                <Link href="/creators" style={{
                  padding: '0.7rem 1.4rem',
                  background: 'hsl(0 0% 100% / 0.7)',
                  color: 'hsl(197 45% 30%)',
                  border: '1px solid hsl(197 30% 78%)',
                  borderRadius: 10, fontWeight: 500, fontSize: '0.9rem',
                  textDecoration: 'none',
                }}>
                  Lihat Kreator
                </Link>
              </div>
            </div>

            {/* Right: HeroSlotGrid + floating card */}
            <div className="hero-card" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
              position: 'relative',
            }}>
              {mounted && <HeroSlotGrid />}

              {/* Floating creator card */}
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '0.75rem 1rem',
                boxShadow: '0 4px 24px hsl(197 30% 20% / 0.12)',
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                minWidth: 200,
                position: 'absolute', bottom: -20, right: 0,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#87CEEB', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                  flexShrink: 0,
                }}>HA</div>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(197 20% 12%)', lineHeight: 1.2 }}>
                    Hana Artworks
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'hsl(197 20% 50%)' }}>@hana_art · 2 slot tersedia</p>
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#4ade80', marginLeft: 'auto', flexShrink: 0,
                }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS ATELIER ───────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '3.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{
          background: 'hsl(197 30% 96%)',
          borderRadius: 14, padding: '1.5rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, background: '#87CEEB', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'hsl(197 20% 12%)', marginBottom: '0.2rem' }}>
                Apa itu Atelier?
              </p>
              <p style={{ fontSize: '0.875rem', color: 'hsl(197 20% 40%)', lineHeight: 1.5 }}>
                Platform pemesanan jasa kreatif berbasis slot antrean. Klien tahu posisinya, kreator tahu batasnya.
              </p>
            </div>
          </div>
          <Link href="/auth/register" style={{
            padding: '0.55rem 1.2rem',
            background: '#fff',
            color: 'hsl(197 20% 20%)',
            border: '1px solid hsl(197 20% 85%)',
            borderRadius: 9, fontSize: '0.85rem', fontWeight: 500,
            textDecoration: 'none', whiteSpace: 'nowrap',
            transition: 'all 0.12s',
          }}>
            Pelajari lebih lanjut
          </Link>
        </div>
      </section>

      {/* ── FEATURE CARDS — 2 column ──────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {[
            {
              title: 'Antrean berbasis slot',
              body: 'Setiap kreator punya slot terbatas. Klien memesan sesuai posisi — tidak ada overbooking, tidak ada kejutan.',
              bg: 'hsl(197 65% 90%)',
              iconBg: '#87CEEB',
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="7" cy="7" r="4" fill="white"/>
                  <circle cx="21" cy="7" r="4" fill="white" opacity="0.5"/>
                  <circle cx="7" cy="21" r="4" fill="white" opacity="0.7"/>
                  <circle cx="21" cy="21" r="4" fill="white" opacity="0.9"/>
                </svg>
              ),
            },
            {
              title: 'Brief terstruktur',
              body: 'Form brief per kategori memastikan kreator mendapat informasi yang cukup. Skor kelengkapan real-time.',
              bg: 'hsl(270 40% 93%)',
              iconBg: 'hsl(270 50% 65%)',
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="6" width="20" height="3" rx="1.5" fill="white"/>
                  <rect x="4" y="12" width="14" height="3" rx="1.5" fill="white" opacity="0.7"/>
                  <rect x="4" y="18" width="17" height="3" rx="1.5" fill="white" opacity="0.5"/>
                </svg>
              ),
            },
            {
              title: 'Pembayaran escrow',
              body: 'Dana ditahan hingga pekerjaan disetujui. Kreator aman, klien tenang. Tidak ada risiko hilang uang.',
              bg: 'hsl(152 40% 90%)',
              iconBg: 'hsl(152 55% 42%)',
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="5" y="10" width="18" height="13" rx="3" fill="white" opacity="0.9"/>
                  <path d="M9 10V8a5 5 0 0 1 10 0v2" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              title: 'Tracker progres',
              body: 'Pantau progres pesanan secara real-time per tahap. Klien selalu tahu apa yang sedang dikerjakan.',
              bg: 'hsl(35 80% 91%)',
              iconBg: 'hsl(35 80% 55%)',
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="9" stroke="white" strokeWidth="2.5" strokeDasharray="14 42" strokeLinecap="round"/>
                  <path d="M14 9v5l3 3" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              ),
            },
          ].map(({ title, body, bg, iconBg, icon }) => (
            <div key={title} className="feature-card" style={{ background: bg }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'hsl(197 20% 12%)', marginBottom: '0.4rem' }}>{title}</p>
                <p style={{ fontSize: '0.85rem', color: 'hsl(197 20% 35%)', lineHeight: 1.6, maxWidth: '28ch' }}>{body}</p>
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {icon}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CREATOR SHOWCASE ──────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '3.5rem auto 0', padding: '0 1.5rem' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)',
              fontWeight: 700, letterSpacing: '-0.02em',
              color: 'hsl(197 20% 12%)', marginBottom: '0.2rem',
            }}>
              Ilustrator &amp; Desainer
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'hsl(197 20% 45%)' }}>
              Kreator terpilih yang siap menerima pesanan
            </p>
          </div>
          <Link href="/creators" style={{
            fontSize: '0.82rem', color: 'hsl(197 45% 38%)',
            textDecoration: 'none', fontWeight: 500,
          }}>
            Lihat semua →
          </Link>
        </div>

        {/* 3-column creator cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {MOCK_CREATORS.map((creator) => (
            <div key={creator.id} className="creator-card">
              {/* Card header */}
              <div style={{ padding: '1.1rem 1.1rem 0.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: creator.color, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {creator.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'hsl(197 20% 50%)', marginBottom: '0.1rem' }}>
                      {creator.role}
                    </p>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'hsl(197 20% 12%)' }}>
                      {creator.name}
                    </p>
                  </div>
                </div>
                <Link href={`/creators/${creator.id}`} className="send-btn">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1 5.5h9M6.5 2 10 5.5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Order
                </Link>
              </div>

              {/* Bio */}
              <div style={{ padding: '0 1.1rem 0.75rem' }}>
                <p style={{
                  fontSize: '0.82rem', color: 'hsl(197 15% 40%)', lineHeight: 1.55,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                }}>
                  {creator.bio}
                </p>
              </div>

              {/* Artwork placeholder */}
              <div style={{ padding: '0 1.1rem 0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {[0, 1].map((i) => (
                  <div key={i} style={{
                    aspectRatio: '4/3',
                    background: `hsl(${197 + i * 15} ${40 + i * 10}% ${88 + i * 4}%)`,
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="3" width="14" height="14" rx="3" stroke="#87CEEB" strokeWidth="1.5"/>
                      <circle cx="7" cy="7.5" r="1.5" fill="#87CEEB" opacity="0.6"/>
                      <path d="M3 13l4-3 3 2.5 3-4 4 4.5" stroke="#87CEEB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                    </svg>
                  </div>
                ))}
              </div>

              {/* Tags + availability */}
              <div style={{
                padding: '0.65rem 1.1rem',
                borderTop: '1px solid hsl(197 20% 93%)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {creator.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 500,
                  color: creator.available ? 'hsl(152 55% 38%)' : 'hsl(197 20% 55%)',
                  background: creator.available ? 'hsl(152 40% 92%)' : 'hsl(0 0% 95%)',
                  padding: '0.15rem 0.55rem', borderRadius: 999,
                }}>
                  {creator.available ? `${creator.slots} slot` : 'Penuh'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BOTTOM ────────────────────────────────────── */}
      <section style={{
        maxWidth: 1200, margin: '4rem auto', padding: '0 1.5rem',
      }}>
        <div style={{
          background: 'hsl(197 25% 12%)',
          borderRadius: 16, padding: '3rem 2.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '2rem', flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700, letterSpacing: '-0.02em',
              color: '#fff', marginBottom: '0.5rem',
            }}>
              Mulai pesanan pertamamu.
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'hsl(197 40% 70%)', lineHeight: 1.6 }}>
              Gratis. Tidak perlu kartu kredit. Mulai dalam hitungan menit.
            </p>
          </div>
          <Link href="/auth/register" style={{
            padding: '0.8rem 2rem', background: '#87CEEB',
            color: 'hsl(197 25% 12%)', borderRadius: 10,
            fontWeight: 700, fontSize: '0.9rem',
            textDecoration: 'none', whiteSpace: 'nowrap',
            transition: 'background 0.12s', flexShrink: 0,
          }}>
            Daftar Sekarang
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid hsl(197 20% 93%)',
        padding: '1.5rem 1.5rem',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <span style={{
            fontFamily: 'var(--font-headline)', fontSize: '1rem',
            fontWeight: 700, fontStyle: 'italic', color: 'hsl(197 20% 35%)',
          }}>Atelier</span>
          <p style={{ fontSize: '0.78rem', color: 'hsl(197 20% 55%)' }}>
            © {new Date().getFullYear()} Atelier — Platform jasa kreatif berbasis antrean.
          </p>
        </div>
      </footer>
    </>
  )
}
