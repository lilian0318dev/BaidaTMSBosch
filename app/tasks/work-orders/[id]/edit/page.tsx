'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Save, ChevronDown, Plus, Trash2, GripVertical, RotateCcw, Info } from 'lucide-react'

const WORKSHOPS = ['钳工车间', 'CNC车间', '电火花车间', '磨床车间', '线切割车间', '装配车间']
const PRIORITIES = ['高', '中', '低']

interface ProcessTask {
  id: string
  seq: string
  name: string
  workshop: string
  planHours: number
  isFromErp: boolean
  isModified: boolean
}

const INITIAL_PROCESSES: ProcessTask[] = [
  { id: 'T001', seq: '0010', name: '车外圆', workshop: '钳工车间', planHours: 2.0, isFromErp: true, isModified: false },
  { id: 'T003', seq: '0020', name: '磨平面', workshop: '磨床车间', planHours: 1.5, isFromErp: true, isModified: false },
  { id: 'T004', seq: '0030', name: '电火花放电', workshop: '电火花车间', planHours: 3.0, isFromErp: true, isModified: false },
]

export default function EditWorkOrderPage() {
  const router = useRouter()
  const params = useParams()
  const [form, setForm] = useState({
    moldId: '1',
    moldName: '1',
    workshop: '钳工车间',
    priority: '高',
    planStart: '2026-06-01',
    planEnd: '2026-06-15',
    planQty: 1,
    description: '对模具1进行完整的修复加工，恢复模具精度至设计要求。包含车外圆、磨平面、电火花放电三道工序。',
  })
  const [workshopOpen, setWorkshopOpen] = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [processes, setProcesses] = useState<ProcessTask[]>(INITIAL_PROCESSES)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const setField = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }))

  const addProcess = () => {
    const newId = 'T' + String(processes.length + 1).padStart(3, '0')
    const newSeq = String((processes.length + 1) * 10).padStart(4, '0')
    setProcesses([
      ...processes,
      { id: newId, seq: newSeq, name: '', workshop: WORKSHOPS[0], planHours: 1.0, isFromErp: false, isModified: false }
    ])
  }

  const removeProcess = (id: string) => {
    const proc = processes.find(p => p.id === id)
    if (proc?.isFromErp) {
      if (!confirm('该工序来源于ERP，删除后仅影响当前工单，确认删除吗？')) return
    }
    setProcesses(processes.filter(p => p.id !== id))
  }

  const updateProcess = (id: string, key: keyof ProcessTask, value: string | number) => {
    setProcesses(processes.map(p => {
      if (p.id !== id) return p
      return { ...p, [key]: value, isModified: p.isFromErp ? true : p.isModified }
    }))
  }

  const moveProcess = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= processes.length) return
    const arr = [...processes]
    const [item] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, item)
    setProcesses(arr.map((p, i) => ({ ...p, seq: String((i + 1) * 10).padStart(4, '0') })))
  }

  const resetProcesses = () => {
    if (!confirm('确认重置为ERP原始工序？所有调整将丢失。')) return
    setProcesses(INITIAL_PROCESSES)
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} /> 返回
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-semibold text-gray-800">编辑工单</h1>
            <span className="text-gray-400 text-sm">#{params.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">取消</button>
            <button onClick={() => router.back()} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm rounded transition-colors">
              <Save size={14} /> 保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-[#f0f2f5] space-y-4">
          <div className="max-w-3xl mx-auto bg-white rounded border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">编辑工单信息</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">模具编号</label>
                <input value={form.moldId} disabled className="w-full border border-gray-100 rounded px-3 py-1.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">模具名称</label>
                <input value={form.moldName} disabled className="w-full border border-gray-100 rounded px-3 py-1.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">主工作中心 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <button type="button" onClick={() => setWorkshopOpen((v) => !v)} className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50 hover:border-blue-400">
                    <span className="text-gray-800">{form.workshop}</span>
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

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">优先级</label>
                <div className="relative">
                  <button type="button" onClick={() => setPriorityOpen((v) => !v)} className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50 hover:border-blue-400">
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

              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1.5">工单说明</label>
                <textarea rows={4} value={form.description} onChange={(e) => setField('description', e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 resize-none" />
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">工序调整</h3>
                <span className="text-xs text-gray-400">（初始工序来源于ERP，可在此调整）</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetProcesses}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <RotateCcw size={12} /> 重置为ERP
                </button>
                <button
                  onClick={addProcess}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  <Plus size={12} /> 添加工序
                </button>
              </div>
            </div>

            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <Info size={13} className="text-amber-600 shrink-0" />
              <span className="text-xs text-amber-700">
                工序初始数据来源于ERP工艺路线。此处调整仅影响当前工单，不改变ERP基础数据。拖动左侧手柄可调整顺序。
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {processes.map((p, idx) => (
                <div
                  key={p.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragIndex !== null && dragIndex !== idx) moveProcess(dragIndex, idx); setDragIndex(null) }}
                  onDragEnd={() => setDragIndex(null)}
                >
                  <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
                    <GripVertical size={16} />
                  </div>

                  <div className="w-12 shrink-0">
                    <input
                      value={p.seq}
                      onChange={(e) => updateProcess(p.id, 'seq', e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono text-center bg-gray-50 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        value={p.name}
                        onChange={(e) => updateProcess(p.id, 'name', e.target.value)}
                        placeholder="工序名称"
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                      />
                      {p.isFromErp && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                          p.isModified ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {p.isModified ? 'ERP·已修改' : 'ERP·原始'}
                        </span>
                      )}
                      {!p.isFromErp && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 shrink-0">
                          新增
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={p.workshop}
                        onChange={(e) => updateProcess(p.id, 'workshop', e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs bg-gray-50 focus:outline-none focus:border-blue-400"
                      >
                        {WORKSHOPS.map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">计划工时</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={p.planHours}
                          onChange={(e) => updateProcess(p.id, 'planHours', parseFloat(e.target.value) || 0)}
                          className="w-16 border border-gray-200 rounded px-2 py-1 text-xs bg-gray-50 focus:outline-none focus:border-blue-400"
                        />
                        <span className="text-xs text-gray-400">h</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveProcess(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveProcess(idx, idx + 1)}
                      disabled={idx === processes.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeProcess(p.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                共 {processes.length} 道工序，其中 ERP 原始 {processes.filter(p => p.isFromErp && !p.isModified).length} 道，
                已修改 {processes.filter(p => p.isFromErp && p.isModified).length} 道，
                新增 {processes.filter(p => !p.isFromErp).length} 道
              </span>
              <span className="text-xs text-gray-500">
                总计划工时：<span className="font-semibold text-gray-700">{processes.reduce((s, p) => s + p.planHours, 0).toFixed(1)} h</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
