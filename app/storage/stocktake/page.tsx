'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Plus, RotateCcw, X, Eye, ChevronDown, ClipboardCheck, Settings, RefreshCw, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react'

const WAREHOUSE_LIST = ['模具成品仓', '模具备件仓', '待修仓', '待保养仓', '报废仓', '现场仓', '原材料仓']
const STOCKTAKE_STATUS = ['全部', '进行中', '已完成', '有差异']
const STOCKTAKE_TYPES = ['全盘', '抽盘', '循环盘点']

// 盘点明细 - 单个库存的账实对比
interface StocktakeDetail {
  id: string
  toolingNo?: string
  productCode: string
  productName: string
  spec: string
  location: string
  bookQty: number
  actualQty: number
  diffQty: number
  remark?: string
}

// 盘点单
interface StocktakeOrder {
  id: string
  code: string
  type: string
  warehouse: string
  planDate: string
  operator: string
  totalItems: number
  diffItems: number
  status: string
  remark?: string
  details: StocktakeDetail[]
}

const initialDetails: StocktakeDetail[] = [
  { id: 'D001', toolingNo: 'MJ-2024-001', productCode: 'PG-A001', productName: '冲压模具-下模A', spec: '200x150x80', location: 'A01-01', bookQty: 1, actualQty: 1, diffQty: 0 },
  { id: 'D002', toolingNo: 'MJ-2024-089', productCode: 'PG-B023', productName: '注塑模具-定模', spec: '400x300x120', location: 'A02-03', bookQty: 1, actualQty: 1, diffQty: 0 },
  { id: 'D003', productCode: 'BJ-C101', productName: '模具备件-导套', spec: 'D30x150', location: 'B01-05', bookQty: 20, actualQty: 19, diffQty: -1, remark: '破损1件' },
  { id: 'D004', productCode: 'BJ-D205', productName: '模具备件-润滑脂', spec: '500g', location: 'B02-08', bookQty: 15, actualQty: 17, diffQty: 2, remark: '前期漏登' },
  { id: 'D005', toolingNo: 'MJ-2023-058', productCode: 'PG-E089', productName: '注塑模具-型腔B', spec: '300x200x100', location: 'F01-02', bookQty: 1, actualQty: 1, diffQty: 0 },
]

// 进行中状态的盘点明细 - 尚未完成实盘录入（actualQty为空/需录入）
const inProgressDetails: StocktakeDetail[] = [
  { id: 'G001', productCode: 'YC-E301', productName: '原材料-钢板', spec: 'T10-20mm', location: 'C01-15', bookQty: 50, actualQty: 0, diffQty: 0 },
  { id: 'G002', productCode: 'YC-E302', productName: '原材料-铝板', spec: '5mm', location: 'C02-03', bookQty: 30, actualQty: 0, diffQty: 0 },
  { id: 'G003', productCode: 'YC-E303', productName: '原材料-铜板', spec: '3mm', location: 'C03-07', bookQty: 20, actualQty: 0, diffQty: 0 },
  { id: 'G004', productCode: 'YC-E304', productName: '原材料-圆钢', spec: 'Φ20', location: 'C04-11', bookQty: 12, actualQty: 0, diffQty: 0 },
  { id: 'G005', productCode: 'YC-E305', productName: '原材料-方钢', spec: '40x40', location: 'C05-02', bookQty: 8, actualQty: 0, diffQty: 0 },
]

const initialStocktake: StocktakeOrder[] = [
  {
    id: 'PD20260618001', code: 'PD-2026-06-Q2', type: '全盘', warehouse: '模具成品仓',
    planDate: '2026-06-18', operator: '张三', totalItems: 25, diffItems: 2, status: '有差异',
    remark: '二季度定期盘点',
    details: initialDetails,
  },
  {
    id: 'PD20260618002', code: 'PD-2026-06-SP', type: '抽盘', warehouse: '模具备件仓',
    planDate: '2026-06-18', operator: '李四', totalItems: 15, diffItems: 0, status: '已完成',
    remark: '备件抽查',
    details: [
      { id: 'E001', productCode: 'BJ-C101', productName: '模具备件-导套', spec: 'D30x150', location: 'B01-05', bookQty: 20, actualQty: 20, diffQty: 0 },
      { id: 'E002', productCode: 'BJ-D205', productName: '模具备件-润滑脂', spec: '500g', location: 'B02-08', bookQty: 15, actualQty: 15, diffQty: 0 },
    ],
  },
  {
    id: 'PD20260617003', code: 'PD-2026-06-LP', type: '循环盘点', warehouse: '现场仓',
    planDate: '2026-06-17', operator: '王五', totalItems: 48, diffItems: 0, status: '已完成',
    remark: '现场仓月度循环',
    details: [
      { id: 'F001', toolingNo: 'MJ-2024-023', productCode: 'PG-F156', productName: '压铸模具-动模', spec: '250x180x90', location: 'F02-01', bookQty: 1, actualQty: 1, diffQty: 0 },
    ],
  },
  {
    id: 'PD20260616004', code: 'PD-2026-06-NEW', type: '全盘', warehouse: '原材料仓',
    planDate: '2026-06-16', operator: '赵六', totalItems: 5, diffItems: 0, status: '进行中',
    remark: '原材料季度盘点',
    details: inProgressDetails,
  },
]

const statusColors: Record<string, string> = {
  '进行中': 'bg-blue-50 text-blue-700',
  '已完成': 'bg-green-50 text-green-700',
  '有差异': 'bg-orange-50 text-orange-700',
}

const typeBadgeColors: Record<string, string> = {
  '全盘': 'bg-indigo-50 text-indigo-700',
  '抽盘': 'bg-purple-50 text-purple-700',
  '循环盘点': 'bg-teal-50 text-teal-700',
}

export default function StocktakePage() {
  const [search, setSearch] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [typeFilter, setTypeFilter] = useState('')

  const [orders, setOrders] = useState<StocktakeOrder[]>(initialStocktake)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [detailOrder, setDetailOrder] = useState<StocktakeOrder | null>(null)
  const [editingDetails, setEditingDetails] = useState<StocktakeDetail[] | null>(null)
  const isEditing = detailOrder?.status === '进行中' && editingDetails !== null

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.code.includes(search) || o.operator.includes(search)
    const matchWh = !warehouseFilter || o.warehouse === warehouseFilter
    const matchStatus = statusFilter === '全部' || o.status === statusFilter
    const matchType = !typeFilter || o.type === typeFilter
    return matchSearch && matchWh && matchStatus && matchType
  })

  // 统计
  const stats = {
    total: filtered.length,
    inProgress: filtered.filter((o) => o.status === '进行中').length,
    completed: filtered.filter((o) => o.status === '已完成').length,
    diff: filtered.filter((o) => o.status === '有差异').length,
  }

  // 新建盘点单表单
  const [form, setForm] = useState({
    type: '全盘',
    warehouse: '模具成品仓',
    planDate: '2026-06-19',
    operator: '',
    remark: '',
  })

  const handleCreate = () => {
    const newOrder: StocktakeOrder = {
      id: 'PD' + Date.now().toString(),
      code: 'PD-2026-' + String(orders.length + 1).padStart(2, '0'),
      type: form.type,
      warehouse: form.warehouse,
      planDate: form.planDate,
      operator: form.operator || '系统生成',
      totalItems: 0,
      diffItems: 0,
      status: '进行中',
      remark: form.remark,
      details: [],
    }
    setOrders([newOrder, ...orders])
    setShowCreateModal(false)
    setForm({ type: '全盘', warehouse: '模具成品仓', planDate: '2026-06-19', operator: '', remark: '' })
  }

  // 打开明细 - 进行中状态自动进入录入模式
  const openDetail = (o: StocktakeOrder) => {
    setDetailOrder(o)
    if (o.status === '进行中') {
      setEditingDetails(o.details.map((d) => ({ ...d })))
    } else {
      setEditingDetails(null)
    }
  }

  const closeDetail = () => {
    setDetailOrder(null)
    setEditingDetails(null)
  }

  // 更新单项的实盘数量
  const updateActualQty = (id: string, value: string) => {
    if (!editingDetails) return
    const num = value === '' ? 0 : parseInt(value, 10) || 0
    setEditingDetails(editingDetails.map((d) => d.id === id ? { ...d, actualQty: num, diffQty: num - d.bookQty } : d))
  }

  // 更新单项的备注
  const updateRemark = (id: string, value: string) => {
    if (!editingDetails) return
    setEditingDetails(editingDetails.map((d) => d.id === id ? { ...d, remark: value } : d))
  }

  // 一键全部一致（批量填充实盘=账面）
  const fillAllMatch = () => {
    if (!editingDetails) return
    setEditingDetails(editingDetails.map((d) => ({ ...d, actualQty: d.bookQty, diffQty: 0 })))
  }

  // 保存实盘 - 把 editingDetails 写回 orders 中的该订单
  const saveStocktake = () => {
    if (!detailOrder || !editingDetails) return
    const diffCount = editingDetails.filter((d) => d.diffQty !== 0).length
    setOrders((prev) => prev.map((o) => {
      if (o.id !== detailOrder.id) return o
      return {
        ...o,
        details: editingDetails,
        totalItems: editingDetails.length,
        diffItems: diffCount,
        status: diffCount > 0 ? '有差异' : '已完成',
      }
    }))
    closeDetail()
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-[#f5f6f8]">
        {/* 工具栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1 mr-2">
            <ClipboardCheck size={14} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">仓储盘点</span>
          </div>
          <div className="w-px h-4 bg-gray-200 mx-1" />

          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{filtered.length}</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="盘点单号 / 操作员"
            className="border border-gray-200 rounded px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-blue-400 bg-gray-50"
          />
          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm w-36 cursor-pointer hover:border-blue-300 bg-gray-50">
              <span className={warehouseFilter ? 'text-gray-700' : 'text-gray-400'}>{warehouseFilter || '仓库'}</span>
            </button>
            <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
              <option value="">全部</option>
              {WAREHOUSE_LIST.map((w) => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm w-28 cursor-pointer hover:border-blue-300 bg-gray-50">
              <span className={typeFilter ? 'text-gray-700' : 'text-gray-400'}>{typeFilter || '盘点类型'}</span>
            </button>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
              <option value="">全部</option>
              {STOCKTAKE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm w-24 cursor-pointer hover:border-blue-300 bg-gray-50">
              <span className="text-gray-700">{statusFilter}</span>
            </button>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
              {STOCKTAKE_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setSearch(''); setWarehouseFilter(''); setStatusFilter('全部'); setTypeFilter('') }}
            className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50 bg-white"
          >
            <RotateCcw size={12} /> 重置
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 text-xs text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded px-3 py-1.5 transition-colors"
            >
              <Plus size={13} /> 新建盘点单
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded bg-white"><RefreshCw size={13} /></button>
            <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded bg-white"><Settings size={13} /></button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-auto p-4">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">盘点单总数</div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">进行中</div>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">已完成</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">有差异</div>
              <div className="text-2xl font-bold text-orange-600">{stats.diff}</div>
            </div>
          </div>

          {/* 盘点单列表 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['盘点单号', '类型', '仓库', '计划日期', '操作员', '盘点项数', '差异项', '状态', '备注', '操作'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-xs text-gray-400">暂无盘点单</td></tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 text-[12px] font-medium text-[#1e5fa8]">{o.code}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${typeBadgeColors[o.type]}`}>{o.type}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-700">{o.warehouse}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600 whitespace-nowrap">{o.planDate}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-700">{o.operator}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600 font-medium">{o.totalItems}</td>
                      <td className="px-3 py-2.5 text-[12px]">
                        {o.diffItems > 0
                          ? <span className="text-orange-600 font-medium">{o.diffItems}</span>
                          : <span className="text-gray-400">0</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${statusColors[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-500">{o.remark || '-'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openDetail(o)}
                            className="flex items-center gap-1 text-[11px] text-[#1e5fa8] hover:text-[#164a85] transition-colors"
                          >
                            <Eye size={12} /> 查看明细
                          </button>
                          {o.status === '进行中' && (
                            <button
                              onClick={() => openDetail(o)}
                              className="flex items-center gap-1 text-[11px] text-green-600 hover:text-green-700 transition-colors"
                            >
                              <CheckCircle2 size={12} /> 录入实盘
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="px-4 py-2.5 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500">每页条目数:</span>
                <div className="relative">
                  <select className="appearance-none border border-gray-200 rounded px-2 py-1 text-[11px] pr-5 focus:outline-none bg-white">
                    <option>10</option><option>20</option><option>50</option>
                  </select>
                  <ChevronDown size={9} className="absolute right-1 top-2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-[11px] font-bold">1</div>
            </div>
          </div>
        </div>

        {/* 新建盘点单 弹窗 */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw] animate-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-[#1e5fa8]" />
                  <span className="text-sm font-semibold text-gray-800">新建盘点单</span>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <X size={14} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1.5">盘点类型 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 bg-white">
                        {STOCKTAKE_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1.5">盘点仓库 <span className="text-red-500">*</span></label>
                    <select value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 bg-white">
                      {WAREHOUSE_LIST.map((w) => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1.5">计划日期 <span className="text-red-500">*</span></label>
                    <input type="date" value={form.planDate} onChange={(e) => setForm({ ...form, planDate: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 bg-white" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1.5">操作员</label>
                    <input type="text" value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })}
                      placeholder="请输入操作员"
                      className="w-full border border-gray-200 rounded px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1.5">备注</label>
                  <textarea value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })}
                    rows={2} placeholder="请输入备注信息"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-blue-400 bg-white resize-none" />
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded px-3 py-2 text-[11px] text-gray-500">
                  提示：新建盘点单后将自动载入目标仓库的所有库存明细，您可逐项录入实盘数量。
                </div>
              </div>
              <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-end gap-2">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-1.5 text-[12px] text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">取消</button>
                <button onClick={handleCreate} className="px-4 py-1.5 text-[12px] text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded transition-colors">确认新建</button>
              </div>
            </div>
          </div>
        )}

        {/* 盘点明细 弹窗 */}
        {detailOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeDetail}>
            <div className="bg-white rounded-lg shadow-xl w-[950px] max-w-[95vw] max-h-[85vh] flex flex-col animate-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <div className="flex items-center gap-3">
                  <ClipboardCheck size={16} className="text-[#1e5fa8]" />
                  <span className="text-sm font-semibold text-gray-800">
                    {isEditing ? '实盘录入' : '盘点明细'}
                  </span>
                  <span className="text-xs text-gray-400">{detailOrder.code}</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${statusColors[detailOrder.status]}`}>{detailOrder.status}</span>
                </div>
                <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <X size={14} />
                </button>
              </div>

              {/* 概览信息 */}
              <div className="grid grid-cols-5 gap-3 px-5 py-4 bg-gray-50/50 border-b border-gray-200">
                <div><div className="text-[11px] text-gray-400 mb-0.5">类型</div><div className="text-[12px] text-gray-700 font-medium">{detailOrder.type}</div></div>
                <div><div className="text-[11px] text-gray-400 mb-0.5">仓库</div><div className="text-[12px] text-gray-700 font-medium">{detailOrder.warehouse}</div></div>
                <div><div className="text-[11px] text-gray-400 mb-0.5">计划日期</div><div className="text-[12px] text-gray-700 font-medium">{detailOrder.planDate}</div></div>
                <div><div className="text-[11px] text-gray-400 mb-0.5">操作员</div><div className="text-[12px] text-gray-700 font-medium">{detailOrder.operator}</div></div>
                <div><div className="text-[11px] text-gray-400 mb-0.5">总项数</div><div className="text-[12px] text-gray-700 font-medium">{(editingDetails ?? detailOrder.details).length} 项</div></div>
              </div>

              {/* 差异汇总 + 编辑模式下的快捷操作 */}
              <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-6 bg-white flex-wrap">
                {(() => {
                  const data = editingDetails ?? detailOrder.details
                  const matchCount = data.filter((d) => d.diffQty === 0).length
                  const diffCount = data.filter((d) => d.diffQty !== 0).length
                  return (
                    <>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-green-500" />
                        <span className="text-[12px] text-gray-600">一致项：<span className="font-semibold text-green-600">{matchCount}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={13} className="text-orange-500" />
                        <span className="text-[12px] text-gray-600">差异项：<span className="font-semibold text-orange-600">{diffCount}</span></span>
                      </div>
                      {isEditing && (
                        <button
                          onClick={fillAllMatch}
                          className="ml-4 flex items-center gap-1 text-[11px] text-[#1e5fa8] border border-[#1e5fa8]/30 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <CheckCircle2 size={11} /> 一键全部一致（实盘=账面）
                        </button>
                      )}
                      {isEditing && (
                        <div className="text-[11px] text-gray-400">
                          提示：请在"实盘数量"列逐项录入实际盘点结果，差异将自动计算
                        </div>
                      )}
                      {!isEditing && detailOrder.remark && (
                        <div className="ml-auto text-[11px] text-gray-500">备注：{detailOrder.remark}</div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* 明细列表 */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['序号', '工装编号', '品号', '品名', '规格', '库位', '账面数量', '实盘数量', '差异', '备注'].map((h) => (
                        <th key={h} className="px-2.5 py-2 text-left text-[11px] text-gray-500 font-medium whitespace-nowrap">
                          {isEditing && h === '实盘数量' && <span className="text-[#1e5fa8]">* </span>}
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const data = editingDetails ?? detailOrder.details
                      if (data.length === 0) {
                        return <tr><td colSpan={10} className="px-4 py-12 text-center text-xs text-gray-400">暂无盘点明细</td></tr>
                      }
                      return data.map((d, idx) => {
                        const hasDiff = d.diffQty !== 0
                        return (
                          <tr key={d.id} className={`border-b border-gray-100 transition-colors ${hasDiff ? 'bg-orange-50/30' : 'hover:bg-gray-50'}`}>
                            <td className="px-2.5 py-2 text-[12px] text-gray-500">{idx + 1}</td>
                            <td className="px-2.5 py-2 text-[12px] text-gray-700 whitespace-nowrap">{d.toolingNo || '-'}</td>
                            <td className="px-2.5 py-2 text-[12px] text-gray-700 whitespace-nowrap">{d.productCode}</td>
                            <td className="px-2.5 py-2 text-[12px] text-gray-800 font-medium whitespace-nowrap">{d.productName}</td>
                            <td className="px-2.5 py-2 text-[12px] text-gray-500 whitespace-nowrap">{d.spec}</td>
                            <td className="px-2.5 py-2 text-[12px] text-gray-600 whitespace-nowrap">{d.location}</td>
                            <td className="px-2.5 py-2 text-[12px] text-gray-700 font-medium text-center">{d.bookQty}</td>
                            <td className="px-2.5 py-2 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={d.actualQty === 0 ? '' : d.actualQty}
                                  onChange={(e) => updateActualQty(d.id, e.target.value)}
                                  placeholder="请输入"
                                  className={`w-20 border rounded px-2 py-1 text-[12px] text-center focus:outline-none focus:ring-1 transition-colors ${
                                    hasDiff
                                      ? 'border-orange-300 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/30'
                                      : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400 bg-white'
                                  }`}
                                />
                              ) : (
                                <span className="text-[12px] text-gray-700 font-medium">{d.actualQty}</span>
                              )}
                            </td>
                            <td className="px-2.5 py-2 text-[12px] text-center">
                              {d.diffQty === 0
                                ? <span className="text-green-600 text-[12px]">0</span>
                                : <span className={`font-bold text-[12px] ${d.diffQty < 0 ? 'text-red-600' : 'text-orange-600'}`}>{d.diffQty > 0 ? '+' : ''}{d.diffQty}</span>}
                            </td>
                            <td className="px-2.5 py-2 text-[12px] text-gray-600">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={d.remark || ''}
                                  onChange={(e) => updateRemark(d.id, e.target.value)}
                                  placeholder="如：破损/盘盈/盘亏原因"
                                  className="w-full border border-gray-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-400"
                                />
                              ) : (
                                <span className="text-[12px] text-gray-500">{d.remark || '-'}</span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>

              {/* 底部操作 */}
              <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-end gap-2 bg-white shrink-0">
                <button onClick={closeDetail} className="px-4 py-1.5 text-[12px] text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">关闭</button>
                {detailOrder.status === '进行中' && (
                  <>
                    <button
                      onClick={closeDetail}
                      className="px-4 py-1.5 text-[12px] text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >稍后继续</button>
                    <button
                      onClick={saveStocktake}
                      className="px-4 py-1.5 text-[12px] text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded transition-colors"
                    >保存实盘</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
