'use client'

import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { Plus, Filter, RotateCcw } from 'lucide-react'

const statusCards = [
  { label: '工单总数', value: 3, bg: '#6b7280' },
  { label: '执行中', value: 1, bg: '#0ea5e9' },
  { label: '已完工', value: 1, bg: '#22c55e' },
  { label: '延误', value: 0, bg: '#ef4444' },
]

const mockOrders = [
  { id: 'WO001', moldId: '1', moldName: '1', planQty: 1, process: '钳工车间', planStart: '2026-06-01', planEnd: '2026-06-15', status: '执行中' },
  { id: 'WO002', moldId: '2', moldName: '2', planQty: 1, process: 'CNC车间', planStart: '2026-05-01', planEnd: '2026-05-30', status: '已完成' },
]

const statusColors: Record<string, string> = {
  '已创建': 'bg-gray-100 text-gray-600',
  '执行中': 'bg-blue-100 text-blue-700',
  '已完成': 'bg-green-100 text-green-700',
  '暂停': 'bg-yellow-100 text-yellow-700',
  '延误': 'bg-red-100 text-red-700',
}

export default function WorkOrdersPage() {
  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex gap-2 mb-4">
          {statusCards.map((c) => (
            <div key={c.label} className="flex-1 flex flex-col items-center justify-center py-4 rounded" style={{ backgroundColor: c.bg }}>
              <span className="text-white text-sm font-medium">{c.label}</span>
              <span className="text-white text-2xl font-bold mt-1">{c.value}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded">
          <div className="p-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{mockOrders.length}</div>
            <input type="text" placeholder="工单编号" className="border border-gray-200 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:border-blue-400" />
            <input type="text" placeholder="模工具编号" className="border border-gray-200 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:border-blue-400" />
            <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50"><Filter size={13}/> 综合过滤</button>
            <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50"><RotateCcw size={13}/> 重置</button>
            <div className="flex-1" />
            <Link href="/tasks/work-orders/new" className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded">
              <Plus size={15} /> 新建工单
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['工单编号','模工具编号','模工具名称','计划数量','工作中心','计划开始','计划结束','状态','操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/tasks/work-orders/${o.id}`} className="text-blue-500 hover:underline font-medium">
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.moldId}</td>
                  <td className="px-4 py-3 text-gray-700">{o.moldName}</td>
                  <td className="px-4 py-3 text-gray-700">{o.planQty}</td>
                  <td className="px-4 py-3 text-gray-700">{o.process}</td>
                  <td className="px-4 py-3 text-gray-700">{o.planStart}</td>
                  <td className="px-4 py-3 text-gray-700">{o.planEnd}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/tasks/work-orders/${o.id}`} className="text-xs text-blue-500 hover:underline">查看</Link>
                      <Link href={`/tasks/work-orders/${o.id}/edit`} className="text-xs text-gray-400 hover:text-gray-600">编辑</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}
