'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Save, Plus, Trash2, Clock, CheckCircle } from 'lucide-react'

const mockTask = {
  id: 'T001',
  moldId: '1',
  moldName: '1',
  process: '车外圆',
  planTime: 2.0,
  actualTime: '',
  status: '进行中',
  isOutsource: false,
  isInspect: false,
  workOrderId: 'WO001',
  assignDate: '2026-06-01',
  workshop: '钳工车间',
  equipment: 'CNC-001',
  technician: '张师傅',
  description: '对模具外圆进行精车加工，确保尺寸公差在 ±0.02mm 以内。',
}

interface ReportEntry {
  id: number
  date: string
  hours: number
  progress: number
  note: string
}

const initReports: ReportEntry[] = [
  { id: 1, date: '2026-06-01', hours: 1.0, progress: 50, note: '完成粗车，待精车' },
]

export default function MyTaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'detail' | 'report'>('detail')
  const [reports, setReports] = useState<ReportEntry[]>(initReports)
  const [newReport, setNewReport] = useState<Omit<ReportEntry, 'id'>>({ date: '', hours: 0, progress: 0, note: '' })
  const [showAddReport, setShowAddReport] = useState(false)

  const totalReported = reports.reduce((s, r) => s + r.hours, 0)
  const latestProgress = reports.length > 0 ? reports[reports.length - 1].progress : 0

  const statusColor: Record<string, string> = {
    '待领取': 'bg-gray-100 text-gray-600',
    '进行中': 'bg-blue-100 text-blue-700',
    '待检': 'bg-purple-100 text-purple-700',
    '已完成': 'bg-green-100 text-green-700',
  }

  const handleAddReport = () => {
    if (!newReport.date || newReport.hours <= 0) return
    setReports((prev) => [...prev, { ...newReport, id: Date.now() }])
    setNewReport({ date: '', hours: 0, progress: 0, note: '' })
    setShowAddReport(false)
  }

  const handleDeleteReport = (id: number) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  const tabs = [
    { key: 'detail', label: '任务详情' },
    { key: 'report', label: '报工记录' },
  ] as const

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
            <h1 className="text-base font-semibold text-gray-800">任务详情</h1>
            <span className={`px-2 py-0.5 text-xs rounded font-medium ${statusColor[mockTask.status] || 'bg-gray-100 text-gray-600'}`}>
              {mockTask.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm rounded transition-colors">
              <CheckCircle size={14} /> 领取任务
            </button>
          </div>
        </div>

        {/* Summary banner */}
        <div className="bg-[#2b3a4a] text-white px-6 py-4 shrink-0">
          <div className="grid grid-cols-6 gap-6 text-sm">
            <div><div className="text-white/60 text-xs mb-1">任务单号</div><div className="font-semibold">{mockTask.id}</div></div>
            <div><div className="text-white/60 text-xs mb-1">模具编号</div><div className="font-semibold">{mockTask.moldId}</div></div>
            <div><div className="text-white/60 text-xs mb-1">工序名称</div><div className="font-semibold">{mockTask.process}</div></div>
            <div><div className="text-white/60 text-xs mb-1">计划工时</div><div className="font-semibold">{mockTask.planTime}h</div></div>
            <div>
              <div className="text-white/60 text-xs mb-1">已报工时</div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-yellow-400" />
                <span className="font-semibold">{totalReported}h</span>
              </div>
            </div>
            <div>
              <div className="text-white/60 text-xs mb-1">完成进度</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/20 rounded overflow-hidden">
                  <div className="h-full bg-green-400 transition-all" style={{ width: `${latestProgress}%` }} />
                </div>
                <span className="text-xs shrink-0">{latestProgress}%</span>
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
              {/* Basic info */}
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">基本信息</h3>
                </div>
                <div className="p-5 grid grid-cols-3 gap-x-8 gap-y-5 text-sm">
                  <InfoRow label="任务单号" value={mockTask.id} />
                  <InfoRow label="关联工单" value={mockTask.workOrderId} />
                  <InfoRow label="模具编号" value={mockTask.moldId} />
                  <InfoRow label="模具名称" value={mockTask.moldName} />
                  <InfoRow label="工序名称" value={mockTask.process} />
                  <InfoRow label="所属车间" value={mockTask.workshop} />
                  <InfoRow label="使用设备" value={mockTask.equipment} />
                  <InfoRow label="负责技工" value={mockTask.technician} />
                  <InfoRow label="分配日期" value={mockTask.assignDate} />
                  <InfoRow label="计划工时" value={`${mockTask.planTime}h`} />
                  <InfoRow label="委外加工" value={mockTask.isOutsource ? '是' : '否'} />
                  <InfoRow label="需要送检" value={mockTask.isInspect ? '是' : '否'} />
                </div>
              </div>
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">任务说明</h3>
                </div>
                <div className="p-5 text-sm text-gray-700 leading-relaxed">{mockTask.description}</div>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Add report button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddReport(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm rounded transition-colors"
                >
                  <Plus size={14} /> 新增报工
                </button>
              </div>

              {/* Add report form */}
              {showAddReport && (
                <div className="bg-white rounded border border-[#0ea5e9] p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">填写报工记录</h3>
                  <div className="grid grid-cols-3 gap-5 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">报工日期 <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={newReport.date}
                        onChange={(e) => setNewReport((p) => ({ ...p, date: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">报工工时(h) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={newReport.hours || ''}
                        onChange={(e) => setNewReport((p) => ({ ...p, hours: parseFloat(e.target.value) || 0 }))}
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">完成进度(%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newReport.progress || ''}
                        onChange={(e) => setNewReport((p) => ({ ...p, progress: parseInt(e.target.value) || 0 }))}
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1.5">备注</label>
                    <textarea
                      rows={2}
                      value={newReport.note}
                      onChange={(e) => setNewReport((p) => ({ ...p, note: e.target.value }))}
                      placeholder="填写本次报工说明..."
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setShowAddReport(false)} className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">取消</button>
                    <button onClick={handleAddReport} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm rounded transition-colors">
                      <Save size={13} /> 保存
                    </button>
                  </div>
                </div>
              )}

              {/* Reports table */}
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">报工记录列表</h3>
                  <span className="text-xs text-gray-500">累计报工 {totalReported}h / 计划 {mockTask.planTime}h</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {['序号', '报工日期', '报工工时(h)', '完成进度', '备注', '操作'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r, idx) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-700">{r.date}</td>
                        <td className="px-4 py-3 text-gray-700">{r.hours}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-200 rounded overflow-hidden">
                              <div className="h-full bg-[#0ea5e9]" style={{ width: `${r.progress}%` }} />
                            </div>
                            <span className="text-xs text-gray-600">{r.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{r.note || '-'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteReport(r.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">暂无报工记录</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
