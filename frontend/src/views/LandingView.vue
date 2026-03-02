<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvasRef = ref(null)

let animationId = 0
let particles = []

function createParticle(cx, cy) {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.25 + Math.random() * 0.6
  const maxLife = 180 + Math.random() * 260
  return {
    x: cx + (Math.random() - 0.5) * 80,
    y: cy + (Math.random() - 0.5) * 28,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 0.6 + Math.random() * 1.4,
    opacity: 0,
    maxOpacity: 0.08 + Math.random() * 0.25,
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

  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2

  particles = Array.from({ length: 100 }, () => {
    const p = createParticle(cx, cy)
    p.life = Math.floor(Math.random() * p.maxLife)
    p.x += p.vx * p.life
    p.y += p.vy * p.life
    return p
  })

  function animate() {
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    particles.forEach((p, i) => {
      p.x += p.vx
      p.y += p.vy
      p.life++

      const fadeIn = 40
      const fadeOut = 60
      if (p.life < fadeIn) {
        p.opacity = (p.life / fadeIn) * p.maxOpacity
      } else if (p.life > p.maxLife - fadeOut) {
        p.opacity = ((p.maxLife - p.life) / fadeOut) * p.maxOpacity
      } else {
        p.opacity = p.maxOpacity
      }

      if (p.life >= p.maxLife) {
        particles[i] = createParticle(centerX, centerY)
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
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(255,255,255,0.022) 0%, transparent 70%);
        z-index: 1;
      "
    />

    <!-- Main content -->
    <div class="relative flex flex-col items-center select-none" style="z-index: 2">
      <!-- Logo -->
      <div class="mb-6 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center">
          <div
            style="
              width: 10px;
              height: 10px;
              background: #e03030;
              transform: rotate(45deg);
              box-shadow: 0 0 12px rgba(224,48,48,0.6);
            "
          />
        </div>
        <h1
          style="
            font-family: var(--font-display);
            font-size: 3.2rem;
            font-weight: 300;
            letter-spacing: -0.04em;
            color: #f0f0f0;
            line-height: 1;
          "
        >glosso</h1>
      </div>

      <!-- Domain -->
      <p
        style="
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: #2a2a2a;
          letter-spacing: 0.12em;
          margin-bottom: 2.5rem;
        "
      >glosso.space</p>

      <!-- Divider -->
      <div
        style="
          width: 1px;
          height: 36px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent);
          margin-bottom: 2rem;
        "
      />

      <!-- Tagline -->
      <p
        style="
          font-family: var(--font-primary);
          font-size: 0.88rem;
          color: #333333;
          letter-spacing: 0.06em;
          text-align: center;
          margin-bottom: 3rem;
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
