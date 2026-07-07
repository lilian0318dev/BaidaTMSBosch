'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Save, Plus, Trash2, ChevronDown } from 'lucide-react'

const WORKSHOPS = ['钳工车间', 'CNC车间', '电火花车间', '磨床车间', '线切割车间', '装配车间']
const PRIORITIES = ['高', '中', '低']
const MOLDS = [
  { id: '1', name: '1', factory: '百达电器新工厂' },
  { id: '2', name: '2', factory: '百达电器新工厂' },
]

interface WorkProcess {
  id: number
  process: string
  workshop: string
  planHours: number
  seq: number
}

export default function NewWorkOrderPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    moldId: '',
    workshop: '',
    priority: '中',
    planStart: '',
    planEnd: '',
    planQty: 1,
    description: '',
  })
  const [processes, setProcesses] = useState<WorkProcess[]>([
    { id: 1, process: '', workshop: '', planHours: 1.0, seq: 1 },
  ])
  const [moldOpen, setMoldOpen] = useState(false)
  const [workshopOpen, setWorkshopOpen] = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)

  const setField = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }))

  const addProcess = () => {
    setProcesses((p) => [...p, { id: Date.now(), process: '', workshop: '', planHours: 1.0, seq: p.length + 1 }])
  }
  const removeProcess = (id: number) => {
    setProcesses((p) => p.filter((proc) => proc.id !== id).map((proc, i) => ({ ...proc, seq: i + 1 })))
  }
  const updateProcess = (id: number, key: keyof WorkProcess, value: string | number) => {
    setProcesses((p) => p.map((proc) => proc.id === id ? { ...proc, [key]: value } : proc))
  }

  const handleSave = () => {
    router.push('/tasks/work-orders')
  }

  const selectedMold = MOLDS.find((m) => m.id === form.moldId)

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
            <h1 className="text-base font-semibold text-gray-800">新建工单</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              取消
            </button>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm rounded transition-colors">
              <Save size={14} /> 保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-[#f0f2f5]">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Basic info */}
            <div className="bg-white rounded border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">工单信息</h3>
              </div>
              <div className="p-5 grid grid-cols-3 gap-x-6 gap-y-5">
                {/* Mold */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">模具编号 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMoldOpen((v) => !v)}
                      className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50 hover:border-blue-400 text-left"
                    >
                      <span className={selectedMold ? 'text-gray-800' : 'text-gray-400'}>{selectedMold ? `${selectedMold.id} - ${selectedMold.name}` : '选择模具'}</span>
                      <ChevronDown size={13} className="text-gray-400" />
                    </button>
                    {moldOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-md z-20 w-full">
                        {MOLDS.map((m) => (
                          <button key={m.id} onClick={() => { setField('moldId', m.id); setMoldOpen(false) }} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            {m.id} - {m.name} <span className="text-xs text-gray-400 ml-1">({m.factory})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Workshop */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">主工作中心 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setWorkshopOpen((v) => !v)}
                      className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50 hover:border-blue-400 text-left"
                    >
                      <span className={form.workshop ? 'text-gray-800' : 'text-gray-400'}>{form.workshop || '选择工作中心'}</span>
                      <ChevronDown size={13} className="text-gray-400" />
                    </button>
                    {workshopOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-md z-20 w-full">
                        {WORKSHOPS.map((w) => (
                          <button key={w} onClick={() => { setField('workshop', w); setWorkshopOpen(false) }} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">{w}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">优先级</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPriorityOpen((v) => !v)}
                      className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50 hover:border-blue-400 text-left"
                    >
                      <span className="text-gray-800">{form.priority}</span>
                      <ChevronDown size={13} className="text-gray-400" />
                    </button>
                    {priorityOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-md z-20 w-full">
                        {PRIORITIES.map((p) => (
                          <button key={p} onClick={() => { setField('priority', p); setPriorityOpen(false) }} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">{p}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">计划开始 <span className="text-red-500">*</span></label>
                  <input type="date" value={form.planStart} onChange={(e) => setField('planStart', e.target.value)} className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">计划完成 <span className="text-red-500">*</span></label>
                  <input type="date" value={form.planEnd} onChange={(e) => setField('planEnd', e.target.value)} className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">计划数量</label>
                  <input type="number" min="1" value={form.planQty} onChange={(e) => setField('planQty', parseInt(e.target.value) || 1)} className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400" />
                </div>

                <div className="col-span-3">
                  <label className="block text-xs text-gray-500 mb-1.5">工单说明</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="请填写工单说明..." className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 resize-none" />
                </div>
              </div>
            </div>

            {/* Processes */}
            <div className="bg-white rounded border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">工序列表</h3>
                <button onClick={addProcess} className="flex items-center gap-1.5 px-3 py-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs rounded transition-colors">
                  <Plus size={12} /> 添加工序
                </button>
              </div>
              <div className="p-4 space-y-3">
                {processes.map((proc) => (
                  <div key={proc.id} className="flex items-end gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#2b3a4a] flex items-center justify-center text-white text-xs font-bold shrink-0 mb-0.5">
                      {proc.seq}
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">工序名称 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={proc.process}
                          onChange={(e) => updateProcess(proc.id, 'process', e.target.value)}
                          placeholder="如：车外圆"
                          className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">所属车间</label>
                        <input
                          type="text"
                          value={proc.workshop}
                          onChange={(e) => updateProcess(proc.id, 'workshop', e.target.value)}
                          placeholder="如：钳工车间"
                          className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">计划工时(h)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={proc.planHours}
                          onChange={(e) => updateProcess(proc.id, 'planHours', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    {processes.length > 1 && (
                      <button onClick={() => removeProcess(proc.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors mb-0.5">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
