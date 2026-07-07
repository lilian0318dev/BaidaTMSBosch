'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import { Filter, RotateCcw, Save, RefreshCw, Download, ChevronDown } from 'lucide-react'

// --- Mock data ---
const moldTypeStats = [
  { type: '注塑模具', total: 86, active: 58, inactive: 12, scrapped: 16 },
  { type: '冲压模具', total: 54, active: 42, inactive: 6, scrapped: 6 },
  { type: '压铸模具', total: 32, active: 24, inactive: 4, scrapped: 4 },
  { type: '锻造模具', total: 18, active: 14, inactive: 2, scrapped: 2 },
  { type: '拉伸模具', total: 24, active: 18, inactive: 3, scrapped: 3 },
  { type: '粉末冶金模', total: 11, active: 8, inactive: 2, scrapped: 1 },
]

const repairTrend = [
  { month: '1月', count: 12 },
  { month: '2月', count: 8 },
  { month: '3月', count: 15 },
  { month: '4月', count: 10 },
  { month: '5月', count: 18 },
  { month: '6月', count: 14 },
]

const maintTrend = [
  { month: '1月', planned: 32, done: 28 },
  { month: '2月', planned: 28, done: 26 },
  { month: '3月', planned: 35, done: 33 },
  { month: '4月', planned: 30, done: 27 },
  { month: '5月', planned: 38, done: 35 },
  { month: '6月', planned: 36, done: 34 },
]

const statusPie = [
  { name: '使用中', value: 164, color: '#1e5fa8' },
  { name: '备用', value: 29, color: '#22c55e' },
  { name: '维修中', value: 18, color: '#f59e0b' },
  { name: '已停用', value: 14, color: '#94a3b8' },
  { name: '已报废', value: 32, color: '#ef4444' },
]

const agePie = [
  { name: '0~2年', value: 68, color: '#1e5fa8' },
  { name: '2~5年', value: 102, color: '#0ea5e9' },
  { name: '5~10年', value: 67, color: '#f59e0b' },
  { name: '10年以上', value: 20, color: '#ef4444' },
]

const factories = ['百达电器', '华夏1号工厂', '华夏2号工厂']
const moldTypes = ['注塑模具', '冲压模具', '压铸模具', '锻造模具', '拉伸模具']

const itemStats = [
  { itemNo: '60024901201001', itemName: '7686SO三工位成形凹模', site: 4, inProcess: 2, repair: 1, maint: 0, scrap: 1 },
  { itemNo: '60024901201002', itemName: '7686SO三工位成形凸模', site: 3, inProcess: 1, repair: 0, maint: 1, scrap: 2 },
  { itemNo: '60024901201003', itemName: '7670SO成形凹模', site: 2, inProcess: 2, repair: 1, maint: 0, scrap: 0 },
  { itemNo: '60024901201004', itemName: '7670SO成形凸模', site: 3, inProcess: 1, repair: 0, maint: 1, scrap: 1 },
  { itemNo: '60024901201005', itemName: '7669SO成形凹模', site: 1, inProcess: 2, repair: 1, maint: 0, scrap: 0 },
  { itemNo: '60024901201006', itemName: '7668SO成形凸模', site: 2, inProcess: 1, repair: 0, maint: 2, scrap: 1 },
  { itemNo: '60024901201007', itemName: '7667SO成形凹模', site: 3, inProcess: 2, repair: 1, maint: 0, scrap: 0 },
  { itemNo: '60024901201008', itemName: '7666SO成形凸模', site: 1, inProcess: 0, repair: 0, maint: 1, scrap: 2 },
]

const KPI_CARDS = [
  { label: '模具总数', value: '257', unit: '套', color: '#1e5fa8', bg: '#eff6ff' },
  { label: '使用中', value: '164', unit: '套', color: '#16a34a', bg: '#f0fdf4' },
  { label: '本月维修', value: '14', unit: '次', color: '#d97706', bg: '#fffbeb' },
  { label: '本月保养', value: '34', unit: '次', color: '#7c3aed', bg: '#f5f3ff' },
  { label: '已报废', value: '32', unit: '套', color: '#dc2626', bg: '#fef2f2' },
]

export default function MoldStatisticsPage() {
  const [factoryFilter, setFactoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('2024')

  return (
    <MainLayout>
      <div className="p-4 h-full overflow-auto bg-[#f5f6f8]">
        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded px-3 py-2 mb-4 flex items-center gap-2 flex-wrap">
          {/* Factory */}
          <div className="relative">
            <select
              value={factoryFilter}
              onChange={(e) => setFactoryFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded pl-3 pr-8 py-1.5 text-[13px] w-36 focus:outline-none bg-white text-gray-600"
            >
              <option value="">所属工厂</option>
              {factories.map((f) => <option key={f}>{f}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Type */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded pl-3 pr-8 py-1.5 text-[13px] w-36 focus:outline-none bg-white text-gray-600"
            >
              <option value="">模具类型</option>
              {moldTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Year */}
          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded pl-3 pr-8 py-1.5 text-[13px] w-28 focus:outline-none bg-white text-gray-600"
            >
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          <button className="flex items-center gap-1.5 text-[13px] text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 transition-colors">
            <Filter size={13} className="text-gray-500" /> 综合过滤
          </button>
          <button
            onClick={() => { setFactoryFilter(''); setTypeFilter(''); setYearFilter('2024') }}
            className="flex items-center gap-1.5 text-[13px] text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={13} className="text-gray-500" /> 重置
          </button>
          <button className="flex items-center gap-1.5 text-[13px] text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 transition-colors">
            <Save size={13} className="text-gray-500" /> 保存
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded transition-colors">
              <RefreshCw size={14} />
            </button>
            <button className="flex items-center gap-1.5 text-[13px] text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 transition-colors">
              <Download size={13} /> 导出
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {KPI_CARDS.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4"
              style={{ borderLeftWidth: 3, borderLeftColor: card.color }}
            >
              <p className="text-[12px] text-gray-500 mb-1">{card.label}</p>
              <div className="flex items-end gap-1">
                <span className="text-[26px] font-bold leading-none" style={{ color: card.color }}>{card.value}</span>
                <span className="text-[12px] text-gray-400 mb-0.5">{card.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row 1: Bar + Pie */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Model distribution bar chart */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-[14px] font-medium text-gray-800 mb-3">各型号模具数量统计</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={moldTypeStats} barSize={18} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="active" name="使用中" fill="#1e5fa8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="inactive" name="已停用" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="scrapped" name="已报废" fill="#fca5a5" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-[14px] font-medium text-gray-800 mb-3">模具状态分布</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusPie}
                  cx="50%"
                  cy="46%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusPie.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value, entry: any) => `${value} (${entry.payload.value})`}
                />
                <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 4 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2: Line trends + Age pie */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Repair trend line */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-[14px] font-medium text-gray-800 mb-3">本年维修次数趋势</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={repairTrend} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 4 }} />
                <Line type="monotone" dataKey="count" name="维修次数" stroke="#1e5fa8" strokeWidth={2} dot={{ r: 3, fill: '#1e5fa8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Maintenance completion */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-[14px] font-medium text-gray-800 mb-3">本年保养计划完成趋势</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={maintTrend} barSize={14} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 4 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="planned" name="计划" fill="#bfdbfe" radius={[2, 2, 0, 0]} />
                <Bar dataKey="done" name="完成" fill="#1e5fa8" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Age distribution pie */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-[14px] font-medium text-gray-800 mb-3">模具使用年限分布</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={agePie}
                  cx="50%"
                  cy="44%"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {agePie.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value, entry: any) => `${value} (${entry.payload.value}套)`}
                />
                <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 4 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detail Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-[14px] font-medium text-gray-800">品号明细统计</h3>
            <span className="text-[12px] text-gray-400">共 {itemStats.length} 个品号</span>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-gray-600 font-medium">品号</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">品名</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">现场仓</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">委外中</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">待修仓</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">待保养仓</th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">已报废</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">可用率</th>
              </tr>
            </thead>
            <tbody>
              {itemStats.map((row, i) => {
                const total = row.site + row.inProcess + row.repair + row.maint + row.scrap
                const available = row.site + row.inProcess
                const rate = Math.round((available / total) * 100)
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[#1e5fa8] font-medium">{row.itemNo}</td>
                    <td className="px-4 py-3 text-gray-800">{row.itemName}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.site}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[#1e5fa8] font-medium">{row.inProcess}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-orange-500">{row.repair}</td>
                    <td className="px-4 py-3 text-right text-amber-500">{row.maint}</td>
                    <td className="px-4 py-3 text-right text-red-400">{row.scrap}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full rounded-full bg-[#1e5fa8]"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 w-8">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-4 py-3 text-gray-800 font-semibold" colSpan={2}>合计</td>
                <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                  {itemStats.reduce((s, r) => s + r.site, 0)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#1e5fa8]">
                  {itemStats.reduce((s, r) => s + r.inProcess, 0)}
                </td>
                <td className="px-4 py-3 text-right text-orange-600 font-semibold">
                  {itemStats.reduce((s, r) => s + r.repair, 0)}
                </td>
                <td className="px-4 py-3 text-right text-amber-600 font-semibold">
                  {itemStats.reduce((s, r) => s + r.maint, 0)}
                </td>
                <td className="px-4 py-3 text-right text-red-500 font-semibold">
                  {itemStats.reduce((s, r) => s + r.scrap, 0)}
                </td>
                <td className="px-4 py-3 text-[12px] text-gray-500">
                  综合可用率 {Math.round(
                    itemStats.reduce((s, r) => s + r.site + r.inProcess, 0) /
                    itemStats.reduce((s, r) => s + r.site + r.inProcess + r.repair + r.maint + r.scrap, 0) * 100
                  )}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}
