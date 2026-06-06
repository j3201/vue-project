<template>
  <div class="image-page">
    <div class="card">
      <div class="card-header">
        <h2 class="title">🖼️ 图片批量处理工具</h2>
        <p class="subtitle">自定义尺寸 | 高清压缩 | 批量极速处理 | 自动打包导出</p>
      </div>

      <div class="card-body">
        <div class="section">
          <label class="section-label">输出方向</label>
          <div class="direction-group">
            <label class="radio-card" :class="{ active: direction === 'horizontal' }">
              <input v-model="direction" type="radio" value="horizontal" />
              <div class="radio-content">
                <span class="radio-icon">📐</span>
                <span class="radio-text">横版输出</span>
                <span class="radio-desc">宽 &gt; 高</span>
              </div>
            </label>
            <label class="radio-card" :class="{ active: direction === 'vertical' }">
              <input v-model="direction" type="radio" value="vertical" />
              <div class="radio-content">
                <span class="radio-icon"></span>
                <span class="radio-text">竖版输出</span>
                <span class="radio-desc">高 &gt; 宽</span>
              </div>
            </label>
          </div>
        </div>

        <div class="section">
          <label class="section-label">输出尺寸</label>
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
            <span class="btn-icon">📂</span>
            <span>选择文件夹</span>
          </button>
          <button @click="start" class="btn btn-primary" :disabled="running">
            <span class="btn-icon">{{ running ? '⚙️' : '🚀' }}</span>
            <span>{{ running ? '处理中...' : '开始处理' }}</span>
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
    text.value = `✅ 已加载 ${files.value.length} 张图片`
  }
  i.click()
}

const start = async () => {
  if (files.value.length === 0) return text.value = '⚠️ 请先选择文件夹'
  if (!width.value || !height.value) return text.value = '⚠️ 请输入宽高'

  running.value = true
  total.value = files.value.length
  current.value = 0
  text.value = '🔄 正在处理...'

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

  text.value = '📦 正在打包...'
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
  saveAs(zipBlob, `图片处理结果_${outW}x${outH}.zip`)

  text.value = '✨ 处理完成！压缩包已下载'
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
.image-page {
  width: 100%;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5);
  overflow: hidden;
  backdrop-filter: blur(10px);
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 32px 32px;
  color: white;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

.card-body {
  padding: 32px;
}

.section {
  margin-bottom: 28px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.direction-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.radio-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-card input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-content {
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  background: white;
}

.radio-card:hover .radio-content {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
}

.radio-card.active .radio-content {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.radio-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.radio-text {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.radio-desc {
  font-size: 13px;
  color: #718096;
}

.size-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-item label {
  font-size: 13px;
  color: #4a5568;
  font-weight: 500;
}

.input-item input {
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #f7fafc;
  color: #2d3748;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.input-item input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.btn-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.btn {
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:active::before {
  width: 300px;
  height: 300px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
}

.status-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #f7fafc;
}

.log {
  color: #667eea;
  font-size: 15px;
  margin-bottom: 16px;
  font-weight: 500;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.progress-wrapper {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 99px;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.percentage {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 640px) {
  .card-header {
    padding: 32px 24px 24px;
  }
  
  .title {
    font-size: 22px;
  }
  
  .card-body {
    padding: 24px;
  }
  
  .btn-group {
    grid-template-columns: 1fr;
  }
}
</style>
