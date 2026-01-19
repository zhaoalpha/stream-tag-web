<template>
  <div class="page-wrapper">
    <!-- 银河背景 -->
    <div class="background-layer">
      <Galaxy
        v-if="galaxyReady"
        :mouse-interaction="true"
        :mouse-repulsion="true"
        :density="1"
        :glow-intensity="0.3"
        :saturation="0"
        :hue-shift="140"
        :twinkle-intensity="0.3"
        :rotation-speed="0.1"
        :repulsion-strength="2"
        :auto-center-repulsion="0"
        :star-speed="0.5"
        :animation-speed="1"
        class="galaxy-instance"
      />
    </div>

    <!-- Hero 内容 -->
    <section class="hero-content">
      <div class="hero">
        <h1 class="title">Stream Tag</h1>
        <p class="subtitle">
          基于新一代湖仓架构的全链路实时标签系统
        </p>
        <div class="meta">
          <span>Lakehouse</span>
          <span>Real-time</span>
          <span>Streaming Tags</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Galaxy from '@/bits/Galaxy/Galaxy.vue'

const galaxyReady = ref(false)

onMounted(() => {
  setTimeout(() => {
    galaxyReady.value = true
  }, 50)
})
</script>

<style scoped>
/* 容器：锁定视口 */
.page-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #000; /* 银河背景的底色 */
  overflow: hidden;
}

/* 背景层：铺满且置底 */
.background-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;

}

/* 确保 Galaxy 实例撑满 */
.galaxy-instance {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

/* 内容层：悬浮在背景之上 */
.hero-content {
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.title {
  font-size: 84px;
  font-weight: 800;
  background: linear-gradient(180deg, #fff 30%, #ccc 100%); /* 改为灰白渐变，匹配黑白主题 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.2)); /* 微弱白光 */
}

.subtitle {
  margin-top: 24px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 4px;
}

.meta {
  margin-top: 50px;
  display: flex;
  gap: 20px;
}

.meta span {
  padding: 8px 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  font-family: var(--font-mono);
  font-size: 12px;
  color: #ccc; /* 改为浅灰，保持黑白风格 */
  text-transform: uppercase;
}
</style>
