<template>
  <div class="random-page">
    <div class="card">
      <div class="card-header">
        <div class="header-icon">🎲</div>
        <h2 class="title">数字随机组合计算</h2>
        <p class="subtitle">智能寻找最接近目标值的数字组合</p>
      </div>

      <div class="card-body">
        <div class="form-section">
          <div class="input-group">
            <div class="input-item">
              <label class="input-label">
                <span class="label-icon">🎯</span>
                <span>目标数值</span>
              </label>
              <input 
                v-model.number="target" 
                type="number" 
                placeholder="请输入目标数字" 
                class="styled-input"
              />
            </div>
            
            <div class="input-item">
              <label class="input-label">
                <span class="label-icon">🔢</span>
                <span>数字数组</span>
              </label>
              <input 
                v-model="arrStr" 
                placeholder="示例：1, 2, 5, 5, 3, 7" 
                class="styled-input"
              />
              <span class="input-hint">使用英文逗号分隔多个数字</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="calculate" class="btn btn-primary" :disabled="loading">
            <span class="btn-icon">{{ loading ? '⚙️' : '🚀' }}</span>
            <span>{{ loading ? '计算中...' : '开始计算' }}</span>
          </button>
          <button @click="reset" class="btn btn-secondary">
            <span class="btn-icon">🔄</span>
            <span>重置</span>
          </button>
        </div>

        <div class="results-container" v-if="resultAbove || resultBelow">
          <div class="result-card result-above" v-if="resultAbove">
            <div class="result-header">
              <div class="result-badge above">
                <span class="badge-icon">⬆️</span>
                <span class="badge-text">大于目标</span>
              </div>
              <div class="result-diff positive">+{{ resultAbove.diff }}</div>
            </div>
            
            <div class="result-content">
              <div class="result-row">
                <span class="row-label">组合</span>
                <span class="row-value combination">{{ resultAbove.combination }}</span>
              </div>
              <div class="result-row">
                <span class="row-label">总和</span>
                <span class="row-value sum">{{ resultAbove.sum }}</span>
              </div>
            </div>
          </div>

          <div class="result-card result-below" v-if="resultBelow">
            <div class="result-header">
              <div class="result-badge below">
                <span class="badge-icon">⬇️</span>
                <span class="badge-text">小于目标</span>
              </div>
              <div class="result-diff negative">-{{ resultBelow.diff }}</div>
            </div>
            
            <div class="result-content">
              <div class="result-row">
                <span class="row-label">组合</span>
                <span class="row-value combination">{{ resultBelow.combination }}</span>
              </div>
              <div class="result-row">
                <span class="row-label">总和</span>
                <span class="row-value sum">{{ resultBelow.sum }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" v-else>
          <div class="empty-icon">💡</div>
          <p class="empty-text">输入目标值和数字数组，点击开始计算</p>
          <p class="empty-hint">系统将自动找出最接近的两个组合</p>
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
    .filter(n => !isNaN(n) && n > 0)

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
    let currentList = []
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
.random-page {
  width: 100%;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5);
  overflow: hidden;
  backdrop-filter: blur(10px);
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
  padding: 40px 32px 36px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.header-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(10deg); }
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
}

.subtitle {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.card-body {
  padding: 36px 32px;
}

.form-section {
  margin-bottom: 28px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #2d3748;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-icon {
  font-size: 18px;
}

.styled-input {
  padding: 16px 18px;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  background: #f7fafc;
  color: #2d3748;
  font-size: 16px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.styled-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.styled-input::placeholder {
  color: #a0aec0;
}

.input-hint {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 4px;
  font-style: italic;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.btn {
  padding: 16px 24px;
  border-radius: 14px;
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

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  transition: width 0.3s ease;
}

.result-above::before {
  background: linear-gradient(180deg, #48bb78 0%, #38a169 100%);
}

.result-below::before {
  background: linear-gradient(180deg, #ed8936 0%, #dd6b20 100%);
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.result-card:hover::before {
  width: 6px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f7fafc;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 600;
}

.result-badge.above {
  background: rgba(72, 187, 120, 0.1);
  color: #22543d;
}

.result-badge.below {
  background: rgba(237, 137, 54, 0.1);
  color: #7c2d12;
}

.badge-icon {
  font-size: 16px;
}

.result-diff {
  font-size: 24px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 12px;
}

.result-diff.positive {
  background: rgba(72, 187, 120, 0.15);
  color: #22543d;
}

.result-diff.negative {
  background: rgba(237, 137, 54, 0.15);
  color: #7c2d12;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f7fafc;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.result-row:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.row-label {
  font-size: 14px;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.row-value {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.row-value.combination {
  color: #667eea;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.row-value.sum {
  font-size: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  animation: fadeIn 0.5s ease;
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

.empty-text {
  font-size: 18px;
  color: #4a5568;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #a0aec0;
  margin: 0;
}

@media (max-width: 640px) {
  .random-page {
    padding: 16px;
  }
  
  .card-header {
    padding: 32px 24px 28px;
  }
  
  .header-icon {
    font-size: 48px;
  }
  
  .title {
    font-size: 22px;
  }
  
  .card-body {
    padding: 28px 24px;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .result-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .result-diff {
    align-self: flex-end;
  }
}
</style>