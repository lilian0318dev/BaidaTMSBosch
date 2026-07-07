'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RotateCcw, RefreshCw, ChevronDown, X,
  CheckCircle, XCircle, ClipboardList, FileText,
  Package, AlertTriangle, Info, ArrowRight, Eye,
} from 'lucide-react'

type PlanStatus = '待下发' | '已下发' | '已完成'

interface ProductionPlan {
  id: string
  planNo: string          // 计划单号
  erpOrderNo: string      // ERP工单号
  toolCode: string        // 模具编号
  toolName: string        // 模具名称
  category: string        // 模具类别
  route: string           // 工艺路线
  planQty: number         // 计划数量
  planStart: string       // 计划开工日期
  planEnd: string         // 计划完工日期
  priority: '高' | '中' | '低'
  status: PlanStatus
  issuedDate?: string     // 下发日期
  woNo?: string          // 关联的工单号
}

const STATUS_STYLES: Record<PlanStatus, string> = {
  '待下发': 'bg-amber-50 text-amber-700',
  '已下发': 'bg-blue-50 text-blue-700',
  '已完成': 'bg-emerald-100 text-emerald-700',
}

const PRIORITY_STYLES: Record<string, string> = {
  '高': 'bg-red-100 text-red-700',
  '中': 'bg-amber-100 text-amber-700',
  '低': 'bg-gray-100 text-gray-600',
}

const MOCK_PLANS: ProductionPlan[] = [
  { id: 'P001', planNo: 'PP-2024-001', erpOrderNo: 'MO-2024-07-001', toolCode: '190038', toolName: '电机轴注塑模具', category: '注塑模具', route: '模具标准工艺路线A', planQty: 1, planStart: '2024-07-01', planEnd: '2024-07-15', priority: '高', status: '待下发' },
  { id: 'P002', planNo: 'PP-2024-002', erpOrderNo: 'MO-2024-07-002', toolCode: '26015',  toolName: '齿轮压铸模',     category: '压铸模具', route: '压铸模工艺路线B',   planQty: 120, planStart: '2024-07-05', planEnd: '2024-07-20', priority: '中', status: '待下发' },
  { id: 'P003', planNo: 'PP-2024-003', erpOrderNo: 'MO-2024-07-003', toolCode: '190041', toolName: '壳体冲压模具',     category: '冲压模具', route: '冲压模工艺路线C',   planQty: 1, planStart: '2024-06-20', planEnd: '2024-07-10', priority: '高', status: '已完成', issuedDate: '2024-06-20', woNo: 'WO-2024-003' },
  { id: 'P004', planNo: 'PP-2024-004', erpOrderNo: 'MO-2024-07-004', toolCode: '26088',  toolName: '定位销组件',       category: '工装备件', route: '备件加工工艺',       planQty: 200, planStart: '2024-07-08', planEnd: '2024-07-25', priority: '低', status: '已下发', issuedDate: '2024-07-08', woNo: 'WO-2024-004' },
  { id: 'P005', planNo: 'PP-2024-005', erpOrderNo: 'MO-2024-07-005', toolCode: '26102',  toolName: '风扇叶片吹塑件',   category: '吹塑模具', route: '吹塑件工艺路线D',   planQty: 250, planStart: '2024-07-12', planEnd: '2024-07-30', priority: '中', status: '待下发' },
  { id: 'P006', planNo: 'PP-2024-006', erpOrderNo: 'MO-2024-07-006', toolCode: '190038', toolName: '电机轴注塑模具',   category: '注塑模具', route: '模具标准工艺路线A', planQty: 1, planStart: '2024-07-10', planEnd: '2024-07-22', priority: '高', status: '已下发', issuedDate: '2024-07-10', woNo: 'WO-2024-006' },
  { id: 'P007', planNo: 'PP-2024-007', erpOrderNo: 'MO-2024-07-007', toolCode: '27001',  toolName: '仪表壳注塑模具',   category: '注塑模具', route: '注塑模工艺路线E',   planQty: 50, planStart: '2024-07-15', planEnd: '2024-08-05', priority: '中', status: '待下发' },
  { id: 'P008', planNo: 'PP-2024-008', erpOrderNo: 'MO-2024-07-008', toolCode: '28005',  toolName: '连接器冲压模具',   category: '冲压模具', route: '冲压模工艺路线F',   planQty: 500, planStart: '2024-07-18', planEnd: '2024-08-10', priority: '低', status: '待下发' },
]

export default function PlanManagementPage() {
  const [plans] = useState<ProductionPlan[]>(MOCK_PLANS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)

  const filtered = plans.filter(p => {
    if (search && !p.planNo.toLowerCase().includes(search.toLowerCase()) &&
        !p.toolCode.toLowerCase().includes(search.toLowerCase()) &&
        !p.toolName.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && p.status !== filterStatus) return false
    if (filterPriority && p.priority !== filterPriority) return false
    return true
  })

  const stats = {
    total: plans.length,
    pending: plans.filter(p => p.status === '待下发').length,
    issued: plans.filter(p => p.status === '已下发').length,
    completed: plans.filter(p => p.status === '已完成').length,
  }

  const handleSync = () => {
    alert('正在从ERP同步计划数据...')
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-gray-800">计划管理</h1>
            <span className="text-xs text-gray-400">（ERP计划同步）</span>
          </div>
          <button
            onClick={handleSync}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1e5fa8] hover:bg-[#1a4f8f] text-white text-sm rounded transition-colors"
          >
            <RefreshCw size={14} /> 从ERP同步
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Plan List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Stats */}
            <div className="px-6 py-3 bg-white border-b border-gray-100">
              <div className="flex items-center gap-6">
                <button onClick={() => setFilterStatus('')} className={cn('flex items-center gap-2 text-sm', !filterStatus ? 'text-[#1e5fa8] font-medium' : 'text-gray-500')}>
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  全部 <span className="font-semibold">{stats.total}</span>
                </button>
                <button onClick={() => setFilterStatus('待下发')} className={cn('flex items-center gap-2 text-sm', filterStatus === '待下发' ? 'text-amber-600 font-medium' : 'text-gray-500')}>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  待下发 <span className="font-semibold">{stats.pending}</span>
                </button>
                <button onClick={() => setFilterStatus('已下发')} className={cn('flex items-center gap-2 text-sm', filterStatus === '已下发' ? 'text-blue-600 font-medium' : 'text-gray-500')}>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  已下发 <span className="font-semibold">{stats.issued}</span>
                </button>
                <button onClick={() => setFilterStatus('已完成')} className={cn('flex items-center gap-2 text-sm', filterStatus === '已完成' ? 'text-emerald-600 font-medium' : 'text-gray-500')}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  已完成 <span className="font-semibold">{stats.completed}</span>
                </button>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="px-6 py-2.5 bg-[#f8fafc] border-b border-gray-100 flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索计划单号/模具编号/名称"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1e5fa8]"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => { setStatusOpen(v => !v); setPriorityOpen(false) }}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded hover:border-[#1e5fa8]', filterStatus ? 'border-[#1e5fa8] text-[#1e5fa8] bg-blue-50' : 'border-gray-200 text-gray-600')}
                >
                  {filterStatus || '状态'}
                  <ChevronDown size={12} />
                </button>
                {statusOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-md z-10 min-w-[100px]">
                    {['', '待下发', '已下发', '已完成'].map(s => (
                      <button key={s} onClick={() => { setFilterStatus(s); setStatusOpen(false) }} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">
                        {s || '全部'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => { setPriorityOpen(v => !v); setStatusOpen(false) }}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded hover:border-[#1e5fa8]', filterPriority ? 'border-[#1e5fa8] text-[#1e5fa8] bg-blue-50' : 'border-gray-200 text-gray-600')}
                >
                  {filterPriority || '优先级'}
                  <ChevronDown size={12} />
                </button>
                {priorityOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-md z-10 min-w-[80px]">
                    {['', '高', '中', '低'].map(p => (
                      <button key={p} onClick={() => { setFilterPriority(p); setPriorityOpen(false) }} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">
                        {p || '全部'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {(filterStatus || filterPriority) && (
                <button onClick={() => { setFilterStatus(''); setFilterPriority('') }} className="text-xs text-gray-400 hover:text-gray-600">
                  清除筛选
                </button>
              )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="border-b border-gray-200">
                    {['计划单号', 'ERP工单号', '模具编号', '模具名称', '类别', '计划数量', '计划开工', '计划完工', '优先级', '状态', '操作'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-gray-600 font-medium text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">暂无数据</td>
                    </tr>
                  ) : filtered.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPlan(p)}
                      className={cn('border-b border-gray-100 cursor-pointer transition-colors', selectedPlan?.id === p.id ? 'bg-blue-50' : 'hover:bg-gray-50')}
                    >
                      <td className="px-4 py-3 font-medium text-[#1e5fa8]">{p.planNo}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.erpOrderNo}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.toolCode}</td>
                      <td className="px-4 py-3 text-gray-800">{p.toolName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.category}</td>
                      <td className="px-4 py-3 text-gray-700 text-right">{p.planQty}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.planStart}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.planEnd}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-1.5 py-0.5 rounded text-[11px] font-medium', PRIORITY_STYLES[p.priority])}>
                          {p.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_STYLES[p.status])}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedPlan(p) }}
                          className="flex items-center gap-1 text-xs text-[#1e5fa8] hover:underline"
                        >
                          <Eye size={12} /> 查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-2 bg-white border-t border-gray-100 text-xs text-gray-400">
              共 {filtered.length} 条记录
            </div>
          </div>

          {/* Right: Plan Detail */}
          {selectedPlan && (
            <div className="w-[420px] border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={14} className="text-[#1e5fa8]" />
                  <span className="text-sm font-semibold text-gray-800">计划详情</span>
                </div>
                <button onClick={() => setSelectedPlan(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">计划单号</span>
                    <span className="text-sm font-semibold text-[#1e5fa8]">{selectedPlan.planNo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">ERP工单号</span>
                    <span className="text-sm font-mono text-gray-700">{selectedPlan.erpOrderNo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">状态</span>
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_STYLES[selectedPlan.status])}>
                      {selectedPlan.status}
                    </span>
                  </div>
                </div>

                {/* Mold Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-600 mb-1">模具信息</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">模具编号</span>
                    <span className="text-sm font-mono text-gray-700">{selectedPlan.toolCode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">模具名称</span>
                    <span className="text-sm text-gray-700">{selectedPlan.toolName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">类别</span>
                    <span className="text-sm text-gray-700">{selectedPlan.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">工艺路线</span>
                    <span className="text-xs text-gray-700 text-right max-w-[180px]">{selectedPlan.route}</span>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-600 mb-1">计划信息</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">计划数量</span>
                    <span className="text-sm font-semibold text-gray-700">{selectedPlan.planQty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">优先级</span>
                    <span className={cn('px-1.5 py-0.5 rounded text-[11px] font-medium', PRIORITY_STYLES[selectedPlan.priority])}>
                      {selectedPlan.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">计划开工</span>
                    <span className="text-sm text-gray-700">{selectedPlan.planStart}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">计划完工</span>
                    <span className="text-sm text-gray-700">{selectedPlan.planEnd}</span>
                  </div>
                  {selectedPlan.issuedDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">下发日期</span>
                      <span className="text-sm text-gray-700">{selectedPlan.issuedDate}</span>
                    </div>
                  )}
                </div>

                {/* Work Order Link */}
                {selectedPlan.woNo && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-blue-700 mb-2">关联工单</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">{selectedPlan.woNo}</span>
                      <a href={`/production/work-orders?highlight=${selectedPlan.woNo}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        查看工单 <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                )}

                {/* ERP Sync Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                    <RefreshCw size={12} /> ERP同步信息
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    数据已同步
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    计划数据来源于ERP工单，同步时间：2024-07-28 08:00
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 border-t border-gray-100">
                {selectedPlan.status === '待下发' && (
                  <button
                    onClick={() => {
                      if (confirm(`确认下发计划 "${selectedPlan.planNo}" 到工单？\n\n系统将自动创建对应的生产工单。`)) {
                        alert('计划已下发，工单已创建！')
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#1e5fa8] hover:bg-[#1a4f8f] text-white text-sm rounded transition-colors"
                  >
                    <CheckCircle size={14} /> 下发到工单
                  </button>
                )}
                {selectedPlan.status === '已下发' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 h-9 bg-emerald-50 text-emerald-700 text-sm rounded border border-emerald-200">
                      <CheckCircle size={14} /> 已下发至工单
                    </div>
                    <a
                      href={`/production/work-orders?highlight=${selectedPlan.woNo}`}
                      className="w-full flex items-center justify-center gap-1.5 h-9 bg-white hover:bg-gray-50 text-[#1e5fa8] text-sm rounded border border-[#1e5fa8] transition-colors"
                    >
                      <ArrowRight size={14} /> 查看工单
                    </a>
                  </div>
                )}
                {selectedPlan.status === '已完成' && (
                  <div className="flex items-center justify-center gap-2 h-9 bg-emerald-100 text-emerald-700 text-sm rounded">
                    <CheckCircle size={14} /> 工单已完成
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
