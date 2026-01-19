<template>
  <div class="aether-container" :class="{ 'is-drawer-open': selectedGroup }">

    <main class="viewport" :class="{ 'drawer-shift': selectedGroup }">
      <div class="center-content">
        <section class="workspace-header">
          <div class="header-left">
            <h2 class="page-title">AUDIENCE_UNIVERSE</h2>
            <span class="count-badge">{{ audienceGroups.length }} 个活跃人群包</span>
          </div>
          <div class="header-center">
            <button class="filter-trigger">
              <Filter :size="12" class="lucide-v" />
              <span>筛选配置</span>
            </button>
          </div>
          <div class="header-right"></div>
        </section>

        <div class="audience-grid">
          <div
            v-for="group in audienceGroups"
            :key="group.id"
            class="audience-card"
            :class="{ 'is-active': selectedGroup?.id === group.id }"
            @click="selectedGroup = group"
          >
            <div class="id-tag">{{ group.id }}</div>
            <h3 class="group-name">{{ group.name }}</h3>
            <div class="card-stats">
              <span class="val">{{ group.total.toLocaleString() }}</span>
              <span class="unit">USERS</span>
            </div>
            <div class="card-footer-mini">
              <div class="status-dot" :class="group.status"></div>
              <ChevronRight :size="14" class="lucide-v arrow-icon" />
            </div>
          </div>
        </div>
      </div>
    </main>

    <Transition name="slide">
      <aside v-if="selectedGroup" class="detail-drawer">
        <header class="drawer-header">
          <button class="close-btn" @click="selectedGroup = null">
            <X :size="20" class="lucide-v" />
          </button>
          <div class="header-info">
            <span class="drawer-id">{{ selectedGroup.id }}</span>
            <h2 class="drawer-title">{{ selectedGroup.name }}</h2>
          </div>
        </header>

        <div class="reach-anchor-zone">
          <span class="section-label">快速触达执行 / QUICK_REACH</span>
          <div class="reach-btn-row">
            <button class="reach-action-item">
              <Phone :size="14" class="lucide-v" />
              <span>电话</span>
            </button>
            <button class="reach-action-item">
              <MessageSquare :size="14" class="lucide-v" />
              <span>短信</span>
            </button>
            <button class="reach-action-item">
              <Mail :size="14" class="lucide-v" />
              <span>邮件</span>
            </button>
          </div>
        </div>

        <div class="center-divider"></div>

        <div class="drawer-content">
          <section class="content-section">
            <h4 class="section-title">人群维度全景统计 / AUDIENCE BREAKDOWN</h4>

            <div class="unified-stats-grid">
              <div class="stat-card male">
                <div class="s-header">
                  <span class="s-label">男性</span>
                  <span class="s-count">{{ selectedGroup.male.toLocaleString() }}</span>
                </div>
                <div class="s-progress"><div class="s-bar" :style="{ width: (selectedGroup.male/selectedGroup.total*100) + '%' }"></div></div>
              </div>

              <div class="stat-card female">
                <div class="s-header">
                  <span class="s-label">女性</span>
                  <span class="s-count">{{ selectedGroup.female.toLocaleString() }}</span>
                </div>
                <div class="s-progress"><div class="s-bar" :style="{ width: (selectedGroup.female/selectedGroup.total*100) + '%' }"></div></div>
              </div>

              <div class="stat-card student">
                <div class="s-header">
                  <span class="s-label">学生群体</span>
                  <span class="s-count">{{ selectedGroup.student.toLocaleString() }}</span>
                </div>
                <div class="s-progress"><div class="s-bar" :style="{ width: (selectedGroup.student/selectedGroup.total*100) + '%' }"></div></div>
              </div>

              <div class="stat-card worker">
                <div class="s-header">
                  <span class="s-label">上班族</span>
                  <span class="s-count">{{ selectedGroup.worker.toLocaleString() }}</span>
                </div>
                <div class="s-progress"><div class="s-bar" :style="{ width: (selectedGroup.worker/selectedGroup.total*100) + '%' }"></div></div>
              </div>
            </div>
          </section>

          <section class="content-section">
            <h4 class="section-title">执行记录与日志 / SYSTEM LOGS</h4>
            <div class="custom-log-list">
              <div class="log-entry">
                <div class="log-indicator success"></div>
                <div class="log-body">
                  <span class="log-timestamp">2026.01.17 14:58</span>
                  <p class="log-text">系统成功同步最新画像维度，人群包基数已更新。</p>
                </div>
              </div>
              <div class="log-entry">
                <div class="log-indicator"></div>
                <div class="log-body">
                  <span class="log-timestamp">2026.01.16 09:15</span>
                  <p class="log-text">批量短信策略任务已完成，平均触达延迟 1.2s。</p>
                </div>
              </div>
              <div class="log-entry">
                <div class="log-indicator"></div>
                <div class="log-body">
                  <span class="log-timestamp">2026.01.15 18:30</span>
                  <p class="log-text">导出历史名单请求已通过审计，生成路径 /exports/tmp_88.csv</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer class="drawer-footer">
          <button class="action-btn">导出当前维度报表</button>
        </footer>
      </aside>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SystemHeader from '@/components/MainHeader.vue';
import {
  Filter, X, ChevronRight, Phone, MessageSquare, Mail, Layers, Share2, Settings
} from 'lucide-vue-next';

const currentNav = ref('settings');
const selectedGroup = ref(null);

const navs = [
  { id: 'strategy', name: '标签' },
  { id: 'topology', name: '分群' },
  { id: 'settings', name: '触达' }
];

const audienceGroups = ref([
  { id: 'GP-8801', name: '核心价值用户', total: 12540, male: 5240, female: 7300, student: 1200, worker: 11340, status: 'active' },
  { id: 'GP-4202', name: '沉睡唤醒包', total: 45800, male: 22000, female: 23800, student: 15800, worker: 30000, status: 'active' },
  { id: 'GP-1109', name: '新晋潜在VIP', total: 8920, male: 1100, female: 7820, student: 6500, worker: 2420, status: 'inactive' },
  { id: 'GP-0045', name: '流失预警', total: 3120, male: 1500, female: 1620, student: 400, worker: 2720, status: 'active' },
  { id: 'GP-9921', name: '极客兴趣组', total: 6700, male: 6000, female: 700, student: 3200, worker: 3500, status: 'active' },
  { id: 'GP-3312', name: '大额消费券', total: 2100, male: 1000, female: 1100, student: 100, worker: 2000, status: 'inactive' },
  { id: 'GP-5561', name: '双周活跃', total: 98400, male: 48000, female: 50400, student: 42000, worker: 56400, status: 'active' },
  { id: 'GP-7720', name: '回访调研', total: 4500, male: 2200, female: 2300, student: 800, worker: 3700, status: 'active' }
]);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;600&display=swap');

.aether-container {
  --bg: #030303;
  --accent: #ffffff;
  --accent-dim: rgba(255, 255, 255, 0.35);
  --border: rgba(255, 255, 255, 0.08);
  --male: #4da6ff;
  --female: #ff4d94;
  --student: #00ffcc;
  --worker: #a370ff;
  --font-mono: 'JetBrains Mono', monospace;
  background: var(--bg); color: var(--accent);
  min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif;
}

/* 图标显性约束 */
:deep(.lucide-v), .lucide-v { width: 14px !important; height: 14px !important; stroke-width: 2.5px; }

/* 隐藏 Header 人像 */
.is-drawer-open :deep([class*="avatar"]),
.is-drawer-open :deep([class*="user"]),
.is-drawer-open :deep(.header-right) {
  opacity: 0 !important; pointer-events: none; transition: 0.4s;
}

.viewport { padding: 100px 40px; transition: 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.viewport.drawer-shift { transform: translateX(-160px); filter: brightness(0.4) blur(1px); }
.center-content { width: 100%; max-width: 1200px; margin: 0 auto; }

/* 头部 */
.workspace-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; position: relative; }
.header-left .page-title { font-family: var(--font-mono); font-size: 14px; letter-spacing: 2px; }
.header-left .count-badge { font-family: var(--font-mono); font-size: 9px; color: var(--accent-dim); margin-top: 4px; display: block; }
.header-center { position: absolute; left: 50%; transform: translateX(-50%); }
.filter-trigger {
  background: rgba(255,255,255,0.03); border: 1px solid var(--border); padding: 6px 16px; border-radius: 4px;
  color: var(--accent); font-family: var(--font-mono); font-size: 10px; display: flex; align-items: center; gap: 8px; cursor: pointer;
}

/* 网格布局 */
.audience-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.audience-card {
  background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 16px;
  cursor: pointer; transition: 0.3s;
}
.audience-card:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); }
.audience-card.is-active { border-color: #fff; background: rgba(255,255,255,0.08); }

.id-tag { font-family: var(--font-mono); font-size: 8px; color: var(--accent-dim); }
.group-name { font-size: 13px; font-weight: 600; margin: 4px 0 12px 0; }
.card-stats .val { font-family: var(--font-mono); font-size: 18px; }
.card-stats .unit { font-size: 8px; color: var(--accent-dim); margin-left: 4px; }
.card-footer-mini { margin-top: 12px; display: flex; justify-content: space-between; align-items: center; }
.status-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent-dim); }
.status-dot.active { background: #00ffaa; box-shadow: 0 0 8px #00ffaa; }
.arrow-icon { opacity: 0; }
.audience-card:hover .arrow-icon { opacity: 1; }

/* 详情抽屉 */
.detail-drawer {
  position: fixed; right: 0; top: 0; width: 440px; height: 100vh;
  background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(40px);
  border-left: 1px solid var(--border); z-index: 1000; display: flex; flex-direction: column;
}
.drawer-header { padding: 32px 32px 10px 32px; }
.close-btn { background: none; border: none; color: var(--accent-dim); cursor: pointer; margin-bottom: 20px; padding: 0; }
.drawer-title { font-size: 22px; font-weight: 600; }
.drawer-id { font-family: var(--font-mono); font-size: 10px; color: var(--accent-dim); }

/* 触达执行区 */
.reach-anchor-zone { padding: 10px 32px 24px 32px; }
.section-label { font-family: var(--font-mono); font-size: 8px; color: var(--accent-dim); letter-spacing: 1px; display: block; margin-bottom: 12px; }
.reach-btn-row { display: flex; gap: 10px; }
.reach-action-item {
  flex: 1; height: 38px; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 8px;
  color: var(--accent); cursor: pointer; transition: 0.2s;
}
.reach-action-item span { font-size: 11px; font-weight: 500; }
.reach-action-item:hover { background: #fff; color: #000; }

.center-divider {
  height: 1px; width: 100%; background: linear-gradient(90deg, transparent, var(--border), transparent); margin-bottom: 24px;
}

/* 统计面板重构 */
.drawer-content { flex: 1; overflow-y: auto; padding: 0 32px; }
.unified-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.stat-card { background: rgba(255,255,255,0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); }
.s-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
.s-label { font-size: 10px; color: var(--accent-dim); }
.s-count { font-family: var(--font-mono); font-size: 14px; font-weight: 500; }
.s-progress { height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; overflow: hidden; }
.s-bar { height: 100%; border-radius: 1px; transition: 1s cubic-bezier(0.16, 1, 0.3, 1); }

/* 颜色应用 */
.male .s-bar { background: var(--male); box-shadow: 0 0 10px var(--male); }
.female .s-bar { background: var(--female); box-shadow: 0 0 10px var(--female); }
.student .s-bar { background: var(--student); box-shadow: 0 0 10px var(--student); }
.worker .s-bar { background: var(--worker); box-shadow: 0 0 10px var(--worker); }

/* 日志样式 */
.content-section { margin-bottom: 32px; }
.section-title { font-family: var(--font-mono); font-size: 9px; color: var(--accent-dim); margin-bottom: 20px; letter-spacing: 1px; }
.custom-log-list { display: flex; flex-direction: column; gap: 14px; }
.log-entry { display: flex; gap: 14px; }
.log-indicator { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-dim); margin-top: 5px; flex-shrink: 0; }
.log-indicator.success { background: #00ffaa; box-shadow: 0 0 8px #00ffaa; }
.log-timestamp { font-family: var(--font-mono); font-size: 9px; color: var(--accent-dim); display: block; margin-bottom: 4px; }
.log-text { font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.5; }

.drawer-footer { padding: 32px; border-top: 1px solid var(--border); }
.action-btn { width: 100%; padding: 12px; background: #fff; color: #000; border: none; border-radius: 4px; font-weight: 600; font-size: 11px; cursor: pointer; }

.slide-enter-active, .slide-leave-active { transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
