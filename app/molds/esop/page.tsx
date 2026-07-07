'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Filter, RotateCcw, RefreshCw, Settings, Plus, Pencil, Eye, Trash2, ChevronDown, X,
  FileText, Upload, Search,
} from 'lucide-react'

// 工艺路线数据（用于选择品号、品名、工序）
const PROCESS_ROUTES = [
  {
    id: 'PR-001',
    itemNo: '60004712402104',
    itemName: '7686SO三工位成形凹模',
    processes: ['粗铣', '钳工', '热处理', '车配', '精车', '平面磨', '线切割', '精铣+电火'],
  },
  {
    id: 'PR-002',
    itemNo: '60022212402005',
    itemName: 'Y587成形凹模',
    processes: ['粗铣', '钳工', '热处理', '精车', '平面磨', '抛光'],
  },
  {
    id: 'PR-003',
    itemNo: '60008412402030',
    itemName: '695反挤冲头芯',
    processes: ['粗铣', '车配', '热处理', '精车', '平面磨', '线切割', '精铣', '钳工', '平面割'],
  },
  {
    id: 'PR-004',
    itemNo: '60003312402115',
    itemName: 'X200成型凸模',
    processes: ['粗车', '热处理', '精车', '平面磨', '线切割', '钳工'],
  },
  {
    id: 'PR-005',
    itemNo: '60024901201020',
    itemName: '7650SO成形凸模',
    processes: ['粗铣', '钳工', '热处理', '精车', '平面磨', '精铣'],
  },
]

interface ProcessCard {
  id: string
  name: string
  version: string
  itemNo: string
  itemName: string
  processName: string
  fileName: string
  fileSize?: string
  uploadTime: string
  uploader: string
  description: string
}

const mockCards: ProcessCard[] = [
  {
    id: 'PC001',
    name: '深钻孔工艺卡片',
    version: 'V1.0',
    itemNo: '60004712402104',
    itemName: '7686SO三工位成形凹模',
    processName: '钳工',
    fileName: '深钻孔工序工艺卡.pdf',
    fileSize: '2.3MB',
    uploadTime: '2026-06-15 10:30',
    uploader: '工艺员A',
    description: '深钻孔工序标准操作工艺参数',
  },
  {
    id: 'PC002',
    name: '精车两端工艺卡',
    version: 'V1.2',
    itemNo: '60004712402104',
    itemName: '7686SO三工位成形凹模',
    processName: '精车',
    fileName: '精车两端工艺参数卡.pdf',
    fileSize: '1.8MB',
    uploadTime: '2026-06-18 14:20',
    uploader: '工艺员B',
    description: '精车工序切削参数、转速设定',
  },
  {
    id: 'PC003',
    name: '热处理工艺规范',
    version: 'A2',
    itemNo: '60022212402005',
    itemName: 'Y587成形凹模',
    processName: '热处理',
    fileName: '热处理工艺规范.pdf',
    fileSize: '3.1MB',
    uploadTime: '2026-06-20 09:00',
    uploader: '工艺员A',
    description: '淬火温度、保温时间标准',
  },
  {
    id: 'PC004',
    name: '线切割参数卡',
    version: 'V1.0',
    itemNo: '60008412402030',
    itemName: '695反挤冲头芯',
    processName: '线切割',
    fileName: '线切割参数设定卡.pdf',
    fileSize: '1.5MB',
    uploadTime: '2026-06-22 11:15',
    uploader: '工艺员C',
    description: '线切割电流、速度参数',
  },
  {
    id: 'PC005',
    name: '平面磨工艺卡',
    version: 'B1',
    itemNo: '60003312402115',
    itemName: 'X200成型凸模',
    processName: '平面磨',
    fileName: '平面磨削工艺卡.pdf',
    fileSize: '2.0MB',
    uploadTime: '2026-06-25 08:45',
    uploader: '工艺员B',
    description: '磨削进给量、砂轮选择',
  },
]

const factories = ['百达电器', '华夏1号工厂', '华夏2号工厂']

export default function ProcessCardPage() {
  const [items, setItems] = useState<ProcessCard[]>(mockCards)
  const [nameFilter, setNameFilter] = useState('')
  const [itemNoFilter, setItemNoFilter] = useState('')
  const [processFilter, setProcessFilter] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  // 上传表单
  const [uploadForm, setUploadForm] = useState({
    name: '',
    version: 'V1.0',
    itemNo: '',
    itemName: '',
    processName: '',
    fileName: '',
    description: '',
  })

  const filtered = items.filter((e) => {
    const matchName = !nameFilter || e.name.includes(nameFilter) || e.fileName.includes(nameFilter)
    const matchItemNo = !itemNoFilter || e.itemNo.includes(itemNoFilter) || e.itemName.includes(itemNoFilter)
    const matchProcess = !processFilter || e.processName.includes(processFilter)
    return matchName && matchItemNo && matchProcess
  })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // 获取所有工序列表（用于筛选）
  const allProcesses = Array.from(new Set(items.map(i => i.processName)))

  // 选择品号时自动带出品名和工序列表
  const handleItemNoSelect = (itemNo: string) => {
    const route = PROCESS_ROUTES.find(r => r.itemNo === itemNo)
    if (route) {
      setUploadForm(f => ({
        ...f,
        itemNo: route.itemNo,
        itemName: route.itemName,
        processName: '',
      }))
    }
  }

  // 获取当前选中品号对应的工序列表
  const availableProcesses = PROCESS_ROUTES.find(r => r.itemNo === uploadForm.itemNo)?.processes || []

  const handleUpload = () => {
    if (!uploadForm.name || !uploadForm.itemNo || !uploadForm.processName || !uploadForm.fileName) {
      alert('请填写必填项：卡片名称、品号、工序、文件')
      return
    }
    const newCard: ProcessCard = {
      id: `PC${Date.now()}`,
      name: uploadForm.name,
      version: uploadForm.version,
      itemNo: uploadForm.itemNo,
      itemName: uploadForm.itemName,
      processName: uploadForm.processName,
      fileName: uploadForm.fileName,
      fileSize: '待上传',
      uploadTime: new Date().toLocaleString('zh-CN'),
      uploader: '当前用户',
      description: uploadForm.description,
    }
    setItems(prev => [newCard, ...prev])
    alert(`工艺卡片上传成功！\n\n卡片名称：${uploadForm.name}\n品号：${uploadForm.itemNo}\n工序：${uploadForm.processName}\n文件：${uploadForm.fileName}`)
    setShowUploadModal(false)
    setUploadForm({ name: '', version: 'V1.0', itemNo: '', itemName: '', processName: '', fileName: '', description: '' })
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((e) => e.id !== id))
    setShowDeleteConfirm(null)
  }

  const reset = () => {
    setNameFilter('')
    setItemNoFilter('')
    setProcessFilter('')
    setPage(1)
  }

  return (
    <MainLayout>
      <div className="p-4 h-full overflow-auto">
        {/* 标题区 */}
        <div className="bg-white border border-gray-200 rounded px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">工艺卡片管理</h1>
              <p className="text-[11px] text-gray-500">上传工艺卡片PDF文件，关联品号、品名、工序</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded transition-colors">
              <RefreshCw size={14} />
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded transition-colors">
              <Settings size={14} />
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 h-9 px-4 bg-[#1e5fa8] text-white text-sm rounded-lg hover:bg-[#1a4f8f]"
            >
              <Upload size={14} /> 上传工艺卡片
            </button>
          </div>
        </div>

        {/* 筛选区 */}
        <div className="bg-white border border-gray-200 rounded px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
          <div className="w-8 h-8 rounded-full bg-[#1e5fa8] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {filtered.length}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={nameFilter}
              onChange={(e) => { setNameFilter(e.target.value); setPage(1) }}
              placeholder="卡片名称 / 文件名"
              className="pl-9 pr-3 h-8 text-sm border border-gray-200 rounded w-44 focus:outline-none focus:border-[#1e5fa8] bg-white"
            />
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={itemNoFilter}
              onChange={(e) => { setItemNoFilter(e.target.value); setPage(1) }}
              placeholder="品号 / 品名"
              className="pl-9 pr-3 h-8 text-sm border border-gray-200 rounded w-44 focus:outline-none focus:border-[#1e5fa8] bg-white"
            />
          </div>

          <div className="relative">
            <select
              value={processFilter}
              onChange={(e) => { setProcessFilter(e.target.value); setPage(1) }}
              className="appearance-none border border-gray-200 rounded pl-3 pr-8 h-8 text-sm w-32 focus:outline-none bg-white text-gray-600"
            >
              <option value="">全部工序</option>
              {allProcesses.map((p) => <option key={p}>{p}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={reset}
            className="flex items-center gap-1.5 h-8 px-3 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={13} /> 重置
          </button>
        </div>

        {/* 表格 */}
        <div className="bg-white rounded border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">卡片名称</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">版本</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">品号</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">品名</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">工序</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">文件名</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">上传时间</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">上传人</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-800">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">{item.version}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.itemNo}</td>
                  <td className="px-4 py-3 text-gray-700">{item.itemName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs">{item.processName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                      <FileText size={13} /> {item.fileName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.uploadTime}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{item.uploader}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button className="text-gray-400 hover:text-blue-500 transition-colors" title="编辑">
                        <Pencil size={14} />
                      </button>
                      <button className="text-gray-400 hover:text-blue-500 transition-colors" title="查看">
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">每页条目数:</span>
              <div className="relative">
                <select className="appearance-none border border-gray-200 rounded px-2 py-1 text-xs pr-6 focus:outline-none bg-white">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-[#1e5fa8] text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              {totalPages > 1 && (
                <button
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown size={14} className="-rotate-90" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
              <h3 className="text-base font-semibold text-gray-800 mb-2">确认删除</h3>
              <p className="text-sm text-gray-600 mb-4">确定要删除该工艺卡片吗？此操作不可撤销。</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50">取消</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600">确认删除</button>
              </div>
            </div>
          </div>
        )}

        {/* 上传工艺卡片弹窗 */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Upload size={16} className="text-[#1e5fa8]" />
                  <h3 className="text-base font-semibold text-gray-800">上传工艺卡片</h3>
                </div>
                <button onClick={() => setShowUploadModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">卡片名称 <span className="text-red-500">*</span></label>
                  <input
                    value={uploadForm.name}
                    onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="如：深钻孔工艺卡片"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">版本</label>
                    <input
                      value={uploadForm.version}
                      onChange={e => setUploadForm(f => ({ ...f, version: e.target.value }))}
                      placeholder="如：V1.0"
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">品号 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={uploadForm.itemNo}
                        onChange={e => handleItemNoSelect(e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] appearance-none bg-white"
                      >
                        <option value="">选择品号</option>
                        {PROCESS_ROUTES.map(r => (
                          <option key={r.itemNo} value={r.itemNo}>{r.itemNo}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">品名</label>
                  <input
                    value={uploadForm.itemName}
                    readOnly
                    placeholder="选择品号后自动带出"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">工序 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={uploadForm.processName}
                      onChange={e => setUploadForm(f => ({ ...f, processName: e.target.value }))}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] appearance-none bg-white"
                      disabled={!uploadForm.itemNo}
                    >
                      <option value="">选择工序</option>
                      {availableProcesses.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                  </div>
                  {!uploadForm.itemNo && (
                    <p className="text-xs text-gray-400 mt-1">请先选择品号</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">上传文件 <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#1e5fa8] transition-colors cursor-pointer">
                    <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">点击上传或拖拽文件到此处</p>
                    <p className="text-xs text-gray-400 mt-1">支持 PDF 格式</p>
                    <input type="file" accept=".pdf" className="hidden" onChange={e => {
                      if (e.target.files?.[0]) {
                        setUploadForm(f => ({ ...f, fileName: e.target.files![0].name }))
                      }
                    }} />
                  </div>
                  {uploadForm.fileName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                      <FileText size={14} className="text-blue-500" />
                      <span>{uploadForm.fileName}</span>
                      <button onClick={() => setUploadForm(f => ({ ...f, fileName: '' }))} className="text-gray-400 hover:text-red-500 ml-auto">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">描述说明</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="工艺卡片内容描述（选填）"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => setShowUploadModal(false)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
                <button onClick={handleUpload} className="px-5 h-8 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">确认上传</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}