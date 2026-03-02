<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvasRef = ref(null)

let animationId = 0
let particles = []

function createParticle(w, h) {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.15 + Math.random() * 0.45
  const maxLife = 250 + Math.random() * 350
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 0.5 + Math.random() * 1.6,
    opacity: 0,
    maxOpacity: 0.06 + Math.random() * 0.22,
    life: 0,
    maxLife,
    isRed: Math.random() < 0.08,
  }
}

function handleResize() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function handleKeyDown(e) {
  if (e.key === 'Enter') router.push('/library')
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)

  const w = window.innerWidth
  const h = window.innerHeight

  particles = Array.from({ length: 180 }, () => {
    const p = createParticle(w, h)
    p.life = Math.floor(Math.random() * p.maxLife)
    return p
  })

  function animate() {
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach((p, i) => {
      p.x += p.vx
      p.y += p.vy
      p.life++

      const fadeIn = 50
      const fadeOut = 80
      if (p.life < fadeIn) {
        p.opacity = (p.life / fadeIn) * p.maxOpacity
      } else if (p.life > p.maxLife - fadeOut) {
        p.opacity = ((p.maxLife - p.life) / fadeOut) * p.maxOpacity
      } else {
        p.opacity = p.maxOpacity
      }

      if (p.life >= p.maxLife) {
        particles[i] = createParticle(canvas.width, canvas.height)
      }

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.isRed
        ? `rgba(224, 48, 48, ${p.opacity * 1.6})`
        : `rgba(255, 255, 255, ${p.opacity})`
      ctx.fill()
    })

    animationId = requestAnimationFrame(animate)
  }

  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
})

function startReading() {
  router.push('/library')
}
</script>

<template>
  <div class="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
    <!-- Particle canvas -->
    <canvas
      ref="canvasRef"
      class="pointer-events-none absolute inset-0"
      style="z-index: 0"
    />

    <!-- Subtle radial glow -->
    <div
      class="pointer-events-none absolute rounded-full"
      style="
        width: 900px;
        height: 900px;
        background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 65%);
        z-index: 1;
      "
    />

    <!-- Main content -->
    <div class="relative flex flex-col items-center select-none" style="z-index: 2">
      <!-- Diamond mark -->
      <div class="mb-8">
        <div
          style="
            width: 16px;
            height: 16px;
            background: #e03030;
            transform: rotate(45deg);
            box-shadow: 0 0 20px rgba(224,48,48,0.6), 0 0 60px rgba(224,48,48,0.15);
          "
        />
      </div>

      <!-- Logo text -->
      <h1
        class="landing-logo"
      >glosso</h1>

      <!-- Domain -->
      <p
        style="
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #2a2a2a;
          letter-spacing: 0.14em;
          margin-top: 1rem;
          margin-bottom: 3rem;
        "
      >glosso.space</p>

      <!-- Divider -->
      <div
        style="
          width: 1px;
          height: 48px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent);
          margin-bottom: 2.5rem;
        "
      />

      <!-- Tagline -->
      <p
        style="
          font-family: var(--font-primary);
          font-size: 0.92rem;
          color: #333333;
          letter-spacing: 0.08em;
          text-align: center;
          margin-bottom: 3.5rem;
          text-transform: uppercase;
        "
      >Read. Discover. Remember.</p>

      <!-- CTA Button -->
      <button
        class="landing-cta group relative overflow-hidden transition-all duration-300"
        @click="startReading"
      >Start Reading</button>

      <!-- Enter hint -->
      <p
        style="
          margin-top: 1.2rem;
          font-size: 0.65rem;
          color: #222222;
          font-family: var(--font-mono);
          letter-spacing: 0.08em;
        "
      >or press Enter</p>
    </div>

    <!-- Bottom bar -->
    <div
      class="absolute bottom-0 left-0 right-0 flex items-center justify-between px-10 py-5"
      style="z-index: 2"
    >
      <span
        style="
          font-family: var(--font-mono);
          font-size: 0.6rem;
          color: #1a1a1a;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        "
      >Language learning through reading</span>

      <div class="flex items-center gap-1.5">
        <div
          style="
            width: 5px;
            height: 5px;
            background: #e03030;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(224,48,48,0.5);
          "
        />
        <span
          style="
            font-family: var(--font-mono);
            font-size: 0.6rem;
            color: #1a1a1a;
            letter-spacing: 0.08em;
          "
        >v1.0</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-logo {
  font-family: var(--font-display);
  font-size: clamp(4rem, 10vw, 7rem);
  font-weight: 300;
  letter-spacing: -0.05em;
  color: #f0f0f0;
  line-height: 1;
}

.landing-cta {
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c0c0c0;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.02);
  border-radius: 2px;
  padding: 12px 36px;
  cursor: pointer;
}

.landing-cta:hover {
  color: #f0f0f0;
  border-color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.04);
}
</style>
