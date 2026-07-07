'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Filter, RotateCcw, Plus, Pencil, Trash2, Save, RefreshCw, Settings, ChevronDown, X } from 'lucide-react'

interface Warehouse {
  id: string
  code: string
  name: string
  type: string
  location: string
  capacity: number
  used: number
  manager: string
  status: string
  remark: string
}

const mockWarehouses: Warehouse[] = [
  { id: 'W001', code: 'WH-A01', name: '模具成品仓', type: '成品仓', location: '百达电器新工厂-A区', capacity: 200, used: 136, manager: '张三', status: '启用', remark: '存放成品模具' },
  { id: 'W002', code: 'WH-B01', name: '模具维修仓', type: '维修仓', location: '百达电器新工厂-B区', capacity: 80, used: 42, manager: '李四', status: '启用', remark: '存放待维修及维修中模具' },
  { id: 'W003', code: 'WH-C01', name: '备品仓', type: '备品仓', location: '百达电器新工厂-C区', capacity: 120, used: 65, manager: '王五', status: '启用', remark: '存放模具备用零件' },
  { id: 'W004', code: 'WH-D01', name: '报废仓', type: '报废仓', location: '百达电器新工厂-D区', capacity: 50, used: 12, manager: '赵六', status: '启用', remark: '存放报废模具' },
  { id: 'W005', code: 'WH-E01', name: '测试工厂仓', type: '成品仓', location: '测试工厂', capacity: 100, used: 38, manager: '孙七', status: '禁用', remark: '测试工厂临时仓库' },
]

const warehouseTypes = ['成品仓', '维修仓', '备品仓', '报废仓']
const statuses = ['启用', '禁用']

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', type: '成品仓', location: '', capacity: '', manager: '', status: '启用', remark: '' })

  const filtered = warehouses.filter((w) => {
    const matchSearch = !search || w.name.includes(search) || w.code.includes(search)
    const matchType = !typeFilter || w.type === typeFilter
    const matchStatus = !statusFilter || w.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const openNew = () => {
    setEditingId(null)
    setForm({ code: '', name: '', type: '成品仓', location: '', capacity: '', manager: '', status: '启用', remark: '' })
    setShowModal(true)
  }

  const openEdit = (w: Warehouse) => {
    setEditingId(w.id)
    setForm({ code: w.code, name: w.name, type: w.type, location: w.location, capacity: String(w.capacity), manager: w.manager, status: w.status, remark: w.remark })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.code) return
    if (editingId) {
      setWarehouses((prev) => prev.map((w) => w.id === editingId ? { ...w, ...form, capacity: Number(form.capacity) } : w))
    } else {
      const newW: Warehouse = {
        id: `W00${warehouses.length + 1}`, code: form.code, name: form.name, type: form.type,
        location: form.location, capacity: Number(form.capacity), used: 0, manager: form.manager,
        status: form.status, remark: form.remark,
      }
      setWarehouses((prev) => [newW, ...prev])
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    setWarehouses((prev) => prev.filter((w) => w.id !== id))
    setShowDeleteConfirm(null)
  }

  const toggleStatus = (id: string) => {
    setWarehouses((prev) => prev.map((w) => w.id === id ? { ...w, status: w.status === '启用' ? '禁用' : '启用' } : w))
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
            placeholder="仓库名称/编码"
            className="border border-gray-200 rounded px-2.5 py-1.5 text-[13px] w-40 focus:outline-none focus:border-blue-400"
          />
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-[13px] w-28 focus:outline-none pr-6 bg-white text-gray-600"
            >
              <option value="">类型</option>
              {warehouseTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-[13px] w-24 focus:outline-none pr-6 bg-white text-gray-600"
            >
              <option value="">状态</option>
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>
          <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-200 rounded px-2 py-1.5 hover:bg-gray-50">
            <Filter size={12} /> 综合过滤
          </button>
          <button
            onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter('') }}
            className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-200 rounded px-2 py-1.5 hover:bg-gray-50"
          >
            <RotateCcw size={12} /> 重置
          </button>

          <div className="ml-auto flex items-center gap-2">
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
                <th className="px-4 py-3 text-left text-gray-600 font-medium">仓库编码</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">仓库名称</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">类型</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">所在位置</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">容量</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">已用</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">使用率</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">管理员</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">状态</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">备注</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => {
                const rate = w.capacity > 0 ? Math.round((w.used / w.capacity) * 100) : 0
                return (
                  <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{w.code}</td>
                    <td className="px-4 py-3 text-gray-800">{w.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        w.type === '成品仓' ? 'bg-blue-50 text-blue-700' :
                        w.type === '维修仓' ? 'bg-orange-50 text-orange-700' :
                        w.type === '备品仓' ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-700'
                      }`}>{w.type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{w.location}</td>
                    <td className="px-4 py-3 text-gray-700">{w.capacity}</td>
                    <td className="px-4 py-3 text-gray-700">{w.used}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${rate >= 90 ? 'bg-red-500' : rate >= 70 ? 'bg-orange-400' : 'bg-green-500'}`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-600">{rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{w.manager}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(w.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                          w.status === '启用' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {w.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{w.remark}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(w)} className="text-gray-400 hover:text-blue-500 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setShowDeleteConfirm(w.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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

        {/* Delete Confirm */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-2">确认删除</h3>
              <p className="text-[13px] text-gray-600 mb-4">确定要删除该仓库吗？此操作不可撤销。</p>
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
            <div className="bg-white rounded-lg p-6 w-[600px] shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-800">{editingId ? '编辑仓库' : '新增仓库'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">仓库编码 *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="如: WH-A01" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">仓库名称 *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">类型</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none bg-gray-50">
                    {warehouseTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">所在位置</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">容量</label>
                  <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">管理员</label>
                  <input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">状态</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none bg-gray-50">
                    <option>启用</option><option>禁用</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[12px] text-gray-500 mb-1 block">备注</label>
                  <input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50" />
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
