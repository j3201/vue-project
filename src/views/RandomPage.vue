<template>
  <div class="page-container">
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">数字随机组合计算</h2>
        <p class="panel-subtitle">智能寻找最接近目标值的数字组合</p>
      </div>

      <div class="panel-body">
        <div class="form-section">
          <div class="input-group">
            <div class="input-item">
              <label class="label">目标数值</label>
              <input v-model.number="target" type="number" placeholder="请输入目标数字" />
            </div>

            <div class="input-item">
              <label class="label">数字数组</label>
              <input v-model="arrStr" placeholder="示例：1, 2, 5, 5, 3, 7" />
              <span class="hint">使用英文逗号分隔多个数字</span>
            </div>
          </div>
        </div>

        <div class="btn-group">
          <button @click="calculate" class="btn btn-primary" :disabled="loading">
            <span>{{ loading ? '计算中…' : '开始计算' }}</span>
          </button>
          <button @click="reset" class="btn btn-secondary">
            <span>重置</span>
          </button>
        </div>

        <div class="results" v-if="resultAbove || resultBelow">
          <div class="result-card" v-if="resultAbove">
            <div class="result-header">
              <span class="badge above">大于目标</span>
              <span class="diff">+{{ resultAbove.diff }}</span>
            </div>
            <div class="result-row">
              <span class="row-label">组合</span>
              <span class="row-value">{{ resultAbove.combination }}</span>
            </div>
            <div class="result-row">
              <span class="row-label">总和</span>
              <span class="row-value">{{ resultAbove.sum }}</span>
            </div>
          </div>

          <div class="result-card" v-if="resultBelow">
            <div class="result-header">
              <span class="badge below">小于目标</span>
              <span class="diff">-{{ resultBelow.diff }}</span>
            </div>
            <div class="result-row">
              <span class="row-label">组合</span>
              <span class="row-value">{{ resultBelow.combination }}</span>
            </div>
            <div class="result-row">
              <span class="row-label">总和</span>
              <span class="row-value">{{ resultBelow.sum }}</span>
            </div>
          </div>
        </div>

        <div class="empty" v-else>
            <p>输入目标值和数字数组，点击开始计算</p>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const target = ref(10)
const arrStr = ref('1,2,5,5,3,7')
const loading = ref(false)

const resultAbove = ref(null)
const resultBelow = ref(null)

const reset = () => {
  target.value = 10
  arrStr.value = '1,2,5,5,3,7'
  resultAbove.value = null
  resultBelow.value = null
}

const calculate = () => {
  const numArr = arrStr.value
    .split(',')
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0)

  if (numArr.length === 0) {
    alert('请输入合法的数字数组')
    return
  }
  if (!target.value || target.value <= 0) {
    alert('请输入合法目标数值')
    return
  }

  loading.value = true
  const len = numArr.length

  let bestAboveSum = Infinity
  let bestAboveList = []

  let bestBelowSum = -Infinity
  let bestBelowList = []

  for (let mask = 1; mask < 1 << len; mask++) {
    let currentSum = 0
    const currentList = []
    for (let i = 0; i < len; i++) {
      if (mask & (1 << i)) {
        currentSum += numArr[i]
        currentList.push(numArr[i])
      }
    }

    if (currentSum > target.value && currentSum < bestAboveSum) {
      bestAboveSum = currentSum
      bestAboveList = [...currentList]
    }

    if (currentSum < target.value && currentSum > bestBelowSum) {
      bestBelowSum = currentSum
      bestBelowList = [...currentList]
    }
  }

  if (bestAboveSum !== Infinity) {
    resultAbove.value = {
      combination: bestAboveList.join(', '),
      sum: bestAboveSum,
      diff: bestAboveSum - target.value
    }
  } else {
    resultAbove.value = null
  }

  if (bestBelowSum !== -Infinity) {
    resultBelow.value = {
      combination: bestBelowList.join(', '),
      sum: bestBelowSum,
      diff: target.value - bestBelowSum
    }
  } else {
    resultBelow.value = null
  }

  loading.value = false
}
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 720px;
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
  background: linear-gradient(90deg, #f97316 0%, #2563eb 100%);
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

.form-section {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 13px;
  color: #334155;
  font-weight: 600;
  letter-spacing: 0.2px;
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

.hint {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.btn-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
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
  background: #f97316;
  color: #ffffff;
  border-color: #f97316;
}

.btn-primary:hover:not(:disabled) {
  background: #ea580c;
  border-color: #ea580c;
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

.results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 18px 20px;
  position: relative;
}

.result-card:nth-child(1) {
  border-left: 4px solid #10b981;
}

.result-card:nth-child(2) {
  border-left: 4px solid #f97316;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e2e8f0;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  background: #e2e8f0;
  color: #334155;
}

.badge.above {
  background: #d1fae5;
  color: #065f46;
}

.below {
  background: #ffedd5;
  color: #9a3412;
}

.diff {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  padding: 4px 10px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.row-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.row-value {
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
}

.empty {
  text-align: center;
  padding: 32px 16px 8px;
  color: #64748b;
  font-size: 14px;
}

.empty p {
  margin: 0;
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
