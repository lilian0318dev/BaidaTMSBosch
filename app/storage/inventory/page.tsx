'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { RotateCcw, ChevronDown, RefreshCw, Settings, Search } from 'lucide-react'

const WAREHOUSE_LIST = ['模具成品仓', '模具备件仓', '待修仓', '待保养仓', '报废仓', '现场仓', '原材料仓']

interface InventoryItem {
  id: string
  toolingNo?: string
  productCode: string
  productName: string
  spec: string
  warehouse: string
  location: string
  qty: number
  lastInDate: string
  lastOutDate?: string
  status: string
  inBoundCount: number
  outBoundCount: number
}

const mockInventory: InventoryItem[] = [
  { id: 'IN-001', toolingNo: 'MJ-2024-001', productCode: 'PG-A001', productName: '冲压模具-下模A', spec: '200x150x80', warehouse: '模具成品仓', location: 'A01-01', qty: 1, lastInDate: '2026-06-18', status: '在库', inBoundCount: 3, outBoundCount: 2 },
  { id: 'IN-002', toolingNo: 'MJ-2024-089', productCode: 'PG-B023', productName: '注塑模具-定模', spec: '400x300x120', warehouse: '模具成品仓', location: 'A02-03', qty: 1, lastInDate: '2026-06-16', status: '在库', inBoundCount: 2, outBoundCount: 1 },
  { id: 'IN-003', productCode: 'BJ-C101', productName: '模具备件-导套', spec: 'D30x150', warehouse: '模具备件仓', location: 'B01-05', qty: 20, lastInDate: '2026-06-17', status: '在库', inBoundCount: 5, outBoundCount: 3 },
  { id: 'IN-004', productCode: 'BJ-D205', productName: '模具备件-润滑脂', spec: '500g', warehouse: '模具备件仓', location: 'B02-08', qty: 15, lastInDate: '2026-06-10', status: '在库', inBoundCount: 2, outBoundCount: 1 },
  { id: 'IN-005', toolingNo: 'MJ-2023-058', productCode: 'PG-E089', productName: '注塑模具-型腔B', spec: '300x200x100', warehouse: '现场仓', location: 'F01-02', qty: 1, lastInDate: '2026-06-15', lastOutDate: '2026-06-18', status: '使用中', inBoundCount: 4, outBoundCount: 4 },
  { id: 'IN-006', toolingNo: 'MJ-2024-023', productCode: 'PG-F156', productName: '压铸模具-动模', spec: '250x180x90', warehouse: '现场仓', location: 'F02-01', qty: 1, lastInDate: '2026-06-10', lastOutDate: '2026-06-17', status: '使用中', inBoundCount: 3, outBoundCount: 3 },
  { id: 'IN-007', toolingNo: 'MJ-2022-147', productCode: 'PG-A088', productName: '冲压模具-上模C', spec: '180x140x70', warehouse: '待修仓', location: 'D01-02', qty: 1, lastInDate: '2026-06-18', status: '待维修', inBoundCount: 8, outBoundCount: 8 },
  { id: 'IN-008', productCode: 'YC-E301', productName: '原材料-钢板', spec: 'T10-20mm', warehouse: '原材料仓', location: 'C01-15', qty: 50, lastInDate: '2026-06-10', status: '在库', inBoundCount: 6, outBoundCount: 3 },
  { id: 'IN-009', toolingNo: 'MJ-2020-047', productCode: 'PG-G007', productName: '老旧模具-型腔', spec: '350x250x100', warehouse: '报废仓', location: 'E01-01', qty: 1, lastInDate: '2026-06-16', status: '待报废', inBoundCount: 10, outBoundCount: 9 },
  { id: 'IN-010', productCode: 'PG-H202', productName: '冲压模具-凹模', spec: '220x160x85', warehouse: '待保养仓', location: 'E02-03', qty: 1, lastInDate: '2026-06-15', status: '待保养', inBoundCount: 7, outBoundCount: 7 },
]

const statusColors: Record<string, string> = {
  '在库': 'bg-green-50 text-green-700',
  '使用中': 'bg-blue-50 text-blue-700',
  '待维修': 'bg-orange-50 text-orange-700',
  '待保养': 'bg-amber-50 text-amber-700',
  '待报废': 'bg-red-50 text-red-700',
}

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = mockInventory.filter((r) => {
    const matchSearch = !search || r.id.includes(search) || (r.toolingNo && r.toolingNo.includes(search)) || r.productCode.includes(search) || r.productName.includes(search)
    const matchWh = !warehouseFilter || r.warehouse === warehouseFilter
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchWh && matchStatus
  })

  // 统计
  const stats = {
    total: filtered.length,
    totalQty: filtered.reduce((sum, r) => sum + r.qty, 0),
    inUse: filtered.filter((r) => r.status === '使用中').length,
    inStock: filtered.filter((r) => r.status === '在库').length,
    needRepair: filtered.filter((r) => r.status === '待维修').length,
    needMaintain: filtered.filter((r) => r.status === '待保养').length,
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-[#f5f6f8]">
        {/* 工具栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1 mr-2">
            <Search size={14} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">库存台账</span>
          </div>
          <div className="w-px h-4 bg-gray-200 mx-1" />

          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{filtered.length}</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="台账编号 / 工装编号 / 品号 / 品名"
            className="border border-gray-200 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-400 bg-gray-50"
          />
          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm w-36 cursor-pointer hover:border-blue-300 bg-gray-50">
              <span className={warehouseFilter ? 'text-gray-700' : 'text-gray-400'}>{warehouseFilter || '仓库'}</span>
            </button>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="">全部</option>
              {WAREHOUSE_LIST.map((w) => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm w-28 cursor-pointer hover:border-blue-300 bg-gray-50">
              <span className={statusFilter ? 'text-gray-700' : 'text-gray-400'}>{statusFilter || '状态'}</span>
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="">全部</option>
              <option>在库</option>
              <option>使用中</option>
              <option>待维修</option>
              <option>待保养</option>
              <option>待报废</option>
            </select>
          </div>
          <button
            onClick={() => { setSearch(''); setWarehouseFilter(''); setStatusFilter('') }}
            className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50 bg-white"
          >
            <RotateCcw size={12} /> 重置
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded bg-white"><RefreshCw size={13} /></button>
            <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded bg-white"><Settings size={13} /></button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-auto p-4">
          {/* 统计卡片 */}
          <div className="grid grid-cols-6 gap-3 mb-4">
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">物料总数</div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">库存数量</div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalQty}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">在库</div>
              <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">使用中</div>
              <div className="text-2xl font-bold text-blue-600">{stats.inUse}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">待维修</div>
              <div className="text-2xl font-bold text-orange-600">{stats.needRepair}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-[11px] text-gray-500 mb-1">待保养</div>
              <div className="text-2xl font-bold text-amber-600">{stats.needMaintain}</div>
            </div>
          </div>

          {/* 列表 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[
                    '台账编号', '工装编号', '品号', '品名', '规格',
                    '所在仓库', '库位', '数量', '最近入库', '最近出库',
                    '入库次数', '出库次数', '状态'
                  ].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={13} className="px-4 py-12 text-center text-xs text-gray-400">暂无库存记录</td></tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 text-[12px] font-medium text-[#1e5fa8]">{r.id}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-700">{r.toolingNo || <span className="text-gray-300">-</span>}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-700">{r.productCode}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-800 font-medium">{r.productName}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-500">{r.spec}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-700">{r.warehouse}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600">{r.location}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-700 font-medium">{r.qty}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600 whitespace-nowrap">{r.lastInDate}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600 whitespace-nowrap">{r.lastOutDate || '-'}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600">{r.inBoundCount}</td>
                      <td className="px-3 py-2.5 text-[12px] text-gray-600">{r.outBoundCount}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
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
      </div>
    </MainLayout>
  )
}
