<template>
  <div class="mileage-page">
    <div class="dashboard-header">
      <div class="header-title">
        <div class="icon-gauge">
          <svg viewBox="0 0 64 64" width="40" height="40">
            <circle cx="32" cy="34" r="26" fill="none" stroke="#f59e0b" stroke-width="2.5" opacity="0.3"/>
            <circle cx="32" cy="34" r="26" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="120" stroke-dashoffset="20" stroke-linecap="round" transform="rotate(-130 32 34)"/>
            <line x1="32" y1="34" x2="32" y2="16" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" transform="rotate(-40 32 34)"/>
            <circle cx="32" cy="34" r="4" fill="#f59e0b"/>
            <text x="32" y="54" text-anchor="middle" fill="#fbbf24" font-size="8" font-weight="700" font-family="'JetBrains Mono', 'Courier New', monospace">KM/H</text>
          </svg>
        </div>
        <div class="title-text">
          <h1>里程记录</h1>
          <p>Mileage Tracker · 驾驶数据管理台</p>
        </div>
      </div>
      <div class="stats-bar">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalDist }}<span class="stat-unit">km</span></div>
          <div class="stat-label">总里程</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.trips }}</div>
          <div class="stat-label">行程数</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-card">
          <div class="stat-value">{{ routeCacheCount }}<span class="stat-unit">条</span></div>
          <div class="stat-label">路线库</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-card">
          <div class="stat-value accent-red">{{ stats.maxSpeed }}<span class="stat-unit">km/h</span></div>
          <div class="stat-label">最高速度</div>
        </div>
      </div>
    </div>

    <div class="section route-cache-section">
      <div class="section-header" @click="cacheExpanded = !cacheExpanded">
        <div class="section-title">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/></svg>
          <span>路线缓存库</span>
          <span class="badge-count">{{ routeCache.length }} 条路线</span>
        </div>
        <div class="section-actions" @click.stop>
          <input type="file" ref="routeFileInput" accept=".xlsx,.xls,.csv" @change="handleRouteImport" style="display:none" />
          <button class="btn btn-sm btn-ghost" @click="$refs.routeFileInput.click()">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V13a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3 7a1 1 0 011 1v2a1 1 0 001 1h4a1 1 0 001-1v-2a1 1 0 112 0v2a3 3 0 01-3 3H9a3 3 0 01-3-3v-2a1 1 0 011-1z"/></svg>
            导入路线
          </button>
          <button class="btn btn-sm btn-outline" @click="addCacheRow">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
            新增
          </button>
          <button v-if="routeCache.length > 0" class="btn btn-sm btn-danger-ghost" @click="clearRouteCacheData">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clip-rule="evenodd"/></svg>
          </button>
        </div>
        <svg class="chevron" :class="{ expanded: cacheExpanded }" viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
      </div>

      <div v-show="cacheExpanded" class="cache-table-wrap">
        <table class="cache-table">
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th>起点</th>
              <th>终点</th>
              <th style="width:130px">导航里程(km)</th>
              <th style="width:50px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in routeCache" :key="'c'+idx">
              <td class="idx-cell">{{ idx + 1 }}</td>
              <td><input type="text" v-model="r.start" placeholder="起点" /></td>
              <td><input type="text" v-model="r.end" placeholder="终点" /></td>
              <td><input type="number" step="0.1" v-model.number="r.distance" class="num-input" placeholder="0.0" /></td>
              <td class="action-cell">
                <button class="btn-del" @click="removeCacheRow(idx)" title="删除">
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clip-rule="evenodd"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="routeCache.length === 0">
              <td colspan="5" class="empty-td">暂无路线数据，点击「导入路线」导入Excel或点击「新增」手动添加</td>
            </tr>
          </tbody>
        </table>
        <div v-if="routeCache.length > 0" class="cache-footer">
          <span class="hint-text">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
            输入里程记录时，会自动从此库匹配路线并填充里程
          </span>
        </div>
      </div>
    </div>

    <div class="control-panel">
      <div class="control-left">
        <input type="file" ref="tripFileInput" accept=".xlsx,.xls,.csv" @change="handleTripImport" style="display:none" />
        <button class="btn btn-ghost" @click="$refs.tripFileInput.click()">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V13a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3 7a1 1 0 011 1v2a1 1 0 001 1h4a1 1 0 001-1v-2a1 1 0 112 0v2a3 3 0 01-3 3H9a3 3 0 01-3-3v-2a1 1 0 011-1z"/></svg>
          导入行程
        </button>
        <button class="btn btn-outline" @click="addRow(1)">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          新增行程
        </button>
        <div class="batch-add-wrap">
          <input type="number" v-model.number="batchCount" min="1" max="100" class="batch-input" />
          <button class="btn btn-outline" @click="addRow(batchCount || 1)">
            批量新增 {{ batchCount || 1 }} 条
          </button>
        </div>
        <div class="reset-group">
          <button class="btn btn-danger-outline btn-sm" @click="clearRouteCacheData" title="清除路线缓存库中的所有路线数据">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clip-rule="evenodd"/></svg>
            清除路线缓存
          </button>
          <button class="btn btn-danger-outline btn-sm" @click="clearTripData" title="清除所有行程记录数据">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L13 8.414V15a1 1 0 01-1 1H8a1 1 0 01-1-1V8.414L3.293 6.707A1 1 0 013 6V4z"/></svg>
            清除行程数据
          </button>
        </div>
      </div>
      <div class="control-right">
        <button v-if="tableData.length > 0" class="btn btn-nav-gen" @click="goToNavPage">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
          生成导航图
        </button>
        <button v-if="tableData.length > 0" class="btn btn-ghost btn-sm" @click="rematchAll" title="根据路线库重新计算所有行程的导航里程">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>
          重新匹配里程
        </button>
        <span v-if="cacheStatus" :class="['cache-indicator', cacheStatus.type]">
          <span class="pulse-dot"></span>
          {{ cacheStatus.msg }}
        </span>
        <button class="btn btn-cache" @click="saveAllToCache" :class="{ 'btn-cached': justCached }">
          <svg v-if="!justCached" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L13 8.414V15a1 1 0 01-1 1H8a1 1 0 01-1-1V8.414L3.293 6.707A1 1 0 013 6V4z"/></svg>
          <svg v-else viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          {{ justCached ? '已缓存' : '全部缓存' }}
        </button>
      </div>
    </div>

    <div class="table-container">
      <div class="table-scroll">
        <table class="mileage-table">
          <thead>
            <tr>
              <th class="col-time">时间</th>
              <th class="col-start">起点</th>
              <th class="col-end">终点</th>
              <th class="col-num">导航里程(km)</th>
              <th class="col-num">驾驶时长</th>
              <th class="col-num">平均速度(km/h)</th>
              <th class="col-num">最快速度(km/h)</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in tableData" :key="row._id" :class="{ 'row-new': row._isNew, 'row-matched': row._matched }">
              <td class="col-time">
                <input type="text" v-model="row.time" placeholder="2024/01/01 08:00" @focus="onFieldFocus(row)" />
              </td>
              <td class="col-start cell-wrap" :class="{ 'has-dropdown': openDropdown === row._id + '_start' }">
                <input
                  type="text"
                  v-model="row.start"
                  placeholder="输入起点"
                  @focus="onFieldFocus(row); openDropdown = row._id + '_start'"
                  @input="onRouteFieldInput(row, 'start')"
                  @blur="onFieldBlur"
                />
                <div v-if="openDropdown === row._id + '_start' && getSuggestions(row, 'start').length > 0" class="suggest-dropdown">
                  <div
                    v-for="(s, si) in getSuggestions(row, 'start')"
                    :key="si"
                    class="suggest-item"
                    @mousedown.prevent="applySuggestion(row, 'start', s)"
                  >
                    <span class="dot start-dot"></span>
                    <span class="sug-name">{{ s.name }}</span>
                    <span v-if="s.partner" class="sug-arrow">→ {{ s.partner }} ({{ s.distance }}km)</span>
                  </div>
                </div>
              </td>
              <td class="col-end cell-wrap" :class="{ 'has-dropdown': openDropdown === row._id + '_end' }">
                <input
                  type="text"
                  v-model="row.end"
                  placeholder="输入终点"
                  @focus="onFieldFocus(row); openDropdown = row._id + '_end'"
                  @input="onRouteFieldInput(row, 'end')"
                  @blur="onFieldBlur"
                />
                <div v-if="openDropdown === row._id + '_end' && getSuggestions(row, 'end').length > 0" class="suggest-dropdown">
                  <div
                    v-for="(s, si) in getSuggestions(row, 'end')"
                    :key="si"
                    class="suggest-item"
                    @mousedown.prevent="applySuggestion(row, 'end', s)"
                  >
                    <span class="dot end-dot"></span>
                    <span class="sug-name">{{ s.name }}</span>
                    <span v-if="s.partner" class="sug-arrow">← {{ s.partner }} ({{ s.distance }}km)</span>
                  </div>
                </div>
              </td>
              <td class="col-num">
                <input type="number" step="0.1" v-model.number="row.distance" :class="{ 'auto-filled': row._autoFilled }" placeholder="0.0" @focus="onFieldFocus(row)" @blur="onDistanceBlur(row)" @input="row._autoFilled = false" />
              </td>
              <td class="col-num">
                <input type="text" v-model="row.duration" :class="{ 'auto-filled': row._autoFilled }" placeholder="HH:MM:SS" @focus="onFieldFocus(row)" @input="row._autoFilled = false" />
              </td>
              <td class="col-num">
                <input type="number" step="1" v-model.number="row.avgSpeed" :class="{ 'auto-filled': row._autoFilled }" placeholder="0" @focus="onFieldFocus(row)" @input="row._autoFilled = false" />
              </td>
              <td class="col-num">
                <input type="number" step="1" v-model.number="row.maxSpeed" :class="{ 'auto-filled': row._autoFilled }" placeholder="0" @focus="onFieldFocus(row)" @input="row._autoFilled = false" />
              </td>
              <td class="col-action">
                <button class="btn-del" @click="removeRow(idx)" title="删除">
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clip-rule="evenodd"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="tableData.length === 0" class="empty-row">
              <td colspan="8">
                <div class="empty-state">
                  <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="#475569" stroke-width="1.5">
                    <rect x="8" y="12" width="48" height="40" rx="4"/>
                    <path d="M8 22h48"/>
                    <circle cx="18" cy="17" r="2" fill="#f59e0b" stroke="none"/>
                    <path d="M16 34l8 8M24 34l-8 8" stroke-linecap="round"/>
                    <path d="M32 34h16M32 42h12" stroke-linecap="round"/>
                  </svg>
                  <p>暂无行程数据</p>
                  <span>点击「新增行程」或「批量新增」添加记录，输入起点终点将自动匹配路线库</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'

const router = useRouter()

const NAV_DATA_KEY = 'mileage_nav_cards'

const excelTimeToStr = (value: any): string => {
  if (value === '' || value === null || value === undefined) return ''
  if (typeof value === 'string') {
    const s = value.trim()
    if (!s) return ''
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(s) || /^\d{1,2}:\d{2}$/.test(s)) return s
    const n = Number(s)
    if (!isNaN(n) && n > 0 && n < 2) {
      const totalSeconds = Math.round(n * 24 * 60 * 60)
      const h = Math.floor(totalSeconds / 3600)
      const m = Math.floor((totalSeconds % 3600) / 60)
      const sec = totalSeconds % 60
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }
    return s
  }
  if (typeof value === 'number') {
    if (value > 0 && value < 2) {
      const totalSeconds = Math.round(value * 24 * 60 * 60)
      const h = Math.floor(totalSeconds / 3600)
      const m = Math.floor((totalSeconds % 3600) / 60)
      const sec = totalSeconds % 60
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }
    return String(value)
  }
  return String(value)
}

interface RouteEntry {
  start: string
  end: string
  distance: number | string
}

interface MileageRow {
  _id: number
  time: string
  start: string
  end: string
  distance: number | string
  duration: string
  avgSpeed: number | string
  maxSpeed: number | string
  _isNew?: boolean
  _matched?: boolean
  _autoFilled?: boolean
}

const TRIP_STORAGE = 'mileage_tracker_data'
const ROUTE_STORAGE = 'mileage_route_cache'

const DEFAULT_ROUTES: RouteEntry[] = [
  { start: '福清泰康路', end: '莆田秀屿港', distance: 82.6 },
  { start: '莆田秀屿港', end: '福清泰康路', distance: 82.6 },
  { start: '福清泰康路', end: '松下码头', distance: 41.4 },
  { start: '松下码头', end: '福清泰康路', distance: 41.4 },
  { start: '福清泰康路', end: '申远码头', distance: 116.5 },
  { start: '申远码头', end: '福清泰康路', distance: 116.5 },
  { start: '松下码头', end: '申远码头', distance: 102.7 },
  { start: '松下码头', end: '福州马尾港', distance: 43.5 },
  { start: '福州马尾港', end: '福清泰康路', distance: 81.5 },
  { start: '福清泰康路', end: '福州马尾港', distance: 81.5 },
  { start: '福清泰康路', end: '福清江阴港', distance: 33.4 },
  { start: '福清江阴港', end: '福清泰康路', distance: 33.4 },
  { start: '福州马尾港', end: '福清江阴港', distance: 85.3 },
  { start: '申远码头', end: '福州马尾港', distance: 74.1 },
  { start: '福州马尾港', end: '申远码头', distance: 74.1 },
  { start: '莆田秀屿港', end: '福州马尾港', distance: 117.8 },
  { start: '福州马尾港', end: '莆田秀屿港', distance: 117.8 },
  { start: '福清泰康路', end: '长乐鑫通码头', distance: 83 },
  { start: '长乐鑫通码头', end: '福清泰康路', distance: 83 },
  { start: '福清江阴港', end: '申远码头', distance: 134.5 },
  { start: '莆田秀屿港', end: '申远码头', distance: 174.4 },
  { start: '申远码头', end: '莆田秀屿港', distance: 174.4 },
  { start: '福清江阴港', end: '莆田秀屿港', distance: 63.7 },
  { start: '莆田秀屿港', end: '福清江阴港', distance: 63.7 },
]

let nextId = 1

const tableData = ref<MileageRow[]>([])
const routeCache = ref<RouteEntry[]>([])
const justCached = ref(false)
const cacheStatus = ref<{ type: string; msg: string } | null>(null)
const cacheExpanded = ref(false)
const batchCount = ref(5)
const openDropdown = ref<string | null>(null)

const createRow = (): MileageRow => ({
  _id: nextId++,
  time: '',
  start: '',
  end: '',
  distance: '',
  duration: '',
  avgSpeed: '',
  maxSpeed: '',
  _isNew: true,
  _matched: false,
  _autoFilled: false,
})

const routeCacheCount = computed(() => routeCache.value.length)

const stats = computed(() => {
  const rows = tableData.value
  let totalDist = 0
  let maxSpd = 0
  let totalAvg = 0
  let avgCount = 0
  for (const r of rows) {
    const d = Number(r.distance)
    if (!isNaN(d) && d > 0) totalDist += d
    const mx = Number(r.maxSpeed)
    if (!isNaN(mx) && mx > maxSpd) maxSpd = mx
    const av = Number(r.avgSpeed)
    if (!isNaN(av) && av > 0) { totalAvg += av; avgCount++ }
  }
  return {
    totalDist: totalDist.toFixed(1),
    trips: rows.length,
    avgSpeed: avgCount > 0 ? (totalAvg / avgCount).toFixed(0) : '0',
    maxSpeed: maxSpd.toFixed(0),
  }
})

const findRoute = (start: string, end: string): RouteEntry | null => {
  if (!start || !end) return null
  const s = String(start).trim()
  const e = String(end).trim()
  if (!s || !e) return null
  return routeCache.value.find(r => {
    const rs = String(r.start).trim()
    const re = String(r.end).trim()
    return (rs === s && re === e) || (rs === e && re === s)
  }) || null
}

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const formatDuration = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface DrivingProfile {
  durationMinSec: number
  durationMaxSec: number
  avgSpeedMin: number
  avgSpeedMax: number
  maxSpeedMin: number
  maxSpeedMax: number
}

const getDrivingProfile = (distance: number): DrivingProfile | null => {
  if (distance > 110) {
    return { durationMinSec: 84 * 60, durationMaxSec: 88 * 60, avgSpeedMin: 78, avgSpeedMax: 85, maxSpeedMin: 117, maxSpeedMax: 129 }
  } else if (distance >= 70 && distance <= 90) {
    return { durationMinSec: 65 * 60, durationMaxSec: 71 * 60, avgSpeedMin: 77, avgSpeedMax: 83, maxSpeedMin: 117, maxSpeedMax: 122 }
  } else if (distance >= 30 && distance <= 45) {
    return { durationMinSec: 31 * 60, durationMaxSec: 40 * 60, avgSpeedMin: 75, avgSpeedMax: 78, maxSpeedMin: 117, maxSpeedMax: 122 }
  }
  return null
}

const autoFillStats = (row: MileageRow, force = false) => {
  const dist = Number(row.distance)
  if (isNaN(dist) || dist <= 0) return
  const profile = getDrivingProfile(dist)
  if (!profile) return

  const shouldFill = (val: any) => force || val === '' || val === 0 || val === null || val === undefined

  if (shouldFill(row.duration)) {
    row.duration = formatDuration(randInt(profile.durationMinSec, profile.durationMaxSec))
    row._autoFilled = true
  }
  if (shouldFill(row.avgSpeed)) {
    row.avgSpeed = randInt(profile.avgSpeedMin, profile.avgSpeedMax)
    row._autoFilled = true
  }
  if (shouldFill(row.maxSpeed)) {
    row.maxSpeed = randInt(profile.maxSpeedMin, profile.maxSpeedMax)
    row._autoFilled = true
  }
}

const tryMatchRoute = (row: MileageRow, force = false) => {
  const matched = findRoute(row.start, row.end)
  if (matched) {
    if (force || row.distance === '' || row.distance === 0 || row.distance === null || row.distance === undefined || row._autoFilled) {
      row.distance = matched.distance
      row._autoFilled = true
    }
    row._matched = true
    setTimeout(() => { row._matched = false }, 800)
    autoFillStats(row, force)
    return true
  }
  return false
}

const onRouteFieldInput = (row: MileageRow, field: 'start' | 'end') => {
  row._isNew = false
  row._autoFilled = false
  openDropdown.value = row._id + '_' + field
  nextTick(() => {
    if (openDropdown.value === row._id + '_' + field) {
      tryMatchRoute(row)
    }
  })
}

const onFieldFocus = (row: MileageRow) => {
  row._isNew = false
}

const onFieldBlur = () => {
  setTimeout(() => { openDropdown.value = null }, 200)
}

const onDistanceBlur = (row: MileageRow) => {
  row._isNew = false
  if (row.distance !== '' && row.distance !== 0 && row.distance !== null && row.distance !== undefined) {
    autoFillStats(row)
  }
}

interface Suggestion {
  name: string
  partner?: string
  distance?: number | string
}

const getSuggestions = (row: MileageRow, field: 'start' | 'end'): Suggestion[] => {
  const query = (field === 'start' ? row.start : row.end).trim()
  const otherVal = (field === 'start' ? row.end : row.start).trim()
  const results: Suggestion[] = []
  const seen = new Set<string>()

  if (otherVal) {
    for (const r of routeCache.value) {
      if (r.start.trim() === otherVal) {
        const name = r.end.trim()
        if (!seen.has(name) && (!query || name.includes(query))) {
          seen.add(name)
          results.push({ name, partner: otherVal, distance: r.distance })
        }
      }
      if (r.end.trim() === otherVal) {
        const name = r.start.trim()
        if (!seen.has(name) && (!query || name.includes(query))) {
          seen.add(name)
          results.push({ name, partner: otherVal, distance: r.distance })
        }
      }
    }
  }

  if (results.length === 0 && query) {
    const placeSet = new Set<string>()
    for (const r of routeCache.value) {
      placeSet.add(r.start.trim())
      placeSet.add(r.end.trim())
    }
    for (const place of placeSet) {
      if (place.includes(query) && !seen.has(place)) {
        seen.add(place)
        results.push({ name: place })
      }
    }
  }

  return results.slice(0, 8)
}

const applySuggestion = (row: MileageRow, field: 'start' | 'end', sug: Suggestion) => {
  if (field === 'start') {
    row.start = sug.name
  } else {
    row.end = sug.name
  }
  row._isNew = false
  openDropdown.value = null
  nextTick(() => tryMatchRoute(row))
}

const addRow = (count: number) => {
  for (let i = 0; i < count; i++) {
    tableData.value.push(createRow())
  }
  nextTick(() => {
    const inputs = document.querySelectorAll('.mileage-table tbody tr:last-child input')
    if (inputs.length > 0) (inputs[0] as HTMLElement).focus()
  })
}

const removeRow = (idx: number) => {
  tableData.value.splice(idx, 1)
}

const addCacheRow = () => {
  routeCache.value.push({ start: '', end: '', distance: '' })
}

const removeCacheRow = (idx: number) => {
  routeCache.value.splice(idx, 1)
}

const clearRouteCacheData = () => {
  if (routeCache.value.length === 0) {
    showStatus('error', '路线库已经是空的')
    return
  }
  if (confirm('确定清除所有路线缓存数据？此操作同时会清除本地存储中的路线数据，且不可撤销。')) {
    routeCache.value = []
    localStorage.removeItem(ROUTE_STORAGE)
    showStatus('success', '路线缓存已清除')
  }
}

const clearTripData = () => {
  if (tableData.value.length === 0) {
    showStatus('error', '行程数据已经是空的')
    return
  }
  if (confirm('确定清除所有行程记录数据？此操作同时会清除本地存储中的行程数据，且不可撤销。')) {
    tableData.value = []
    localStorage.removeItem(TRIP_STORAGE)
    showStatus('success', '行程数据已清除')
  }
}

const rematchAll = () => {
  let matchedCount = 0
  let filledCount = 0
  for (const r of tableData.value) {
    const before = r.distance
    if (tryMatchRoute(r, true)) {
      matchedCount++
      if (before === '' || before === 0 || before === null || before === undefined) filledCount++
    }
  }
  const total = tableData.value.length
  const unmatched = total - matchedCount
  let msg = `匹配完成：共 ${total} 条，命中路线库 ${matchedCount} 条`
  if (filledCount > 0) msg += `，新增填充 ${filledCount} 条`
  if (unmatched > 0) msg += `，${unmatched} 条未匹配`
  showStatus(matchedCount === total ? 'success' : 'error', msg)
}

const getColValue = (row: Record<string, any>, keywords: string[]): any => {
  const keys = Object.keys(row)
  for (const kw of keywords) {
    const exactKey = keys.find(k => k.trim() === kw)
    if (exactKey !== undefined) return row[exactKey]
  }
  for (const kw of keywords) {
    const fuzzyKey = keys.find(k => k.trim().includes(kw))
    if (fuzzyKey !== undefined) return row[fuzzyKey]
  }
  return ''
}

const parseExcel = (file: File): Promise<Record<string, any>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array', cellDates: false })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[]
        resolve(json)
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = () => reject(new Error('读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

const handleRouteImport = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const data = await parseExcel(file)
    if (data.length === 0) {
      showStatus('error', 'Excel文件为空或无法解析')
      target.value = ''
      return
    }
    const parsed: RouteEntry[] = []
    for (const row of data) {
      const start = String(getColValue(row, ['起点', 'start', '出发地', '起始点'])).trim()
      const end = String(getColValue(row, ['终点', 'end', '目的地', '到达点'])).trim()
      const distRaw = getColValue(row, ['导航里程', '导航里', 'distance', '里程', '距离', 'km'])
      const dist = distRaw === '' || distRaw === null || distRaw === undefined ? '' : Number(distRaw)
      if (start && end && !isNaN(Number(dist)) && Number(dist) > 0) {
        parsed.push({ start, end, distance: Number(dist) })
      }
    }
    const existing = new Set(routeCache.value.map(r => r.start.trim() + '→' + r.end.trim()))
    const existingReverse = new Set(routeCache.value.map(r => r.end.trim() + '→' + r.start.trim()))
    let added = 0
    for (const r of parsed) {
      const key = r.start + '→' + r.end
      const revKey = r.end + '→' + r.start
      if (!existing.has(key) && !existingReverse.has(revKey)) {
        routeCache.value.push(r)
        existing.add(key)
        added++
      }
    }
    if (parsed.length === 0) {
      showStatus('error', '未识别到有效的路线数据，请确保Excel包含「起点」「终点」「导航里程」列')
    } else {
      cacheExpanded.value = true
      showStatus(added > 0 ? 'success' : 'error', `路线库导入完成：识别 ${parsed.length} 条，新增 ${added} 条${added === 0 ? '（均已存在）' : ''}`)
    }
  } catch (err: any) {
    showStatus('error', '导入失败：' + (err?.message || '请检查文件格式'))
  }
  target.value = ''
}

const handleTripImport = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const data = await parseExcel(file)
    if (data.length === 0) {
      showStatus('error', 'Excel文件为空或无法解析')
      target.value = ''
      return
    }
    const parsed: MileageRow[] = []
    for (const row of data) {
      const start = String(getColValue(row, ['起点', 'start', '出发地'])).trim()
      const end = String(getColValue(row, ['终点', 'end', '目的地'])).trim()
      if (!start && !end) continue
      const timeVal = String(getColValue(row, ['时间', 'time', '日期', '出发时间'])).trim()
      const distRaw = getColValue(row, ['导航里程', '导航里', 'distance', '里程', '距离'])
      const durationVal = excelTimeToStr(getColValue(row, ['驾驶时长', '时长', 'duration', '用时']))
      const avgRaw = getColValue(row, ['平均速度', 'avgSpeed', '均速'])
      const maxRaw = getColValue(row, ['最快速度', 'maxSpeed', '最高速度', '极速'])
      parsed.push({
        _id: nextId++,
        time: timeVal,
        start,
        end,
        distance: (distRaw !== '' && distRaw !== null && distRaw !== undefined && !isNaN(Number(distRaw))) ? Number(distRaw) : '',
        duration: durationVal,
        avgSpeed: (avgRaw !== '' && avgRaw !== null && avgRaw !== undefined && !isNaN(Number(avgRaw))) ? Number(avgRaw) : '',
        maxSpeed: (maxRaw !== '' && maxRaw !== null && maxRaw !== undefined && !isNaN(Number(maxRaw))) ? Number(maxRaw) : '',
        _isNew: false,
        _matched: false,
        _autoFilled: false,
      })
    }
    let matchedCount = 0
    let filledDistCount = 0
    let autoStatsCount = 0
    for (const r of parsed) {
      const beforeDist = r.distance
      if (findRoute(r.start, r.end)) {
        tryMatchRoute(r, true)
        matchedCount++
        if (beforeDist === '' || beforeDist === 0) filledDistCount++
        if (r.duration === '' || r.avgSpeed === '' || r.maxSpeed === '') autoStatsCount++
      } else if (r.distance !== '' && Number(r.distance) > 0) {
        autoFillStats(r)
      }
    }
    tableData.value.push(...parsed)
    const unmatched = parsed.length - matchedCount
    let msg = `成功导入 ${parsed.length} 条行程记录，匹配路线库 ${matchedCount} 条`
    if (filledDistCount > 0) msg += `（自动填充里程 ${filledDistCount} 条）`
    if (unmatched > 0) msg += `，${unmatched} 条未匹配到路线`
    showStatus(matchedCount === parsed.length ? 'success' : 'error', msg)
  } catch (err: any) {
    showStatus('error', '导入失败：' + (err?.message || '请检查文件格式'))
  }
  target.value = ''
}

const showStatus = (type: string, msg: string) => {
  cacheStatus.value = { type, msg }
  setTimeout(() => { cacheStatus.value = null }, 3000)
}

const saveAllToCache = () => {
  try {
    const cleanTrips = tableData.value.map(r => ({
      time: r.time, start: r.start, end: r.end,
      distance: r.distance, duration: r.duration,
      avgSpeed: r.avgSpeed, maxSpeed: r.maxSpeed,
    }))
    const cleanRoutes = routeCache.value.map(r => ({
      start: r.start, end: r.end, distance: r.distance,
    }))
    localStorage.setItem(TRIP_STORAGE, JSON.stringify(cleanTrips))
    localStorage.setItem(ROUTE_STORAGE, JSON.stringify(cleanRoutes))
    justCached.value = true
    showStatus('success', '行程数据和路线库已缓存到本地')
    setTimeout(() => { justCached.value = false }, 2000)
  } catch {
    showStatus('error', '缓存失败')
  }
}

const goToNavPage = () => {
  if (tableData.value.length === 0) {
    showStatus('error', '暂无行程数据，请先导入或添加行程记录')
    return
  }
  const cards = tableData.value
    .filter(r => r.start && r.end)
    .map(r => ({
      time: r.time || '',
      start: r.start,
      end: r.end,
      distance: r.distance || '0',
      duration: r.duration || '',
      avgSpeed: r.avgSpeed || '0',
      maxSpeed: r.maxSpeed || '0',
    }))
  if (cards.length === 0) {
    showStatus('error', '没有有效的行程记录（需包含起点和终点）')
    return
  }
  localStorage.setItem(NAV_DATA_KEY, JSON.stringify(cards))
  router.push('/nav')
}

const loadFromCache = () => {
  try {
    const tripRaw = localStorage.getItem(TRIP_STORAGE)
    if (tripRaw) {
      const data = JSON.parse(tripRaw)
      if (Array.isArray(data)) {
        tableData.value = data.map((r: any) => ({ _id: nextId++, ...r, _isNew: false, _matched: false, _autoFilled: false }))
      }
    }
    const routeRaw = localStorage.getItem(ROUTE_STORAGE)
    if (routeRaw) {
      const data = JSON.parse(routeRaw)
      if (Array.isArray(data) && data.length > 0) {
        routeCache.value = data
        for (const r of tableData.value) {
          tryMatchRoute(r)
        }
        return
      }
    }
    routeCache.value = [...DEFAULT_ROUTES]
  } catch {
    routeCache.value = [...DEFAULT_ROUTES]
  }
}

onMounted(() => {
  loadFromCache()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

.mileage-page {
  margin: -24px;
  padding: 24px;
  min-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e2e8f0;
  background: linear-gradient(160deg, #0c1425 0%, #111c32 40%, #0f1928 100%);
  --accent: #f59e0b;
  --accent-glow: rgba(245, 158, 11, 0.25);
  --accent-bright: #fbbf24;
  --cyan: #22d3ee;
  --cyan-glow: rgba(34, 211, 238, 0.2);
  --green: #22c55e;
  --green-glow: rgba(34, 197, 94, 0.2);
  --red: #f87171;
  --bg-card: #1a2538;
  --bg-card-hover: #233048;
  --bg-surface: #0f172a;
  --bg-input: #0c1425;
  --border: #2d3f5a;
  --border-light: #475569;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-dim: #64748b;
}

.dashboard-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1a2744 100%);
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 28px 32px;
  position: relative;
  overflow: hidden;
}
.dashboard-header::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}
.dashboard-header::after {
  content: '';
  position: absolute; top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  pointer-events: none;
}

.header-title { display: flex; align-items: center; gap: 18px; margin-bottom: 24px; }
.icon-gauge { flex-shrink: 0; filter: drop-shadow(0 0 12px var(--accent-glow)); animation: gaugePulse 3s ease-in-out infinite; }
@keyframes gaugePulse {
  0%, 100% { filter: drop-shadow(0 0 12px var(--accent-glow)); }
  50% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.4)); }
}
.title-text h1 { font-size: 26px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0; letter-spacing: 1px; }
.title-text p { font-size: 13px; color: var(--text-secondary); margin: 0; letter-spacing: 0.5px; font-weight: 500; }

.stats-bar {
  display: flex; align-items: center; gap: 0;
  background: rgba(15, 23, 42, 0.6); border-radius: 10px;
  padding: 16px 8px; border: 1px solid rgba(51, 65, 85, 0.6);
  backdrop-filter: blur(8px);
}
.stat-card { flex: 1; text-align: center; padding: 0 12px; }
.stat-value {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 28px; font-weight: 700; color: var(--accent-bright);
  letter-spacing: -0.5px; text-shadow: 0 0 20px var(--accent-glow); line-height: 1.2;
}
.stat-value.accent-red { color: #f87171; text-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
.stat-unit { font-size: 14px; font-weight: 500; color: var(--text-dim); margin-left: 3px; text-shadow: none; }
.stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }
.stat-divider {
  width: 1px; height: 40px;
  background: linear-gradient(180deg, transparent, var(--border) 20%, var(--border) 80%, transparent);
}

.section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  position: relative;
}
.section::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), transparent);
}

.section-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; cursor: pointer; user-select: none;
  transition: background 0.2s;
}
.section-header:hover { background: var(--bg-card-hover); }

.section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: var(--cyan);
  flex: 1;
}
.badge-count {
  font-size: 11px; font-weight: 600; padding: 2px 8px;
  background: var(--cyan-glow); color: var(--cyan);
  border-radius: 10px; font-family: 'JetBrains Mono', monospace;
}
.section-actions { display: flex; gap: 8px; }
.chevron { color: var(--text-dim); transition: transform 0.3s; flex-shrink: 0; }
.chevron.expanded { transform: rotate(180deg); }

.cache-table-wrap { padding: 0 16px 16px; }
.cache-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cache-table th {
  padding: 10px 8px; text-align: left; font-weight: 600; font-size: 11px;
  color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase;
  border-bottom: 1px solid var(--border);
}
.cache-table td { padding: 6px 8px; border-bottom: 1px solid rgba(45, 63, 90, 0.3); }
.cache-table input {
  width: 100%; padding: 6px 10px; border-radius: 6px;
  border: 1px solid transparent; background: var(--bg-input);
  color: var(--text-primary); font-size: 13px; font-family: inherit;
  outline: none; transition: all 0.2s; box-sizing: border-box;
}
.cache-table input:focus {
  border-color: var(--cyan); box-shadow: 0 0 0 3px var(--cyan-glow);
}
.cache-table .num-input {
  font-family: 'JetBrains Mono', monospace; text-align: right; font-weight: 500;
}
.idx-cell {
  color: var(--text-dim); font-size: 11px; font-family: 'JetBrains Mono', monospace;
  text-align: center; width: 40px;
}
.action-cell { text-align: center; width: 50px; }
.empty-td {
  padding: 20px !important; text-align: center; color: var(--text-dim); font-size: 13px;
}
.cache-footer {
  padding: 10px 8px 0;
  border-top: 1px solid rgba(45, 63, 90, 0.3);
  margin-top: 4px;
}
.hint-text {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--text-dim);
}

.control-panel {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px;
}
.control-left, .control-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.batch-add-wrap { display: flex; align-items: center; gap: 6px; }
.batch-input {
  width: 60px; padding: 8px 8px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-primary); font-size: 13px; font-family: 'JetBrains Mono', monospace;
  text-align: center; outline: none; transition: all 0.2s;
}
.batch-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  font-family: inherit; cursor: pointer; border: 1px solid transparent;
  transition: all 0.2s ease; letter-spacing: 0.3px;
}
.btn-sm { padding: 6px 10px; font-size: 12px; }
.btn-ghost { background: var(--bg-card); color: var(--text-primary); border-color: var(--border); }
.btn-ghost:hover { background: var(--bg-card-hover); border-color: var(--border-light); transform: translateY(-1px); }
.btn-outline { background: transparent; color: var(--accent-bright); border-color: var(--accent); }
.btn-outline:hover { background: var(--accent-glow); box-shadow: 0 0 16px var(--accent-glow); transform: translateY(-1px); }
.btn-danger-ghost { background: transparent; color: var(--red); border-color: rgba(248, 113, 113, 0.3); }
.btn-danger-ghost:hover { background: rgba(248, 113, 113, 0.1); border-color: var(--red); }
.btn-danger-outline { background: transparent; color: var(--red); border-color: rgba(248, 113, 113, 0.5); }
.btn-danger-outline:hover { background: rgba(248, 113, 113, 0.12); border-color: var(--red); box-shadow: 0 0 12px rgba(239, 68, 68, 0.2); transform: translateY(-1px); }
.btn-nav-gen { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3); }
.btn-nav-gen:hover { background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4); transform: translateY(-1px); }
.reset-group { display: flex; gap: 8px; margin-left: auto; }
.btn-cache {
  background: linear-gradient(135deg, var(--accent), #d97706);
  color: #1a1a1a; font-weight: 700; border: none;
  box-shadow: 0 2px 12px var(--accent-glow);
  position: relative; overflow: hidden;
}
.btn-cache::before {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}
.btn-cache:hover::before { left: 100%; }
.btn-cache:hover { box-shadow: 0 4px 20px var(--accent-glow); transform: translateY(-1px); }
.btn-cached {
  background: linear-gradient(135deg, var(--green), #16a34a); color: #ffffff;
  box-shadow: 0 2px 12px rgba(34, 197, 94, 0.3);
}

.cache-indicator {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 500; padding: 6px 12px;
  border-radius: 20px; animation: fadeSlideIn 0.3s ease;
}
@keyframes fadeSlideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
.cache-indicator.success { color: var(--green); background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); }
.cache-indicator.error { color: var(--red); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }

.table-container {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden; position: relative;
}
.table-container::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}
.table-scroll { overflow-x: auto; }

.mileage-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.mileage-table thead { background: linear-gradient(180deg, #162032 0%, #131d2e 100%); }
.mileage-table th {
  padding: 14px 12px; text-align: left; font-weight: 600; font-size: 12px;
  color: var(--text-secondary); letter-spacing: 1px; text-transform: uppercase;
  border-bottom: 2px solid var(--border); white-space: nowrap; position: relative;
}
.mileage-table th:not(:last-child)::after {
  content: ''; position: absolute; right: 0; top: 25%; height: 50%;
  width: 1px; background: var(--border);
}
.mileage-table td {
  padding: 8px 10px; border-bottom: 1px solid rgba(45, 63, 90, 0.5); vertical-align: middle;
}
.mileage-table tbody tr { transition: background 0.15s ease; }
.mileage-table tbody tr:hover { background: var(--bg-card-hover); }
.mileage-table tbody tr:last-child td { border-bottom: none; }
.mileage-table tbody tr.row-new { animation: newRowPulse 2s ease; }
@keyframes newRowPulse { 0% { background: rgba(245, 158, 11, 0.12); } 100% { background: transparent; } }
.mileage-table tbody tr.row-matched { animation: matchFlash 0.8s ease; }
@keyframes matchFlash {
  0% { background: rgba(34, 211, 238, 0.15); }
  100% { background: transparent; }
}

.cell-wrap { position: relative; }

.col-time input, .col-start input, .col-end input, .col-num input {
  width: 100%; padding: 8px 10px; border-radius: 6px;
  border: 1px solid transparent; background: var(--bg-input);
  color: var(--text-primary); font-size: 13px; font-family: inherit;
  outline: none; transition: all 0.2s ease; box-sizing: border-box; min-width: 80px;
}
.col-num input { font-family: 'JetBrains Mono', 'Courier New', monospace; text-align: right; font-weight: 500; }
.col-time input { width: 160px; }
.col-start input, .col-end input { width: 140px; }
.col-num input { width: 120px; }
.col-time input::placeholder, .col-start input::placeholder, .col-end input::placeholder { color: var(--text-dim); font-family: inherit; }
.col-num input::placeholder { color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
.mileage-table tbody tr:hover input { border-color: var(--border); background: #162032; }
.col-time input:focus, .col-start input:focus, .col-end input:focus, .col-num input:focus {
  border-color: var(--accent) !important; background: #162032 !important;
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.col-start .has-dropdown input, .col-end .has-dropdown input {
  border-color: var(--cyan) !important;
  box-shadow: 0 0 0 3px var(--cyan-glow) !important;
  border-bottom-left-radius: 0; border-bottom-right-radius: 0;
}

input.auto-filled {
  color: var(--cyan) !important;
  border-color: rgba(34, 211, 238, 0.3) !important;
}

.suggest-dropdown {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 50;
  background: #1a2a42; border: 1px solid var(--cyan);
  border-top: none; border-radius: 0 0 8px 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4); max-height: 240px; overflow-y: auto;
  animation: dropDown 0.15s ease;
}
@keyframes dropDown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

.suggest-item {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; cursor: pointer; font-size: 13px;
  color: var(--text-primary); transition: background 0.1s;
  border-bottom: 1px solid rgba(45, 63, 90, 0.3);
}
.suggest-item:last-child { border-bottom: none; }
.suggest-item:hover { background: var(--cyan-glow); }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.start-dot { background: var(--green); box-shadow: 0 0 6px var(--green); }
.end-dot { background: var(--red); box-shadow: 0 0 6px var(--red); }
.sug-name { font-weight: 500; }
.sug-arrow {
  font-size: 11px; color: var(--cyan);
  font-family: 'JetBrains Mono', monospace; margin-left: auto;
  white-space: nowrap;
}

.col-action { text-align: center; width: 50px; }
.btn-del {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 6px;
  border: none; background: transparent; color: var(--text-dim);
  cursor: pointer; transition: all 0.2s ease; padding: 0;
}
.btn-del:hover { background: rgba(239, 68, 68, 0.15); color: var(--red); }

.empty-row td { padding: 60px 20px !important; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--text-dim); }
.empty-state p { font-size: 15px; font-weight: 600; color: var(--text-secondary); margin: 0; }
.empty-state span { font-size: 12px; color: var(--text-dim); text-align: center; max-width: 400px; }

@media (max-width: 900px) {
  .mileage-page { margin: -16px; padding: 16px; min-height: calc(100vh - 32px); }
  .dashboard-header { padding: 20px 16px; }
  .stats-bar { flex-wrap: wrap; gap: 8px; padding: 12px 4px; }
  .stat-divider { display: none; }
  .stat-card { min-width: calc(50% - 8px); padding: 8px 4px; }
  .stat-value { font-size: 22px; }
  .control-panel { flex-direction: column; align-items: stretch; }
  .control-left, .control-right { justify-content: center; flex-wrap: wrap; }
  .section-header { padding: 14px 12px; flex-wrap: wrap; }
  .col-time input { width: 140px; }
}
</style>
