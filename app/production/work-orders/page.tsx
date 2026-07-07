'use client'

import { useState, useMemo } from 'react'
import {
  Search, Plus, RotateCcw, ChevronDown, X, Eye,
  Pencil, Play, Pause, CheckCircle, XCircle, ClipboardList,
  FileText, Package, AlertTriangle, Trash2, GripVertical, Info, User, Lock,
  Truck, Warehouse, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/main-layout'

type WOStatus = '进行中' | '已完工' | '待开始' | '已暂停'
type MaterialCategory = '通用件' | '易损件' | '标准件' | '技术开发类' | '夹具类' | '辅具类' | '检具类' | '外销'
type InboundWarehouse = '备料仓' | '技术仓' | '成品仓'
type WOType = 'single' | 'multi' | 'spare'

interface MoldNumber {
  id: string
  number: string
  isInbound: boolean
}

interface WorkOrder {
  id: string
  woNo: string
  planNo: string
  toolCode: string
  toolName: string
  category: string
  route: string
  planQty: number
  actualQty: number
  completedQty: number
  planStart: string
  planEnd: string
  status: WOStatus
  progress: number
  fromErp: boolean
  assignedTo?: string
  materialCategory: MaterialCategory
  inboundWarehouse: InboundWarehouse
  isIssued: boolean
  woType: WOType
  woTypeLabel: string
  moldNumbers: MoldNumber[]
}

const MATERIAL_CATEGORY_COLORS: Record<MaterialCategory, string> = {
  '通用件': 'bg-slate-100 text-slate-700 border-slate-200',
  '易损件': 'bg-red-50 text-red-700 border-red-200',
  '标准件': 'bg-blue-50 text-blue-700 border-blue-200',
  '技术开发类': 'bg-violet-50 text-violet-700 border-violet-200',
  '夹具类': 'bg-amber-50 text-amber-700 border-amber-200',
  '辅具类': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '检具类': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  '外销': 'bg-pink-50 text-pink-700 border-pink-200',
}

const MATERIAL_CATEGORIES: MaterialCategory[] = ['通用件', '易损件', '标准件', '技术开发类', '夹具类', '辅具类', '检具类', '外销']
const WAREHOUSE_OPTIONS: InboundWarehouse[] = ['备料仓', '技术仓', '成品仓']

function getDefaultWarehouse(category: MaterialCategory, toolCategory: string): InboundWarehouse {
  if (category === '技术开发类') return '技术仓'
  if (toolCategory === '工装备件') return '备料仓'
  return '成品仓'
}

const STATUS_STYLES: Record<WOStatus, string> = {
  '进行中': 'bg-blue-50 text-blue-700',
  '已完工': 'bg-emerald-100 text-emerald-700',
  '待开始': 'bg-amber-50 text-amber-700',
  '已暂停': 'bg-purple-50 text-purple-700',
}

const WO_TYPE_COLORS: Record<WOType, string> = {
  single: 'bg-blue-100 text-blue-700',
  multi: 'bg-purple-100 text-purple-700',
  spare: 'bg-gray-100 text-gray-700',
}

const MOCK_ORDERS: WorkOrder[] = [
  { id: 'W001', woNo: 'WO-2024-001', planNo: 'PP-2024-001', toolCode: '190038', toolName: '电机轴注塑模具', category: '注塑模具', route: '模具标准工艺路线A', planQty: 1, actualQty: 1, completedQty: 0, planStart: '2024-07-01', planEnd: '2024-07-15', status: '进行中', progress: 63, fromErp: true, materialCategory: '技术开发类', inboundWarehouse: '技术仓', isIssued: true, woType: 'single', woTypeLabel: '单件模具工单', moldNumbers: [{ id: 'M1', number: '198', isInbound: false }] },
  { id: 'W002', woNo: 'WO-2024-002', planNo: 'PP-2024-002', toolCode: '26015',  toolName: '齿轮压铸模',     category: '压铸模具', route: '压铸模工艺路线B',   planQty: 5, actualQty: 5, completedQty: 0, planStart: '2024-07-05', planEnd: '2024-07-20', status: '待开始', progress: 0, fromErp: true, materialCategory: '通用件', inboundWarehouse: '成品仓', isIssued: false, woType: 'multi', woTypeLabel: '多件模具工单', moldNumbers: [{ id: 'M2', number: '199', isInbound: false }, { id: 'M3', number: '200', isInbound: false }, { id: 'M4', number: '201', isInbound: false }, { id: 'M5', number: '202', isInbound: false }, { id: 'M6', number: '203', isInbound: false }] },
  { id: 'W003', woNo: 'WO-2024-003', planNo: 'PP-2024-003', toolCode: '190041', toolName: '壳体冲压模具',     category: '冲压模具', route: '冲压模工艺路线C',   planQty: 1, actualQty: 1, completedQty: 1, planStart: '2024-06-20', planEnd: '2024-07-10', status: '已完工', progress: 100, fromErp: true, materialCategory: '标准件', inboundWarehouse: '成品仓', isIssued: true, woType: 'single', woTypeLabel: '单件模具工单', moldNumbers: [{ id: 'M7', number: '197', isInbound: true }] },
  { id: 'W004', woNo: 'WO-2024-004', planNo: 'PP-2024-003', toolCode: '26088',  toolName: '定位销组件',       category: '工装备件', route: '备件加工工艺',       planQty: 200, actualQty: 150, completedQty: 80, planStart: '2024-07-08', planEnd: '2024-07-25', status: '已暂停', progress: 40, fromErp: true, materialCategory: '易损件', inboundWarehouse: '备料仓', isIssued: true, woType: 'spare', woTypeLabel: '备料类工单', moldNumbers: [] },
  { id: 'W005', woNo: 'WO-2024-005', planNo: 'PP-2024-005', toolCode: '26102',  toolName: '风扇叶片吹塑件',   category: '吹塑模具', route: '吹塑件工艺路线D',   planQty: 3, actualQty: 0, completedQty: 0, planStart: '2024-07-12', planEnd: '2024-07-30', status: '待开始', progress: 0, fromErp: true, materialCategory: '外销', inboundWarehouse: '成品仓', isIssued: false, woType: 'multi', woTypeLabel: '多件模具工单', moldNumbers: [{ id: 'M8', number: '204', isInbound: false }, { id: 'M9', number: '205', isInbound: false }, { id: 'M10', number: '206', isInbound: false }] },
  { id: 'W006', woNo: 'WO-2024-006', planNo: 'PP-2024-001', toolCode: '190038', toolName: '电机轴注塑模具',   category: '注塑模具', route: '模具标准工艺路线A', planQty: 1, actualQty: 1, completedQty: 0, planStart: '2024-07-10', planEnd: '2024-07-22', status: '进行中', progress: 20, fromErp: true, materialCategory: '夹具类', inboundWarehouse: '成品仓', isIssued: true, woType: 'single', woTypeLabel: '单件模具工单', moldNumbers: [{ id: 'M11', number: '207', isInbound: false }] },
]

interface ProcessStep {
  seq: string
  name: string
  workCenter: string
  planHours: number
  actualHours: number
  status: '待开始' | '进行中' | '已完成' | '待检验'
  isOutsource: boolean
  isInspect: boolean
  isFromErp: boolean
  isModified: boolean
  outsourceWoNo?: string
  outsourceVendor?: string
  outsourceProgress?: number
  outsourceArrival?: string
  planQty?: number
  reportedQty?: number
  outsourceArrivedQty?: number
}

const MOCK_PROCESSES: Record<string, ProcessStep[]> = {
  W001: [
    { seq: '0010', name: '粗铣',      workCenter: '加工中心01', planHours: 8,   actualHours: 8.5,  status: '已完成', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0020', name: '钳工',      workCenter: '钳工车间',   planHours: 4,   actualHours: 4.2,  status: '已完成', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0030', name: '热处理',    workCenter: '热处理车间', planHours: 24,  actualHours: 26,   status: '已完成', isOutsource: true,  isInspect: true,  outsourceWoNo: 'OS-2024-001', outsourceVendor: '精工热处理厂', outsourceProgress: 100, outsourceArrival: '2024-07-05', isFromErp: true, isModified: false },
    { seq: '0040', name: '车配',      workCenter: '车床车间',   planHours: 6,   actualHours: 5.8,  status: '已完成', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0050', name: '精车',      workCenter: '车床车间',   planHours: 4,   actualHours: 4.1,  status: '已完成', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0060', name: '平面磨',    workCenter: '磨床车间',   planHours: 3,   actualHours: 3.2,  status: '已完成', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0070', name: '线切割',    workCenter: '线切割车间', planHours: 4,   actualHours: 4.5,  status: '已完成', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0080', name: '精铣',      workCenter: '加工中心01', planHours: 6,   actualHours: 6.3,  status: '已完成', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0090', name: '平面割',    workCenter: '切割车间',   planHours: 2,   actualHours: 2.1,  status: '已完成', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0100', name: '线切割',    workCenter: '线切割车间', planHours: 3,   actualHours: 1.5,  status: '进行中', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0110', name: '精铣+电火', workCenter: '加工中心02', planHours: 8,   actualHours: 0,    status: '待开始', isOutsource: false, isInspect: true, isFromErp: true, isModified: false },
    { seq: '0120', name: '抛光',      workCenter: '抛光车间',   planHours: 2,   actualHours: 0,    status: '待开始', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
  ],
  W002: [
    { seq: '0010', name: '粗铣', workCenter: '加工中心01', planHours: 10, actualHours: 0, status: '待开始', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0020', name: '钳工', workCenter: '钳工车间',   planHours: 5,  actualHours: 0, status: '待开始', isOutsource: false, isInspect: false, isFromErp: true, isModified: false },
    { seq: '0030', name: '热处理', workCenter: '热处理车间', planHours: 24, actualHours: 0, status: '待开始', isOutsource: true, isInspect: true, outsourceWoNo: 'OS-2024-002', outsourceVendor: '精工热处理厂', outsourceProgress: 0, isFromErp: true, isModified: false },
  ],
  // 定位销组件 - 演示分批报工+委外
  W004: [
    { seq: '0010', name: '下料', workCenter: '下料车间', planHours: 2, actualHours: 2, status: '已完成', isOutsource: false, isInspect: false, isFromErp: true, isModified: false, planQty: 200, reportedQty: 200 },
    { seq: '0020', name: '粗车', workCenter: '车床车间', planHours: 8, actualHours: 6, status: '进行中', isOutsource: false, isInspect: false, isFromErp: true, isModified: false, planQty: 200, reportedQty: 80 },
    { seq: '0030', name: '热处理', workCenter: '委外', planHours: 24, actualHours: 0, status: '待开始', isOutsource: true, isInspect: false, outsourceWoNo: 'OS-2024-004', outsourceVendor: '精工热处理厂', isFromErp: true, isModified: false, planQty: 200, outsourceArrivedQty: 0 },
    { seq: '0040', name: '精车', workCenter: '车床车间', planHours: 6, actualHours: 0, status: '待开始', isOutsource: false, isInspect: false, isFromErp: true, isModified: false, planQty: 200, reportedQty: 0 },
    { seq: '0050', name: '检验', workCenter: '质检', planHours: 1, actualHours: 0, status: '待开始', isOutsource: false, isInspect: true, isFromErp: true, isModified: false, planQty: 200, reportedQty: 0 },
  ],
}

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>(MOCK_ORDERS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMaterialCategory, setFilterMaterialCategory] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [detailOrder, setDetailOrder] = useState<WorkOrder | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newForm, setNewForm] = useState({ planNo: '', toolCode: '', toolName: '', route: '', planQty: '', planStart: '', planEnd: '' })
  const [isEditingProcess, setIsEditingProcess] = useState(false)
  const [editProcesses, setEditProcesses] = useState<ProcessStep[]>([])
  const [processesMap, setProcessesMap] = useState<Record<string, ProcessStep[]>>(MOCK_PROCESSES)

  // 计算工单进度：Σ(各工序完成度) / 总工序数
  const calculateProgress = (woId: string, planQty: number): number => {
    const procs = processesMap[woId]
    if (!procs || procs.length === 0) return 0
    const total = procs.reduce((sum, p) => {
      const pQty = p.planQty ?? planQty
      if (pQty <= 0) return sum
      let doneQty = 0
      if (p.isOutsource) {
        doneQty = p.outsourceArrivedQty ?? (p.status === '已完成' ? pQty : p.status === '进行中' ? Math.floor(pQty * 0.5) : 0)
      } else {
        doneQty = p.reportedQty ?? (p.status === '已完成' ? pQty : p.status === '进行中' ? Math.floor(pQty * 0.5) : 0)
      }
      const completion = Math.min(doneQty, pQty) / pQty
      return sum + completion
    }, 0)
    return Math.round((total / procs.length) * 100)
  }

  // 带进度的工单列表（动态计算）
  const ordersWithProgress = useMemo(() => {
    return orders.map(o => ({
      ...o,
      progress: calculateProgress(o.id, o.planQty),
    }))
  }, [orders, processesMap])

  const filtered = ordersWithProgress.filter(o => {
    if (search && !o.woNo.toLowerCase().includes(search.toLowerCase()) && !o.toolName.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && o.status !== filterStatus) return false
    if (filterMaterialCategory && o.materialCategory !== filterMaterialCategory) return false
    if (filterWarehouse && o.inboundWarehouse !== filterWarehouse) return false
    return true
  })

  // 模拟当前用户（可切换为 'ADMIN' 或 '钳工A'）
  const [currentUser] = useState<string>('钳工A')  // TODO: 替换为真实登录用户
  const isAdmin = currentUser === 'ADMIN'

  // 详情面板Tab
  const [detailTab, setDetailTab] = useState<'overview' | 'process' | 'outsource' | 'inbound'>('overview')

  // 模拟委外单数据（关联工单号）
  const MOCK_OUTSOURCE_ORDERS = [
    {
      id: 'OUT-2024-0708-001',
      woNo: 'WO-2024-004',
      moldCode: '26088',
      moldName: '定位销组件',
      processCode: '0020',
      processName: '热处理',
      vendor: '精工热处理厂',
      outsourceQty: 120,
      arrivedQty: 0,
      status: '已下达',
      planSendDate: '2024-07-10',
      planReturnDate: '2024-07-18',
      createTime: '2024-07-10 09:00',
    },
  ]

  // 模拟入库批次数据（关联工单号）
  const MOCK_INBOUND_BATCHES = [
    {
      id: 'RK-20240715-0001',
      woNo: 'WO-2024-003',
      batchNo: 'MO20240620-03-01',
      batchType: '自制完工批次',
      batchQty: 1,
      warehouse: '成品仓',
      location: 'A-01-03',
      inboundTime: '2024-07-10 16:00',
      inspector: '质检员A',
      inspectNo: 'QMS-20240710-001',
    },
  ]

  // 获取当前工单关联的委外单
  const relatedOutsourceOrders = useMemo(() => {
    if (!detailOrder) return []
    return MOCK_OUTSOURCE_ORDERS.filter(o => o.woNo === detailOrder.woNo)
  }, [detailOrder])

  // 获取当前工单关联的入库批次
  const relatedInboundBatches = useMemo(() => {
    if (!detailOrder) return []
    return MOCK_INBOUND_BATCHES.filter(b => b.woNo === detailOrder.woNo)
  }, [detailOrder])

  const statusOptions: WOStatus[] = ['进行中', '已完工', '待开始', '已暂停']

  const kpiCards = [
    { label: '工单总数', value: ordersWithProgress.length, color: 'text-gray-700' },
    { label: '进行中', value: ordersWithProgress.filter(o => o.status === '进行中').length, color: 'text-blue-600' },
    { label: '已完工', value: ordersWithProgress.filter(o => o.status === '已完工').length, color: 'text-emerald-600' },
    { label: '待开始', value: ordersWithProgress.filter(o => o.status === '待开始').length, color: 'text-amber-600' },
    { label: '已暂停', value: ordersWithProgress.filter(o => o.status === '已暂停').length, color: 'text-purple-600' },
  ]

  const steps = detailOrder ? (processesMap[detailOrder.id] || []) : []
  const detailProgress = detailOrder ? calculateProgress(detailOrder.id, detailOrder.planQty) : 0

  const startEditProcess = () => {
    if (!detailOrder) return
    setEditProcesses(JSON.parse(JSON.stringify(steps)))
    setIsEditingProcess(true)
  }

  const cancelEditProcess = () => {
    setIsEditingProcess(false)
    setEditProcesses([])
  }

  const saveEditProcess = () => {
    if (!detailOrder) return
    setProcessesMap(prev => ({ ...prev, [detailOrder.id]: editProcesses }))
    setIsEditingProcess(false)
    setEditProcesses([])
  }

  const handleIssueWO = () => {
    if (!detailOrder) return
    if (!confirm(`确认下达工单 ${detailOrder.woNo}？\n\n下达后：\n• 您将成为本工单负责人\n• 工序将锁定，不可再调整\n• 进入领料环节`)) return

    setOrders(list => list.map(o => o.id === detailOrder.id ? {
      ...o,
      status: '进行中',
      isIssued: true,
      assignedTo: currentUser,
    } : o))

    setDetailOrder(prev => prev && prev.id === detailOrder.id ? {
      ...prev,
      status: '进行中',
      isIssued: true,
      assignedTo: currentUser,
    } : prev)

    alert(`工单 ${detailOrder.woNo} 已下达！\n\n负责人：${currentUser}\n已进入领料环节`)
  }

  const addProcess = () => {
    const newSeq = String((editProcesses.length + 1) * 10).padStart(4, '0')
    setEditProcesses([
      ...editProcesses,
      {
        seq: newSeq,
        name: '',
        workCenter: '加工中心01',
        planHours: 1,
        actualHours: 0,
        status: '待开始',
        isOutsource: false,
        isInspect: false,
        isFromErp: false,
        isModified: false,
      }
    ])
  }

  const removeProcess = (idx: number) => {
    const proc = editProcesses[idx]
    if (proc?.isFromErp) {
      if (!confirm('该工序来源于ERP，删除后仅影响当前工单，确认删除吗？')) return
    }
    const newList = editProcesses.filter((_, i) => i !== idx)
    setEditProcesses(newList.map((p, i) => ({ ...p, seq: String((i + 1) * 10).padStart(4, '0') })))
  }

  const updateProcess = (idx: number, key: keyof ProcessStep, value: string | number | boolean) => {
    setEditProcesses(editProcesses.map((p, i) => {
      if (i !== idx) return p
      return { ...p, [key]: value, isModified: p.isFromErp ? true : p.isModified }
    }))
  }

  const moveProcess = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= editProcesses.length) return
    const arr = [...editProcesses]
    const [item] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, item)
    setEditProcesses(arr.map((p, i) => ({ ...p, seq: String((i + 1) * 10).padStart(4, '0') })))
  }

  return (
    <MainLayout>
    <div className="flex h-full overflow-hidden bg-[#f5f6f8]">
      {/* Left panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-auto">
        {/* KPI */}
        <div className="grid grid-cols-5 gap-3 p-4 pb-0">
          {kpiCards.map(c => (
            <div key={c.label} className="bg-white rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className={cn('text-2xl font-bold', c.color)}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 pt-4 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-3 h-8 text-sm">
            <Search size={14} className="text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="工单号/品号/品名" className="outline-none w-44 text-gray-700 placeholder:text-gray-400" />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-8 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded text-gray-700 outline-none appearance-none cursor-pointer">
              <option value="">全部状态</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterMaterialCategory} onChange={e => setFilterMaterialCategory(e.target.value)} className="h-8 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded text-gray-700 outline-none appearance-none cursor-pointer">
              <option value="">全部物料分类</option>
              {MATERIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)} className="h-8 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded text-gray-700 outline-none appearance-none cursor-pointer">
              <option value="">全部入库仓库</option>
              {WAREHOUSE_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterMaterialCategory(''); setFilterWarehouse('') }} className="flex items-center gap-1 h-8 px-3 text-sm text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50">
            <RotateCcw size={13} /> 重置
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <FileText size={12} /> 数据来源于 ERP 全量同步，工单不可手动新增
          </span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto m-4 bg-white rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">工单编号</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">品号</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">品名</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">物料分类</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">品类</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">工艺路径</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium text-xs">投产数量</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">工单类型</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">模具编号</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium text-xs">完工数量</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">指定入库仓库</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">计划开始</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">计划结束</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs w-32">进度</th>
                <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">状态</th>
                <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wo, idx) => (
                <tr key={wo.id} className={cn('border-b border-gray-100 hover:bg-gray-50 cursor-pointer', idx % 2 === 1 && 'bg-gray-50/50', detailOrder?.id === wo.id && 'bg-blue-50/40')} onClick={() => setDetailOrder(wo)}>
                  <td className="px-4 py-3 font-mono text-xs text-[#1e5fa8] font-medium">{wo.woNo}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-mono">{wo.toolCode}</td>
                  <td className="px-4 py-3 text-gray-800">{wo.toolName}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', MATERIAL_CATEGORY_COLORS[wo.materialCategory])}>
                      {wo.materialCategory}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{wo.category}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{wo.route}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{wo.planQty}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', WO_TYPE_COLORS[wo.woType])}>
                      {wo.woTypeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {wo.woType === 'spare' ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : wo.moldNumbers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {wo.moldNumbers.slice(0, 3).map(m => (
                          <span key={m.id} className={cn('px-1.5 py-0.5 rounded text-[11px] font-mono border', m.isInbound ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-100 text-blue-700 border-blue-200')}>
                            {m.number}
                          </span>
                        ))}
                        {wo.moldNumbers.length > 3 && (
                          <span className="text-xs text-gray-400">+{wo.moldNumbers.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">待生成</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{wo.completedQty}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{wo.inboundWarehouse}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{wo.planStart}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{wo.planEnd}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className={cn('h-full rounded-full', wo.progress === 100 ? 'bg-emerald-500' : wo.status === '已暂停' ? 'bg-yellow-400' : 'bg-[#1e5fa8]')} style={{ width: `${wo.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{wo.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {wo.fromErp && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full" title="ERP同步" />}
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[wo.status])}>{wo.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setDetailOrder(wo)} className="text-gray-400 hover:text-[#1e5fa8]" title="查看工序/详情"><Eye size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right detail panel */}
      {detailOrder && (
        <div className="w-[420px] min-w-[420px] shrink-0 bg-white border-l border-gray-200 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="font-semibold text-gray-800 text-sm">{detailOrder.woNo}</p>
              <p className="text-xs text-gray-400 mt-0.5">{detailOrder.toolCode} · {detailOrder.toolName}</p>
            </div>
            <button onClick={() => setDetailOrder(null)}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
          </div>

          {/* Tab 切换 */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            {[
              { key: 'overview', label: '概览', icon: <FileText size={13} /> },
              { key: 'process', label: '工序', icon: <ClipboardList size={13} /> },
              { key: 'outsource', label: `委外${relatedOutsourceOrders.length > 0 ? `(${relatedOutsourceOrders.length})` : ''}`, icon: <Truck size={13} /> },
              { key: 'inbound', label: `入库${relatedInboundBatches.length > 0 ? `(${relatedInboundBatches.length})` : ''}`, icon: <Warehouse size={13} /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setDetailTab(tab.key as any)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors border-b-2',
                  detailTab === tab.key
                    ? 'border-[#1e5fa8] text-[#1e5fa8] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          <div className="flex-1 overflow-y-auto">
            {/* 概览 Tab */}
            {detailTab === 'overview' && (
              <div className="p-4 space-y-4">
                {/* 基本信息卡片 */}
                <div className="bg-gradient-to-br from-[#1e5fa8] to-[#2a70c0] rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] opacity-80">整体进度</span>
                    <span className="text-2xl font-bold">{detailProgress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                    <div className="bg-white h-full rounded-full transition-all" style={{ width: `${detailProgress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] opacity-90">
                    <span>计划数量</span>
                    <span className="font-semibold">{detailOrder.planQty}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] opacity-90 mt-1">
                    <span>已入库数量</span>
                    <span className="font-semibold">{relatedInboundBatches.reduce((s, b) => s + b.batchQty, 0)}</span>
                  </div>
                </div>

                {/* 关键指标 */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 mb-1">工序总数</div>
                    <div className="text-sm font-bold text-gray-700">{steps.length} 道</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 mb-1">已完成工序</div>
                    <div className="text-sm font-bold text-emerald-600">
                      {steps.filter(s => {
                        const pQty = s.planQty ?? (detailOrder.planQty || 1)
                        const doneQty = s.isOutsource
                          ? (s.outsourceArrivedQty ?? 0)
                          : (s.reportedQty ?? 0)
                        return doneQty >= pQty
                      }).length} 道
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-[10px] text-orange-400 mb-1">委外单</div>
                    <div className="text-sm font-bold text-orange-600">{relatedOutsourceOrders.length} 张</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-[10px] text-blue-400 mb-1">入库批次</div>
                    <div className="text-sm font-bold text-blue-600">{relatedInboundBatches.length} 批</div>
                  </div>
                </div>

                {/* 基本信息 */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Info size={12} className="text-gray-400" /> 基本信息
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">物料分类</span>
                      <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium border', MATERIAL_CATEGORY_COLORS[detailOrder.materialCategory])}>
                        {detailOrder.materialCategory}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">指定入库仓库</span>
                      <span className="text-gray-700 font-medium">
                        {detailOrder.inboundWarehouse}
                        {detailOrder.isIssued && <Lock size={10} className="inline ml-1 text-gray-400" />}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">下达状态</span>
                      <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium', detailOrder.isIssued ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                        {detailOrder.isIssued ? '已下达' : '未下达'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">工单状态</span>
                      <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium', STATUS_STYLES[detailOrder.status])}>
                        {detailOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">品类 / 工艺路径</span>
                      <span className="text-gray-600">{detailOrder.category} / {detailOrder.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">计划周期</span>
                      <span className="text-gray-600">{detailOrder.planStart} ~ {detailOrder.planEnd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">工单负责人</span>
                      <span className="text-gray-700 font-medium">
                        <User size={11} className="inline mr-1 text-gray-400" />
                        {detailOrder.assignedTo || '待分配'}
                      </span>
                    </div>
                  </div>
                </div>

                {detailOrder.status === '待开始' && (
                  <button
                    onClick={handleIssueWO}
                    className="w-full flex items-center justify-center gap-1.5 h-9 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    <CheckCircle size={14} /> 确认下达并领料
                  </button>
                )}

              </div>
            )}

            {/* 工序 Tab */}
            {detailTab === 'process' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <ClipboardList size={13} /> 工艺路径 / 工序状态
                  </p>
                  {(() => {
                    // 只要存在"待开始"状态的工序，就允许编辑
                    const editable = !isEditingProcess && detailOrder && steps.some(s => {
                      if (s.status !== '待开始') return false
                      // 委外工序如果已创建委外单（status非'待开始'），不允许编辑
                      if (s.isOutsource && s.outsourceWoNo) return false
                      return true
                    })
                    return editable ? (
                      <button
                        onClick={startEditProcess}
                        className="flex items-center gap-1 text-xs text-[#1e5fa8] hover:text-[#1a4f8f]"
                      >
                        <Pencil size={12} /> 调整工序
                      </button>
                    ) : null
                  })()}
                </div>

                {(() => {
                  const hasPending = steps.some(s => s.status === '待开始' && (!s.isOutsource || !s.outsourceWoNo))
                  if (hasPending) {
                    return (
                      <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <p className="text-[11px] text-amber-700 flex items-center gap-1">
                          <Info size={12} /> 存在未开始的工序，可点击「调整工序」进行增删改、调换顺序、调整工作中心等操作。
                        </p>
                      </div>
                    )
                  }
                  return null
                })()}

            {!isEditingProcess && (
              <>
                {steps.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400 mb-3">工单未下达，暂无任务</p>
                    {detailOrder?.status === '待开始' && (
                      <p className="text-[11px] text-gray-400">
                        下达工单后将自动生成：领料任务 → 工艺工序 → 最终检验
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {steps.map((step, stepIdx) => {
                      const pQty = step.planQty ?? (detailOrder?.planQty || 1)
                      let doneQty = 0
                      if (step.isOutsource) {
                        doneQty = step.outsourceArrivedQty ?? (step.status === '已完成' ? pQty : step.status === '进行中' ? Math.floor(pQty * 0.5) : 0)
                      } else {
                        doneQty = step.reportedQty ?? (step.status === '已完成' ? pQty : step.status === '进行中' ? Math.floor(pQty * 0.5) : 0)
                      }
                      const completion = pQty > 0 ? Math.min(doneQty, pQty) / pQty : 0
                      let stepStatus: '已完成' | '进行中' | '待开始' | '待检验'
                      if (completion >= 1) {
                        stepStatus = '已完成'
                      } else if (completion > 0) {
                        stepStatus = '进行中'
                      } else {
                        stepStatus = '待开始'
                      }
                      const isFinished = stepStatus === '已完成'
                      const isInProgress = stepStatus === '进行中'
                      const isPending = stepStatus === '待开始'
                      const isInspect = stepStatus === '待检验'
                      const prevStep = stepIdx > 0 ? steps[stepIdx - 1] : null
                      const prevDoneQty = prevStep ? (
                        prevStep.isOutsource
                          ? (prevStep.outsourceArrivedQty ?? 0)
                          : (prevStep.reportedQty ?? 0)
                      ) : pQty
                      const prevCompletion = prevStep ? (
                        pQty > 0 ? Math.min(prevDoneQty, pQty) / pQty : 0
                      ) : 1
                      return (
                        <div key={step.seq} className={cn(
                            'rounded-lg border px-3 py-2.5 relative',
                            isFinished ? 'border-emerald-200 bg-emerald-50' :
                            isInProgress ? 'border-blue-200 bg-blue-50' :
                            isInspect ? 'border-purple-200 bg-purple-50' :
                            'border-gray-200 bg-gray-50 border-dashed'
                          )}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs text-gray-400 font-mono font-medium shrink-0">{step.seq}</span>
                                <span className={cn('text-sm font-medium truncate',
                                  isPending ? 'text-gray-400' : 'text-gray-800'
                                )}>
                                  {step.name}
                                </span>
                                <div className="flex gap-1 shrink-0">
                                  {step.isOutsource && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-medium">
                                      <Package size={10} /> 委外
                                    </span>
                                  )}
                                  {step.isInspect && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-medium">
                                      <AlertTriangle size={10} /> 检验
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={cn('text-xs px-1.5 py-0.5 rounded shrink-0',
                                isFinished ? 'bg-emerald-100 text-emerald-700' :
                                isInProgress ? 'bg-blue-100 text-blue-700' :
                                isInspect ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-500'
                              )}>
                                {stepStatus}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{step.workCenter}</span>
                              <span>
                                {step.isOutsource
                                  ? `到货 ${doneQty} / ${pQty}`
                                  : `报工 ${doneQty} / ${pQty}`
                                }
                              </span>
                            </div>

                            {step.isOutsource && stepStatus !== '待开始' && (
                              <div className="mt-2 pt-2 border-t border-orange-200/60 text-xs text-orange-800">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="font-medium">
                                    {step.outsourceWoNo ? `委外工单号：${step.outsourceWoNo}` : '委外任务待创建'}
                                  </span>
                                  <span>{Math.round(completion * 100)}%</span>
                                </div>
                                {step.outsourceVendor && (
                                  <div className="flex items-center justify-between text-[11px] text-orange-700">
                                    <span>供应商：{step.outsourceVendor}</span>
                                    {step.outsourceArrival && <span>到货：{step.outsourceArrival}</span>}
                                  </div>
                                )}
                                <div className="mt-1 w-full bg-orange-200/60 rounded-full h-1 overflow-hidden">
                                  <div className="h-full bg-orange-500" style={{ width: `${completion * 100}%` }} />
                                </div>
                              </div>
                            )}

                            {isInProgress && !step.isOutsource && (
                              <div className="mt-2 pt-2 border-t border-blue-200/60">
                                <p className="text-[11px] text-blue-600 mb-1.5">进行中</p>
                                <div className="flex gap-2">
                                  <button className="flex-1 flex items-center justify-center gap-1 h-7 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
                                    报工
                                  </button>
                                  <button className="flex-1 flex items-center justify-center gap-1 h-7 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600">
                                    <CheckCircle size={11} /> 完成
                                  </button>
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        const reason = prompt(
                                          `ADMIN工序回退\n\n` +
                                          `工序：${step.seq} ${step.name}\n` +
                                          `当前状态：进行中\n` +
                                          `回退后状态：待开始\n\n` +
                                          `请输入回退原因：`,
                                          '工序执行有误，需重新开始'
                                        )
                                        if (reason === null) return
                                        if (!reason.trim()) {
                                          alert('回退原因不能为空')
                                          return
                                        }
                                        if (!confirm(`确认回退工序「${step.name}」？\n\n回退后：\n• 工序状态变更为「待开始」\n• 报工数据将清空\n• 原因：${reason}`)) return
                                        const newSteps = [...steps]
                                        newSteps[stepIdx] = {
                                          ...newSteps[stepIdx],
                                          status: '待开始',
                                          actualHours: 0,
                                          reportedQty: 0,
                                          isModified: true,
                                        }
                                        setProcessesMap(prev => ({ ...prev, [detailOrder!.id]: newSteps }))
                                        alert(`工序「${step.name}」已回退至「待开始」\n\n回退原因：${reason}`)
                                      }}
                                      className="flex items-center justify-center gap-1 h-7 px-2 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
                                      title="ADMIN权限：回退到待开始"
                                    >
                                      <RotateCcw size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {isPending && prevCompletion >= 1 && (
                              <div className="mt-2 pt-2 border-t border-gray-200/60">
                                {step.isOutsource ? (
                                  <div className="space-y-2">
                                    <p className="text-[11px] text-amber-600">委外工序，需手动创建委外任务</p>
                                    <div className="flex gap-2">
                                      <button className="flex-1 flex items-center justify-center gap-1 h-7 text-xs bg-orange-500 text-white rounded hover:bg-orange-600">
                                        <Package size={11} /> 创建委外
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                      <User size={12} />
                                      <span>负责人：{detailOrder.assignedTo || '-'}</span>
                                    </div>
                                    {isAdmin && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`确认将任务分配给「钳工B」？`)) {
                                            setOrders(prev => prev.map(o => o.id === detailOrder!.id ? { ...o, assignedTo: '钳工B' } : o))
                                            setDetailOrder(prev => prev ? { ...prev, assignedTo: '钳工B' } : null)
                                          }
                                        }}
                                        className="flex items-center justify-center gap-1 h-7 px-3 text-xs bg-gray-100 border border-gray-200 text-gray-600 rounded hover:bg-gray-200"
                                      >
                                        <Pencil size={11} /> 分配任务
                                      </button>
                                    )}
                                    {!isAdmin && (
                                      <span className="text-[11px] text-gray-400">等待任务分配</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {isFinished && (
                              <div className="mt-2 pt-2 border-t border-emerald-200/60">
                                <div className="flex gap-2">
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        const reason = prompt(
                                          `ADMIN工序回退\n\n` +
                                          `工序：${step.seq} ${step.name}\n` +
                                          `当前状态：已完成\n` +
                                          `回退后状态：待开始\n\n` +
                                          `请输入回退原因：`,
                                          '委外给错供应商，需重新委外'
                                        )
                                        if (reason === null) return
                                        if (!reason.trim()) {
                                          alert('回退原因不能为空')
                                          return
                                        }
                                        if (!confirm(`确认回退工序「${step.name}」？\n\n回退后：\n• 工序状态变更为「待开始」\n• 报工数据 / 委外到货数据将清空\n• 原因：${reason}\n\n` + (step.isOutsource ? '⚠️ 该工序已委外，回退后需重新创建委外任务\n' : '') + (step.isInspect ? '⚠️ 该工序为检验工序，回退后下游工序需重新执行\n' : ''))) return
                                        const newSteps = [...steps]
                                        newSteps[stepIdx] = {
                                          ...newSteps[stepIdx],
                                          status: '待开始',
                                          actualHours: 0,
                                          reportedQty: 0,
                                          outsourceArrivedQty: 0,
                                          outsourceProgress: 0,
                                          isModified: true,
                                        }
                                        setProcessesMap(prev => ({ ...prev, [detailOrder!.id]: newSteps }))
                                        alert(`工序「${step.name}」已回退至「待开始」\n\n回退原因：${reason}`)
                                      }}
                                      className="flex-1 flex items-center justify-center gap-1 h-7 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
                                      title="ADMIN权限：回退到待开始（将清空报工/到货数据）"
                                    >
                                      <RotateCcw size={11} /> ADMIN回退
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      const newSteps = [...steps]
                                      newSteps[stepIdx] = { ...newSteps[stepIdx], status: '进行中' }
                                      setProcessesMap(prev => ({ ...prev, [detailOrder!.id]: newSteps }))
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 h-7 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100"
                                  >
                                    <RotateCcw size={11} /> 重做返工
                                  </button>
                                  {!step.isInspect && (
                                    <button
                                      onClick={() => {
                                        const newSteps = [...steps]
                                        const inspectSeq = String((parseInt(step.seq) + 5)).padStart(4, '0')
                                        const inspectStep: ProcessStep = {
                                          seq: inspectSeq,
                                          name: `${step.name}-检验`,
                                          workCenter: '质检',
                                          planHours: 1,
                                          actualHours: 0,
                                          status: '待检验',
                                          isOutsource: false,
                                          isInspect: true,
                                          isFromErp: false,
                                          isModified: false,
                                        }
                                        newSteps.splice(stepIdx + 1, 0, inspectStep)
                                        setProcessesMap(prev => ({ ...prev, [detailOrder!.id]: newSteps }))
                                      }}
                                      className="flex-1 flex items-center justify-center gap-1 h-7 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100"
                                    >
                                      <AlertTriangle size={11} /> 增加检验
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {isEditingProcess && (
              <div className="space-y-3">
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-amber-700 leading-relaxed">
                    工序初始数据来源于ERP工艺路线。此处调整仅影响当前工单，不改变ERP基础数据。已完成工序无法调整。
                  </span>
                </div>

                <div className="space-y-2">
                  {editProcesses.map((p, idx) => {
                    const isFinished = p.status === '已完成'
                    return (
                    <div key={idx} className={cn('rounded-lg border p-3', isFinished ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white')}>
                      <div className="flex items-center gap-2 mb-2">
                        {isFinished ? (
                          <div className="cursor-not-allowed text-gray-300 shrink-0">
                            <GripVertical size={14} />
                          </div>
                        ) : (
                          <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
                            <GripVertical size={14} />
                          </div>
                        )}
                        <input
                          value={p.seq}
                          disabled
                          className="w-12 border border-gray-200 rounded px-2 py-1 text-xs font-mono text-center bg-gray-100 text-gray-400 cursor-not-allowed"
                        />
                        <input
                          value={p.name}
                          disabled={isFinished}
                          onChange={(e) => !isFinished && updateProcess(idx, 'name', e.target.value)}
                          placeholder="工序名称"
                          className={cn('flex-1 border rounded px-2 py-1 text-sm', isFinished ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-200 bg-gray-50 focus:outline-none focus:border-blue-400')}
                        />
                        {p.isFromErp && !p.isModified && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium shrink-0">ERP</span>
                        )}
                        {p.isFromErp && p.isModified && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium shrink-0">已调整</span>
                        )}
                        {!p.isFromErp && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium shrink-0">新增</span>
                        )}
                        {isFinished && (
                          <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-[10px] font-medium shrink-0">已锁定</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          value={p.workCenter}
                          disabled={isFinished}
                          onChange={(e) => !isFinished && updateProcess(idx, 'workCenter', e.target.value)}
                          className={cn('flex-1 border rounded px-2 py-1 text-xs', isFinished ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-200 bg-gray-50 focus:outline-none focus:border-blue-400')}
                        >
                          {['加工中心01', '加工中心02', '钳工车间', '车床车间', '磨床车间', '线切割车间', '切割车间', '抛光车间', '热处理车间'].map(w => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className={cn('flex items-center gap-1 text-xs cursor-pointer', isFinished ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600')}>
                          <input
                            type="checkbox"
                            checked={p.isInspect}
                            disabled={isFinished}
                            onChange={(e) => !isFinished && updateProcess(idx, 'isInspect', e.target.checked)}
                            className="rounded"
                          />
                          需检验
                        </label>
                        <label className={cn('flex items-center gap-1 text-xs cursor-pointer', isFinished ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600')}>
                          <input
                            type="checkbox"
                            checked={p.isOutsource}
                            disabled={isFinished}
                            onChange={(e) => !isFinished && updateProcess(idx, 'isOutsource', e.target.checked)}
                            className="rounded"
                          />
                          委外
                        </label>
                        <div className="flex-1" />
                        {!isFinished && (
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => moveProcess(idx, idx - 1)}
                              disabled={idx === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveProcess(idx, idx + 1)}
                              disabled={idx === editProcesses.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removeProcess(idx)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                        {isFinished && (
                          <span className="text-xs text-gray-400">已完成，无法调整</span>
                        )}
                      </div>
                    </div>
                  )})}
                </div>

                <button
                  onClick={addProcess}
                  className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:text-[#1e5fa8] hover:border-[#1e5fa8] transition-colors"
                >
                  <Plus size={14} /> 添加工序
                </button>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>
                    共 {editProcesses.length} 道工序，其中已完成 {editProcesses.filter(p => p.status === '已完成').length} 道（已锁定）
                  </span>
                </div>
              </div>
            )}

            {/* 编辑模式底部按钮 */}
            {isEditingProcess ? (
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <div className="flex-1" />
                <button
                  onClick={cancelEditProcess}
                  className="flex items-center justify-center gap-1 h-8 px-4 text-sm border border-gray-200 text-gray-600 rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={saveEditProcess}
                  className="flex items-center justify-center gap-1 h-8 px-4 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]"
                >
                  <CheckCircle size={13} /> 保存
                </button>
              </div>
            ) : null}
          </div>
            )}

            {/* 委外 Tab */}
            {detailTab === 'outsource' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <Truck size={13} className="text-orange-500" /> 关联委外单
                  </p>
                  <span className="text-[11px] text-gray-400">共 {relatedOutsourceOrders.length} 张</span>
                </div>

                {relatedOutsourceOrders.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <Truck size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">暂无委外单</p>
                    <p className="text-[10px] text-gray-400 mt-1">工序发起委外后将自动关联</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relatedOutsourceOrders.map(o => (
                      <div key={o.id} className="bg-orange-50 border border-orange-100 rounded-lg p-3 hover:border-orange-200 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-orange-700 font-mono">{o.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            o.status === '全部到货' ? 'bg-emerald-100 text-emerald-700' :
                            o.status === '部分到货' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{o.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-gray-400">工序</span>
                            <span className="text-gray-600">{o.processName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">供应商</span>
                            <span className="text-gray-600">{o.vendor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">委外数量</span>
                            <span className="text-gray-700 font-medium">{o.outsourceQty.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">已到货</span>
                            <span className="text-emerald-600 font-medium">{o.arrivedQty.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-orange-100 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">创建: {o.createTime}</span>
                          <button className="text-[11px] text-orange-600 hover:text-orange-700 flex items-center gap-0.5">
                            <ExternalLink size={10} /> 查看详情
                          </button>
                        </div>
                        {/* 进度条 */}
                        <div className="mt-2">
                          <div className="w-full bg-orange-100 rounded-full h-1.5">
                            <div
                              className="bg-orange-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, (o.arrivedQty / o.outsourceQty) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 入库 Tab */}
            {detailTab === 'inbound' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <Warehouse size={13} className="text-emerald-500" /> 入库批次记录
                  </p>
                  <span className="text-[11px] text-gray-400">
                    共 {relatedInboundBatches.length} 批 / {relatedInboundBatches.reduce((s, b) => s + b.batchQty, 0).toLocaleString()} 件
                  </span>
                </div>

                {relatedInboundBatches.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <Warehouse size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">暂无入库批次</p>
                    <p className="text-[10px] text-gray-400 mt-1">检验合格入库后将自动生成</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relatedInboundBatches.map(b => (
                      <div key={b.id} className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 hover:border-emerald-200 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-semibold text-emerald-700 font-mono">{b.batchNo}</span>
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              b.batchType === '自制完工批次' ? 'bg-blue-100 text-blue-700' :
                              b.batchType === '委外回流批次' ? 'bg-orange-100 text-orange-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>{b.batchType}</span>
                          </div>
                          <span className="text-emerald-600 font-bold text-sm">+{b.batchQty.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-gray-400">入库仓库</span>
                            <span className="text-gray-600">{b.warehouse}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">库位</span>
                            <span className="text-gray-600">{b.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">检验单号</span>
                            <span className="text-blue-600 font-mono">{b.inspectNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">检验员</span>
                            <span className="text-gray-600">{b.inspector}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">入库: {b.inboundTime}</span>
                          <button className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                            <ExternalLink size={10} /> 入库单详情
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部操作栏 - 仅在非编辑模式显示 */}
          {!isEditingProcess && (
            <div className="p-3 border-t border-gray-100 flex gap-2">
              {detailOrder.status === '待开始' && (
                <button
                  onClick={() => {
                    if (processesMap[detailOrder.id] && processesMap[detailOrder.id].length > 0) {
                      if (!confirm('工单已有工序，是否重新生成任务？')) return
                    }
                    // 模拟当前用户为"钳工A"
                    const currentUser = '钳工A'
                    const erpProcesses = MOCK_PROCESSES[detailOrder.id] || []
                    const firstProc: ProcessStep = {
                      seq: '0000',
                      name: '领料',
                      workCenter: '仓库',
                      planHours: 0.5,
                      actualHours: 0,
                      status: '进行中',  // 第一个任务自动开始
                      isOutsource: false,
                      isInspect: false,
                      isFromErp: false,
                      isModified: false,
                    }
                    const lastProc: ProcessStep = {
                      seq: '9999',
                      name: '最终检验',
                      workCenter: '质检',
                      planHours: 1,
                      actualHours: 0,
                      status: '待开始',
                      isOutsource: false,
                      isInspect: true,
                      isFromErp: false,
                      isModified: false,
                    }
                    const erpProcs: ProcessStep[] = erpProcesses.map(p => ({
                      ...p,
                      status: '待开始',
                      actualHours: 0,
                      isFromErp: true,
                      isModified: false,
                    }))
                    const allProcesses = [firstProc, ...erpProcs, lastProc]
                    setProcessesMap(prev => ({ ...prev, [detailOrder.id]: allProcesses }))
                    setOrders(prev => prev.map(o => o.id === detailOrder.id ? { ...o, status: '进行中', assignedTo: currentUser, isIssued: true } : o))
                    setDetailOrder(prev => prev ? { ...prev, status: '进行中', assignedTo: currentUser, isIssued: true } : null)
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">
                  <Play size={13} /> 下达工单
                </button>
              )}
              {detailOrder.status === '进行中' && (
                <button className="flex-1 flex items-center justify-center gap-1.5 h-8 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  <Pause size={13} /> 暂停
                </button>
              )}
              {detailOrder.status === '已暂停' && (
                <button className="flex-1 flex items-center justify-center gap-1.5 h-8 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                  <Play size={13} /> 恢复
                </button>
              )}
              {detailOrder.status !== '已完工' && (
                <button className="flex-1 flex items-center justify-center gap-1.5 h-8 text-sm border border-gray-200 text-gray-600 rounded hover:bg-gray-50">
                  <XCircle size={13} /> 关闭工单
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* New WO Modal - 保留但禁用，需求明确：工单统一由 ERP 同步，不允许手动新增 */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[560px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">新建生产工单</h3>
              <button onClick={() => setShowNewModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <span>根据新业务规则：生产工单统一由 ERP 编制并同步至工装系统，本系统不再支持手动新增工单。工艺路径及工序检验/委外标记均由 ERP 下发。</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowNewModal(false)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  )
}
