'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Plus, ChevronDown, ChevronRight, Pencil, Trash2,
  Filter, RotateCcw, Download, Search, X, Package,
} from 'lucide-react'

type BomNode = {
  id: string
  code: string
  name: string
  spec: string
  unit: string
  qty: number
  material: string
  level: number
  children?: BomNode[]
}

const BOM_TREE: BomNode[] = [
  {
    id: 'B001', code: 'MD-001', name: '冲压模A型总成', spec: '标准型', unit: '套', qty: 1, material: 'Cr12MoV', level: 0,
    children: [
      {
        id: 'B002', code: 'MD-001-01', name: '上模座', spec: '300×200×80', unit: '件', qty: 1, material: '45#钢', level: 1,
        children: [
          { id: 'B003', code: 'MD-001-01-01', name: '导柱', spec: 'φ32×200', unit: '件', qty: 4, material: 'GCr15', level: 2 },
          { id: 'B004', code: 'MD-001-01-02', name: '模柄', spec: 'φ50×80', unit: '件', qty: 1, material: '45#钢', level: 2 },
        ],
      },
      {
        id: 'B005', code: 'MD-001-02', name: '下模座', spec: '300×200×80', unit: '件', qty: 1, material: '45#钢', level: 1,
        children: [
          { id: 'B006', code: 'MD-001-02-01', name: '导套', spec: 'φ38×60', unit: '件', qty: 4, material: 'GCr15', level: 2 },
          { id: 'B007', code: 'MD-001-02-02', name: '挡料销', spec: 'φ10×30', unit: '件', qty: 2, material: '45#钢', level: 2 },
        ],
      },
      {
        id: 'B008', code: 'MD-001-03', name: '凸模', spec: '标准型', unit: '件', qty: 1, material: 'Cr12MoV', level: 1,
      },
      {
        id: 'B009', code: 'MD-001-04', name: '凹模', spec: '标准型', unit: '件', qty: 1, material: 'Cr12MoV', level: 1,
      },
    ],
  },
  {
    id: 'B010', code: 'MD-002', name: '注塑模B型总成', spec: '热流道型', unit: '套', qty: 1, material: 'P20', level: 0,
    children: [
      {
        id: 'B011', code: 'MD-002-01', name: '定模座板', spec: '400×300×60', unit: '件', qty: 1, material: 'S55C', level: 1,
        children: [
          { id: 'B012', code: 'MD-002-01-01', name: '定位圈', spec: 'φ100×15', unit: '件', qty: 1, material: '45#钢', level: 2 },
          { id: 'B013', code: 'MD-002-01-02', name: '浇口套', spec: 'φ30×80', unit: '件', qty: 1, material: 'Cr12', level: 2 },
        ],
      },
      {
        id: 'B014', code: 'MD-002-02', name: '动模座板', spec: '400×300×60', unit: '件', qty: 1, material: 'S55C', level: 1,
      },
      {
        id: 'B015', code: 'MD-002-03', name: '热流道系统', spec: '4点进胶', unit: '套', qty: 1, material: '—', level: 1,
      },
    ],
  },
]

type DialogMode = 'none' | 'add' | 'edit'

function BomRow({
  node,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: BomNode
  expanded: boolean
  onToggle: (id: string) => void
  onEdit: (node: BomNode) => void
  onDelete: (id: string) => void
  onAddChild: (parentId: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const indent = node.level * 24

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors group">
      <td className="px-3 py-2.5">
        <div style={{ paddingLeft: indent }} className="flex items-center gap-1">
          {hasChildren ? (
            <button onClick={() => onToggle(node.id)} className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
          ) : (
            <span className="w-4 h-4 inline-block" />
          )}
          <Package size={13} className={node.level === 0 ? 'text-blue-500' : node.level === 1 ? 'text-teal-500' : 'text-gray-400'} />
          <span className="text-blue-600 text-[13px] ml-1 font-medium">{node.code}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-[13px] text-gray-700">{node.name}</td>
      <td className="px-3 py-2.5 text-[13px] text-gray-500">{node.spec}</td>
      <td className="px-3 py-2.5 text-[13px] text-gray-500 text-center">{node.unit}</td>
      <td className="px-3 py-2.5 text-[13px] text-gray-700 text-center font-medium">{node.qty}</td>
      <td className="px-3 py-2.5 text-[13px] text-gray-500">{node.material}</td>
      <td className="px-3 py-2.5 text-[12px] text-gray-400 text-center">
        {node.level === 0 ? '顶层' : node.level === 1 ? '一级' : '二级'}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(node.id)}
            className="p-1 text-teal-500 hover:text-teal-700 hover:bg-teal-50 rounded" title="添加子项"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded" title="编辑"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="删除"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function flattenTree(nodes: BomNode[], expandedIds: Set<string>): BomNode[] {
  const result: BomNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children && expandedIds.has(node.id)) {
      result.push(...flattenTree(node.children, expandedIds))
    }
  }
  return result
}

const EMPTY_FORM = { code: '', name: '', spec: '', unit: '件', qty: 1, material: '' }

export default function MoldBomPage() {
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['B001', 'B002', 'B010', 'B011'])
  )
  const [dialog, setDialog] = useState<DialogMode>('none')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const flatRows = flattenTree(BOM_TREE, expandedIds).filter(
    (n) => !search || n.name.includes(search) || n.code.includes(search)
  )

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setParentId(null)
    setDialog('add')
  }
  const openAddChild = (pid: string) => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setParentId(pid)
    setDialog('add')
  }
  const openEdit = (node: BomNode) => {
    setForm({ code: node.code, name: node.name, spec: node.spec, unit: node.unit, qty: node.qty, material: node.material })
    setEditingId(node.id)
    setParentId(null)
    setDialog('edit')
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full p-4 gap-3">
        {/* Toolbar */}
        <div className="bg-white rounded border border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap">
          <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {flatRows.length}
          </span>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索编码或名称"
              className="border border-gray-300 rounded pl-7 pr-2.5 py-1 text-sm w-44 focus:outline-none focus:border-blue-400"
            />
          </div>
          <button className="flex items-center gap-1 text-[13px] text-gray-600 px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50">
            <Filter size={12} /> 筛选
          </button>
          <button
            onClick={() => setSearch('')}
            className="flex items-center gap-1 text-[13px] text-gray-600 px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            <RotateCcw size={12} /> 重置
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1 text-[13px] text-gray-600 p-1.5 hover:bg-gray-100 rounded" title="导出">
            <Download size={14} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1 text-[13px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
          >
            <Plus size={13} /> 新增BOM
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded border border-gray-200 flex-1 overflow-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="border-b border-gray-200 sticky top-0 bg-gray-50">
              <tr>
                {['物料编码', '物料名称', '规格型号', '单位', '数量', '材料', '层级', '操作'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-gray-600 font-medium text-[13px] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flatRows.map((node) => (
                <BomRow
                  key={node.id}
                  node={node}
                  expanded={expandedIds.has(node.id)}
                  onToggle={toggleExpand}
                  onEdit={openEdit}
                  onDelete={() => {}}
                  onAddChild={openAddChild}
                />
              ))}
              {flatRows.length === 0 && (
                <tr><td colSpan={8} className="py-16 text-center text-gray-400 text-sm">暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      {dialog !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[480px]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 text-[15px]">
                {dialog === 'add' ? (parentId ? '添加子物料' : '新增BOM物料') : '编辑BOM物料'}
              </h3>
              <button onClick={() => setDialog('none')} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                { label: '物料编码', key: 'code', placeholder: '如 MD-001-01' },
                { label: '物料名称', key: 'name', placeholder: '如 上模座' },
                { label: '规格型号', key: 'spec', placeholder: '如 300×200×80' },
                { label: '材料', key: 'material', placeholder: '如 45#钢' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-[12px] text-gray-500 mb-1">{label}</label>
                  <input
                    value={(form as Record<string, string | number>)[key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[12px] text-gray-500 mb-1">单位</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                >
                  {['件', '套', '个', '组', '块', '片'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] text-gray-500 mb-1">数量</label>
                <input
                  type="number"
                  min={1}
                  value={form.qty}
                  onChange={(e) => setForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setDialog('none')} className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors">取消</button>
              <button onClick={() => setDialog('none')} className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
