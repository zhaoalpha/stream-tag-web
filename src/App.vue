<script setup lang="ts">
import { ref, computed } from 'vue'
import MainHeader from '@/components/MainHeader.vue'
import TagLabView from '@/views/TagLabView.vue'
import SegmentView from '@/views/SegmentView.vue'
import Dashboard from '@/views/dashboard.vue'
import Notification from '@/views/Notification.vue'
// 1. 当前选中的页面 ID
const currentTab = ref('tag')

// 2. 简单的视图映射逻辑
const activeView = computed(() => {
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

    <Transition name="page-fade" mode="out-in">
      <component :is="activeView" />
    </Transition>
  </div>
</template>

<style>
/* 这里只保留全局基础背景和容器样式 */
.aether-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #050505;
  overflow: hidden;
}

/* 页面切换的淡入淡出动效 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
