'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { Filter, RotateCcw, Save, Download, Upload, RefreshCw, Settings, Plus, Pencil, Eye, Trash2, ChevronDown } from 'lucide-react'

interface TaskGroup {
  id: string
  name: string
  duration: number
  type: string
  mechanism: string
  frequency: string
  startTime: string
  endTime: string
}

const mockGroups: TaskGroup[] = [
  { id: 'TG-001', name: '前保险杠模具预防性维护', duration: 2, type: '预防性维护', mechanism: '单次', frequency: '每季度', startTime: '2026-03-07 17:08', endTime: '2026-03-07 19:09' },
  { id: 'TG-002', name: '仪表盘支架模具点巡检', duration: 1, type: '点巡检', mechanism: '循环', frequency: '每月', startTime: '2026-04-01 09:00', endTime: '2026-04-01 10:00' },
  { id: 'TG-003', name: '车灯外壳模具定期保养', duration: 4, type: '预防性维护', mechanism: '循环', frequency: '每半年', startTime: '2026-05-15 08:00', endTime: '2026-05-15 12:00' },
  { id: 'TG-004', name: '排气管夹具日常点检', duration: 0.5, type: '点巡检', mechanism: '循环', frequency: '每天', startTime: '2026-06-01 08:00', endTime: '2026-06-01 08:30' },
  { id: 'TG-005', name: '变速箱壳体模具季度检修', duration: 6, type: '预防性维护', mechanism: '单次', frequency: '每季度', startTime: '2026-03-20 08:00', endTime: '2026-03-20 14:00' },
]

export default function TaskGroupsPage() {
  const [groups, setGroups] = useState<TaskGroup[]>(mockGroups)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [mechanismFilter, setMechanismFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'预防性维护' | '点巡检'>('预防性维护')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<TaskGroup | null>(null)
  const [form, setForm] = useState({ name: '', duration: '', type: '预防性维护', mechanism: '单次', frequency: '每季度', startTime: '', endTime: '' })

  const filtered = groups.filter((g) => {
    const matchSearch = !search || g.name.includes(search) || g.id.includes(search)
    const matchType = !typeFilter || g.type === typeFilter
    const matchMech = !mechanismFilter || g.mechanism === mechanismFilter
    return matchSearch && matchType && matchMech
  })

  const handleDelete = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
    setShowDeleteConfirm(null)
  }

  const openEdit = (g: TaskGroup) => {
    setEditingGroup(g)
    setForm({ name: g.name, duration: String(g.duration), type: g.type, mechanism: g.mechanism, frequency: g.frequency, startTime: g.startTime, endTime: g.endTime })
    setShowModal(true)
  }

  const openNew = () => {
    setEditingGroup(null)
    setForm({ name: '', duration: '', type: '预防性维护', mechanism: '单次', frequency: '每季度', startTime: '', endTime: '' })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name) return
    if (editingGroup) {
      setGroups((prev) => prev.map((g) => g.id === editingGroup.id ? { ...g, ...form, duration: Number(form.duration) } : g))
    } else {
      const newG: TaskGroup = { id: `TG-00${groups.length + 1}`, name: form.name, duration: Number(form.duration), type: form.type, mechanism: form.mechanism, frequency: form.frequency, startTime: form.startTime, endTime: form.endTime }
      setGroups((prev) => [newG, ...prev])
    }
    setShowModal(false)
  }

  return (
    <MainLayout>
      <div className="p-4 h-full overflow-auto">
        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded p-2.5 mb-4 flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {filtered.length}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="保养项组"
            className="border border-gray-200 rounded px-2.5 py-1.5 text-[13px] w-40 focus:outline-none focus:border-blue-400"
          />
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-[13px] w-32 focus:outline-none focus:border-blue-400 pr-7 bg-white text-gray-600"
            >
              <option value="">类型</option>
              <option>预防性维护</option>
              <option>点巡检</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={mechanismFilter}
              onChange={(e) => setMechanismFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-[13px] w-32 focus:outline-none focus:border-blue-400 pr-7 bg-white text-gray-600"
            >
              <option value="">执行机制</option>
              <option>单次</option>
              <option>循环</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-200 rounded px-2 py-1.5 hover:bg-gray-50">
            <Filter size={12} /> 综合过滤
          </button>
          <button
            onClick={() => { setSearch(''); setTypeFilter(''); setMechanismFilter('') }}
            className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-200 rounded px-2 py-1.5 hover:bg-gray-50"
          >
            <RotateCcw size={12} /> 重置
          </button>
          <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-200 rounded px-2 py-1.5 hover:bg-gray-50">
            <Save size={12} /> 保存
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setActiveTab('预防性维护')}
              className={`text-[12px] px-3 py-1.5 rounded border transition-colors ${activeTab === '预防性维护' ? 'bg-[#1e5fa8] text-white border-[#1e5fa8]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              预防性维护
            </button>
            <button
              onClick={() => setActiveTab('点巡检')}
              className={`text-[12px] px-3 py-1.5 rounded border transition-colors ${activeTab === '点巡检' ? 'bg-[#1e5fa8] text-white border-[#1e5fa8]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              点巡检
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded"><RefreshCw size={14} /></button>
            <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded"><Settings size={14} /></button>
            <button
              onClick={openNew}
              className="w-8 h-8 rounded-full bg-[#1e5fa8] hover:bg-[#1a4f8f] flex items-center justify-center text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded border border-gray-200">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-gray-600 font-medium">保养项组 <span className="text-gray-400 text-[10px]">↕</span></th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">预计时长 (h) <span className="text-gray-400 text-[10px]">↕</span></th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">类型</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">执行机制</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">执行频率</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">开始时间 <span className="text-gray-400 text-[10px]">↕</span></th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">结束时间 <span className="text-gray-400 text-[10px]">↕</span></th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{g.name}</td>
                  <td className="px-4 py-3 text-gray-700">{g.duration}</td>
                  <td className="px-4 py-3 text-gray-700">{g.type}</td>
                  <td className="px-4 py-3 text-gray-700">{g.mechanism}</td>
                  <td className="px-4 py-3 text-gray-700">{g.frequency}</td>
                  <td className="px-4 py-3 text-gray-700">{g.startTime}</td>
                  <td className="px-4 py-3 text-gray-700">{g.endTime}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(g)} className="text-gray-400 hover:text-blue-500 transition-colors"><Pencil size={14} /></button>
                      <Link href={`/maintenance/task-groups/${g.id}`} className="text-gray-400 hover:text-green-500 transition-colors"><Eye size={14} /></Link>
                      <button onClick={() => setShowDeleteConfirm(g.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-3 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500">每页条目数:</span>
              <div className="relative">
                <select className="appearance-none border border-gray-200 rounded px-2 py-1 text-[12px] pr-6 focus:outline-none bg-white">
                  <option>10</option><option>20</option><option>50</option>
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-[12px] font-bold">1</div>
          </div>
        </div>

        {/* Delete confirm */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-2">确认删除</h3>
              <p className="text-[13px] text-gray-600 mb-4">确定要删除该保养项组吗？此操作不可撤销。</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-[13px] border border-gray-200 rounded hover:bg-gray-50">取消</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 text-[13px] bg-red-500 text-white rounded hover:bg-red-600">确认删除</button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[540px] shadow-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-4">{editingGroup ? '编辑保养项组' : '新增保养项组'}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] text-gray-500 mb-1 block">保养项组 *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-[12px] text-gray-500 mb-1 block">预计时长 (h)</label>
                    <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] text-gray-500 mb-1 block">类型</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none bg-gray-50">
                      <option>预防性维护</option><option>点巡检</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] text-gray-500 mb-1 block">执行机制</label>
                    <select value={form.mechanism} onChange={(e) => setForm({ ...form, mechanism: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none bg-gray-50">
                      <option>单次</option><option>循环</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] text-gray-500 mb-1 block">开始时间</label>
                    <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-[12px] text-gray-500 mb-1 block">结束时间</label>
                    <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none bg-gray-50" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowModal(false)} className="px-5 py-2 text-[13px] border border-gray-300 rounded hover:bg-gray-50">取消</button>
                <button onClick={handleSave} className="px-5 py-2 text-[13px] bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">保存</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
