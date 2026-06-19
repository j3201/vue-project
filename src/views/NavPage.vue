<template>
  <div class="page">
    <!-- 上传区域 -->
    <div class="upload-box">
      <input type="file" accept=".xlsx,.xls,.csv" @change="handleUpload" />
      <button @click="downloadAll" :disabled="cardList.length === 0">
        打包下载所有卡片
      </button>
      <div class="style-switcher">
        <span class="switcher-label">卡片样式：</span>
        <button 
          v-for="(style, index) in cardStyles" 
          :key="index"
          :class="['style-btn', { active: currentStyle === index }]"
          @click="currentStyle = index"
        >
          {{ style.name }}
        </button>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="card-list">
      <div 
        :class="['card', currentStyle === 0 ? 'card-style-0' : 'card-style-1']" 
        v-for="(item, idx) in cardList" 
        :key="idx"
      >
        <div class="header">
          <div class="header-left">
            <div class="car-icon">
              <img src="/car-icon.png" alt="汽车图标" class="car-icon-img" />
            </div>
            <div class="time-text">{{ item.time }}</div>
          </div>
          <div v-if="currentStyle === 0" class="car-icon-port">
            <span class="dot-port"></span>
            <span class="dot-port"></span>
            <span class="dot-port"></span>
          </div>
        </div>

        <div class="route">
          <div class="line-group">
            <div class="dot start"></div>
            <div class="line"></div>
            <div class="dot end"></div>
          </div>
          <div class="route-texts">
            <div class="start-text">{{ item.start }}</div>
            <div class="end-text">{{ item.end }}</div>
          </div>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div class="value">
              {{ item.distance }}<span class="unit">km</span>
            </div>
            <div class="label">导航里程</div>
          </div>
          <div class="stat-item">
            <div class="value">{{ formatExcelTime(item.duration) }}</div>
            <div class="label">驾驶时长</div>
          </div>
          <div class="stat-item">
            <div class="value">
              {{ item.avgSpeed }}<span class="unit">km/h</span>
            </div>
            <div class="label">平均速度</div>
          </div>
          <div class="stat-item">
            <div class="value">
              {{ item.maxSpeed }}<span class="unit">km/h</span>
            </div>
            <div class="label">最快速度</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const cardList = ref([])
const currentStyle = ref(0)

const cardStyles = [
  { name: '经典风格' },
  { name: '极简风格' }
]

// 核心：将 Excel 小数时间（0.5425）转为 HH:mm:ss 格式
const formatExcelTime = (value) => {
  if (isNaN(value) || value === '' || value === null || value === undefined) {
    return value
  }
  const dayFraction = parseFloat(value)
  const totalSeconds = Math.round(dayFraction * 24 * 60 * 60)
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const h = String(hours).padStart(2, '0')
  const m = String(minutes).padStart(2, '0')
  const s = String(seconds).padStart(2, '0')

  return `${h}:${m}:${s}`
}

// 上传Excel并解析
const handleUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const wb = XLSX.read(ev.target.result, {
      type: 'binary',
      cellText: true,
      cellDates: false
    })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(ws)
    cardList.value = data.map(row => ({
      time: row['时间'] || '',
      start: row['起点'] || '',
      end: row['终点'] || '',
      distance: row['导航里程'] || '0',
      duration: row['驾驶时长'] || '',
      avgSpeed: row['平均速度'] || '0',
      maxSpeed: row['最快速度'] || '0'
    }))
  }
  reader.readAsBinaryString(file)
}

// 打包下载所有卡片
const downloadAll = async () => {
  const zip = new JSZip()
  cardList.value.forEach((item, i) => {
    const content = `
【轨迹卡片 ${i+1}】
时间：${item.time}
起点：${item.start}
终点：${item.end}
导航里程：${item.distance}km
驾驶时长：${formatExcelTime(item.duration)}
平均速度：${item.avgSpeed}km/h
最快速度：${item.maxSpeed}km/h
`
    zip.file(`轨迹卡片_${i+1}.txt`, content)
  })
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, '轨迹卡片合集.zip')
}
</script>

<style scoped>
/* 页面容器：工作台画布 - 顶部暖光→底部冷灰 */
.page {
  background:
    radial-gradient(ellipse at 30% -10%, #fbfbf9 0%, transparent 55%),
    radial-gradient(ellipse at 100% 100%, #d8dee9 0%, transparent 55%),
    linear-gradient(180deg, #f5f6f8 0%, #e5e7eb 100%);
  background-color: #eef1f5;
  min-height: 100vh;
  padding: 24px 20px;
  box-shadow:
    inset 8px 0 16px -12px rgba(15, 23, 42, 0.25),
    inset 0 8px 16px -12px rgba(15, 23, 42, 0.15);
}

/* 上传区域：白底卡片 + 顶部渐变色条 */
.upload-box {
  max-width: 760px;
  margin: 0 auto 24px;
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  padding: 20px;
  color: #0f172a;
  position: relative;
  box-shadow: 0 1px 0 rgba(30, 41, 59, 0.02), 0 2px 8px rgba(30, 41, 59, 0.04);
}

.upload-box::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2563eb 0%, #0891b2 100%);
  border-radius: 8px 8px 0 0;
}

.upload-box input[type="file"] {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 120ms linear, background 120ms linear;
}

.upload-box input[type="file"]:hover {
  border-color: #2563eb;
  background: #ffffff;
}

.upload-box button {
  padding: 8px 14px;
  margin: 0 6px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
  letter-spacing: 0.2px;
  transition: background 120ms linear, border-color 120ms linear;
}

.upload-box button:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.upload-box button:disabled {
  background: #94a3b8;
  border-color: #94a3b8;
  color: #f1f5f9;
  cursor: not-allowed;
}

/* 样式切换器 */
.style-switcher {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.switcher-label {
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-right: 8px;
}

.style-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #93c5fd;
  background: #ffffff;
  color: #1e40af;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: background 120ms linear, border-color 120ms linear, color 120ms linear;
}

.style-btn:hover {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1d4ed8;
}

.style-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

/* 卡片容器（仅改容器，不改内部卡片样式） */
.card-list {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 卡片主体 - 完全还原设计图 */
.card {
  background: #3b4254;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 头部：图标 + 时间 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  margin-bottom: 10px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.car-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: -12px;
}

.car-icon-img {
  width: 50px;
  height: 50px;
}

.car-icon-port {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 70px;
  height: 48px;
  border: 1.5px solid #5a6178;
  border-radius: 20px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.car-icon-port:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #7a8198;
}

.car-icon-port .dot-port {
  width: 7px;
  height: 8px;
  background: lch(99.53% 0.86 236.47);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.car-icon-port:hover .dot-port {
  background: #b0b5c5;
}

.time-text {
  font-size: 26px;
  color: #99a3b4;
  font-weight: 400;
}

/* 路线：起点/终点 + 连线 */
.route {
  display: flex;
  align-items: flex-start;
  margin-bottom: 36px;
}

.line-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
  padding-top: 6px;
}

.dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.start { background: #22c55e; }
.end { background: #ef4444; }

.line {
  width: 2px;
  height: 42px;
  background: #60a5fa;
  margin: 4px 0;
}

.route-texts {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-left: 8px
}

.start-text,
.end-text {
  font-size: 26px;
  color: #f9f7f7;
  font-family: "Microsoft YaHei", sans-serif;
  font-weight: 400;
  line-height: 1.2;
}

/* 统计数据区域 */
.stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: #3e4554;
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: auto;
}

.stat-item {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.value {
  font-size: 26px;
  font-weight: 600;
  color: #fff;
  display: inline-flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.unit {
  font-size: 18px;
  color: #99a3b4;
  margin-left: 3px;
}

.label {
  font-size: 16px;
  color: #99a3b4;
  margin-top: 0;
}

/* 卡片风格 1: 经典风格 (默认) */
.card-style-0 {
  background: #3b4254;
  border-radius: 20px;
  padding: 32px;
}

.card-style-0 .stats {
  background: #3e4554;
}

/* 卡片风格 2: 极简风格 */
.card-style-1 {
  background: #36415f;
  border-radius: 0;
  padding: 24px;
  width: 620px;
}

.card-style-1 .header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #5e5e5e9a;
  padding-bottom: 16px;
  justify-content: flex-start;
}

.card-style-1 .car-icon {
  width: 48px;
  height: 48px;
  background: #36415f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  margin-left: 0;
  flex-shrink: 0;
}

.card-style-1 .car-icon-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-left: -22px;
  filter: none;
}

.card-style-1 .time-text {
  font-size: 26px;
  color: #99a3b4;
}

.card-style-1 .route {
  display: flex;
  align-items: center;
  margin-bottom: 34px;
  margin-top: 15px;
}

.card-style-1 .line-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
}

.card-style-1 .dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.card-style-1 .line {
  width: 3px;
  height: 36px;
  background: #4a90e2;
  margin: 2px 0;
}

.card-style-1 .route-texts {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-left: 6px;
  letter-spacing: 3px;
}

.card-style-1 .start-text,
.card-style-1 .end-text {
  font-size: 25px;
  color: #ffffff;
  font-family: "Microsoft YaHei", sans-serif;
  font-weight: 400;
  line-height: 1;
  display: flex;
  align-items: center;
}

.card-style-1 .end-text {
  margin-top: 12px;
}

.card-style-1 .stats {
  display: flex;
  justify-content: space-between;
  text-align: center;
  margin-left: 28px;
  width: 600px;
  background: transparent;
  padding: 0;
  margin-top: 0;
  gap: 8px;
}

.card-style-1 .stat-item {
  flex: 1;
  margin-left: -90px;
  display: block;
  align-items: center;
  padding: 0 4px;
}

.card-style-1 .value {
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  display: inline-flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.card-style-1 .unit {
  font-size: 18px;
  color: #99a3b4;
  margin-left: 3px;
  font-weight: 400;
}

.card-style-1 .label {
  font-size: 16px;
  color: #99a3b4;
  margin-top: 0;
  font-weight: 400;
}
</style>
