'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  CalendarClock, Filter, RotateCcw, Plus, Eye, Pencil, Trash2,
  PlayCircle, PauseCircle, AlertTriangle, Search, ChevronDown,
  Package, Cpu, Layers, CheckCircle2, X, Clock, Wrench, FileText,
  Zap, History, Settings2,
} from 'lucide-react'

/* ================ 数据定义 ================ */

// 保养级别
const LEVEL_OPTIONS = ['一级保养', '二级保养', '三级（易损件）保养']
const LEVEL_COLORS: Record<string, string> = {
  '一级保养': 'bg-blue-100 text-blue-700',
  '二级保养': 'bg-purple-100 text-purple-700',
  '三级（易损件）保养': 'bg-amber-100 text-amber-700',
}

// 模具类型
const MOLD_TYPES = ['冲压类', '热段模', '注塑类', '压铸类', '拉伸类']

// 时间周期选项
const TIME_CYCLES = ['每批次', '每日', '每周', '每月', '每季度', '每半年', '每年']

// 生产次数周期选项
const COUNT_CYCLES = ['每1000次', '每5000次', '每10000次', '自定义次数']

// 计划状态
const PLAN_STATUSES = ['未生效', '生效中', '已暂停', '已过期', '已完成']
const STATUS_COLORS: Record<string, string> = {
  '未生效': 'bg-gray-100 text-gray-600',
  '生效中': 'bg-green-100 text-green-700',
  '已暂停': 'bg-orange-100 text-orange-700',
  '已过期': 'bg-red-100 text-red-700',
  '已完成': 'bg-blue-100 text-blue-700',
}

// 标准保养项目库（按 模具类型 + 保养级别 预设）
const STANDARD_LIBRARY: Record<string, Array<{ name: string; standard: string; cycle: string }>> = {
  '冲压类_一级保养': [
    { name: '检查模具标识', standard: '模具编号/名称/状态清晰可辨识', cycle: '每批次归库前完成' },
    { name: '外观检测', standard: '表面无划痕/无裂纹/无粘料', cycle: '每批次归库前完成' },
    { name: '检查紧固件', standard: '螺栓/螺母/压板紧固无松动', cycle: '每批次归库前完成' },
    { name: '润滑导柱导套', standard: '润滑均匀无干摩擦', cycle: '每批次归库前完成' },
    { name: '清理废料堆积', standard: '无废料残留/废料通道畅通', cycle: '每批次归库前完成' },
    { name: '检查顶出系统', standard: '顶针动作顺畅无卡滞', cycle: '每批次归库前完成' },
  ],
  '冲压类_二级保养': [
    { name: '合模精度检测', standard: '对角线偏差 ≤ 0.05mm', cycle: '每 5000 冲次' },
    { name: '弹簧压力检测', standard: '压力值 80-120N', cycle: '每 5000 冲次' },
    { name: '冷却水路检测', standard: '流量正常/水温 20-35℃/无渗漏', cycle: '每 5000 冲次' },
  ],
  '冲压类_三级（易损件）保养': [
    { name: '检查刃口磨损', standard: '刃口磨损量 ≤ 0.1mm', cycle: '每 10000 冲次' },
    { name: '更换导向件', standard: '导柱/导套磨损超差时更换', cycle: '每 10000 冲次' },
    { name: '模架寿命80%增强维护', standard: '剩余寿命达到20%时自动触发', cycle: '寿命80%触发' },
  ],
}

// 初始化保养计划列表
interface MoldRef {
  id: string
  name: string
  type: string
}

interface MaintenancePlan {
  id: string
  molds: MoldRef[]
  moldType: string
  level: string
  cycleType: 'time' | 'count'
  cycleValue: string
  nextTrigger: string
  status: string
  creator: string
  createTime: string
  validTo: string
  items: string[]
  advanceReminder: string
}

const INITIAL_PLANS: MaintenancePlan[] = [
  {
    id: 'PP-2026-0001', 
    molds: [
      { id: 'GJ-2024-001', name: '冲压模A型', type: '冲压类' },
      { id: 'GJ-2024-002', name: '冲压模B型', type: '冲压类' },
      { id: 'GJ-2024-021', name: '冲压模G型', type: '冲压类' },
    ],
    moldType: '冲压类',
    level: '一级保养', cycleType: 'time', cycleValue: '每批次',
    nextTrigger: '2026-06-22', status: '生效中',
    creator: 'admin', createTime: '2026-06-15 09:00',
    validTo: '长期有效', advanceReminder: '提前1天',
    items: ['检查模具标识', '外观检测', '检查紧固件', '润滑导柱导套', '清理废料堆积', '检查顶出系统'],
  },
  {
    id: 'PP-2026-0002', 
    molds: [
      { id: 'GJ-2024-002', name: '冲压模B型', type: '冲压类' },
    ],
    moldType: '冲压类',
    level: '二级保养', cycleType: 'count', cycleValue: '每5000次',
    nextTrigger: '下次触发：累计215000次', status: '生效中',
    creator: 'admin', createTime: '2026-06-10 14:30',
    validTo: '长期有效', advanceReminder: '提前500次',
    items: ['合模精度检测', '弹簧压力检测', '冷却水路检测'],
  },
  {
    id: 'PP-2026-0003', 
    molds: [
      { id: 'GJ-2024-007', name: '注塑模C型', type: '注塑类' },
      { id: 'GJ-2024-018', name: '拉伸模E型', type: '拉伸类' },
    ],
    moldType: '注塑类',
    level: '三级（易损件）保养', cycleType: 'count', cycleValue: '每10000次',
    nextTrigger: '下次触发：累计190000次', status: '生效中',
    creator: 'lisi', createTime: '2026-06-05 10:00',
    validTo: '2026-12-31', advanceReminder: '提前1000次',
    items: ['检查刃口磨损', '更换导向件', '模架寿命80%增强维护'],
  },
  {
    id: 'PP-2026-0004', 
    molds: [
      { id: 'GJ-2024-012', name: '压铸模D型', type: '压铸类' },
    ],
    moldType: '压铸类',
    level: '一级保养', cycleType: 'time', cycleValue: '每周',
    nextTrigger: '2026-06-23', status: '生效中',
    creator: 'zhangsan', createTime: '2026-06-08 15:20',
    validTo: '长期有效', advanceReminder: '提前3天',
    items: ['检查模具标识', '外观检测', '检查紧固件', '润滑导柱导套'],
  },
  {
    id: 'PP-2026-0005', 
    molds: [
      { id: 'GJ-2024-018', name: '拉伸模E型', type: '拉伸类' },
      { id: 'GJ-2023-005', name: '热段模F型', type: '热段模' },
    ],
    moldType: '拉伸类',
    level: '一级保养', cycleType: 'time', cycleValue: '每月',
    nextTrigger: '2026-07-01', status: '未生效',
    creator: 'admin', createTime: '2026-06-20 11:00',
    validTo: '长期有效', advanceReminder: '提前5天',
    items: ['检查模具标识', '外观检测', '检查紧固件'],
  },
  {
    id: 'PP-2026-0006', 
    molds: [
      { id: 'GJ-2023-005', name: '热段模F型', type: '热段模' },
    ],
    moldType: '热段模',
    level: '三级（易损件）保养', cycleType: 'count', cycleValue: '每5000次',
    nextTrigger: '下次触发：累计315000次', status: '已暂停',
    creator: 'wangwu', createTime: '2026-05-28 16:00',
    validTo: '长期有效', advanceReminder: '提前500次',
    items: ['检查刃口磨损', '更换导向件'],
  },
]

// 模具档案（用于选择模具）
const MOLD_CATALOG = [
  { id: 'GJ-2024-001', name: '冲压模A型', type: '冲压类', spec: '300×200×80mm', count: 45000, life: 200000 },
  { id: 'GJ-2024-002', name: '冲压模B型', type: '冲压类', spec: '250×180×70mm', count: 210000, life: 450000 },
  { id: 'GJ-2024-007', name: '注塑模C型', type: '注塑类', spec: '400×300×120mm', count: 180000, life: 250000 },
  { id: 'GJ-2024-012', name: '压铸模D型', type: '压铸类', spec: '500×400×200mm', count: 125000, life: 300000 },
  { id: 'GJ-2024-018', name: '拉伸模E型', type: '拉伸类', spec: '350×250×100mm', count: 8000, life: 200000 },
  { id: 'GJ-2023-005', name: '热段模F型', type: '热段模', spec: '280×200×90mm', count: 310000, life: 350000 },
  { id: 'GJ-2024-021', name: '冲压模G型', type: '冲压类', spec: '320×220×85mm', count: 15000, life: 200000 },
]

/* ================ 页面主体 ================ */

export default function MaintenancePlanRulesPage() {
  const [plans, setPlans] = useState<MaintenancePlan[]>(INITIAL_PLANS)
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null)

  const filteredPlans = plans.filter((p) => {
    const textMatch = !searchText ||
      p.id.toLowerCase().includes(searchText.toLowerCase())
    const typeMatch = !filterType || p.moldType === filterType
    const levelMatch = !filterLevel || p.level === filterLevel
    const statusMatch = !filterStatus || p.status === filterStatus
    return textMatch && typeMatch && levelMatch && statusMatch
  })

  // 统计卡片
  const stats = {
    total: plans.length,
    active: plans.filter((p) => p.status === '生效中').length,
    paused: plans.filter((p) => p.status === '已暂停').length,
    pending: plans.filter((p) => p.status === '未生效').length,
    expired: plans.filter((p) => p.status === '已过期').length,
    completed: plans.filter((p) => p.status === '已完成').length,
  }

  // 状态切换：暂停 / 启用
  const toggleStatus = (planId: string, currentStatus: string) => {
    const newStatus = currentStatus === '已暂停' ? '生效中' : currentStatus === '生效中' ? '已暂停' : currentStatus
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, status: newStatus } : p)))
  }

  // 手动触发
  const triggerNow = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return
    const moldNames = plan.molds.slice(0, 3).map((m) => m.name).join('、')
    const more = plan.molds.length > 3 ? `等${plan.molds.length}套` : ''
    alert(`已为「${moldNames}${more}」手动触发一次「${plan.level}」任务\n已推送至【保养任务列表】`)
  }

  // 删除
  const deletePlan = () => {
    if (deletePlanId) {
      setPlans((prev) => prev.filter((p) => p.id !== deletePlanId))
      setDeletePlanId(null)
    }
  }

  return (
    <MainLayout>
      <div className="p-4 flex flex-col gap-3 h-full">
        {/* 页面标题 */}
        <div className="bg-white rounded border border-gray-200 px-5 py-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#1e5fa8]/10 flex items-center justify-center shrink-0">
            <CalendarClock size={20} className="text-[#1e5fa8]" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">保养计划制定</div>
            <div className="text-xs text-gray-500 mt-1">
              基于《模具维护保养规范》为模具制定标准化、周期性的保养计划，支持时间维度与生产次数维度自动触发。
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-500 shrink-0">
            <div className="flex flex-col items-start">
              <span className="text-gray-400">计划总数</span>
              <span className="font-semibold text-gray-700 mt-0.5">{stats.total}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-gray-400">生效中</span>
              <span className="font-semibold text-green-600 mt-0.5">{stats.active}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-gray-400">已暂停</span>
              <span className="font-semibold text-orange-600 mt-0.5">{stats.paused}</span>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-6 gap-2">
          {[
            { label: '计划总数', value: stats.total, bg: 'bg-gray-600', icon: <Layers size={15} /> },
            { label: '生效中', value: stats.active, bg: 'bg-green-600', icon: <CheckCircle2 size={15} /> },
            { label: '已暂停', value: stats.paused, bg: 'bg-orange-500', icon: <PauseCircle size={15} /> },
            { label: '未生效', value: stats.pending, bg: 'bg-gray-400', icon: <Clock size={15} /> },
            { label: '已过期', value: stats.expired, bg: 'bg-red-500', icon: <AlertTriangle size={15} /> },
            { label: '已完成', value: stats.completed, bg: 'bg-blue-600', icon: <CheckCircle2 size={15} /> },
          ].map((c) => (
            <div key={c.label} className={`${c.bg} rounded py-2.5 px-3 flex items-center justify-between gap-2 cursor-pointer hover:opacity-90 transition-opacity`}>
              <div className="text-white">
                <div className="text-[11px] font-medium leading-tight">{c.label}</div>
                <div className="text-white text-xl font-bold mt-1">{c.value}</div>
              </div>
              <div className="text-white/80">{c.icon}</div>
            </div>
          ))}
        </div>

        {/* 工具栏 */}
        <div className="bg-white rounded border border-gray-200 px-4 py-2.5 flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 mr-1">
            <Search size={13} className="text-gray-400" />
          </div>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="按计划编号搜索"
            className="border border-gray-200 rounded px-2.5 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-400 bg-gray-50"
          />

          <SelectField value={filterType} onChange={setFilterType} placeholder="全部模具类型" options={MOLD_TYPES} />
          <SelectField value={filterLevel} onChange={setFilterLevel} placeholder="全部保养级别" options={LEVEL_OPTIONS} />
          <SelectField value={filterStatus} onChange={setFilterStatus} placeholder="全部状态" options={PLAN_STATUSES} />

          <button
            onClick={() => { setSearchText(''); setFilterType(''); setFilterLevel(''); setFilterStatus('') }}
            className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50 bg-white"
          >
            <RotateCcw size={12} /> 重置筛选
          </button>

          <span className="ml-2 text-[11px] text-gray-400">共 {filteredPlans.length} 条</span>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { alert('已下载 Excel 模板\n请按模板填写后批量导入') }}
              className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 bg-white"
            >
              <FileText size={13} /> 批量导入
            </button>
            <button
              onClick={() => { alert('已下载保养计划 Excel 文件') }}
              className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 bg-white"
            >
              <FileText size={13} /> 导出 Excel
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 text-xs text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded px-3 py-1.5 transition-colors font-medium"
            >
              <Plus size={13} /> 新建保养计划
            </button>
          </div>
        </div>

        {/* 计划列表 */}
        <div className="flex-1 overflow-auto bg-white rounded border border-gray-200">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
              <tr>
                {['计划编号', '保养级别', '周期类型', '周期值', '下次触发', '状态', '创建人', '创建时间', '操作'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-gray-500 font-medium text-[12px] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors">
                  <td className="px-3 py-2.5 text-[12px] text-[#1e5fa8] font-mono font-semibold whitespace-nowrap">{p.id}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block text-[11px] px-2 py-0.5 rounded font-medium whitespace-nowrap ${LEVEL_COLORS[p.level]}`}>{p.level}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-gray-600 whitespace-nowrap">
                    {p.cycleType === 'time'
                      ? <span className="inline-flex items-center gap-1 text-[#1e5fa8]"><CalendarClock size={12} /> 时间</span>
                      : <span className="inline-flex items-center gap-1 text-[#b45309]"><Cpu size={12} /> 生产次数</span>}
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-gray-600 whitespace-nowrap">{p.cycleValue}</td>
                  <td className="px-3 py-2.5 text-[12px] text-gray-700 whitespace-nowrap font-medium">
                    <div className="flex items-center gap-1">
                      <Zap size={12} className={p.status === '生效中' ? 'text-green-500' : 'text-gray-400'} />
                      {p.nextTrigger}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{p.advanceReminder}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block text-[11px] px-2 py-0.5 rounded font-medium whitespace-nowrap ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-gray-600 whitespace-nowrap">{p.creator}</td>
                  <td className="px-3 py-2.5 text-[12px] text-gray-500 whitespace-nowrap">{p.createTime}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedPlan(p)} className="text-[11px] text-[#1e5fa8] hover:underline flex items-center gap-1 whitespace-nowrap" title="查看详情">
                        <Eye size={12} /> 查看
                      </button>
                      <button onClick={() => setSelectedPlan(p)} className="text-[11px] text-[#1e5fa8] hover:underline flex items-center gap-1 whitespace-nowrap" title="编辑">
                        <Pencil size={12} /> 编辑
                      </button>
                      {p.status === '生效中' && (
                        <button onClick={() => toggleStatus(p.id, p.status)} className="text-[11px] text-orange-600 hover:underline flex items-center gap-1 whitespace-nowrap" title="暂停">
                          <PauseCircle size={12} /> 暂停
                        </button>
                      )}
                      {p.status === '已暂停' && (
                        <button onClick={() => toggleStatus(p.id, p.status)} className="text-[11px] text-green-600 hover:underline flex items-center gap-1 whitespace-nowrap" title="启用">
                          <PlayCircle size={12} /> 启用
                        </button>
                      )}
                      {p.status === '生效中' && (
                        <button onClick={() => triggerNow(p.id)} className="text-[11px] text-[#b45309] hover:underline flex items-center gap-1 whitespace-nowrap" title="手动立即触发">
                          <PlayCircle size={12} /> 立即触发
                        </button>
                      )}
                      <button onClick={() => setDeletePlanId(p.id)} className="text-[11px] text-red-500 hover:underline flex items-center gap-1 whitespace-nowrap" title="删除">
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlans.length === 0 && (
                <tr><td colSpan={12} className="px-4 py-20 text-center text-xs text-gray-400">
                  <div className="inline-block"><CalendarClock size={32} className="mx-auto mb-2 text-gray-300" /> 暂无保养计划</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 计划详情弹窗 */}
      {selectedPlan && (
        <PlanDetailModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}

      {/* 新建计划弹窗 */}
      {showNewModal && (
        <NewPlanModal
          onClose={() => setShowNewModal(false)}
          onSubmit={(newPlan) => {
            setPlans((prev) => [newPlan, ...prev])
            setShowNewModal(false)
          }}
        />
      )}

      {/* 删除确认 */}
      {deletePlanId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDeletePlanId(null)}>
          <div className="bg-white rounded-lg shadow-xl w-96 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-red-500" /> 确认删除保养计划
            </h3>
            <p className="text-sm text-gray-500 mb-5">删除后，该计划将停止自动触发保养任务。历史已生成的保养任务不受影响。</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeletePlanId(null)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">取消</button>
              <button onClick={deletePlan} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

/* ================ 公共：下拉字段 ================ */
function SelectField({
  value, onChange, placeholder, options,
}: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-xs pr-7 bg-white focus:outline-none focus:border-blue-400 cursor-pointer min-w-[110px]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

/* ================ 弹窗：计划详情 ================ */
function PlanDetailModal({ plan, onClose }: { plan: MaintenancePlan; onClose: () => void }) {
  const libraryKey = `${plan.moldType}_${plan.level}`
  const libraryItems = STANDARD_LIBRARY[libraryKey] || []

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[980px] max-w-[95vw] max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <CalendarClock size={16} className="text-[#1e5fa8]" />
            <span className="text-sm font-semibold text-gray-800">保养计划详情</span>
            <span className="text-xs text-gray-400 font-mono">{plan.id}</span>
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[plan.status]}`}>{plan.status}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-50"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
          {/* 关联模具列表 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Package size={12} className="text-[#1e5fa8]" /> 关联模具（共 {plan.molds.length} 套）
              </div>
              <span className={`inline-block text-[11px] px-2 py-0.5 rounded font-medium ${LEVEL_COLORS[plan.level]}`}>{plan.level}</span>
            </div>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">序号</th>
                    <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">模具编号</th>
                    <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">模具名称</th>
                    <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">类型</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.molds.map((m, idx) => (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-[12px] text-gray-500">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-3 py-2 text-[12px] font-mono text-gray-700">{m.id}</td>
                      <td className="px-3 py-2 text-[12px] font-medium text-gray-800">{m.name}</td>
                      <td className="px-3 py-2 text-[12px] text-gray-600">{m.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <InfoField label="计划适用类型" value={plan.moldType} />
              <InfoField label="有效期" value={plan.validTo} />
            </div>
          </div>

          {/* 周期与触发规则 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
              <Zap size={12} className="text-[#1e5fa8]" /> 周期与触发规则
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoField label="周期类型" value={plan.cycleType === 'time' ? '时间维度' : '生产次数维度'} />
              <InfoField label="周期值" value={plan.cycleValue} />
              <InfoField label="下次触发" value={plan.nextTrigger} highlight />
              <InfoField label="提前提醒" value={plan.advanceReminder} />
            </div>
            <div className="mt-4 p-3 bg-blue-50/40 border border-blue-100 rounded text-xs text-gray-600 leading-relaxed">
              <div className="font-medium text-[#1e5fa8] mb-1.5">自动触发逻辑</div>
              {plan.cycleType === 'time'
                ? '当系统日期达到「下次触发时间」时，系统自动生成1条待执行的保养任务，并推送至【保养任务列表】，同时给对应负责人发送消息提醒。'
                : '当模具的「累计加工次数」达到触发值时，系统自动生成1条待执行的保养任务，并推送至【保养任务列表】，同时给对应负责人发送消息提醒。'}
            </div>
          </div>

          {/* 标准保养项目 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
              <Settings2 size={12} className="text-[#1e5fa8]" /> 标准保养项目（共 {plan.items.length} 项）
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">序号</th>
                  <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">项目名称</th>
                  <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">保养标准</th>
                  <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">建议周期</th>
                </tr>
              </thead>
              <tbody>
                {plan.items.map((itemName, idx) => {
                  const matched = libraryItems.find((i) => i.name === itemName)
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-[12px] text-gray-500">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-3 py-2 text-[12px] text-gray-800 font-medium">{itemName}</td>
                      <td className="px-3 py-2 text-[12px] text-gray-600">{matched?.standard || '-'}</td>
                      <td className="px-3 py-2 text-[12px] text-gray-600">{matched?.cycle || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 系统联动 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
              <History size={12} className="text-[#1e5fa8]" /> 系统数据联动
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { label: '模具档案', desc: '读取模具类型/加工次数/剩余寿命', status: '已连接', color: 'text-green-600' },
                { label: '生产工单系统', desc: '同步累计加工次数用于触发判断', status: '已连接', color: 'text-green-600' },
                { label: '保养任务系统', desc: '计划触发时自动生成标准化任务', status: '已连接', color: 'text-green-600' },
                { label: 'QMS系统', desc: '发现异常时可自动生成送检任务', status: '可配置', color: 'text-[#1e5fa8]' },
              ].map((link) => (
                <div key={link.label} className="border border-gray-200 rounded p-2.5 bg-gray-50/30">
                  <div className="text-gray-800 font-medium text-[12px] mb-1">{link.label}</div>
                  <div className="text-gray-500 text-[11px] mb-1.5 leading-relaxed">{link.desc}</div>
                  <div className={`text-[11px] font-medium ${link.color}`}>● {link.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-end gap-2 bg-white shrink-0">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50">关闭</button>
        </div>
      </div>
    </div>
  )
}

/* ================ 弹窗：新建计划（简化版） ================ */
function NewPlanModal({
  onClose, onSubmit,
}: { onClose: () => void; onSubmit: (plan: MaintenancePlan) => void }) {
  const [moldIds, setMoldIds] = useState<string[]>([])
  const [level, setLevel] = useState('一级保养')
  const [cycleType, setCycleType] = useState<'time' | 'count'>('time')
  const [cycleValue, setCycleValue] = useState('每周')
  const [firstDate, setFirstDate] = useState('2026-06-22')
  const [firstCount, setFirstCount] = useState('5000')
  const [reminderDays, setReminderDays] = useState('3')
  const [validType, setValidType] = useState<'long' | 'date'>('long')
  const [validDate, setValidDate] = useState('2027-06-21')

  // 模具筛选
  const [moldSearch, setMoldSearch] = useState('')
  const [moldTypeFilter, setMoldTypeFilter] = useState('')

  const toggleMold = (id: string) => {
    setMoldIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const filteredMolds = MOLD_CATALOG.filter((m) => {
    const matchType = !moldTypeFilter || m.type === moldTypeFilter
    const matchText = !moldSearch ||
      m.id.toLowerCase().includes(moldSearch.toLowerCase()) ||
      m.name.toLowerCase().includes(moldSearch.toLowerCase())
    return matchType && matchText
  })

  // 统一用第一个选中模具的类型来匹配标准项目
  const firstMold = MOLD_CATALOG.find((m) => m.id === moldIds[0])
  const libraryKey = firstMold ? `${firstMold.type}_${level}` : ''
  const autoItems = STANDARD_LIBRARY[libraryKey]?.map((i) => i.name) || []

  // 保养级别 + 多选保养项目（基于保养项标准库）
  const [selectedItemNames, setSelectedItemNames] = useState<string[]>([])
  // 根据当前保养级别，聚合所有模具类型下的标准项目（去重）
  const allStandardItemsByLevel = (() => {
    const items: Array<{ name: string; standard: string; cycle: string; moldType: string }> = []
    const seenNames = new Set<string>()
    Object.entries(STANDARD_LIBRARY).forEach(([key, list]) => {
      const [, lvl] = key.split('_')
      if (lvl === level) {
        const moldType = key.split('_')[0]
        list.forEach((item) => {
          if (!seenNames.has(item.name)) {
            seenNames.add(item.name)
            items.push({ ...item, moldType })
          }
        })
      }
    })
    return items
  })()

  const toggleItem = (name: string) => {
    setSelectedItemNames((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name])
  }

  // 切换保养级别时，清空已选项目
  const handleLevelChange = (lvl: string) => {
    setLevel(lvl)
    setSelectedItemNames([])
  }

  const canSubmit = moldIds.length > 0 && selectedItemNames.length > 0

  // 一键全选当前筛选结果 / 一键清空
  const selectAllFiltered = () => setMoldIds((prev) => {
    const filteredIds = filteredMolds.map((m) => m.id)
    const merged = Array.from(new Set([...prev, ...filteredIds]))
    return merged
  })
  const clearMolds = () => setMoldIds([])

  const handleSubmit = () => {
    if (moldIds.length === 0) return
    const firstSelected = MOLD_CATALOG.find((m) => m.id === moldIds[0])!
    const now = new Date()
    const nextTrigger = cycleType === 'time' ? firstDate : `下次触发：累计${firstCount}次`

    // 构建关联模具列表
    const molds = moldIds.map((id) => {
      const mold = MOLD_CATALOG.find((m) => m.id === id)!
      return { id: mold.id, name: mold.name, type: mold.type }
    })

    const newPlan: MaintenancePlan = {
      id: 'PP-2026-' + String(Math.floor(Math.random() * 9000) + 1000),
      molds: molds,
      moldType: firstSelected.type,
      level: level,
      cycleType: cycleType,
      cycleValue: cycleValue,
      nextTrigger: nextTrigger,
      status: '生效中',
      creator: 'admin',
      createTime: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
      validTo: validType === 'long' ? '长期有效' : validDate,
      advanceReminder: cycleType === 'time' ? `提前${reminderDays}天` : `提前${reminderDays}次`,
      items: selectedItemNames,
    }
    onSubmit(newPlan)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[980px] max-w-[95vw] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <Plus size={16} className="text-[#1e5fa8]" />
            <span className="text-sm font-semibold text-gray-800">新建保养计划</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-50"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
          {/* 1. 模具选择 — 多选优化版 */}
          <FormSection title="1. 选择模具" subtitle={`支持批量选择，已选 ${moldIds.length} 套模具将统一应用以下保养配置`} number="1">
            {/* 已选模具 — 顶部显示为 Tag */}
            {moldIds.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50/60 border border-blue-100 rounded">
                <div className="text-[11px] text-gray-600 mb-2 flex items-center justify-between">
                  <span>已选择 <span className="font-semibold text-[#1e5fa8]">{moldIds.length}</span> 套模具</span>
                  <button onClick={clearMolds} className="text-[11px] text-red-500 hover:underline">清空所有</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {moldIds.map((id) => {
                    const m = MOLD_CATALOG.find((x) => x.id === id)!
                    return (
                      <span key={id} className="inline-flex items-center gap-1 text-[11px] bg-white border border-blue-200 text-[#1e5fa8] px-2 py-1 rounded">
                        <span className="font-mono">{m.id}</span>
                        <span>{m.name}</span>
                        <button onClick={() => toggleMold(id)} className="ml-1 hover:text-red-500 font-bold">×</button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 搜索 + 筛选 + 全选 快捷操作 */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="relative">
                <input
                  value={moldSearch}
                  onChange={(e) => setMoldSearch(e.target.value)}
                  placeholder="搜索模具编号/名称..."
                  className="border border-gray-200 rounded px-2.5 py-1.5 text-xs w-56 pl-7 focus:outline-none focus:border-blue-400 bg-white"
                />
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>

              <div className="relative">
                <select
                  value={moldTypeFilter}
                  onChange={(e) => setMoldTypeFilter(e.target.value)}
                  className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-xs pr-7 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="">全部类型</option>
                  {MOLD_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="flex items-center gap-1 ml-1 text-[11px] text-gray-400">
                <span>共 {filteredMolds.length} 套</span>
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={selectAllFiltered}
                  disabled={filteredMolds.length === 0}
                  className="flex items-center gap-1 text-[11px] text-[#1e5fa8] border border-[#1e5fa8]/30 px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✓ 全选当前 {filteredMolds.length} 套
                </button>
                <button
                  onClick={clearMolds}
                  className="flex items-center gap-1 text-[11px] text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
                >
                  清空
                </button>
              </div>
            </div>

            {/* 多选表格 */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredMolds.length > 0 && filteredMolds.every((m) => moldIds.includes(m.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              selectAllFiltered()
                            } else {
                              // 取消当前筛选结果中的全选
                              setMoldIds((prev) => prev.filter((id) => !filteredMolds.some((m) => m.id === id)))
                            }
                          }}
                          disabled={filteredMolds.length === 0}
                        />
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">模具编号</th>
                      <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">模具名称</th>
                      <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">类型</th>
                      <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">规格</th>
                      <th className="px-3 py-2 text-right text-[11px] text-gray-500 font-medium">累计次数</th>
                      <th className="px-3 py-2 text-right text-[11px] text-gray-500 font-medium">剩余寿命</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMolds.map((m) => (
                      <tr
                        key={m.id}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${moldIds.includes(m.id) ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                        onClick={() => toggleMold(m.id)}
                      >
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" checked={moldIds.includes(m.id)} readOnly onClick={(e) => e.stopPropagation()} />
                        </td>
                        <td className="px-3 py-2 text-[12px] font-mono text-gray-700">{m.id}</td>
                        <td className="px-3 py-2 text-[12px] font-medium text-gray-800">{m.name}</td>
                        <td className="px-3 py-2 text-[12px] text-gray-600">{m.type}</td>
                        <td className="px-3 py-2 text-[12px] text-gray-600">{m.spec}</td>
                        <td className="px-3 py-2 text-[12px] text-gray-600 text-right">{m.count.toLocaleString()}</td>
                        <td className="px-3 py-2 text-[12px] text-green-600 text-right">{(m.life - m.count).toLocaleString()}</td>
                      </tr>
                    ))}
                    {filteredMolds.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-gray-400">未找到匹配的模具</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </FormSection>

          {/* 2. 保养级别 + 多选保养项目 */}
          <FormSection title="2. 保养级别与标准保养项目" subtitle={`先选择保养级别，再从保养项标准库中勾选要执行的保养项目（共 ${allStandardItemsByLevel.length} 项可用）`} number="2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-500">保养级别：</span>
              {LEVEL_OPTIONS.map((l) => (
                <button
                  key={l}
                  onClick={() => handleLevelChange(l)}
                  className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                    level === l
                      ? 'bg-[#1e5fa8] text-white border-[#1e5fa8] font-medium'
                      : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* 已选项目 Tag 汇总 */}
            {selectedItemNames.length > 0 && (
              <div className="mb-3 p-2.5 bg-green-50/60 border border-green-200 rounded text-xs text-gray-700 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-gray-500">已选</span>
                  <span className="text-green-700 font-semibold">{selectedItemNames.length}</span>
                  <span className="text-gray-500">项：</span>
                  {selectedItemNames.slice(0, 6).map((n) => (
                    <span key={n} className="inline-flex items-center gap-1 bg-white border border-green-300 text-green-700 px-2 py-0.5 rounded text-[11px]">
                      {n}
                      <button onClick={() => toggleItem(n)} className="ml-1 text-green-700/60 hover:text-red-500 font-bold">×</button>
                    </span>
                  ))}
                  {selectedItemNames.length > 6 && (
                    <span className="text-[11px] text-gray-500">+ {selectedItemNames.length - 6} 项</span>
                  )}
                </div>
                <button onClick={() => setSelectedItemNames([])} className="text-[11px] text-red-500 hover:underline shrink-0">清空已选</button>
              </div>
            )}

            {/* 多选表格 */}
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allStandardItemsByLevel.length > 0 && allStandardItemsByLevel.every((i) => selectedItemNames.includes(i.name))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // 全选：把当前级别所有项目加入（去重）
                          const allNames = allStandardItemsByLevel.map((i) => i.name)
                          setSelectedItemNames((prev) => Array.from(new Set([...prev, ...allNames])))
                        } else {
                          // 取消全选：移除当前级别所有项目
                          const allNames = new Set(allStandardItemsByLevel.map((i) => i.name))
                          setSelectedItemNames((prev) => prev.filter((x) => !allNames.has(x)))
                        }
                      }}
                    />
                    <span className="text-[11px]">全选当前级别</span>
                  </label>
                </div>
                <span className="text-[#1e5fa8] font-medium">
                  已选 {selectedItemNames.filter((n) => allStandardItemsByLevel.some((i) => i.name === n)).length} / {allStandardItemsByLevel.length}
                </span>
              </div>
              <div className="max-h-[240px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/80 border-b border-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 w-10 text-center"></th>
                      <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">项目名称</th>
                      <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">保养标准</th>
                      <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">建议周期</th>
                      <th className="px-3 py-2 text-left text-[11px] text-gray-500 font-medium">适用模具</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStandardItemsByLevel.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400">该保养级别暂无标准项目，请先在【保养项标准库】中维护</td></tr>
                    ) : (
                      allStandardItemsByLevel.map((item, idx) => {
                        const checked = selectedItemNames.includes(item.name)
                        return (
                          <tr
                            key={item.name}
                            className={`border-b border-gray-100 cursor-pointer transition-colors ${checked ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                            onClick={() => toggleItem(item.name)}
                          >
                            <td className="px-3 py-2 text-center">
                              <input type="checkbox" checked={checked} readOnly onClick={(e) => e.stopPropagation()} />
                            </td>
                            <td className="px-3 py-2 text-[12px] text-gray-800 font-medium">{item.name}</td>
                            <td className="px-3 py-2 text-[12px] text-gray-600">{item.standard}</td>
                            <td className="px-3 py-2 text-[12px] text-gray-600">{item.cycle}</td>
                            <td className="px-3 py-2 text-[12px]">
                              <span className="inline-block text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.moldType}</span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </FormSection>

          {/* 3. 周期与触发 */}
          <FormSection title="3. 周期与触发规则" subtitle={`已选 ${moldIds.length} 套模具将统一按此规则执行，规则生效后系统自动触发保养任务`} number="3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">周期类型 <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCycleType('time'); setCycleValue('每周') }}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded border transition-colors ${
                      cycleType === 'time'
                        ? 'bg-[#1e5fa8] text-white border-[#1e5fa8] font-medium'
                        : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <CalendarClock size={13} /> 时间维度
                  </button>
                  <button
                    onClick={() => { setCycleType('count'); setCycleValue('每5000次') }}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded border transition-colors ${
                      cycleType === 'count'
                        ? 'bg-[#b45309] text-white border-[#b45309] font-medium'
                        : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Cpu size={13} /> 生产次数维度
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">周期值 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={cycleValue}
                    onChange={(e) => setCycleValue(e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 pr-7"
                  >
                    {(cycleType === 'time' ? TIME_CYCLES : COUNT_CYCLES).map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  {cycleType === 'time' ? '首次执行日期 *' : '首次触发累计加工次数 *'}
                </label>
                <input
                  type={cycleType === 'time' ? 'date' : 'number'}
                  value={cycleType === 'time' ? firstDate : firstCount}
                  onChange={(e) => cycleType === 'time' ? setFirstDate(e.target.value) : setFirstCount(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  提前提醒{cycleType === 'time' ? '（天）' : '（次数）'}
                </label>
                <input
                  type="number"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                  min="1"
                  className="w-full border border-gray-200 rounded px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">有效期 <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setValidType('long')}
                    className={`flex-1 text-xs px-3 py-2 rounded border transition-colors ${
                      validType === 'long'
                        ? 'bg-[#1e5fa8] text-white border-[#1e5fa8] font-medium'
                        : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >长期有效</button>
                  <button
                    onClick={() => setValidType('date')}
                    className={`flex-1 text-xs px-3 py-2 rounded border transition-colors ${
                      validType === 'date'
                        ? 'bg-[#1e5fa8] text-white border-[#1e5fa8] font-medium'
                        : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >指定截止日期</button>
                </div>
              </div>

              {validType === 'date' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">截止日期 *</label>
                  <input
                    type="date"
                    value={validDate}
                    onChange={(e) => setValidDate(e.target.value)}
                    className="w-full border border-gray-200 rounded px-2.5 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  />
                </div>
              )}
            </div>
          </FormSection>
        </div>

        <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between bg-white shrink-0">
          <div className="text-xs text-gray-400">
            {moldIds.length > 0 && selectedItemNames.length > 0
              ? <span>已选 <span className="font-semibold text-[#1e5fa8]">{moldIds.length}</span> 套模具 · {level} · {selectedItemNames.length} 项标准保养</span>
              : '请完成以上配置（选择模具+勾选保养项目）'}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50">取消</button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-4 py-1.5 text-xs text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >创建保养计划</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================ 公共辅助组件 ================ */
function InfoField({ label, value, mono, badge, color }: { label: string; value: string; mono?: boolean; badge?: boolean; color?: string }) {
  return (
    <div>
      <div className="text-[11px] text-gray-400 mb-1">{label}</div>
      {badge
        ? <span className={`inline-block text-[11px] px-2 py-0.5 rounded font-medium ${color}`}>{value}</span>
        : <div className={`text-[12px] text-gray-800 font-medium ${mono ? 'font-mono' : ''}`}>{value}</div>}
    </div>
  )
}

function FormSection({
  title, subtitle, number, children,
}: { title: string; subtitle?: string; number: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded border border-gray-200 p-4">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-[#1e5fa8] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{number}</div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-800">{title}</div>
          {subtitle && <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <div className="pl-7">{children}</div>
    </div>
  )
}
