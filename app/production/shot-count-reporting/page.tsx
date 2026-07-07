'use client'

import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RotateCcw, Eye, Plus, X, FileText,
  Factory, Package, Clock, Calendar, User, ChevronDown,
  AlertTriangle, Edit2, Trash2, History,
} from 'lucide-react'

interface MoldInProduction {
  id: string
  moldCode: string
  moldName: string
  deviceCode: string
  deviceName: string
  line: string
  installedAt: string
  totalShotCount: number
  thisInstallShotCount: number
}

interface ShotRecord {
  id: string
  moldCode: string
  moldName: string
  deviceCode: string
  deviceName: string
  shotCount: number
  cumulativeCount: number
  operator: string
  recordTime: string
  remark?: string
  abnormal?: string
  stopReason?: string
}

const MOLDS_IN_PRODUCTION: MoldInProduction[] = [
  {
    id: '1',
    moldCode: 'M006',
    moldName: '7668SO成形凸模',
    deviceCode: 'DEV-001',
    deviceName: '冲压机A01',
    line: '一车间-01产线',
    installedAt: '2026-06-20 08:30',
    totalShotCount: 45680,
    thisInstallShotCount: 5280,
  },
  {
    id: '2',
    moldCode: 'M007',
    moldName: '7667SO成形凹模',
    deviceCode: 'DEV-003',
    deviceName: '注塑机B01',
    line: '二车间-02产线',
    installedAt: '2026-06-18 10:15',
    totalShotCount: 38920,
    thisInstallShotCount: 3120,
  },
  {
    id: '3',
    moldCode: 'M008',
    moldName: '7666SO成形凸模',
    deviceCode: 'DEV-005',
    deviceName: '压铸机C01',
    line: '三车间-03产线',
    installedAt: '2026-06-22 09:00',
    totalShotCount: 25680,
    thisInstallShotCount: 1860,
  },
  {
    id: '4',
    moldCode: 'M015',
    moldName: '7658SO成形凸模',
    deviceCode: 'DEV-002',
    deviceName: '冲压机A02',
    line: '一车间-01产线',
    installedAt: '2026-06-25 07:45',
    totalShotCount: 32450,
    thisInstallShotCount: 2150,
  },
  {
    id: '5',
    moldCode: 'M020',
    moldName: '7650SO成形凸模',
    deviceCode: 'DEV-006',
    deviceName: '精锻机D01',
    line: '一车间-01产线',
    installedAt: '2026-06-28 08:00',
    totalShotCount: 12580,
    thisInstallShotCount: 980,
  },
]

const SHOT_RECORDS: ShotRecord[] = [
  {
    id: 'SR-001',
    moldCode: 'M006',
    moldName: '7668SO成形凸模',
    deviceCode: 'DEV-001',
    deviceName: '冲压机A01',
    shotCount: 1200,
    cumulativeCount: 41600,
    operator: '张师傅',
    recordTime: '2026-06-28 08:00',
  },
  {
    id: 'SR-002',
    moldCode: 'M006',
    moldName: '7668SO成形凸模',
    deviceCode: 'DEV-001',
    deviceName: '冲压机A01',
    shotCount: 800,
    cumulativeCount: 42400,
    operator: '张师傅',
    recordTime: '2026-06-28 12:00',
    remark: '上午班生产正常',
  },
  {
    id: 'SR-003',
    moldCode: 'M006',
    moldName: '7668SO成形凸模',
    deviceCode: 'DEV-001',
    deviceName: '冲压机A01',
    shotCount: 1500,
    cumulativeCount: 43900,
    operator: '李师傅',
    recordTime: '2026-06-28 20:00',
    abnormal: '产品有轻微飞边',
  },
  {
    id: 'SR-004',
    moldCode: 'M006',
    moldName: '7668SO成形凸模',
    deviceCode: 'DEV-001',
    deviceName: '冲压机A01',
    shotCount: 1780,
    cumulativeCount: 45680,
    operator: '张师傅',
    recordTime: '2026-06-30 10:30',
    stopReason: '模具保养停机',
  },
  {
    id: 'SR-005',
    moldCode: 'M007',
    moldName: '7667SO成形凹模',
    deviceCode: 'DEV-003',
    deviceName: '注塑机B01',
    shotCount: 2000,
    cumulativeCount: 37800,
    operator: '王师傅',
    recordTime: '2026-06-28 16:00',
  },
  {
    id: 'SR-006',
    moldCode: 'M007',
    moldName: '7667SO成形凹模',
    deviceCode: 'DEV-003',
    deviceName: '注塑机B01',
    shotCount: 1120,
    cumulativeCount: 38920,
    operator: '赵师傅',
    recordTime: '2026-06-30 09:00',
    remark: '夜班生产',
  },
]

const CURRENT_USER = '张师傅'
const IS_ADMIN = false

export default function ShotCountReportingPage() {
  const [deviceSearch, setDeviceSearch] = useState('')
  const [moldCodeSearch, setMoldCodeSearch] = useState('')
  const [moldNameSearch, setMoldNameSearch] = useState('')
  const [onlyInProduction, setOnlyInProduction] = useState(true)
  const [molds, setMolds] = useState<MoldInProduction[]>(MOLDS_IN_PRODUCTION)
  const [records, setRecords] = useState<ShotRecord[]>(SHOT_RECORDS)

  const [showRecordModal, setShowRecordModal] = useState<MoldInProduction | null>(null)
  const [recordForm, setRecordForm] = useState({ shotCount: '', remark: '', abnormal: '', stopReason: '' })

  const [showHistoryModal, setShowHistoryModal] = useState<MoldInProduction | null>(null)
  const [historyDeviceFilter, setHistoryDeviceFilter] = useState('')
  const [historyMoldFilter, setHistoryMoldFilter] = useState('')
  const [historyDateFrom, setHistoryDateFrom] = useState('')
  const [historyDateTo, setHistoryDateTo] = useState('')

  const filteredMolds = useMemo(() => {
    return molds.filter(m => {
      const matchDevice = !deviceSearch || m.deviceCode.toLowerCase().includes(deviceSearch.toLowerCase()) || m.deviceName.toLowerCase().includes(deviceSearch.toLowerCase())
      const matchCode = !moldCodeSearch || m.moldCode.toLowerCase().includes(moldCodeSearch.toLowerCase())
      const matchName = !moldNameSearch || m.moldName.toLowerCase().includes(moldNameSearch.toLowerCase())
      return matchDevice && matchCode && matchName
    })
  }, [molds, deviceSearch, moldCodeSearch, moldNameSearch])

  const filteredRecords = useMemo(() => {
    if (!showHistoryModal) return []
    return records.filter(r => {
      const matchMold = !showHistoryModal || r.moldCode === showHistoryModal.moldCode
      const matchDevice = !historyDeviceFilter || r.deviceCode.includes(historyDeviceFilter) || r.deviceName.includes(historyDeviceFilter)
      const matchMoldFilter = !historyMoldFilter || r.moldCode.includes(historyMoldFilter) || r.moldName.includes(historyMoldFilter)
      const matchFrom = !historyDateFrom || r.recordTime >= historyDateFrom
      const matchTo = !historyDateTo || r.recordTime <= historyDateTo + ' 23:59:59'
      return matchMold && matchDevice && matchMoldFilter && matchFrom && matchTo
    }).sort((a, b) => b.recordTime.localeCompare(a.recordTime))
  }, [records, showHistoryModal, historyDeviceFilter, historyMoldFilter, historyDateFrom, historyDateTo])

  const handleReset = () => {
    setDeviceSearch('')
    setMoldCodeSearch('')
    setMoldNameSearch('')
  }

  const handleSubmitRecord = () => {
    if (!showRecordModal) return
    const count = Number(recordForm.shotCount)
    if (!count || count <= 0) {
      alert('请输入有效的模次数')
      return
    }

    const newRecord: ShotRecord = {
      id: `SR-${Date.now()}`,
      moldCode: showRecordModal.moldCode,
      moldName: showRecordModal.moldName,
      deviceCode: showRecordModal.deviceCode,
      deviceName: showRecordModal.deviceName,
      shotCount: count,
      cumulativeCount: showRecordModal.totalShotCount + count,
      operator: CURRENT_USER,
      recordTime: new Date().toLocaleString('zh-CN'),
      remark: recordForm.remark || undefined,
      abnormal: recordForm.abnormal || undefined,
      stopReason: recordForm.stopReason || undefined,
    }

    setRecords(prev => [newRecord, ...prev])

    setMolds(prev => prev.map(m =>
      m.id === showRecordModal.id
        ? { ...m, totalShotCount: m.totalShotCount + count, thisInstallShotCount: m.thisInstallShotCount + count }
        : m
    ))

    alert(`模次填报成功！\n\n模具：${showRecordModal.moldName}\n本次新增：${count} 模次\n累计总模次：${showRecordModal.totalShotCount + count}\n\n数据已同步至模具档案。`)

    setShowRecordModal(null)
    setRecordForm({ shotCount: '', remark: '', abnormal: '', stopReason: '' })
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <Factory size={13} className="text-blue-600" />
          <span className="text-xs text-blue-800">
            模次实时报工 · 生产过程中随时填报模次数据 · 实时同步更新模具档案累计生产模次
          </span>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Factory size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">模次实时报工</h1>
              <p className="text-[11px] text-gray-500">已上机模具 · 实时填报生产模次</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setHistoryDeviceFilter('')
                setHistoryMoldFilter('')
                setHistoryDateFrom('')
                setHistoryDateTo('')
                setShowHistoryModal({
                  id: 'all',
                  moldCode: '',
                  moldName: '',
                  deviceCode: '',
                  deviceName: '',
                  line: '',
                  installedAt: '',
                  totalShotCount: 0,
                  thisInstallShotCount: 0,
                } as any)
              }}
              className="flex items-center gap-1.5 h-9 px-4 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <History size={14} /> 历史记录
            </button>
          </div>
        </div>

        <div className="px-5 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={deviceSearch}
                onChange={e => setDeviceSearch(e.target.value)}
                placeholder="设备编号/设备名称"
                className="w-full pl-9 pr-3 h-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e5fa8]"
              />
            </div>
            <div className="relative min-w-[140px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={moldCodeSearch}
                onChange={e => setMoldCodeSearch(e.target.value)}
                placeholder="模具编号"
                className="w-full pl-9 pr-3 h-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e5fa8]"
              />
            </div>
            <div className="relative min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={moldNameSearch}
                onChange={e => setMoldNameSearch(e.target.value)}
                placeholder="模具品名"
                className="w-full pl-9 pr-3 h-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e5fa8]"
              />
            </div>
            <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInProduction}
                onChange={e => setOnlyInProduction(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#1e5fa8] focus:ring-[#1e5fa8]"
              />
              仅显示生产中
            </label>
            <button onClick={handleReset} className="flex items-center gap-1.5 h-8 px-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <RotateCcw size={13} /> 重置
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">设备编号</th>
                  <th className="text-left px-4 py-2.5 font-medium">设备名称</th>
                  <th className="text-left px-4 py-2.5 font-medium">模具编号</th>
                  <th className="text-left px-4 py-2.5 font-medium">模具名称</th>
                  <th className="text-left px-4 py-2.5 font-medium">上机时间</th>
                  <th className="text-left px-4 py-2.5 font-medium">本次上机模次</th>
                  <th className="text-left px-4 py-2.5 font-medium">累计总模次</th>
                  <th className="text-left px-4 py-2.5 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredMolds.map(item => (
                  <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">{item.deviceCode}</td>
                    <td className="px-4 py-3 text-gray-800">{item.deviceName}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.moldCode}</td>
                    <td className="px-4 py-3 text-gray-800">{item.moldName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.installedAt}</td>
                    <td className="px-4 py-3">
                      <span className="text-blue-600 font-medium">{item.thisInstallShotCount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-800 font-semibold">{item.totalShotCount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRecordForm({ shotCount: '', remark: '', abnormal: '', stopReason: '' })
                            setShowRecordModal(item)
                          }}
                          className="px-3 py-1.5 text-xs bg-[#1e5fa8] text-white rounded-lg hover:bg-[#1a4f8f] flex items-center gap-1"
                        >
                          <Plus size={12} /> 录入模次
                        </button>
                        <button
                          onClick={() => {
                            setHistoryDeviceFilter('')
                            setHistoryMoldFilter('')
                            setHistoryDateFrom('')
                            setHistoryDateTo('')
                            setShowHistoryModal(item)
                          }}
                          className="text-[#1e5fa8] text-xs hover:underline flex items-center gap-1"
                        >
                          <Eye size={12} /> 历史
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMolds.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 录入模次弹窗 */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[460px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Factory size={16} className="text-[#1e5fa8]" />
                <h3 className="text-base font-semibold text-gray-800">录入本次模次</h3>
              </div>
              <button onClick={() => { setShowRecordModal(null); setRecordForm({ shotCount: '', remark: '', abnormal: '', stopReason: '' }) }}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-24 shrink-0">设备编号</span>
                  <span className="text-gray-700 font-mono">{showRecordModal.deviceCode}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-24 shrink-0">设备名称</span>
                  <span className="text-gray-800">{showRecordModal.deviceName}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-24 shrink-0">模具编号</span>
                  <span className="text-gray-700 font-mono">{showRecordModal.moldCode}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 text-xs w-24 shrink-0">模具名称</span>
                  <span className="text-gray-800">{showRecordModal.moldName}</span>
                </div>
                <div className="flex items-start pt-1 border-t border-blue-100">
                  <span className="text-gray-400 text-xs w-24 shrink-0">当前累计总模次</span>
                  <span className="text-[#1e5fa8] font-semibold">{showRecordModal.totalShotCount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">本次新增生产模次 <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={recordForm.shotCount}
                  onChange={e => setRecordForm(f => ({ ...f, shotCount: e.target.value }))}
                  placeholder="请输入本次新增模次数"
                  min={1}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                />
                {recordForm.shotCount && Number(recordForm.shotCount) > 0 && (
                  <p className="text-[11px] text-blue-600 mt-1">
                    提交后累计总模次：<span className="font-medium">{(showRecordModal.totalShotCount + Number(recordForm.shotCount)).toLocaleString()}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">生产备注 <span className="text-gray-400">(选填)</span></label>
                <textarea
                  value={recordForm.remark}
                  onChange={e => setRecordForm(f => ({ ...f, remark: e.target.value }))}
                  rows={2}
                  placeholder="如：白班生产、正常运行等"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">异常情况说明 <span className="text-gray-400">(选填)</span></label>
                <textarea
                  value={recordForm.abnormal}
                  onChange={e => setRecordForm(f => ({ ...f, abnormal: e.target.value }))}
                  rows={2}
                  placeholder="如有异常请描述"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">停机原因 <span className="text-gray-400">(选填)</span></label>
                <input
                  value={recordForm.stopReason}
                  onChange={e => setRecordForm(f => ({ ...f, stopReason: e.target.value }))}
                  placeholder="如：模具保养、设备维修等"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowRecordModal(null); setRecordForm({ shotCount: '', remark: '', abnormal: '', stopReason: '' }) }} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleSubmitRecord} className="px-5 h-8 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">提交</button>
            </div>
          </div>
        </div>
      )}

      {/* 历史记录弹窗 */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[820px] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History size={16} className="text-gray-500" />
                <h3 className="text-base font-semibold text-gray-800">
                  {showHistoryModal.moldCode ? `${showHistoryModal.moldName} - 模次填报记录` : '历史模次填报记录'}
                </h3>
              </div>
              <button onClick={() => setShowHistoryModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[140px]">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={historyDeviceFilter}
                  onChange={e => setHistoryDeviceFilter(e.target.value)}
                  placeholder="设备编号/名称"
                  className="w-full pl-8 pr-3 h-7 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#1e5fa8]"
                />
              </div>
              <div className="relative flex-1 min-w-[140px]">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={historyMoldFilter}
                  onChange={e => setHistoryMoldFilter(e.target.value)}
                  placeholder="模具编号/名称"
                  className="w-full pl-8 pr-3 h-7 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#1e5fa8]"
                />
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} className="text-gray-400" />
                <input
                  type="date"
                  value={historyDateFrom}
                  onChange={e => setHistoryDateFrom(e.target.value)}
                  className="h-7 px-2 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#1e5fa8]"
                />
                <span className="text-gray-400 text-xs">~</span>
                <input
                  type="date"
                  value={historyDateTo}
                  onChange={e => setHistoryDateTo(e.target.value)}
                  className="h-7 px-2 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#1e5fa8]"
                />
              </div>
              <button
                onClick={() => { setHistoryDeviceFilter(''); setHistoryMoldFilter(''); setHistoryDateFrom(''); setHistoryDateTo('') }}
                className="h-7 px-2.5 text-xs text-gray-500 border border-gray-200 rounded hover:bg-gray-50"
              >
                重置
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">填报时间</th>
                    <th className="text-left px-4 py-2 font-medium">设备</th>
                    <th className="text-left px-4 py-2 font-medium">模具</th>
                    <th className="text-right px-4 py-2 font-medium">本次模次</th>
                    <th className="text-right px-4 py-2 font-medium">累计模次</th>
                    <th className="text-left px-4 py-2 font-medium">填报人</th>
                    <th className="text-left px-4 py-2 font-medium">备注/异常</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(r => (
                    <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-xs text-gray-500">{r.recordTime}</td>
                      <td className="px-4 py-2.5 text-gray-700 text-xs">{r.deviceName}</td>
                      <td className="px-4 py-2.5 text-gray-800">{r.moldName}</td>
                      <td className="px-4 py-2.5 text-right text-blue-600 font-medium">+{r.shotCount.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-gray-700 font-medium">{r.cumulativeCount.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs">{r.operator}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[180px] truncate">
                        {r.remark || r.abnormal || r.stopReason || '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                        暂无记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 px-6 py-3 border-t border-gray-100">
              <button onClick={() => setShowHistoryModal(null)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">关闭</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
