<template>
  <div class="page-container">
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">图片批量处理工具</h2>
        <p class="panel-subtitle">自定义尺寸 · 高清压缩 · 批量极速处理 · 自动打包导出</p>
      </div>

      <div class="panel-body">
        <div class="section">
          <label class="label">输出方向</label>
          <div class="direction-group">
            <label class="radio-card" :class="{ active: direction === 'horizontal' }">
              <input v-model="direction" type="radio" value="horizontal" />
              <div class="radio-text">横版输出</div>
              <div class="radio-desc">宽 &gt; 高</div>
            </label>
            <label class="radio-card" :class="{ active: direction === 'vertical' }">
              <input v-model="direction" type="radio" value="vertical" />
              <div class="radio-text">竖版输出</div>
              <div class="radio-desc">高 &gt; 宽</div>
            </label>
          </div>
        </div>

        <div class="section">
          <label class="label">输出尺寸</label>
          <div class="size-group">
            <div class="input-item">
              <label>宽度 (px)</label>
              <input v-model.number="width" type="number" min="1" placeholder="4096" />
            </div>
            <div class="input-item">
              <label>高度 (px)</label>
              <input v-model.number="height" type="number" min="1" placeholder="3072" />
            </div>
          </div>
        </div>

        <div class="btn-group">
          <button @click="selectFolder" class="btn btn-secondary" :disabled="running">
            <span>选择文件夹</span>
          </button>
          <button @click="start" class="btn btn-primary" :disabled="running">
            <span>{{ running ? '处理中…' : '开始处理' }}</span>
          </button>
        </div>

        <div class="status-section" v-if="text || total > 0">
          <div class="log" v-if="text">{{ text }}</div>
          <div class="progress-wrapper" v-if="total > 0">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (current / total) * 100 + '%' }"></div>
            </div>
            <div class="progress-info">
              <span>进度：{{ current }} / {{ total }}</span>
              <span class="percentage">{{ Math.round((current / total) * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const width = ref(4096)
const height = ref(3072)
const direction = ref('horizontal')
const running = ref(false)
const text = ref('')
const files = ref([])
const total = ref(0)
const current = ref(0)

const selectFolder = () => {
  const i = document.createElement('input')
  i.type = 'file'
  i.webkitdirectory = true
  i.accept = 'image/*'
  i.onchange = (e) => {
    files.value = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    text.value = `已加载 ${files.value.length} 张图片`
  }
  i.click()
}

const start = async () => {
  if (files.value.length === 0) {
    text.value = '请先选择文件夹'
    return
  }
  if (!width.value || !height.value) {
    text.value = '请输入宽高'
    return
  }

  running.value = true
  total.value = files.value.length
  current.value = 0
  text.value = '正在处理…'

  const zip = new JSZip()

  let outW = width.value
  let outH = height.value

  if (direction.value === 'horizontal') {
    if (outW < outH) [outW, outH] = [outH, outW]
  } else {
    if (outH < outW) [outW, outH] = [outH, outW]
  }

  const batch = 6
  for (let i = 0; i < files.value.length; i += batch) {
    const tasks = files.value.slice(i, i + batch).map(async file => {
      try {
        const blob = await process(file, outW, outH)
        zip.file(file.name.replace(/\.\w+$/, '.jpg'), blob)
        current.value++
      } catch (e) {}
    })
    await Promise.all(tasks)
  }

  text.value = '正在打包…'
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
  saveAs(zipBlob, `图片处理结果_${outW}x${outH}.zip`)

  text.value = '处理完成，压缩包已下载'
  running.value = false
}

const process = (file, w, h) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(resolve, 'image/jpeg', 0.94)
    }
    img.src = URL.createObjectURL(file)
  })
}
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.panel {
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 1px 0 rgba(30, 41, 59, 0.02), 0 2px 8px rgba(30, 41, 59, 0.04);
}

.panel::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2563eb 0%, #0891b2 100%);
}

.panel-head {
  padding: 20px 24px 18px;
  border-bottom: 1px solid #eff6ff;
  position: relative;
}

.panel-title {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
  line-height: 1.4;
  letter-spacing: 0.2px;
}

.panel-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.panel-body {
  padding: 24px;
}

.section {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
  letter-spacing: 0.2px;
}

.direction-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.radio-card {
  position: relative;
  cursor: pointer;
  padding: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  text-align: center;
  background: #f8fafc;
  transition: border-color 120ms linear, background 120ms linear;
}

.radio-card input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-card:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.radio-card.active {
  border-color: #2563eb;
  background: #dbeafe;
  box-shadow: inset 0 0 0 1px #2563eb;
}

.radio-text {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}

.radio-desc {
  font-size: 12px;
  color: #64748b;
}

.size-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-item label {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.input-item input {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  transition: border-color 120ms linear, box-shadow 120ms linear;
}

.input-item input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.btn-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.2px;
  transition: background 120ms linear, border-color 120ms linear, color 120ms linear;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.btn-secondary {
  background: #ffffff;
  color: #1e40af;
  border-color: #93c5fd;
}

.btn-secondary:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #2563eb;
}

.status-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.log {
  color: #1e3a8a;
  font-size: 13px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #eff6ff;
  border-radius: 6px;
  border-left: 3px solid #2563eb;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb 0%, #0891b2 100%);
  border-radius: 999px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.percentage {
  font-weight: 700;
  color: #1d4ed8;
}

@media (max-width: 640px) {
  .panel-head {
    padding: 16px 20px 14px;
  }
  .panel-body {
    padding: 20px;
  }
  .btn-group {
    grid-template-columns: 1fr;
  }
}
</style>
