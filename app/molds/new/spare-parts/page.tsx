'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Search, Plus, Edit, Trash2, X } from 'lucide-react'

const initialParts: Array<{ id: string; materialNo: string; name: string; life: string; fragile: boolean }> = []

export default function SparePartsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [parts, setParts] = useState(initialParts)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPart, setEditingPart] = useState<typeof initialParts[0] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredParts = parts.filter(
    (p) =>
      p.materialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredParts.length / pageSize))
  const paginatedParts = filteredParts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleAdd = (data: typeof initialParts[0]) => {
    const newPart = { ...data, id: Date.now().toString() }
    setParts([...parts, newPart])
    setShowAddModal(false)
  }

  const handleEdit = (data: typeof initialParts[0]) => {
    setParts(parts.map((p) => (p.id === data.id ? data : p)))
    setShowEditModal(false)
    setEditingPart(null)
  }

  const handleDelete = (id: string) => {
    setParts(parts.filter((p) => p.id !== id))
  }

  const openEditModal = (part: typeof initialParts[0]) => {
    setEditingPart(part)
    setShowEditModal(true)
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} />
              返回模具档案
            </button>
          </div>
          <h1 className="text-base font-semibold text-gray-800">备件清单管理</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              <Plus size={14} />
              新增备件
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">所属模具: 新增模具</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索备件物料号/备件名称..."
                  className="w-64 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                />
                <button className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                  <Search size={14} /> 搜索
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">备件物料号</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">备件名称</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">寿命 (模次)</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">是否易损</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedParts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                        暂无备件数据，点击右上角"新增备件"添加
                      </td>
                    </tr>
                  ) : (
                    paginatedParts.map((part) => (
                      <tr key={part.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{part.materialNo}</td>
                        <td className="px-4 py-3 text-gray-700">{part.name}</td>
                        <td className="px-4 py-3 text-gray-700">{part.life}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              part.fragile
                                ? 'bg-red-100 text-red-600'
                                : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {part.fragile ? '是' : '否'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(part)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="编辑"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(part.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="删除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                共 {filteredParts.length} 条，显示 {filteredParts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredParts.length)} 条
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1 text-xs rounded ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-[400px] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">新增备件</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <FormField label="备件物料号" required>
                  <input type="text" className="form-input" id="add-materialNo" />
                </FormField>
                <FormField label="备件名称" required>
                  <input type="text" className="form-input" id="add-name" />
                </FormField>
                <FormField label="寿命（模次）" required>
                  <input type="number" className="form-input" id="add-life" />
                </FormField>
                <FormField label="是否易损">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5">
                      <input type="radio" name="add-fragile" defaultChecked value="true" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">是</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="radio" name="add-fragile" value="false" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">否</span>
                    </label>
                  </div>
                </FormField>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    const materialNo = (document.getElementById('add-materialNo') as HTMLInputElement).value
                    const name = (document.getElementById('add-name') as HTMLInputElement).value
                    const life = (document.getElementById('add-life') as HTMLInputElement).value
                    const fragile = (document.querySelector('input[name="add-fragile"]:checked') as HTMLInputElement).value === 'true'
                    handleAdd({ id: '', materialNo, name, life, fragile })
                  }}
                  className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-[400px] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">编辑备件</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <FormField label="备件物料号" required>
                  <input type="text" className="form-input" id="edit-materialNo" defaultValue={editingPart.materialNo} />
                </FormField>
                <FormField label="备件名称" required>
                  <input type="text" className="form-input" id="edit-name" defaultValue={editingPart.name} />
                </FormField>
                <FormField label="寿命（模次）" required>
                  <input type="number" className="form-input" id="edit-life" defaultValue={editingPart.life} />
                </FormField>
                <FormField label="是否易损">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5">
                      <input type="radio" name="edit-fragile" checked={editingPart.fragile} value="true" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">是</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="radio" name="edit-fragile" checked={!editingPart.fragile} value="false" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">否</span>
                    </label>
                  </div>
                </FormField>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    const materialNo = (document.getElementById('edit-materialNo') as HTMLInputElement).value
                    const name = (document.getElementById('edit-name') as HTMLInputElement).value
                    const life = (document.getElementById('edit-life') as HTMLInputElement).value
                    const fragile = (document.querySelector('input[name="edit-fragile"]:checked') as HTMLInputElement).value === 'true'
                    handleEdit({ ...editingPart, materialNo, name, life, fragile })
                  }}
                  className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </MainLayout>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}