'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RotateCcw, Eye, Printer, Download, ChevronDown,
  Package, Factory, Wrench, Shield, Truck, Trash2, X, FileText,
} from 'lucide-react'

type PickingType = 'manufacture' | 'repair' | 'maintenance' | 'outsourcing' | 'scrap'

interface OutboundOrder {
  id: string
  pickingRequestId: string
  type: PickingType
  typeLabel: string
  moldId: string
  moldName: string
  itemNo: string
  spec: string
  fromWarehouse: string
  fromLocation: string
  toLocation: string
  qty: number
  operator: string
  outboundTime: string
  sourceOrderNo: string
  remark?: string
}

const MOCK_DATA: OutboundOrder[] = [
  {
    id: 'CK-20260622-0001',
    pickingRequestId: 'LL-20260622-0006',
    type: 'scrap',
    typeLabel: '报废处置',
    moldId: 'M003',
    moldName: '7671SO成形凸模',
    itemNo: '60024901201003',
    spec: 'A2737671',
    fromWarehouse: '报废仓',
    fromLocation: 'D-01-03',
    toLocation: '处置单位-金属回收',
    qty: 1,
    operator: '仓管员张',
    outboundTime: '2026-06-22 14:30',
    sourceOrderNo: 'FS-2026-0622-001',
    remark: '已按报废单处置',
  },
  {
    id: 'CK-20260622-0002',
    pickingRequestId: 'LL-20260622-0007',
    type: 'repair',
    typeLabel: '维修领料',
    moldId: 'M010',
    moldName: '7664SO成形凸模',
    itemNo: '60024901201010',
    spec: 'A2737662',
    fromWarehouse: '技术仓',
    fromLocation: 'C-02-04',
    toLocation: '工装维修车间',
    qty: 1,
    operator: '仓管员李',
    outboundTime: '2026-06-22 10:15',
    sourceOrderNo: 'WX-2026-0622-003',
  },
  {
    id: 'CK-20260621-0003',
    pickingRequestId: 'LL-20260621-0008',
    type: 'manufacture',
    typeLabel: '生产领用',
    moldId: 'M020',
    moldName: '7650SO成形凸模',
    itemNo: '60024901201020',
    spec: 'A2737650',
    fromWarehouse: '成品仓',
    fromLocation: 'A-01-05',
    toLocation: '冲压车间-A线-02号机',
    qty: 1,
    operator: '仓管员王',
    outboundTime: '2026-06-21 08:00',
    sourceOrderNo: 'WO-2026-0621-005',
  },
  {
    id: 'CK-20260620-0004',
    pickingRequestId: 'LL-20260620-0009',
    type: 'maintenance',
    typeLabel: '保养领料',
    moldId: 'M015',
    moldName: '7659SO成形凹模',
    itemNo: '60024901201015',
    spec: 'A2737659',
    fromWarehouse: '备料仓',
    fromLocation: 'B-01-07',
    toLocation: '工装保养车间',
    qty: 1,
    operator: '仓管员张',
    outboundTime: '2026-06-20 09:20',
    sourceOrderNo: 'BY-2026-0620-002',
  },
  {
    id: 'CK-20260619-0005',
    pickingRequestId: 'LL-20260619-0010',
    type: 'outsourcing',
    typeLabel: '委外发料',
    moldId: 'M005',
    moldName: '7669SO成形凹模',
    itemNo: '60024901201005',
    spec: 'A2737669',
    fromWarehouse: '技术仓',
    fromLocation: 'C-01-06',
    toLocation: '外部供应商-某精密',
    qty: 1,
    operator: '仓管员李',
    outboundTime: '2026-06-19 15:45',
    sourceOrderNo: 'WW-2026-0619-001',
    remark: '委外镀铬处理',
  },
  {
    id: 'CK-20260618-0006',
    pickingRequestId: 'LL-20260618-0011',
    type: 'manufacture',
    typeLabel: '生产领用',
    moldId: 'M021',
    moldName: '7648SO成形凹模',
    itemNo: '60024901201021',
    spec: 'A2737645',
    fromWarehouse: '成品仓',
    fromLocation: 'A-02-03',
    toLocation: '冲压车间-B线-01号机',
    qty: 1,
    operator: '仓管员王',
    outboundTime: '2026-06-18 07:30',
    sourceOrderNo: 'WO-2026-0618-002',
  },
  {
    id: 'CK-20260617-0007',
    pickingRequestId: 'LL-20260617-0012',
    type: 'repair',
    typeLabel: '维修领料',
    moldId: 'M007',
    moldName: '7667SO成形凹模',
    itemNo: '60024901201007',
    spec: 'A2737667',
    fromWarehouse: '备料仓',
    fromLocation: 'B-02-05',
    toLocation: '工装维修车间',
    qty: 1,
    operator: '仓管员张',
    outboundTime: '2026-06-17 11:00',
    sourceOrderNo: 'WX-2026-0617-005',
  },
]

const TYPE_META: Record<PickingType, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  manufacture: { label: '生产领用', icon: <Factory size={11} />, bg: 'bg-blue-100', text: 'text-blue-700' },
  repair: { label: '维修领料', icon: <Wrench size={11} />, bg: 'bg-red-100', text: 'text-red-700' },
  maintenance: { label: '保养领料', icon: <Shield size={11} />, bg: 'bg-green-100', text: 'text-green-700' },
  outsourcing: { label: '委外发料', icon: <Truck size={11} />, bg: 'bg-orange-100', text: 'text-orange-700' },
  scrap: { label: '报废处置', icon: <Trash2 size={11} />, bg: 'bg-gray-100', text: 'text-gray-700' },
}

const WAREHOUSE_LIST = ['备料仓', '技术仓', '成品仓', '报废仓']

export default function OutboundListPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [detail, setDetail] = useState<OutboundOrder | null>(null)

  const filtered = MOCK_DATA.filter((o) => {
    const matchSearch = !search || o.id.includes(search) || o.moldId.includes(search) || o.moldName.includes(search)
    const matchType = !typeFilter || o.type === typeFilter
    const matchWh = !warehouseFilter || o.fromWarehouse === warehouseFilter
    return matchSearch && matchType && matchWh
  })

  const handlePrint = (order: OutboundOrder) => {
    alert(`打印出库单：${order.id}`)
  }

  const handleExport = () => {
    if (!confirm(`确定导出当前 ${filtered.length} 条出库记录？`)) return
    alert(`已导出 ${filtered.length} 条出库台账`)
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <FileText size={13} className="text-indigo-600" />
          <span className="text-xs text-indigo-800">
            所有出库单由出库执行后自动生成，禁止手动新建 · 支持查看详情、打印单据、导出台账
          </span>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">正式出库单管理</h1>
              <p className="text-[11px] text-gray-500">五类出库统一管理 · 自动生成 · 台账可追溯</p>
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
              <div className="text-[10px] text-blue-500">生产领用工</div>
              <div className="text-sm font-bold text-blue-700">{MOCK_DATA.filter(o => o.type === 'manufacture').length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
            <Wrench size={14} className="text-red-600" />
            <div>
              <div className="text-[10px] text-red-500">维修领料</div>
              <div className="text-sm font-bold text-red-700">{MOCK_DATA.filter(o => o.type === 'repair').length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <Shield size={14} className="text-green-600" />
            <div>
              <div className="text-[10px] text-green-500">保养领料</div>
              <div className="text-sm font-bold text-green-700">{MOCK_DATA.filter(o => o.type === 'maintenance').length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
            <Truck size={14} className="text-orange-600" />
            <div>
              <div className="text-[10px] text-orange-500">委外发料</div>
              <div className="text-sm font-bold text-orange-700">{MOCK_DATA.filter(o => o.type === 'outsourcing').length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <Trash2 size={14} className="text-gray-600" />
            <div>
              <div className="text-[10px] text-gray-500">报废处置</div>
              <div className="text-sm font-bold text-gray-700">{MOCK_DATA.filter(o => o.type === 'scrap').length}</div>
            </div>
          </div>
          <div className="ml-auto text-[11px] text-gray-400">
            合计：<span className="text-gray-700 font-medium text-sm">{MOCK_DATA.length}</span> 条出库记录
          </div>
        </div>

        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-wrap shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="出库单号 / 模具编号 / 模具名称"
              className="border border-gray-200 rounded pl-7 pr-3 py-1.5 text-[12px] w-64 focus:outline-none focus:border-indigo-400 bg-gray-50"
            />
          </div>

          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-32 cursor-pointer hover:border-indigo-300 bg-gray-50">
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
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-28 cursor-pointer hover:border-indigo-300 bg-gray-50">
              <span className={warehouseFilter ? 'text-gray-700' : 'text-gray-400'}>{warehouseFilter || '出库仓库'}</span>
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
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">出库单号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">出库类型</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具编号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具名称</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">品号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">出库仓库</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">库位</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">流向</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">数量</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">源领料单</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作人</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">出库时间</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={13} className="px-4 py-16 text-center text-gray-400">暂无出库记录</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="text-indigo-600 font-medium cursor-pointer hover:underline" onClick={() => setDetail(row)}>
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
                      <td className="px-3 py-2.5 text-gray-700">{row.fromWarehouse}</td>
                      <td className="px-3 py-2.5 text-gray-500">{row.fromLocation}</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.toLocation}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700 font-medium">{row.qty}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-gray-500 font-mono text-[11px] cursor-pointer hover:text-indigo-600">
                          {row.pickingRequestId}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{row.operator}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.outboundTime}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetail(row)}
                            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-indigo-50"
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
            <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">出库单详情</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_META[detail.type].bg} ${TYPE_META[detail.type].text}`}>
                    {detail.typeLabel}
                  </span>
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-6 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">出库单号</span>
                    <span className="text-gray-800 font-medium">{detail.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">对应领料单</span>
                    <span className="text-indigo-600 font-mono">{detail.pickingRequestId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">源单号</span>
                    <span className="text-gray-700 font-mono">{detail.sourceOrderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">出库时间</span>
                    <span className="text-gray-600">{detail.outboundTime}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold text-gray-500 mb-2">模具信息</h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-6 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">模具编号</span>
                      <span className="text-indigo-600 font-medium">{detail.moldId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">模具名称</span>
                      <span className="text-gray-800 font-medium">{detail.moldName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">品号</span>
                      <span className="text-gray-600 font-mono">{detail.itemNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">规格</span>
                      <span className="text-gray-600">{detail.spec}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">数量</span>
                      <span className="text-gray-800 font-medium">{detail.qty}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold text-gray-500 mb-2">仓储信息</h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-6 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">出库仓库</span>
                      <span className="text-gray-800 font-medium">{detail.fromWarehouse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">库位</span>
                      <span className="text-gray-700">{detail.fromLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">流向</span>
                      <span className="text-gray-700">{detail.toLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">操作人</span>
                      <span className="text-gray-700">{detail.operator}</span>
                    </div>
                  </div>
                </div>

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
                  className="px-4 py-1.5 text-sm text-white bg-indigo-500 hover:bg-indigo-600 rounded font-medium flex items-center gap-1"
                >
                  <Printer size={13} /> 打印出库单
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
