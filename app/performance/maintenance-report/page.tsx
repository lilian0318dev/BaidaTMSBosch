'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Calendar } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart,
} from 'recharts'

const completionData = [
  { name: '已完成', value: 15, color: '#22c55e' },
  { name: '逾期', value: 3, color: '#ef4444' },
  { name: '待执行', value: 7, color: '#f97316' },
]

const trendData = [
  { month: '2026-01', planned: 8, done: 7 },
  { month: '2026-02', planned: 6, done: 6 },
  { month: '2026-03', planned: 9, done: 7 },
  { month: '2026-04', planned: 7, done: 6 },
  { month: '2026-05', planned: 10, done: 9 },
  { month: '2026-06', planned: 8, done: 5 },
]

const workerData = [
  { name: '张三', tasks: 9, completed: 8, rate: 88.9 },
  { name: '李四', tasks: 7, completed: 7, rate: 100 },
  { name: '王五', tasks: 6, completed: 5, rate: 83.3 },
  { name: '赵六', tasks: 5, completed: 4, rate: 80 },
  { name: '孙七', tasks: 8, completed: 6, rate: 75 },
]

const overdueList = [
  { moldId: 'MD-002', moldName: '仪表盘支架模具B', level: '一级保养', planDate: '2026-05-28', overdueDays: 14, location: '百达电器新工厂' },
  { moldId: 'MD-004', moldName: '排气管夹具模具D', level: '二级保养', planDate: '2026-06-01', overdueDays: 10, location: '百达电器新工厂' },
  { moldId: 'MD-008', moldName: '车门内饰板模具H', level: '定期检修', planDate: '2026-06-05', overdueDays: 6, location: '百达电器新工厂' },
]

export default function MaintenanceReportPage() {
  const [period, setPeriod] = useState<'week' | 'month'>('month')

  const total = completionData.reduce((s, d) => s + d.value, 0)
  const done = completionData.find((d) => d.name === '已完成')?.value ?? 0
  const overdue = completionData.find((d) => d.name === '逾期')?.value ?? 0
  const rate = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <MainLayout>
      <div className="p-4 overflow-auto h-full">
        {/* Date filter bar */}
        <div className="bg-white rounded p-3 mb-4 flex items-center justify-between border border-gray-100">
          <div>
            <div className="text-[11px] text-gray-500 mb-1">保养时间</div>
            <div className="flex items-center border border-gray-200 rounded px-3 py-1.5 cursor-pointer bg-gray-50">
              <span className="text-[13px] text-gray-700">2026-01-01 — 2026-06-30</span>
              <Calendar size={13} className="ml-2 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setPeriod('week')} className={`px-3 py-1.5 text-[12px] rounded border transition-colors ${period === 'week' ? 'bg-[#1e5fa8] text-white border-[#1e5fa8]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>周</button>
            <button onClick={() => setPeriod('month')} className={`px-3 py-1.5 text-[12px] rounded border transition-colors ${period === 'month' ? 'bg-[#1e5fa8] text-white border-[#1e5fa8]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>月</button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: '计划保养总数', value: total, color: '#6b7280', bg: 'bg-gray-50' },
            { label: '已完成', value: done, color: '#16a34a', bg: 'bg-green-50' },
            { label: '逾期未保养', value: overdue, color: '#dc2626', bg: 'bg-red-50' },
            { label: '保养完成率', value: `${rate}%`, color: '#0ea5e9', bg: 'bg-sky-50' },
          ].map((k) => (
            <div key={k.label} className={`${k.bg} rounded p-4 text-center border border-gray-100`}>
              <div className="text-[11px] text-gray-500 mb-1">{k.label}</div>
              <div className="text-3xl font-bold" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Completion pie */}
          <div className="bg-white rounded p-4 border border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-3">保养执行状态分布</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={completionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {completionData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5">
                {completionData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-[12px]">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-semibold text-gray-800 ml-auto pl-3">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trend chart */}
          <div className="bg-white rounded p-4 border border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-1">保养计划达成趋势</h3>
            <div className="text-[11px] text-gray-400 mb-2">数量</div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="planned" fill="#9ca3af" name="计划数" />
                <Bar dataKey="done" fill="#22c55e" name="完成数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Worker performance */}
          <div className="bg-white rounded p-4 border border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-1">保养人员工作效率</h3>
            <div className="flex justify-between text-[11px] text-gray-400 mb-2">
              <span>任务数</span><span>完成率 (%)</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={workerData} margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="tasks" fill="#3b82f6" name="计划任务数" />
                <Bar yAxisId="left" dataKey="completed" fill="#22c55e" name="已完成任务数" />
                <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#f97316" strokeWidth={2} dot={{ r: 4, fill: '#f97316' }} name="完成率(%)" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><div className="w-4 h-3 rounded-sm bg-blue-500" /> 计划任务数</div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><div className="w-4 h-3 rounded-sm bg-green-500" /> 已完成任务数</div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><div className="w-4 h-0.5 bg-orange-400" /> 完成率</div>
            </div>
          </div>

          {/* Overdue trend */}
          <div className="bg-white rounded p-4 border border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-1">逾期保养趋势</h3>
            <div className="text-[11px] text-gray-400 mb-2">件数</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="planned" stroke="#9ca3af" strokeDasharray="4 4" dot={false} name="计划" />
                <Line type="monotone" dataKey="done" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} name="逾期" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overdue list */}
        <div className="bg-white rounded border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-700">逾期未保养列表</h3>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200">
                {['模工具编号', '模工具名称', '保养级别', '计划日期', '逾期天数', '当前位置', '操作'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium text-[12px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overdueList.map((row) => (
                <tr key={row.moldId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-blue-500 font-medium">{row.moldId}</td>
                  <td className="px-4 py-3 text-gray-700">{row.moldName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-orange-50 text-orange-700 font-medium">{row.level}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.planDate}</td>
                  <td className="px-4 py-3">
                    <span className="text-red-500 font-medium">{row.overdueDays}天</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.location}</td>
                  <td className="px-4 py-3">
                    <button className="text-[12px] text-blue-500 hover:underline">查看详情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}
