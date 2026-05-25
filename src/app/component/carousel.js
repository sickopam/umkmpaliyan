import { useState, useRef } from 'react'

export default function Carousel({ images }) {
  const [current, setCurrent] = useState(0)
  const startX = useRef(null)

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length)
  const next = () => setCurrent(c => (c + 1) % images.length)

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (startX.current === null) return
    const diff = startX.current - e.changedTouches[0].clientX
    if (diff > 40) next()
    else if (diff < -40) prev()
    startX.current = null
  }

  return (
    <div className="carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="carousel-track-wrapper">
        <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {images.map((src, i) => (
            <div key={i} className="carousel-slide">
              <img src={src} alt={`slide ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={prev}>‹</button>
          <button className="carousel-btn next" onClick={next}>›</button>
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button key={i} className={`carousel-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}