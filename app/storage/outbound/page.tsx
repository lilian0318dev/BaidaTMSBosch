'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RotateCcw, Eye, X, Package, Factory, Wrench,
  Shield, Truck, Trash2, ChevronDown, CheckCircle2,
  MapPin, Box,
} from 'lucide-react'

type PickingType = 'manufacture' | 'repair' | 'maintenance' | 'outsourcing' | 'scrap'

interface PendingOutboundOrder {
  id: string
  pickingRequestId: string
  type: PickingType
  typeLabel: string
  moldId: string
  moldName: string
  itemNo: string
  spec: string
  fromWarehouse: string
  fromLocation?: string
  toLocation: string
  qty: number
  applicant: string
  auditor: string
  auditTime: string
  sourceOrderNo?: string
  remark?: string
}

const PENDING_DATA: PendingOutboundOrder[] = [
  {
    id: 'DCK-20260624-0001',
    pickingRequestId: 'LL-20260623-0005',
    type: 'manufacture',
    typeLabel: '生产领用',
    moldId: 'M021',
    moldName: '7648SO成形凹模',
    itemNo: '60024901201021',
    spec: 'A2737645',
    fromWarehouse: '成品仓',
    toLocation: '冲压车间-B线-03号机',
    qty: 1,
    applicant: '李班长',
    auditor: '李主管',
    auditTime: '2026-06-23 08:10',
    sourceOrderNo: 'WO-2026-0623-007',
  },
  {
    id: 'DCK-20260624-0002',
    pickingRequestId: 'LL-20260623-0004',
    type: 'outsourcing',
    typeLabel: '委外发料',
    moldId: 'M005',
    moldName: '7669SO成形凹模',
    itemNo: '60024901201005',
    spec: 'A2737669',
    fromWarehouse: '技术仓',
    toLocation: '外部供应商-某精密',
    qty: 1,
    applicant: '赵工',
    auditor: '王主管',
    auditTime: '2026-06-23 15:00',
    sourceOrderNo: 'WW-2026-0623-001',
    remark: '委外热处理',
  },
  {
    id: 'DCK-20260624-0003',
    pickingRequestId: 'LL-20260624-0006',
    type: 'repair',
    typeLabel: '维修领料',
    moldId: 'M010',
    moldName: '7664SO成形凸模',
    itemNo: '60024901201010',
    spec: 'A2737662',
    fromWarehouse: '备料仓',
    toLocation: '工装维修车间',
    qty: 1,
    applicant: '张钳工',
    auditor: '王主管',
    auditTime: '2026-06-24 09:00',
    sourceOrderNo: 'WX-2026-0624-001',
  },
  {
    id: 'DCK-20260624-0004',
    pickingRequestId: 'LL-20260624-0007',
    type: 'maintenance',
    typeLabel: '保养领料',
    moldId: 'M015',
    moldName: '7659SO成形凹模',
    itemNo: '60024901201015',
    spec: 'A2737659',
    fromWarehouse: '备料仓',
    toLocation: '工装保养车间',
    qty: 1,
    applicant: '王保养工',
    auditor: '李主管',
    auditTime: '2026-06-24 10:30',
    sourceOrderNo: 'BY-2026-0624-002',
  },
]

const TYPE_META: Record<PickingType, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  manufacture: { label: '生产领用', icon: <Factory size={11} />, bg: 'bg-blue-100', text: 'text-blue-700' },
  repair: { label: '维修领料', icon: <Wrench size={11} />, bg: 'bg-red-100', text: 'text-red-700' },
  maintenance: { label: '保养领料', icon: <Shield size={11} />, bg: 'bg-green-100', text: 'text-green-700' },
  outsourcing: { label: '委外发料', icon: <Truck size={11} />, bg: 'bg-orange-100', text: 'text-orange-700' },
  scrap: { label: '报废处置', icon: <Trash2 size={11} />, bg: 'bg-gray-100', text: 'text-gray-700' },
}

const WAREHOUSE_LOCATIONS: Record<string, string[]> = {
  '备料仓': ['B-01-01', 'B-01-02', 'B-01-03', 'B-02-01', 'B-02-02', 'B-02-03'],
  '技术仓': ['C-01-01', 'C-01-02', 'C-01-03', 'C-02-01', 'C-02-02'],
  '成品仓': ['A-01-01', 'A-01-02', 'A-01-03', 'A-02-01', 'A-02-02', 'A-03-01', 'A-03-02'],
  '报废仓': ['D-01-01', 'D-01-02', 'D-02-01'],
}

const WAREHOUSE_LIST = ['备料仓', '技术仓', '成品仓', '报废仓']

export default function OutboundPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [showOutbound, setShowOutbound] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<PendingOutboundOrder | null>(null)
  const [fromLocation, setFromLocation] = useState('')
  const [remark, setRemark] = useState('')

  const filtered = PENDING_DATA.filter((o) => {
    const matchSearch = !search || o.id.includes(search) || o.moldId.includes(search) || o.moldName.includes(search)
    const matchType = !typeFilter || o.type === typeFilter
    const matchWh = !warehouseFilter || o.fromWarehouse === warehouseFilter
    return matchSearch && matchType && matchWh
  })

  const handleOpenOutbound = (order: PendingOutboundOrder) => {
    setCurrentOrder(order)
    setFromLocation('')
    setRemark('')
    setShowOutbound(true)
  }

  const handleConfirmOutbound = () => {
    if (!fromLocation) {
      alert('请选择出库库位')
      return
    }
    alert(`出库成功！\n\n出库单号：CK-${Date.now()}\n模具：${currentOrder?.moldName}\n仓库：${currentOrder?.fromWarehouse}\n库位：${fromLocation}\n流向：${currentOrder?.toLocation}\n\n已生成正式出库单，模具位置已更新。`)
    setShowOutbound(false)
  }

  const typeCount = (type: PickingType) => PENDING_DATA.filter(o => o.type === type).length

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <Box size={13} className="text-rose-600" />
          <span className="text-xs text-rose-800">
            仓库人员执行出库 · 审核通过的领料单流转至此 · 确认库位后生成正式出库单
          </span>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
              <MapPin size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">出库执行</h1>
              <p className="text-[11px] text-gray-500">仓库人员操作 · 待出库单据 · 确认库位执行出库</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-400">待出库</div>
            <div className="text-lg font-bold text-rose-500">{PENDING_DATA.length}</div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Factory size={14} className="text-blue-600" />
            <div>
              <div className="text-[10px] text-blue-500">生产领用</div>
              <div className="text-sm font-bold text-blue-700">{typeCount('manufacture')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
            <Wrench size={14} className="text-red-600" />
            <div>
              <div className="text-[10px] text-red-500">维修领料</div>
              <div className="text-sm font-bold text-red-700">{typeCount('repair')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <Shield size={14} className="text-green-600" />
            <div>
              <div className="text-[10px] text-green-500">保养领料</div>
              <div className="text-sm font-bold text-green-700">{typeCount('maintenance')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
            <Truck size={14} className="text-orange-600" />
            <div>
              <div className="text-[10px] text-orange-500">委外发料</div>
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
              placeholder="出库单号 / 模具编号 / 模具名称"
              className="border border-gray-200 rounded pl-7 pr-3 py-1.5 text-[12px] w-64 focus:outline-none focus:border-rose-400 bg-gray-50"
            />
          </div>

          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-32 cursor-pointer hover:border-rose-300 bg-gray-50">
              <span className={typeFilter ? 'text-gray-700' : 'text-gray-400'}>
                {typeFilter ? TYPE_META[typeFilter as PickingType]?.label : '出库类型'}
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
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-28 cursor-pointer hover:border-rose-300 bg-gray-50">
              <span className={warehouseFilter ? 'text-gray-700' : 'text-gray-400'}>{warehouseFilter || '来源仓库'}</span>
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
            共 <span className="text-gray-600 font-medium">{filtered.length}</span> 条待出库
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">待出库单号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">出库类型</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具编号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具名称</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">品号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">来源仓库</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">流向</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">数量</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">源领料单</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">审核人</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">审核时间</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={12} className="px-4 py-16 text-center text-gray-400">暂无待出库单据</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="text-rose-600 font-medium cursor-pointer hover:underline">
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
                        <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono text-[11px]">
                          {row.moldId}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium">{row.moldName}</td>
                      <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{row.itemNo}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[11px] font-medium">
                          {row.fromWarehouse}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{row.toLocation}</td>
                      <td className="px-3 py-2.5 text-right text-gray-800 font-medium">
                        {row.qty}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{row.pickingRequestId}</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.auditor}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.auditTime}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenOutbound(row)}
                            className="flex items-center gap-1 text-[11px] text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-1 rounded transition-colors"
                          >
                            <CheckCircle2 size={11} /> 执行出库
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

        {showOutbound && currentOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowOutbound(false)}>
            <div className="bg-white rounded-xl shadow-xl w-[520px]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-rose-500" />
                  <span className="text-sm font-semibold text-gray-800">执行出库</span>
                </div>
                <button onClick={() => setShowOutbound(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-[12px]">
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[10px] text-gray-500">模具编号</div>
                      <div className="text-[13px] font-semibold text-rose-700">{currentOrder.moldId}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">模具名称</div>
                      <div className="text-[13px] font-medium text-gray-800">{currentOrder.moldName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">出库类型</div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${TYPE_META[currentOrder.type].bg} ${TYPE_META[currentOrder.type].text}`}>
                        {currentOrder.typeLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[10px] text-gray-500">来源仓库</div>
                      <div className="text-[12px] font-medium text-rose-700">{currentOrder.fromWarehouse}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">流向</div>
                      <div className="text-[12px] font-medium text-gray-700">{currentOrder.toLocation}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">数量</div>
                      <div className="text-[12px] font-medium text-gray-700">{currentOrder.qty}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1.5">
                    出库库位 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <button className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 hover:border-rose-300">
                      <span className={fromLocation ? 'text-gray-800' : 'text-gray-400'}>
                        {fromLocation || `请选择${currentOrder.fromWarehouse}库位`}
                      </span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </button>
                    <select
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      <option value="">请选择库位</option>
                      {(WAREHOUSE_LOCATIONS[currentOrder.fromWarehouse] || []).map((loc) => (
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
                  <label className="block text-gray-600 mb-1.5">出库备注</label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={2}
                    placeholder="如有特殊情况请备注"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-rose-400 bg-gray-50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setShowOutbound(false)}
                  className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmOutbound}
                  disabled={!fromLocation}
                  className="px-4 py-1.5 text-sm text-white bg-rose-500 hover:bg-rose-600 rounded font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={13} /> 确认出库
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
