'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Shield, Search, Clock, AlertTriangle, Package, CheckCircle2,
  X, FileText, Factory, ArrowRight, ChevronDown,
  Settings, Plus, Image, User, Camera,
} from 'lucide-react'

/* ============ 类型定义 ============ */
interface PendingMaintenanceMold {
  id: string
  maintenanceNo: string
  moldCode: string
  moldName: string
  itemNo: string
  spec: string
  maintenanceReason: string
  maintenanceDetail: string
  currentLocation: string
  targetLocation: string
  processingCount: number
  applicant: string
  applyTime: string
  urgency: '普通' | '加急' | '特急'
  status: '待转移' | '已转移待保养' | '已建单'
  transferTime?: string
  maintenanceWoNo?: string
  photos: string[]
  description: string
}

interface MaintenanceItem {
  id: string
  name: string
  level: string
  moldType: string
  content: string
  tools: string
  stdTime: number
  checkStandard: string
}

/* ============ 模拟数据 ============ */
const INITIAL_DATA: PendingMaintenanceMold[] = [
  {
    id: '1',
    maintenanceNo: 'BY-20260629-001',
    moldCode: '7664SO',
    moldName: '7664SO成形凸模',
    itemNo: '60024901201010',
    spec: 'A2737664',
    maintenanceReason: '定期保养 / 二级保养',
    maintenanceDetail: '累计加工5万次，按计划进行二级保养',
    currentLocation: '现场仓 / 冲压一车间',
    targetLocation: '工装车间待保养仓',
    processingCount: 52360,
    applicant: '张班长',
    applyTime: '2026-06-29 08:30',
    urgency: '普通',
    status: '待转移',
    photos: ['photo1.jpg'],
    description: '按保养计划进行二级保养，包括清洁、润滑、易损件检查更换等。',
  },
  {
    id: '2',
    maintenanceNo: 'BY-20260629-002',
    moldCode: '7659SO',
    moldName: '7659SO成形凹模',
    itemNo: '60024901201015',
    spec: 'A2737659',
    maintenanceReason: '定期保养 / 二级保养',
    maintenanceDetail: '累计加工4万次，按计划进行二级保养',
    currentLocation: '现场仓 / 冲压二车间',
    targetLocation: '工装车间待保养仓',
    processingCount: 38920,
    applicant: '李班长',
    applyTime: '2026-06-29 09:15',
    urgency: '加急',
    status: '待转移',
    photos: ['photo1.jpg', 'photo2.jpg'],
    description: '生产计划紧张，希望尽快完成保养回线。',
  },
  {
    id: '3',
    maintenanceNo: 'BY-20260628-005',
    moldCode: '7658SO',
    moldName: '7658SO成形凸模',
    itemNo: '60024901201016',
    spec: 'A2737658',
    maintenanceReason: '定期保养 / 二级保养',
    maintenanceDetail: '累计加工4.5万次，按计划进行二级保养',
    currentLocation: '现场仓 / 冲压一车间',
    targetLocation: '工装车间待保养仓',
    processingCount: 45680,
    applicant: '王班长',
    applyTime: '2026-06-28 16:45',
    urgency: '普通',
    status: '已转移待保养',
    transferTime: '2026-06-28 17:30',
    photos: [],
    description: '按保养计划执行二级保养。',
  },
  {
    id: '4',
    maintenanceNo: 'BY-20260628-003',
    moldCode: '7667SO',
    moldName: '7667SO成形凹模',
    itemNo: '60024901201007',
    spec: 'A2737667',
    maintenanceReason: '定期保养 / 二级保养',
    maintenanceDetail: '累计加工6万次，按计划进行二级保养',
    currentLocation: '现场仓 / 冲压一车间',
    targetLocation: '工装车间待保养仓',
    processingCount: 61250,
    applicant: '赵班长',
    applyTime: '2026-06-28 11:20',
    urgency: '普通',
    status: '已转移待保养',
    transferTime: '2026-06-28 14:00',
    maintenanceWoNo: 'BY-WO-20260628-003',
    photos: ['photo1.jpg'],
    description: '按保养计划执行二级保养。',
  },
]

const MAINTENANCE_ITEMS: MaintenanceItem[] = [
  {
    id: 'T003', name: '弹簧压力检测', level: '二级保养', moldType: '通用',
    content: '使用弹簧测力计测量弹簧压力值并与标准值比对',
    tools: '弹簧测力计', stdTime: 30,
    checkStandard: '压力值在 80N - 120N 范围内为合格',
  },
  {
    id: 'T005', name: '合模精度检测', level: '二级保养', moldType: '指定模具',
    content: '用百分表测量模具对角线偏差',
    tools: '百分表、磁性座', stdTime: 40,
    checkStandard: '对角线偏差 ≤ 0.05mm',
  },
  {
    id: 'T007', name: '导套更换检查', level: '二级保养', moldType: '通用',
    content: '检查导套磨损情况，必要时更换导套',
    tools: '游标卡尺、铜棒、导套备件', stdTime: 60,
    checkStandard: '导套无明显磨损，配合间隙 ≤ 0.02mm',
  },
  {
    id: 'T008', name: '型腔抛光处理', level: '二级保养', moldType: '指定模具',
    content: '对型腔表面进行抛光处理，去除轻微划痕和粘料',
    tools: '砂纸、抛光膏、超声波清洗机', stdTime: 90,
    checkStandard: '型腔表面光洁度达到 Ra0.8 以上',
  },
  {
    id: 'T009', name: '冷却系统除垢', level: '二级保养', moldType: '通用',
    content: '对冷却水路进行酸洗除垢，确保冷却水流通畅',
    tools: '除垢剂、循环泵、清水', stdTime: 120,
    checkStandard: '冷却水流量恢复至标准值的90%以上',
  },
  {
    id: 'T010', name: '顶针板导柱润滑', level: '二级保养', moldType: '通用',
    content: '拆卸顶针板，清洁并润滑导柱导套',
    tools: '扳手、无纺布、高温润滑脂', stdTime: 45,
    checkStandard: '顶针板动作顺畅无卡滞，润滑均匀',
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
    '已转移待保养': 'bg-blue-100 text-blue-700',
    '已建单': 'bg-green-100 text-green-700',
  }
  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${styles[status] || styles['待转移']}`}>{status}</span>
}

/* ============ 页面主体 ============ */
export default function MaintenanceReceivePage() {
  const [data, setData] = useState<PendingMaintenanceMold[]>(INITIAL_DATA)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detail, setDetail] = useState<PendingMaintenanceMold | null>(null)
  const [createWoModal, setCreateWoModal] = useState<PendingMaintenanceMold | null>(null)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [inboundWarehouse, setInboundWarehouse] = useState('CP-C01')
  const [currentUser] = useState('钳工A')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = data.filter(item => {
    const matchSearch = !search || item.moldName.includes(search) || item.moldCode.includes(search) || item.maintenanceNo.includes(search)
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

  const handleTransfer = (item: PendingMaintenanceMold) => {
    if (!confirm(`确认接收并转移模具「${item.moldName}」至工装车间待保养仓？\n\n库位变更：${item.currentLocation} → ${item.targetLocation}`)) return
    setData(prev => prev.map(d =>
      d.id === item.id ? {
        ...d,
        status: '已转移待保养',
        transferTime: new Date().toLocaleString('zh-CN'),
      } : d
    ))
    setDetail(null)
    alert('转移成功！库位已更新为「工装车间待保养仓」')
  }

  const handleBatchTransfer = () => {
    const pending = data.filter(d => d.status === '待转移' && selectedIds.includes(d.id))
    if (pending.length === 0) return alert('请先勾选要转移的模具')
    if (!confirm(`确认批量接收并转移 ${pending.length} 套模具至工装车间待保养仓？`)) return
    const now = new Date().toLocaleString('zh-CN')
    const transferIds = pending.map(d => d.id)
    setData(prev => prev.map(d =>
      transferIds.includes(d.id)
        ? { ...d, status: '已转移待保养', transferTime: now }
        : d
    ))
    setSelectedIds(prev => prev.filter(id => !transferIds.includes(id)))
    alert(`批量转移成功！共 ${pending.length} 套模具`)
  }

  const openCreateWo = (item: PendingMaintenanceMold) => {
    setSelectedItemIds(MAINTENANCE_ITEMS.filter(i => i.moldType === '通用').map(i => i.id))
    setInboundWarehouse('CP-C01')
    setCreateWoModal(item)
  }

  const toggleItemSelect = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectedItems = MAINTENANCE_ITEMS.filter(i => selectedItemIds.includes(i.id))
  const totalStdTime = selectedItems.reduce((sum, item) => sum + item.stdTime, 0)

  const handleCreateWo = () => {
    if (!createWoModal) return
    if (selectedItemIds.length === 0) { alert('请至少选择一项保养标准'); return }
    const woNo = `BY-WO-${Date.now().toString().slice(-8)}`
    const whName = INBOUND_WAREHOUSES.find(w => w.code === inboundWarehouse)?.name || ''
    setData(prev => prev.map(d =>
      d.id === createWoModal.id ? { ...d, status: '已建单' as const, maintenanceWoNo: woNo } : d
    ))
    alert(`二级保养单创建成功！\n\n工单号：${woNo}\n保养项数：${selectedItemIds.length}项\n预计工时：${totalStdTime}分钟\n完工入库仓：${whName}\n\n已推送至「我的保养任务」`)
    setCreateWoModal(null)
    setDetail(null)
  }

  const stats = {
    total: data.length,
    pending: data.filter(d => d.status === '待转移').length,
    transferred: data.filter(d => d.status === '已转移待保养').length,
    completed: data.filter(d => d.status === '已建单').length,
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-[#f5f6f8]">
        {/* ===== Header ===== */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-500 rounded-lg flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">待保养模具接收列表</h1>
                <p className="text-xs text-gray-500 mt-0.5">钳工专用 · 一键转移库位 · 创建保养工单</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchTransfer}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors"
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
            <div className="text-xs text-gray-500 mt-1">全部待保养</div>
          </div>
          <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-1">待转移</div>
          </div>
          <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.transferred}</div>
            <div className="text-xs text-gray-500 mt-1">已转移待保养</div>
          </div>
          <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500 mt-1">已建单</div>
          </div>
        </div>

        {/* ===== Filters ===== */}
        <div className="px-6 pb-3 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索模具编号/名称/保养单号"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 bg-white"
          >
            <option value="">全部状态</option>
            <option value="待转移">待转移</option>
            <option value="已转移待保养">已转移待保养</option>
            <option value="已建单">已建单</option>
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
                        className="w-3.5 h-3.5 cursor-pointer accent-purple-500"
                      />
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">保养单号</th>
                    <th className="px-3 py-2.5 text-left font-medium">模具信息</th>
                    <th className="px-3 py-2.5 text-left font-medium">保养原因</th>
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
                          className="w-3.5 h-3.5 cursor-pointer accent-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>
                      <td className="px-3 py-3 text-[12px] font-medium text-purple-700">{item.maintenanceNo}</td>
                      <td className="px-3 py-3">
                        <div className="text-[13px] text-gray-800 font-medium">{item.moldName}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{item.moldCode} · {item.spec}</div>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-gray-600 max-w-[160px]">
                        <div className="truncate">{item.maintenanceReason}</div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{item.maintenanceDetail}</div>
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
                              className="px-3 py-1 text-[11px] bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1"
                            >
                              <ArrowRight size={11} /> 一键转移
                            </button>
                          )}
                          {item.status === '已转移待保养' && (
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
              <h3 className="font-semibold text-gray-800">保养申请详情</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-700">{detail.maintenanceNo}</span>
                  <StatusBadge status={detail.status} />
                </div>
                <div className="text-xs text-purple-600 mt-1">申请时间：{detail.applyTime}</div>
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
                <div className="text-xs text-gray-500 mb-1.5">保养信息</div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">保养原因</span>
                    <span className="text-xs text-gray-800">{detail.maintenanceReason}</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">保养说明</div>
                    <div className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">{detail.description}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">紧急程度</span>
                    <UrgencyBadge level={detail.urgency} />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1.5">相关照片</div>
                <div className="bg-gray-50 rounded-lg p-3">
                  {detail.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {detail.photos.map((_, i) => (
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
                  <div className="flex justify-between"><span className="text-xs text-gray-500">目标库位</span><span className="text-xs text-purple-600">{detail.targetLocation}</span></div>
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
                  className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 flex items-center justify-center gap-1.5"
                >
                  <ArrowRight size={15} /> 接收并一键转移至工装车间待保养仓
                </button>
              )}
              {detail.status === '已转移待保养' && (
                <button
                  onClick={() => openCreateWo(detail)}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center justify-center gap-1.5"
                >
                  <FileText size={15} /> 创建保养工单
                </button>
              )}
              {detail.status === '已建单' && detail.maintenanceWoNo && (
                <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium text-center border border-green-200">
                  已创建工单：{detail.maintenanceWoNo}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== Create WO Modal ===== */}
        {createWoModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[85vh] flex flex-col">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">创建保养工单</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{createWoModal.maintenanceNo} · {createWoModal.moldName}</p>
                </div>
                <button onClick={() => setCreateWoModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs text-purple-700 font-medium">工单基本信息（自动继承）</div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div><span className="text-purple-500">模具：</span><span className="text-purple-800">{createWoModal.moldName}</span></div>
                    <div><span className="text-purple-500">模具编号</span><span className="text-purple-800">：{createWoModal.moldCode}</span></div>
                    <div><span className="text-purple-500">保养原因</span><span className="text-purple-800">：{createWoModal.maintenanceReason}</span></div>
                    <div><span className="text-purple-500">加工次数</span><span className="text-purple-800">：{createWoModal.processingCount.toLocaleString()}</span></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs text-gray-600"><span className="text-red-500">*</span> 挑选保养标准（二级保养）</label>
                    <span className="text-[11px] text-gray-400">已选 {selectedItemIds.length} 项 · 预计 {totalStdTime} 分钟</span>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-[280px] overflow-y-auto">
                      {MAINTENANCE_ITEMS.map(item => (
                        <div
                          key={item.id}
                          onClick={() => toggleItemSelect(item.id)}
                          className={`flex items-start gap-3 px-3 py-2.5 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                            selectedItemIds.includes(item.id) ? 'bg-purple-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(item.id)}
                            onChange={() => toggleItemSelect(item.id)}
                            className="mt-0.5 w-3.5 h-3.5 cursor-pointer accent-purple-500 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-medium text-gray-800">{item.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{item.moldType}</span>
                              <span className="text-[10px] text-gray-400 ml-auto">{item.stdTime}分钟</span>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5 truncate">{item.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5"><span className="text-red-500">*</span> 保养完工入库仓</label>
                  <select
                    value={inboundWarehouse}
                    onChange={e => setInboundWarehouse(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
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
                  className="px-4 h-8 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1"
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
