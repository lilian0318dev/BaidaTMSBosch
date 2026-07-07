'use client'

import { useState } from 'react'
import {
  Search, Filter, RotateCcw, Plus, Upload, Send,
  Lock, Unlock, Pencil, Trash2, ChevronDown, X, FileSpreadsheet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/main-layout'

type PlanStatus = '新建' | '已下发' | '已锁定' | '执行中' | '已完成' | '已关闭'

interface ProductionPlan {
  id: string
  planNo: string
  moldCode: string
  moldName: string
  moldType: string
  requiredQty: number
  availableQty: number
  planQty: number
  priority: '高' | '中' | '低'
  planDate: string
  creator: string
  status: PlanStatus
}

const STATUS_STYLES: Record<PlanStatus, string> = {
  '新建':   'bg-gray-100 text-gray-600',
  '已下发': 'bg-blue-100 text-blue-700',
  '已锁定': 'bg-yellow-100 text-yellow-700',
  '执行中': 'bg-green-100 text-green-700',
  '已完成': 'bg-emerald-100 text-emerald-700',
  '已关闭': 'bg-gray-200 text-gray-500',
}

const PRIORITY_STYLES = {
  '高': 'bg-red-100 text-red-600',
  '中': 'bg-orange-100 text-orange-600',
  '低': 'bg-gray-100 text-gray-500',
}

const INITIAL_PLANS: ProductionPlan[] = [
  { id: 'P001', planNo: 'PP-2024-001', moldCode: 'M-DJZ-0085', moldName: '电机轴注塑模具', moldType: '注塑模', requiredQty: 500, availableQty: 120, planQty: 380, priority: '高', planDate: '2024-07-01', creator: '张三', status: '执行中' },
  { id: 'P002', planNo: 'PP-2024-002', moldCode: 'M-CYM-0032', moldName: '齿轮压铸模具', moldType: '压铸模', requiredQty: 200, availableQty: 80, planQty: 120, priority: '中', planDate: '2024-07-05', creator: '李四', status: '已下发' },
  { id: 'P003', planNo: 'PP-2024-003', moldCode: 'M-KZX-0011', moldName: '壳体冲压模具', moldType: '冲压模', requiredQty: 1000, availableQty: 300, planQty: 700, priority: '高', planDate: '2024-07-08', creator: '张三', status: '已锁定' },
  { id: 'P004', planNo: 'PP-2024-004', moldCode: 'M-GGM-0045', moldName: '管接头硅胶模', moldType: '橡胶模', requiredQty: 150, availableQty: 150, planQty: 0, priority: '低', planDate: '2024-07-10', creator: '王五', status: '新建' },
  { id: 'P005', planNo: 'PP-2024-005', moldCode: 'M-FGM-0067', moldName: '风扇叶片吹塑模', moldType: '吹塑模', requiredQty: 300, availableQty: 50, planQty: 250, priority: '中', planDate: '2024-07-12', creator: '李四', status: '新建' },
  { id: 'P006', planNo: 'PP-2024-006', moldCode: 'M-CLM-0023', moldName: '车灯反射镜模具', moldType: '注塑模', requiredQty: 800, availableQty: 200, planQty: 600, priority: '高', planDate: '2024-06-28', creator: '张三', status: '已完成' },
  { id: 'P007', planNo: 'PP-2024-007', moldCode: 'M-ZZM-0091', moldName: '支座铸造模', moldType: '铸造模', requiredQty: 400, availableQty: 100, planQty: 300, priority: '中', planDate: '2024-06-25', creator: '王五', status: '已关闭' },
]

type ModalMode = 'add' | 'edit' | 'import' | null

export default function ProductionPlansPage() {
  const [plans, setPlans] = useState<ProductionPlan[]>(INITIAL_PLANS)
  const [selected, setSelected] = useState<string[]>([])
  const [searchNo, setSearchNo] = useState('')
  const [searchMold, setSearchMold] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [modal, setModal] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<ProductionPlan | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: string; ids: string[] } | null>(null)

  // Form state
  const [form, setForm] = useState({
    moldCode: '', moldName: '', moldType: '', requiredQty: '', availableQty: '', planQty: '',
    priority: '中' as '高'|'中'|'低', planDate: '', creator: '',
  })

  const filtered = plans.filter(p => {
    if (searchNo && !p.planNo.toLowerCase().includes(searchNo.toLowerCase())) return false
    if (searchMold && !p.moldName.toLowerCase().includes(searchMold.toLowerCase()) && !p.moldCode.toLowerCase().includes(searchMold.toLowerCase())) return false
    if (filterStatus && p.status !== filterStatus) return false
    if (filterPriority && p.priority !== filterPriority) return false
    return true
  })

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([])
    else setSelected(filtered.map(p => p.id))
  }

  const toggleOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBatchAction = (type: 'dispatch' | 'lock' | 'unlock') => {
    const ids = selected.length > 0 ? selected : []
    if (!ids.length) return
    setConfirmAction({ type, ids })
  }

  const applyAction = () => {
    if (!confirmAction) return
    const { type, ids } = confirmAction
    setPlans(prev => prev.map(p => {
      if (!ids.includes(p.id)) return p
      if (type === 'dispatch' && p.status === '新建') return { ...p, status: '已下发' }
      if (type === 'lock' && p.status === '已下发') return { ...p, status: '已锁定' }
      if (type === 'unlock' && p.status === '已锁定') return { ...p, status: '已下发' }
      return p
    }))
    setConfirmAction(null)
    setSelected([])
  }

  const openEdit = (plan: ProductionPlan) => {
    setEditTarget(plan)
    setForm({
      moldCode: plan.moldCode, moldName: plan.moldName, moldType: plan.moldType,
      requiredQty: String(plan.requiredQty), availableQty: String(plan.availableQty),
      planQty: String(plan.planQty), priority: plan.priority,
      planDate: plan.planDate, creator: plan.creator,
    })
    setModal('edit')
  }

  const openAdd = () => {
    setEditTarget(null)
    setForm({ moldCode: '', moldName: '', moldType: '', requiredQty: '', availableQty: '', planQty: '', priority: '中', planDate: '', creator: '' })
    setModal('add')
  }

  const saveForm = () => {
    if (editTarget) {
      setPlans(prev => prev.map(p => p.id === editTarget.id ? {
        ...p, ...form,
        requiredQty: Number(form.requiredQty),
        availableQty: Number(form.availableQty),
        planQty: Number(form.planQty),
      } : p))
    } else {
      const newPlan: ProductionPlan = {
        id: `P${String(plans.length + 1).padStart(3, '0')}`,
        planNo: `PP-2024-${String(plans.length + 1).padStart(3, '0')}`,
        ...form,
        requiredQty: Number(form.requiredQty),
        availableQty: Number(form.availableQty),
        planQty: Number(form.planQty),
        status: '新建',
      }
      setPlans(prev => [newPlan, ...prev])
    }
    setModal(null)
  }

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  const statusOptions: PlanStatus[] = ['新建', '已下发', '已锁定', '执行中', '已完成', '已关闭']

  return (
    <MainLayout>
    <div className="flex flex-col h-full bg-[#f5f6f8]">
      {/* KPI bar */}
      <div className="grid grid-cols-6 gap-3 p-4 pb-0">
        {[
          { label: '计划总数', value: plans.length, color: 'text-gray-700' },
          { label: '新建', value: plans.filter(p => p.status === '新建').length, color: 'text-gray-500' },
          { label: '已下发', value: plans.filter(p => p.status === '已下发').length, color: 'text-blue-600' },
          { label: '已锁定', value: plans.filter(p => p.status === '已锁定').length, color: 'text-yellow-600' },
          { label: '执行中', value: plans.filter(p => p.status === '执行中').length, color: 'text-green-600' },
          { label: '已完成', value: plans.filter(p => p.status === '已完成').length, color: 'text-emerald-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 pt-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-3 h-8 text-sm">
          <Search size={14} className="text-gray-400" />
          <input value={searchNo} onChange={e => setSearchNo(e.target.value)} placeholder="计划编号" className="outline-none w-28 text-gray-700 placeholder:text-gray-400" />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-3 h-8 text-sm">
          <Search size={14} className="text-gray-400" />
          <input value={searchMold} onChange={e => setSearchMold(e.target.value)} placeholder="模具编号/名称" className="outline-none w-32 text-gray-700 placeholder:text-gray-400" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-8 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded text-gray-700 outline-none appearance-none cursor-pointer">
            <option value="">全部状态</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="h-8 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded text-gray-700 outline-none appearance-none cursor-pointer">
            <option value="">全部优先级</option>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
          <ChevronDown size={13} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
        <button onClick={() => { setSearchNo(''); setSearchMold(''); setFilterStatus(''); setFilterPriority('') }} className="flex items-center gap-1 h-8 px-3 text-sm text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50">
          <RotateCcw size={13} /> 重置
        </button>

        <div className="flex-1" />

        <button onClick={() => handleBatchAction('dispatch')} disabled={!selected.length} className="flex items-center gap-1.5 h-8 px-3 text-sm bg-white border border-gray-200 rounded text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <Send size={13} /> 下发
        </button>
        <button onClick={() => handleBatchAction('lock')} disabled={!selected.length} className="flex items-center gap-1.5 h-8 px-3 text-sm bg-white border border-gray-200 rounded text-yellow-600 hover:bg-yellow-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <Lock size={13} /> 锁定
        </button>
        <button onClick={() => handleBatchAction('unlock')} disabled={!selected.length} className="flex items-center gap-1.5 h-8 px-3 text-sm bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <Unlock size={13} /> 解锁
        </button>
        <button onClick={() => setModal('import')} className="flex items-center gap-1.5 h-8 px-3 text-sm bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
          <Upload size={13} /> 导入
        </button>
        <button onClick={openAdd} className="flex items-center gap-1.5 h-8 px-4 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">
          <Plus size={14} /> 新建计划
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto m-4 bg-white rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-10 px-3 py-3 text-left">
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
              </th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">计划编号</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">模具编号</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">模具名称</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">模具类型</th>
              <th className="px-4 py-3 text-right text-gray-600 font-medium text-xs">需求数量</th>
              <th className="px-4 py-3 text-right text-gray-600 font-medium text-xs">现有库存</th>
              <th className="px-4 py-3 text-right text-gray-600 font-medium text-xs">计划投产</th>
              <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">优先级</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">计划日期</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">制单人</th>
              <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">状态</th>
              <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((plan, idx) => (
              <tr key={plan.id} className={cn('border-b border-gray-100 hover:bg-gray-50', idx % 2 === 1 && 'bg-gray-50/50')}>
                <td className="px-3 py-3">
                  <input type="checkbox" checked={selected.includes(plan.id)} onChange={() => toggleOne(plan.id)} className="rounded" />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#1e5fa8] font-medium">{plan.planNo}</td>
                <td className="px-4 py-3 text-gray-700 font-mono text-xs">{plan.moldCode}</td>
                <td className="px-4 py-3 text-gray-800">{plan.moldName}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{plan.moldType}</td>
                <td className="px-4 py-3 text-right text-gray-700">{plan.requiredQty.toLocaleString()}</td>
                <td className={cn('px-4 py-3 text-right', plan.availableQty >= plan.requiredQty ? 'text-green-600' : 'text-orange-500')}>{plan.availableQty.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-800">{plan.planQty.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', PRIORITY_STYLES[plan.priority])}>{plan.priority}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{plan.planDate}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{plan.creator}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[plan.status])}>{plan.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(plan)} disabled={plan.status === '已完成' || plan.status === '已关闭'} className="text-gray-400 hover:text-[#1e5fa8] disabled:opacity-30 disabled:cursor-not-allowed">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deletePlan(plan.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Filter size={36} className="mb-3 opacity-30" />
            <p className="text-sm">暂无符合条件的生产计划</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">{modal === 'add' ? '新建生产计划' : '编辑生产计划'}</h3>
              <button onClick={() => setModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">模具编号 *</label>
                  <input value={form.moldCode} onChange={e => setForm(f => ({ ...f, moldCode: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-8 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">模具名称 *</label>
                  <input value={form.moldName} onChange={e => setForm(f => ({ ...f, moldName: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-8 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">模具类型</label>
                  <input value={form.moldType} onChange={e => setForm(f => ({ ...f, moldType: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-8 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">优先级</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as '高'|'中'|'低' }))} className="w-full border border-gray-200 rounded px-3 h-8 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]">
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">需求数量 *</label>
                  <input type="number" value={form.requiredQty} onChange={e => setForm(f => ({ ...f, requiredQty: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-8 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">现有库存（自动查询）</label>
                  <input type="number" value={form.availableQty} onChange={e => setForm(f => ({ ...f, availableQty: e.target.value }))} className="w-full border border-gray-200 rounded bg-gray-50 px-3 h-8 text-sm text-gray-600 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">计划投产数量 *</label>
                  <input type="number" value={form.planQty} onChange={e => setForm(f => ({ ...f, planQty: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-8 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">计划日期</label>
                  <input type="date" value={form.planDate} onChange={e => setForm(f => ({ ...f, planDate: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-8 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">制单人</label>
                  <input value={form.creator} onChange={e => setForm(f => ({ ...f, creator: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-8 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={saveForm} className="px-5 h-8 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {modal === 'import' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[460px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">Excel 数据导入</h3>
              <button onClick={() => setModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 flex flex-col items-center gap-3 bg-gray-50">
                <FileSpreadsheet size={40} className="text-green-500" />
                <p className="text-sm text-gray-600">拖拽 Excel 文件到此处，或点击选择文件</p>
                <p className="text-xs text-gray-400">支持 .xlsx / .xls 格式，最大 10MB</p>
                <button className="mt-2 px-4 h-8 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">选择文件</button>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <a href="#" className="text-xs text-[#1e5fa8] hover:underline">下载导入模板</a>
                <span className="text-gray-300 text-xs">|</span>
                <span className="text-xs text-gray-400">请按模板格式填写数据后上传</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={() => setModal(null)} className="px-5 h-8 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">确认导入</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[360px] p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              {confirmAction.type === 'dispatch' ? '确认下发' : confirmAction.type === 'lock' ? '确认锁定' : '确认解锁'}
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              将对选中的 <span className="font-semibold text-gray-800">{confirmAction.ids.length}</span> 条计划执行此操作，确认继续？
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmAction(null)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={applyAction} className="px-5 h-8 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  )
}
