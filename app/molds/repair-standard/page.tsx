'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Wrench, Settings2, ListChecks, Star, Package, Plus, Edit2, Trash2,
  ChevronDown, ChevronRight, Search, FileDown, FileUp, Check, X,
  Clock, AlertTriangle, Save, ToggleLeft, ToggleRight,
} from 'lucide-react'

/* ============ 基础数据 ============ */

// 维修类型（全系统下拉数据源）
const REPAIR_TYPES = [
  { code: 'RT-001', name: '崩角', desc: '模具边缘、型腔角部破损崩缺', enabled: true, count: 128 },
  { code: 'RT-002', name: '变形', desc: '模具形状、尺寸发生塑性变形', enabled: true, count: 76 },
  { code: 'RT-003', name: '磨损', desc: '表面磨损、刃口磨损、导柱导套磨损', enabled: true, count: 234 },
  { code: 'RT-004', name: '裂纹', desc: '模具表面或内部出现裂纹', enabled: true, count: 89 },
  { code: 'RT-005', name: '配件损坏', desc: '弹簧、螺钉、顶针等配件损坏', enabled: true, count: 156 },
  { code: 'RT-006', name: '渗料', desc: '渗料/跑料/溢料导致产品有飞边', enabled: true, count: 67 },
  { code: 'RT-007', name: '间隙异常', desc: '配合间隙过大/过小影响产品质量', enabled: true, count: 45 },
  { code: 'RT-008', name: '其他', desc: '其他未分类的故障类型', enabled: true, count: 23 },
]

// 维修等级
const REPAIR_LEVELS = [
  { code: 'L1', name: '小修', color: '#22c55e', hours: '0.5-4h', approval: '钳工自行', count: 312, desc: '单个配件更换、轻微磨损修复、清洁润滑等简单维修' },
  { code: 'L2', name: '中修', color: '#f59e0b', hours: '4-24h', approval: '车间主管', count: 189, desc: '多个配件更换、局部补焊、研磨修整、中等磨损修复' },
  { code: 'L3', name: '大修', color: '#ef4444', hours: '24h以上', approval: '厂长/工程师', count: 54, desc: '大面积补焊、型腔重做、结构件更换、需委外加工的维修' },
]

// 维修工序标准（按维修类型+等级绑定）
const PROCESS_STANDARDS = [
  {
    id: 'PS-001', type: '崩角', level: '小修',
    steps: [
      { no: 1, name: '拆解模具', std: '记录拆解状态，拍照留存', tools: '扳手、螺丝刀', hours: 0.5 },
      { no: 2, name: '缺陷确认', std: '确认崩角位置、尺寸及深度，记录损坏范围', tools: '游标卡尺、放大镜', hours: 0.5 },
      { no: 3, name: '研磨修复', std: '使用磨床或油石研磨崩角部位，控制尺寸公差', tools: '磨床、油石', hours: 1.5 },
      { no: 4, name: '尺寸检验', std: '修复后尺寸与图纸一致，偏差≤0.02mm', tools: '千分尺、高度规', hours: 0.5 },
      { no: 5, name: '组装试模', std: '按装配顺序组装，试模验证产品合格', tools: '扳手、铜棒', hours: 1.0 },
    ],
    parts: [{ no: 'BJ-001', name: '专用润滑脂', qty: 1 }],
    totalHours: 4.0,
  },
  {
    id: 'PS-002', type: '磨损', level: '中修',
    steps: [
      { no: 1, name: '拆解清洗', std: '全面拆解，煤油清洗各部件', tools: '扳手、煤油、毛刷', hours: 1.0 },
      { no: 2, name: '磨损检测', std: '检测各配合面磨损量，记录关键尺寸', tools: '千分尺、游标卡尺', hours: 1.0 },
      { no: 3, name: '补焊堆料', std: '对磨损部位补焊，预留加工余量', tools: '氩弧焊机、焊条', hours: 3.0 },
      { no: 4, name: '机加工修复', std: '磨床/铣床加工到设计尺寸', tools: '磨床、铣床', hours: 4.0 },
      { no: 5, name: '研磨抛光', std: '型腔表面抛光，粗糙度Ra≤0.8', tools: '抛光机、砂纸', hours: 2.0 },
      { no: 6, name: '组装检验', std: '按图纸组装，检验尺寸精度', tools: '扳手、检验量具', hours: 2.0 },
      { no: 7, name: '试模验证', std: '装模试生产，检验产品合格', tools: '注塑机/冲床', hours: 2.0 },
    ],
    parts: [
      { no: 'BJ-002', name: '导柱铜套', qty: 4 },
      { no: 'BJ-005', name: '密封圈', qty: 8 },
    ],
    totalHours: 15.0,
  },
  {
    id: 'PS-003', type: '裂纹', level: '大修',
    steps: [
      { no: 1, name: '全面拆解', std: '彻底拆解，记录各部件状态', tools: '扳手、铜棒', hours: 2.0 },
      { no: 2, name: '探伤检测', std: '磁粉/渗透探伤，确认裂纹范围', tools: '探伤仪、磁粉', hours: 3.0 },
      { no: 3, name: '裂纹铣除', std: '铣削去除裂纹材料，开坡口', tools: '铣床、砂轮', hours: 4.0 },
      { no: 4, name: '预热补焊', std: '预热后分层堆焊，控制焊接变形', tools: '预热炉、氩弧焊机', hours: 8.0 },
      { no: 5, name: '去应力处理', std: '回火处理消除焊接应力', tools: '热处理炉', hours: 6.0 },
      { no: 6, name: '机加工', std: '粗加工→精加工→尺寸修复', tools: '加工中心、磨床', hours: 12.0 },
      { no: 7, name: '抛光组装', std: '表面抛光、按图纸装配', tools: '抛光机、扳手', hours: 4.0 },
      { no: 8, name: '试模验证', std: '装模试生产，连续30件合格', tools: '注塑机/冲床', hours: 3.0 },
    ],
    parts: [
      { no: 'BJ-004', name: '弹簧套件', qty: 2 },
      { no: 'BJ-005', name: '密封圈', qty: 12 },
    ],
    totalHours: 42.0,
  },
  {
    id: 'PS-004', type: '配件损坏', level: '小修',
    steps: [
      { no: 1, name: '拆解检查', std: '确认损坏配件型号、规格', tools: '扳手、螺丝刀', hours: 0.5 },
      { no: 2, name: '领用备件', std: '按规格领用新件，核对型号', tools: '-', hours: 0.5 },
      { no: 3, name: '更换安装', std: '拆卸损坏件，安装新件', tools: '扳手、铜棒', hours: 1.0 },
      { no: 4, name: '试模验证', std: '试模验证功能正常', tools: '注塑机/冲床', hours: 1.0 },
    ],
    parts: [{ no: 'BJ-004', name: '弹簧套件', qty: 1 }],
    totalHours: 3.0,
  },
  {
    id: 'PS-005', type: '渗料', level: '中修',
    steps: [
      { no: 1, name: '拆解分型面', std: '检查分型面磨损、咬合情况', tools: '扳手、煤油', hours: 1.0 },
      { no: 2, name: '配合面研磨', std: '对分型面进行研磨，恢复配合精度', tools: '磨床、油石', hours: 4.0 },
      { no: 3, name: '排气槽清理', std: '检查并清理排气槽', tools: '什锦锉、砂纸', hours: 1.0 },
      { no: 4, name: '组装调整', std: '组装并调整锁模力', tools: '扳手、扭力扳手', hours: 2.0 },
      { no: 5, name: '试模验证', std: '试模检查产品无飞边', tools: '注塑机', hours: 2.0 },
    ],
    parts: [{ no: 'BJ-005', name: '密封圈', qty: 4 }],
    totalHours: 10.0,
  },
]

// 备件库
const SPARE_PARTS = [
  { no: 'BJ-001', name: '专用润滑脂', spec: '500g/罐', unit: '罐', price: 45, stock: 120, category: '耗材' },
  { no: 'BJ-002', name: '导柱铜套', spec: 'φ25×60', unit: '个', price: 128, stock: 48, category: '结构件' },
  { no: 'BJ-003', name: '顶针', spec: 'φ6×200', unit: '根', price: 35, stock: 200, category: '易损件' },
  { no: 'BJ-004', name: '弹簧套件', spec: 'SWB30', unit: '套', price: 260, stock: 60, category: '结构件' },
  { no: 'BJ-005', name: '密封圈', spec: 'NBR70', unit: '个', price: 18, stock: 500, category: '易损件' },
  { no: 'BJ-006', name: '冷却水管', spec: 'φ8×1.5', unit: '根', price: 85, stock: 30, category: '功能件' },
  { no: 'BJ-007', name: '导向件', spec: 'GB28', unit: '个', price: 156, stock: 25, category: '结构件' },
  { no: 'BJ-008', name: '定位销', spec: 'φ10×50', unit: '个', price: 22, stock: 180, category: '紧固件' },
  { no: 'BJ-009', name: '内六角螺钉', spec: 'M10×25', unit: '颗', price: 5, stock: 1200, category: '紧固件' },
  { no: 'BJ-010', name: '氮气弹簧', spec: 'K-1000', unit: '个', price: 880, stock: 12, category: '功能件' },
]

/* ============ 页面主体 ============ */

export default function RepairStandardPage() {
  const [activeTab, setActiveTab] = useState<'types' | 'process' | 'level' | 'parts'>('types')
  const [search, setSearch] = useState('')
  const [showEdit, setShowEdit] = useState<any>(null)

  const tabs = [
    { key: 'types', label: '维修类型管理', icon: ListChecks, desc: '定义统一的故障类型分类，全系统下拉数据源' },
    { key: 'process', label: '维修工序标准', icon: Wrench, desc: '每种故障绑定标准工序步骤、工时、所需备件' },
    { key: 'level', label: '维修等级', icon: Star, desc: '小修/中修/大修三级分类及审批权限' },
    { key: 'parts', label: '备件绑定', icon: Package, desc: '关联库存备件及领用规则' },
  ]

  return (
    <MainLayout>
      <div className="p-4 flex flex-col gap-4 h-full">
        {/* 页面头部 */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings2 className="text-[#1e5fa8]" size={20} />
            <div>
              <div className="text-gray-800 font-medium text-sm">维修标准配置</div>
              <div className="text-[12px] text-gray-500 mt-0.5">统一维修基础数据，全系统下拉数据源，由工艺/管理员维护</div>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <Clock size={11} />
            最近更新：2026-06-20 15:30
          </div>
        </div>

        {/* 顶部Tab */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-lg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#1e5fa8] text-[#1e5fa8] font-medium bg-blue-50/30'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'types' && <RepairTypesTab search={search} onSearch={setSearch} />}
          {activeTab === 'process' && <ProcessStandardTab />}
          {activeTab === 'level' && <RepairLevelTab />}
          {activeTab === 'parts' && <PartsBindingTab />}
        </div>
      </div>
    </MainLayout>
  )
}

/* ============ 维修类型管理 ============ */
function RepairTypesTab({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
  const [data, setData] = useState(REPAIR_TYPES)
  const filtered = data.filter((t) => !search || t.name.includes(search) || t.code.includes(search) || t.desc.includes(search))

  const toggle = (code: string) => {
    setData((prev) => prev.map((t) => (t.code === code ? { ...t, enabled: !t.enabled } : t)))
  }

  return (
    <div className="bg-white rounded-b-lg border border-gray-200 border-t-0 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="搜索类型名称/编码/描述"
              className="border border-gray-200 rounded pl-8 pr-3 py-1.5 text-[12px] w-64 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">
            <FileUp size={12} /> 批量导入
          </button>
          <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">
            <FileDown size={12} /> 导出清单
          </button>
          <button className="flex items-center gap-1 text-[12px] text-white bg-[#1e5fa8] rounded px-3 py-1.5 hover:bg-[#164a85]">
            <Plus size={12} /> 新增类型
          </button>
        </div>
      </div>

      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-gray-50 text-gray-500">
            <th className="px-3 py-2 text-left font-medium w-24">类型编码</th>
            <th className="px-3 py-2 text-left font-medium w-32">类型名称</th>
            <th className="px-3 py-2 text-left font-medium">描述说明</th>
            <th className="px-3 py-2 text-center font-medium w-24">被引用次数</th>
            <th className="px-3 py-2 text-center font-medium w-20">状态</th>
            <th className="px-3 py-2 text-center font-medium w-40">操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.code} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2.5 font-mono text-gray-600">{t.code}</td>
              <td className="px-3 py-2.5 text-gray-800 font-medium">{t.name}</td>
              <td className="px-3 py-2.5 text-gray-500">{t.desc}</td>
              <td className="px-3 py-2.5 text-center text-gray-600">{t.count} 次</td>
              <td className="px-3 py-2.5 text-center">
                <button onClick={() => toggle(t.code)} className="text-[#22c55e] hover:text-[#16a34a]">
                  {t.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} className="text-gray-400" />}
                </button>
              </td>
              <td className="px-3 py-2.5 text-center">
                <button className="text-[#1e5fa8] hover:underline mr-3">查看工序</button>
                <button className="text-gray-500 hover:text-gray-700 mr-3"><Edit2 size={12} className="inline mr-1" />编辑</button>
                <button className="text-red-500 hover:text-red-700"><Trash2 size={12} className="inline mr-1" />停用</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3 text-[12px] text-blue-700">
        <AlertTriangle size={12} className="inline mr-2" />
        提示：维修类型为系统核心基础数据，禁用后将影响工单创建时的选择，建议保持至少 6 个以上常用类型。
      </div>
    </div>
  )
}

/* ============ 维修工序标准 ============ */
function ProcessStandardTab() {
  const [expanded, setExpanded] = useState<string | null>('PS-001')

  return (
    <div className="bg-white rounded-b-lg border border-gray-200 border-t-0 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] text-gray-500">共 {PROCESS_STANDARDS.length} 条工序标准 · 覆盖 {REPAIR_TYPES.length} 种故障类型</div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">
            <FileDown size={12} /> 导出
          </button>
          <button className="flex items-center gap-1 text-[12px] text-white bg-[#1e5fa8] rounded px-3 py-1.5 hover:bg-[#164a85]">
            <Plus size={12} /> 新增标准
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {PROCESS_STANDARDS.map((ps) => (
          <div key={ps.id} className="border border-gray-200 rounded overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => setExpanded(expanded === ps.id ? null : ps.id)}
            >
              <ChevronRight size={14} className={`text-gray-500 transition-transform ${expanded === ps.id ? 'rotate-90' : ''}`} />
              <span className="font-mono text-[12px] text-gray-500">{ps.id}</span>
              <span className="text-[13px] text-gray-800 font-medium">{ps.type}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                ps.level === '小修' ? 'bg-green-100 text-green-700' :
                ps.level === '中修' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>{ps.level}</span>
              <span className="text-[12px] text-gray-500">共 {ps.steps.length} 个工序 · 预计 {ps.totalHours} 小时</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] text-gray-500">需 {ps.parts.length} 种备件</span>
                <button
                  onClick={(e) => { e.stopPropagation() }}
                  className="text-[11px] text-[#1e5fa8] hover:underline px-2 py-1"
                >
                  <Edit2 size={11} className="inline mr-1" />编辑
                </button>
              </div>
            </div>

            {expanded === ps.id && (
              <div className="p-4">
                <div className="text-[12px] text-gray-600 font-medium mb-2">标准工序步骤</div>
                <table className="w-full text-[12px] mb-4">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="px-3 py-1.5 text-left font-medium w-12">序号</th>
                      <th className="px-3 py-1.5 text-left font-medium w-40">工序名称</th>
                      <th className="px-3 py-1.5 text-left font-medium">标准/要求</th>
                      <th className="px-3 py-1.5 text-left font-medium w-48">所需工具</th>
                      <th className="px-3 py-1.5 text-center font-medium w-20">工时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ps.steps.map((s) => (
                      <tr key={s.no} className="border-b border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-700">{s.no}</td>
                        <td className="px-3 py-2 text-gray-800">{s.name}</td>
                        <td className="px-3 py-2 text-gray-500">{s.std}</td>
                        <td className="px-3 py-2 text-gray-500">{s.tools}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{s.hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {ps.parts.length > 0 && (
                  <>
                    <div className="text-[12px] text-gray-600 font-medium mb-2">所需备件</div>
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500">
                          <th className="px-3 py-1.5 text-left font-medium w-32">备件编码</th>
                          <th className="px-3 py-1.5 text-left font-medium">备件名称</th>
                          <th className="px-3 py-1.5 text-center font-medium w-20">数量</th>
                          <th className="px-3 py-1.5 text-right font-medium w-32">库存</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ps.parts.map((p) => {
                          const sp = SPARE_PARTS.find((s) => s.no === p.no)
                          return (
                            <tr key={p.no} className="border-b border-gray-100">
                              <td className="px-3 py-2 font-mono text-gray-600">{p.no}</td>
                              <td className="px-3 py-2 text-gray-800">{p.name}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{p.qty}</td>
                              <td className="px-3 py-2 text-right text-gray-500">
                                {sp && sp.stock < p.qty ? (
                                  <span className="text-red-500">不足（{sp.stock}）</span>
                                ) : (
                                  <span>{sp?.stock || '-'} 件</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============ 维修等级 ============ */
function RepairLevelTab() {
  return (
    <div className="bg-white rounded-b-lg border border-gray-200 border-t-0 p-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {REPAIR_LEVELS.map((lvl) => (
          <div key={lvl.code} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[11px] text-gray-500 font-mono">{lvl.code}</span>
                <div className="text-lg font-bold text-gray-800 mt-0.5">{lvl.name}</div>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: lvl.color + '20' }}>
                <Star size={18} style={{ color: lvl.color }} />
              </div>
            </div>
            <div className="text-[12px] text-gray-500 mb-3 leading-relaxed">{lvl.desc}</div>
            <div className="space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-gray-500">标准工时</span>
                <span className="text-gray-700 font-medium">{lvl.hours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">审批权限</span>
                <span className="text-gray-700 font-medium">{lvl.approval}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">本年工单</span>
                <span className="text-gray-700 font-medium">{lvl.count} 单</span>
              </div>
            </div>
            <button className="mt-3 w-full text-[12px] text-[#1e5fa8] border border-[#1e5fa8] rounded py-1.5 hover:bg-[#1e5fa8] hover:text-white transition-colors">
              <Edit2 size={11} className="inline mr-1" />编辑配置
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-[12px] text-amber-700">
        <AlertTriangle size={12} className="inline mr-2" />
        维修等级的工时范围和审批权限为系统级配置，修改后将应用于所有新创建的维修工单。
      </div>
    </div>
  )
}

/* ============ 备件绑定 ============ */
function PartsBindingTab() {
  const [filter, setFilter] = useState('')
  const filtered = SPARE_PARTS.filter((p) => !filter || p.name.includes(filter) || p.no.includes(filter) || p.category.includes(filter))

  return (
    <div className="bg-white rounded-b-lg border border-gray-200 border-t-0 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="搜索备件"
              className="border border-gray-200 rounded pl-8 pr-3 py-1.5 text-[12px] w-56 focus:outline-none focus:border-blue-400"
            />
          </div>
          <select className="border border-gray-200 rounded px-3 py-1.5 text-[12px] bg-white focus:outline-none">
            <option>全部分类</option>
            <option>结构件</option>
            <option>易损件</option>
            <option>功能件</option>
            <option>紧固件</option>
            <option>耗材</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">
            <FileDown size={12} /> 导出
          </button>
          <button className="flex items-center gap-1 text-[12px] text-white bg-[#1e5fa8] rounded px-3 py-1.5 hover:bg-[#164a85]">
            <Plus size={12} /> 新增备件
          </button>
        </div>
      </div>

      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-gray-50 text-gray-500">
            <th className="px-3 py-2 text-left font-medium w-24">备件编码</th>
            <th className="px-3 py-2 text-left font-medium w-32">备件名称</th>
            <th className="px-3 py-2 text-left font-medium w-32">规格型号</th>
            <th className="px-3 py-2 text-left font-medium w-20">分类</th>
            <th className="px-3 py-2 text-center font-medium w-16">单位</th>
            <th className="px-3 py-2 text-right font-medium w-20">单价</th>
            <th className="px-3 py-2 text-center font-medium w-20">库存</th>
            <th className="px-3 py-2 text-center font-medium w-40">操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.no} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2.5 font-mono text-gray-600">{p.no}</td>
              <td className="px-3 py-2.5 text-gray-800 font-medium">{p.name}</td>
              <td className="px-3 py-2.5 text-gray-500">{p.spec}</td>
              <td className="px-3 py-2.5"><span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded">{p.category}</span></td>
              <td className="px-3 py-2.5 text-center text-gray-600">{p.unit}</td>
              <td className="px-3 py-2.5 text-right text-gray-600">¥{p.price}</td>
              <td className="px-3 py-2.5 text-center">
                <span className={p.stock < 20 ? 'text-red-500 font-medium' : 'text-gray-600'}>{p.stock}</span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <button className="text-[#1e5fa8] hover:underline mr-3">关联工序</button>
                <button className="text-gray-500 hover:text-gray-700 mr-3"><Edit2 size={12} className="inline mr-1" />编辑</button>
                <button className="text-red-500 hover:text-red-700"><Trash2 size={12} className="inline mr-1" />删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 bg-green-50 border border-green-200 rounded p-3 text-[12px] text-green-700">
        <Check size={12} className="inline mr-2" />
        当前备件库共 {SPARE_PARTS.length} 个备件，已关联 {PROCESS_STANDARDS.length} 条工序标准 · 领用规则：小修工单打单领用，中修/大修工单批次领用
      </div>
    </div>
  )
}
