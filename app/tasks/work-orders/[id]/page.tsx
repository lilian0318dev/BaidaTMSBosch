'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Edit, Printer, ChevronDown } from 'lucide-react'

const mockOrder = {
  id: 'WO001',
  moldId: '1',
  moldName: '1',
  moldType: 'T01',
  factory: '百达电器新工厂',
  planQty: 1,
  actualQty: 0,
  workshop: '钳工车间',
  planStart: '2026-06-01',
  planEnd: '2026-06-15',
  status: '执行中',
  priority: '高',
  creator: 'admin',
  createDate: '2026-05-28',
  description: '对模具1进行完整的修复加工，恢复模具精度至设计要求。包含车外圆、磨平面、电火花放电三道工序。',
  progress: 45,
}

const workTasks = [
  { id: 'T001', process: '车外圆', workshop: '钳工车间', planHours: 2.0, actualHours: 1.0, executor: '张师傅', status: '进行中', isFromErp: true, isModified: false },
  { id: 'T003', process: '磨平面', workshop: '磨床车间', planHours: 1.5, actualHours: 0, executor: '-', status: '待领取', isFromErp: true, isModified: false },
  { id: 'T004', process: '电火花放电', workshop: '电火花车间', planHours: 3.0, actualHours: 0, executor: '-', status: '待领取', isFromErp: true, isModified: false },
]

const taskStatusColors: Record<string, string> = {
  '待领取': 'bg-gray-100 text-gray-600',
  '进行中': 'bg-blue-100 text-blue-700',
  '待检': 'bg-purple-100 text-purple-700',
  '已完成': 'bg-green-100 text-green-700',
}

const tabs = [
  { key: 'detail', label: '工单详情' },
  { key: 'tasks', label: '工序任务' },
  { key: 'history', label: '操作记录' },
] as const

export default function WorkOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'detail' | 'tasks' | 'history'>('detail')

  const statusColor: Record<string, string> = {
    '已创建': 'bg-gray-100 text-gray-600',
    '执行中': 'bg-blue-100 text-blue-700',
    '已完成': 'bg-green-100 text-green-700',
    '暂停': 'bg-yellow-100 text-yellow-700',
    '延误': 'bg-red-100 text-red-700',
  }
  const priorityColor: Record<string, string> = {
    '高': 'bg-red-500',
    '中': 'bg-yellow-500',
    '低': 'bg-green-500',
  }

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
            <h1 className="text-base font-semibold text-gray-800">工单详情</h1>
            <span className={`px-2 py-0.5 text-xs rounded font-medium ${statusColor[mockOrder.status] || 'bg-gray-100 text-gray-600'}`}>
              {mockOrder.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs text-white font-medium ${priorityColor[mockOrder.priority] || 'bg-gray-400'}`}>
              优先级：{mockOrder.priority}
            </span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              <Printer size={14} /> 打印
            </button>
            <Link href={`/tasks/work-orders/${params.id}/edit`} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm rounded transition-colors">
              <Edit size={14} /> 编辑
            </Link>
          </div>
        </div>

        {/* Summary banner */}
        <div className="bg-[#2b3a4a] text-white px-6 py-4 shrink-0">
          <div className="grid grid-cols-6 gap-6 text-sm">
            <div><div className="text-white/60 text-xs mb-1">工单编号</div><div className="font-semibold">{mockOrder.id}</div></div>
            <div><div className="text-white/60 text-xs mb-1">模具编号</div><div className="font-semibold">{mockOrder.moldId}</div></div>
            <div><div className="text-white/60 text-xs mb-1">工作中心</div><div className="font-semibold">{mockOrder.workshop}</div></div>
            <div><div className="text-white/60 text-xs mb-1">计划开始</div><div className="font-semibold">{mockOrder.planStart}</div></div>
            <div><div className="text-white/60 text-xs mb-1">计划完成</div><div className="font-semibold">{mockOrder.planEnd}</div></div>
            <div>
              <div className="text-white/60 text-xs mb-1">执行进度</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/20 rounded overflow-hidden">
                  <div className="h-full bg-green-400" style={{ width: `${mockOrder.progress}%` }} />
                </div>
                <span className="text-xs shrink-0">{mockOrder.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 shrink-0">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-[#f0f2f5]">
          {activeTab === 'detail' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">工单基本信息</h3>
                </div>
                <div className="p-5 grid grid-cols-3 gap-x-8 gap-y-5 text-sm">
                  <InfoRow label="工单编号" value={mockOrder.id} />
                  <InfoRow label="模具编号" value={mockOrder.moldId} />
                  <InfoRow label="模具名称" value={mockOrder.moldName} />
                  <InfoRow label="模具类型" value={mockOrder.moldType} />
                  <InfoRow label="所属工厂" value={mockOrder.factory} />
                  <InfoRow label="工作中心" value={mockOrder.workshop} />
                  <InfoRow label="计划数量" value={String(mockOrder.planQty)} />
                  <InfoRow label="实际完成" value={String(mockOrder.actualQty)} />
                  <InfoRow label="优先级" value={mockOrder.priority} />
                  <InfoRow label="计划开始" value={mockOrder.planStart} />
                  <InfoRow label="计划完成" value={mockOrder.planEnd} />
                  <InfoRow label="创建人" value={mockOrder.creator} />
                  <InfoRow label="创建日期" value={mockOrder.createDate} />
                  <InfoRow label="当前状态" value={mockOrder.status} />
                </div>
              </div>
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">工单说明</h3>
                </div>
                <div className="p-5 text-sm text-gray-700 leading-relaxed">{mockOrder.description}</div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700">工序任务列表</h3>
                    <span className="text-xs text-gray-500">{workTasks.filter(t => t.status === '已完成').length} / {workTasks.length} 道工序已完成</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-gray-500">ERP原始</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-gray-500">已调整</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-gray-500">工单新增</span>
                    </span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-blue-700">
                    工序初始数据来源于ERP工艺路线。工单创建后可根据实际情况调整工序（调整仅影响当前工单）。
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {['任务编号', '工序名称', '来源', '工作车间', '计划工时(h)', '实际工时(h)', '执行人', '状态', '操作'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {workTasks.map((t) => (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/tasks/my-tasks/${t.id}`} className="text-blue-500 hover:underline">
                            {t.id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{t.process}</td>
                        <td className="px-4 py-3">
                          {t.isFromErp && !t.isModified && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                              ERP·原始
                            </span>
                          )}
                          {t.isFromErp && t.isModified && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                              ERP·已调整
                            </span>
                          )}
                          {!t.isFromErp && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                              工单新增
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{t.workshop}</td>
                        <td className="px-4 py-3 text-gray-700">{t.planHours}</td>
                        <td className="px-4 py-3 text-gray-700">{t.actualHours || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{t.executor}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${taskStatusColors[t.status] || ''}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/tasks/my-tasks/${t.id}`} className="text-blue-500 hover:underline text-xs">
                            查看
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">操作记录</h3>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { date: '2026-05-28 09:00', user: 'admin', action: '创建工单', detail: '创建维修工单 WO001' },
                    { date: '2026-05-29 14:30', user: '车间主任', action: '下达工单', detail: '工单已下达至钳工车间' },
                    { date: '2026-06-01 08:00', user: '张师傅', action: '领取任务', detail: '领取工序任务 T001（车外圆）' },
                    { date: '2026-06-01 10:00', user: '张师傅', action: '报工', detail: '完成粗车，报工 1.0h，进度 50%' },
                  ].map((entry, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9] mt-1" />
                        {i < 3 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{entry.action}</span>
                          <span className="text-xs text-gray-400">{entry.date}</span>
                          <span className="text-xs text-gray-500">{entry.user}</span>
                        </div>
                        <div className="text-sm text-gray-600">{entry.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-gray-800 font-medium">{value || '-'}</div>
    </div>
  )
}
