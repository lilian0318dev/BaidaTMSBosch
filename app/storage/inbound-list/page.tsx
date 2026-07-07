'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RotateCcw, Eye, Printer, Download, ChevronDown,
  Package, Factory, Wrench, Shield, Truck, X, FileText, Check, CheckCircle2,
} from 'lucide-react'

type InboundType = 'manufacture' | 'repair' | 'maintenance' | 'outsourcing'
type BatchType = '自制完工批次' | '委外回流批次' | '混合完工批次'
type WOType = 'single' | 'multi' | 'spare'

interface MoldNumber {
  id: string
  number: string
  isInbound: boolean
}

interface InboundOrder {
  id: string
  processInboundId: string
  type: InboundType
  typeLabel: string
  moldName: string
  itemNo: string
  warehouse: string
  location: string
  processCount: number
  totalCount: number
  confirmPerson: string
  confirmTime: string
  sourceOrderNo: string
  remark?: string
  batchNo?: string
  batchType?: BatchType
  batchQty?: number
  inspectNo?: string
  outsourceWoNo?: string
  woType: WOType
  woTypeLabel: string
  moldNumbers: MoldNumber[]
}

const WAREHOUSE_LIST = ['备料仓', '技术仓', '成品仓']

const MOCK_DATA: InboundOrder[] = [
  {
    id: 'RK-20260622-0005',
    processInboundId: 'GYRK-20260622-0005',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldName: '7648SO成形凹模',
    itemNo: '60024901201021',
    warehouse: '成品仓',
    location: 'A-01-03',
    processCount: 1,
    totalCount: 1,
    confirmPerson: '王主管',
    confirmTime: '2026-06-22 17:30',
    sourceOrderNo: 'WO-2026-0622-012',
    batchNo: 'MO20260622-12-01',
    batchType: '自制完工批次',
    batchQty: 1,
    inspectNo: 'QMS-20260622-001',
    woType: 'single',
    woTypeLabel: '单件模具工单',
    moldNumbers: [
      { id: 'M1', number: '198', isInbound: false },
    ],
  },
  {
    id: 'RK-20260623-0006',
    processInboundId: 'GYRK-20260623-0006',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldName: '7650SO成形凸模',
    itemNo: '60024901201020',
    warehouse: '成品仓',
    location: 'A-01-05',
    processCount: 3,
    totalCount: 5,
    confirmPerson: '',
    confirmTime: '',
    sourceOrderNo: 'WO-2026-0623-015',
    batchNo: 'MO20260623-15-01',
    batchType: '自制完工批次',
    batchQty: 3,
    inspectNo: 'QMS-20260623-005',
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
    id: 'RK-20260623-0007',
    processInboundId: 'GYRK-20260623-0007',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldName: '定位销组件',
    itemNo: '26088',
    warehouse: '备料仓',
    location: '',
    processCount: 120,
    totalCount: 200,
    confirmPerson: '',
    confirmTime: '',
    sourceOrderNo: 'WO-2026-0623-018',
    batchNo: 'MO20260623-18-01',
    batchType: '自制完工批次',
    batchQty: 120,
    inspectNo: 'QMS-20260623-006',
    woType: 'spare',
    woTypeLabel: '备料类工单',
    moldNumbers: [],
  },
  {
    id: 'RK-20260622-0004',
    processInboundId: 'GYRK-20260622-0006',
    type: 'repair',
    typeLabel: '维修入库',
    moldName: '7667SO成形凹模',
    itemNo: '60024901201007',
    warehouse: '备料仓',
    location: 'B-02-05',
    processCount: 0,
    totalCount: 64050,
    confirmPerson: '王主管',
    confirmTime: '2026-06-22 11:00',
    sourceOrderNo: 'WX-20260620-0008',
    woType: 'single',
    woTypeLabel: '单件模具工单',
    moldNumbers: [
      { id: 'M7', number: '197', isInbound: false },
    ],
  },
  {
    id: 'RK-20260621-0003',
    processInboundId: 'GYRK-20260621-0007',
    type: 'maintenance',
    typeLabel: '二级保养',
    moldName: '7665SO成形凹模',
    itemNo: '60024901201009',
    warehouse: '成品仓',
    location: 'A-03-08',
    processCount: 2100,
    totalCount: 50860,
    confirmPerson: '李主管',
    confirmTime: '2026-06-21 16:20',
    sourceOrderNo: 'BY-20260618-007',
    woType: 'single',
    woTypeLabel: '单件模具工单',
    moldNumbers: [],
  },
  {
    id: 'RK-20260620-0002',
    processInboundId: 'GYRK-20260620-0008',
    type: 'outsourcing',
    typeLabel: '委外到货',
    moldName: '7671SO成形凸模',
    itemNo: '60024901201003',
    warehouse: '技术仓',
    location: 'C-01-02',
    processCount: 0,
    totalCount: 93200,
    confirmPerson: '王主管',
    confirmTime: '2026-06-20 10:00',
    sourceOrderNo: 'WW-2026-0610-001',
    remark: '委外镀铬处理回厂',
    batchNo: 'MO20260610-01-01',
    batchType: '委外回流批次',
    batchQty: 100,
    inspectNo: 'QMS-20260620-001',
    outsourceWoNo: 'OUT-2026-0610-001',
    woType: 'spare',
    woTypeLabel: '备料类工单',
    moldNumbers: [],
  },
]

const WO_TYPE_COLORS: Record<WOType, string> = {
  single: 'bg-blue-100 text-blue-700',
  multi: 'bg-purple-100 text-purple-700',
  spare: 'bg-gray-100 text-gray-700',
}

const TYPE_META: Record<InboundType, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  manufacture: { label: '制造完工', icon: <Factory size={11} />, bg: 'bg-blue-100', text: 'text-blue-700' },
  repair: { label: '维修入库', icon: <Wrench size={11} />, bg: 'bg-red-100', text: 'text-red-700' },
  maintenance: { label: '二级保养', icon: <Shield size={11} />, bg: 'bg-green-100', text: 'text-green-700' },
  outsourcing: { label: '委外到货', icon: <Truck size={11} />, bg: 'bg-orange-100', text: 'text-orange-700' },
}

export default function InboundListPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [detail, setDetail] = useState<InboundOrder | null>(null)
  const [selectedMoldNumbers, setSelectedMoldNumbers] = useState<string[]>([])

  const filtered = MOCK_DATA.filter((o) => {
    const matchSearch = !search || o.id.includes(search) || o.moldName.includes(search)
    const matchType = !typeFilter || o.type === typeFilter
    const matchWh = !warehouseFilter || o.warehouse === warehouseFilter
    return matchSearch && matchType && matchWh
  })

  const handlePrint = (order: InboundOrder) => {
    alert(`打印入库单：${order.id}`)
  }

  const handleExport = () => {
    if (!confirm(`确定导出当前 ${filtered.length} 条入库记录？`)) return
    alert(`已导出 ${filtered.length} 条入库台账`)
  }

  const handleOpenDetail = (order: InboundOrder) => {
    setDetail(order)
    setSelectedMoldNumbers(order.moldNumbers.filter(m => !m.isInbound).map(m => m.id))
  }

  const toggleMoldNumber = (moldId: string, isInbound: boolean) => {
    if (isInbound) return
    setSelectedMoldNumbers(prev =>
      prev.includes(moldId) ? prev.filter(id => id !== moldId) : [...prev, moldId]
    )
  }

  const handleSelectAllMoldNumbers = (order: InboundOrder) => {
    const unboundIds = order.moldNumbers.filter(m => !m.isInbound).map(m => m.id)
    if (selectedMoldNumbers.length === unboundIds.length) {
      setSelectedMoldNumbers([])
    } else {
      setSelectedMoldNumbers(unboundIds)
    }
  }

  const handleConfirmInbound = (order: InboundOrder) => {
    const unboundCount = order.moldNumbers.filter(m => !m.isInbound).length
    
    if (order.woType === 'spare') {
      if (!confirm(`确认入库？\n\n入库单号：${order.id}\n模具名称：${order.moldName}\n入库数量：${order.batchQty}\n入库仓库：${order.warehouse}\n\n备料类工单仅按数量入库，无模具编号绑定。`)) return
      alert(`入库成功！\n\n入库单号：${order.id}\n入库数量：${order.batchQty}\n入库仓库：${order.warehouse}`)
      setDetail(null)
      return
    }

    if (order.woType === 'single') {
      if (!confirm(`确认入库？\n\n入库单号：${order.id}\n模具名称：${order.moldName}\n模具编号：${order.moldNumbers[0]?.number}\n入库仓库：${order.warehouse}`)) return
      alert(`入库成功！\n\n入库单号：${order.id}\n模具编号：${order.moldNumbers[0]?.number}\n模具名称：${order.moldName}\n入库仓库：${order.warehouse}`)
      setDetail(null)
      return
    }

    const selectedCount = selectedMoldNumbers.length
    if (selectedCount === 0) {
      alert('请至少选择一个未入库的模具编号')
      return
    }
    const selectedNos = order.moldNumbers.filter(m => selectedMoldNumbers.includes(m.id)).map(m => m.number).join('、')
    
    if (!confirm(`确认入库 ${selectedCount} 个模具？\n\n入库单号：${order.id}\n模具名称：${order.moldName}\n选中编号：${selectedNos}\n入库仓库：${order.warehouse}\n\n备注：已入库的编号将自动置灰锁定，禁止重复入库。`)) return
    
    alert(`入库成功！\n\n入库单号：${order.id}\n入库数量：${selectedCount} 件\n模具编号：${selectedNos}\n入库仓库：${order.warehouse}`)
    setDetail(null)
    setSelectedMoldNumbers([])
  }

  const unboundMoldNumbers = detail?.moldNumbers.filter(m => !m.isInbound) || []
  const allUnboundSelected = unboundMoldNumbers.length > 0 && unboundMoldNumbers.every(m => selectedMoldNumbers.includes(m.id))

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <FileText size={13} className="text-blue-600" />
          <span className="text-xs text-blue-800">
            正式入库：单件工单自动绑定模具号，多件工单勾选编号入库，备料工单仅按数量入库
          </span>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">正式入库单管理</h1>
              <p className="text-[11px] text-gray-500">四类入库统一管理 · 模具编号绑定确权</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              导出台账
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Factory size={14} className="text-blue-600" />
            <div>
              <div className="text-[10px] text-blue-500">制造完工入库</div>
              <div className="text-sm font-bold text-blue-700">{MOCK_DATA.filter(o => o.type === 'manufacture').length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
            <Wrench size={14} className="text-red-600" />
            <div>
              <div className="text-[10px] text-red-500">维修入库</div>
              <div className="text-sm font-bold text-red-700">{MOCK_DATA.filter(o => o.type === 'repair').length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <Shield size={14} className="text-green-600" />
            <div>
              <div className="text-[10px] text-green-500">二级保养入库</div>
              <div className="text-sm font-bold text-green-700">{MOCK_DATA.filter(o => o.type === 'maintenance').length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
            <Truck size={14} className="text-orange-600" />
            <div>
              <div className="text-[10px] text-orange-500">委外到货入库</div>
              <div className="text-sm font-bold text-orange-700">{MOCK_DATA.filter(o => o.type === 'outsourcing').length}</div>
            </div>
          </div>
          <div className="ml-auto text-[11px] text-gray-400">
            合计：<span className="text-gray-700 font-medium text-sm">{MOCK_DATA.length}</span> 条入库记录
          </div>
        </div>

        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-wrap shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="入库单号 / 模具名称"
              className="border border-gray-200 rounded pl-7 pr-3 py-1.5 text-[12px] w-64 focus:outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>

          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-32 cursor-pointer hover:border-blue-300 bg-gray-50">
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
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-28 cursor-pointer hover:border-blue-300 bg-gray-50">
              <span className={warehouseFilter ? 'text-gray-700' : 'text-gray-400'}>{warehouseFilter || '入库仓库'}</span>
              <ChevronDown size={11} className="text-gray-400" />
            </button>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="">全部仓库</option>
              {WAREHOUSE_LIST.map((w) => <option key={w}>{w}</option>)}
            </select>
          </div>

          <button
            onClick={() => { setSearch(''); setTypeFilter(''); setWarehouseFilter('') }}
            className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50 bg-white"
          >
            <RotateCcw size={11} /> 重置
          </button>

          <div className="ml-auto text-[11px] text-gray-400">
            共 <span className="text-gray-600 font-medium">{filtered.length}</span> 条记录
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">入库单号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">完工批次号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">批次类型</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">工单类型</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具名称</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">入库仓库</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">库位</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">本批次数量</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">累计数量</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">确认人</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">入库时间</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={13} className="px-4 py-16 text-center text-gray-400">暂无入库记录</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => handleOpenDetail(row)}>
                          {row.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {row.batchNo ? (
                          <span className="text-indigo-600 font-mono text-[11px] cursor-pointer hover:underline">
                            {row.batchNo}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {row.batchType ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                            row.batchType === '自制完工批次' ? 'bg-blue-100 text-blue-700' :
                            row.batchType === '委外回流批次' ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {row.batchType === '委外回流批次' && <Truck size={10} />}
                            {row.batchType === '自制完工批次' && <Factory size={10} />}
                            {row.batchType}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_META[row.type].bg} ${TYPE_META[row.type].text}`}>
                            {TYPE_META[row.type].icon}
                            {row.typeLabel}
                          </span>
                        )}
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
                      <td className="px-3 py-2.5 text-gray-700">{row.warehouse}</td>
                      <td className="px-3 py-2.5 text-gray-500">{row.location || '待分配'}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700">
                        {row.batchQty ? row.batchQty.toLocaleString() : (row.processCount > 0 ? row.processCount.toLocaleString() : '—')}
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-800 font-medium">{row.totalCount.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.confirmPerson || '-'}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.confirmTime || '-'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(row)}
                            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-50"
                          >
                            <Eye size={11} /> 详情
                          </button>
                          <button
                            onClick={() => handlePrint(row)}
                            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100"
                          >
                            <Printer size={11} /> 打印
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

        {detail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-xl shadow-xl w-[640px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">正式入库单详情</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_META[detail.type].bg} ${TYPE_META[detail.type].text}`}>
                    {detail.typeLabel}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${WO_TYPE_COLORS[detail.woType]}`}>
                    {detail.woTypeLabel}
                  </span>
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-6 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">入库单号</span>
                    <span className="text-gray-800 font-medium">{detail.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">对应工艺入库单</span>
                    <span className="text-blue-600 font-mono">{detail.processInboundId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">源单据号</span>
                    <span className="text-gray-700 font-mono">{detail.sourceOrderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">入库时间</span>
                    <span className="text-gray-600">{detail.confirmTime || '待确认'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold text-gray-500 mb-2">模具信息</h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-6 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">模具名称</span>
                      <span className="text-gray-800 font-medium">{detail.moldName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">品号</span>
                      <span className="text-gray-600 font-mono">{detail.itemNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">累计加工次数</span>
                      <span className="text-gray-800 font-medium">{detail.totalCount.toLocaleString()} 模次</span>
                    </div>
                    {detail.processCount > 0 && (
                      <div className="col-span-2 flex justify-between">
                        <span className="text-gray-400">本次加工次数</span>
                        <span className="text-green-600 font-medium">+{detail.processCount.toLocaleString()} 模次</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold text-gray-500 mb-2">仓储信息</h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-6 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">入库仓库</span>
                      <span className="text-gray-800 font-medium">{detail.warehouse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">库位</span>
                      <span className="text-gray-700">{detail.location || '待分配'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">确认人</span>
                      <span className="text-gray-700">{detail.confirmPerson || '-'}</span>
                    </div>
                  </div>
                </div>

                {detail.batchNo && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-500 mb-2">批次信息</h3>
                    <div className="bg-indigo-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-6 text-[12px]">
                      <div className="flex justify-between">
                        <span className="text-gray-500">完工批次号</span>
                        <span className="text-indigo-600 font-mono font-medium">{detail.batchNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">批次类型</span>
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          detail.batchType === '自制完工批次' ? 'bg-blue-100 text-blue-700' :
                          detail.batchType === '委外回流批次' ? 'bg-orange-100 text-orange-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>{detail.batchType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">本批次完工数量</span>
                        <span className="text-indigo-700 font-semibold">{detail.batchQty?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">检验单号</span>
                        <span className="text-blue-600 font-mono">{detail.inspectNo}</span>
                      </div>
                    </div>
                  </div>
                )}

                {detail.woType !== 'spare' && detail.moldNumbers.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                      <Package size={12} className="text-blue-500" />
                      模具编号绑定
                      <span className="text-[10px] text-gray-400 font-normal">
                        ({detail.moldNumbers.filter(m => m.isInbound).length}/{detail.moldNumbers.length} 已入库)
                      </span>
                    </h3>

                    {detail.woType === 'single' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CheckCircle2 size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="text-[11px] text-blue-600">单件模具工单</div>
                              <div className="text-lg font-bold text-blue-800">模具编号：{detail.moldNumbers[0]?.number}</div>
                            </div>
                          </div>
                          <span className={detail.moldNumbers[0]?.isInbound ? 'px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium' : 'px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium'}>
                            {detail.moldNumbers[0]?.isInbound ? '已入库' : '待入库'}
                          </span>
                        </div>
                      </div>
                    )}

                    {detail.woType === 'multi' && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] text-gray-500">
                            已选 <span className="text-blue-600 font-bold">{selectedMoldNumbers.length}</span> 个编号
                          </span>
                          <button
                            onClick={() => handleSelectAllMoldNumbers(detail)}
                            className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Check size={10} /> {allUnboundSelected ? '取消全选' : '全选未入库'}
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {detail.moldNumbers.map((mold) => (
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

                {detail.woType === 'spare' && (
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

                {detail.remark && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-500 mb-2">备注</h3>
                    <div className="bg-gray-50 rounded-lg p-3 text-[12px] text-gray-600">{detail.remark}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <button
                  onClick={() => setDetail(null)}
                  className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white"
                >
                  关闭
                </button>
                <button
                  onClick={() => handlePrint(detail)}
                  className="px-4 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded font-medium flex items-center gap-1"
                >
                  <Printer size={13} /> 打印入库单
                </button>
                {!detail.confirmPerson && (
                  <button
                    onClick={() => handleConfirmInbound(detail)}
                    className="px-4 py-1.5 text-sm text-white bg-green-500 hover:bg-green-600 rounded font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} /> 确认入库
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}