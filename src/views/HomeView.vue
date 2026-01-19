<!-- src/App.vue -->
<template>
  <div class="galaxy-home">
    <Galaxy
      :density="1"
      :glow-intensity="0.3"
      :saturation="0"
      :hue-shift="140"
      :twinkle-intensity="0.3"
      :rotation-speed="0.1"
      :repulsion-strength="2"
      :auto-center-repulsion="0"
      :star-speed="0.5"
      :particle-count="2000"
      :depth="5"
      :speed="0.03"
      color="#a0d8ff"
      background="#040612"
      :twinkle="true"
      :mouse-parallax="true"
      class="galaxy-bg"
    />

    <div class="hero-content">
      <h1 class="main-title">Cosmic Dashboard</h1>
      <p class="tagline">Powered by Vue 3 · Vite · Vue Bits</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Galaxy from '@/bits/Galaxy/Galaxy.vue'
</script>

<style scoped>
.galaxy-home {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.galaxy-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #e6f0ff;
  text-align: center;
  padding: 2rem;
}

.main-title {
  font-size: 4rem;
  font-weight: 200;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 15px rgba(160, 216, 255, 0.6);
  background: linear-gradient(to bottom, #ffffff, #a0d8ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  font-size: 1.25rem;
  opacity: 0.8;
  max-width: 700px;
  line-height: 1.7;
}
</style>
