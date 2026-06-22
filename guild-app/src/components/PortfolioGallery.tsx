'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CreatorPortfolio } from '@/types'

export default function PortfolioGallery({ creatorId }: { creatorId: string }) {
  const supabase = createClient()
  const [items, setItems] = useState<CreatorPortfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('creator_portfolios')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data)
        setLoading(false)
      })
  }, [creatorId, supabase])

  if (loading) return null

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-headline)', fontSize: '1.05rem',
          fontWeight: 700, color: 'hsl(197 20% 12%)',
          marginBottom: '0.9rem',
        }}>
          Portofolio
        </h2>

        {items.length === 0 ? (
          <div style={{
            padding: '1.5rem', textAlign: 'center',
            border: '1px dashed hsl(197 30% 82%)', borderRadius: 10,
            background: 'hsl(197 50% 98%)',
          }}>
            <p style={{ fontSize: '0.875rem', color: 'hsl(197 20% 50%)' }}>
              Belum ada portofolio
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
          }}>
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setLightbox(item.image_url)}
                style={{
                  border: 'none', borderRadius: 10, overflow: 'hidden',
                  cursor: 'pointer', padding: 0, background: 'none',
                  aspectRatio: '1 / 1', position: 'relative',
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '0.4rem 0.5rem',
                  background: 'linear-gradient(transparent, hsl(197 20% 12% / 0.7))',
                }}>
                  <p style={{
                    margin: 0, fontSize: '0.72rem', color: '#fff',
                    fontWeight: 500, textAlign: 'left', lineHeight: 1.2,
                  }}>
                    {item.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'hsl(0 0% 0% / 0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: '1.5rem',
          }}
        >
          <img
            src={lightbox}
            alt="Portfolio preview"
            style={{
              maxWidth: '100%', maxHeight: '100%',
              borderRadius: 12, objectFit: 'contain',
            }}
          />
        </div>
      )}
    </>
  )
}
