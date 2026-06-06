<template>
  <div class="pdf-page">
    <div class="card">
      <div class="card-header">
        <h2 class="title">📄 PDF 工具</h2>
        <p class="subtitle">普通合并 | 两页拼一页（带合理间距）</p>
      </div>

      <div class="card-body">
        <div class="tab-group">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'merge' }" 
            @click="switchTab('merge')"
          >
            <span class="tab-icon">📑</span>
            <span>普通合并</span>
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'twoInOne' }" 
            @click="switchTab('twoInOne')"
          >
            <span class="tab-icon">📋</span>
            <span>两页拼一页</span>
          </button>
        </div>

        <div class="panel" v-if="activeTab === 'merge'">
          <div class="action-buttons">
            <button class="btn btn-secondary" @click="selectMergeFiles">
              <span class="btn-icon">📁</span>
              <span>选择多个PDF</span>
            </button>
            <button class="btn btn-primary" @click="startMerge">
              <span class="btn-icon">🔗</span>
              <span>开始合并</span>
            </button>
          </div>
          <div class="file-count" v-if="selectedFiles.length > 0">
            <span class="count-badge">{{ selectedFiles.length }}</span>
            <span>个文件已选择</span>
          </div>
        </div>

        <div class="panel" v-if="activeTab === 'twoInOne'">
          <div class="action-buttons">
            <button class="btn btn-secondary" @click="selectMergeFiles">
              <span class="btn-icon">📄</span>
              <span>选择PDF</span>
            </button>
            <button class="btn btn-primary" @click="startTwoInOne">
              <span class="btn-icon">✨</span>
              <span>开始拼页</span>
            </button>
          </div>
          <div class="file-count" v-if="selectedFiles.length > 0">
            <span class="count-badge">{{ selectedFiles.length }}</span>
            <span>个文件已选择</span>
          </div>
        </div>

        <div class="log-section" v-if="log">
          <div class="log" :class="{ success: log.includes('✅'), error: log.includes('❌') }">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'

const activeTab = ref('merge')
const log = ref('')
const selectedFiles = ref([])

function switchTab(t) {
  activeTab.value = t
  log.value = ''
  selectedFiles.value = []
}

function selectMergeFiles() {
  const i = document.createElement('input')
  i.type = 'file'
  i.accept = 'application/pdf'
  i.multiple = true
  i.onchange = e => {
    selectedFiles.value = Array.from(e.target.files)
    log.value = `✅ 已选择 ${selectedFiles.value.length} 个文件`
  }
  i.click()
}

async function startMerge() {
  if (selectedFiles.value.length === 0) {
    log.value = '⚠️ 请先选择文件'
    return
  }
  log.value = '🔄 合并中...'
  try {
    const doc = await PDFDocument.create()
    for (const f of selectedFiles.value) {
      const d = await PDFDocument.load(await f.arrayBuffer())
      const pages = await doc.copyPages(d, d.getPageIndices())
      pages.forEach(p => doc.addPage(p))
    }
    saveAs(new Blob([await doc.save()]), '合并完成.pdf')
    log.value = '✅ 合并成功'
  } catch (e) {
    log.value = '❌ 合并失败'
    console.error(e)
  }
}

async function startTwoInOne() {
  if (selectedFiles.value.length === 0) {
    log.value = '⚠️ 请先选择文件'
    return
  }
  try {
    log.value = '🔄 处理中...'

    const tempDoc = await PDFDocument.create()
    for (const f of selectedFiles.value) {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const pages = await tempDoc.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(p => tempDoc.addPage(p))
    }

    const totalPages = tempDoc.getPageCount()
    log.value = `📊 已读取 ${totalPages} 页，正在拼接...`

    const outDoc = await PDFDocument.create()

    for (let i = 0; i < totalPages; i += 2) {
      const pageA = tempDoc.getPage(i)
      const pageB = i + 1 < totalPages ? tempDoc.getPage(i + 1) : null

      const { width, height } = pageA.getSize()

      const margin = 50
      const newPage = outDoc.addPage([width, height * 2 + margin])

      const embedA = await outDoc.embedPage(pageA)
      newPage.drawPage(embedA, {
        x: 0,
        y: height + margin,
        width,
        height
      })

      if (pageB) {
        const embedB = await outDoc.embedPage(pageB)
        newPage.drawPage(embedB, {
          x: 0,
          y: 0,
          width,
          height
        })
      }
    }

    const pdfBytes = await outDoc.save()
    saveAs(new Blob([pdfBytes]), '两页拼一页.pdf')
    log.value = '✅ 拼页成功！'
  } catch (e) {
    log.value = '❌ 失败：' + e.message
    console.error(e)
  }
}
</script>

<style scoped>
.pdf-page {
  width: 100%;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card {
  width: 100%;
  max-width: 600px;
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

.tab-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.tab {
  padding: 16px 20px;
  border-radius: 14px;
  cursor: pointer;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  color: #4a5568;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.tab-icon {
  font-size: 20px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
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

.btn-icon {
  font-size: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
}

.file-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 12px;
  font-size: 15px;
  color: #4a5568;
  font-weight: 500;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 99px;
  font-weight: 700;
  font-size: 16px;
}

.log-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f7fafc;
}

.log {
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  background: #f7fafc;
  color: #4a5568;
  border-left: 4px solid #cbd5e0;
  transition: all 0.3s ease;
}

.log.success {
  background: rgba(72, 187, 120, 0.1);
  color: #22543d;
  border-left-color: #48bb78;
}

.log.error {
  background: rgba(245, 101, 101, 0.1);
  color: #742a2a;
  border-left-color: #f56565;
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
  
  .tab-group {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>