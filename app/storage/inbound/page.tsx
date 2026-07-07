'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { cn } from '@/lib/utils'
import {
  Search, RotateCcw, Eye, X, Package, Factory, Wrench,
  Shield, Truck, ChevronDown, CheckCircle2, MapPin, Check,
} from 'lucide-react'

type InboundType = 'manufacture' | 'repair' | 'maintenance' | 'outsourcing'
type WOType = 'single' | 'multi' | 'spare'

interface MoldNumber {
  id: string
  number: string
  isInbound: boolean
}

interface PendingInboundOrder {
  id: string
  processInboundId: string
  type: InboundType
  typeLabel: string
  moldName: string
  itemNo: string
  spec: string
  targetWarehouse: string
  sourceOrderNo: string
  processCount: number
  totalCount: number
  confirmPerson: string
  confirmTime: string
  remark?: string
  batchNo?: string
  woType: WOType
  woTypeLabel: string
  moldNumbers: MoldNumber[]
}

const WO_TYPE_COLORS: Record<WOType, string> = {
  single: 'bg-blue-100 text-blue-700',
  multi: 'bg-purple-100 text-purple-700',
  spare: 'bg-gray-100 text-gray-700',
}

const PENDING_DATA: PendingInboundOrder[] = [
  {
    id: 'DRK-20260622-0005',
    processInboundId: 'GYRK-20260622-0005',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldName: '7648SO成形凹模',
    itemNo: '60024901201021',
    spec: 'A2737645',
    targetWarehouse: '成品仓',
    sourceOrderNo: 'WO-2026-0622-012',
    processCount: 1,
    totalCount: 1,
    confirmPerson: '王主管',
    confirmTime: '2026-06-22 17:30',
    batchNo: 'MO20260622-12-01',
    woType: 'single',
    woTypeLabel: '单件模具工单',
    moldNumbers: [
      { id: 'M1', number: '198', isInbound: false },
    ],
  },
  {
    id: 'DRK-20260623-0006',
    processInboundId: 'GYRK-20260623-0006',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldName: '7650SO成形凸模',
    itemNo: '60024901201020',
    spec: 'A2737650',
    targetWarehouse: '成品仓',
    sourceOrderNo: 'WO-2026-0623-015',
    processCount: 3,
    totalCount: 5,
    confirmPerson: '李主管',
    confirmTime: '2026-06-23 17:00',
    batchNo: 'MO20260623-15-01',
    woType: 'multi',
    woTypeLabel: '多件模具工单',
    moldNumbers: [
      { id: 'M2', number: '199', isInbound: false },
      { id: 'M3', number: '200', isInbound: false },
      { id: 'M4', number: '201', isInbound: false },
      { id: 'M5', number: '202', isInbound: true },
      { id: 'M6', number: '203', isInbound: true },
    ],
  },
  {
    id: 'DRK-20260623-0007',
    processInboundId: 'GYRK-20260623-0007',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldName: '定位销组件',
    itemNo: '26088',
    spec: 'A2737688',
    targetWarehouse: '备料仓',
    sourceOrderNo: 'WO-2026-0623-018',
    processCount: 120,
    totalCount: 200,
    confirmPerson: '王主管',
    confirmTime: '2026-06-23 16:15',
    batchNo: 'MO20260623-18-01',
    woType: 'spare',
    woTypeLabel: '备料类工单',
    moldNumbers: [],
  },
  {
    id: 'DRK-20260623-0001',
    processInboundId: 'GYRK-20260623-0001',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldName: '7650SO成形凸模',
    itemNo: '60024901201020',
    spec: 'A2737650',
    targetWarehouse: '成品仓',
    sourceOrderNo: 'WO-2026-0623-008',
    processCount: 3200,
    totalCount: 85600,
    confirmPerson: '张主管',
    confirmTime: '2026-06-23 15:00',
    batchNo: 'MO20260623-08-01',
    woType: 'single',
    woTypeLabel: '单件模具工单',
    moldNumbers: [
      { id: 'M7', number: '197', isInbound: true },
    ],
  },
  {
    id: 'DRK-20260623-0002',
    processInboundId: 'GYRK-20260623-0002',
    type: 'repair',
    typeLabel: '维修入库',
    moldName: '7664SO成形凸模',
    itemNo: '60024901201010',
    spec: 'A2737662',
    targetWarehouse: '技术仓',
    sourceOrderNo: 'WX-20260621-0015',
    processCount: 0,
    totalCount: 55560,
    confirmPerson: '王主管',
    confirmTime: '2026-06-23 14:30',
    woType: 'single',
    woTypeLabel: '单件模具工单',
    moldNumbers: [
      { id: 'M8', number: '196', isInbound: false },
    ],
  },
  {
    id: 'DRK-20260623-0003',
    processInboundId: 'GYRK-20260623-0003',
    type: 'maintenance',
    typeLabel: '二级保养',
    moldName: '7659SO成形凹模',
    itemNo: '60024901201015',
    spec: 'A2737659',
    targetWarehouse: '备料仓',
    sourceOrderNo: 'BY-20260620-003',
    processCount: 1850,
    totalCount: 40770,
    confirmPerson: '李主管',
    confirmTime: '2026-06-23 12:00',
    woType: 'single',
    woTypeLabel: '单件模具工单',
    moldNumbers: [],
  },
  {
    id: 'DRK-20260623-0004',
    processInboundId: 'GYRK-20260623-0004',
    type: 'outsourcing',
    typeLabel: '委外到货',
    moldName: '7669SO成形凹模',
    itemNo: '60024901201005',
    spec: 'A2737669',
    targetWarehouse: '技术仓',
    sourceOrderNo: 'WW-2026-0615-002',
    processCount: 0,
    totalCount: 72300,
    confirmPerson: '王主管',
    confirmTime: '2026-06-23 11:30',
    remark: '委外热处理回厂',
    woType: 'spare',
    woTypeLabel: '备料类工单',
    moldNumbers: [],
  },
]

const TYPE_META: Record<InboundType, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  manufacture: { label: '制造完工', icon: <Factory size={11} />, bg: 'bg-blue-100', text: 'text-blue-700' },
  repair: { label: '维修入库', icon: <Wrench size={11} />, bg: 'bg-red-100', text: 'text-red-700' },
  maintenance: { label: '二级保养', icon: <Shield size={11} />, bg: 'bg-green-100', text: 'text-green-700' },
  outsourcing: { label: '委外到货', icon: <Truck size={11} />, bg: 'bg-orange-100', text: 'text-orange-700' },
}

const WAREHOUSE_LOCATIONS: Record<string, string[]> = {
  '备料仓': ['B-01-01', 'B-01-02', 'B-01-03', 'B-02-01', 'B-02-02', 'B-02-03'],
  '技术仓': ['C-01-01', 'C-01-02', 'C-01-03', 'C-02-01', 'C-02-02'],
  '成品仓': ['A-01-01', 'A-01-02', 'A-01-03', 'A-02-01', 'A-02-02', 'A-03-01', 'A-03-02'],
}

export default function InboundPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [showInbound, setShowInbound] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<PendingInboundOrder | null>(null)
  const [location, setLocation] = useState('')
  const [remark, setRemark] = useState('')
  const [selectedMoldNumbers, setSelectedMoldNumbers] = useState<string[]>([])

  const filtered = PENDING_DATA.filter((o) => {
    const matchSearch = !search || o.id.includes(search) || o.moldName.includes(search)
    const matchType = !typeFilter || o.type === typeFilter
    const matchWh = !warehouseFilter || o.targetWarehouse === warehouseFilter
    return matchSearch && matchType && matchWh
  })

  const handleOpenInbound = (order: PendingInboundOrder) => {
    setCurrentOrder(order)
    setLocation('')
    setRemark('')
    setSelectedMoldNumbers(order.moldNumbers.filter(m => !m.isInbound).map(m => m.id))
    setShowInbound(true)
  }

  const toggleMoldNumber = (moldId: string, isInbound: boolean) => {
    if (isInbound) return
    setSelectedMoldNumbers(prev =>
      prev.includes(moldId) ? prev.filter(id => id !== moldId) : [...prev, moldId]
    )
  }

  const handleSelectAllMoldNumbers = () => {
    if (!currentOrder) return
    const unboundIds = currentOrder.moldNumbers.filter(m => !m.isInbound).map(m => m.id)
    if (selectedMoldNumbers.length === unboundIds.length) {
      setSelectedMoldNumbers([])
    } else {
      setSelectedMoldNumbers(unboundIds)
    }
  }

  const handleConfirmInbound = () => {
    if (!location) {
      alert('请选择库位')
      return
    }

    if (!currentOrder) return

    if (currentOrder.woType === 'spare') {
      alert(`入库成功！\n\n入库单号：RK-${Date.now()}\n模具名称：${currentOrder.moldName}\n入库数量：${currentOrder.processCount}\n入库仓库：${currentOrder.targetWarehouse}\n库位：${location}\n\n备料类工单仅按数量入库，无模具编号绑定。\n已生成正式入库单，模具库位已更新。`)
      setShowInbound(false)
      return
    }

    if (currentOrder.woType === 'single') {
      const moldNo = currentOrder.moldNumbers[0]?.number
      alert(`入库成功！\n\n入库单号：RK-${Date.now()}\n模具编号：${moldNo}\n模具名称：${currentOrder.moldName}\n入库仓库：${currentOrder.targetWarehouse}\n库位：${location}\n已生成正式入库单，模具库位已更新。`)
      setShowInbound(false)
      return
    }

    const selectedCount = selectedMoldNumbers.length
    if (selectedCount === 0) {
      alert('请至少选择一个未入库的模具编号')
      return
    }

    const selectedNos = currentOrder.moldNumbers.filter(m => selectedMoldNumbers.includes(m.id)).map(m => m.number).join('、')
    alert(`入库成功！\n\n入库单号：RK-${Date.now()}\n模具名称：${currentOrder.moldName}\n入库数量：${selectedCount} 件\n模具编号：${selectedNos}\n入库仓库：${currentOrder.targetWarehouse}\n库位：${location}\n\n已入库的编号将自动锁定，禁止重复入库。\n已生成正式入库单，模具库位已更新。`)
    setShowInbound(false)
  }

  const unboundMoldNumbers = currentOrder?.moldNumbers.filter(m => !m.isInbound) || []
  const allUnboundSelected = unboundMoldNumbers.length > 0 && unboundMoldNumbers.every(m => selectedMoldNumbers.includes(m.id))
  const typeCount = (type: InboundType) => PENDING_DATA.filter(o => o.type === type).length

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <Package size={13} className="text-blue-600" />
          <span className="text-xs text-blue-800">
            正式入库：单件工单自动绑定模具号，多件工单勾选编号入库，备料工单仅按数量入库
          </span>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <MapPin size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">入库执行</h1>
              <p className="text-[11px] text-gray-500">仓库人员操作 · 待入库单据 · 指定库位执行入库</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-400">待入库</div>
            <div className="text-lg font-bold text-blue-500">{PENDING_DATA.length}</div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Factory size={14} className="text-blue-600" />
            <div>
              <div className="text-[10px] text-blue-500">制造完工</div>
              <div className="text-sm font-bold text-blue-700">{typeCount('manufacture')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
            <Wrench size={14} className="text-red-600" />
            <div>
              <div className="text-[10px] text-red-500">维修入库</div>
              <div className="text-sm font-bold text-red-700">{typeCount('repair')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <Shield size={14} className="text-green-600" />
            <div>
              <div className="text-[10px] text-green-500">二级保养</div>
              <div className="text-sm font-bold text-green-700">{typeCount('maintenance')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
            <Truck size={14} className="text-orange-600" />
            <div>
              <div className="text-[10px] text-orange-500">委外到货</div>
              <div className="text-sm font-bold text-orange-700">{typeCount('outsourcing')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-wrap shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="入库单号 / 模具名称"
              className="border border-gray-200 rounded pl-7 pr-3 py-1.5 text-[12px] w-64 focus:outline-none focus:border-emerald-400 bg-gray-50"
            />
          </div>

          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-32 cursor-pointer hover:border-emerald-300 bg-gray-50">
              <span className={typeFilter ? 'text-gray-700' : 'text-gray-400'}>
                {typeFilter ? TYPE_META[typeFilter as InboundType]?.label : '入库类型'}
              </span>
              <ChevronDown size={11} className="text-gray-400" />
            </button>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="">全部类型</option>
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-28 cursor-pointer hover:border-emerald-300 bg-gray-50">
              <span className={warehouseFilter ? 'text-gray-700' : 'text-gray-400'}>{warehouseFilter || '目标仓库'}</span>
              <ChevronDown size={11} className="text-gray-400" />
            </button>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="">全部仓库</option>
              <option value="备料仓">备料仓</option>
              <option value="技术仓">技术仓</option>
              <option value="成品仓">成品仓</option>
            </select>
          </div>

          <button
            onClick={() => { setSearch(''); setTypeFilter(''); setWarehouseFilter('') }}
            className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50 bg-white"
          >
            <RotateCcw size={11} /> 重置
          </button>

          <div className="ml-auto text-[11px] text-gray-400">
            共 <span className="text-gray-600 font-medium">{filtered.length}</span> 条待入库
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">待入库单号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">入库类型</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">工单类型</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具名称</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">品号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">目标仓库</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">源工艺入库单</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">本次加工</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">累计加工</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">审核人</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">审核时间</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={12} className="px-4 py-16 text-center text-gray-400">暂无待入库单据</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                          {row.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_META[row.type].bg} ${TYPE_META[row.type].text}`}>
                          {TYPE_META[row.type].icon}
                          {row.typeLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${WO_TYPE_COLORS[row.woType]}`}>
                          {row.woType === 'single' && <Package size={10} />}
                          {row.woType === 'multi' && <Package size={10} />}
                          {row.woType === 'spare' && <Factory size={10} />}
                          {row.woTypeLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium">{row.moldName}</td>
                      <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{row.itemNo}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                          {row.targetWarehouse}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{row.processInboundId}</td>
                      <td className="px-3 py-2.5 text-right text-green-600 font-medium">
                        {row.processCount > 0 ? `+${row.processCount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-800 font-medium">
                        {row.totalCount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{row.confirmPerson}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.confirmTime}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenInbound(row)}
                            className="flex items-center gap-1 text-[11px] text-white bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1 rounded transition-colors"
                          >
                            <CheckCircle2 size={11} /> 执行入库
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showInbound && currentOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowInbound(false)}>
            <div className="bg-white rounded-xl shadow-xl w-[640px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-800">执行入库</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_META[currentOrder.type].bg} ${TYPE_META[currentOrder.type].text}`}>
                    {currentOrder.typeLabel}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${WO_TYPE_COLORS[currentOrder.woType]}`}>
                    {currentOrder.woTypeLabel}
                  </span>
                </div>
                <button onClick={() => setShowInbound(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-[12px]">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[10px] text-gray-500">模具名称</div>
                      <div className="text-[13px] font-semibold text-emerald-700">{currentOrder.moldName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">品号</div>
                      <div className="text-[12px] text-gray-600 font-mono">{currentOrder.itemNo}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">目标仓库</div>
                      <div className="text-[12px] font-medium text-emerald-700">{currentOrder.targetWarehouse}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[10px] text-gray-500">本次加工</div>
                      <div className="text-[12px] font-medium text-green-600">{currentOrder.processCount > 0 ? `+${currentOrder.processCount.toLocaleString()}` : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">累计加工</div>
                      <div className="text-[12px] font-medium text-gray-700">{currentOrder.totalCount.toLocaleString()} 模次</div>
                    </div>
                    {currentOrder.batchNo && (
                      <div>
                        <div className="text-[10px] text-gray-500">完工批次号</div>
                        <div className="text-[12px] font-mono text-indigo-600">{currentOrder.batchNo}</div>
                      </div>
                    )}
                  </div>
                </div>

                {currentOrder.woType !== 'spare' && currentOrder.moldNumbers.length > 0 && (
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Package size={13} className="text-blue-500" />
                      模具编号绑定
                      <span className="text-[11px] text-gray-400 font-normal">
                        ({currentOrder.moldNumbers.filter(m => m.isInbound).length}/{currentOrder.moldNumbers.length} 已入库)
                      </span>
                    </h3>

                    {currentOrder.woType === 'single' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CheckCircle2 size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="text-[11px] text-blue-600">单件模具工单</div>
                              <div className="text-lg font-bold text-blue-800">模具编号：{currentOrder.moldNumbers[0]?.number}</div>
                            </div>
                          </div>
                          <span className={currentOrder.moldNumbers[0]?.isInbound ? 'px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium' : 'px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium'}>
                            {currentOrder.moldNumbers[0]?.isInbound ? '已入库' : '待入库'}
                          </span>
                        </div>
                      </div>
                    )}

                    {currentOrder.woType === 'multi' && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] text-gray-500">
                            已选 <span className="text-blue-600 font-bold">{selectedMoldNumbers.length}</span> 个编号
                          </span>
                          <button
                            onClick={handleSelectAllMoldNumbers}
                            className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Check size={10} /> {allUnboundSelected ? '取消全选' : '全选未入库'}
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {currentOrder.moldNumbers.map((mold) => (
                            <div
                              key={mold.id}
                              className={cn(
                                'relative flex items-center justify-center px-3 py-2 rounded-lg border-2 text-[12px] font-mono font-medium transition-all cursor-pointer',
                                mold.isInbound
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : selectedMoldNumbers.includes(mold.id)
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                              )}
                              onClick={() => toggleMoldNumber(mold.id, mold.isInbound)}
                            >
                              {mold.number}
                              {mold.isInbound && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Check size={8} className="text-gray-500" />
                                </span>
                              )}
                              {!mold.isInbound && selectedMoldNumbers.includes(mold.id) && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check size={8} className="text-white" />
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-blue-50 border-2 border-blue-500 rounded" /> 已选
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-white border-2 border-gray-200 rounded" /> 未入库可勾选
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-gray-100 border-2 border-gray-200 rounded" /> 已入库（不可选）
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {currentOrder.woType === 'spare' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Factory size={18} className="text-gray-500" />
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500">备料类工单</div>
                        <div className="text-sm text-gray-700">仅按数量入库，无模具编号绑定</div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-600 mb-1.5">
                    库位 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <button className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 hover:border-emerald-300">
                      <span className={location ? 'text-gray-800' : 'text-gray-400'}>
                        {location || `请选择${currentOrder.targetWarehouse}库位`}
                      </span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </button>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      <option value="">请选择库位</option>
                      {(WAREHOUSE_LOCATIONS[currentOrder.targetWarehouse] || []).map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">扫描库位码或下拉选择库位</p>
                </div>

                {currentOrder.remark && (
                  <div>
                    <div className="text-[11px] text-gray-400 mb-1">单据备注</div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-gray-600">{currentOrder.remark}</div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-600 mb-1.5">入库备注</label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={2}
                    placeholder="如有特殊情况请备注"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-emerald-400 bg-gray-50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <button
                  onClick={() => setShowInbound(false)}
                  className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmInbound}
                  disabled={!location || (currentOrder.woType === 'multi' && selectedMoldNumbers.length === 0)}
                  className="px-4 py-1.5 text-sm text-white bg-emerald-500 hover:bg-emerald-600 rounded font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={13} /> 确认入库
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}