<template>
  <div class="page-container">
    <!-- 1. 文本识别 -->
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">住宿明细</h2>
        <p class="panel-subtitle">粘贴日期和天数，自动计算费用（248 元/天）</p>
      </div>
      <div class="panel-body">
        <textarea
          v-model="rawText"
          rows="5"
          placeholder="粘贴日期和金额，每行一条，例如：5.7-5.12,5天"
          @keydown.enter.exact.prevent="doParse"
        ></textarea>
        <div class="row">
          <div class="year-picker">
            <label>年份</label>
            <input type="number" v-model.number="year" min="2000" max="2100" @keydown.enter.exact.prevent="doParse" />
          </div>
          <button class="btn btn-primary" @click="doParse">解析</button>
          <button class="btn btn-secondary" @click="clearLines">清空</button>
        </div>

        <div v-if="lines.length > 0" class="lines">
          <table class="line-table">
            <thead>
              <tr>
                <th>抵店日期</th>
                <th>离店日期</th>
                <th>天数</th>
                <th>金额</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(line, i) in lines" :key="i">
                <td><input type="date" v-model="line.checkIn" /></td>
                <td><input type="date" v-model="line.checkOut" /></td>
                <td><input type="number" min="1" v-model.number="line.days" @change="recalc" /></td>
                <td class="amount">{{ fmt(line.amount) }}</td>
                <td><button class="btn-link danger" @click="removeLine(i)">删除</button></td>
              </tr>
              <tr class="total-row">
                <td colspan="3">总计</td>
                <td class="amount">{{ fmt(totalAmount) }}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <button class="btn btn-secondary add-line" @click="addLine">+ 添加一行</button>
        </div>
      </div>
    </div>

    <!-- 2. 账单信息 -->
    <div v-if="lines.length > 0" class="panel">
      <div class="panel-head">
        <h2 class="panel-title">账单信息</h2>
        <p class="panel-subtitle">填写客户信息，用于生成账单</p>
      </div>
      <div class="panel-body">
        <div class="bill-form">
          <div class="form-row">
            <div class="form-item">
              <label>旅馆名称</label>
              <input v-model="bill.hotel" />
            </div>
            <div class="form-item">
              <label>客户名称</label>
              <input v-model="bill.customer" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>房号</label>
              <input v-model="bill.roomNo" />
            </div>
            <div class="form-item">
              <label>地址</label>
              <input v-model="bill.address" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>人数</label>
              <input type="number" v-model.number="bill.guests" />
            </div>
            <div class="form-item">
              <label>付款方式</label>
              <input v-model="bill.payMethod" />
            </div>
          </div>
        </div>
        <div class="bill-footer">
          <button class="btn btn-primary" @click="printBill">打印 / 导出 PDF</button>
        </div>
      </div>
    </div>

    <!-- 3. 账单预览 -->
    <div v-if="lines.length > 0" class="panel">
      <div class="panel-head">
        <h2 class="panel-title">账单预览</h2>
        <p class="panel-subtitle">按每张账单独立显示，打印时每页一张</p>
      </div>
      <div class="panel-body">
        <div class="bill-cards">
          <div
            v-for="(line, i) in lines"
            :key="i"
            class="bill-card-print"
          >
            <div class="bill-title">{{ bill.hotel }}</div>
            <div class="bill-divider-print"></div>
            <div class="bill-subtitle">账单</div>
            <div class="bill-row"><div>客户名称：{{ bill.customer }}</div><div>房号：{{ bill.roomNo }}</div></div>
            <div class="bill-row"><div>地址：{{ bill.address }}</div><div>房价：{{ DAY_RATE }} 元/天</div></div>
            <div class="bill-row"><div>人数：{{ bill.guests }}</div><div></div></div>
            <div class="bill-row"><div>账号：{{ bill.account }}</div><div>抵店时间：{{ line.checkIn }}</div></div>
            <div class="bill-row"><div>付款方式：{{ bill.payMethod }}</div><div>离店时间：{{ line.checkOut }}</div></div>
            <div class="bill-sum">费用合计：{{ fmt(line.amount) }}</div>
            <div class="bill-row"><div>收款合计：{{ fmt(line.amount) }}</div><div>余额：0.00</div></div>
            <table class="bill-table-print">
              <thead>
                <tr><th>账项</th><th>费用金额</th></tr>
              </thead>
              <tbody>
                <tr><td>房费 {{ line.checkIn }} 至 {{ line.checkOut }}（{{ line.days }}天）</td><td>{{ fmt(line.amount) }}</td></tr>
                <tr class="bill-subtotal"><td>小计</td><td>{{ fmt(line.amount) }}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const rawText = ref('')
const year = ref(new Date().getFullYear())

const DAY_RATE = 248

const bill = ref({
  hotel: '老乡旅馆',
  customer: '王家明',
  roomNo: '301',
  address: '连江县坑园镇颜岐村 57 号',
  guests: 1,
  account: '',
  payMethod: '微信'
})

const lines = ref([])

const totalAmount = computed(() =>
  lines.value.reduce((s, l) => s + (Number(l.amount) || 0), 0)
)

function fmt(v) {
  return Number(v || 0).toFixed(2)
}

function parseDate(s) {
  s = s.trim()
  const y = year.value
  const md = s.split(/[\.\/]/).filter(Boolean)
  if (md.length === 2) {
    const m = parseInt(md[0])
    const d = parseInt(md[1])
    if (!isNaN(m) && !isNaN(d)) return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  const full = s.split('-').filter(Boolean)
  if (full.length === 3) {
    return `${parseInt(full[0])}-${String(parseInt(full[1])).padStart(2, '0')}-${String(parseInt(full[2])).padStart(2, '0')}`
  }
  return null
}

function calcDays(a, b) {
  if (!a || !b) return 1
  const d1 = new Date(a.replace(/-/g, '/'))
  const d2 = new Date(b.replace(/-/g, '/'))
  const diff = Math.round((d2 - d1) / 86400000) + 1
  return diff > 0 ? diff : 1
}

function calcAmount(days) {
  return (Number(days) || 0) * DAY_RATE
}

function doParse() {
  const text = rawText.value.trim()
  if (!text) return

  const items = []
  const rows = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)

  for (const row of rows) {
    const range = row.match(/(\d{1,2}[\.\/]\d{1,2})\s*[\u2014\-\u2013]\s*(\d{1,2}[\.\/]\d{1,2})/)
    const checkIn = range ? parseDate(range[1]) : null
    const checkOut = range ? parseDate(range[2]) : null

    const daysMatch = row.match(/(\d+)\s*天/)
    const days = daysMatch ? parseInt(daysMatch[1]) : calcDays(checkIn, checkOut)

    const amount = calcAmount(days)
    items.push({ checkIn: checkIn || '', checkOut: checkOut || '', days, amount })
  }
  lines.value = items
}

function clearLines() {
  lines.value = []
  rawText.value = ''
}

function removeLine(i) {
  lines.value.splice(i, 1)
}

function addLine() {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  const today = `${y}-${m}-${d}`
  lines.value.push({ checkIn: today, checkOut: today, days: 1, amount: DAY_RATE })
}

function recalc() {
  for (const l of lines.value) {
    l.amount = calcAmount(l.days)
  }
}

/* ---------- 打印：生成账单 ---------- */
function printBill() {
  if (lines.value.length === 0) return

  const openTag = '<'
  const closeTag = '</'

  const cardsHtml = lines.value.map((l) => {
    return `${openTag}div class="bill-card-print">${closeTag}div>
  ${openTag}div class="bill-title">${bill.value.hotel}${closeTag}div>
  ${openTag}div class="bill-divider-print">${closeTag}div>
  ${openTag}div class="bill-subtitle">账单${closeTag}div>
  ${openTag}div class="bill-row">${openTag}div>客户名称：${bill.value.customer}${closeTag}div>${openTag}div>房号：${bill.value.roomNo}${closeTag}div>${closeTag}div>
  ${openTag}div class="bill-row">${openTag}div>地址：${bill.value.address}${closeTag}div>${openTag}div>房价：${DAY_RATE} 元/天${closeTag}div>${closeTag}div>
  ${openTag}div class="bill-row">${openTag}div>人数：${bill.value.guests}${closeTag}div>${openTag}div>${closeTag}div>${closeTag}div>
  ${openTag}div class="bill-row">${openTag}div>账号：${bill.value.account}${closeTag}div>${openTag}div>抵店时间：${l.checkIn}${closeTag}div>${closeTag}div>
  ${openTag}div class="bill-row">${openTag}div>付款方式：${bill.value.payMethod}${closeTag}div>${openTag}div>离店时间：${l.checkOut}${closeTag}div>${closeTag}div>
  ${openTag}div class="bill-sum">费用合计：${fmt(l.amount)}${closeTag}div>
  ${openTag}div class="bill-row">${openTag}div>收款合计：${fmt(l.amount)}${closeTag}div>${openTag}div>余额：0.00${closeTag}div>${closeTag}div>
  ${openTag}table class="bill-table-print">${closeTag}table>
    ${openTag}thead>${closeTag}thead>
      ${openTag}tr>${openTag}th>账项${closeTag}th>${openTag}th>费用金额${closeTag}th>${closeTag}tr>
    ${openTag}tbody>${closeTag}tbody>
      ${openTag}tr>${openTag}td>房费 ${l.checkIn} 至 ${l.checkOut}（${l.days}天）${closeTag}td>${openTag}td>${fmt(l.amount)}${closeTag}td>${closeTag}tr>
      ${openTag}tr class="bill-subtotal">${openTag}td>小计${closeTag}td>${openTag}td>${fmt(l.amount)}${closeTag}td>${closeTag}tr>
    ${openTag}/tbody>${closeTag}>
  ${openTag}/table>${closeTag}>
${openTag}/div>${closeTag}>`
  }).join('\n')

  const stylesOpen = openTag + 'style>'
  const stylesClose = closeTag + 'style>'
  const cssRules = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: SimSun, 'Microsoft YaHei', serif; color: #222; background: #fff; padding: 20px; }
.bill-cards { display: flex; flex-direction: column; gap: 20px; }
.bill-card-print { padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px; page-break-inside: avoid; background: #fff; }
.bill-title { text-align: center; font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.bill-divider-print { border-top: 2px solid #000; margin: 4px 0; }
.bill-subtitle { text-align: center; font-size: 13px; margin: 4px 0 8px; }
.bill-row { display: flex; justify-content: space-between; line-height: 1.8; }
.bill-row > div { flex: 1; font-size: 12px; }
.bill-sum { text-align: center; margin: 6px 0 4px; font-size: 12px; font-weight: 600; }
.bill-table-print { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
.bill-table-print th, .bill-table-print td { border: 1px solid #333; padding: 4px 8px; }
.bill-table-print th:last-child, .bill-table-print td:last-child { text-align: right; width: 40%; }
.bill-subtotal td { font-weight: 600; background: #f5f5f5; }
@page { size: A4 portrait; margin: 15mm; }
`

  const bodyOpen = openTag + 'body>'
  const bodyClose = closeTag + 'body>'
  const htmlOpen = openTag + 'html>'
  const htmlClose = closeTag + 'html>'
  const headOpen = openTag + 'head>'
  const headClose = closeTag + 'head>'
  const metaCharset = openTag + 'meta charset="utf-8">'

  const w = window.open('', '_blank')
  w.document.write(htmlOpen + headOpen + metaCharset + stylesOpen + cssRules + stylesClose + headClose + bodyOpen + '<div class="bill-cards">' + cardsHtml + '</div>' + bodyClose + htmlClose)
  w.document.close()
  w.focus()
  setTimeout(() => {
    try { w.print() } catch (e) {}
  }, 300)
}
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  padding: 18px 20px 16px;
  border-bottom: 1px solid #eff6ff;
  position: relative;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  line-height: 1.4;
  letter-spacing: 0.2px;
}

.panel-subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
}

.panel-body {
  padding: 20px;
}

textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-size: 13px;
  font-family: 'Consolas', 'Courier New', monospace;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  transition: border-color 120ms linear, box-shadow 120ms linear, background 120ms linear;
}

textarea:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.year-picker {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.year-picker label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.year-picker input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  font-weight: 600;
  transition: border-color 120ms linear, box-shadow 120ms linear;
  width: 100px;
}

.year-picker input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.btn {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
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

.btn-link {
  background: transparent;
  border: none;
  padding: 4px 8px;
  font-size: 12px;
  color: #dc2626;
  cursor: pointer;
  font-weight: 600;
}

.btn-link:hover {
  color: #b91c1c;
  text-decoration: underline;
}

.lines {
  margin-top: 16px;
}

.line-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.line-table th,
.line-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.line-table th {
  background: #f1f5f9;
  font-weight: 700;
  color: #0f172a;
  font-size: 12px;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  border-bottom: 1px solid #cbd5e1;
}

.line-table input[type="date"],
.line-table input[type="number"] {
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  font-weight: 500;
  transition: border-color 120ms linear, box-shadow 120ms linear;
}

.line-table input[type="date"] {
  width: 140px;
}

.line-table input[type="number"] {
  width: 80px;
}

.line-table input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.line-table .amount {
  color: #1d4ed8;
  font-weight: 700;
  font-size: 14px;
}

.line-table .total-row td {
  background: #f8fafc;
  font-weight: 700;
  border-top: 2px solid #2563eb;
  border-bottom: none;
}

.line-table .total-row td:first-child {
  color: #0f172a;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-size: 12px;
}

.line-table .total-row .amount {
  color: #0f172a;
  font-weight: 800;
  font-size: 15px;
}

.add-line {
  margin-top: 12px;
}

/* 账单信息表单 */
.bill-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.form-item input {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: border-color 120ms linear, box-shadow 120ms linear;
}

.form-item input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.bill-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 账单预览卡片 */
.bill-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bill-card-print {
  padding: 20px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 40px);
  position: relative;
}

.bill-title {
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #0f172a;
  letter-spacing: 0.3px;
}

.bill-divider-print {
  border-top: 2px solid #1e293b;
  margin: 4px 0;
}

.bill-subtitle {
  text-align: center;
  font-size: 12px;
  margin: 4px 0 10px;
  color: #334155;
  font-weight: 600;
  letter-spacing: 1px;
}

.bill-row {
  display: flex;
  justify-content: space-between;
  line-height: 1.8;
}

.bill-row > div {
  flex: 1;
  font-size: 12px;
  color: #334155;
}

.bill-sum {
  text-align: center;
  margin: 8px 0 4px;
  font-size: 13px;
  font-weight: 700;
  color: #1d4ed8;
  padding: 6px 0;
  background: #eff6ff;
  border-radius: 4px;
}

.bill-table-print {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 12px;
}

.bill-table-print th,
.bill-table-print td {
  border: 1px solid #334155;
  padding: 4px 8px;
}

.bill-table-print th:last-child,
.bill-table-print td:last-child {
  text-align: right;
  width: 40%;
}

.bill-table-print th {
  background: #f1f5f9;
  font-weight: 700;
}

.bill-subtotal td {
  font-weight: 700;
  background: #e2e8f0;
}

@media (max-width: 760px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .panel-head {
    padding: 14px 16px 12px;
  }
  .panel-body {
    padding: 16px;
  }
  .line-table input[type="date"] {
    width: 120px;
  }
}
</style>
