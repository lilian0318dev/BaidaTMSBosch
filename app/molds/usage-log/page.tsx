'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import {
  ArrowUpCircle, ArrowDownCircle, Search, Scan, Package,
  Factory, CheckCircle, AlertTriangle, Calendar, Clock
} from 'lucide-react'

// 模拟数据
const DEVICES = [
  { id: 'DEV-001', name: '冲压机A01', line: '一车间-01产线' },
  { id: 'DEV-002', name: '冲压机A02', line: '一车间-01产线' },
  { id: 'DEV-003', name: '注塑机B01', line: '二车间-02产线' },
  { id: 'DEV-004', name: '注塑机B02', line: '二车间-02产线' },
  { id: 'DEV-005', name: '压铸机C01', line: '三车间-03产线' },
  { id: 'DEV-006', name: '精锻机D01', line: '一车间-01产线' },
]

const MOLDS_IN_STOCK = [
  { id: 'M001', name: '7686SO三工位成形凹模', itemNo: '60024901201001', spec: 'A2737686', currentLocation: '成品仓-A区' },
  { id: 'M002', name: '7686SO三工位成形凸模', itemNo: '60024901201002', spec: 'A2737686', currentLocation: '成品仓-A区' },
  { id: 'M003', name: '7670SO成形凹模', itemNo: '60024901201003', spec: 'A2737670', currentLocation: '成品仓-B区' },
  { id: 'M004', name: '7670SO成形凸模', itemNo: '60024901201004', spec: 'A2737670', currentLocation: '成品仓-B区' },
  { id: 'M005', name: '7669SO成形凹模', itemNo: '60024901201005', spec: 'A2737669', currentLocation: '成品仓-C区' },
]

const MOLDS_IN_USE = [
  { id: 'M006', name: '7668SO成形凸模', itemNo: '60024901201006', spec: 'A2737668', device: 'DEV-001', deviceName: '冲压机A01', line: '一车间-01产线', installedAt: '2026-06-20 08:30', processCount: 5280, totalCount: 45680 },
  { id: 'M007', name: '7667SO成形凹模', itemNo: '60024901201007', spec: 'A2737667', device: 'DEV-003', deviceName: '注塑机B01', line: '二车间-02产线', installedAt: '2026-06-18 10:15', processCount: 3120, totalCount: 38920 },
  { id: 'M008', name: '7666SO成形凸模', itemNo: '60024901201008', spec: 'A2737666', device: 'DEV-005', deviceName: '压铸机C01', line: '三车间-03产线', installedAt: '2026-06-22 09:00', processCount: 1860, totalCount: 25680 },
]

const USAGE_LOGS = [
  { id: 'UL001', type: 'install', moldId: 'M006', moldName: '7668SO成形凸模', device: 'DEV-001', deviceName: '冲压机A01', line: '一车间-01产线', operator: '张师傅', time: '2026-06-20 08:30', beforeLocation: '成品仓-A区', afterLocation: '现场仓/一车间-01产线-冲压机A01' },
  { id: 'UL002', type: 'install', moldId: 'M007', moldName: '7667SO成形凹模', device: 'DEV-003', deviceName: '注塑机B01', line: '二车间-02产线', operator: '李师傅', time: '2026-06-18 10:15', beforeLocation: '成品仓-B区', afterLocation: '现场仓/二车间-02产线-注塑机B01' },
  { id: 'UL003', type: 'uninstall', moldId: 'M009', moldName: '7665SO成形凹模', device: 'DEV-002', deviceName: '冲压机A02', line: '一车间-01产线', operator: '王师傅', time: '2026-06-19 16:30', beforeLocation: '现场仓/一车间-01产线-冲压机A02', afterLocation: '待保养库', remark: '二级保养', processCount: 1560, totalCount: 48520 },
  { id: 'UL004', type: 'uninstall', moldId: 'M010', moldName: '7664SO成形凸模', device: 'DEV-004', deviceName: '注塑机B02', line: '二车间-02产线', operator: '赵师傅', time: '2026-06-21 14:00', beforeLocation: '现场仓/二车间-02产线-注塑机B02', afterLocation: '待修仓', remark: '型腔磨损', processCount: 2380, totalCount: 52360 },
  { id: 'UL005', type: 'install', moldId: 'M008', moldName: '7666SO成形凸模', device: 'DEV-005', deviceName: '压铸机C01', line: '三车间-03产线', operator: '孙师傅', time: '2026-06-22 09:00', beforeLocation: '成品仓-C区', afterLocation: '现场仓/三车间-03产线-压铸机C01' },
]

export default function MoldUsageLogPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'install' | 'uninstall'>('install')
  const [deviceSearch, setDeviceSearch] = useState('')
  const [moldSearch, setMoldSearch] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [selectedMold, setSelectedMold] = useState<string>('')
  const [selectedMolds, setSelectedMolds] = useState<string[]>([])
  const [processCount, setProcessCount] = useState('')
  const [uninstallReason, setUninstallReason] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successType, setSuccessType] = useState<'install' | 'uninstall'>('install')

  const filteredDevices = DEVICES.filter(d => 
    d.id.toLowerCase().includes(deviceSearch.toLowerCase()) ||
    d.name.toLowerCase().includes(deviceSearch.toLowerCase())
  )

  const filteredMolds = activeTab === 'install'
    ? MOLDS_IN_STOCK.filter(m => 
        m.id.toLowerCase().includes(moldSearch.toLowerCase()) ||
        m.name.toLowerCase().includes(moldSearch.toLowerCase()) ||
        m.itemNo.toLowerCase().includes(moldSearch.toLowerCase())
      )
    : MOLDS_IN_USE.filter(m => 
        m.id.toLowerCase().includes(moldSearch.toLowerCase()) ||
        m.name.toLowerCase().includes(moldSearch.toLowerCase()) ||
        m.itemNo.toLowerCase().includes(moldSearch.toLowerCase())
      )

  const handleSubmit = () => {
    if (activeTab === 'install') {
      if (!selectedDevice || selectedMolds.length === 0) {
        alert('请选择设备并添加至少一个模具')
        return
      }
      setSuccessType(activeTab)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setSelectedDevice('')
        setSelectedMold('')
        setSelectedMolds([])
        setProcessCount('')
        setUninstallReason('')
      }, 2000)
    } else {
      if (!selectedDevice || !selectedMold || !processCount || !uninstallReason) {
        alert('请填写完整信息')
        return
      }
      setSuccessType(activeTab)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        if (uninstallReason === 'level2') {
          router.push('/maintenance/tasks/new')
        } else if (uninstallReason === 'repair') {
          router.push('/maintenance/repair-request')
        } else {
          setSelectedDevice('')
          setSelectedMold('')
          setSelectedMolds([])
          setProcessCount('')
          setUninstallReason('')
        }
      }, 1500)
    }
  }

  return (
    <MainLayout>
      <div className="p-4 h-full bg-gray-50 overflow-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Factory size={22} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">模具使用记录</div>
              <div className="text-[12px] text-gray-500">上模/下模登记 · 位置变更管理</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Calendar size={13} className="text-gray-400" />
              <span>今日登记：5 条</span>
            </div>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setActiveTab('install'); setSelectedDevice(''); setSelectedMold(''); setSelectedMolds([]) }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'install'
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ArrowUpCircle size={16} />
            上模登记
          </button>
          <button
            onClick={() => { setActiveTab('uninstall'); setSelectedDevice(''); setSelectedMold(''); setSelectedMolds([]) }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'uninstall'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ArrowDownCircle size={16} />
            下模登记
          </button>
        </div>

        {/* 表单区域 */}
        <div className="grid grid-cols-12 gap-4 mb-5">
          {/* 左侧表单 */}
          <div className="col-span-5 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              {activeTab === 'install' ? <ArrowUpCircle size={14} className="text-green-600" /> : <ArrowDownCircle size={14} className="text-orange-500" />}
              {activeTab === 'install' ? '上模信息' : '下模信息'}
            </h3>

            {/* 设备选择 */}
            <div className="mb-4">
              <label className="block text-[12px] font-medium text-gray-700 mb-2">设备编号 *</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="扫描或输入设备编号/名称"
                  value={deviceSearch}
                  onChange={(e) => { setDeviceSearch(e.target.value); setSelectedDevice('') }}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
              {deviceSearch && (
                <div className="mt-2 max-h-40 overflow-auto border border-gray-200 rounded-lg bg-white">
                  {filteredDevices.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { setSelectedDevice(d.id); setDeviceSearch('') }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span>{d.id} · {d.name}</span>
                      <span className="text-xs text-gray-400">{d.line}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedDevice && (
                <div className="mt-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-sm text-gray-700">
                      {DEVICES.find(d => d.id === selectedDevice)?.name}
                      <span className="text-gray-400 ml-2">({DEVICES.find(d => d.id === selectedDevice)?.line})</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 模具选择 */}
            <div className="mb-4">
              <label className="block text-[12px] font-medium text-gray-700 mb-2">
                模具编号 *
                {activeTab === 'install' && <span className="text-gray-400 ml-2">（可扫描添加多个）</span>}
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="扫描或输入模具编号/名称"
                  value={moldSearch}
                  onChange={(e) => { setMoldSearch(e.target.value); setSelectedMold('') }}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${
                    activeTab === 'install'
                      ? 'focus:border-green-500 focus:ring-green-100'
                      : 'focus:border-orange-500 focus:ring-orange-100'
                  }`}
                />
              </div>
              {moldSearch && (
                <div className="mt-2 max-h-40 overflow-auto border border-gray-200 rounded-lg bg-white">
                  {filteredMolds
                    .filter(m => activeTab === 'install' ? !selectedMolds.includes(m.id) : true)
                    .map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (activeTab === 'install') {
                          setSelectedMolds(prev => [...prev, m.id])
                          setMoldSearch('')
                        } else {
                          setSelectedMold(m.id)
                          setMoldSearch('')
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <span>{m.id} · {m.name}</span>
                        <span className="text-xs text-gray-400">{m.itemNo}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{m.spec} · {activeTab === 'install' ? m.currentLocation : `${m.line} · ${m.deviceName}`}</div>
                    </button>
                  ))}
                </div>
              )}
              {activeTab === 'install' && selectedMolds.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {selectedMolds.map((moldId) => {
                    const m = filteredMolds.find(x => x.id === moldId)
                    if (!m) return null
                    return (
                      <div key={moldId} className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle size={14} className="text-green-600 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            {m.id} · {m.name}
                            <span className="text-gray-400 ml-1">({m.itemNo})</span>
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedMolds(prev => prev.filter(id => id !== moldId))}
                          className="text-gray-400 hover:text-red-500 ml-2 shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              {activeTab === 'uninstall' && selectedMold && (
                <div className="mt-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-orange-600" />
                    <span className="text-sm text-gray-700">
                      {filteredMolds.find(m => m.id === selectedMold)?.name}
                      <span className="text-gray-400 ml-2">({filteredMolds.find(m => m.id === selectedMold)?.itemNo})</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 下模专用字段 */}
            {activeTab === 'uninstall' && (
              <>
                <div className="mb-4">
                  <label className="block text-[12px] font-medium text-gray-700 mb-2">本次加工次数 *</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="输入本次加工次数"
                      value={processCount}
                      onChange={(e) => setProcessCount(e.target.value)}
                      className="w-full pl-3 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[12px] font-medium text-gray-700 mb-2">下模原因 *</label>
                  <select
                    value={uninstallReason}
                    onChange={(e) => setUninstallReason(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white"
                  >
                    <option value="">请选择下模原因</option>
                    <option value="level2">二级保养</option>
                    <option value="repair">维修</option>
                    <option value="change">换型</option>
                    <option value="other">其他</option>
                  </select>
                  {uninstallReason === 'level2' && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 text-xs text-amber-700">
                        <AlertTriangle size={12} />
                        下模后将跳转至保养任务申请
                      </div>
                    </div>
                  )}
                  {uninstallReason === 'repair' && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 text-xs text-red-700">
                        <AlertTriangle size={12} />
                        下模后将跳转至维修申请
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'install'
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30'
              }`}
            >
              {activeTab === 'install' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
              {activeTab === 'install' ? '确认上模' : '确认下模'}
            </button>
          </div>

          {/* 右侧信息面板 */}
          <div className="col-span-7">
            {/* 当前选中信息 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package size={14} className="text-blue-600" />
                当前选中信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-[11px] text-gray-400 mb-1">设备信息</div>
                  {selectedDevice ? (
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">{DEVICES.find(d => d.id === selectedDevice)?.name}</div>
                      <div className="text-xs text-gray-500">{DEVICES.find(d => d.id === selectedDevice)?.line}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">未选择设备</div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-[11px] text-gray-400 mb-1">
                    {activeTab === 'install' ? `已选模具（${selectedMolds.length}个）` : '模具信息'}
                  </div>
                  {activeTab === 'install' ? (
                    selectedMolds.length > 0 ? (
                      <div className="text-sm font-medium text-green-600">
                        {selectedMolds.length} 个模具待上模
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">未添加模具</div>
                    )
                  ) : (
                    selectedMold ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">{filteredMolds.find(m => m.id === selectedMold)?.name}</div>
                        <div className="text-xs text-gray-500">{filteredMolds.find(m => m.id === selectedMold)?.spec}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">未选择模具</div>
                    )
                  )}
                </div>
              </div>

              {activeTab === 'install' && selectedMolds.length > 0 && (
                <div className="mt-4">
                  <div className="text-[11px] text-gray-400 mb-2">已选模具列表</div>
                  <div className="max-h-40 overflow-auto border border-gray-200 rounded-lg">
                    {selectedMolds.map((moldId) => {
                      const m = filteredMolds.find(x => x.id === moldId)
                      if (!m) return null
                      return (
                        <div key={moldId} className="px-3 py-2 border-b border-gray-100 last:border-b-0 flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-sm text-gray-800 truncate">{m.id} · {m.name}</div>
                            <div className="text-xs text-gray-400">{m.spec} · {m.currentLocation}</div>
                          </div>
                          <button
                            onClick={() => setSelectedMolds(prev => prev.filter(id => id !== moldId))}
                            className="text-gray-400 hover:text-red-500 ml-2 shrink-0"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {((activeTab === 'install' && selectedDevice && selectedMolds.length > 0) ||
                (activeTab === 'uninstall' && selectedDevice && selectedMold)) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-[11px] text-gray-400 mb-2">位置变更预览</div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {activeTab === 'install' 
                        ? '成品仓'
                        : `现场仓/${filteredMolds.find(m => m.id === selectedMold)?.line}-${filteredMolds.find(m => m.id === selectedMold)?.deviceName}`
                      }
                    </span>
                    <ArrowUpCircle size={14} className="text-gray-400" />
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {activeTab === 'install' 
                        ? `现场仓/${DEVICES.find(d => d.id === selectedDevice)?.line}-${DEVICES.find(d => d.id === selectedDevice)?.name}`
                        : (uninstallReason === 'level2' ? '待保养库' : uninstallReason === 'repair' ? '待修仓' : '成品仓')
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 使用记录 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={14} className="text-purple-600" />
                最近使用记录
              </h3>
              <div className="space-y-2">
                {USAGE_LOGS.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      log.type === 'install' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {log.type === 'install' 
                        ? <ArrowUpCircle size={16} className="text-green-600" /> 
                        : <ArrowDownCircle size={16} className="text-orange-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{log.moldName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          log.type === 'install' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {log.type === 'install' ? '上模' : '下模'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{log.deviceName}</span>
                        <span>·</span>
                        <span>{log.line}</span>
                        <span>·</span>
                        <span>{log.time}</span>
                        <span>·</span>
                        <span>{log.operator}</span>
                      </div>
                    </div>
                    {log.type === 'uninstall' && log.processCount && (
                      <div className="text-right shrink-0">
                        <div className="text-xs text-gray-400">本次加工</div>
                        <div className="text-sm font-bold text-gray-800">{log.processCount}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 成功提示 */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className={`bg-white rounded-xl p-6 text-center shadow-2xl ${
              successType === 'install' ? 'border-green-300' : 'border-orange-300'
            }`}>
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                successType === 'install' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {successType === 'install' 
                  ? <ArrowUpCircle size={32} className="text-green-600" /> 
                  : <ArrowDownCircle size={32} className="text-orange-600" />
                }
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {successType === 'install' ? '上模成功' : '下模成功'}
              </h3>
              <p className="text-sm text-gray-500">
                {successType === 'install' 
                  ? '模具已安装到指定设备，位置已更新为现场仓' 
                  : uninstallReason === 'level2'
                    ? '下模成功，即将跳转至保养任务申请...'
                    : uninstallReason === 'repair'
                      ? '下模成功，即将跳转至维修申请...'
                      : '模具已下模，加工次数已累计'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
