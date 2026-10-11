import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const WEDDING_DATE = new Date('2026-11-26T11:00:00')

const PHOTOS = [
  { src: '/photos/Damini.jpeg', fallback: '/photos/Damini.jpeg', caption: 'Damini' },
  { src: '/photos/mehndi.webp', fallback: '/photos/mehndi.webp', caption: 'Mehendi' },
  { src: '/photos/haldi.avif', fallback: '/photos/haldi.avif', caption: 'Haldi' },
  // { src: '/photos/4.jpg', fallback: '/photos/4.svg', caption: 'Family' },
  { src: '/photos/wedding.jpg', fallback: '/photos/wedding.jpg', caption: '26.11.2026 Wedding' },
]

function daysUntil() {
  const now = new Date()
  const diff = WEDDING_DATE.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function PhotoShowcase() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [broken, setBroken] = useState({})

  useEffect(() => {
    if (paused) return undefined
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % PHOTOS.length)
    }, 3800)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <div
      className="album"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="album-stage">
        {PHOTOS.map((photo, i) => {
          const offset = (i - index + PHOTOS.length) % PHOTOS.length
          const src = broken[i] ? photo.fallback : photo.src
          const role =
            offset === 0 ? 'is-front' : offset === 1 ? 'is-mid' : offset === 2 ? 'is-back' : 'is-hidden'

          return (
            <figure key={photo.caption} className={`polaroid ${role}`}>
              <img
                src={src}
                alt={photo.caption}
                onError={() =>
                  setBroken((current) =>
                    current[i] ? current : { ...current, [i]: true }
                  )
                }
              />
            </figure>
          )
        })}
      </div>

      <p className="album-caption">{PHOTOS[index].caption}</p>

      <div className="dots" role="tablist" aria-label="Photos">
        {PHOTOS.map((photo, i) => (
          <button
            key={photo.caption}
            type="button"
            className={`dot ${i === index ? 'is-on' : ''}`}
            aria-label={photo.caption}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [yesHover, setYesHover] = useState(false)
  const [heartScale, setHeartScale] = useState(1)
  const [noHover, setNoHover] = useState(false)
  const [noPos, setNoPos] = useState({ x: 0, y: 0, escaped: false })
  const noRef = useRef(null)
  const fleeing = useRef(false)

  useEffect(() => {
    if (!yesHover) {
      setHeartScale(1)
      return
    }
    const id = window.setInterval(() => {
      setHeartScale((scale) => Math.min(scale + 0.045, 2.05))
    }, 40)
    return () => window.clearInterval(id)
  }, [yesHover])

  const fleeFrom = useCallback((clientX, clientY) => {
    if (fleeing.current) return
    fleeing.current = true

    const btnW = noRef.current?.offsetWidth ?? 120
    const btnH = noRef.current?.offsetHeight ?? 52
    const pad = 16
    const maxX = window.innerWidth - btnW - pad
    const maxY = window.innerHeight - btnH - pad

    let x = 0
    let y = 0
    let tries = 0
    do {
      x = randomBetween(pad, Math.max(pad, maxX))
      y = randomBetween(pad, Math.max(pad, maxY))
      tries += 1
    } while (Math.hypot(x - clientX, y - clientY) < 240 && tries < 18)

    setNoPos({ x, y, escaped: true })
    setNoHover(true)
    window.setTimeout(() => {
      fleeing.current = false
    }, 120)
  }, [])

  const remaining = daysUntil()
  const hearts = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${randomBetween(0, 100)}%`,
        delay: `${randomBetween(0, 6)}s`,
        duration: `${randomBetween(6, 12)}s`,
        size: `${randomBetween(14, 36)}px`,
        drift: `${randomBetween(-40, 40)}px`,
        glyph: ['♥', '♡', '❤'][i % 3],
      })),
    []
  )

  const sad = noHover || noPos.escaped

  return (
    <div className={`stage ${ready ? 'is-ready' : ''}`}>
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <div className="petals" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={`petal petal-${i + 1}`} />
        ))}
      </div>

      {!ready ? (
        <section className="ask">
          <p className="eyebrow">A little question before the big day</p>
          <h1>
            Are you ready for
            <span> 26th Nov??</span>
          </h1>
          <p className="sub">
            {remaining === 0
              ? 'It is today. Hearts out.'
              : `${remaining} day${remaining === 1 ? '' : 's'} of butterflies left.`}
          </p>

          <div className="actions">
            <button
              type="button"
              className={`yes ${yesHover ? 'is-heart' : ''}`}
              style={{ transform: `scale(${heartScale})` }}
              onMouseEnter={() => setYesHover(true)}
              onMouseLeave={() => setYesHover(false)}
              onFocus={() => setYesHover(true)}
              onBlur={() => setYesHover(false)}
              onClick={() => setReady(true)}
            >
              <span className="yes-label">{yesHover ? '♥' : 'Yes'}</span>
            </button>

            <button
              ref={noRef}
              type="button"
              className={`no ${noPos.escaped ? 'is-escaped' : ''} ${sad ? 'is-sad' : ''}`}
              style={
                noPos.escaped
                  ? { left: `${noPos.x}px`, top: `${noPos.y}px` }
                  : undefined
              }
              onPointerEnter={() => setNoHover(true)}
              onPointerLeave={() => {
                if (!noPos.escaped) setNoHover(false)
              }}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                fleeFrom(event.clientX, event.clientY)
              }}
              onClick={(event) => event.preventDefault()}
            >
              <span className="no-label">{sad ? '😢' : 'No'}</span>
            </button>
          </div>
        </section>
      ) : (
        <section className="celebrate">
          {hearts.map((heart) => (
            <span
              key={heart.id}
              className="rain-heart"
              style={{
                left: heart.left,
                fontSize: heart.size,
                animationDelay: heart.delay,
                animationDuration: heart.duration,
                '--drift': heart.drift,
              }}
            >
              {heart.glyph}
            </span>
          ))}

          <p className="script">That is the only answer</p>
          <h2>See you on 26th November</h2>
          <PhotoShowcase />
          <p className="blessing">
            May this shaadi be loud with laughter, soft with love,
            and impossible to say no to.
          </p>
        </section>
      )}
    </div>
  )
}
