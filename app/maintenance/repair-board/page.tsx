'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Filter, RotateCcw, ChevronDown, X, Paperclip } from 'lucide-react'

const STATUS_CARDS = [
  { label: '报修总数', value: 3, bg: 'bg-gray-500' },
  { label: '待响应', value: 1, bg: 'bg-orange-500' },
  { label: '维修中', value: 1, bg: 'bg-blue-500' },
  { label: '待确认', value: 1, bg: 'bg-yellow-500' },
  { label: '已完成', value: 0, bg: 'bg-green-700' },
]

const ORDERS = [
  {
    id: 'WO-2026-001', moldId: 'M001', moldName: '冲压模A型', urgency: '高', urgencyColor: 'bg-red-500',
    status: '待响应', statusColor: 'bg-orange-500', location: '百达电器新工厂',
    recLife: 180000, usedCount: 45000, lastMaint: '2026-05-12',
    expectedDate: '2026-06-15', repairReason: '零件磨损', remark: '',
    applicant: 'admin', applyName: '冲压模维修申请', applyTime: '2026-06-07 10:23',
  },
  {
    id: 'WO-2026-002', moldId: 'M003', moldName: '压铸模C型', urgency: '中', urgencyColor: 'bg-yellow-500',
    status: '维修中', statusColor: 'bg-blue-500', location: '百达电器新工厂',
    recLife: 300000, usedCount: 288000, lastMaint: '2026-03-15',
    expectedDate: '2026-06-20', repairReason: '寿命临界', remark: '紧急处理',
    applicant: 'zhangsan', applyName: '压铸模紧急维修', applyTime: '2026-06-05 08:10',
  },
  {
    id: 'WO-2026-003', moldId: 'M002', moldName: '注塑模B型', urgency: '低', urgencyColor: 'bg-green-500',
    status: '待确认', statusColor: 'bg-yellow-500', location: '百达电器新工厂',
    recLife: 450000, usedCount: 210000, lastMaint: '2026-04-01',
    expectedDate: '2026-07-01', repairReason: '定期维护', remark: '',
    applicant: 'lisi', applyName: '注塑模定期维护', applyTime: '2026-06-03 14:55',
  },
]

export default function RepairBoardPage() {
  const [selectedId, setSelectedId] = useState<string>('WO-2026-001')
  const [searchMold, setSearchMold] = useState('')
  const [searchFactory, setSearchFactory] = useState('')
  const [filterActive, setFilterActive] = useState(true)
  const [response, setResponse] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  const filtered = ORDERS.filter(
    (o) =>
      (!searchMold || o.moldId.toLowerCase().includes(searchMold.toLowerCase()) || o.moldName.includes(searchMold)) &&
      (!searchFactory || o.location.includes(searchFactory))
  )
  const selected = ORDERS.find((o) => o.id === selectedId)

  return (
    <MainLayout>
      <div className="flex h-full">
        {/* Left panel */}
        <div className="flex-1 flex flex-col p-4 overflow-auto gap-3">
          {/* Status cards */}
          <div className="grid grid-cols-5 gap-2">
            {STATUS_CARDS.map((c) => (
              <div key={c.label} className={`${c.bg} rounded py-3 px-2 text-center cursor-pointer hover:opacity-90 transition-opacity`}>
                <div className="text-white text-xs font-medium mb-1">{c.label}</div>
                <div className="text-white text-xl font-bold">{c.value}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold">{filtered.length}</span>
              <input value={searchMold} onChange={(e) => setSearchMold(e.target.value)} placeholder="模工具编号" className="border border-gray-300 rounded px-2.5 py-1 text-sm w-32 focus:outline-none focus:border-blue-400" />
              <input value={searchFactory} onChange={(e) => setSearchFactory(e.target.value)} placeholder="工厂" className="border border-gray-300 rounded px-2.5 py-1 text-sm w-28 focus:outline-none focus:border-blue-400" />
              <div className="flex items-center border border-gray-300 rounded px-2.5 py-1 w-44 cursor-pointer text-sm">
                <span className="flex-1 text-gray-400">维修状态</span>
                <ChevronDown size={12} className="text-gray-400" />
              </div>
              <button className="flex items-center gap-1 text-[13px] text-gray-600 px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50">
                <Filter size={12} /> 综合过滤
              </button>
              <button onClick={() => { setSearchMold(''); setSearchFactory('') }} className="flex items-center gap-1 text-[13px] text-gray-600 px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50">
                <RotateCcw size={12} /> 重置
              </button>
              <div className="flex-1" />
              <div className="flex border border-gray-300 rounded overflow-hidden text-[13px]">
                <button onClick={() => setViewMode('card')} className={`px-3 py-1 ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>卡片</button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-1 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>列表</button>
              </div>
            </div>

            {filterActive && (
              <div className="mt-2 flex items-center gap-1">
                <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-[12px] text-gray-600">
                  维修状态: 待响应, 维修进行中, 待确认
                  <button onClick={() => setFilterActive(false)} className="text-gray-400 hover:text-gray-600 ml-1"><X size={11} /></button>
                </span>
              </div>
            )}
          </div>

          {/* Cards */}
          <div className="space-y-2">
            {filtered.map((o) => {
              const lifePercent = Math.round((o.usedCount / o.recLife) * 100)
              const isSelected = o.id === selectedId
              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  className={`bg-white rounded border cursor-pointer transition-all hover:shadow-sm ${isSelected ? 'border-blue-400' : 'border-gray-200'}`}
                >
                  <div className={`h-1 ${o.statusColor} rounded-t`} />
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 40 40" fill="currentColor" className="w-7 h-7 text-gray-400">
                            <rect x="4" y="8" width="32" height="24" rx="2" opacity="0.3"/>
                            <rect x="8" y="12" width="24" height="16" rx="1" opacity="0.5"/>
                            <circle cx="20" cy="20" r="5" opacity="0.7"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-gray-800">{o.moldId}</div>
                          <div className="text-xs text-gray-500">{o.moldName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] text-white px-1.5 py-0.5 rounded font-medium ${o.urgencyColor}`}>{o.urgency}</span>
                        <span className={`text-[11px] text-white px-1.5 py-0.5 rounded font-medium ${o.statusColor}`}>{o.status}</span>
                      </div>
                    </div>

                    <div className="mb-2 h-2 bg-gray-100 rounded overflow-hidden">
                      <div className={`h-full rounded ${lifePercent > 80 ? 'bg-red-500' : 'bg-blue-400'}`} style={{ width: `${Math.min(lifePercent, 100)}%` }} />
                    </div>

                    <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[11px]">
                      <div><div className="text-gray-400">当前位置</div><div className="text-gray-700 font-medium truncate">{o.location}</div></div>
                      <div><div className="text-gray-400">建议寿命</div><div className="text-gray-700 font-medium">{o.recLife.toLocaleString()}</div></div>
                      <div><div className="text-gray-400">已用次数</div><div className="text-gray-700 font-medium">{o.usedCount.toLocaleString()}</div></div>
                      <div><div className="text-gray-400">期望完成日期</div><div className="text-gray-700 font-medium">{o.expectedDate}</div></div>
                      <div><div className="text-gray-400">维修原因</div><div className="text-gray-700 font-medium">{o.repairReason}</div></div>
                      <div><div className="text-gray-400">原因备注</div><div className="text-gray-700 font-medium">{o.remark || '-'}</div></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right detail panel */}
        <div className="w-[320px] bg-white border-l border-gray-200 shrink-0 flex flex-col overflow-hidden">
          {selected && (
            <>
              {/* Mold summary */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between mb-1">
                  <div className="text-[13px] font-semibold text-gray-800">{selected.moldId}</div>
                  <span className={`text-[11px] text-white px-1.5 py-0.5 rounded ${selected.statusColor}`}>{selected.status}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{selected.moldName}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><div className="text-gray-400">当前位置</div><div className="text-gray-700">{selected.location}</div></div>
                  <div><div className="text-gray-400">上次保养</div><div className="text-gray-700">{selected.lastMaint}</div></div>
                </div>
              </div>

              {/* Applicant */}
              <div className="px-3 py-2.5 border-b border-gray-200 text-[12px] text-gray-600 flex flex-wrap gap-3">
                <span>发起人：<span className="text-gray-800 font-medium">{selected.applicant}</span></span>
                <span>申请名称：<span className="text-gray-800 font-medium">{selected.applyName}</span></span>
                <span>发起时间：<span className="text-gray-800 font-medium">{selected.applyTime}</span></span>
              </div>

              {/* Response form */}
              <div className="flex-1 overflow-auto p-3">
                <div className="text-sm font-semibold text-gray-800 mb-3">异常响应</div>
                <div className="mb-2">
                  <label className="block text-[12px] text-gray-500 mb-1">响应信息</label>
                  <textarea
                    rows={5}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="备注："
                    className="w-full border-2 border-blue-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="mt-3">
                  <div className="text-[12px] text-gray-500 mb-2">文件列表</div>
                  <button className="flex items-center gap-1.5 text-[12px] text-blue-500 hover:text-blue-700 border border-dashed border-blue-300 rounded px-3 py-1.5 w-full justify-center hover:bg-blue-50">
                    <Paperclip size={13} /> 添加附件
                  </button>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors font-medium">响应</button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 transition-colors">取消</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
