'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Box, AlertTriangle, RotateCcw, TrendingUp, Package,
  ChevronRight, Calendar, ShieldAlert, Clock, Layers,
  CheckCircle2, XCircle, Gauge, Target, Zap,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

/* ============ 数据定义 ============ */

// 资产状态分布
const ASSET_STATUS_DATA = [
  { name: '空闲', value: 2, color: '#a855f7' },
  { name: '在库', value: 1, color: '#3b82f6' },
  { name: '保养中', value: 1, color: '#f59e0b' },
  { name: '维修中', value: 1, color: '#ef4444' },
  { name: '生产中', value: 2, color: '#22c55e' },
  { name: '报废', value: 1, color: '#64748b' },
]

// 月度趋势
const TREND_DATA = [
  { month: '1月', newIn: 3, scrap: 0 },
  { month: '2月', newIn: 1, scrap: 1 },
  { month: '3月', newIn: 2, scrap: 0 },
  { month: '4月', newIn: 1, scrap: 0 },
  { month: '5月', newIn: 3, scrap: 1 },
  { month: '6月', newIn: 2, scrap: 0 },
]

// 维修超期清单
const OVERDUE_REPAIR = [
  { moldId: 'M003', moldName: '压铸模C型', startDate: '2026-06-10', days: 8, owner: '王钳工', reason: '等待委外厂家报价' },
]

// 保养逾期清单
const OVERDUE_MAINT = [
  { moldId: 'M001', moldName: '冲压模A型', planDate: '2026-06-15', overdueDays: 5, level: '一级保养', location: '百达电器新工厂' },
  { moldId: 'M008', moldName: '复合模H型', planDate: '2026-06-18', overdueDays: 3, level: '二级保养', location: '百达电器新工厂' },
]

// 保养逾期清单

// ============ 主页面 ============

export default function MoldsDashboardPage() {
  const [activeTab, setActiveTab] = useState<'repair' | 'maint'>('repair')

  // 汇总计算
  const totalMolds = ASSET_STATUS_DATA.reduce((s, d) => s + d.value, 0)
  const availableMolds = ASSET_STATUS_DATA
    .filter((d) => d.name.includes('空闲') || d.name.includes('在库') || d.name.includes('生产中'))
    .reduce((s, d) => s + d.value, 0)
  const repairingMolds = ASSET_STATUS_DATA.find((d) => d.name.includes('维修'))?.value ?? 0
  const maintMolds = ASSET_STATUS_DATA.find((d) => d.name.includes('保养'))?.value ?? 0
  const anomalyCount = OVERDUE_REPAIR.length + OVERDUE_MAINT.length

  return (
    <MainLayout>
      <div className="p-4 overflow-auto h-full bg-gray-50">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1e5fa8] to-[#2d6fb8] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers size={22} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">模具总览看板</div>
              <div className="text-[12px] text-gray-500">全局资产健康状态 · 业务运营概览</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Calendar size={13} className="text-gray-400" />
              <span>数据更新：2026-06-21 09:30</span>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-12 gap-4 mb-5">
          {/* 资产状态环形图 */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-800">资产状态分布</h3>
                <div className="text-[11px] text-gray-400 mt-0.5">按业务状态统计</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-400">合计</div>
                <div className="text-xl font-bold text-[#1e5fa8]">{totalMolds}</div>
                <div className="text-[10px] text-gray-400">副</div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={ASSET_STATUS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#ffffff"
                  >
                    {ASSET_STATUS_DATA.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 12px' }}
                    formatter={(value: number, name: string) => [
                      `${value} 副（${Math.round((value / totalMolds) * 100)}%）`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2 mt-2">
                {ASSET_STATUS_DATA.map((d) => {
                  const pct = Math.round((d.value / totalMolds) * 100)
                  return (
                    <div key={d.name} className="flex items-center gap-2 text-[12px]">
                      <div
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-gray-600 flex-1 truncate">{d.name}</span>
                      <span className="text-gray-800 font-semibold w-8 text-right">{d.value}</span>
                      <span className="text-gray-400 w-10 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 月度趋势图 */}
          <div className="col-span-5 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-800">新投产 vs 报废趋势</h3>
                <div className="text-[11px] text-gray-400 mt-0.5">近 6 个月模具资产动态变化</div>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded bg-[#a855f7]" />
                  <span className="text-gray-500">新投产</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded bg-[#64748b]" />
                  <span className="text-gray-500">报废</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={TREND_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value: number, name: string) => {
                    const map: Record<string, string> = { newIn: '新投产', scrap: '报废' }
                    return [`${value} 副`, map[name] || name]
                  }}
                />
                <Bar dataKey="newIn" fill="#a855f7" radius={[4, 4, 0, 0]} name="新投产" />
                <Bar dataKey="scrap" fill="#64748b" radius={[4, 4, 0, 0]} name="报废" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 关键指标概览 */}
          <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-800">关键指标概览</h3>
                <div className="text-[11px] text-gray-400 mt-0.5">当前健康度指标</div>
              </div>
              <Gauge size={18} className="text-gray-400" />
            </div>
            <div className="space-y-5">
              {/* 可用率 */}
              <div>
                <div className="flex items-center justify-between text-[12px] mb-2">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-green-500" /> 可用率
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400">目标 ≥ 90%</span>
                    <span className="font-bold text-green-600">{Math.round((availableMolds / totalMolds) * 100)}%</span>
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500"
                    style={{ width: `${Math.round((availableMolds / totalMolds) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 维修超时率 */}
              <div>
                <div className="flex items-center justify-between text-[12px] mb-2">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <XCircle size={13} className="text-red-500" /> 维修超时率
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400">目标 ≤ 10%</span>
                    <span className="font-bold text-red-600">
                      {repairingMolds > 0 ? Math.round((OVERDUE_REPAIR.length / repairingMolds) * 100) : 0}%
                    </span>
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500"
                    style={{ width: `${Math.min(repairingMolds > 0 ? Math.round((OVERDUE_REPAIR.length / repairingMolds) * 100) : 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* 保养按期完成率 */}
              <div>
                <div className="flex items-center justify-between text-[12px] mb-2">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-500" /> 保养按期完成率
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400">目标 ≥ 95%</span>
                    <span className="font-bold text-amber-600">88%</span>
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: '88%' }} />
                </div>
              </div>
            </div>

            {/* 预警提示 */}
            <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <ShieldAlert size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <div className="text-[12px] text-orange-700">
                  <span className="font-semibold">需关注：</span>
                  共 <span className="font-bold">{anomalyCount}</span> 项异常待处理
                  <span className="text-orange-600 ml-1">
                    （维修超期 {OVERDUE_REPAIR.length}、保养逾期 {OVERDUE_MAINT.length}）
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 异常状态预警区 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-gray-800">异常状态预警</h3>
                <div className="text-[11px] text-gray-400">高亮显示需管理层关注的模具清单</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[12px] font-medium">
                待处理 {anomalyCount} 项
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {[
              { key: 'repair', label: '维修超期', count: OVERDUE_REPAIR.length, icon: XCircle },
              { key: 'maint', label: '保养逾期', count: OVERDUE_MAINT.length, icon: Clock },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'repair' | 'maint')}
                className={`px-6 py-3 text-[13px] flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-[#1e5fa8] bg-white text-[#1e5fa8]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === tab.key ? 'bg-blue-100 text-[#1e5fa8]' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'repair' && (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-gray-500 text-[11px] border-b border-gray-100">
                      {['模具编号', '模具名称', '维修开始', '超期天数', '负责人', '延误原因', '操作'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left font-medium bg-gray-50/50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {OVERDUE_REPAIR.map((row, idx) => (
                      <tr key={row.moldId} className="border-b border-gray-100 hover:bg-red-50/30 transition-colors">
                        <td className="px-3 py-3"><span className="text-[#1e5fa8] font-semibold bg-blue-50 px-2 py-1 rounded">{row.moldId}</span></td>
                        <td className="px-3 py-3 text-gray-700">{row.moldName}</td>
                        <td className="px-3 py-3 text-gray-500">{row.startDate}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-[12px]">
                            <AlertTriangle size={11} />{row.days} 天
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-700">{row.owner}</td>
                        <td className="px-3 py-3 text-gray-500 text-[12px]">{row.reason}</td>
                        <td className="px-3 py-3">
                          <button className="text-[12px] text-[#1e5fa8] hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                            查看详情 <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {OVERDUE_REPAIR.length === 0 && (
                      <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-[12px]">暂无维修超期的模具</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'maint' && (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-gray-500 text-[11px] border-b border-gray-100">
                      {['模具编号', '模具名称', '保养级别', '计划日期', '逾期天数', '当前位置', '操作'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left font-medium bg-gray-50/50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {OVERDUE_MAINT.map((row, idx) => (
                      <tr key={row.moldId} className="border-b border-gray-100 hover:bg-amber-50/30 transition-colors">
                        <td className="px-3 py-3"><span className="text-[#1e5fa8] font-semibold bg-blue-50 px-2 py-1 rounded">{row.moldId}</span></td>
                        <td className="px-3 py-3 text-gray-700">{row.moldName}</td>
                        <td className="px-3 py-3"><span className="px-2.5 py-1 rounded-full text-[11px] bg-amber-100 text-amber-700 font-medium">{row.level}</span></td>
                        <td className="px-3 py-3 text-gray-500">{row.planDate}</td>
                        <td className="px-3 py-3">
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-[12px]">{row.overdueDays} 天</span>
                        </td>
                        <td className="px-3 py-3 text-gray-500">{row.location}</td>
                        <td className="px-3 py-3">
                          <button className="text-[12px] text-[#1e5fa8] hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                            查看详情 <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {OVERDUE_MAINT.length === 0 && (
                      <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-[12px]">暂无保养逾期的模具</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
