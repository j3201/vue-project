<template>
  <div class="page-container">
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">PDF 工具</h2>
        <p class="panel-subtitle">普通合并 · 两页拼一页</p>
      </div>

      <div class="panel-body">
        <div class="tab-group" role="tablist">
          <button
            class="tab"
            :class="{ active: activeTab === 'merge' }"
            @click="switchTab('merge')"
            role="tab"
          >
            <span>普通合并</span>
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'twoInOne' }"
            @click="switchTab('twoInOne')"
            role="tab"
          >
            <span>两页拼一页</span>
          </button>
        </div>

        <div class="section" v-if="activeTab === 'merge'">
          <div class="btn-group">
            <button class="btn btn-secondary" @click="selectMergeFiles">
              <span>选择多个 PDF</span>
            </button>
            <button class="btn btn-primary" @click="startMerge">
              <span>开始合并</span>
            </button>
          </div>
          <div class="file-count" v-if="selectedFiles.length > 0">
            <span class="count-badge">{{ selectedFiles.length }}</span>
            <span>个文件已选择</span>
          </div>
        </div>

        <div class="section" v-if="activeTab === 'twoInOne'">
          <div class="btn-group">
            <button class="btn btn-secondary" @click="selectMergeFiles">
              <span>选择 PDF</span>
            </button>
            <button class="btn btn-primary" @click="startTwoInOne">
              <span>开始拼页</span>
            </button>
          </div>
          <div class="file-count" v-if="selectedFiles.length > 0">
            <span class="count-badge">{{ selectedFiles.length }}</span>
            <span>个文件已选择</span>
          </div>
        </div>

        <div class="status-section" v-if="log">
          <div class="log" :class="{ success: log.includes('成功') }">{{ log }}</div>
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
  i.onchange = (e) => {
    selectedFiles.value = Array.from(e.target.files)
    log.value = `已选择 ${selectedFiles.value.length} 个文件`
  }
  i.click()
}

async function startMerge() {
  if (selectedFiles.value.length === 0) {
    log.value = '请先选择文件'
    return
  }
  log.value = '合并中…'
  try {
    const doc = await PDFDocument.create()
    for (const f of selectedFiles.value) {
      const d = await PDFDocument.load(await f.arrayBuffer())
      const pages = await doc.copyPages(d, d.getPageIndices())
      pages.forEach((p) => doc.addPage(p))
    }
    saveAs(new Blob([await doc.save()]), '合并完成.pdf')
    log.value = '合并成功'
  } catch (e) {
    log.value = '合并失败'
    console.error(e)
  }
}

async function startTwoInOne() {
  if (selectedFiles.value.length === 0) {
    log.value = '请先选择文件'
    return
  }
  try {
    log.value = '处理中…'

    const tempDoc = await PDFDocument.create()
    for (const f of selectedFiles.value) {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const pages = await tempDoc.copyPages(pdf, pdf.getPageIndices())
      pages.forEach((p) => tempDoc.addPage(p))
    }

    const totalPages = tempDoc.getPageCount()
    log.value = `已读取 ${totalPages} 页，正在拼接…`

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
    log.value = '拼页成功'
  } catch (e) {
    log.value = '失败：' + e.message
    console.error(e)
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 640px;
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

.tab-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.tab {
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: background 120ms linear, border-color 120ms linear, color 120ms linear;
}

.tab:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
  color: #0f172a;
}

.tab.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
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

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.btn-primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.btn-secondary {
  background: #ffffff;
  color: #1e40af;
  border-color: #93c5fd;
}

.btn-secondary:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.file-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 13px;
  color: #334155;
  font-weight: 600;
  border: 1px dashed #cbd5e1;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 10px;
  background: #0891b2;
  color: #ffffff;
  border-radius: 4px;
  font-weight: 700;
  font-size: 13px;
}

.status-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.log {
  padding: 12px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background: #eff6ff;
  color: #1e3a8a;
  border-left: 3px solid #2563eb;
}

.log.success {
  background: #ecfdf5;
  color: #065f46;
  border-left-color: #10b981;
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
