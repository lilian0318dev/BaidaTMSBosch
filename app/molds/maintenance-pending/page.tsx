'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Package, CheckCircle, AlertTriangle, Calendar, Search, Download, RefreshCw } from 'lucide-react'

// 模拟数据
const PENDING_MAINTENANCE = [
  { id: 'M009', name: '7665SO成形凹模', itemNo: '60024901201009', spec: 'A2737665', warehouse: '待保养库-A区', totalCount: 48520, lastMaintenance: '2026-03-15', dueDate: '2026-06-15', status: 'overdue' },
  { id: 'M011', name: '7663SO成形凸模', itemNo: '60024901201011', spec: 'A2737663', warehouse: '待保养库-A区', totalCount: 35680, lastMaintenance: '2026-04-20', dueDate: '2026-07-20', status: 'normal' },
  { id: 'M012', name: '7662SO成形凹模', itemNo: '60024901201012', spec: 'A2737662', warehouse: '待保养库-B区', totalCount: 52340, lastMaintenance: '2026-05-10', dueDate: '2026-08-10', status: 'normal' },
  { id: 'M013', name: '7661SO成形凸模', itemNo: '60024901201013', spec: 'A2737661', warehouse: '待保养库-B区', totalCount: 28920, lastMaintenance: '2026-05-25', dueDate: '2026-08-25', status: 'normal' },
  { id: 'M014', name: '7660SO成形凹模', itemNo: '60024901201014', spec: 'A2737660', warehouse: '待保养库-C区', totalCount: 61280, lastMaintenance: '2026-02-28', dueDate: '2026-05-28', status: 'overdue' },
]

const MAINTENANCE_RECORDS = [
  { id: 'MR001', moldId: 'M009', moldName: '7665SO成形凹模', type: '二级保养', operator: '张师傅', date: '2026-03-15', items: '润滑脂更换、导柱清洁、型腔抛光', result: '合格' },
  { id: 'MR002', moldId: 'M011', moldName: '7663SO成形凸模', type: '二级保养', operator: '李师傅', date: '2026-04-20', items: '润滑脂更换、顶针检查', result: '合格' },
]

export default function MaintenancePendingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filteredData = PENDING_MAINTENANCE.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredData.map(item => item.id))
    }
  }

  const overdueCount = PENDING_MAINTENANCE.filter(item => item.status === 'overdue').length

  return (
    <MainLayout>
      <div className="p-4 h-full bg-gray-50 overflow-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Package size={22} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">待保养库</div>
              <div className="text-[12px] text-gray-500">二级保养入库管理 · 待保养模具清单</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Calendar size={13} className="text-gray-400" />
              <span>逾期保养：{overdueCount} 项</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={14} />
              导出
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors">
              <RefreshCw size={14} />
              同步状态
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-[12px] text-gray-500 mb-1">待保养模具</div>
            <div className="text-2xl font-bold text-gray-800">{PENDING_MAINTENANCE.length}</div>
            <div className="text-[11px] text-gray-400 mt-1">副</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-[12px] text-gray-500 mb-1">逾期保养</div>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <div className="text-[11px] text-gray-400 mt-1">副需紧急处理</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-[12px] text-gray-500 mb-1">本月完成保养</div>
            <div className="text-2xl font-bold text-green-600">{MAINTENANCE_RECORDS.length}</div>
            <div className="text-[11px] text-gray-400 mt-1">副</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-[12px] text-gray-500 mb-1">累计加工次数</div>
            <div className="text-2xl font-bold text-blue-600">
              {PENDING_MAINTENANCE.reduce((sum, item) => sum + item.totalCount, 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">模次</div>
          </div>
        </div>

        {/* 搜索和操作栏 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索模具编号、名称、品号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={selectAll}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input type="checkbox" checked={selectedIds.length === filteredData.length && filteredData.length > 0} onChange={selectAll} />
                全选
              </button>
              <button className="px-3 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
                创建保养任务
              </button>
            </div>
          </div>
        </div>

        {/* 待保养模具列表 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">待保养模具清单</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[12px]">
                <th className="px-4 py-2.5 text-left font-medium w-12">
                  <input type="checkbox" checked={selectedIds.length === filteredData.length && filteredData.length > 0} onChange={selectAll} />
                </th>
                <th className="px-4 py-2.5 text-left font-medium">模具编号</th>
                <th className="px-4 py-2.5 text-left font-medium">模具名称</th>
                <th className="px-4 py-2.5 text-left font-medium">品号</th>
                <th className="px-4 py-2.5 text-left font-medium">规格</th>
                <th className="px-4 py-2.5 text-left font-medium">存放位置</th>
                <th className="px-4 py-2.5 text-left font-medium">累计加工</th>
                <th className="px-4 py-2.5 text-left font-medium">上次保养</th>
                <th className="px-4 py-2.5 text-left font-medium">到期日期</th>
                <th className="px-4 py-2.5 text-left font-medium">状态</th>
                <th className="px-4 py-2.5 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-blue-600 hover:underline text-sm cursor-pointer">{item.id}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.itemNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.spec}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.warehouse}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.totalCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.lastMaintenance}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${item.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {item.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'overdue' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-medium">
                        <AlertTriangle size={10} /> 已逾期
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-medium">
                        <CheckCircle size={10} /> 正常
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors">
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 近期保养记录 */}
        <div className="mt-5 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">近期保养记录</h3>
          <div className="space-y-2">
            {MAINTENANCE_RECORDS.map((record) => (
              <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{record.moldName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-600">{record.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{record.date}</span>
                    <span>·</span>
                    <span>{record.operator}</span>
                    <span>·</span>
                    <span className="text-green-600">检验{record.result}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 max-w-xs truncate">{record.items}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
