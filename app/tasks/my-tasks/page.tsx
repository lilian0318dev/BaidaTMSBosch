'use client'

import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { Filter, RotateCcw, ChevronDown } from 'lucide-react'

const statusCards = [
  { label: '待领取', value: 0, bg: '#6b7280' },
  { label: '进行中', value: 1, bg: '#0ea5e9' },
  { label: '待检', value: 0, bg: '#9333ea' },
  { label: '已完成', value: 2, bg: '#22c55e' },
]

const mockTasks = [
  { id: 'T001', moldId: '1', moldName: '1', process: '车外圆', planTime: 2.0, status: '进行中', isOutsource: false, isInspect: false },
  { id: 'T002', moldId: '2', moldName: '2', process: '磨平面', planTime: 1.5, status: '已完成', isOutsource: false, isInspect: true },
]

const statusColors: Record<string, string> = {
  '待领取': 'bg-gray-100 text-gray-600',
  '进行中': 'bg-blue-100 text-blue-700',
  '待检': 'bg-purple-100 text-purple-700',
  '已完成': 'bg-green-100 text-green-700',
}

export default function MyTasksPage() {
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
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{mockTasks.length}</div>
            <input type="text" placeholder="任务单号" className="border border-gray-200 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:border-blue-400" />
            <input type="text" placeholder="模工具编号" className="border border-gray-200 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:border-blue-400" />
            <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50"><Filter size={13}/> 综合过滤</button>
            <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50"><RotateCcw size={13}/> 重置</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['任务单号','模工具编号','模工具名称','工序名称','计划工时(h)','状态','委外','送检','操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTasks.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/tasks/my-tasks/${t.id}`} className="text-blue-500 hover:underline font-medium">
                      {t.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{t.moldId}</td>
                  <td className="px-4 py-3 text-gray-700">{t.moldName}</td>
                  <td className="px-4 py-3 text-gray-700">{t.process}</td>
                  <td className="px-4 py-3 text-gray-700">{t.planTime}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[t.status] || ''}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.isOutsource ? '是' : '否'}</td>
                  <td className="px-4 py-3 text-gray-600">{t.isInspect ? '是' : '否'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/tasks/my-tasks/${t.id}`} className="text-xs text-blue-500 hover:underline">
                        {t.status === '待领取' ? '领取' : '报工'}
                      </Link>
                      <Link href={`/tasks/my-tasks/${t.id}`} className="text-xs text-gray-400 hover:text-gray-600">
                        查看
                      </Link>
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
