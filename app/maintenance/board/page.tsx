'use client'

import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  BarChart3, PieChart, TrendingUp, AlertTriangle, Search,
  RotateCcw, ChevronDown, FileText, Wrench, Clock,
  CheckCircle, XCircle, Settings,
} from 'lucide-react'

/* ============ 数据定义 ============ */

interface WorkOrder {
  id: string
  type: 'level1' | 'level2'
  moldId: string
  moldName: string
  trigger: string
  deadline: string
  status: string
  isOverdue: boolean
  operator: string
  isOutsourcing: boolean
  inspectionResult?: 'pass' | 'fail' | null
  acceptResult?: 'pass' | 'fail' | null
  completeTime?: string
}

const STATUS_COLORS: Record<string, string> = {
  '待领取': 'bg-gray-100 text-gray-700',
  '待入库': 'bg-orange-100 text-orange-700',
  '执行中': 'bg-blue-100 text-blue-700',
  '待验收': 'bg-yellow-100 text-yellow-700',
  '待检验': 'bg-purple-100 text-purple-700',
  '不合格整改': 'bg-red-100 text-red-700',
  '已完成': 'bg-green-100 text-green-700',
  '已退回': 'bg-red-100 text-red-700',
}

const STATUS_BAR_COLORS: Record<string, string> = {
  '待领取': '#94a3b8',
  '待入库': '#fb923c',
  '执行中': '#3b82f6',
  '待验收': '#eab308',
  '待检验': '#8b5cf6',
  '不合格整改': '#ef4444',
  '已完成': '#22c55e',
  '已退回': '#dc2626',
}

const INITIAL_ORDERS: WorkOrder[] = [
  { id: 'BT-2026-0001', type: 'level1', moldId: 'GJ-2024-001', moldName: '冲压模A型', trigger: '时间周期', deadline: '2026-06-22', status: '待领取', isOverdue: false, operator: '-', isOutsourcing: false },
  { id: 'BT-2026-0002', type: 'level1', moldId: 'GJ-2024-002', moldName: '冲压模B型', trigger: '时间周期', deadline: '2026-06-18', status: '执行中', isOverdue: true, operator: '李师傅', isOutsourcing: false },
  { id: 'BT-2026-0003', type: 'level1', moldId: 'GJ-2024-021', moldName: '冲压模G型', trigger: '时间周期', deadline: '2026-06-10', status: '待验收', isOverdue: false, operator: '王师傅', isOutsourcing: false },
  { id: 'BT-2026-0004', type: 'level1', moldId: 'GJ-2024-018', moldName: '拉伸模E型', trigger: '生产次数', deadline: '2026-06-25', status: '已完成', isOverdue: false, operator: '张师傅', isOutsourcing: false, acceptResult: 'pass', completeTime: '2026-06-19' },
  { id: 'BT-2026-0005', type: 'level1', moldId: 'GJ-2024-012', moldName: '压铸模D型', trigger: '时间周期', deadline: '2026-06-16', status: '已退回', isOverdue: true, operator: '刘师傅', isOutsourcing: false, acceptResult: 'fail' },
  { id: 'BT-2026-0006', type: 'level1', moldId: 'GJ-2023-003', moldName: '注塑模B型', trigger: '时间周期', deadline: '2026-06-18', status: '已完成', isOverdue: false, operator: '李师傅', isOutsourcing: false, acceptResult: 'pass', completeTime: '2026-06-18' },
  { id: 'BT-2026-0007', type: 'level1', moldId: 'GJ-2024-007', moldName: '注塑模C型', trigger: '生产次数', deadline: '2026-06-28', status: '待入库', isOverdue: false, operator: '-', isOutsourcing: false },
  { id: 'BT-2026-0008', type: 'level1', moldId: 'GJ-2024-005', moldName: '热段模F型', trigger: '生产次数', deadline: '2026-06-25', status: '待领取', isOverdue: false, operator: '-', isOutsourcing: false },
  { id: 'BT-2026-1001', type: 'level2', moldId: 'GJ-2024-007', moldName: '注塑模C型', trigger: '生产次数', deadline: '2026-06-28', status: '待入库', isOverdue: false, operator: '-', isOutsourcing: false },
  { id: 'BT-2026-1002', type: 'level2', moldId: 'GJ-2024-005', moldName: '热段模F型', trigger: '生产次数', deadline: '2026-06-25', status: '待领取', isOverdue: false, operator: '-', isOutsourcing: false },
  { id: 'BT-2026-1003', type: 'level2', moldId: 'GJ-2024-005', moldName: '热段模F型', trigger: '生产次数', deadline: '2026-06-20', status: '执行中', isOverdue: false, operator: '赵钳工', isOutsourcing: true },
  { id: 'BT-2026-1004', type: 'level2', moldId: 'GJ-2024-002', moldName: '冲压模B型', trigger: '生产次数', deadline: '2026-06-15', status: '待检验', isOverdue: true, operator: '孙钳工', isOutsourcing: false },
  { id: 'BT-2026-1005', type: 'level2', moldId: 'GJ-2024-018', moldName: '拉伸模E型', trigger: '时间周期', deadline: '2026-06-23', status: '不合格整改', isOverdue: false, operator: '周钳工', isOutsourcing: false, inspectionResult: 'fail' },
  { id: 'BT-2026-1006', type: 'level2', moldId: 'GJ-2024-018', moldName: '拉伸模E型', trigger: '时间周期', deadline: '2026-06-10', status: '已完成', isOverdue: false, operator: '吴钳工', isOutsourcing: true, inspectionResult: 'pass', completeTime: '2026-06-09' },
  { id: 'BT-2026-1007', type: 'level2', moldId: 'GJ-2024-001', moldName: '冲压模A型', trigger: '生产次数', deadline: '2026-06-17', status: '已完成', isOverdue: false, operator: '吴钳工', isOutsourcing: false, inspectionResult: 'pass', completeTime: '2026-06-17' },
]

const ALL_STATUSES = ['待领取', '待入库', '执行中', '待验收', '待检验', '不合格整改', '已完成']

const IN_PROGRESS_STATUSES = ['待领取', '待入库', '执行中', '待验收', '待检验', '不合格整改']

function matchChartFilter(order: WorkOrder, filter: string): boolean {
  switch (filter) {
    case 'completed':
      return order.status === '已完成'
    case 'overdue':
      return order.isOverdue === true
    case 'inprogress':
      return IN_PROGRESS_STATUSES.includes(order.status)
    case 'outsourcing':
      return order.isOutsourcing === true
    case 'level1':
      return order.type === 'level1'
    case 'level2':
      return order.type === 'level2'
    default:
      return order.status === filter
  }
}

/* ============ 页面主体 ============ */

export default function MaintenanceBoardPage() {
  const [orders] = useState<WorkOrder[]>(INITIAL_ORDERS)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterOverdue, setFilterOverdue] = useState('')
  const [filterOutsource, setFilterOutsource] = useState('')
  const [activeChartFilter, setActiveChartFilter] = useState('')

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const matchSearch =
          !search ||
          o.id.toLowerCase().includes(search.toLowerCase()) ||
          o.moldId.toLowerCase().includes(search.toLowerCase()) ||
          o.moldName.toLowerCase().includes(search.toLowerCase())
        const matchType =
          !filterType || (filterType === 'level1' ? o.type === 'level1' : o.type === 'level2')
        const matchStatus = !filterStatus || o.status === filterStatus
        const matchOutsource = !filterOutsource || o.isOutsourcing === true
        const matchOverdue =
          !filterOverdue ||
          (filterOverdue === 'overdue' ? o.isOverdue === true : o.isOverdue === false)
        const matchChart = !activeChartFilter || matchChartFilter(o, activeChartFilter)
        return matchSearch && matchType && matchStatus && matchOutsource && matchOverdue && matchChart
      }),
    [orders, search, filterType, filterStatus, filterOverdue, filterOutsource, activeChartFilter],
  )

  // 核心 KPI 计算
  const kpis = useMemo(() => {
    const total = orders.length
    const completed = orders.filter((o) => o.status === '已完成').length
    const overdue = orders.filter((o) => o.isOverdue).length
    const inProgress = orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status)).length
    const outsourcing = orders.filter((o) => o.isOutsourcing === true && o.status !== '已完成').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, overdue, inProgress, outsourcing, completionRate }
  }, [orders])

  // 状态分布（柱状图）
  const statusDistribution = useMemo(
    () => ALL_STATUSES.map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length })),
    [orders],
  )

  // 保养级别分布（饼图）
  const levelDistribution = useMemo(
    () => [
      { name: '一级保养', count: orders.filter((o) => o.type === 'level1').length, color: '#1e5fa8' },
      { name: '二级保养', count: orders.filter((o) => o.type === 'level2').length, color: '#d97706' },
    ],
    [orders],
  )

  // 近7天完成趋势（折线图）
  const weeklyTrend = useMemo(
    () => [
      { day: '06-14', level1: 2, level2: 1 },
      { day: '06-15', level1: 1, level2: 2 },
      { day: '06-16', level1: 2, level2: 1 },
      { day: '06-17', level1: 3, level2: 1 },
      { day: '06-18', level1: 2, level2: 2 },
      { day: '06-19', level1: 1, level2: 1 },
      { day: '06-20', level1: 2, level2: 1 },
    ],
    [],
  )

  // 逾期模具Top 3
  const topOverdue = useMemo(() => {
    const map = new Map<string, { moldId: string; moldName: string; count: number }>()
    orders.filter((o) => o.isOverdue).forEach((o) => {
      const existing = map.get(o.moldId)
      if (existing) existing.count++
      else map.set(o.moldId, { moldId: o.moldId, moldName: o.moldName, count: 1 })
    })
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 3)
  }, [orders])

  const maxBar = Math.max(...statusDistribution.map((s) => s.count), 1)
  const maxWeek = Math.max(...weeklyTrend.map((w) => w.level1 + w.level2), 1)

  const handleExport = () => {
    alert(
      `看板数据导出\n\n总任务数：${kpis.total}\n已完成：${kpis.completed}\n逾期未保养：${kpis.overdue}\n在途任务：${kpis.inProgress}\n委外单数：${kpis.outsourcing}`,
    )
  }

  const resetAll = () => {
    setSearch('')
    setFilterType('')
    setFilterStatus('')
    setFilterOverdue('')
    setFilterOutsource('')
    setActiveChartFilter('')
  }

  // 饼图 SVG
  const renderPieChart = () => {
    const total = levelDistribution.reduce((acc, d) => acc + d.count, 0)
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-[140px] text-[12px] text-gray-400">
          暂无数据
        </div>
      )
    }
    let startAngle = -90
    const slices = levelDistribution.map((d) => {
      const angle = (d.count / total) * 360
      const endAngle = startAngle + angle
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180
      const x1 = 70 + 55 * Math.cos(startRad)
      const y1 = 70 + 55 * Math.sin(startRad)
      const x2 = 70 + 55 * Math.cos(endRad)
      const y2 = 70 + 55 * Math.sin(endRad)
      const largeArc = angle > 180 ? 1 : 0
      const path = `M 70 70 L ${x1} ${y1} A 55 55 0 ${largeArc} 1 ${x2} ${y2} Z`
      startAngle = endAngle
      return { d, path }
    })
    return (
      <svg width="140" height="140" viewBox="0 0 140 140">
        {slices.map((s, idx) => (
          <path
            key={idx}
            d={s.path}
            fill={s.d.color}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveChartFilter(s.d.name === '一级保养' ? 'level1' : 'level2')}
          />
        ))}
        <circle cx="70" cy="70" r="33" fill="white" />
        <text x="70" y="68" textAnchor="middle" className="fill-gray-800" style={{ fontSize: 14, fontWeight: 700 }}>
          {kpis.total}
        </text>
        <text x="70" y="84" textAnchor="middle" className="fill-gray-400" style={{ fontSize: 10 }}>
          任务总数
        </text>
      </svg>
    )
  }

  // 折线图 SVG
  const renderLineChart = () => {
    const chartW = 360
    const chartH = 90
    const offsetX = 40
    const offsetY = 10
    const stepX = chartW / (weeklyTrend.length - 1)
    const scaleY = (val: number) => offsetY + chartH - (val / maxWeek) * chartH

    const points1 = weeklyTrend.map((w, idx) => `${offsetX + idx * stepX},${scaleY(w.level1)}`).join(' ')
    const points2 = weeklyTrend.map((w, idx) => `${offsetX + idx * stepX},${scaleY(w.level2)}`).join(' ')

    return (
      <svg width="100%" height="150" viewBox="0 0 440 160">
        {[0, 30, 60, 90, 120].map((y) => (
          <line key={y} x1="30" y1={y + 10} x2="410" y2={y + 10} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        <polyline points={points1} fill="none" stroke="#1e5fa8" strokeWidth="2.5" strokeLinejoin="round" />
        {weeklyTrend.map((w, idx) => {
          const x = offsetX + idx * stepX
          const y = scaleY(w.level1)
          return (
            <g key={`l1-${idx}`}>
              <circle cx={x} cy={y} r="3.5" fill="#1e5fa8" />
              <text x={x} y={y - 6} textAnchor="middle" className="fill-[#1e5fa8]" style={{ fontSize: 9, fontWeight: 700 }}>
                {w.level1}
              </text>
            </g>
          )
        })}
        <polyline points={points2} fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="4 3" strokeLinejoin="round" />
        {weeklyTrend.map((w, idx) => {
          const x = offsetX + idx * stepX
          const y = scaleY(w.level2)
          return (
            <g key={`l2-${idx}`}>
              <circle cx={x} cy={y} r="3.5" fill="#d97706" />
              <text x={x} y={y + 12} textAnchor="middle" className="fill-[#d97706]" style={{ fontSize: 9, fontWeight: 700 }}>
                {w.level2}
              </text>
            </g>
          )
        })}
        {weeklyTrend.map((w, idx) => (
          <text
            key={`x-${idx}`}
            x={offsetX + idx * stepX}
            y="140"
            textAnchor="middle"
            className="fill-gray-400"
            style={{ fontSize: 9 }}
          >
            {w.day}
          </text>
        ))}
      </svg>
    )
  }

  return (
    <MainLayout>
      <div className="p-4 flex flex-col gap-3 h-full">
        {/* 顶部标题区 */}
        <div className="bg-white rounded border border-gray-200 px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-[#1e5fa8]" size={20} />
            <span className="text-gray-800 font-semibold text-sm">保养工单看板</span>
            <span className="text-[11px] text-gray-400">· 管理监控视图</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-[12px]">
            <div className="text-gray-500">计划完成率</div>
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1e5fa8] rounded-full transition-all"
                style={{ width: `${kpis.completionRate}%` }}
              />
            </div>
            <div className="text-[#1e5fa8] font-bold text-sm">{kpis.completionRate}%</div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e5fa8] hover:bg-[#164a85] text-white text-xs rounded font-medium transition-colors"
            >
              <FileText size={12} /> 导出看板数据
            </button>
          </div>
        </div>

        {/* KPI 指标卡片 */}
        <div className="grid grid-cols-5 gap-2">
          <KpiCard
            title="计划保养完成率"
            value={`${kpis.completionRate}%`}
            subtext={`已完成 ${kpis.completed}/${kpis.total}`}
            bg="bg-[#1e5fa8]"
            icon={<CheckCircle size={14} />}
            onClick={() => setActiveChartFilter(activeChartFilter === 'completed' ? '' : 'completed')}
            active={activeChartFilter === 'completed'}
          />
          <KpiCard
            title="逾期未保养数"
            value={kpis.overdue}
            subtext="需立即处理"
            bg="bg-red-500"
            icon={<AlertTriangle size={14} />}
            onClick={() => setActiveChartFilter(activeChartFilter === 'overdue' ? '' : 'overdue')}
            active={activeChartFilter === 'overdue'}
          />
          <KpiCard
            title="平均保养耗时"
            value="1.8 小时"
            subtext="一级 1.2h / 二级 2.5h"
            bg="bg-amber-500"
            icon={<Clock size={14} />}
            onClick={() => {}}
            active={false}
          />
          <KpiCard
            title="在途保养任务"
            value={kpis.inProgress}
            subtext="含待领取/执行/验收"
            bg="bg-blue-500"
            icon={<Wrench size={14} />}
            onClick={() => setActiveChartFilter(activeChartFilter === 'inprogress' ? '' : 'inprogress')}
            active={activeChartFilter === 'inprogress'}
          />
          <KpiCard
            title="委外保养单数"
            value={kpis.outsourcing}
            subtext="二级保养委外"
            bg="bg-purple-500"
            icon={<Settings size={14} />}
            onClick={() => setActiveChartFilter(activeChartFilter === 'outsourcing' ? '' : 'outsourcing')}
            active={activeChartFilter === 'outsourcing'}
          />
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-3 gap-3">
          {/* 饼图 - 保养级别分布 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-700 font-semibold mb-3 flex items-center gap-1.5">
              <PieChart size={13} className="text-[#1e5fa8]" /> 保养级别分布
            </div>
            <div className="flex items-center justify-center gap-5 py-3">
              {renderPieChart()}
              <div className="space-y-2">
                {levelDistribution.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={() => setActiveChartFilter(d.name === '一级保养' ? 'level1' : 'level2')}
                  >
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
                    <div className="text-[11px] text-gray-600">{d.name}</div>
                    <div className="text-[12px] font-bold text-gray-800 ml-auto">{d.count}</div>
                    <span className="text-[10px] text-gray-400">
                      {kpis.total > 0 ? Math.round((d.count / kpis.total) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 柱状图 - 状态分布 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-700 font-semibold mb-3 flex items-center gap-1.5">
              <BarChart3 size={13} className="text-[#1e5fa8]" /> 任务状态分布
            </div>
            <div className="flex items-end gap-1.5 h-[140px] px-1 py-2">
              {statusDistribution.map((s) => {
                const height = s.count === 0 ? 4 : Math.max(8, (s.count / maxBar) * 110)
                const color = STATUS_BAR_COLORS[s.status] || '#94a3b8'
                const isActive = activeChartFilter === s.status
                return (
                  <div
                    key={s.status}
                    className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-opacity ${isActive ? 'opacity-100' : 'hover:opacity-80'}`}
                    onClick={() => setActiveChartFilter(isActive ? '' : s.status)}
                  >
                    <div className="text-[11px] font-bold text-gray-800">{s.count}</div>
                    <div
                      className={`w-full rounded-t transition-all hover:scale-y-105 ${isActive ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                      style={{ height: `${height}px`, backgroundColor: color }}
                    />
                    <div className="text-[10px] text-gray-500 text-center leading-tight mt-1">
                      {s.status.slice(0, 4)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 折线图 - 近7天完成趋势 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-700 font-semibold mb-3 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-[#1e5fa8]" /> 近7天完成趋势
            </div>
            {renderLineChart()}
            <div className="flex items-center justify-center gap-4 mt-1 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-[#1e5fa8]" /> 一级保养
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-[#d97706]" /> 二级保养
              </span>
            </div>
          </div>
        </div>

        {/* 逾期TOP 和筛选工具栏 + 表格 */}
        <div className="flex gap-3 items-start flex-1 min-h-0">
          {/* 逾期模具排行 */}
          <div className="bg-white rounded border border-gray-200 p-4 w-80 shrink-0">
            <div className="text-xs text-gray-700 font-semibold mb-3 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-red-500" /> 逾期模具 Top 3
            </div>
            <div className="space-y-2">
              {topOverdue.length === 0 ? (
                <div className="text-[12px] text-gray-400 py-4 text-center">暂无逾期模具</div>
              ) : (
                topOverdue.map((m, idx) => (
                  <div
                    key={m.moldId}
                    className="flex items-center gap-2 p-2 rounded bg-red-50/30 border border-red-100"
                  >
                    <div className="w-6 h-6 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-gray-800 truncate">{m.moldName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{m.moldId}</div>
                    </div>
                    <div className="text-[12px] text-red-600 font-bold">{m.count}次</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 右侧：筛选 + 表格 */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {/* 工具栏 */}
            <div className="bg-white rounded border border-gray-200 px-3 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Search size={13} className="text-gray-400" />
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="任务单号/模具编号搜索"
                  className="border border-gray-200 rounded px-2.5 py-1.5 text-[12px] w-60 focus:outline-none focus:border-blue-400"
                />
                <FilterSelect
                  value={filterType}
                  onChange={setFilterType}
                  placeholder="全部级别"
                  options={[
                    { value: 'level1', label: '一级保养' },
                    { value: 'level2', label: '二级保养' },
                  ]}
                />
                <FilterSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  placeholder="全部状态"
                  options={ALL_STATUSES.map((s) => ({ value: s, label: s }))}
                />
                <FilterSelect
                  value={filterOverdue}
                  onChange={setFilterOverdue}
                  placeholder="逾期状态"
                  options={[
                    { value: 'overdue', label: '仅逾期' },
                    { value: 'normal', label: '仅未逾期' },
                  ]}
                />
                <FilterSelect
                  value={filterOutsource}
                  onChange={setFilterOutsource}
                  placeholder="是否委外"
                  options={[{ value: 'yes', label: '是' }]}
                />
                {activeChartFilter && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#1e5fa8] bg-blue-50 border border-blue-200 rounded px-2 py-1">
                    图表筛选: {activeChartFilter}
                    <button
                      onClick={() => setActiveChartFilter('')}
                      className="text-red-500 hover:text-red-700 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-300 rounded px-2.5 py-1.5 hover:bg-gray-50"
                >
                  <RotateCcw size={12} /> 重置
                </button>
                <div className="flex-1" />
                <div className="text-[11px] text-gray-400">共 {filteredOrders.length} 条工单</div>
                <button
                  onClick={() => alert('已批量催办逾期任务')}
                  className="flex items-center gap-1.5 text-[12px] text-orange-600 border border-orange-300 px-3 py-1.5 rounded hover:bg-orange-50"
                >
                  <AlertTriangle size={12} /> 批量催办
                </button>
              </div>
            </div>

            {/* 表格 */}
            <div className="flex-1 bg-white rounded border border-gray-200 overflow-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {[
                      '任务单号',
                      '模具编号',
                      '模具名称',
                      '保养级别',
                      '触发类型',
                      '计划执行',
                      '当前状态',
                      '逾期',
                      '执行人',
                      '委外',
                      '检验/验收',
                      '完成时间',
                      '操作',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-[11px] text-gray-500 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="text-[12px] text-[#1e5fa8] font-mono font-semibold">{o.id}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] font-mono text-gray-700">{o.moldId}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-800 font-medium">{o.moldName}</td>
                      <td className="px-3 py-2.5 text-[12px]">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
                            o.type === 'level1' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {o.type === 'level1' ? '一级保养' : '二级保养'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600">{o.trigger}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600 whitespace-nowrap">{o.deadline}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${STATUS_COLORS[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[12px]">
                        {o.isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-red-600 text-[11px] font-medium">
                            <AlertTriangle size={11} /> 逾期
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">正常</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600 whitespace-nowrap">{o.operator}</td>
                      <td className="px-3 py-2.5 text-[12px]">
                        {o.isOutsourcing ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[11px] font-medium">
                            是
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[11px]">
                            否
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[12px]">
                        {o.inspectionResult === 'pass' && (
                          <span className="inline-flex items-center gap-1 text-green-600 text-[11px] font-medium">
                            <CheckCircle size={11} /> 检验合格
                          </span>
                        )}
                        {o.inspectionResult === 'fail' && (
                          <span className="inline-flex items-center gap-1 text-red-600 text-[11px] font-medium">
                            <XCircle size={11} /> 不合格
                          </span>
                        )}
                        {o.acceptResult === 'pass' && (
                          <span className="inline-flex items-center gap-1 text-green-600 text-[11px] font-medium">
                            <CheckCircle size={11} /> 验收通过
                          </span>
                        )}
                        {o.acceptResult === 'fail' && (
                          <span className="inline-flex items-center gap-1 text-red-600 text-[11px] font-medium">
                            <XCircle size={11} /> 未通过
                          </span>
                        )}
                        {!o.inspectionResult && !o.acceptResult && (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600 whitespace-nowrap">
                        {o.completeTime || '-'}
                      </td>
                      <td className="px-3 py-2.5">
                        <button className="text-[11px] text-[#1e5fa8] hover:underline whitespace-nowrap">
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={13} className="px-4 py-16 text-center text-xs text-gray-400">
                        暂无匹配的工单
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

/* ============ 辅助组件 ============ */

function KpiCard({
  title,
  value,
  subtext,
  bg,
  icon,
  onClick,
  active,
}: {
  title: string
  value: string | number
  subtext: string
  bg: string
  icon: React.ReactNode
  onClick: () => void
  active: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`${bg} rounded p-3 flex flex-col cursor-pointer transition-all hover:shadow-md ${
        active ? 'ring-2 ring-white ring-offset-2 ring-offset-[#f8fafc]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-white text-[11px] font-medium leading-tight">{title}</div>
        <div className="text-white/80">{icon}</div>
      </div>
      <div className="text-white text-2xl font-bold mt-1.5 leading-tight">{value}</div>
      <div className="text-white/80 text-[10px] mt-1.5">{subtext}</div>
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-[12px] pr-7 bg-white focus:outline-none focus:border-blue-400 cursor-pointer min-w-[90px]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={10}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  )
}
