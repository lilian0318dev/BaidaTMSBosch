'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { ChevronDown, RotateCcw, AlertTriangle } from 'lucide-react'

// ============ KPI Data ============
const KPI_DATA = [
  { label: '工单总数', value: '156', sub: '', color: '#1f2937', accent: '#3b82f6' },
  { label: '进行中', value: '32', sub: '占比 20.5%', color: '#2563eb', accent: '#3b82f6' },
  { label: '已完工', value: '94', sub: '占比 60.3%', color: '#22c55e', accent: '#22c55e' },
  { label: '待开始', value: '18', sub: '首工序尚未开工', color: '#f59e0b', accent: '#fbbf24' },
  { label: '已暂停', value: '7', sub: '', color: '#a855f7', accent: '#a78bfa' },
  { label: '本周完成', value: '42', sub: '', color: '#10b981', accent: '#34d399' },
]

// ============ 工单状态分布 ============
const STATUS_DIST = [
  { label: '进行中', count: 32, percent: 20.5, color: '#3b82f6' },
  { label: '已完工', count: 94, percent: 60.3, color: '#22c55e' },
  { label: '待开始', count: 18, percent: 11.5, color: '#f59e0b' },
  { label: '已暂停', count: 7, percent: 4.5, color: '#a855f7' },
]

// ============ 工序积压 TOP5 ============
const BACKLOG_PROCESSES = [
  { name: '精加工', count: 23, level: '严重积压', color: '#ef4444' },
  { name: '热处理', count: 18, level: '严重积压', color: '#f97316' },
  { name: '粗加工', count: 15, level: '中度积压', color: '#3b82f6' },
  { name: '装配', count: 11, level: '中度积压', color: '#8b5cf6' },
  { name: '检验', count: 8, level: '正常', color: '#06b6d4' },
]

// ============ 本周每日工单产出 ============
const WEEKLY_OUTPUT = [
  { day: '周一', plan: 38, actual: 42 },
  { day: '周二', plan: 40, actual: 38 },
  { day: '周三', plan: 42, actual: 45 },
  { day: '周四', plan: 42, actual: 41 },
  { day: '今日', plan: 45, actual: 32, isToday: true, note: '今日数据仍在更新中' },
  { day: '周六', plan: 30, actual: 0, isFuture: true, note: '周六周日为计划值' },
  { day: '周日', plan: 20, actual: 0, isFuture: true, note: '周六周日为计划值' },
]

// ============ 工单甘特数据 ============
interface GanttOrder {
  id: string
  woNo: string
  product: string
  progress: number
  status: string
  startOffset: number
  width: number
  color: string
  textColor?: string
}

const GANTT_ORDERS: GanttOrder[] = [
  { id: '1', woNo: 'WO-2024-02156', product: 'XM-259-A· 仪表盘外壳', progress: 60, status: '进行中', startOffset: 12, width: 75, color: '#3b82f6' },
  { id: '2', woNo: 'WO-2024-02155', product: 'XM-328-B· 控制面板', progress: 75, status: '进行中', startOffset: 18, width: 70, color: '#2563eb' },
  { id: '3', woNo: 'WO-2024-02154', product: 'XM-188-D· 医疗外壳', progress: 100, status: '已完工', startOffset: 5, width: 55, color: '#22c55e' },
  { id: '4', woNo: 'WO-2024-02153', product: 'XM-488-E· 保险丝支架', progress: 15, status: '进行中', startOffset: 8, width: 82, color: '#3b82f6' },
  { id: '5', woNo: 'WO-2024-02152', product: 'XM-128-F· 电子连接器', progress: 85, status: '进行中', startOffset: 25, width: 72, color: '#3b82f6' },
  { id: '6', woNo: 'WO-2024-02151', product: 'XM-268-B· 家电泵盖', progress: 45, status: '进行中', startOffset: 40, width: 60, color: '#3b82f6' },
  { id: '7', woNo: 'WO-2024-02150', product: 'XM-208-G· 玩具外壳', progress: 100, status: '已完工', startOffset: 0, width: 70, color: '#22c55e' },
  { id: '8', woNo: 'WO-2024-02149', product: 'XM-359-H· 仪器底座', progress: 100, status: '已完工', startOffset: 0, width: 58, color: '#22c55e' },
  { id: '9', woNo: 'WO-2024-02148', product: 'XM-508-I· 汽车内饰板', progress: 0, status: '待开始', startOffset: 50, width: 50, color: '#f59e0b' },
  { id: '10', woNo: 'WO-2024-02147', product: 'XM-158-J· 家电按钮', progress: 0, status: '待开始', startOffset: 62, width: 38, color: '#f59e0b' },
  { id: '11', woNo: 'WO-2024-02144', product: 'XM-458-N· 精密组件', progress: 30, status: '已暂停', startOffset: 30, width: 70, color: '#a855f7' },
]

// 环形进度条（工单状态分布）
function DonutChart({ total, segments }: { total: number; segments: { color: string; percent: number; label: string; count: number }[] }) {
  const size = 160
  const strokeW = 22
  const r = (size - strokeW) / 2
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeW} />
          {segments.map((seg, i) => {
            const dash = (seg.percent / 100) * c
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeW}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += dash
            return el
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500">工单总数</div>
          <div className="text-2xl font-bold text-gray-800">{total}</div>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs py-0.5">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-700 w-16">{s.label}</span>
            <div className="flex-1 flex items-end justify-end gap-3">
              <span className="text-gray-600 tabular-nums">{s.count}</span>
              <span className="text-gray-400 tabular-nums w-12 text-right">{s.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 水平条形图（工序积压）
function BacklogBar({ items }: { items: { name: string; count: number; level: string; color: string }[] }) {
  const max = Math.max(...items.map((x) => x.count))
  const levelColor: Record<string, string> = {
    '严重积压': 'bg-red-50 text-red-600',
    '中度积压': 'bg-yellow-50 text-yellow-600',
    '正常': 'bg-green-50 text-green-600',
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-16 shrink-0">{item.name}</span>
          <div className="flex-1 relative h-5 bg-gray-100 rounded">
            <div
              className="h-full rounded flex items-center justify-end pr-2 text-xs font-medium text-white"
              style={{
                width: `${(item.count / max) * 100}%`,
                background: `linear-gradient(to right, ${item.color}33, ${item.color})`,
              }}
            >
              {item.count}
            </div>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded shrink-0 ${levelColor[item.level] || ''}`}>{item.level}</span>
        </div>
      ))}
    </div>
  )
}

// 周产出柱状图
function WeeklyBarChart({ data }: { data: { day: string; plan: number; actual: number; isToday?: boolean; isFuture?: boolean; note?: string }[] }) {
  const max = 50
  const barW = 42
  const gap = 22
  const containerH = 280
  const chartBottom = 240
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="flex items-center gap-1 mb-2 justify-end">
          <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-600/80" /> 计划
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-gray-500 ml-3">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> 实际完成
          </span>
        </div>
        <svg width="100%" height={containerH} viewBox={`0 0 ${data.length * (barW * 2 + gap) + 40} ${containerH}`}>
          {/* Y axis gridlines */}
          {[0, 10, 20, 30, 40, 50].map((v) => {
            const y = chartBottom - (v / max) * 200
            return (
              <g key={v}>
                <line x1={30} y1={y} x2={data.length * (barW * 2 + gap) + 40} y2={y} stroke="#f3f4f6" strokeDasharray="4 4" />
                <text x={10} y={y + 4} fontSize="10" fill="#9ca3af" textAnchor="end">{v}</text>
              </g>
            )
          })}
          {/* Bars */}
          {data.map((d, i) => {
            const groupX = 40 + i * (barW * 2 + gap)
            const planH = (d.plan / max) * 200
            const actualH = (d.actual / max) * 200
            const planColor = d.isToday || d.isFuture ? '#93c5fd' : '#2563eb'
            const actualColor = d.isFuture ? '#67e8f9' : '#22c55e'
            return (
              <g key={i}>
                {/* plan */}
                <rect
                  x={groupX}
                  y={chartBottom - planH}
                  width={barW}
                  height={planH}
                  fill={planColor}
                  rx="3"
                />
                <text x={groupX + barW / 2} y={chartBottom - planH - 4} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="600">
                  {d.plan}
                </text>
                {/* actual */}
                <rect
                  x={groupX + barW + 2}
                  y={chartBottom - actualH}
                  width={barW}
                  height={actualH}
                  fill={actualColor}
                  rx="3"
                />
                {d.actual > 0 && (
                  <text x={groupX + barW + 2 + barW / 2} y={chartBottom - actualH - 4} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="600">
                    {d.actual}
                  </text>
                )}
                {/* label */}
                <text
                  x={groupX + barW + 1}
                  y={chartBottom + 18}
                  fontSize="12"
                  fill={d.isToday ? '#f59e0b' : '#6b7280'}
                  textAnchor="middle"
                  fontWeight={d.isToday ? 700 : 500}
                >
                  {d.day}
                </text>
              </g>
            )
          })}
          {/* X axis line */}
          <line x1={30} y1={chartBottom} x2={data.length * (barW * 2 + gap) + 40} y2={chartBottom} stroke="#e5e7eb" />
        </svg>
        <div className="text-right text-[10px] text-gray-400 mt-1">
          * 今日数据仍在更新中 / 周六周日为计划值
        </div>
      </div>
    </div>
  )
}

// ============ 工单甘特图 ============
function GanttBar({ order }: { order: GanttOrder }) {
  const barColor = order.color
  const barBg = '#f8fafc'
  const statusTextColor =
    order.status === '已完工' ? '#ffffff' :
    order.status === '已暂停' ? '#581c87' :
    order.status === '待开始' ? '#b45309' :
    '#ffffff'
  const isPastelBg = order.status === '待开始'
  return (
    <div className="grid grid-cols-[140px_200px_80px_1fr] items-center border-b border-gray-100 hover:bg-gray-50/50 transition-colors text-xs px-3 py-2.5">
      <div className="text-gray-700 font-mono">{order.woNo}</div>
      <div className="text-gray-800 truncate">{order.product}</div>
      <div className="font-semibold" style={{ color: barColor }}>{order.progress}%</div>
      <div className="relative h-7 flex items-center ml-2">
        {/* bg */}
        <div className="absolute inset-y-2 left-0 right-4 rounded" style={{ backgroundColor: barBg }} />
        {/* actual bar */}
        <div
          className="absolute h-5 rounded flex items-center justify-center text-[11px] font-medium"
          style={{
            left: `${order.startOffset}%`,
            width: `${order.width}%`,
            top: '6px',
            background: isPastelBg ? '#fbbf2433' : barColor,
            color: isPastelBg ? '#b45309' : statusTextColor,
            border: isPastelBg ? `1px dashed #f59e0b` : 'none',
          }}
        >
          {order.status}
        </div>
      </div>
    </div>
  )
}

export default function ProductionProgressPage() {
  const [statusFilter, setStatusFilter] = useState('全部状态')
  const [keyword, setKeyword] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      setLastUpdated(`${hh}:${mm}:${ss}`)
    }, 800)
  }

  const filteredOrders = GANTT_ORDERS.filter((o) => {
    if (!keyword) return true
    return o.woNo.toLowerCase().includes(keyword.toLowerCase()) || o.product.toLowerCase().includes(keyword.toLowerCase())
  })

  return (
    <MainLayout>
      <div className="h-full overflow-auto bg-[#f5f6f8] p-5">
        {/* ============ Page Header ============ */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">生产进度管理</h2>
            <p className="text-[11px] text-gray-400 mt-1">
              工单数据由 ERP 同步 ·
              {lastUpdated ? ` 最近刷新 ${lastUpdated}` : ' 点击右侧按钮刷新'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-200 text-gray-700 rounded hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <RotateCcw size={12} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? '刷新中...' : '刷新数据'}
          </button>
        </div>

        {/* ============ TOP KPI CARDS ============ */}
        <div className="grid grid-cols-6 gap-3 mb-4">
          {KPI_DATA.map((k, i) => (
            <div
              key={i}
              className="bg-white rounded border border-gray-200 px-4 py-3 relative overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: k.color }}
              />
              <div className="text-xs text-gray-500 mb-1.5">{k.label}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums" style={{ color: k.color }}>
                  {k.value}
                </span>
                {k.sub && <span className="text-[11px] text-gray-400">{k.sub}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* ============ Row: 工单状态分布 + 工序积压TOP5 ============ */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 工单状态分布 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">工单状态分布</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">各类状态工单数量与占比</p>
              </div>
              <span className="text-[11px] text-gray-400">总计 156 单</span>
            </div>
            <DonutChart
              total={156}
              segments={STATUS_DIST.map((s) => ({ color: s.color, percent: s.percent, label: s.label, count: s.count }))}
            />
          </div>

          {/* 工序积压TOP5 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">工序积压 TOP 5</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">各工序待处理工单数 - 识别瓶颈</p>
              </div>
              <span className="text-[11px] text-gray-400">共 7 个积压点</span>
            </div>
            <BacklogBar items={BACKLOG_PROCESSES} />
            <div className="mt-3 flex items-start gap-2 text-[11px] text-red-600 bg-red-50 rounded px-3 py-2">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              <span>精加工、热处理工序积压严重，建议增派 2 名操作工或加班排产</span>
            </div>
          </div>
        </div>

        {/* ============ Row: 本周每日工单产出 ============ */}
        <div className="bg-white rounded border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">本周每日工单产出</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">每日完成工单数 / 计划 vs 实际</p>
            </div>
          </div>
          <WeeklyBarChart data={WEEKLY_OUTPUT} />
        </div>

        {/* ============ Row: 工单进度甘特图 ============ */}
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">工单进度甘特图</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">横向时间轴显示工单进度 / 纵向工单编号 · 工单数据由 ERP 同步，本系统不做排产</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />已完工</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />进行中</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />待开始</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />已暂停</span>
            </div>
          </div>

          {/* filters */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <span className="text-xs text-gray-500">状态筛选</span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none border border-gray-200 rounded px-3 py-1.5 text-xs pr-7 bg-white focus:outline-none focus:border-blue-400 text-gray-700"
              >
                <option>全部状态</option>
                <option>已完工</option>
                <option>进行中</option>
                <option>待开始</option>
                <option>已暂停</option>
              </select>
              <ChevronDown size={10} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
            </div>
            <span className="text-xs text-gray-500 ml-2">关键词搜索</span>
            <div className="relative">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="工单编号 / 模具型号..."
                className="border border-gray-200 rounded px-3 py-1.5 text-xs w-52 focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>
            <button
              onClick={() => { setStatusFilter('全部状态'); setKeyword('') }}
              className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50"
            >
              <RotateCcw size={11} /> 重置筛选
            </button>
          </div>

          {/* table header */}
          <div className="grid grid-cols-[140px_200px_80px_1fr] items-center bg-gray-50 text-[11px] text-gray-500 px-3 py-2 rounded-t border-b border-gray-200">
            <div>工单编号</div>
            <div>工装编号/名称</div>
            <div>进度</div>
            <div className="ml-2">时间轴</div>
          </div>

          {/* rows */}
          <div>
            {filteredOrders.map((order) => (
              <GanttBar key={order.id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
