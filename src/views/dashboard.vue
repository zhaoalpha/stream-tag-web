<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Activity, Clock, Users, Zap, DollarSign, ChevronRight, TrendingUp } from 'lucide-vue-next'

// --- 1. 实时时钟逻辑 ---
const currentTime = ref(new Date().toLocaleString())
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)
})
onUnmounted(() => clearInterval(timer))

// --- 2. 统计汇总数据 (来自你的样式设计) ---
const summaryStats = [
  { label: '总触达人数', value: '115,000', trend: 12.5, prefix: '' },
  { label: '平均转化率', value: '3.42', trend: 2.1, prefix: '%' },
  { label: '总有效营收', value: '8.65M', trend: 8.4, prefix: '¥' },
]

// --- 3. 业务明细数据 (你的展示数据) ---
const rawData = [
  {
    segmentName: '高风险流失用户',
    system: '外呼系统',
    group: '实验组',
    userCount: 12400,
    ctr: '12.3%',
    cvr: '0.89%',
    gmv: 2569000,
  },
  {
    segmentName: '高风险流失用户',
    system: '短信系统',
    group: '对照组',
    userCount: 13500,
    ctr: '10.3%',
    cvr: '0.68%',
    gmv: 1580000,
  },
  {
    segmentName: '沉睡用户唤回群',
    system: '外呼系统',
    group: '对照组',
    userCount: 25800,
    ctr: '11.3%',
    cvr: '3.68%',
    gmv: 678900,
  },
  {
    segmentName: '沉睡用户唤回群',
    system: '短信系统',
    group: '实验组',
    userCount: 24900,
    ctr: '9.3%',
    cvr: '2.89%',
    gmv: 658780,
  },
  {
    segmentName: '美妆护肤偏好人群',
    system: '广告投放',
    group: null,
    userCount: 24900,
    ctr: '10.3%',
    cvr: '5.60%',
    gmv: 1580000,
  },
  {
    segmentName: '逾期高风险人群',
    system: '广告投放',
    group: null,
    userCount: 13500,
    ctr: '10.3%',
    cvr: '5.60%',
    gmv: 1580000,
  },
]

const formatNumber = (n: any) => (n ? n.toLocaleString() : '0')
</script>

<template>
  <div class="aether-container">
    <header class="common-header">
      <div class="header-left">
        <div class="logo-text">QUANTGROUP</div>
        <div class="system-status">
          <span class="status-dot"></span>
          COMMAND CENTER ACTIVE
        </div>
      </div>

      <div class="header-center">
        <div class="main-title">全域分群运营实时指挥舱</div>
        <div class="sub-title">REAL-TIME DATA ANALYSIS ENGINE</div>
      </div>

      <div class="header-right">
        <div class="time-box">
          <Clock :size="14" />
          <span>{{ currentTime }}</span>
        </div>
      </div>
    </header>

    <div class="ambient-glow"></div>
    <div class="grid-overlay"></div>

    <main class="viewport">
      <div class="center-content">
        <section class="stats-overview">
          <div v-for="stat in summaryStats" :key="stat.label" class="stat-card">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-main">
              <div class="stat-value">
                <span class="unit">{{ stat.prefix }}</span
                >{{ stat.value }}
              </div>
              <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
              </div>
            </div>
          </div>
        </section>

        <div class="glass-panel main-panel">
          <div class="panel-header-inner">
            <Activity :size="16" class="header-icon" />
            <div class="header-text">
              <div class="panel-title">分群效果分析明细</div>
              <div class="panel-subtitle">DETAILED PERFORMANCE METRICS</div>
            </div>
          </div>

          <div class="aether-table">
            <div class="table-row header-row">
              <div class="col-name">分群信息</div>
              <div class="col-link">链路 / 分组</div>
              <div class="col-user text-right">用户规模</div>
              <div class="col-funnel">转化路径 (CTR / CVR)</div>
              <div class="col-gmv text-right">有效 GMV</div>
            </div>

            <div v-for="(row, idx) in rawData" :key="idx" class="table-row data-row">
              <div class="col-name">
                <div class="name-main">{{ row.segmentName }}</div>
                <div class="name-sub">#{{ 1024 + idx }}</div>
              </div>

              <div class="col-link">
                <div class="sys-text">{{ row.system }}</div>
                <div
                  v-if="row.group"
                  :class="['mini-badge', row.group === '实验组' ? 'exp' : 'ctrl']"
                >
                  {{ row.group }}
                </div>
                <div v-else class="null-text">全量投放</div>
              </div>

              <div class="col-user cell-mono text-right highlight">
                {{ formatNumber(row.userCount) }}
              </div>

              <div class="col-funnel funnel-cell">
                <div class="funnel-metrics">
                  <span>{{ row.ctr || '0%' }} <small>CTR</small></span>
                  <span class="cvr-text">{{ row.cvr || '0%' }} <small>CVR</small></span>
                </div>
                <div class="funnel-viz">
                  <div class="bar ctr-bar" :style="{ width: row.ctr }"></div>
                  <div class="bar cvr-bar" :style="{ width: row.cvr }"></div>
                </div>
              </div>

              <div class="col-gmv cell-mono text-right gmv-cell">
                <span class="currency">¥</span>{{ formatNumber(row.gmv) }}
              </div>
            </div>
          </div>

          <div class="panel-footer">
            <div class="footer-left">
              <span>ACTIVE_SEGMENTS: {{ rawData.length }}</span>
              <span class="footer-divider"></span>
              <span>LIVE_SYNC_READY</span>
            </div>
            <span class="spacer"></span>
            <div class="engine-tag">AETHER_ENGINE_v1.0</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 引用你喜欢的字体 */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.aether-container {
  --bg: #030303;
  --card-border: rgba(255, 255, 255, 0.08);
  --accent-blue: #4d7fff;
  --accent-green: #00ffaa;
  --font-mono: 'JetBrains Mono', monospace;
  background: var(--bg);
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

/* --- 公共 Header 样式 --- */
.common-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  height: 80px;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(3, 3, 3, 0.8);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
}
.logo-text {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 2px;
}
.system-status {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.status-dot {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px #fff;
  animation: blink 2s infinite;
}

.header-center {
  text-align: center;
}
.main-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 8px;
  margin-bottom: 2px;
}
.sub-title {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 2px;
}
.time-box {
  font-family: var(--font-mono);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 装饰细节 */
.ambient-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% -10%, rgba(77, 127, 255, 0.05) 0%, transparent 40%);
  pointer-events: none;
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}

.viewport {
  position: relative;
  height: 100%;
  padding: 100px 20px 20px;
  display: flex;
  flex-direction: column;
  z-index: 1;
  box-sizing: border-box;
}

.center-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 统计卡片样式 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}
.stat-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--card-border);
  padding: 16px 20px;
  border-radius: 12px;
}
.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.stat-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  font-family: var(--font-mono);
}
.stat-trend {
  font-size: 11px;
  font-family: var(--font-mono);
}
.stat-trend.up {
  color: var(--accent-green);
}
.stat-trend.down {
  color: #ff4d4d;
}
.unit {
  font-size: 14px;
  color: var(--accent-blue);
  margin-right: 2px;
}

/* 玻璃面板 */
.glass-panel {
  background: rgba(10, 10, 10, 0.4);
  backdrop-filter: blur(30px);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}
.panel-subtitle {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3);
  font-family: var(--font-mono);
}

/* 表格细节 */
.table-row {
  display: flex;
  align-items: center;
  padding: 14px 10px;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.header-row {
  padding: 8px 10px 12px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  border-bottom: 1px solid var(--card-border);
}

.col-name {
  flex: 1.5;
}
.col-link {
  flex: 1;
}
.col-user {
  flex: 0.8;
}
.col-funnel {
  flex: 2;
}
.col-gmv {
  flex: 1;
}

.name-main {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}
.name-sub {
  font-size: 9px;
  opacity: 0.3;
  font-family: var(--font-mono);
  margin-top: 2px;
}

.sys-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}
.mini-badge {
  display: inline-block;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
}
.mini-badge.exp {
  color: var(--accent-green);
  background: rgba(0, 255, 170, 0.1);
}

.funnel-metrics {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 10px;
  margin-bottom: 6px;
}
.funnel-viz {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  position: relative;
}
.bar {
  position: absolute;
  height: 100%;
  border-radius: 2px;
  transition: width 1s ease;
}
.ctr-bar {
  background: var(--accent-blue);
  opacity: 0.6;
}
.cvr-bar {
  background: var(--accent-green);
}

.gmv-cell {
  font-weight: 700;
  color: var(--accent-green);
  font-size: 17px;
}
.cell-mono {
  font-family: var(--font-mono);
}
.text-right {
  text-align: right;
}

.panel-footer {
  margin-top: auto;
  padding-top: 15px;
  display: flex;
  align-items: center;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.2);
  font-family: var(--font-mono);
}
.footer-divider {
  width: 1px;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 10px;
}
.spacer {
  flex: 1;
}
.engine-tag {
  color: var(--accent-blue);
  opacity: 0.5;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
