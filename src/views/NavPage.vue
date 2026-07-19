<template>
  <div class="page">
    <!-- 上传区域 -->
    <div class="upload-box">
      <input type="file" accept=".xlsx,.xls,.csv" @change="handleUpload" />
      <button @click="exportDocument" :disabled="cardList.length === 0">导出文档</button>
      <div class="style-switcher">
        <span class="switcher-label">当前风格：</span>
        <button class="style-btn" :class="{ active: currentStyle === 0 }" @click="currentStyle = 0">
          经典风格
        </button>
        <button class="style-btn" :class="{ active: currentStyle === 1 }" @click="currentStyle = 1">
          极简风格
        </button>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="card-list">
      <div
        :class="['card', `card-style-${currentStyle}`]"
        v-for="(item, idx) in cardList"
        :key="idx"
      >
        <div class="content">
          <div class="header">
            <div class="header-left">
              <div class="car-icon">
                <img src="/car-icon.png" class="car-icon-img" />
              </div>
              <div class="time-text">{{ item.time }}</div>
            </div>
          </div>

          <hr class="separator" />

          <div class="route">
            <div class="line-group">
              <div class="dot start"></div>
              <div class="dot end"></div>
            </div>
            <div class="route-texts">
              <div class="start-text">{{ item.start }}</div>
              <div class="end-text">{{ item.end }}</div>
            </div>
          </div>

          <div class="stats">
            <div class="stat-item">
              <div class="value">{{ item.distance }}<span class="unit">km</span></div>
              <div class="label">导航里程</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ formatExcelTime(item.duration) }}</div>
              <div class="label">驾驶时长</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ item.avgSpeed }}<span class="unit">km/h</span></div>
              <div class="label">平均速度</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ item.maxSpeed }}<span class="unit">km/h</span></div>
              <div class="label">最快速度</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import { Document, Packer, PageBreak, ImageRun, Paragraph, VerticalAlign, TextRun } from 'docx'
import { saveAs } from 'file-saver'

const cardList = ref([])
const currentStyle = ref(0)

const cardStyles = {
  0: 'card-style-0',
  1: 'card-style-1',
}

// 核心：将 Excel 小数时间（0.5425）转为 HH:mm:ss 格式
const formatExcelTime = (value: string | number | null | undefined) => {
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

// 从时间字符串中提取日期（例如："2024/5/26 14:30" -> "5月26号"）
const extractDate = (timeStr: string): string => {
  if (!timeStr) return '未知日期'

  // 尝试匹配各种日期格式
  const datePatterns = [
    /(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/, // 2024/5/26、2024-5-26、2024.5.26
    /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/, // 5/26/2024、5-26-2024、5.26.2024
  ]

  let match = null
  for (const pattern of datePatterns) {
    match = timeStr.match(pattern)
    if (match) break
  }

  if (match) {
    const month = match[2]
    const day = match[3]
    return `${month}月${day}号`
  }

  // 如果无法解析，返回原始字符串的前10个字符
  return timeStr.substring(0, 10) || '未知日期'
}

// 上传Excel并解析
const handleUpload = (e: { target: { files: any[] } }) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const wb = XLSX.read(ev.target.result, {
      type: 'binary',
      cellText: true,
      cellDates: false,
    })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(ws)
    cardList.value = data.map((row) => ({
      time: row['时间'] || '',
      start: row['起点'] || '',
      end: row['终点'] || '',
      distance: row['导航里程'] || '0',
      duration: row['驾驶时长'] || '',
      avgSpeed: row['平均速度'] || '0',
      maxSpeed: row['最快速度'] || '0',
    }))
  }
  reader.readAsBinaryString(file)
}

// 导出文档（生成 Word 文档）
const exportDocument = async () => {
  const styleSuffix = currentStyle.value === 0 ? '经典风格' : '极简风格'
  const cardElements = document.querySelectorAll(`.${cardStyles[currentStyle.value]}`)
  const cardData = []

  // 收集卡片数据和对应的日期
  for (let i = 0; i < cardElements.length; i++) {
    const el = cardElements[i]
    const rect = el.getBoundingClientRect()
    const canvas = await html2canvas(el, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
      width: rect.width,
      height: rect.height,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    })
    const imageData = canvas.toDataURL('image/png')

    // 从 cardList 中获取对应的日期
    const dateStr = cardList.value[i]?.time || ''
    const date = extractDate(dateStr)

    cardData.push({
      imageData,
      width: canvas.width,
      height: canvas.height,
      date: date,
      originalIndex: i,
    })
  }

  // 按日期分组
  const groupedByDate = {}
  cardData.forEach((card) => {
    if (!groupedByDate[card.date]) {
      groupedByDate[card.date] = []
    }
    groupedByDate[card.date].push(card)
  })

  // 构建文档内容（所有卡片按顺序排列，每页2张）
  const children = []
  const margin = 720 // Word 中的 twips 单位（1/1440英寸）

  const pageContentWidthPx = 595 // A4 页面宽度（像素）
  const pageContentHeightPx = 842 // A4 页面高度（像素）

  // 计算单张卡片最大高度：页面可用高度 - 标题高度 - 卡片间距，然后除以2
  // 注意：margin 是 Word 的边距设置，不影响这里的像素计算
  const titleHeight = 40 // 标题占用高度（像素）- 减小以留出更多空间给卡片
  const cardGap = 50 // 两张卡片之间的间距（像素）
  const availableHeight = pageContentHeightPx - titleHeight - cardGap // 去除标题和间距后的可用高度
  const singleCardHeightPx = Math.floor(availableHeight / 2) // 每张卡片的高度（均分）

  // 将所有卡片展平为一个数组，保持原有顺序
  const allCards = []
  Object.keys(groupedByDate).forEach((dateKey) => {
    groupedByDate[dateKey].forEach((card) => {
      allCards.push({
        ...card,
        date: dateKey, // 保留日期信息用于生成标题
      })
    })
  })

  // 遍历所有卡片，每张卡片都添加标题（如果与上一张日期不同）和卡片本身
  let previousDate = null // 记录上一张卡片的日期
  let cardsInCurrentPage = 0 // 当前页的卡片数量

  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i]
    const currentCardDate = card.date

    // 判断是否需要添加标题：第一张卡片，或者与上一张日期不同
    const needTitle = previousDate === null || currentCardDate !== previousDate

    // 如果需要添加标题，且当前页已经有2张卡片了，先添加分页符
    if (needTitle && cardsInCurrentPage >= 2) {
      children.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
      )
      cardsInCurrentPage = 0 // 重置当前页卡片计数
    }

    // 如果需要添加标题，则添加标题
    if (needTitle) {
      const titleText = `${currentCardDate}导航图`
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: titleText,
              bold: true, // 加粗
              size: 32, // 16pt (docx中size单位是半点，所以16*2=32)
              font: 'Microsoft YaHei', // 使用微软雅黑字体
              spacing: {
                characterSpacing: 240, // 12pt字间距 (docx中单位是twips，1pt=20twips，所以12*20=240)
              },
            }),
          ],
          alignment: 'left', // 靠左对齐
          spacing: {
            before: 0,
            after: 150, // 标题下方间距
          },
        }),
      )
    }

    // 添加卡片图片
    const imgData = card.imageData.split(',')[1]
    const aspectRatio = card.width / card.height

    // 固定卡片高度为均分值
    const height = singleCardHeightPx
    let width = Math.round(height * aspectRatio)

    // 如果宽度超过页面宽度，则按页面宽度缩放，但保持高度不变
    if (width > pageContentWidthPx) {
      width = pageContentWidthPx
      // 保持高度固定，让图片在段落内自适应显示
    }

    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: Uint8Array.from(atob(imgData), (c) => c.charCodeAt(0)),
            transformation: {
              width: Math.min(Math.round(width), pageContentWidthPx), // 限制最大宽度
              height: Math.round(height), // 保持固定高度
            },
            type: 'png',
          }),
        ],
        alignment: 'left', // 靠左对齐
        spacing: {
          before: 0,
          after: cardsInCurrentPage === 0 ? cardGap : 0, // 第一张卡片下方添加间距
        },
      }),
    )

    // 更新状态
    previousDate = currentCardDate
    cardsInCurrentPage++
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: margin,
              right: margin,
              bottom: margin,
              left: margin,
            },
            verticalAlign: VerticalAlign.CENTER,
          },
        },
        children: children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `导航轨迹卡片_${styleSuffix}.docx`)
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
  box-shadow:
    0 1px 0 rgba(30, 41, 59, 0.02),
    0 2px 8px rgba(30, 41, 59, 0.04);
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

.upload-box input[type='file'] {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color 120ms linear,
    background 120ms linear;
}

.upload-box input[type='file']:hover {
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
  transition:
    background 120ms linear,
    border-color 120ms linear;
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
  transition:
    background 120ms linear,
    border-color 120ms linear,
    color 120ms linear;
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

/* 卡片主体 - 经典风格 */
.card {
  border-radius: 0;
  padding: 24px;
  width: 505px;
  height: 320px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.card-style-0 {
  background: #10192a;
}

/* 卡片主体 - 极简风格 */
.card-style-1 {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

/* 头部：图标 + 时间 */
.header {
  display: flex;
  align-items: center;
  margin: 0 0 -8px;
  justify-content: flex-start;
}

.separator {
  /* 粗细、颜色、长度自定义 */
  height: 1px;
  background: #212b3a;
  border: none;
  margin: 20px 0;
  width: 493px;
  margin-left: -12px;
}

.card-style-1 .header {
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.car-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  margin-left: -12px;
  flex-shrink: 0;
}

.card-style-1 .car-icon {
  background: #1e40af;
}

.car-icon-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-left: -7px;
  filter: none;
}

.card-style-1 .car-icon-img {
  filter: brightness(0) invert(1);
}

.time-text {
  font-size: 26px;
  color: #99a3b4;
  margin-left: -15px;
}

.card-style-1 .time-text {
  color: #475569;
}

/* 路线：起点/终点 + 连线 */
.route {
  display: flex;
  align-items: center;
  margin-bottom: 50px;
  margin-top: 43px;
}

.line-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
}

.dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
}
.start {
  background: #22c55e;
}
.end {
  background: #ef4444;
  margin-top: 31px;
}

.line {
  width: 3px;
  height: 36px;
  background: #4a90e2;
  margin: 2px 0;
}

.route-texts {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-left: 23px;
  letter-spacing: 3px;
}

.start-text,
.end-text {
  font-size: 25px;
  font-family: 'Microsoft YaHei', sans-serif;
  font-weight: 400;
  line-height: 1;
  display: flex;
  align-items: center;
}

.card-style-0 .start-text,
.card-style-0 .end-text {
  color: #ffffff;
}

.card-style-1 .start-text,
.card-style-1 .end-text {
  color: #1e293b;
}

.end-text {
  margin-top: 12px;
}

/* 统计数据区域 */
.stats {
  display: flex;
  justify-content: space-between;
  text-align: center;
  margin-left: -5px;
  width: 480px;
  background: transparent;
  padding: 0;
  margin-top: 0;
  gap: 8px;
  letter-spacing: 1px;
}

.stat-item {
  flex: 1;
  margin-left: -24px;
  display: block;
  align-items: center;
  padding: 0 4px;
}

.value {
  font-size: 24px;
  font-weight: 600;
  display: inline-flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.card-style-0 .value {
  color: #fff;
}

.card-style-1 .value {
  color: #1e293b;
}

.unit {
  font-size: 18px;
  color: #99a3b4;
  margin-left: 3px;
  font-weight: 400;
}

.card-style-1 .unit {
  color: #64748b;
}

.label {
  font-size: 18px;
  color: #99a3b4;
  margin-top: 0;
  font-weight: 400;
  letter-spacing: 2px;
}

.card-style-1 .label {
  color: #64748b;
}
.content {
  height: 253px;
  margin-top: -16px;
}
</style>
