'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  RotateCcw, Plus, Pencil, Trash2, RefreshCw, Settings,
  ChevronDown, ChevronRight, X, Building2, Layers, MapPin, Search,
} from 'lucide-react'

// ---------- Types ----------
type LevelType = 'warehouse' | 'location'

interface WarehouseNode {
  id: string; code: string; name: string; type: string
  location: string; capacity: number; used: number; manager: string; status: string; remark: string
}
interface LocationNode {
  id: string; warehouseId: string; code: string; name: string
  type: string; capacity: number; used: number; status: string; remark: string
}

// ---------- Mock Data (两层：仓库 + 库位，直接挂在仓库下) ----------
const initWarehouses: WarehouseNode[] = [
  { id: 'W001', code: 'CP-C01', name: '模具成品仓', type: '成品仓', location: '百达电器新工厂-A区', capacity: 200, used: 136, manager: '张三', status: '启用', remark: '存放完工模具' },
  { id: 'W002', code: 'BJ-C01', name: '模具备件仓', type: '备件仓', location: '百达电器新工厂-B区', capacity: 150, used: 72, manager: '李四', status: '启用', remark: '存放模具备件' },
  { id: 'W003', code: 'XF-C01', name: '待修仓', type: '待修仓', location: '百达电器新工厂-D区', capacity: 80, used: 32, manager: '赵六', status: '启用', remark: '退修模具暂存' },
  { id: 'W004', code: 'XB-C01', name: '待保养仓', type: '待保养仓', location: '百达电器新工厂-E区', capacity: 60, used: 18, manager: '孙七', status: '启用', remark: '退保模具暂存' },
  { id: 'W005', code: 'FB-C01', name: '报废仓', type: '报废仓', location: '百达电器新工厂-F区', capacity: 50, used: 8, manager: '周八', status: '启用', remark: '报废模具暂存' },
  { id: 'W006', code: 'XC-C01', name: '现场仓', type: '现场仓', location: '百达电器新工厂-生产车间', capacity: 120, used: 65, manager: '吴九', status: '启用', remark: '产线在用模具' },
]

const initLocations: LocationNode[] = [
  { id: 'L001', warehouseId: 'W001', code: 'CP-A01-001', name: 'A1-01号位', type: '货架位', capacity: 10, used: 8, status: '启用', remark: '' },
  { id: 'L002', warehouseId: 'W001', code: 'CP-A01-002', name: 'A1-02号位', type: '货架位', capacity: 10, used: 7, status: '启用', remark: '' },
  { id: 'L003', warehouseId: 'W001', code: 'CP-A02-001', name: 'A2-01号位', type: '货架位', capacity: 10, used: 9, status: '启用', remark: '' },
  { id: 'L004', warehouseId: 'W002', code: 'BJ-B01-001', name: 'B1-01号位', type: '货架位', capacity: 20, used: 12, status: '启用', remark: '' },
  { id: 'L005', warehouseId: 'W003', code: 'XF-D01-001', name: 'D1-01号位', type: '地面位', capacity: 20, used: 15, status: '启用', remark: '' },
  { id: 'L006', warehouseId: 'W004', code: 'XB-E01-001', name: 'E1-01号位', type: '地面位', capacity: 15, used: 8, status: '启用', remark: '' },
]

const warehouseTypes = ['成品仓', '备件仓', '待修仓', '待保养仓', '报废仓', '现场仓']
const locationTypes = ['货架位', '地面位', '立体库位', '特殊位']

// ---------- Helpers ----------
function UsageBar({ used, capacity }: { used: number; capacity: number }) {
  const rate = capacity > 0 ? Math.round((used / capacity) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${rate >= 90 ? 'bg-red-500' : rate >= 70 ? 'bg-orange-400' : 'bg-green-500'}`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-[11px] text-gray-500">{rate}%</span>
    </div>
  )
}

function StatusBadge({ status, onClick }: { status: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
        status === '启用' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {status}
    </button>
  )
}

// ---------- Modal ----------
interface ModalField { key: string; label: string; required?: boolean; type?: string; options?: string[] }

function FormModal({
  title, fields, form, onFormChange, onSave, onClose,
}: {
  title: string
  fields: ModalField[]
  form: Record<string, string>
  onFormChange: (f: Record<string, string>) => void
  onSave: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[560px] shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={17} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.key} className={f.type === 'textarea' ? 'col-span-2' : ''}>
              <label className="text-[11px] text-gray-500 mb-1 block">{f.label}{f.required && ' *'}</label>
              {f.options ? (
                <select
                  value={form[f.key] ?? ''}
                  onChange={(e) => onFormChange({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-[13px] focus:outline-none bg-gray-50"
                >
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={form[f.key] ?? ''}
                  onChange={(e) => onFormChange({ ...form, [f.key]: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-[13px] focus:outline-none bg-gray-50 resize-none"
                />
              ) : (
                <input
                  type={f.type ?? 'text'}
                  value={form[f.key] ?? ''}
                  onChange={(e) => onFormChange({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-1.5 text-[13px] border border-gray-300 rounded hover:bg-gray-50">取消</button>
          <button onClick={onSave} className="px-4 py-1.5 text-[13px] bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">保存</button>
        </div>
      </div>
    </div>
  )
}

// ---------- Tree Node ----------
function TreeItem({
  icon, label, code, count, selected, expanded, hasChildren,
  onSelect, onToggle, indent,
}: {
  icon: React.ReactNode; label: string; code: string; count: number; selected: boolean; expanded: boolean
  hasChildren: boolean; onSelect: () => void; onToggle: () => void; indent: number
}) {
  return (
    <div
      onClick={onSelect}
      style={{ paddingLeft: `${indent * 14 + 8}px` }}
      className={`flex items-center gap-1.5 py-2 pr-3 cursor-pointer rounded transition-colors text-[12px] ${
        selected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {hasChildren ? (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      ) : (
        <span className="w-3 shrink-0" />
      )}
      <span className={`shrink-0 ${selected ? 'text-blue-500' : 'text-gray-400'}`}>{icon}</span>
      <span className="truncate flex-1">{label}</span>
      <span className={`text-[10px] px-1 py-0.5 rounded shrink-0 ${selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>{count}</span>
    </div>
  )
}

// ============================================================
// Main Page
// ============================================================
export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<WarehouseNode[]>(initWarehouses)
  const [locations, setLocations] = useState<LocationNode[]>(initLocations)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({ W001: true, W002: false, W004: false })
  const [selected, setSelected] = useState<{ level: LevelType; id: string } | null>({ level: 'warehouse', id: 'W001' })
  const [treeSearch, setTreeSearch] = useState('')

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [modal, setModal] = useState<{ level: LevelType; editing: string | null } | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<{ level: LevelType; id: string } | null>(null)

  const activeLevel: LevelType = selected?.level ?? 'warehouse'

  const tableRows = (() => {
    if (!selected) return warehouses
    if (selected.level === 'warehouse') return warehouses
    return locations.filter((l) => l.warehouseId === selected.id)
  })()

  const filtered = (tableRows as (WarehouseNode | LocationNode)[]).filter((row) => {
    const name = (row as WarehouseNode).name
    const code = (row as WarehouseNode).code
    const type = (row as WarehouseNode).type
    const status = (row as WarehouseNode).status
    const ms = !search || name.includes(search) || code.includes(search)
    const mt = !typeFilter || type === typeFilter
    const mst = !statusFilter || status === statusFilter
    return ms && mt && mst
  })

  const toggleWarehouse = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  const genId = (prefix: string) => `${prefix}${Date.now()}`

  const openModal = (level: LevelType, editing: string | null, defaults?: Record<string, string>) => {
    setModal({ level, editing })
    if (editing) {
      if (level === 'warehouse') {
        const w = warehouses.find((x) => x.id === editing)!
        setForm({ code: w.code, name: w.name, type: w.type, location: w.location, capacity: String(w.capacity), manager: w.manager, status: w.status, remark: w.remark })
      } else {
        const l = locations.find((x) => x.id === editing)!
        setForm({ code: l.code, name: l.name, type: l.type, capacity: String(l.capacity), status: l.status, remark: l.remark })
      }
    } else {
      setForm({ status: '启用', type: level === 'warehouse' ? '成品仓' : '货架位', capacity: '10', ...defaults })
    }
  }

  const handleSave = () => {
    if (!modal) return
    const { level, editing } = modal
    if (level === 'warehouse') {
      if (editing) {
        setWarehouses((p) => p.map((w) => w.id === editing ? { ...w, ...form, capacity: Number(form.capacity) } : w))
      } else {
        const nw: WarehouseNode = { id: genId('W'), code: form.code, name: form.name, type: form.type, location: form.location ?? '', capacity: Number(form.capacity), used: 0, manager: form.manager ?? '', status: form.status, remark: form.remark ?? '' }
        setWarehouses((p) => [...p, nw])
      }
    } else {
      const parentWarehouseId = selected!.id
      if (editing) {
        setLocations((p) => p.map((l) => l.id === editing ? { ...l, ...form, capacity: Number(form.capacity) } : l))
      } else {
        const nl: LocationNode = { id: genId('L'), warehouseId: parentWarehouseId, code: form.code, name: form.name, type: form.type, capacity: Number(form.capacity), used: 0, status: form.status, remark: form.remark ?? '' }
        setLocations((p) => [...p, nl])
      }
    }
    setModal(null)
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    const { level, id } = deleteConfirm
    if (level === 'warehouse') setWarehouses((p) => p.filter((w) => w.id !== id))
    else setLocations((p) => p.filter((l) => l.id !== id))
    setDeleteConfirm(null)
  }

  const toggleRowStatus = (level: LevelType, id: string) => {
    if (level === 'warehouse') setWarehouses((p) => p.map((w) => w.id === id ? { ...w, status: w.status === '启用' ? '禁用' : '启用' } : w))
    else setLocations((p) => p.map((l) => l.id === id ? { ...l, status: l.status === '启用' ? '禁用' : '启用' } : l))
  }

  const levelLabel: Record<LevelType, string> = { warehouse: '仓库', location: '库位' }
  const levelTypeOptions: Record<LevelType, string[]> = { warehouse: warehouseTypes, location: locationTypes }

  const warehouseFields: ModalField[] = [
    { key: 'code', label: '仓库编码', required: true },
    { key: 'name', label: '仓库名称', required: true },
    { key: 'type', label: '仓库类型', options: warehouseTypes },
    { key: 'location', label: '所在位置' },
    { key: 'capacity', label: '容量', type: 'number' },
    { key: 'manager', label: '管理员' },
    { key: 'status', label: '状态', options: ['启用', '禁用'] },
    { key: 'remark', label: '备注', type: 'textarea' },
  ]
  const locationFields: ModalField[] = [
    { key: 'code', label: '库位编码', required: true },
    { key: 'name', label: '库位名称', required: true },
    { key: 'type', label: '库位类型', options: locationTypes },
    { key: 'capacity', label: '容量', type: 'number' },
    { key: 'status', label: '状态', options: ['启用', '禁用'] },
    { key: 'remark', label: '备注', type: 'textarea' },
  ]
  const modalFields: Record<LevelType, ModalField[]> = { warehouse: warehouseFields, location: locationFields }

  const renderWarehouseRow = (row: WarehouseNode) => (
    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-3 py-2.5 text-[12px] font-medium text-[#1e5fa8]">{row.code}</td>
      <td className="px-3 py-2.5 text-[13px] text-gray-800">{row.name}</td>
      <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${row.type === '成品仓' ? 'bg-blue-50 text-blue-700' : row.type === '备件仓' ? 'bg-cyan-50 text-cyan-700' : row.type === '原材料仓' ? 'bg-teal-50 text-teal-700' : row.type === '待修仓' ? 'bg-orange-50 text-orange-700' : row.type === '待保养仓' ? 'bg-yellow-50 text-yellow-700' : row.type === '报废仓' ? 'bg-red-50 text-red-700' : 'bg-purple-50 text-purple-700'}`}>{row.type}</span></td>
      <td className="px-3 py-2.5 text-[12px] text-gray-600">{row.location}</td>
      <td className="px-3 py-2.5 text-[12px] text-gray-600">{row.capacity}</td>
      <td className="px-3 py-2.5 text-[12px] text-gray-600">{row.used}</td>
      <td className="px-3 py-2.5"><UsageBar used={row.used} capacity={row.capacity} /></td>
      <td className="px-3 py-2.5 text-[12px] text-gray-600">{row.manager}</td>
      <td className="px-3 py-2.5"><StatusBadge status={row.status} onClick={() => toggleRowStatus('warehouse', row.id)} /></td>
      <td className="px-3 py-2.5 text-[11px] text-gray-400 max-w-[120px] truncate">{row.remark}</td>
      <td className="px-3 py-2.5">
        <div className="flex gap-2">
          <button onClick={() => openModal('warehouse', row.id)} className="text-gray-400 hover:text-blue-500"><Pencil size={13} /></button>
          <button onClick={() => setDeleteConfirm({ level: 'warehouse', id: row.id })} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  )

  const renderLocationRow = (row: LocationNode) => (
    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-3 py-2.5 text-[12px] font-medium text-[#1e5fa8]">{row.code}</td>
      <td className="px-3 py-2.5 text-[13px] text-gray-800">{row.name}</td>
      <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 rounded text-[11px] bg-teal-50 text-teal-700">{row.type}</span></td>
      <td className="px-3 py-2.5 text-[12px] text-gray-600">{warehouses.find((w) => w.id === row.warehouseId)?.name ?? '-'}</td>
      <td className="px-3 py-2.5 text-[12px] text-gray-600">{row.capacity}</td>
      <td className="px-3 py-2.5 text-[12px] text-gray-600">{row.used}</td>
      <td className="px-3 py-2.5"><UsageBar used={row.used} capacity={row.capacity} /></td>
      <td className="px-3 py-2.5"><StatusBadge status={row.status} onClick={() => toggleRowStatus('location', row.id)} /></td>
      <td className="px-3 py-2.5 text-[11px] text-gray-400 max-w-[120px] truncate">{row.remark}</td>
      <td className="px-3 py-2.5">
        <div className="flex gap-2">
          <button onClick={() => openModal('location', row.id)} className="text-gray-400 hover:text-blue-500"><Pencil size={13} /></button>
          <button onClick={() => setDeleteConfirm({ level: 'location', id: row.id })} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  )

  const tableHeaders = {
    warehouse: ['仓库编码', '仓库名称', '类型', '所在位置', '容量', '已用', '使用率', '管理员', '状态', '备注', '操作'],
    location: ['库位编码', '库位名称', '类型', '所属仓库', '容量', '已用', '使用率', '状态', '备注', '操作'],
  }

  const locationCountForWarehouse = (wid: string) => locations.filter((l) => l.warehouseId === wid).length
  const addChildLevel: Record<LevelType, LevelType | null> = { warehouse: 'location', location: null }
  const currentAddChildLabel: Record<LevelType, string> = { warehouse: '新增库位', location: '' }

  return (
    <MainLayout>
      <div className="flex h-full overflow-hidden">
        {/* ===== Left Tree Panel ===== */}
        <div className="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                placeholder="搜索仓库/库区/库位"
                className="w-full pl-7 pr-3 py-1.5 text-[12px] border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-1.5 px-1">
            {warehouses
              .filter((w) => !treeSearch || w.name.includes(treeSearch) || w.code.includes(treeSearch))
              .map((w) => {
                const wExpanded = expanded[w.id]
                const wLocs = locations.filter((l) => l.warehouseId === w.id)
                return (
                  <div key={w.id}>
                    <TreeItem
                      icon={<Building2 size={13} />}
                      label={w.name}
                      code={w.code}
                      count={locationCountForWarehouse(w.id)}
                      selected={selected?.level === 'warehouse' && selected?.id === w.id}
                      expanded={wExpanded}
                      hasChildren={wLocs.length > 0}
                      onSelect={() => setSelected({ level: 'warehouse', id: w.id })}
                      onToggle={() => toggleWarehouse(w.id)}
                      indent={0}
                    />
                    {wExpanded && wLocs.map((l) => (
                      <TreeItem
                        key={l.id}
                        icon={<MapPin size={11} />}
                        label={l.name}
                        code={l.code}
                        count={0}
                        selected={selected?.level === 'location' && selected?.id === l.id}
                        expanded={false}
                        hasChildren={false}
                        onSelect={() => setSelected({ level: 'location', id: l.id })}
                        onToggle={() => {}}
                        indent={1}
                      />
                    ))}
                  </div>
                )
              })}
          </div>

          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => openModal('warehouse', null)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[12px] text-[#1e5fa8] border border-[#1e5fa8] border-dashed rounded hover:bg-blue-50 transition-colors"
            >
              <Plus size={12} /> 新增仓库
            </button>
          </div>
        </div>

        {/* ===== Right Table Panel ===== */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f6f8]">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-1 mr-2">
              {(['warehouse', 'location'] as LevelType[]).map((lvl, i) => (
                <span key={lvl} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-300 text-[11px]">/</span>}
                  <span className={`text-[12px] font-medium px-2 py-0.5 rounded ${activeLevel === lvl ? 'bg-blue-50 text-blue-700' : 'text-gray-400'}`}>
                    {levelLabel[lvl]}
                  </span>
                </span>
              ))}
            </div>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{filtered.length}</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`搜索${levelLabel[activeLevel]}`}
              className="border border-gray-200 rounded px-2.5 py-1.5 text-[12px] w-36 focus:outline-none focus:border-blue-400 bg-gray-50"
            />
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-[12px] w-28 focus:outline-none pr-5 bg-gray-50 text-gray-600"
              >
                <option value="">类型</option>
                {levelTypeOptions[activeLevel].map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={10} className="absolute right-1.5 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-[12px] w-20 focus:outline-none pr-5 bg-gray-50 text-gray-600"
              >
                <option value="">状态</option>
                <option>启用</option><option>禁用</option>
              </select>
              <ChevronDown size={10} className="absolute right-1.5 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            <button onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter('') }}
              className="flex items-center gap-1 text-[11px] text-gray-600 border border-gray-200 rounded px-2 py-1.5 hover:bg-gray-50">
              <RotateCcw size={11} /> 重置
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded bg-white"><RefreshCw size={13} /></button>
              <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded bg-white"><Settings size={13} /></button>
              {selected && addChildLevel[activeLevel] && (
                <button onClick={() => openModal(addChildLevel[activeLevel]!, null)}
                  className="flex items-center gap-1 text-[12px] bg-white border border-gray-200 text-gray-600 rounded px-2.5 py-1.5 hover:bg-gray-50">
                  <Plus size={12} /> {currentAddChildLabel[activeLevel]}
                </button>
              )}
              <button onClick={() => openModal(activeLevel, null)}
                className="w-7 h-7 rounded-full bg-[#1e5fa8] hover:bg-[#1a4f8f] flex items-center justify-center text-white transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white rounded border border-gray-200 overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {tableHeaders[activeLevel].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[12px] text-gray-500 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} className="px-4 py-10 text-center text-[13px] text-gray-400">暂无数据</td></tr>
                  ) : (
                    filtered.map((row) => {
                      if (activeLevel === 'warehouse') return renderWarehouseRow(row as WarehouseNode)
                      return renderLocationRow(row as LocationNode)
                    })
                  )}
                </tbody>
              </table>
              <div className="px-4 py-2.5 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">每页条目数:</span>
                  <div className="relative">
                    <select className="appearance-none border border-gray-200 rounded px-2 py-1 text-[11px] pr-5 focus:outline-none bg-white">
                      <option>10</option><option>20</option><option>50</option>
                    </select>
                    <ChevronDown size={9} className="absolute right-1 top-2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[11px] font-bold">1</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Modals ===== */}
      {modal && (
        <FormModal
          title={`${modal.editing ? '编辑' : '新增'}${levelLabel[modal.level]}`}
          fields={modalFields[modal.level]}
          form={form}
          onFormChange={setForm}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-72 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">确认删除</h3>
            <p className="text-[13px] text-gray-600 mb-4">确定要删除该{levelLabel[deleteConfirm.level]}吗？此操作不可撤销。</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 text-[13px] border border-gray-200 rounded hover:bg-gray-50">取消</button>
              <button onClick={handleDelete} className="px-4 py-1.5 text-[13px] bg-red-500 text-white rounded hover:bg-red-600">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
