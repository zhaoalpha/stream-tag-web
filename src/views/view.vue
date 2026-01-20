<script setup lang="ts">
import { ref } from 'vue'
import MainHeader from '@/components/MainHeader.vue'
import { Users, MousePointerClick, LayoutDashboard, Banknote, Activity } from 'lucide-vue-next'

// 1. 差异化指标数据
const summaryStats = [
  { label: 'TOTAL REACH / 累计覆盖人数', value: '89,500', icon: Users, color: '#00ffaa' },
  { label: 'AVG CTR / 平均点击率', value: '10.82%', icon: MousePointerClick, color: '#00d4ff' },
  { label: 'ACTIVE SEGMENTS / 活跃分群数', value: '12', icon: LayoutDashboard, color: '#a855f7' },
  { label: 'TOTAL GMV / 累计总营收', value: '¥ 7,066,680', icon: Banknote, color: '#ffbf00' }
]

// 2. 表格数据（去掉了健康度状态）
const segments = ref([
  { name: '高风险流失', system: '外呼系统', group: '实验组', users: '12,400', reach: '100%', ctr: '12.30%', cvr: '0.89%', gmv: '¥2,569,000' },
  { name: '高风险流失', system: '短信系统', group: '对照组', users: '13,500', reach: '100%', ctr: '10.30%', cvr: '0.68%', gmv: '¥1,580,000' },
  { name: '沉睡用户唤回', system: '外呼系统', group: '对照组', users: '25,800', reach: '89%', ctr: '11.30%', cvr: '3.68%', gmv: '¥678,900' },
  { name: '沉睡用户唤回', system: '短信系统', group: '实验组', users: '24,900', reach: '90%', ctr: '9.30%', cvr: '2.89%', gmv: '¥658,780' },
  { name: '美妆护肤品类', system: '广告投放', group: '-', users: '24,900', reach: '100%', ctr: '10.30%', cvr: '5.60%', gmv: '¥1,580,000' },
  { name: '逾期高风险', system: '广告投放', group: '-', users: '13,500', reach: '100%', ctr: '-', cvr: '-', gmv: '-' },
])
</script>

<template>
  <div class="big-screen-container">
    <main class="dashboard-body">
      <section class="stat-grid">
        <div class="stat-card" v-for="(stat, idx) in summaryStats" :key="idx">
          <div class="stat-info">
            <span class="label">{{ stat.label }}</span>
            <span class="value" :style="{ color: stat.color }">{{ stat.value }}</span>
          </div>
          <div class="icon-box" :style="{ backgroundColor: stat.color + '15' }">
            <component :is="stat.icon" :style="{ color: stat.color }" :size="24" />
          </div>
        </div>
      </section>

      <section class="data-matrix-container">
        <div class="matrix-header">
          <Activity :size="14" class="pulse-icon" />
          <span>REAL-TIME SEGMENTATION ANALYSIS / 实时分群监测矩阵</span>
        </div>

        <div class="table-wrapper">
          <table class="cyber-table">
            <thead>
            <tr>
              <th>人群名称 / SEGMENT NAME</th>
              <th>应用系统</th>
              <th>实验分组</th>
              <th>人群包数</th>
              <th>触达率</th>
              <th>曝光点击率</th>
              <th>支付转化率</th>
              <th>有效GMV</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, idx) in segments" :key="idx">
              <td class="name-cell">{{ item.name }}</td>
              <td><span class="system-tag">{{ item.system }}</span></td>
              <td class="group-cell">{{ item.group }}</td>
              <td class="mono">{{ item.users }}</td>
              <td>
                <div class="progress-mini">
                  <div class="fill" :style="{ width: item.reach }"></div>
                  <span class="p-text">{{ item.reach }}</span>
                </div>
              </td>
              <td class="mono color-cyan">{{ item.ctr }}</td>
              <td class="mono">{{ item.cvr }}</td>
              <td class="mono color-gold">{{ item.gmv }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.big-screen-container {
  min-height: 100vh;
  background: #050505;
  background-image:
    radial-gradient(circle at 50% 0%, rgba(0, 255, 170, 0.05) 0%, transparent 50%),
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px, 40px 40px;
  color: #fff;
}

.dashboard-body {
  padding: 30px;
  max-width: 1600px;
  margin: 0 auto;
}

/* --- 指标卡片优化 --- */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
}

.stat-card .label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
}

.stat-card .value {
  display: block;
  font-size: 28px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  margin-top: 6px;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- 表格区域优化 --- */
.data-matrix-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
}

.matrix-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #00ffaa;
  margin-bottom: 24px;
  letter-spacing: 1px;
}

.pulse-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

.cyber-table {
  width: 100%;
  border-collapse: collapse;
}

.cyber-table th {
  text-align: left;
  padding: 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-transform: uppercase;
}

.cyber-table td {
  padding: 18px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.8);
}

.name-cell { color: #fff !important; font-weight: 600; }
.mono { font-family: 'JetBrains Mono', monospace; font-size: 14px; }
.color-cyan { color: #00d4ff; }
.color-gold { color: #ffbf00; }

.system-tag {
  font-size: 10px;
  padding: 2px 6px;
  border: 1px solid rgba(0, 255, 170, 0.2);
  color: #00ffaa;
  border-radius: 4px;
}

.progress-mini {
  width: 80px;
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
}
.progress-mini .fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffaa, #00d4ff);
}
.p-text {
  position: absolute;
  left: 85px;
  top: -6px;
  font-size: 10px;
  font-family: monospace;
}
</style>
