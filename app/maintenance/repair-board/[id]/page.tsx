'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, CheckCircle, ChevronDown, Clock, AlertTriangle, User, Calendar, FileText, Wrench } from 'lucide-react'

const mockRepairDetail = {
  id: 'R001',
  moldId: '1',
  moldName: '1',
  factory: '百达电器新工厂',
  urgency: '高',
  status: '待响应',
  applicant: 'admin',
  applyDate: '2026-03-06 17:06',
  expectedDate: '2026-03-06 17:06',
  repairReason: '零件磨损',
  reasonRemark: '主要是侧面滑块磨损，影响产品质量。',
  currentLocation: '百达电器新工厂',
  nextProductionDate: '',
  recommendedLife: 1,
  usedCount: 0,
  lastMaintenanceDate: '',
  lastMaintenanceCount: 0,
}

const statusFlow = [
  { key: '待响应', label: '待响应', color: '#f97316', done: true },
  { key: '维修中', label: '维修中', color: '#0ea5e9', done: false },
  { key: '待确认', label: '待确认', color: '#eab308', done: false },
  { key: '已完成', label: '已完成', color: '#22c55e', done: false },
]

export default function RepairOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'detail' | 'process' | 'finish'>('detail')
  const [processForm, setProcessForm] = useState({
    assignee: '',
    estimatedHours: '',
    processNote: '',
  })
  const [finishForm, setFinishForm] = useState({
    actualHours: '',
    result: '',
    parts: '',
    finishNote: '',
  })

  const tabs = [
    { key: 'detail', label: '工单详情' },
    { key: 'process', label: '维修处理' },
    { key: 'finish', label: '完结确认' },
  ] as const

  const urgencyColor: Record<string, string> = {
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
              <ArrowLeft size={16} />
              返回
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-semibold text-gray-800">维修工单详情</h1>
            <span className="px-2 py-0.5 text-xs rounded font-medium bg-orange-100 text-orange-600">{mockRepairDetail.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs text-white font-medium ${urgencyColor[mockRepairDetail.urgency] || 'bg-gray-400'}`}>
              紧急程度：{mockRepairDetail.urgency}
            </span>
          </div>
        </div>

        {/* Status flow */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
          <div className="flex items-center gap-0 max-w-xl">
            {statusFlow.map((step, idx) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 ${
                      step.done ? 'border-transparent' : 'border-gray-200 bg-white'
                    }`}
                    style={step.done ? { backgroundColor: step.color } : {}}
                  >
                    {step.done ? <CheckCircle size={16} /> : <span className="text-gray-400">{idx + 1}</span>}
                  </div>
                  <span className={`text-xs mt-1 ${step.done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < statusFlow.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-5 mx-1 ${step.done ? 'bg-orange-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
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
                  activeTab === tab.key
                    ? 'border-[#0ea5e9] text-[#0ea5e9]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-[#f0f2f5]">
          {activeTab === 'detail' && (
            <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* Mold info */}
              <div className="col-span-2 bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">申请信息</h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <InfoRow icon={<User size={14}/>} label="发起人" value={mockRepairDetail.applicant} />
                  <InfoRow icon={<Calendar size={14}/>} label="申请时间" value={mockRepairDetail.applyDate} />
                  <InfoRow icon={<Clock size={14}/>} label="期望完成日期" value={mockRepairDetail.expectedDate} />
                  <InfoRow icon={<AlertTriangle size={14}/>} label="维修紧急程度" value={mockRepairDetail.urgency} />
                  <InfoRow icon={<Wrench size={14}/>} label="维修原因" value={mockRepairDetail.repairReason} />
                  <InfoRow icon={<FileText size={14}/>} label="原因备注" value={mockRepairDetail.reasonRemark} />
                </div>
              </div>

              {/* Mold summary */}
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">模具信息</h3>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <InfoRow label="模具编号" value={mockRepairDetail.moldId} />
                  <InfoRow label="模具名称" value={mockRepairDetail.moldName} />
                  <InfoRow label="当前位置" value={mockRepairDetail.factory} />
                  <div>
                    <div className="text-xs text-gray-500 mb-1.5">模具寿命</div>
                    <div className="h-4 bg-gray-100 rounded overflow-hidden">
                      <div className="h-full bg-green-500 flex items-center justify-center text-white text-xs" style={{ width: '100%' }}>
                        100%
                      </div>
                    </div>
                  </div>
                  <InfoRow label="已使用次数" value={String(mockRepairDetail.usedCount)} />
                  <InfoRow label="建议寿命" value={String(mockRepairDetail.recommendedLife)} />
                </div>
              </div>

              {/* Status chart */}
              <div className="col-span-3 bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">状态堆叠图</h3>
                </div>
                <div className="p-5">
                  <div className="flex h-6 rounded overflow-hidden">
                    <div className="flex-1 bg-green-500 flex items-center justify-center text-white text-xs">生产中 0%</div>
                    <div className="flex-1 bg-red-500 flex items-center justify-center text-white text-xs">维修中 0%</div>
                    <div className="flex-1 bg-yellow-500 flex items-center justify-center text-white text-xs">保养中 0%</div>
                    <div className="flex-1 bg-blue-500 flex items-center justify-center text-white text-xs">在库 0%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">维修处理</h3>
                </div>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">分配维修人员 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="请输入维修人员姓名"
                        value={processForm.assignee}
                        onChange={(e) => setProcessForm((p) => ({ ...p, assignee: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">预计维修时长（h）</label>
                      <input
                        type="number"
                        placeholder="请输入预计时长"
                        value={processForm.estimatedHours}
                        onChange={(e) => setProcessForm((p) => ({ ...p, estimatedHours: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">处理说明</label>
                    <textarea
                      rows={4}
                      placeholder="请填写处理说明..."
                      value={processForm.processNote}
                      onChange={(e) => setProcessForm((p) => ({ ...p, processNote: e.target.value }))}
                      className="form-input resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => router.back()} className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
                      取消
                    </button>
                    <button className="px-5 py-2 bg-[#f97316] hover:bg-orange-600 text-white text-sm rounded transition-colors font-medium">
                      响应并开始维修
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finish' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">完结确认</h3>
                </div>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">实际维修时长（h） <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        placeholder="请输入实际时长"
                        value={finishForm.actualHours}
                        onChange={(e) => setFinishForm((p) => ({ ...p, actualHours: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">维修结果 <span className="text-red-500">*</span></label>
                      <select
                        value={finishForm.result}
                        onChange={(e) => setFinishForm((p) => ({ ...p, result: e.target.value }))}
                        className="form-input"
                      >
                        <option value="">请选择维修结果</option>
                        <option value="一次修复">一次修复</option>
                        <option value="多次修复">多次修复</option>
                        <option value="无法修复">无法修复</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">更换零件清单</label>
                    <input
                      type="text"
                      placeholder="请填写更换的零件（多个用逗号分隔）"
                      value={finishForm.parts}
                      onChange={(e) => setFinishForm((p) => ({ ...p, parts: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">完结备注</label>
                    <textarea
                      rows={4}
                      placeholder="请填写完结说明..."
                      value={finishForm.finishNote}
                      onChange={(e) => setFinishForm((p) => ({ ...p, finishNote: e.target.value }))}
                      className="form-input resize-none"
                    />
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-700">
                    完结后工单将进入"待确认"状态，由申请人确认后最终关闭。
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => router.back()} className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
                      取消
                    </button>
                    <button className="px-5 py-2 bg-[#22c55e] hover:bg-green-600 text-white text-sm rounded transition-colors font-medium">
                      提交完结确认
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 13px;
          outline: none;
          background: #fafafa;
          transition: border-color 0.15s;
        }
        .form-input:focus {
          border-color: #0ea5e9;
          background: #fff;
        }
      `}</style>
    </MainLayout>
  )
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </div>
      <div className="text-gray-800 font-medium">{value || '-'}</div>
    </div>
  )
}
