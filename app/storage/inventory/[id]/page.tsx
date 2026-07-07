'use client'

import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Download, ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react'

const mockMold = {
  id: '1',
  name: '1',
  type: 'T01',
  warehouse: '模具成品仓',
  location: 'A01-001',
  status: '可用',
  qty: 1,
}

const mockHistory = [
  { id: 'H001', type: '入库', date: '2026-03-01', qty: 1, fromTo: '供应商 → 模具成品仓', operator: '仓管员', remark: '新品入库', orderId: 'IN-2026-001' },
  { id: 'H002', type: '出库', date: '2026-04-10', qty: 1, fromTo: '模具成品仓 → 生产车间', operator: '仓管员', remark: '生产领用', orderId: 'OUT-2026-001' },
  { id: 'H003', type: '入库', date: '2026-05-20', qty: 1, fromTo: '生产车间 → 模具成品仓', operator: '仓管员', remark: '生产归还', orderId: 'IN-2026-010' },
]

const typeColors: Record<string, string> = {
  '入库': 'bg-green-100 text-green-700',
  '出库': 'bg-orange-100 text-orange-700',
  '调拨': 'bg-blue-100 text-blue-700',
}

const typeIcons: Record<string, React.ReactNode> = {
  '入库': <ArrowDown size={12} />,
  '出库': <ArrowUp size={12} />,
  '调拨': <ArrowLeftRight size={12} />,
}

export default function InventoryHistoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} /> 返回
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-semibold text-gray-800">库存履历</h1>
            <span className="text-gray-400 text-sm">模具 #{id}</span>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50">
            <Download size={13} /> 导出履历
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-[#f0f2f5]">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Mold info card */}
            <div className="bg-white rounded border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">模具信息</h3>
              </div>
              <div className="p-5 grid grid-cols-4 gap-6 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">模具编号</div>
                  <div className="font-semibold text-gray-800">{mockMold.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">模具名称</div>
                  <div className="font-semibold text-gray-800">{mockMold.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">当前仓库</div>
                  <div className="font-semibold text-gray-800">{mockMold.warehouse}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">库位</div>
                  <div className="font-semibold text-gray-800">{mockMold.location}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">库存状态</div>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                    {mockMold.status}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">当前数量</div>
                  <div className="font-semibold text-gray-800">{mockMold.qty}</div>
                </div>
              </div>
            </div>

            {/* History table */}
            <div className="bg-white rounded border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">出入库履历</h3>
                <span className="text-xs text-gray-500">共 {mockHistory.length} 条记录</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {['流水号', '类型', '日期', '数量', '流向', '操作人', '关联单据', '备注'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockHistory.map((h) => (
                    <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs">{h.id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeColors[h.type] || 'bg-gray-100 text-gray-600'}`}>
                          {typeIcons[h.type]}
                          {h.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{h.date}</td>
                      <td className="px-4 py-3 text-gray-700">{h.qty}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{h.fromTo}</td>
                      <td className="px-4 py-3 text-gray-700">{h.operator}</td>
                      <td className="px-4 py-3 text-blue-500 text-xs">{h.orderId}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{h.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
