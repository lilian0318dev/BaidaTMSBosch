'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, Filter, RotateCcw, Eye, CheckCircle2, FileText,
  ClipboardCheck, Wrench, Shield, Truck, Factory,
  X, Package, ChevronDown,
} from 'lucide-react'

type InboundType = 'manufacture' | 'repair' | 'maintenance' | 'outsourcing'
type BatchType = '自制完工批次' | '委外回流批次' | '混合完工批次'

interface ProcessInboundOrder {
  id: string
  type: InboundType
  typeLabel: string
  moldId: string
  moldName: string
  itemNo: string
  targetWarehouse: string
  sourceOrderNo: string
  processCount: number
  totalCount: number
  inspectResult: '合格' | '不合格'
  generateTime: string
  status: '待确认' | '已确认待入库' | '已入库'
  applicant: string
  inspector: string
  confirmPerson?: string
  confirmTime?: string
  remark?: string
  // 新增批次相关字段
  batchNo?: string           // 完工批次号
  batchType?: BatchType      // 批次类型
  batchQty?: number          // 本批次完工数量
  batchTime?: string         // 批次完工时间
  inspectNo?: string         // 检验单号
  outsourceWoNo?: string     // 对应委外任务单号（委外批次回填）
}

const MOCK_DATA: ProcessInboundOrder[] = [
  // 制造完工 - 批次1（自制完工批次）
  {
    id: 'GYRK-20260623-0001',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldId: 'M020',
    moldName: '7650SO成形凸模',
    itemNo: '60024901201020',
    targetWarehouse: '成品仓',
    sourceOrderNo: 'WO-2026-0623-008',
    processCount: 3200,
    totalCount: 85600,
    inspectResult: '合格',
    generateTime: '2026-06-23 16:30',
    status: '待确认',
    applicant: '张班长',
    inspector: '质检员A',
    // 批次信息
    batchNo: 'MO20260623-08-01',
    batchType: '自制完工批次',
    batchQty: 3200,
    batchTime: '2026-06-23 15:00',
    inspectNo: 'QMS-20260623-001',
  },
  // 维修入库（沿用原有逻辑，无批次）
  {
    id: 'GYRK-20260623-0002',
    type: 'repair',
    typeLabel: '维修入库',
    moldId: 'M010',
    moldName: '7664SO成形凸模',
    itemNo: '60024901201010',
    targetWarehouse: '技术仓',
    sourceOrderNo: 'WX-20260621-0015',
    processCount: 0,
    totalCount: 55560,
    inspectResult: '合格',
    generateTime: '2026-06-23 15:45',
    status: '待确认',
    applicant: '李钳工',
    inspector: '质检员B',
  },
  // 二级保养（沿用原有逻辑，无批次）
  {
    id: 'GYRK-20260623-0003',
    type: 'maintenance',
    typeLabel: '二级保养',
    moldId: 'M015',
    moldName: '7659SO成形凹模',
    itemNo: '60024901201015',
    targetWarehouse: '备料仓',
    sourceOrderNo: 'BY-20260620-003',
    processCount: 1850,
    totalCount: 40770,
    inspectResult: '合格',
    generateTime: '2026-06-23 14:20',
    status: '待确认',
    applicant: '王保养工',
    inspector: '质检员A',
  },
  // 委外到货 - 批次1（委外回流批次）
  {
    id: 'GYRK-20260623-0004',
    type: 'outsourcing',
    typeLabel: '委外到货',
    moldId: 'M005',
    moldName: '7669SO成形凹模',
    itemNo: '60024901201005',
    targetWarehouse: '技术仓',
    sourceOrderNo: 'WW-2026-0615-002',
    processCount: 0,
    totalCount: 72300,
    inspectResult: '合格',
    generateTime: '2026-06-23 11:00',
    status: '待确认',
    applicant: '仓管员',
    inspector: '质检员C',
    remark: '委外热处理回厂',
    // 批次信息
    batchNo: 'MO20260615-02-01',
    batchType: '委外回流批次',
    batchQty: 50,
    batchTime: '2026-06-23 10:30',
    inspectNo: 'QMS-20260623-002',
    outsourceWoNo: 'OUT-2026-0615-002',
  },
  // 制造完工 - 批次2（同一工单第2批次）
  {
    id: 'GYRK-20260622-0005',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldId: 'M021',
    moldName: '7648SO成形凹模',
    itemNo: '60024901201021',
    targetWarehouse: '成品仓',
    sourceOrderNo: 'WO-2026-0622-012',
    processCount: 2800,
    totalCount: 2800,
    inspectResult: '合格',
    generateTime: '2026-06-22 17:10',
    status: '已确认待入库',
    applicant: '李班长',
    inspector: '质检员B',
    confirmPerson: '王主管',
    confirmTime: '2026-06-22 17:30',
    // 批次信息（整单完工只有1个批次）
    batchNo: 'MO20260622-12-01',
    batchType: '自制完工批次',
    batchQty: 2800,
    batchTime: '2026-06-22 16:00',
    inspectNo: 'QMS-20260622-001',
  },
  // 维修入库（沿用原有逻辑，无批次）
  {
    id: 'GYRK-20260622-0006',
    type: 'repair',
    typeLabel: '维修入库',
    moldId: 'M007',
    moldName: '7667SO成形凹模',
    itemNo: '60024901201007',
    targetWarehouse: '备料仓',
    sourceOrderNo: 'WX-20260620-0008',
    processCount: 0,
    totalCount: 64050,
    inspectResult: '合格',
    generateTime: '2026-06-22 10:30',
    status: '已确认待入库',
    applicant: '张钳工',
    inspector: '质检员A',
    confirmPerson: '王主管',
    confirmTime: '2026-06-22 11:00',
  },
  // 二级保养（沿用原有逻辑，无批次）
  {
    id: 'GYRK-20260621-0007',
    type: 'maintenance',
    typeLabel: '二级保养',
    moldId: 'M009',
    moldName: '7665SO成形凹模',
    itemNo: '60024901201009',
    targetWarehouse: '成品仓',
    sourceOrderNo: 'BY-20260618-007',
    processCount: 2100,
    totalCount: 50860,
    inspectResult: '合格',
    generateTime: '2026-06-21 16:00',
    status: '已入库',
    applicant: '赵保养工',
    inspector: '质检员B',
    confirmPerson: '李主管',
    confirmTime: '2026-06-21 16:20',
  },
  // 委外到货 - 已入库（委外回流批次）
  {
    id: 'GYRK-20260620-0008',
    type: 'outsourcing',
    typeLabel: '委外到货',
    moldId: 'M003',
    moldName: '7671SO成形凸模',
    itemNo: '60024901201003',
    targetWarehouse: '技术仓',
    sourceOrderNo: 'WW-2026-0610-001',
    processCount: 0,
    totalCount: 93200,
    inspectResult: '合格',
    generateTime: '2026-06-20 09:30',
    status: '已入库',
    applicant: '仓管员',
    inspector: '质检员A',
    remark: '委外镀铬处理回厂',
    // 批次信息
    batchNo: 'MO20260610-01-01',
    batchType: '委外回流批次',
    batchQty: 100,
    batchTime: '2026-06-20 08:30',
    inspectNo: 'QMS-20260620-001',
    outsourceWoNo: 'OUT-2026-0610-001',
  },
  // 同一工单第2批次（展示多批次效果）
  {
    id: 'GYRK-20260623-0009',
    type: 'manufacture',
    typeLabel: '制造完工',
    moldId: 'M020',
    moldName: '7650SO成形凸模',
    itemNo: '60024901201020',
    targetWarehouse: '成品仓',
    sourceOrderNo: 'WO-2026-0623-008',
    processCount: 4500,
    totalCount: 85600,
    inspectResult: '合格',
    generateTime: '2026-06-23 18:00',
    status: '待确认',
    applicant: '张班长',
    inspector: '质检员A',
    // 批次信息（同一工单第2批次）
    batchNo: 'MO20260623-08-02',
    batchType: '自制完工批次',
    batchQty: 4500,
    batchTime: '2026-06-23 17:30',
    inspectNo: 'QMS-20260623-003',
  },
]

const TAB_CONFIG: { key: InboundType; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { key: 'manufacture', label: '制造完工', icon: <Factory size={13} />, color: 'blue', bg: 'bg-blue-500' },
  { key: 'repair', label: '维修入库', icon: <Wrench size={13} />, color: 'red', bg: 'bg-red-500' },
  { key: 'maintenance', label: '二级保养', icon: <Shield size={13} />, color: 'green', bg: 'bg-green-500' },
  { key: 'outsourcing', label: '委外到货', icon: <Truck size={13} />, color: 'orange', bg: 'bg-orange-500' },
]

const WAREHOUSE_LIST = ['备料仓', '技术仓', '成品仓']

export default function ProcessInboundPage() {
  const [activeTab, setActiveTab] = useState<InboundType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [batchTypeFilter, setBatchTypeFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detail, setDetail] = useState<ProcessInboundOrder | null>(null)
  const [confirmRemark, setConfirmRemark] = useState('')

  const filtered = MOCK_DATA.filter((o) => {
    const matchTab = activeTab === 'all' || o.type === activeTab
    const matchSearch = !search || o.id.includes(search) || o.moldId.includes(search) || o.moldName.includes(search) || (o.batchNo && o.batchNo.includes(search))
    const matchWh = !warehouseFilter || o.targetWarehouse === warehouseFilter
    const matchStatus = !statusFilter || o.status === statusFilter
    const matchBatchType = !batchTypeFilter || o.batchType === batchTypeFilter
    return matchTab && matchSearch && matchWh && matchStatus && matchBatchType
  })

  const pendingCount = MOCK_DATA.filter((o) => o.status === '待确认').length
  const tabPendingCount = (type: InboundType | 'all') =>
    MOCK_DATA.filter((o) => (type === 'all' || o.type === type) && o.status === '待确认').length

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const pendingIds = filtered.filter((o) => o.status === '待确认').map((o) => o.id)
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(pendingIds)
    }
  }

  const handleConfirm = (ids: string[], remark?: string) => {
    const remarkText = remark || confirmRemark
    if (!confirm(`确认审核通过 ${ids.length} 条工艺入库单？\n\n审核通过后单据将流转至仓库，由仓库人员执行入库并确定库位。${remarkText ? `\n\n备注：${remarkText}` : ''}`)) return
    alert(`已审核通过 ${ids.length} 条工艺入库单\n\n单据状态：已确认待入库\n已推送至仓库执行入库，等待库位分配。`)
    setSelectedIds([])
    setConfirmRemark('')
  }

  const pendingFiltered = filtered.filter((o) => o.status === '待确认')
  const allSelected = pendingFiltered.length > 0 && pendingFiltered.every((o) => selectedIds.includes(o.id))

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        {/* 顶部说明条 */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <ClipboardCheck size={13} className="text-amber-600" />
          <span className="text-xs text-amber-800">
            质量主管专属审核页 · 四类工艺入库单统一审核 · 审核通过后流转至仓库执行入库（确定库位）
          </span>
        </div>

        {/* 标题区 */}
        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">工艺入库审核</h1>
              <p className="text-[11px] text-gray-500">制造完工 / 维修完成 / 二级保养 / 委外到货 · 统一审核确认</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <div className="text-[11px] text-gray-400">待审核</div>
              <div className="text-lg font-bold text-red-500">{pendingCount}</div>
            </div>
            <button
              onClick={() => handleConfirm(selectedIds)}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 size={14} />
              批量确认 ({selectedIds.length})
            </button>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="bg-white border-b border-gray-200 px-4 flex items-center gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            全部
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
              activeTab === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {MOCK_DATA.length}
            </span>
            {tabPendingCount('all') > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full">
                {tabPendingCount('all')}
              </span>
            )}
          </button>
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? `border-${tab.color}-500 text-${tab.color}-600`
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                activeTab === tab.key ? `bg-${tab.color}-100 text-${tab.color}-600` : 'bg-gray-100 text-gray-500'
              }`}>
                {MOCK_DATA.filter((o) => o.type === tab.key).length}
              </span>
              {tabPendingCount(tab.key) > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full">
                  {tabPendingCount(tab.key)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 过滤工具栏 */}
        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-wrap shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="单号 / 模具 / 批次号"
              className="border border-gray-200 rounded pl-7 pr-3 py-1.5 text-[12px] w-56 focus:outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>

          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-28 cursor-pointer hover:border-blue-300 bg-gray-50">
              <span className={batchTypeFilter ? 'text-gray-700' : 'text-gray-400'}>{batchTypeFilter || '批次类型'}</span>
              <ChevronDown size={11} className="text-gray-400" />
            </button>
            <select
              value={batchTypeFilter}
              onChange={(e) => setBatchTypeFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="">全部批次</option>
              <option value="自制完工批次">自制完工批次</option>
              <option value="委外回流批次">委外回流批次</option>
              <option value="混合完工批次">混合完工批次</option>
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

          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-28 cursor-pointer hover:border-blue-300 bg-gray-50">
              <span className={statusFilter ? 'text-gray-700' : 'text-gray-400'}>{statusFilter || '单据状态'}</span>
              <ChevronDown size={11} className="text-gray-400" />
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="">全部状态</option>
              <option value="待确认">待确认</option>
              <option value="已确认待入库">已确认待入库</option>
              <option value="已入库">已入库</option>
            </select>
          </div>

          <button
            onClick={() => { setSearch(''); setWarehouseFilter(''); setStatusFilter(''); setBatchTypeFilter('') }}
            className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50 bg-white"
          >
            <RotateCcw size={11} /> 重置
          </button>

          <div className="ml-auto text-[11px] text-gray-400">
            共 <span className="text-gray-600 font-medium">{filtered.length}</span> 条记录
          </div>
        </div>

        {/* 列表区 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">工艺入库单号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">完工批次号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">批次类型</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具名称</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">入库仓库</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">源单据号</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">本批次数量</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">累计数量</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">检验结果</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">生成时间</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">状态</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={15} className="px-4 py-16 text-center text-gray-400">暂无数据</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        {row.status === '待确认' ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(row.id)}
                            onChange={() => handleToggleSelect(row.id)}
                            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setDetail(row)}>
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
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium">{row.moldName}</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.targetWarehouse}</td>
                      <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{row.sourceOrderNo}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700">
                        {row.batchQty ? row.batchQty.toLocaleString() : (row.processCount > 0 ? row.processCount.toLocaleString() : '—')}
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-800 font-medium">
                        {row.totalCount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          row.inspectResult === '合格'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {row.inspectResult}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.generateTime}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          row.status === '待确认'
                            ? 'bg-amber-100 text-amber-700'
                            : row.status === '已确认待入库'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {row.status === '待确认' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                          {row.status === '已确认待入库' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          {row.status === '已入库' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetail(row)}
                            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-50"
                          >
                            <Eye size={11} /> 详情
                          </button>
                          {row.status === '待确认' && (
                            <button
                              onClick={() => handleConfirm([row.id])}
                              className="flex items-center gap-1 text-[11px] text-green-600 hover:text-green-700 px-1.5 py-0.5 rounded hover:bg-green-50"
                            >
                              <CheckCircle2 size={11} /> 确认
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 详情弹窗 */}
        {detail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">工艺入库单详情</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                    detail.status === '待确认' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {detail.status}
                  </span>
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* 单据信息 */}
                <div>
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                    <FileText size={13} className="text-gray-400" /> 单据信息
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2.5 gap-x-6 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">工艺入库单号</span>
                      <span className="text-gray-800 font-medium">{detail.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">入库类型</span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        detail.type === 'manufacture' ? 'bg-blue-100 text-blue-700' :
                        detail.type === 'repair' ? 'bg-red-100 text-red-700' :
                        detail.type === 'maintenance' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{detail.typeLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">源单据号</span>
                      <span className="text-gray-800 font-mono">{detail.sourceOrderNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">目标仓库</span>
                      <span className="text-gray-800 font-medium">{detail.targetWarehouse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">生成时间</span>
                      <span className="text-gray-600">{detail.generateTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">检验结果</span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        detail.inspectResult === '合格' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{detail.inspectResult}</span>
                    </div>
                  </div>
                </div>

                {/* 批次信息（仅制造完工/委外到货显示） */}
                {detail.batchNo && (
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                      <Package size={13} className="text-indigo-400" /> 完工批次信息
                    </h3>
                    <div className="bg-indigo-50 rounded-lg p-3 grid grid-cols-2 gap-y-2.5 gap-x-6 text-[12px]">
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
                        <span className="text-gray-500">批次完工时间</span>
                        <span className="text-gray-600">{detail.batchTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">检验单号</span>
                        <span className="text-blue-600 font-mono cursor-pointer hover:underline">{detail.inspectNo}</span>
                      </div>
                      {detail.outsourceWoNo && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">对应委外单号</span>
                          <span className="text-orange-600 font-mono cursor-pointer hover:underline">{detail.outsourceWoNo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 模具信息 */}
                <div>
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                    <Package size={13} className="text-gray-400" /> 模具信息
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2.5 gap-x-6 text-[12px]">
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
                    {(detail.batchQty || detail.processCount) > 0 && (
                      <div className="col-span-2 flex justify-between">
                        <span className="text-gray-400">本批次/本次数量</span>
                        <span className="text-green-600 font-medium">+{(detail.batchQty || detail.processCount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 人员信息 */}
                <div>
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                    <Filter size={13} className="text-gray-400" /> 相关人员
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2.5 gap-x-6 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">申请人</span>
                      <span className="text-gray-700">{detail.applicant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">质检员</span>
                      <span className="text-gray-700">{detail.inspector}</span>
                    </div>
                  </div>
                </div>

                {detail.remark && (
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-700 mb-2">备注</h3>
                    <div className="bg-gray-50 rounded-lg p-3 text-[12px] text-gray-600">{detail.remark}</div>
                  </div>
                )}

                {detail.status === '待确认' && (
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-700 mb-2">审核备注 <span className="text-gray-400">(选填)</span></h3>
                    <textarea
                      value={confirmRemark}
                      onChange={(e) => setConfirmRemark(e.target.value)}
                      rows={2}
                      placeholder="如有特殊情况可填写备注"
                      className="w-full border border-gray-200 rounded-lg p-3 text-[12px] focus:outline-none focus:border-green-400 resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <button
                  onClick={() => { setDetail(null); setConfirmRemark('') }}
                  className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white"
                >
                  关闭
                </button>
                {detail.status === '待确认' && (
                  <button
                    onClick={() => { handleConfirm([detail.id], confirmRemark); setDetail(null); setConfirmRemark('') }}
                    className="px-4 py-1.5 text-sm text-white bg-green-500 hover:bg-green-600 rounded font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} /> 审核通过
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
