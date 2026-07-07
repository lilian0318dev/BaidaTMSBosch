'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { Filter, RotateCcw, Save, Download, Upload, RefreshCw, Plus, Pencil, Eye, Trash2, ChevronDown } from 'lucide-react'

const INIT_REASONS = [
  { id: 'RR001', name: '零件磨损', desc: '模具零件因长期使用产生磨损' },
  { id: 'RR002', name: '材料缺陷', desc: '原材料本身存在内部缺陷' },
  { id: 'RR003', name: '尺寸超差', desc: '零件加工后尺寸超出公差范围' },
  { id: 'RR004', name: '配合不良', desc: '装配时零件配合间隙不符合要求' },
  { id: 'RR005', name: '保养不及时', desc: '未按保养计划执行保养导致故障' },
  { id: 'RR006', name: '操作不当', desc: '操作人员未按规程使用模具' },
]

export default function RepairReasonsPage() {
  const [reasons, setReasons] = useState(INIT_REASONS)
  const [searchName, setSearchName] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = reasons.filter((r) => !searchName || r.name.includes(searchName))

  return (
    <MainLayout>
      <div className="p-4 flex flex-col gap-3 h-full">
        <div className="bg-white rounded border border-gray-200 flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2 flex-wrap shrink-0">
            <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold">{filtered.length}</span>
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="维修原因"
              className="border border-gray-300 rounded px-2.5 py-1 text-sm w-36 focus:outline-none focus:border-blue-400"
            />
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="综合过滤"><Filter size={14} /></button>
            <button onClick={() => setSearchName('')} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="重置"><RotateCcw size={14} /></button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="保存"><Save size={14} /></button>
            <div className="flex-1" />
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="导出"><Download size={14} /></button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="导入"><Upload size={14} /></button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="刷新"><RefreshCw size={14} /></button>
            <Link href="/maintenance/repair-reasons/new/edit" className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white" title="新增">
              <Plus size={15} />
            </Link>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 sticky top-0">
                <tr>
                  {['维修原因', '描述', '操作'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-gray-600 font-medium text-[13px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-800 text-[13px] font-medium">{r.name}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-[13px]">{r.desc}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Link href={`/maintenance/repair-reasons/${r.id}/edit`} className="text-gray-400 hover:text-blue-500 transition-colors" title="编辑">
                          <Pencil size={14} />
                        </Link>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors" title="查看">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setDeleteId(r.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="删除">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="py-16 text-center text-gray-400 text-sm">暂无数据</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-3 py-2 border-t border-gray-200 flex items-center gap-2 shrink-0">
            <span className="text-[13px] text-gray-500">每页条目数:</span>
            <div className="relative">
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="appearance-none border border-gray-300 rounded px-2 py-1 text-sm pr-5 bg-white focus:outline-none">
                {[10, 20, 50].map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-1 top-2 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex-1" />
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">1</div>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-80 p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-5">确定要删除该维修原因吗？此操作不可撤销。</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">取消</button>
              <button onClick={() => { setReasons((p) => p.filter((r) => r.id !== deleteId)); setDeleteId(null) }} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
