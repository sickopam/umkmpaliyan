'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="main">
      <div className="halves">
        <div
          className="half half-left"
          onClick={() => router.push('/catalogue/makanan')} // Updated path
        >
          <div className="half-bg" />
          <div className="half-emoji">🍜</div>
          <div className="half-label">
            Makanan & Minuman <span className="label-arrow">→</span>
          </div>
        </div>

        <div
          className="half half-right"
          onClick={() => router.push('/catalogue/kerajinan')} // Updated path
        >
          <div className="half-bg" />
          <div className="half-emoji">🪴</div>
          <div className="half-label">
            <span className="label-arrow">←</span> Kerajinan
          </div>
        </div>
      </div>

      <div className="center-content">
        <h1 className="title">
          Explore UMKM <span className="title-gradient">Paliyan</span>
        </h1>
      </div>
    </main>
  )
}