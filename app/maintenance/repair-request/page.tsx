'use client'

import { useState, useMemo, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Wrench, Search, ChevronDown, ChevronRight, User, Clock, Camera,
  FileText, AlertTriangle, CheckCircle2, Package, Trash2, X, Image,
  Send, Save, RotateCcw, Info, Plus, Factory,
} from 'lucide-react'

/* ============ 基础数据 ============ */

// 模具库（供下拉选择）
const MOLD_LIBRARY = [
  { no: 'GJ-2024-001', name: '仪表盘支架冲压模', dept: '冲压车间', spec: '厚度 0.8mm', location: '模具仓 A-01', product: 'P-A001' },
  { no: 'GJ-2024-002', name: '门板注塑模 B', dept: '注塑车间', spec: '腔数 2', location: '模具仓 B-03', product: 'P-B002' },
  { no: 'GJ-2024-003', name: '排气管压铸模 A', dept: '压铸车间', spec: '合金 ADC12', location: '模具仓 C-02', product: 'P-C003' },
  { no: 'GJ-2024-004', name: '顶盖拉伸模', dept: '冲压车间', spec: '厚度 1.2mm', location: '生产现场 3 号线', product: 'P-D004' },
  { no: 'GJ-2024-005', name: '保险杠注塑模', dept: '注塑车间', spec: 'PP+T20', location: '模具仓 B-05', product: 'P-E005' },
  { no: 'GJ-2024-006', name: '轮毂压铸模', dept: '压铸车间', spec: '合金 AC4C', location: '模具仓 C-07', product: 'P-F006' },
  { no: 'GJ-2024-007', name: '侧围翻边模', dept: '冲压车间', spec: '厚度 1.0mm', location: '模具仓 A-08', product: 'P-G007' },
  { no: 'GJ-2024-008', name: '仪表板热压模', dept: '注塑车间', spec: 'TPO', location: '生产现场 5 号线', product: 'P-H008' },
]

// 不良原因库（两级分类）
const DEFECT_REASONS = [
  { code: 'D1', name: '尺寸不良', children: [
    { code: 'D1-01', name: '尺寸超差' },
    { code: 'D1-02', name: '厚度不均' },
    { code: 'D1-03', name: '孔位偏移' },
    { code: 'D1-04', name: '配合尺寸不良' },
  ]},
  { code: 'D2', name: '外观缺陷', children: [
    { code: 'D2-01', name: '划痕/划伤' },
    { code: 'D2-02', name: '凹坑/麻点' },
    { code: 'D2-03', name: '气泡/缩痕' },
    { code: 'D2-04', name: '色差' },
    { code: 'D2-05', name: '飞边/毛刺' },
  ]},
  { code: 'D3', name: '装配异常', children: [
    { code: 'D3-01', name: '配合面错位' },
    { code: 'D3-02', name: '间隙异常' },
    { code: 'D3-03', name: '紧固不良' },
    { code: 'D3-04', name: '卡滞/动作不顺' },
  ]},
  { code: 'D4', name: '模具磨损', children: [
    { code: 'D4-01', name: '型腔磨损' },
    { code: 'D4-02', name: '导柱/导套磨损' },
    { code: 'D4-03', name: '顶针磨损' },
    { code: 'D4-04', name: '分型面磨损' },
    { code: 'D4-05', name: '刃口磨损' },
  ]},
  { code: 'D5', name: '崩裂破损', children: [
    { code: 'D5-01', name: '崩角' },
    { code: 'D5-02', name: '裂纹' },
    { code: 'D5-03', name: '断裂' },
    { code: 'D5-04', name: '变形' },
  ]},
  { code: 'D6', name: '进料成型异常', children: [
    { code: 'D6-01', name: '缺料/充模不足' },
    { code: 'D6-02', name: '渗料/溢料' },
    { code: 'D6-03', name: '流道堵塞' },
    { code: 'D6-04', name: '冷却不均' },
  ]},
  { code: 'D7', name: '热处理缺陷', children: [
    { code: 'D7-01', name: '硬度不足' },
    { code: 'D7-02', name: '变形' },
    { code: 'D7-03', name: '裂纹' },
    { code: 'D7-04', name: '表面脱碳' },
  ]},
  { code: 'D8', name: '其他', children: [
    { code: 'D8-01', name: '配件损坏' },
    { code: 'D8-02', name: '电气故障' },
    { code: 'D8-03', name: '液压系统异常' },
    { code: 'D8-04', name: '未分类' },
  ]},
]

/* ============ 页面主体 ============ */

export default function RepairRequestPage() {
  const [mold, setMold] = useState<typeof MOLD_LIBRARY[0] | null>(null)
  const [showMoldPicker, setShowMoldPicker] = useState(false)
  const [defect1, setDefect1] = useState('')
  const [defect2, setDefect2] = useState('')
  const [urgency, setUrgency] = useState<'普通' | '加急' | '特急'>('普通')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [genNo, setGenNo] = useState('')
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
  }, [])

  const formatNow = (d: Date | null) =>
    d ? d.toLocaleString('zh-CN') : ''
  const formatTime = (d: Date | null) =>
    d ? d.toLocaleTimeString('zh-CN') : ''

  const defect2List = useMemo(() => {
    const parent = DEFECT_REASONS.find((d) => d.code === defect1)
    return parent ? parent.children : []
  }, [defect1])

  const handleReset = () => {
    setMold(null)
    setDefect1('')
    setDefect2('')
    setUrgency('普通')
    setDescription('')
    setFiles([])
  }

  const handleSubmit = () => {
    if (!mold || !defect1 || !defect2 || !description.trim()) {
      alert('请填写完整的必填信息：模具 / 不良原因 / 故障描述')
      return
    }
    const no = 'WR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 900 + 100)
    setGenNo(no)
    setShowSuccess(true)
  }

  return (
    <MainLayout>
      <div className="p-4 flex flex-col gap-4 h-full">
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1e5fa8]/10 rounded-lg flex items-center justify-center">
              <Wrench className="text-[#1e5fa8]" size={18} />
            </div>
            <div>
              <div className="text-gray-800 font-medium text-sm">维修申请创建</div>
              <div className="text-[12px] text-gray-500 mt-0.5">发现模具损坏请及时报修，提交后流转至待修仓，车间下模入库后钳工在【我的维修任务】接单维修</div>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-2">
            <Clock size={12} />
            提交时间：{formatNow(now)}
          </div>
        </div>

        {/* 表单主体 */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-4">

            {/* 模具选择 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3 border-l-2 border-[#1e5fa8] pl-2">
                <Factory size={14} className="text-[#1e5fa8]" />
                <span className="text-[13px] font-semibold text-gray-800">模具信息</span>
                <span className="text-[11px] text-red-500">*必填</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[12px] text-gray-500 mb-1 block">选择模具</label>
                  <button
                    onClick={() => setShowMoldPicker(true)}
                    className="w-full border border-gray-200 rounded px-3 py-2.5 text-left text-[12px] bg-white hover:border-[#1e5fa8] transition-colors flex items-center justify-between"
                  >
                    {mold ? (
                      <span className="text-gray-800">
                        <span className="font-mono font-medium">{mold.no}</span> · {mold.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">点击选择模具...</span>
                    )}
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">所属部门</label>
                  <input readOnly value={mold?.dept || ''} placeholder="选择模具后自动带出"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">品号</label>
                  <input readOnly value={mold?.product || ''} placeholder="选择模具后自动带出"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">品名</label>
                  <input readOnly value={mold?.name || ''} placeholder="选择模具后自动带出"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">规格</label>
                  <input readOnly value={mold?.spec || ''} placeholder="选择模具后自动带出"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 text-gray-600" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-gray-400 mb-1 block">当前存放位置</label>
                  <input readOnly value={mold?.location || ''} placeholder="选择模具后自动带出"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 text-gray-600" />
                </div>
              </div>
            </div>

            {/* 故障信息 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3 border-l-2 border-[#1e5fa8] pl-2">
                <AlertTriangle size={14} className="text-[#1e5fa8]" />
                <span className="text-[13px] font-semibold text-gray-800">故障信息</span>
                <span className="text-[11px] text-red-500">*必填</span>
              </div>

              <div className="space-y-3">
                {/* 不良原因 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] text-gray-500 mb-1 block">不良原因（一级）</label>
                    <select
                      value={defect1}
                      onChange={(e) => { setDefect1(e.target.value); setDefect2('') }}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-white focus:outline-none focus:border-[#1e5fa8]"
                    >
                      <option value="">请选择...</option>
                      {DEFECT_REASONS.map((d) => (
                        <option key={d.code} value={d.code}>{d.code} · {d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] text-gray-500 mb-1 block">具体原因（二级）</label>
                    <select
                      value={defect2}
                      onChange={(e) => setDefect2(e.target.value)}
                      disabled={!defect1}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-white focus:outline-none focus:border-[#1e5fa8] disabled:bg-gray-50"
                    >
                      <option value="">请先选择一级分类...</option>
                      {defect2List.map((d) => (
                        <option key={d.code} value={d.code}>{d.code} · {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 故障描述 */}
                <div>
                  <label className="text-[12px] text-gray-500 mb-1 block">故障描述</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="请详细描述模具损坏现象、发生场景、可能的原因...（建议 30 字以上）"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-[#1e5fa8] resize-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-gray-400">已填写 {description.length} 字</span>
                    {description.length > 0 && description.length < 30 && (
                      <span className="text-[11px] text-amber-500">建议提供更详细描述</span>
                    )}
                  </div>
                </div>

                {/* 紧急程度 */}
                <div>
                  <label className="text-[12px] text-gray-500 mb-1.5 block">紧急程度</label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { v: '普通', color: 'text-gray-600', border: 'border-gray-200', active: 'bg-gray-100 border-gray-400 text-gray-700', icon: CheckCircle2 },
                      { v: '加急', color: 'text-amber-600', border: 'border-amber-300', active: 'bg-amber-50 border-amber-500 text-amber-700', icon: AlertTriangle },
                      { v: '特急', color: 'text-red-600', border: 'border-red-300', active: 'bg-red-50 border-red-500 text-red-700', icon: X },
                    ] as const).map((u) => (
                      <button
                        key={u.v}
                        onClick={() => setUrgency(u.v)}
                        className={`border-2 rounded-lg py-2.5 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all ${
                          urgency === u.v ? u.active : u.border + ' bg-white hover:bg-gray-50'
                        }`}
                      >
                        <u.icon size={13} />
                        {u.v}
                      </button>
                    ))}
                  </div>
                  {urgency === '特急' && (
                    <div className="mt-2 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded px-2.5 py-1.5 flex items-center gap-1.5">
                      <AlertTriangle size={11} />
                      特急工单将直接推送至主管，优先安排高级钳工处理
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 附件 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3 border-l-2 border-[#1e5fa8] pl-2">
                <Camera size={14} className="text-[#1e5fa8]" />
                <span className="text-[13px] font-semibold text-gray-800">现场故障照片</span>
                <span className="text-[11px] text-gray-400">（建议多图上传，清晰展示损坏部位）</span>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {files.map((f, i) => (
                  <div key={i} className="aspect-square border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center relative overflow-hidden">
                    <Image size={24} className="text-gray-400" />
                    <div className="absolute top-1 right-1">
                      <button onClick={() => setFiles(files.filter((_, k) => k !== i))}
                        className="w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-[10px]">×</button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 text-[10px] text-center text-white bg-black/40 py-0.5">故障图 {i + 1}</div>
                  </div>
                ))}
                {files.length < 8 && (
                  <button
                    onClick={() => setFiles([...files, 'file-' + Date.now()])}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#1e5fa8] hover:text-[#1e5fa8] hover:bg-blue-50/30 transition-colors"
                  >
                    <Plus size={18} />
                    <span className="text-[11px] mt-1">添加图片</span>
                  </button>
                )}
              </div>
              <div className="mt-2 text-[11px] text-gray-400">已上传 {files.length} 张，最多 8 张，支持 jpg/png/mp4（≤10MB）</div>
            </div>

            {/* 申请人 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3 border-l-2 border-[#1e5fa8] pl-2">
                <User size={14} className="text-[#1e5fa8]" />
                <span className="text-[13px] font-semibold text-gray-800">申请人信息</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">申请人</label>
                  <input readOnly value="张工程师" className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">工号</label>
                  <input readOnly value="E2024-0081" className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">联系电话</label>
                  <input defaultValue="138****5678" className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] bg-white focus:outline-none focus:border-[#1e5fa8]" />
                </div>
              </div>
              <div className="mt-2 text-[11px] text-gray-400">
                <Clock size={11} className="inline mr-1" />
                提交时间：{formatNow(now)}（自动生成）
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="sticky bottom-0 bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between z-10">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Save size={11} />
                草稿已自动保存于 {formatTime(now)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="text-[12px] text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
                >
                  <RotateCcw size={11} /> 重置
                </button>
                <button
                  className="text-[12px] text-[#1e5fa8] border border-[#1e5fa8] rounded px-3 py-1.5 hover:bg-[#1e5fa8] hover:text-white transition-colors flex items-center gap-1"
                >
                  <Save size={11} /> 保存草稿
                </button>
                <button
                  onClick={handleSubmit}
                  className="text-[12px] text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded px-5 py-1.5 font-medium flex items-center gap-1.5"
                >
                  <Send size={11} /> 提交报修
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 模具选择弹窗 */}
      {showMoldPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowMoldPicker(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[720px] max-w-[95vw] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Factory size={16} className="text-[#1e5fa8]" />
                <span className="text-sm font-semibold text-gray-800">选择模具</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1" onClick={() => setShowMoldPicker(false)}><X size={14} /></button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input placeholder="搜索模具编号/名称/部门..."
                  className="w-full border border-gray-200 rounded pl-8 pr-3 py-2 text-[12px] focus:outline-none focus:border-[#1e5fa8]" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="px-3 py-2 text-left font-medium">模具编号</th>
                    <th className="px-3 py-2 text-left font-medium">模具名称</th>
                    <th className="px-3 py-2 text-left font-medium">所属部门</th>
                    <th className="px-3 py-2 text-left font-medium">规格</th>
                    <th className="px-3 py-2 text-left font-medium">当前位置</th>
                    <th className="px-3 py-2 text-center font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {MOLD_LIBRARY.map((m) => (
                    <tr key={m.no} className="border-b border-gray-100 hover:bg-blue-50/40">
                      <td className="px-3 py-2.5 font-mono text-[#1e5fa8] font-medium">{m.no}</td>
                      <td className="px-3 py-2.5 text-gray-800">{m.name}</td>
                      <td className="px-3 py-2.5 text-gray-600">{m.dept}</td>
                      <td className="px-3 py-2.5 text-gray-500">{m.spec}</td>
                      <td className="px-3 py-2.5 text-gray-600">{m.location}</td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => { setMold(m); setShowMoldPicker(false) }}
                          className="text-[11px] text-[#1e5fa8] hover:underline font-medium"
                        >
                          选择此模具
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 提交成功 */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowSuccess(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[420px] p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <div className="text-base font-semibold text-gray-800 mb-1">维修单已提交</div>
            <div className="text-[12px] text-gray-500 mb-3">单据已流转至【待修仓-待下模】，请车间人员下模并确认入库</div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-[11px] text-gray-400 mb-1">维修单号</div>
              <div className="text-lg font-bold font-mono text-[#1e5fa8]">{genNo}</div>
            </div>
            <div className="space-y-2 text-left text-[12px] text-gray-600 mb-4 bg-blue-50/50 border border-blue-200 rounded p-3">
              <div>• 模具：{mold?.no} · {mold?.name}</div>
              <div>• 紧急程度：{urgency}</div>
              <div>• 状态：待下模（等待车间人员下模送库）</div>
              <div>• 流程：下模入库 → 待修仓 → 钳工【我的维修任务】接单 → 维修执行</div>
            </div>
            <button
              onClick={() => { setShowSuccess(false); handleReset() }}
              className="w-full text-[12px] text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded py-2 font-medium"
            >
              继续创建
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
