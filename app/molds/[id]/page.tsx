'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Download, Camera, Clock, Wrench, Settings, ShieldCheck, Warehouse } from 'lucide-react'

const moldData = {
  id: '190038',
  moldName: '7686SO三工位成形凹模',
  stage: '量产',
  status: '在用',
  designCycle: '500000',
  totalCycle: '482560',
  department: '一车间卡钳活塞',
  itemNo: '60004712402104',
  itemName: '7686SO三工位成形凹模',
  spec: '32327686SO',
  type: '冲压模具',
  processCount: '7300',
  manufactureDate: '2024-01-15',
  responsiblePerson: '张三',
  drawingNo: 'DWG-MJ-2024-001',
  cavityCount: '4',
  lifeWarning: '450000',
  healthStatus: '需关注',
  inFactoryDate: '2024/03/15',
  category: '易损件',
  applicableProduct: '7686SO系列产品',
  newMoldRemark: '',
  maintenanceRemark: '',
  repairRemark: '',
}

const attachments = [
  { id: '1', name: '模具图纸.pdf', size: '2.3 MB', date: '2024-03-15 09:30' },
  { id: '2', name: '零件明细表.dwg', size: '1.8 MB', date: '2024-03-15 09:35' },
  { id: '3', name: '验收报告.pdf', size: '568 KB', date: '2024-03-15 10:00' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  '在用': { bg: 'bg-green-100', text: 'text-green-600' },
  '在库': { bg: 'bg-blue-100', text: 'text-blue-600' },
  '维修中': { bg: 'bg-red-100', text: 'text-red-600' },
  '保养中': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  '委外中': { bg: 'bg-purple-100', text: 'text-purple-600' },
  '报废': { bg: 'bg-gray-100', text: 'text-gray-500' },
}

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  '设计': { bg: 'bg-blue-100', text: 'text-blue-600' },
  '试模': { bg: 'bg-purple-100', text: 'text-purple-600' },
  '量产': { bg: 'bg-green-100', text: 'text-green-600' },
  '封存': { bg: 'bg-gray-100', text: 'text-gray-600' },
  '报废': { bg: 'bg-gray-100', text: 'text-gray-500' },
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '通用件': { bg: 'bg-slate-100', text: 'text-slate-600' },
  '易损件': { bg: 'bg-red-100', text: 'text-red-600' },
  '标准件': { bg: 'bg-blue-100', text: 'text-blue-600' },
  '技术开发类': { bg: 'bg-violet-100', text: 'text-violet-600' },
}

export default function MoldDetailPage() {
  const router = useRouter()
  const params = useParams()
  const moldId = params.id as string
  const data = { ...moldData, id: moldId }
  const [activeHistoryTab, setActiveHistoryTab] = useState('use')

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* 顶部导航栏 */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} />
              返回
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-semibold text-gray-800">模具档案</h1>
            <span className="text-gray-400 text-sm">#{moldId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/molds/${moldId}/edit`} className="px-4 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors">
              编辑
            </Link>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* 基本信息 + 供应商信息 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 基本信息 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-700">基本信息</h2>
                </div>
                <div className="p-5 space-y-4">
                  <ReadOnlyField label="模具名称" value={data.moldName} required />
                  <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyField label="阶段">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[data.stage].bg} ${STAGE_COLORS[data.stage].text}`}>
                        {data.stage}
                      </span>
                    </ReadOnlyField>
                    <ReadOnlyField label="适用产品" value={data.applicableProduct} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyField label="设计模次" value={data.designCycle.toLocaleString()} />
                    <ReadOnlyField label="累计模次" value={data.totalCycle.toLocaleString()} />
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-center w-full h-32 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Camera size={24} />
                        <span className="text-xs">暂无图片</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 模具备注信息 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-700">模具备注信息</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">新模备注</label>
                    <div className="w-full border border-gray-200 border-r-0 border-t-0 border-l-0 bg-transparent py-1.5 text-sm text-gray-800 font-medium">
                      {data.newMoldRemark || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">保养备注</label>
                    <div className="w-full border border-gray-200 border-r-0 border-t-0 border-l-0 bg-transparent py-1.5 text-sm text-gray-800 font-medium">
                      {data.maintenanceRemark || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">维修备注</label>
                    <div className="w-full border border-gray-200 border-r-0 border-t-0 border-l-0 bg-transparent py-1.5 text-sm text-gray-800 font-medium">
                      {data.repairRemark || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 模工具基础信息 */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">模工具基础信息</h2>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4">
                <ReadOnlyField label="图号" value={data.drawingNo} />
                <ReadOnlyField label="模腔数" value={data.cavityCount} />
                <ReadOnlyField label="寿命预警值" value={data.lifeWarning.toLocaleString()} />
                <ReadOnlyField label="类型" value={data.type} />
                <ReadOnlyField label="健康状态" value={data.healthStatus} />
                <ReadOnlyField label="编号" value={data.id} />
                <ReadOnlyField label="部门" value={data.department} />
                <ReadOnlyField label="入厂日期" value={data.inFactoryDate} />
                <ReadOnlyField label="品号" value={data.itemNo} />
                <ReadOnlyField label="品名" value={data.itemName} />
                <ReadOnlyField label="规格" value={data.spec} />
                <ReadOnlyField label="模具分类">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[data.category].bg} ${CATEGORY_COLORS[data.category].text}`}>
                    {data.category}
                  </span>
                </ReadOnlyField>
              </div>
            </div>

            {/* 附件管理 */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">附件管理</h2>
              </div>
              <div className="p-4 space-y-2">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{file.size} · {file.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors" title="下载">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 text-center py-4">支持 PDF、JPG、PNG、DWG 格式，单个文件不超过 20MB</p>
              </div>
            </div>

            {/* 模具履历 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">模具履历</h2>
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span>累计使用 482,560 模次</span>
                  <span>·</span>
                  <span>最近保养 2026-05-15</span>
                  <span>·</span>
                  <span>最近维修 2026-03-20</span>
                </div>
              </div>

              {/* Tab切换 */}
              <div className="flex items-center border-b border-gray-200 bg-white px-4 overflow-x-auto">
                {[
                  { key: 'use', label: '使用记录', count: 12, icon: Clock, color: 'blue' },
                  { key: 'maintain', label: '保养记录', count: 5, icon: Settings, color: 'green' },
                  { key: 'repair', label: '维修记录', count: 3, icon: Wrench, color: 'red' },
                  { key: 'warehouse', label: '仓储履历', count: 6, icon: Warehouse, color: 'indigo' },
                  { key: 'inspect', label: '检验记录', count: 2, icon: ShieldCheck, color: 'purple' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveHistoryTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeHistoryTab === tab.key
                        ? `border-${tab.color}-500 text-${tab.color}-600`
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      activeHistoryTab === tab.key
                        ? `bg-${tab.color}-100 text-${tab.color}-600`
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* 履历内容 */}
              <div className="p-4">
                {/* 使用记录 */}
                {activeHistoryTab === 'use' && (
                  <div className="space-y-3">
                    {[
                      { date: '2026-06-15 08:30', order: 'ORD-20240615-001', qty: 500, person: '张师傅', status: 'completed' },
                      { date: '2026-06-10 14:15', order: 'ORD-20240610-002', qty: 300, person: '李师傅', status: 'completed' },
                      { date: '2026-06-05 09:00', order: 'ORD-20240605-001', qty: 450, person: '王师傅', status: 'completed' },
                      { date: '2026-05-28 10:30', order: 'ORD-20240528-003', qty: 280, person: '张师傅', status: 'completed' },
                      { date: '2026-05-20 15:45', order: 'ORD-20240520-001', qty: 520, person: '赵师傅', status: 'completed' },
                    ].map((record, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{record.date}</span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[10px] font-medium">{record.order}</span>
                            </div>
                            <span className="text-xs text-green-600 font-medium">已完成</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>加工数量：<span className="font-medium text-gray-800">{record.qty} 件</span></span>
                            <span>执行人：<span className="font-medium text-gray-800">{record.person}</span></span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-2">
                      <button className="text-xs text-blue-600 hover:text-blue-800">加载更多（还有 7 条）</button>
                    </div>
                  </div>
                )}

                {/* 保养记录 */}
                {activeHistoryTab === 'maintain' && (
                  <div className="space-y-3">
                    {[
                      { date: '2026-05-15 10:00', type: '定期保养', result: '合格', person: '张师傅', items: ['润滑脂更换', '导柱清洁', '型腔检查'] },
                      { date: '2026-02-15 08:30', type: '定期保养', result: '合格', person: '李师傅', items: ['润滑脂更换', '顶针检查'] },
                      { date: '2025-11-20 14:00', type: '定期保养', result: '合格', person: '王师傅', items: ['润滑脂更换', '模具清洁'] },
                    ].map((record, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{record.date}</span>
                              <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-600 text-[10px] font-medium">{record.type}</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-600 text-[10px] font-medium">{record.result}</span>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">执行人：{record.person}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {record.items.map((item, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white rounded text-[10px] text-gray-500 border border-gray-200">{item}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 维修记录 */}
                {activeHistoryTab === 'repair' && (
                  <div className="space-y-3">
                    {[
                      { date: '2026-03-20 10:00', type: '型腔修复', cost: '¥2,800', person: '李师傅', remark: '型腔表面磨损，进行抛光修复处理', result: '合格' },
                      { date: '2025-10-15 14:30', type: '更换顶针', cost: '¥450', person: '张师傅', remark: '顶针磨损断裂，更换新顶针', result: '合格' },
                      { date: '2025-06-08 09:00', type: '滑块检修', cost: '¥1,200', person: '王师傅', remark: '滑块动作卡顿，研磨修复', result: '合格' },
                    ].map((record, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{record.date}</span>
                              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-medium">{record.type}</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{record.cost}</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-1">{record.remark}</div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>执行人：{record.person}</span>
                            <span>·</span>
                            <span className="text-green-600">检验 {record.result}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 仓储履历 */}
                {activeHistoryTab === 'warehouse' && (
                  <div className="space-y-3">
                    {[
                      { date: '2026-06-22 17:30', type: '制造完工', typeCode: 'manufacture', warehouse: '成品仓', location: 'A-01-03', orderNo: 'RK-20260622-0005', sourceOrder: 'WO-2026-0622-012', processCount: 2800, totalCount: 2800, operator: '王主管', direction: 'in' },
                      { date: '2026-06-18 15:45', type: '制造完工', typeCode: 'manufacture', warehouse: '成品仓', location: 'A-01-05', orderNo: 'RK-20260618-0001', sourceOrder: 'WO-2026-0618-005', processCount: 3500, totalCount: 82400, operator: '张主管', direction: 'in' },
                      { date: '2026-06-15 14:30', type: '维修入库', typeCode: 'repair', warehouse: '技术仓', location: 'C-02-04', orderNo: 'RK-20260615-0008', sourceOrder: 'WX-20260613-0003', processCount: 0, totalCount: 38920, operator: '李主管', direction: 'in' },
                      { date: '2026-06-12 09:20', type: '二级保养', typeCode: 'maintenance', warehouse: '备料仓', location: 'B-01-07', orderNo: 'RK-20260612-0006', sourceOrder: 'BY-20260610-002', processCount: 1950, totalCount: 52360, operator: '王主管', direction: 'in' },
                      { date: '2026-06-10 11:30', type: '委外到货', typeCode: 'outsourcing', warehouse: '技术仓', location: 'C-01-06', orderNo: 'RK-20260610-0003', sourceOrder: 'WW-2026-0605-003', processCount: 0, totalCount: 72300, operator: '张主管', direction: 'in', remark: '委外热处理回厂' },
                      { date: '2026-05-20 08:30', type: '领用出库', typeCode: 'outbound', warehouse: '成品仓', location: 'A-01-03', orderNo: 'CK-20260520-0002', sourceOrder: 'WO-2026-0520-001', processCount: 0, totalCount: 78900, operator: '李班长', direction: 'out' },
                    ].map((record, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          record.direction === 'in' ? 'bg-indigo-500' : 'bg-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-500">{record.date}</span>
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                record.typeCode === 'manufacture' ? 'bg-blue-100 text-blue-700' :
                                record.typeCode === 'repair' ? 'bg-red-100 text-red-700' :
                                record.typeCode === 'maintenance' ? 'bg-green-100 text-green-700' :
                                record.typeCode === 'outsourcing' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {record.direction === 'in' ? '入库' : '出库'} · {record.type}
                              </span>
                              <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">
                                {record.orderNo}
                              </span>
                            </div>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              record.direction === 'in'
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-600 bg-gray-100'
                            }`}>
                              {record.direction === 'in' ? '→ 入库' : '← 出库'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">仓库：</span>
                              <span className="text-gray-700 font-medium">{record.warehouse}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-600">{record.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">源单据：</span>
                              <span className="text-gray-600 font-mono">{record.sourceOrder}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">累计加工：</span>
                              <span className="text-gray-700 font-medium">{record.totalCount.toLocaleString()} 模次</span>
                              {record.processCount > 0 && (
                                <span className="text-green-600">(+{record.processCount.toLocaleString()})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">操作人：</span>
                              <span className="text-gray-600">{record.operator}</span>
                            </div>
                          </div>
                          {record.remark && (
                            <div className="mt-1.5 text-[11px] text-gray-400">备注：{record.remark}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-2">
                      <button className="text-xs text-indigo-600 hover:text-indigo-800">加载更多</button>
                    </div>
                  </div>
                )}

                {/* 检验记录 */}
                {activeHistoryTab === 'inspect' && (
                  <div className="space-y-3">
                    {[
                      { date: '2026-06-10 16:00', type: '尺寸检验', result: '合格', report: 'QC-20260610-001', inspector: '质检员A' },
                      { date: '2026-03-25 10:30', type: '外观检验', result: '合格', report: 'QC-20260325-001', inspector: '质检员B' },
                    ].map((record, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{record.date}</span>
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 text-[10px] font-medium">{record.type}</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-600 text-[10px] font-medium">{record.result}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>报告：{record.report}</span>
                            <span>·</span>
                            <span>检验员：{record.inspector}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function ReadOnlyField({ label, value, required, children }: { label: string; value?: string; required?: boolean; children?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children ? (
        children
      ) : (
        <div className="w-full border border-gray-200 border-r-0 border-t-0 border-l-0 bg-transparent py-1.5 text-sm text-gray-800 font-medium">
          {value || '-'}
        </div>
      )}
    </div>
  )
}
