'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Pencil, Trash2, Plus, Search, ChevronDown,
  ZoomIn, ZoomOut, X, ToggleLeft, ToggleRight,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────
type ProcessNode = {
  id: string
  name: string
  description: string
  errorProofing: boolean
  packingStation: boolean
  workCenter: string
  x: number
  y: number
}

// ─── Initial Data ────────────────────────────────────────────────────────────
const INITIAL_NODES: ProcessNode[] = [
  { id: 'N1', name: '粗铣',      description: '', errorProofing: false, packingStation: false, workCenter: '加工中心01', x: 80,  y: 80  },
  { id: 'N2', name: '钳工',      description: '', errorProofing: false, packingStation: false, workCenter: '钳工车间',   x: 230, y: 80  },
  { id: 'N3', name: '热处理',    description: '', errorProofing: false, packingStation: false, workCenter: '热处理车间', x: 380, y: 80  },
  { id: 'N4', name: '车配',      description: '', errorProofing: false, packingStation: false, workCenter: '车床车间',   x: 530, y: 80  },
  { id: 'N5', name: '精车',      description: '', errorProofing: false, packingStation: false, workCenter: '车床车间',   x: 80,  y: 180 },
  { id: 'N6', name: '平面磨',    description: '', errorProofing: false, packingStation: false, workCenter: '磨床车间',   x: 230, y: 180 },
  { id: 'N7', name: '线切割',    description: '', errorProofing: false, packingStation: false, workCenter: '线切割车间', x: 380, y: 180 },
  { id: 'N8', name: '精铣',      description: '', errorProofing: false, packingStation: false, workCenter: '加工中心01', x: 530, y: 180 },
  { id: 'N9', name: '平面割',    description: '', errorProofing: false, packingStation: false, workCenter: '切割车间',   x: 80,  y: 280 },
  { id: 'N10', name: '线切割',   description: '', errorProofing: false, packingStation: false, workCenter: '线切割车间', x: 230, y: 280 },
  { id: 'N11', name: '精铣+电火',description: '', errorProofing: false, packingStation: false, workCenter: '加工中心02', x: 380, y: 280 },
  { id: 'N12', name: '抛光',     description: '', errorProofing: false, packingStation: false, workCenter: '抛光车间',   x: 530, y: 280 },
]

const ROUTE_INFO = {
  name: '百达电器模具工艺路线',
  description: '模具制造标准工艺路线',
  productionConfig: [],
}

// ─── Subcomponents ──────────────────────────────────────────────────────────
function FlowNode({
  node,
  selected,
  dimmed,
  onSelect,
  scale,
}: {
  node: ProcessNode
  selected: boolean
  dimmed: boolean
  onSelect: (id: string) => void
  scale: number
}) {
  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => onSelect(node.id)}
      style={{ cursor: 'pointer' }}
    >
      {/* Node box */}
      <rect
        x={0} y={0} width={140} height={36} rx={6}
        fill={selected ? '#5b9e78' : dimmed ? '#8aab97' : '#a8d4b8'}
        stroke={selected ? '#3d7a5a' : 'transparent'}
        strokeWidth={2}
      />
      {/* Dot */}
      <circle cx={16} cy={18} r={7} fill={selected ? '#1a3d2b' : '#2e4a3a'} />
      {/* Label */}
      <text x={32} y={23} fontSize={13} fill="#1a3d2b" fontWeight={500}>
        {node.name}
      </text>
      {/* Edit icon placeholder */}
      <g transform="translate(116, 10)">
        <rect x={0} y={0} width={18} height={18} rx={3} fill="rgba(255,255,255,0.3)" />
        <text x={4} y={13} fontSize={11} fill="#2e4a3a">✎</text>
      </g>
    </g>
  )
}

function CurvedArrow({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  // from = right edge of from-node, to = left edge of to-node
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  const d = `M${from.x},${from.y} C${from.x + 40},${from.y} ${to.x - 40},${to.y} ${to.x},${to.y}`
  return (
    <path d={d} stroke="#8aad9c" strokeWidth={2} fill="none" />
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProcessRouteEditPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'routes'>('info')
  const [nodes, setNodes] = useState<ProcessNode[]>(INITIAL_NODES)
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null)
  const [nodeSearch, setNodeSearch] = useState('')
  const [scale, setScale] = useState(1)
  const [routeInfo, setRouteInfo] = useState(ROUTE_INFO)
  const [editNode, setEditNode] = useState<ProcessNode | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // When a node is selected, set its editable copy
  useEffect(() => {
    if (selectedNode) setEditNode({ ...selectedNode })
  }, [selectedNode])

  const handleSelectNode = (id: string) => {
    const n = nodes.find((n) => n.id === id)
    setSelectedNode(n ?? null)
  }

  const handleSaveNode = () => {
    if (!editNode) return
    setNodes((prev) => prev.map((n) => (n.id === editNode.id ? editNode : n)))
    setSelectedNode(editNode)
  }

  const handleCancelNode = () => {
    setSelectedNode(null)
    setEditNode(null)
  }

  const dimmed = !!selectedNode

  // Arrow connections: row1 N1→N2→N3→N4, row2 N5→N6→N7→N8, row3 N9→N10→N11→N12, then N4→N5, N8→N9
  const arrows = [
    { from: INITIAL_NODES[0], to: INITIAL_NODES[1] },
    { from: INITIAL_NODES[1], to: INITIAL_NODES[2] },
    { from: INITIAL_NODES[2], to: INITIAL_NODES[3] },
    { from: INITIAL_NODES[3], to: INITIAL_NODES[4] },
    { from: INITIAL_NODES[4], to: INITIAL_NODES[5] },
    { from: INITIAL_NODES[5], to: INITIAL_NODES[6] },
    { from: INITIAL_NODES[6], to: INITIAL_NODES[7] },
    { from: INITIAL_NODES[7], to: INITIAL_NODES[8] },
    { from: INITIAL_NODES[8], to: INITIAL_NODES[9] },
    { from: INITIAL_NODES[9], to: INITIAL_NODES[10] },
    { from: INITIAL_NODES[10], to: INITIAL_NODES[11] },
  ]

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex flex-shrink-0">
          {(['info', 'routes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'info' ? '编辑路线信息' : '工艺路线'}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Route Info ─────────────────────────────────────────── */}
        {activeTab === 'info' && (
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-2xl space-y-10">
              {/* Basic info */}
              <section>
                <h2 className="text-[15px] font-semibold text-gray-700 mb-5">基本信息</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1.5">
                      工艺路线名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={routeInfo.name}
                      onChange={(e) => setRouteInfo((r) => ({ ...r, name: e.target.value }))}
                      className="w-full border-0 border-b border-gray-300 pb-1.5 text-[14px] text-gray-800 focus:outline-none focus:border-blue-500 bg-gray-50 rounded-t px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1.5">描述</label>
                    <textarea
                      value={routeInfo.description}
                      onChange={(e) => setRouteInfo((r) => ({ ...r, description: e.target.value }))}
                      rows={4}
                      className="w-full border-0 border-b border-gray-300 text-[14px] text-gray-800 focus:outline-none focus:border-blue-500 bg-gray-50 rounded-t px-3 py-2 resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Production config */}
              <section>
                <h2 className="text-[15px] font-semibold text-gray-700 mb-5">生产配置</h2>
                <div className="space-y-2">
                  {routeInfo.productionConfig.map((pc) => (
                    <div key={pc.id} className="border border-gray-200 rounded px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-[13px] text-gray-800 font-medium">{pc.id}</div>
                        <div className="text-[12px] text-gray-500 mt-0.5">生产线：{pc.line}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={13} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full border border-dashed border-gray-300 rounded px-4 py-2.5 flex items-center justify-center gap-1 text-[13px] text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                    <Plus size={14} /> 添加生产配置
                  </button>
                </div>
              </section>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="px-8 py-2 bg-blue-700 hover:bg-blue-800 text-white text-[14px] rounded transition-colors">保存</button>
                <Link href="/molds/process-routes" className="px-8 py-2 border border-blue-300 text-blue-700 text-[14px] rounded hover:bg-blue-50 transition-colors">取消</Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Process Flow Canvas ────────────────────────────────── */}
        {activeTab === 'routes' && (
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left search/filter panel */}
            <div className="w-[220px] min-w-[220px] border-r border-gray-200 bg-white flex flex-col p-3 gap-3 shrink-0">
              <div className="relative">
                <input
                  value={nodeSearch}
                  onChange={(e) => setNodeSearch(e.target.value)}
                  placeholder="搜索..."
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-[13px] pr-8 focus:outline-none focus:border-blue-400"
                />
                <Search size={13} className="absolute right-2.5 top-2 text-gray-400" />
              </div>
              <div className="border border-gray-200 rounded px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                <span className="text-[13px] text-gray-600">工序</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              {/* Node list */}
              <div className="flex-1 overflow-auto">
                {nodes
                  .filter((n) => !nodeSearch || n.name.includes(nodeSearch))
                  .map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleSelectNode(n.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-[13px] transition-colors mb-0.5 ${
                        selectedNode?.id === n.id
                          ? 'bg-teal-100 text-teal-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {n.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Canvas area */}
            <div
              className="flex-1 overflow-auto relative"
              style={{ background: `radial-gradient(circle, #d0d0d0 1px, transparent 1px)`, backgroundSize: '20px 20px', backgroundColor: '#f5f5f5' }}
              onClick={() => { if (!selectedNode) return; setSelectedNode(null); setEditNode(null) }}
            >
              {/* Zoom controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); setScale((s) => Math.min(s + 0.2, 2)) }}
                  className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50 shadow-sm"
                >
                  <ZoomIn size={14} className="text-gray-600" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setScale((s) => Math.max(s - 0.2, 0.4)) }}
                  className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50 shadow-sm"
                >
                  <ZoomOut size={14} className="text-gray-600" />
                </button>
              </div>

              {/* Add node button */}
              <button
                onClick={(e) => { e.stopPropagation() }}
                className="absolute bottom-4 left-4 flex items-center gap-1 text-[13px] bg-white border border-gray-300 rounded px-3 py-1.5 shadow-sm hover:bg-gray-50 z-10"
              >
                <Plus size={13} className="text-blue-600" /> 添加工序
              </button>

              <svg
                width="100%"
                height="100%"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top left', minWidth: 700, minHeight: 500 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Arrows */}
                {arrows.map((a, i) => (
                  <CurvedArrow
                    key={i}
                    from={{ x: a.from.x + 140, y: a.from.y + 18 }}
                    to={{ x: a.to.x, y: a.to.y + 18 }}
                  />
                ))}
                {/* Nodes */}
                {nodes.map((n) => (
                  <FlowNode
                    key={n.id}
                    node={n}
                    selected={selectedNode?.id === n.id}
                    dimmed={dimmed && selectedNode?.id !== n.id}
                    onSelect={handleSelectNode}
                    scale={scale}
                  />
                ))}
              </svg>
            </div>

            {/* Right: Node detail panel (when a node is selected) */}
            {editNode && (
              <div
                ref={panelRef}
                className="w-[380px] min-w-[340px] border-l border-gray-200 bg-white flex flex-col overflow-auto shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 text-[15px]">{editNode.name}</h3>
                  <button onClick={handleCancelNode} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-5 space-y-6">
                  {/* Basic info */}
                  <section>
                    <h4 className="text-[13px] font-semibold text-gray-700 mb-4">基本信息</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">工序名称 <span className="text-red-500">*</span></label>
                        <input
                          value={editNode.name}
                          onChange={(e) => setEditNode((n) => n ? { ...n, name: e.target.value } : n)}
                          className="w-full bg-gray-50 border-0 border-b border-gray-300 px-2 py-1.5 text-[13px] focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">描述</label>
                        <textarea
                          value={editNode.description}
                          onChange={(e) => setEditNode((n) => n ? { ...n, description: e.target.value } : n)}
                          rows={4}
                          className="w-full bg-gray-50 border-b border-gray-300 px-2 py-1.5 text-[13px] focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                      {/* Toggles */}
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[13px] text-gray-600">是否防错校验</span>
                        <button
                          onClick={() => setEditNode((n) => n ? { ...n, errorProofing: !n.errorProofing } : n)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {editNode.errorProofing
                            ? <ToggleRight size={26} className="text-blue-600" />
                            : <ToggleLeft size={26} />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[13px] text-gray-600">包装工位</span>
                        <button
                          onClick={() => setEditNode((n) => n ? { ...n, packingStation: !n.packingStation } : n)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {editNode.packingStation
                            ? <ToggleRight size={26} className="text-blue-600" />
                            : <ToggleLeft size={26} />}
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Work center */}
                  <section>
                    <h4 className="text-[13px] font-semibold text-gray-700 mb-4">加工中心</h4>
                    <div className="flex items-center gap-2">
                      <input
                        value={editNode.workCenter}
                        onChange={(e) => setEditNode((n) => n ? { ...n, workCenter: e.target.value } : n)}
                        placeholder="加工中心"
                        className="flex-1 bg-gray-50 border-0 border-b border-gray-300 px-2 py-1.5 text-[13px] focus:outline-none focus:border-blue-500"
                      />
                      <button className="p-1.5 text-teal-600 hover:bg-teal-50 rounded"><Plus size={14} /></button>
                      <button className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </section>

                  {/* Input materials */}
                  <section>
                    <h4 className="text-[13px] font-semibold text-gray-700 mb-3">输入物料</h4>
                    <button className="w-full border border-dashed border-gray-300 rounded px-3 py-2 flex items-center justify-center gap-1 text-[12px] text-gray-400 hover:border-blue-400 hover:text-blue-500">
                      <Plus size={13} />
                    </button>
                  </section>

                  {/* ESOP */}
                  <section>
                    <h4 className="text-[13px] font-semibold text-gray-700 mb-3">ESOP</h4>
                    <button className="w-full border border-dashed border-gray-300 rounded px-3 py-2 flex items-center justify-center gap-1 text-[12px] text-gray-400 hover:border-blue-400 hover:text-blue-500">
                      <Plus size={13} />
                    </button>
                  </section>
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
                  <button
                    onClick={handleSaveNode}
                    className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white text-[13px] rounded transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelNode}
                    className="flex-1 py-2 border border-blue-300 text-blue-700 text-[13px] rounded hover:bg-blue-50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
