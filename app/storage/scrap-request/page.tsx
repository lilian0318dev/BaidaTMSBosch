'use client'

import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RotateCcw, Eye, Plus, X, FileText,
  Wrench, Shield, Trash2, ChevronDown,
  ClipboardList, Package, User, AlertTriangle, Check, XCircle,
} from 'lucide-react'

type ScrapSource = 'repair' | 'maintenance_level2'

interface ScrapRequest {
  id: string
  source: ScrapSource
  sourceLabel: string
  moldCode: string
  moldName: string
  partName?: string
  qty: number
  applicant: string
  applyTime: string
  status: '待审批' | '已批准' | '已驳回' | '已报废'
  sourceOrderNo: string
  reason: string
  auditor?: string
  auditTime?: string
  auditRemark?: string
  scrapTime?: string
  scrapHandler?: string
  remark?: string
}

const MOCK_DATA: ScrapRequest[] = [
  {
    id: 'BF-20260628-0001',
    source: 'repair',
    sourceLabel: '维修报废',
    moldCode: 'M007',
    moldName: '7667SO成形凹模',
    partName: '凹模镶件',
    qty: 1,
    applicant: '李钳工',
    applyTime: '2026-06-28 09:30',
    status: '待审批',
    sourceOrderNo: 'WX-2026-0628-002',
    reason: '裂纹严重，无法修复，建议报废',
  },
  {
    id: 'BF-20260625-0002',
    source: 'maintenance_level2',
    sourceLabel: '保养报废',
    moldCode: 'M015',
    moldName: '7658SO成形凸模',
    qty: 1,
    applicant: '王保养',
    applyTime: '2026-06-25 14:20',
    status: '已批准',
    sourceOrderNo: 'BY-2026-0625-003',
    reason: '磨损超差，无法修复，建议报废更换',
    auditor: '张领班',
    auditTime: '2026-06-25 15:00',
    auditRemark: '同意报废，请尽快安排补料',
  },
  {
    id: 'BF-20260620-0003',
    source: 'repair',
    sourceLabel: '维修报废',
    moldCode: 'M003',
    moldName: '7671SO成形凸模',
    qty: 1,
    applicant: '赵钳工',
    applyTime: '2026-06-20 10:15',
    status: '已报废',
    sourceOrderNo: 'WX-2026-0620-001',
    reason: '断裂，无法修复',
    auditor: '张领班',
    auditTime: '2026-06-20 10:45',
    auditRemark: '同意报废',
    scrapTime: '2026-06-20 14:30',
    scrapHandler: '仓管员',
  },
  {
    id: 'BF-20260618-0004',
    source: 'maintenance_level2',
    sourceLabel: '保养报废',
    moldCode: 'M012',
    moldName: '7663SO三工位凹模',
    partName: '第二工位镶件',
    qty: 1,
    applicant: '陈保养',
    applyTime: '2026-06-18 11:00',
    status: '已驳回',
    sourceOrderNo: 'BY-2026-0618-001',
    reason: '表面轻微锈蚀，建议报废',
    auditor: '张领班',
    auditTime: '2026-06-18 11:30',
    auditRemark: '锈蚀可以通过抛光修复，不需要报废，驳回。',
  },
]

const SOURCE_META: Record<ScrapSource, { label: string; icon: React.ReactNode; bg: string; text: string; color: string }> = {
  repair: { label: '维修报废', icon: <Wrench size={11} />, bg: 'bg-red-100', text: 'text-red-700', color: 'red' },
  maintenance_level2: { label: '保养报废', icon: <Shield size={11} />, bg: 'bg-green-100', text: 'text-green-700', color: 'green' },
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  '待审批': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  '已批准': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  '已驳回': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  '已报废': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
}

const TAB_CONFIG: { key: ScrapSource | 'all' | 'pending'; label: string; icon?: React.ReactNode; color: string }[] = [
  { key: 'all', label: '全部', color: 'blue' },
  { key: 'pending', label: '待审批', icon: <AlertTriangle size={13} />, color: 'amber' },
  { key: 'repair', label: '维修报废', icon: <Wrench size={13} />, color: 'red' },
  { key: 'maintenance_level2', label: '保养报废', icon: <Shield size={13} />, color: 'green' },
]

interface NewForm {
  source: ScrapSource | ''
  moldCode: string
  moldName: string
  partName: string
  qty: number
  sourceOrderNo: string
  reason: string
  remark: string
}

const emptyForm: NewForm = {
  source: 'repair',
  moldCode: '',
  moldName: '',
  partName: '',
  qty: 1,
  sourceOrderNo: '',
  reason: '',
  remark: '',
}

const CURRENT_USER = '张领班'
const IS_FOREMAN = true

export default function ScrapRequestPage() {
  const [activeTab, setActiveTab] = useState<ScrapSource | 'all' | 'pending'>('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<NewForm>(emptyForm)
  const [detail, setDetail] = useState<ScrapRequest | null>(null)

  const filtered = MOCK_DATA.filter((o) => {
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && o.status === '待审批') ||
      o.source === activeTab
    const matchSearch = !search || o.id.includes(search) || o.moldCode.includes(search) || o.moldName.includes(search)
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchTab && matchSearch && matchStatus
  })

  const pendingCount = MOCK_DATA.filter((o) => o.status === '待审批').length

  const handleSubmit = () => {
    if (!form.source || !form.moldCode || !form.reason) {
      alert('请填写必填项')
      return
    }
    alert(`报废申请提交成功！\n\n单号：BF-${Date.now()}\n来源：${SOURCE_META[form.source as ScrapSource].label}\n模具：${form.moldName}\n\n状态：待审批，等待钳工领班审批。`)
    setShowNew(false)
    setForm(emptyForm)
  }

  const handleAudit = (id: string, pass: boolean) => {
    if (pass) {
      if (!confirm(`确认批准该报废申请？\n\n批准后将转入报废仓。`)) return
      alert('已批准，已推送至仓库执行报废入库')
    } else {
      const reason = prompt('请输入驳回原因：')
      if (reason === null) return
      alert('已驳回')
    }
    setDetail(null)
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <Trash2 size={13} className="text-amber-600" />
          <span className="text-xs text-amber-800">
            报废申请页 · 维修/二级保养过程中判定报废统一发起 · 钳工领班审批后推送仓库执行报废入库
          </span>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center">
              <Trash2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">报废申请</h1>
              <p className="text-[11px] text-gray-500">维修报废 / 二级保养报废 · 钳工领班审批</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-[11px] text-gray-400">待审批</p>
              <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
            </div>
            <button onClick={() => { setForm(emptyForm); setShowNew(true) }} className="flex items-center gap-1.5 h-9 px-4 bg-[#1e5fa8] text-white text-sm rounded-lg hover:bg-[#1a4f8f]">
              <Plus size={14} /> 新建报废申请
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-100 px-5 flex items-center gap-1 shrink-0">
          {TAB_CONFIG.map(tab => {
            const active = activeTab === tab.key
            const count = tab.key === 'all' ? MOCK_DATA.length :
              tab.key === 'pending' ? pendingCount :
                MOCK_DATA.filter(o => o.source === tab.key).length
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  active ? 'text-[#1e5fa8]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab.icon}
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-[#1e5fa8]/10 text-[#1e5fa8]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </span>
                {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5fa8] rounded-t" />}
              </button>
            )
          })}
        </div>

        <div className="px-5 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索报废单号 / 模具编号 / 模具名称"
                className="w-full pl-9 pr-3 h-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e5fa8]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e5fa8] bg-white"
            >
              <option value="">全部状态</option>
              <option value="待审批">待审批</option>
              <option value="已批准">已批准</option>
              <option value="已驳回">已驳回</option>
              <option value="已报废">已报废</option>
            </select>
            <button onClick={() => { setSearch(''); setStatusFilter('') }} className="flex items-center gap-1.5 h-8 px-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <RotateCcw size={13} /> 重置
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">报废单号</th>
                  <th className="text-left px-4 py-2.5 font-medium">来源类型</th>
                  <th className="text-left px-4 py-2.5 font-medium">模具编号</th>
                  <th className="text-left px-4 py-2.5 font-medium">模具名称</th>
                  <th className="text-left px-4 py-2.5 font-medium">零部件</th>
                  <th className="text-left px-4 py-2.5 font-medium">数量</th>
                  <th className="text-left px-4 py-2.5 font-medium">来源单号</th>
                  <th className="text-left px-4 py-2.5 font-medium">申请人</th>
                  <th className="text-left px-4 py-2.5 font-medium">申请时间</th>
                  <th className="text-left px-4 py-2.5 font-medium">状态</th>
                  <th className="text-left px-4 py-2.5 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const statusStyle = STATUS_COLORS[item.status]
                  const sourceStyle = SOURCE_META[item.source]
                  return (
                    <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${sourceStyle.bg} ${sourceStyle.text}`}>
                          {sourceStyle.icon}
                          {sourceStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.moldCode}</td>
                      <td className="px-4 py-3 text-gray-800">{item.moldName}</td>
                      <td className="px-4 py-3 text-gray-500">{item.partName || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{item.qty}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.sourceOrderNo}</td>
                      <td className="px-4 py-3 text-gray-600">{item.applicant}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.applyTime}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setDetail(item)} className="text-[#1e5fa8] text-xs hover:underline flex items-center gap-1">
                            <Eye size={12} /> 详情
                          </button>
                          {item.status === '待审批' && IS_FOREMAN && (
                            <>
                              <button onClick={() => handleAudit(item.id, true)} className="text-emerald-600 text-xs hover:underline flex items-center gap-1">
                                <Check size={12} /> 批准
                              </button>
                              <button onClick={() => handleAudit(item.id, false)} className="text-red-600 text-xs hover:underline flex items-center gap-1">
                                <XCircle size={12} /> 驳回
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 新建弹窗 */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">新建报废申请</h3>
              <button onClick={() => setShowNew(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">来源类型 <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {(['repair', 'maintenance_level2'] as ScrapSource[]).map(s => {
                    const meta = SOURCE_META[s]
                    const active = form.source === s
                    return (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, source: s })}
                        className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-sm transition-colors ${
                          active
                            ? 'border-[#1e5fa8] bg-[#1e5fa8]/5 text-[#1e5fa8]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {meta.icon}
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">模具编号 <span className="text-red-500">*</span></label>
                  <input
                    value={form.moldCode}
                    onChange={e => setForm({ ...form, moldCode: e.target.value })}
                    placeholder="请输入模具编号"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">模具名称</label>
                  <input
                    value={form.moldName}
                    onChange={e => setForm({ ...form, moldName: e.target.value })}
                    placeholder="请输入模具名称"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">零部件名称</label>
                  <input
                    value={form.partName}
                    onChange={e => setForm({ ...form, partName: e.target.value })}
                    placeholder="如：凹模镶件"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">数量</label>
                  <input
                    type="number"
                    value={form.qty}
                    onChange={e => setForm({ ...form, qty: Number(e.target.value) })}
                    min={1}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {form.source === 'repair' ? '维修单号' : form.source === 'maintenance_level2' ? '保养单号' : '来源单号'}
                </label>
                <input
                  value={form.sourceOrderNo}
                  onChange={e => setForm({ ...form, sourceOrderNo: e.target.value })}
                  placeholder="请输入来源单号"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">报废原因 <span className="text-red-500">*</span></label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  placeholder="请详细描述报废原因"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">备注</label>
                <textarea
                  value={form.remark}
                  onChange={e => setForm({ ...form, remark: e.target.value })}
                  rows={2}
                  placeholder="选填"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowNew(false)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSubmit} className="px-5 h-8 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">提交申请</button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">报废申请详情</h3>
              <button onClick={() => setDetail(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gray-700">{detail.id}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${STATUS_COLORS[detail.status].bg} ${STATUS_COLORS[detail.status].text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[detail.status].dot}`} />
                    {detail.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${SOURCE_META[detail.source].bg} ${SOURCE_META[detail.source].text}`}>
                    {SOURCE_META[detail.source].icon}
                    {SOURCE_META[detail.source].label}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-20 shrink-0">模具编号</span>
                  <span className="text-gray-700 font-mono">{detail.moldCode}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-20 shrink-0">模具名称</span>
                  <span className="text-gray-800">{detail.moldName}</span>
                </div>
                {detail.partName && (
                  <div className="flex items-start">
                    <span className="text-gray-400 text-xs w-20 shrink-0">零部件</span>
                    <span className="text-gray-700">{detail.partName}</span>
                  </div>
                )}
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-20 shrink-0">数量</span>
                  <span className="text-gray-700">{detail.qty}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-20 shrink-0">来源单号</span>
                  <span className="text-gray-700 font-mono">{detail.sourceOrderNo}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-20 shrink-0">申请人</span>
                  <span className="text-gray-700">{detail.applicant}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-20 shrink-0">申请时间</span>
                  <span className="text-gray-700">{detail.applyTime}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 mb-1.5">报废原因</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{detail.reason}</p>
              </div>

              {detail.remark && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 mb-1.5">备注</p>
                  <p className="text-sm text-gray-600">{detail.remark}</p>
                </div>
              )}

              {detail.auditor && (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <p className="text-xs text-gray-500 font-medium">审批信息</p>
                  <div className="flex items-start">
                    <span className="text-gray-400 text-xs w-20 shrink-0">审批人</span>
                    <span className="text-gray-700">{detail.auditor}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 text-xs w-20 shrink-0">审批时间</span>
                    <span className="text-gray-700">{detail.auditTime}</span>
                  </div>
                  {detail.auditRemark && (
                    <div className="flex items-start">
                      <span className="text-gray-400 text-xs w-20 shrink-0">审批意见</span>
                      <span className="text-gray-700">{detail.auditRemark}</span>
                    </div>
                  )}
                </div>
              )}

              {detail.scrapTime && (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <p className="text-xs text-gray-500 font-medium">报废执行</p>
                  <div className="flex items-start">
                    <span className="text-gray-400 text-xs w-20 shrink-0">报废时间</span>
                    <span className="text-gray-700">{detail.scrapTime}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 text-xs w-20 shrink-0">执行人</span>
                    <span className="text-gray-700">{detail.scrapHandler}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setDetail(null)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">关闭</button>
              {detail.status === '待审批' && IS_FOREMAN && (
                <>
                  <button onClick={() => handleAudit(detail.id, false)} className="px-5 h-8 text-sm bg-red-500 text-white rounded hover:bg-red-600">驳回</button>
                  <button onClick={() => handleAudit(detail.id, true)} className="px-5 h-8 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">批准</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
