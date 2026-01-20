<script setup lang="ts">
import { ref, computed } from 'vue'
import MainHeader from '@/components/MainHeader.vue'
import TagLabView from '@/views/TagLabView.vue'
import SegmentView from '@/views/SegmentView.vue'
import Dashboard from '@/views/view.vue'
import Notification from '@/views/Notification.vue'
import Main from '@/views/Main.vue'
// 1. 当前选中的页面 ID
const currentTab = ref('home')

// 2. 简单的视图映射逻辑
const activeView = computed(() => {
  if (currentTab.value === 'home') return Main
  if (currentTab.value === 'tag') return TagLabView
  if (currentTab.value === 'segment') return SegmentView
  if (currentTab.value === 'insight') return Dashboard
  if (currentTab.value === 'reach') return Notification
  return null
})
</script>

<template>
  <div class="aether-container">
    <MainHeader :active-id="currentTab" @change="(id) => (currentTab = id)" />

    <Transition name="page-glassy" mode="out-in">
      <component :is="activeView" />
    </Transition>
  </div>
</template>

<style>
/* --- 全局容器保持锁定 --- */
.aether-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: #000; /* 建议纯黑，更显银河深度 */
  overflow: hidden;
  position: relative;
}

/* --- 方案一核心：极简虚化 (Glassy Blur) --- */

/* 1. 定义动画的时间曲线 */
.page-glassy-enter-active,
.page-glassy-leave-active {
  /* 使用 Apple 惯用的准则：0.5s + 特定的缓动函数 */
  transition:
    opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 2. 入场状态：从模糊、稍微放大、透明的状态进入 */
.page-glassy-enter-from {
  opacity: 0;
  filter: blur(20px);      /* 强烈虚化 */
  transform: scale(1.05);  /* 略微放大，产生“扑面而来”的入场感 */
}

/* 3. 离场状态：向模糊、稍微缩小、透明的状态消失 */
.page-glassy-leave-to {
  opacity: 0;
  filter: blur(15px);      /* 虚化消失 */
  transform: scale(0.98);  /* 略微缩小，产生“向深处退去”的离场感 */
}

/* 💡 性能优化：防止动画过程中的布局闪烁 */
.page-glassy-enter-active {
  position: relative;
  z-index: 2;
}
</style>
<!-- App.vue -->
<!--<template>-->
<!--  <div id="app">-->
<!--    <component :is="CurrentView" />-->
<!--  </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import MyPage from '@/views/HomeView.vue'-->
<!--// import AnotherPage from './views/AnotherPage.vue'-->

<!--const CurrentView = MyPage // 改这里切换页面-->
<!--</script>-->
