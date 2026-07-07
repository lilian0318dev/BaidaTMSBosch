'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Settings2, Plus, Edit2, Trash2, ChevronDown, ChevronRight,
  Search, FileDown, FileUp, CheckCircle2, XCircle, FolderOpen,
  Info, ListChecks,
} from 'lucide-react'

/* ============ 数据结构 ============ */
interface SubReason {
  code: string
  name: string
  enabled: boolean
  remark?: string
}

interface MainCategory {
  code: string
  name: string
  color: string
  children: SubReason[]
}

const INITIAL_DATA: MainCategory[] = [
  {
    code: 'D1', name: '尺寸不良', color: '#3b82f6',
    children: [
      { code: 'D1-01', name: '尺寸超差', enabled: true, remark: '含偏大/偏小、超上下限' },
      { code: 'D1-02', name: '厚度不均', enabled: true, remark: '板厚/壁厚不均匀' },
      { code: 'D1-03', name: '孔位偏移', enabled: true },
      { code: 'D1-04', name: '配合尺寸不良', enabled: true },
      { code: 'D1-05', name: '平面度超差', enabled: true },
      { code: 'D1-06', name: '垂直度/平行度', enabled: false, remark: '临时停用' },
    ],
  },
  {
    code: 'D2', name: '外观缺陷', color: '#8b5cf6',
    children: [
      { code: 'D2-01', name: '划痕/划伤', enabled: true },
      { code: 'D2-02', name: '凹坑/麻点', enabled: true },
      { code: 'D2-03', name: '气泡/缩痕', enabled: true },
      { code: 'D2-04', name: '色差', enabled: true },
      { code: 'D2-05', name: '飞边/毛刺', enabled: true },
      { code: 'D2-06', name: '表面污渍/油污', enabled: true },
      { code: 'D2-07', name: '色差/光泽度', enabled: true },
    ],
  },
  {
    code: 'D3', name: '装配异常', color: '#06b6d4',
    children: [
      { code: 'D3-01', name: '配合面错位', enabled: true },
      { code: 'D3-02', name: '间隙异常', enabled: true },
      { code: 'D3-03', name: '紧固不良', enabled: true },
      { code: 'D3-04', name: '卡滞/动作不顺', enabled: true },
      { code: 'D3-05', name: '装配变形', enabled: false },
    ],
  },
  {
    code: 'D4', name: '模具磨损', color: '#f59e0b',
    children: [
      { code: 'D4-01', name: '型腔磨损', enabled: true, remark: '型腔表面尺寸变化' },
      { code: 'D4-02', name: '导柱/导套磨损', enabled: true },
      { code: 'D4-03', name: '顶针磨损', enabled: true },
      { code: 'D4-04', name: '分型面磨损', enabled: true },
      { code: 'D4-05', name: '刃口磨损', enabled: true },
      { code: 'D4-06', name: '氮弹簧疲劳', enabled: true },
    ],
  },
  {
    code: 'D5', name: '崩裂破损', color: '#ef4444',
    children: [
      { code: 'D5-01', name: '崩角', enabled: true },
      { code: 'D5-02', name: '裂纹', enabled: true },
      { code: 'D5-03', name: '断裂', enabled: true },
      { code: 'D5-04', name: '变形', enabled: true },
      { code: 'D5-05', name: '缺损/掉块', enabled: true },
    ],
  },
  {
    code: 'D6', name: '进料成型异常', color: '#22c55e',
    children: [
      { code: 'D6-01', name: '缺料/充模不足', enabled: true },
      { code: 'D6-02', name: '渗料/溢料', enabled: true },
      { code: 'D6-03', name: '流道堵塞', enabled: true },
      { code: 'D6-04', name: '冷却不均', enabled: true },
      { code: 'D6-05', name: '缩孔/缩松', enabled: true },
    ],
  },
  {
    code: 'D7', name: '热处理缺陷', color: '#f97316',
    children: [
      { code: 'D7-01', name: '硬度不足', enabled: true },
      { code: 'D7-02', name: '硬度不均', enabled: true },
      { code: 'D7-03', name: '热变形', enabled: true },
      { code: 'D7-04', name: '淬火裂纹', enabled: false },
      { code: 'D7-05', name: '表面脱碳', enabled: true },
    ],
  },
  {
    code: 'D8', name: '其他', color: '#6b7280',
    children: [
      { code: 'D8-01', name: '配件损坏', enabled: true },
      { code: 'D8-02', name: '电气故障', enabled: true },
      { code: 'D8-03', name: '液压系统异常', enabled: true },
      { code: 'D8-04', name: '未分类', enabled: true, remark: '待细化分类项' },
    ],
  },
]

/* ============ 页面主体 ============ */
export default function DefectReasonsPage() {
  const [data, setData] = useState<MainCategory[]>(INITIAL_DATA)
  const [expanded, setExpanded] = useState<string | null>('D1')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<{ parentCode: string; item: SubReason } | null>(null)
  const [adding, setAdding] = useState<string | null>(null)

  const totalEnabled = data.reduce((sum, d) => sum + d.children.filter((c) => c.enabled).length, 0)
  const totalChildren = data.reduce((sum, d) => sum + d.children.length, 0)

  const toggle = (code: string) => {
    setExpanded(expanded === code ? null : code)
  }

  const toggleEnable = (parent: string, code: string) => {
    setData((prev) =>
      prev.map((p) =>
        p.code === parent
          ? { ...p, children: p.children.map((c) => (c.code === code ? { ...c, enabled: !c.enabled } : c)) }
          : p,
      ),
    )
  }

  const handleDelete = (parent: string, code: string) => {
    if (!confirm('确定要删除此不良原因？该操作不会影响历史单据中的引用。')) return
    setData((prev) =>
      prev.map((p) =>
        p.code === parent ? { ...p, children: p.children.filter((c) => c.code !== code) } : p,
      ),
    )
  }

  const handleSaveNew = (parentCode: string, newItem: SubReason) => {
    setData((prev) =>
      prev.map((p) =>
        p.code === parentCode ? { ...p, children: [...p.children, newItem] } : p,
      ),
    )
    setAdding(null)
  }

  const handleSaveEdit = (parentCode: string, updated: SubReason) => {
    setData((prev) =>
      prev.map((p) =>
        p.code === parentCode
          ? { ...p, children: p.children.map((c) => (c.code === updated.code ? updated : c)) }
          : p,
      ),
    )
    setEditing(null)
  }

  const filtered = data.filter((cat) => {
    if (!search) return true
    return (
      cat.code.toLowerCase().includes(search.toLowerCase()) ||
      cat.name.includes(search) ||
      cat.children.some((c) => c.name.includes(search) || c.code.toLowerCase().includes(search.toLowerCase()))
    )
  })

  return (
    <MainLayout>
      <div className="p-4 flex flex-col gap-4 h-full">
        {/* 顶部 */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1e5fa8]/10 rounded-lg flex items-center justify-center">
              <ListChecks className="text-[#1e5fa8]" size={18} />
            </div>
            <div>
              <div className="text-gray-800 font-medium text-sm">不良原因库</div>
              <div className="text-[12px] text-gray-500 mt-0.5">全系统统一分类标准 · 用于维修、QMS、保养、报工的品质分析</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <div>一级分类：<span className="text-[#1e5fa8] font-semibold">{data.length}</span> 项</div>
            <div>二级明细：<span className="text-[#1e5fa8] font-semibold">{totalEnabled}</span> / {totalChildren} 启用</div>
          </div>
        </div>

        {/* 说明条 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-[12px] text-blue-700 flex items-center gap-2">
          <Info size={14} />
          <span><span className="font-medium">系统规范：</span>一级分类为系统固定，不可新增/删除；二级明细可由管理员新增、编辑、启用/停用。所有不良原因在全系统（维修申请/QMS检验/保养异常/生产报工）中统一调用，用于看板统计。</span>
        </div>

        {/* 工具栏 */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索编码或名称..."
              className="border border-gray-200 rounded pl-8 pr-3 py-1.5 text-[12px] w-64 focus:outline-none focus:border-[#1e5fa8]"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">
              <FileUp size={12} /> 批量导入
            </button>
            <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">
              <FileDown size={12} /> 导出清单
            </button>
          </div>
        </div>

        {/* 分类列表 */}
        <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200">
          <div className="divide-y divide-gray-100">
            {filtered.map((cat) => (
              <div key={cat.code}>
                {/* 一级分类行 */}
                <div
                  onClick={() => toggle(cat.code)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {expanded === cat.code ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    <FolderOpen size={14} style={{ color: cat.color }} />
                  </div>
                  <div className="flex items-center gap-2 min-w-[220px]">
                    <span className="text-[12px] font-mono text-gray-500">{cat.code}</span>
                    <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {cat.children.filter((c) => c.enabled).length} / {cat.children.length} 项启用
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setAdding(cat.code) }}
                      className="text-[11px] text-[#1e5fa8] border border-[#1e5fa8] rounded px-2 py-1 hover:bg-[#1e5fa8] hover:text-white transition-colors flex items-center gap-0.5"
                    >
                      <Plus size={11} /> 新增明细
                    </button>
                  </div>
                </div>

                {/* 二级明细 */}
                {expanded === cat.code && (
                  <div className="bg-gray-50/80 pl-16 pr-6 pb-3">
                    {/* 表头 */}
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] text-gray-400 font-medium border-b border-gray-200">
                      <div className="col-span-2">编码</div>
                      <div className="col-span-3">名称</div>
                      <div className="col-span-4">说明/备注</div>
                      <div className="col-span-2 text-center">状态</div>
                      <div className="col-span-1 text-right">操作</div>
                    </div>
                    {/* 明细项 */}
                    {cat.children.map((c) => (
                      <div key={c.code} className={`grid grid-cols-12 gap-2 px-3 py-2 items-center text-[12px] border-b border-gray-100 hover:bg-white transition-colors ${!c.enabled ? 'opacity-50' : ''}`}>
                        <div className="col-span-2 font-mono text-gray-500">{c.code}</div>
                        <div className="col-span-3 text-gray-800 font-medium">{c.name}</div>
                        <div className="col-span-4 text-gray-500 text-[11px]">{c.remark || '—'}</div>
                        <div className="col-span-2 text-center">
                          {c.enabled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-100 rounded px-2 py-0.5 font-medium">
                              <CheckCircle2 size={10} /> 启用
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-600 bg-gray-200 rounded px-2 py-0.5 font-medium">
                              <XCircle size={10} /> 停用
                            </span>
                          )}
                        </div>
                        <div className="col-span-1 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleEnable(cat.code, c.code)}
                            className="text-[11px] text-gray-500 hover:text-[#1e5fa8]"
                            title={c.enabled ? '停用' : '启用'}
                          >
                            {c.enabled ? '停用' : '启用'}
                          </button>
                          <button
                            onClick={() => setEditing({ parentCode: cat.code, item: c })}
                            className="text-[11px] text-gray-500 hover:text-[#1e5fa8]"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.code, c.code)}
                            className="text-[11px] text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {cat.children.length === 0 && (
                      <div className="text-center text-[12px] text-gray-400 py-4">暂无二级明细，点击右上角「新增明细」添加</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 新增明细弹窗 */}
      {adding && (
        <EditModal
          title="新增不良原因"
          parentCategory={data.find((d) => d.code === adding)}
          onClose={() => setAdding(null)}
          onSave={(item) => handleSaveNew(adding, item)}
          isNew
        />
      )}

      {/* 编辑明细弹窗 */}
      {editing && (
        <EditModal
          title="编辑不良原因"
          parentCategory={data.find((d) => d.code === editing.parentCode)}
          initial={editing.item}
          onClose={() => setEditing(null)}
          onSave={(item) => handleSaveEdit(editing.parentCode, item)}
        />
      )}
    </MainLayout>
  )
}

/* ============ 编辑弹窗 ============ */
function EditModal({
  title, parentCategory, initial, onClose, onSave, isNew,
}: {
  title: string
  parentCategory?: MainCategory
  initial?: SubReason
  onClose: () => void
  onSave: (item: SubReason) => void
  isNew?: boolean
}) {
  const [name, setName] = useState(initial?.name || '')
  const [code, setCode] = useState(initial?.code || (parentCategory ? `${parentCategory.code}-${String(parentCategory.children.length + 1).padStart(2, '0')}` : ''))
  const [remark, setRemark] = useState(initial?.remark || '')
  const [enabled, setEnabled] = useState(initial?.enabled ?? true)

  const submit = () => {
    if (!name.trim()) {
      alert('请填写名称')
      return
    }
    onSave({
      code: code.trim(),
      name: name.trim(),
      remark: remark.trim(),
      enabled,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[560px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <Settings2 size={14} className="text-[#1e5fa8]" />
            <span className="text-sm font-semibold text-gray-800">{title}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><XCircle size={14} /></button>
        </div>

        <div className="p-5 space-y-4 text-[12px]">
          <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-blue-700">
            所属分类：<span className="font-medium">{parentCategory?.code}</span> · {parentCategory?.name}
          </div>

          <div>
            <label className="text-gray-500 block mb-1.5">编码 <span className="text-red-400">*</span></label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#1e5fa8]"
              placeholder="例如：D4-07"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1.5">名称 <span className="text-red-400">*</span></label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#1e5fa8]"
              placeholder="例如：模板磨损"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1.5">说明 / 备注</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              placeholder="适用场景、注意事项..."
              className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#1e5fa8] resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-3.5 h-3.5"
            />
            <label className="text-gray-600">启用此不良原因（可在全系统下拉菜单中选择）</label>
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="text-[12px] text-gray-600 border border-gray-300 rounded px-4 py-1.5 hover:bg-gray-50">取消</button>
          <button onClick={submit} className="text-[12px] text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded px-4 py-1.5 font-medium flex items-center gap-1">
            <CheckCircle2 size={12} /> 保存
          </button>
        </div>
      </div>
    </div>
  )
}
