'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Wrench, Search, Clock, AlertTriangle, Package, CheckCircle2,
  X, FileText, Factory, ArrowRight, ChevronDown,
  Settings, Plus, Image, User, Camera,
} from 'lucide-react'

/* ============ 类型定义 ============ */
interface PendingRepairMold {
  id: string
  repairNo: string
  moldCode: string
  moldName: string
  itemNo: string
  spec: string
  defectReason: string
  defectDetail: string
  currentLocation: string
  targetLocation: string
  processingCount: number
  applicant: string
  applyTime: string
  urgency: '普通' | '加急' | '特急'
  status: '待转移' | '已转移待建单' | '已建单' | '已转二级保养'
  transferTime?: string
  repairWoNo?: string
  maintenanceNo?: string
  maintenanceTime?: string
  faultPhotos: string[]
  description: string
}

interface RepairRoute {
  id: string
  code: string
  name: string
  processes: { code: string; name: string; hours: number }[]
}

/* ============ 模拟数据 ============ */
const INITIAL_DATA: PendingRepairMold[] = [
  {
    id: '1',
    repairNo: 'WX-20260629-001',
    moldCode: '7664SO',
    moldName: '7664SO成形凸模',
    itemNo: '60024901201010',
    spec: 'A2737664',
    defectReason: '模具磨损 / 型腔磨损',
    defectDetail: '型腔磨损严重，产品尺寸超差0.05mm',
    currentLocation: '现场仓 / 冲压一车间',
    targetLocation: '工装车间待修仓',
    processingCount: 52360,
    applicant: '张班长',
    applyTime: '2026-06-29 08:30',
    urgency: '加急',
    status: '待转移',
    faultPhotos: ['photo1.jpg'],
    description: '生产过程中发现产品关键尺寸超差，检查后发现型腔明显磨损痕迹，需立即维修。',
  },
  {
    id: '2',
    repairNo: 'WX-20260629-002',
    moldCode: '7659SO',
    moldName: '7659SO成形凹模',
    itemNo: '60024901201015',
    spec: 'A2737659',
    defectReason: '崩裂破损 / 断裂',
    defectDetail: '顶针断裂，产品顶出异常',
    currentLocation: '现场仓 / 冲压二车间',
    targetLocation: '工装车间待修仓',
    processingCount: 38920,
    applicant: '李班长',
    applyTime: '2026-06-29 09:15',
    urgency: '特急',
    status: '待转移',
    faultPhotos: ['photo1.jpg', 'photo2.jpg'],
    description: '顶针突然断裂，生产线已停线，需紧急处理。',
  },
  {
    id: '3',
    repairNo: 'WX-20260628-005',
    moldCode: '7658SO',
    moldName: '7658SO成形凸模',
    itemNo: '60024901201016',
    spec: 'A2737658',
    defectReason: '装配异常 / 卡滞动作不顺',
    defectDetail: '滑块卡顿，开合模不顺畅',
    currentLocation: '现场仓 / 冲压一车间',
    targetLocation: '工装车间待修仓',
    processingCount: 45680,
    applicant: '王班长',
    applyTime: '2026-06-28 16:45',
    urgency: '普通',
    status: '已转移待建单',
    transferTime: '2026-06-28 17:30',
    faultPhotos: [],
    description: '滑块有卡顿现象，需要拆检。',
  },
  {
    id: '4',
    repairNo: 'WX-20260628-003',
    moldCode: '7667SO',
    moldName: '7667SO成形凹模',
    itemNo: '60024901201007',
    spec: 'A2737667',
    defectReason: '模具磨损 / 分型面磨损',
    defectDetail: '分型面磨损，飞边过大',
    currentLocation: '现场仓 / 冲压一车间',
    targetLocation: '工装车间待修仓',
    processingCount: 61250,
    applicant: '赵班长',
    applyTime: '2026-06-28 11:20',
    urgency: '加急',
    status: '已转移待建单',
    transferTime: '2026-06-28 14:00',
    repairWoNo: 'WX-WO-20260628-003',
    faultPhotos: ['photo1.jpg'],
    description: '分型面磨损导致飞边过大，需要研配。',
  },
]

const REPAIR_ROUTES: RepairRoute[] = [
  {
    id: 'R001',
    code: 'WX-GY-001',
    name: '常规维修工艺',
    processes: [
      { code: '0010', name: '拆模', hours: 2 },
      { code: '0020', name: '清洗检查', hours: 1 },
      { code: '0030', name: '焊补/镶件', hours: 4 },
      { code: '0040', name: '磨削加工', hours: 3 },
      { code: '0050', name: '钳工研配', hours: 4 },
      { code: '0060', name: '试模验证', hours: 2 },
      { code: '9999', name: '最终检验', hours: 1 },
    ],
  },
  {
    id: 'R002',
    code: 'WX-GY-002',
    name: '简单维修工艺',
    processes: [
      { code: '0010', name: '拆模', hours: 1 },
      { code: '0020', name: '钳工修理', hours: 3 },
      { code: '0030', name: '试模验证', hours: 1 },
      { code: '9999', name: '最终检验', hours: 0.5 },
    ],
  },
  {
    id: 'R003',
    code: 'WX-GY-003',
    name: '磨削维修工艺',
    processes: [
      { code: '0010', name: '拆模', hours: 1 },
      { code: '0020', name: '平面磨', hours: 2 },
      { code: '0030', name: '装配调试', hours: 2 },
      { code: '9999', name: '最终检验', hours: 0.5 },
    ],
  },
]

const INBOUND_WAREHOUSES = [
  { code: 'BJ-C01', name: '模具备件仓' },
  { code: 'CP-C01', name: '模具成品仓' },
]

/* ============ 辅助组件 ============ */
function UrgencyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    '特急': 'bg-red-100 text-red-700',
    '加急': 'bg-orange-100 text-orange-700',
    '普通': 'bg-gray-100 text-gray-600',
  }
  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${styles[level] || styles['普通']}`}>{level}</span>
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    '待转移': 'bg-yellow-100 text-yellow-700',
    '已转移待建单': 'bg-blue-100 text-blue-700',
    '已建单': 'bg-green-100 text-green-700',
    '已转二级保养': 'bg-purple-100 text-purple-700',
  }
  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${styles[status] || styles['待转移']}`}>{status}</span>
}

/* ============ 页面主体 ============ */
export default function RepairReceivePage() {
  const [data, setData] = useState<PendingRepairMold[]>(INITIAL_DATA)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detail, setDetail] = useState<PendingRepairMold | null>(null)
  const [createWoModal, setCreateWoModal] = useState<PendingRepairMold | null>(null)
  const [selectedRoute, setSelectedRoute] = useState('')
  const [inboundWarehouse, setInboundWarehouse] = useState('CP-C01')
  const [currentUser] = useState('钳工A')
  const [showTypeSelect, setShowTypeSelect] = useState(false)
  const [typeSelectItem, setTypeSelectItem] = useState<PendingRepairMold | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 二级保养工艺
  const MAINTENANCE_ROUTES = [
    {
      id: 'M001',
      code: 'BY-GY-001',
      name: '二级保养工艺',
      processes: [
        { code: '0010', name: '模具拆卸', hours: 1 },
        { code: '0020', name: '清洗检查', hours: 1 },
        { code: '0030', name: '润滑保养', hours: 0.5 },
        { code: '0040', name: '易损件更换', hours: 1 },
        { code: '0050', name: '装配调试', hours: 1 },
        { code: '9999', name: '最终检验', hours: 0.5 },
      ],
    },
  ]

  const filtered = data.filter(item => {
    const matchSearch = !search || item.moldName.includes(search) || item.moldCode.includes(search) || item.repairNo.includes(search)
    const matchStatus = !statusFilter || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const pendingFiltered = filtered.filter(d => d.status === '待转移')
  const allPendingSelected = pendingFiltered.length > 0 && pendingFiltered.every(d => selectedIds.includes(d.id))
  const somePendingSelected = pendingFiltered.some(d => selectedIds.includes(d.id))

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(prev => prev.filter(id => !pendingFiltered.some(d => d.id === id)))
    } else {
      const newIds = [...new Set([...selectedIds, ...pendingFiltered.map(d => d.id)])]
      setSelectedIds(newIds)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleTransfer = (item: PendingRepairMold) => {
    if (!confirm(`确认接收并转移模具「${item.moldName}」至工装车间待修仓？\n\n库位变更：${item.currentLocation} → ${item.targetLocation}`)) return
    setData(prev => prev.map(d =>
      d.id === item.id ? {
        ...d,
        status: '已转移待建单',
        transferTime: new Date().toLocaleString('zh-CN'),
      } : d
    ))
    setDetail(null)
    alert('转移成功！库位已更新为「工装车间待修仓」')
  }

  const handleBatchTransfer = () => {
    const pending = data.filter(d => d.status === '待转移' && selectedIds.includes(d.id))
    if (pending.length === 0) return alert('请先勾选要转移的模具')
    if (!confirm(`确认批量接收并转移 ${pending.length} 套模具至工装车间待修仓？`)) return
    const now = new Date().toLocaleString('zh-CN')
    const transferIds = pending.map(d => d.id)
    setData(prev => prev.map(d =>
      transferIds.includes(d.id)
        ? { ...d, status: '已转移待建单', transferTime: now }
        : d
    ))
    setSelectedIds(prev => prev.filter(id => !transferIds.includes(id)))
    alert(`批量转移成功！共 ${pending.length} 套模具`)
  }

  const openCreateWo = (item: PendingRepairMold) => {
    setTypeSelectItem(item)
    setShowTypeSelect(true)
  }

  const selectRepairType = () => {
    if (!typeSelectItem) return
    setSelectedRoute(REPAIR_ROUTES[0].id)
    setInboundWarehouse('CP-C01')
    setCreateWoModal(typeSelectItem)
    setShowTypeSelect(false)
  }

  const selectMaintenanceType = () => {
    if (!typeSelectItem) return
    if (!confirm(`确认将模具「${typeSelectItem.moldName}」转为二级保养？\n\n经检查确认该模具无需维修，仅需做二级保养即可。`)) return
    const maintenanceNo = `BY-${Date.now().toString().slice(-8)}`
    const now = new Date().toLocaleString('zh-CN')
    setData(prev => prev.map(d =>
      d.id === typeSelectItem.id
        ? { ...d, status: '已转二级保养' as const, maintenanceNo, maintenanceTime: now }
        : d
    ))
    alert(`已转为二级保养！\n\n保养单号：${maintenanceNo}\n工艺：二级保养工艺\n\n将推送至保养任务列表执行`)
    setShowTypeSelect(false)
    setDetail(null)
  }

  const handleCreateWo = () => {
    if (!createWoModal) return
    if (!selectedRoute) { alert('请选择维修工艺路径'); return }
    const route = REPAIR_ROUTES.find(r => r.id === selectedRoute)!
    const woNo = `WX-WO-${Date.now().toString().slice(-8)}`
    const whName = INBOUND_WAREHOUSES.find(w => w.code === inboundWarehouse)?.name || ''
    setData(prev => prev.map(d =>
      d.id === createWoModal.id ? { ...d, status: '已建单' as const, repairWoNo: woNo } : d
    ))
    alert(`维修工单创建成功！\n\n工单号：${woNo}\n工艺路径：${route.name}\n工序数：${route.processes.length}道\n完工入库仓：${whName}\n\n已推送至「我的维修任务」`)
    setCreateWoModal(null)
    setDetail(null)
  }

  const stats = {
    total: data.length,
    pending: data.filter(d => d.status === '待转移').length,
    transferred: data.filter(d => d.status === '已转移待建单').length,
    maintenance: data.filter(d => d.status === '已转二级保养').length,
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-[#f5f6f8]">
        {/* ===== Header ===== */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
                <Wrench size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">待修模具接收列表</h1>
                <p className="text-xs text-gray-500 mt-0.5">钳工专用 · 一键转移库位 · 创建维修工单</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchTransfer}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition-colors"
              >
                <ArrowRight size={15} /> 批量一键转移
              </button>
            </div>
          </div>
        </div>

        {/* ===== Stats ===== */}
        <div className="px-6 py-3 flex gap-4">
          <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">全部待修</div>
          </div>
          <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-1">待转移</div>
          </div>
          <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.transferred}</div>
            <div className="text-xs text-gray-500 mt-1">已转移待建单</div>
          </div>
          <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats.maintenance}</div>
            <div className="text-xs text-gray-500 mt-1">已转二级保养</div>
          </div>
        </div>

        {/* ===== Filters ===== */}
        <div className="px-6 pb-3 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索模具编号/名称/维修单号"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-400 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-400 bg-white"
          >
            <option value="">全部状态</option>
            <option value="待转移">待转移</option>
            <option value="已转移待建单">已转移待建单</option>
            <option value="已转二级保养">已转二级保养</option>
          </select>
        </div>

        {/* ===== Table ===== */}
        <div className="flex-1 px-6 pb-4 overflow-hidden">
          <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col overflow-hidden">
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr className="text-gray-500 text-xs">
                    <th className="px-3 py-2.5 text-left font-medium w-10">
                      <input
                        type="checkbox"
                        checked={allPendingSelected}
                        ref={el => { if (el) el.indeterminate = somePendingSelected && !allPendingSelected }}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 cursor-pointer accent-orange-500"
                      />
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">维修单号</th>
                    <th className="px-3 py-2.5 text-left font-medium">模具信息</th>
                    <th className="px-3 py-2.5 text-left font-medium">不良原因</th>
                    <th className="px-3 py-2.5 text-left font-medium">当前库位</th>
                    <th className="px-3 py-2.5 text-left font-medium">加工次数</th>
                    <th className="px-3 py-2.5 text-left font-medium">申请人</th>
                    <th className="px-3 py-2.5 text-left font-medium">申请时间</th>
                    <th className="px-3 py-2.5 text-left font-medium">紧急度</th>
                    <th className="px-3 py-2.5 text-left font-medium">状态</th>
                    <th className="px-3 py-2.5 text-left font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} className="px-4 py-16 text-center text-gray-400 text-sm">暂无数据</td></tr>
                  ) : filtered.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => setDetail(item)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          disabled={item.status !== '待转移'}
                          onChange={e => { e.stopPropagation(); toggleSelect(item.id) }}
                          onClick={e => e.stopPropagation()}
                          className="w-3.5 h-3.5 cursor-pointer accent-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>
                      <td className="px-3 py-3 text-[12px] font-medium text-[#1e5fa8]">{item.repairNo}</td>
                      <td className="px-3 py-3">
                        <div className="text-[13px] text-gray-800 font-medium">{item.moldName}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{item.moldCode} · {item.spec}</div>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-gray-600 max-w-[160px]">
                        <div className="truncate">{item.defectReason}</div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{item.defectDetail}</div>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-gray-600">{item.currentLocation}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-600">{item.processingCount.toLocaleString()}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-600">{item.applicant}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-500">{item.applyTime}</td>
                      <td className="px-3 py-3"><UrgencyBadge level={item.urgency} /></td>
                      <td className="px-3 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          {item.status === '待转移' && (
                            <button
                              onClick={e => { e.stopPropagation(); handleTransfer(item) }}
                              className="px-3 py-1 text-[11px] bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-1"
                            >
                              <ArrowRight size={11} /> 一键转移
                            </button>
                          )}
                          {item.status === '已转移待建单' && (
                            <button
                              onClick={e => { e.stopPropagation(); openCreateWo(item) }}
                              className="px-3 py-1 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                            >
                              <FileText size={11} /> 创建工单
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===== Detail Panel ===== */}
        {detail && (
          <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-xl border-l border-gray-200 z-40 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">维修申请详情</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-700">{detail.repairNo}</span>
                  <StatusBadge status={detail.status} />
                </div>
                <div className="text-xs text-orange-600 mt-1">申请时间：{detail.applyTime}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1.5">模具信息</div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-gray-500">模具编号</span><span className="text-xs text-gray-800 font-medium">{detail.moldCode}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">模具名称</span><span className="text-xs text-gray-800">{detail.moldName}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">规格</span><span className="text-xs text-gray-800">{detail.spec}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">累计加工次数</span><span className="text-xs text-gray-800">{detail.processingCount.toLocaleString()}</span></div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1.5">故障信息</div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">不良原因</span>
                    <span className="text-xs text-gray-800">{detail.defectReason}</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">故障描述</div>
                    <div className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">{detail.description}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">紧急程度</span>
                    <UrgencyBadge level={detail.urgency} />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1.5">故障照片</div>
                <div className="bg-gray-50 rounded-lg p-3">
                  {detail.faultPhotos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {detail.faultPhotos.map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          <Camera size={20} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 text-center py-4">无照片</div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1.5">库位信息</div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-gray-500">当前库位</span><span className="text-xs text-gray-800">{detail.currentLocation}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">目标库位</span><span className="text-xs text-blue-600">{detail.targetLocation}</span></div>
                  {detail.transferTime && (
                    <div className="flex justify-between"><span className="text-xs text-gray-500">转移时间</span><span className="text-xs text-gray-800">{detail.transferTime}</span></div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1.5">申请人</div>
                <div className="bg-gray-50 rounded-lg p-3 flex justify-between">
                  <span className="text-xs text-gray-800">{detail.applicant}</span>
                  <span className="text-xs text-gray-500">{detail.applyTime}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 space-y-2">
              {detail.status === '待转移' && (
                <button
                  onClick={() => handleTransfer(detail)}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center justify-center gap-1.5"
                >
                  <ArrowRight size={15} /> 接收并一键转移至工装车间待修仓
                </button>
              )}
              {detail.status === '已转移待建单' && (
                <button
                  onClick={() => openCreateWo(detail)}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center justify-center gap-1.5"
                >
                  <FileText size={15} /> 创建维修工单
                </button>
              )}
              {detail.status === '已建单' && detail.repairWoNo && (
                <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium text-center border border-green-200">
                  已创建工单：{detail.repairWoNo}
                </div>
              )}
              {detail.status === '已转二级保养' && detail.maintenanceNo && (
                <div className="w-full py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium text-center border border-purple-200">
                  已转二级保养：{detail.maintenanceNo}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== Type Select Modal ===== */}
        {showTypeSelect && typeSelectItem && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[520px] flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">工单类型甄别</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{typeSelectItem.repairNo} · {typeSelectItem.moldName}</p>
                </div>
                <button onClick={() => setShowTypeSelect(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
              </div>

              <div className="p-5 space-y-3">
                <div className="text-xs text-gray-500 mb-2">
                  请根据模具实际状况判断处理方式：
                </div>

                <button
                  onClick={selectRepairType}
                  className="w-full p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                      <Wrench size={20} className="text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-800">创建维修工单</div>
                      <div className="text-[11px] text-gray-500 mt-1">模具存在故障或损坏，需要维修工序处理后才能恢复使用</div>
                      <div className="text-[11px] text-orange-600 mt-1.5">适用：磨损、崩裂、断裂、尺寸超差等</div>
                    </div>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </button>

                <button
                  onClick={selectMaintenanceType}
                  className="w-full p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                      <Settings size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-800">转为二级保养</div>
                      <div className="text-[11px] text-gray-500 mt-1">模具无需维修，仅需保养即可恢复正常使用状态</div>
                      <div className="text-[11px] text-purple-600 mt-1.5">适用：清洁、润滑、易损件更换、装配调试等</div>
                    </div>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Create WO Modal ===== */}
        {createWoModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[85vh] flex flex-col">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">创建维修工单</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{createWoModal.repairNo} · {createWoModal.moldName}</p>
                </div>
                <button onClick={() => setCreateWoModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-700 font-medium">工单基本信息（自动继承）</div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div><span className="text-blue-500">模具：</span><span className="text-blue-800">{createWoModal.moldName}</span></div>
                    <div><span className="text-blue-500">模具编号</span><span className="text-blue-800">：{createWoModal.moldCode}</span></div>
                    <div><span className="text-blue-500">不良原因</span><span className="text-blue-800">：{createWoModal.defectReason}</span></div>
                    <div><span className="text-blue-500">加工次数</span><span className="text-blue-800">：{createWoModal.processingCount.toLocaleString()}</span></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5"><span className="text-red-500">*</span> 维修工艺路径</label>
                  <select
                    value={selectedRoute}
                    onChange={e => setSelectedRoute(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="">请选择工艺路径</option>
                    {REPAIR_ROUTES.map(r => (
                      <option key={r.id} value={r.id}>{r.name}（{r.processes.length}道工序）</option>
                    ))}
                  </select>
                  {selectedRoute && (
                    <div className="mt-2 bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-2">工序预览：</div>
                      <div className="flex flex-wrap gap-1.5">
                        {REPAIR_ROUTES.find(r => r.id === selectedRoute)?.processes.map((p, i) => (
                          <span key={p.code} className="flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] text-gray-700">{p.name}</span>
                            {i < REPAIR_ROUTES.find(r => r.id === selectedRoute)!.processes.length - 1 && (
                              <span className="text-gray-300">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5"><span className="text-red-500">*</span> 维修完工入库仓</label>
                  <select
                    value={inboundWarehouse}
                    onChange={e => setInboundWarehouse(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                  >
                    {INBOUND_WAREHOUSES.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                  <div className="text-[11px] text-gray-400 mt-1">选定后全程锁定，不可修改</div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">负责人</label>
                  <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700">
                    {currentUser}（当前登录用户）
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                <button onClick={() => setCreateWoModal(null)} className="px-4 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
                <button
                  onClick={handleCreateWo}
                  className="px-4 h-8 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                >
                  <FileText size={13} /> 创建工单
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
