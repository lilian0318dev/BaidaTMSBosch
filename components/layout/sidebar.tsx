'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown, ChevronRight, X, Wrench, Factory,
  Shield, ClipboardList, Package, BarChart2, LayoutGrid,
  CalendarClock, Cpu, Truck, Box, ArrowDownToLine, ArrowUpFromLine, Boxes, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavChild { label: string; href: string }
interface NavItem {
  label: string
  icon: React.ReactNode
  children: NavChild[]
}

const navItems: NavItem[] = [
  {
    label: '模具管理',
    icon: <Box size={17} />,
    children: [
      { label: '模具档案', href: '/molds' },
      { label: '模具使用', href: '/molds/usage-log' },
    ],
  },
  {
    label: '基础数据管理',
    icon: <LayoutGrid size={17} />,
    children: [
      { label: '工艺路线', href: '/molds/process-routes' },
      { label: '仓库定义', href: '/molds/warehouse' },
      { label: '工艺卡片', href: '/molds/esop' },
      { label: '不良原因库', href: '/master/defect-reasons' },
    ],
  },
  {
    label: '模具维修',
    icon: <Wrench size={17} />,
    children: [
      { label: '维修申请', href: '/maintenance/repair-request' },
      { label: '待修模具接收', href: '/maintenance/repair-receive' },
      { label: '我的维修任务', href: '/maintenance/my-repair-tasks' },
    ],
  },
  {
    label: '模具保养',
    icon: <Shield size={17} />,
    children: [
      { label: '保养计划制定', href: '/maintenance/plan-rules' },
      { label: '待保养模具接收', href: '/maintenance/maintenance-receive' },
      { label: '保养工单看板', href: '/maintenance/board' },
      { label: '我的保养任务', href: '/maintenance/my-tasks' },
      { label: '保养项标准库', href: '/maintenance/tasks' },
    ],
  },
  {
    label: '工单管理',
    icon: <CalendarClock size={17} />,
    children: [
      { label: '工单管理', href: '/production/work-orders' },
      { label: '生产进度管理', href: '/production/progress' },
    ],
  },
  {
    label: '生产任务执行',
    icon: <Cpu size={17} />,
    children: [
      { label: '工序任务单管理', href: '/production/task-generation' },
      { label: '生产任务执行', href: '/production/field-execution' },
    ],
  },
  {
    label: '模次实时报工',
    icon: <Factory size={17} />,
    children: [
      { label: '模次实时报工', href: '/production/shot-count-reporting' },
    ],
  },
  {
    label: '委外管理',
    icon: <Truck size={17} />,
    children: [
      { label: '委外管理', href: '/outsourcing/arrival' },
    ],
  },
  {
    label: '入库管理',
    icon: <ArrowDownToLine size={17} />,
    children: [
      { label: '工艺入库审核', href: '/storage/process-inbound' },
      { label: '委外到货通知', href: '/storage/outsourcing-arrival' },
      { label: '入库执行', href: '/storage/inbound' },
      { label: '正式入库单', href: '/storage/inbound-list' },
    ],
  },
  {
    label: '出库管理',
    icon: <ArrowUpFromLine size={17} />,
    children: [
      { label: '领料申请', href: '/storage/picking-request' },
      { label: '报废申请', href: '/storage/scrap-request' },
      { label: '出库执行', href: '/storage/outbound' },
      { label: '正式出库单', href: '/storage/outbound-list' },
      { label: '销售出库单', href: '/storage/sales-outbound' },
    ],
  },
  {
    label: '库存管理',
    icon: <Boxes size={17} />,
    children: [
      { label: '库存台账', href: '/storage/inventory' },
      { label: '仓储盘点', href: '/storage/stocktake' },
    ],
  },
  {
    label: '报表管理',
    icon: <BarChart2 size={17} />,
    children: [
      { label: '模具看板', href: '/molds/dashboard' },
      { label: '维修绩效报表', href: '/performance/repair-report' },
      { label: '保养绩效报表', href: '/performance/maintenance-report' },
      { label: '模具型号统计', href: '/performance/mold-statistics' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  const isActive = (href: string) => {
    if (pathname === href) return true
    if (pathname.startsWith(href + '/')) return true
    return false
  }

  const hasActiveChild = (item: NavItem) => item.children.some((c) => isActive(c.href))

  const getDefaultExpanded = () => {
    const result: string[] = []
    for (const item of navItems) {
      if (hasActiveChild(item)) {
        result.push(item.label)
      }
    }
    return result.length > 0 ? result : ['基础数据管理']
  }

  const [expandedItems, setExpandedItems] = useState<string[]>(getDefaultExpanded)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
      setCurrentDate(now.toLocaleDateString('zh-CN'))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    )
  }

  return (
    <aside className="w-[220px] min-w-[220px] bg-[#2b3a4a] flex flex-col h-full shrink-0">
      <div className="flex items-center justify-between px-4 py-[14px] border-b border-white/10">
        <span className="text-white font-semibold text-[15px] tracking-wide">模工具管理</span>
        <button className="text-white/50 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const expanded = expandedItems.includes(item.label)
          const active = hasActiveChild(item)
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleExpand(item.label)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-[11px] text-[13px] text-white/80 hover:text-white transition-colors',
                  active && 'text-white'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn('opacity-60', active && 'opacity-100')}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {expanded
                  ? <ChevronDown size={13} className="text-white/40" />
                  : <ChevronRight size={13} className="text-white/40" />}
              </button>

              {expanded && (
                <div>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block pl-10 pr-4 py-[9px] text-[13px] text-white/60 hover:text-white hover:bg-white/8 transition-colors',
                        isActive(child.href) && 'bg-white/12 text-white font-medium'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-white/35 text-[11px]">{currentTime} {currentDate} 2.1.0</p>
      </div>
    </aside>
  )
}
