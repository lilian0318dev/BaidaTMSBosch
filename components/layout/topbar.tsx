'use client'

import { usePathname } from 'next/navigation'
import { ArrowLeftRight, Home, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Crumb = { label: string; href?: string }

function getBreadcrumbs(pathname: string): Crumb[] {
  const staticMap: Record<string, Crumb[]> = {
    '/molds': [{ label: 'TMS' }, { label: '模具档案' }],
    '/molds/dashboard': [{ label: 'TMS' }, { label: '模具看板' }],
    '/molds/new': [{ label: 'TMS' }, { label: '模具档案', href: '/molds' }, { label: '新增' }],
    '/maintenance/repair-board': [{ label: 'TMS' }, { label: '维修工单看板' }],
    '/maintenance/repair-request': [{ label: 'TMS' }, { label: '报修申请' }],
    '/maintenance/repair-reasons': [{ label: 'TMS' }, { label: '维修原因' }],
    '/maintenance/plan': [{ label: 'TMS' }, { label: '保养工单看板' }],
    '/maintenance/plan-rules': [{ label: 'TMS' }, { label: '模具保养' }, { label: '保养计划制定' }],
    '/maintenance/plan-rules/new': [{ label: 'TMS' }, { label: '模具保养' }, { label: '保养计划制定', href: '/maintenance/plan-rules' }, { label: '新建计划' }],
    '/maintenance/board': [{ label: 'TMS' }, { label: '模具保养' }, { label: '保养工单看板' }],
    '/maintenance/my-tasks': [{ label: 'TMS' }, { label: '模具保养' }, { label: '我的保养任务' }],
    '/maintenance/tasks': [{ label: 'TMS' }, { label: '模具保养' }, { label: '保养项标准库' }],
    '/maintenance/task-groups': [{ label: 'TMS' }, { label: '保养项组' }],
    '/tasks/my-tasks': [{ label: 'TMS' }, { label: '我的任务' }],
    '/tasks/work-orders': [{ label: 'TMS' }, { label: '工单管理' }],
    '/tasks/work-orders/new': [{ label: 'TMS' }, { label: '工单管理', href: '/tasks/work-orders' }, { label: '新建工单' }],
    '/molds/warehouse': [{ label: 'TMS' }, { label: '仓库定义' }],
    '/molds/esop': [{ label: 'TMS' }, { label: 'ESOP' }],
    '/molds/bom': [{ label: 'TMS' }, { label: '模具工装BOM' }],
    '/molds/process-routes': [{ label: 'TMS' }, { label: '工艺路线' }],
    '/storage/warehouse': [{ label: 'TMS' }, { label: '仓库' }],
    '/storage/inbound': [{ label: 'TMS' }, { label: '入库管理' }],
    '/storage/outbound': [{ label: 'TMS' }, { label: '出库管理' }],
    '/storage/inventory': [{ label: 'TMS' }, { label: '库存台账' }],
    '/storage/stocktake': [{ label: 'TMS' }, { label: '仓储盘点' }],
    '/performance/repair-report': [{ label: 'TMS' }, { label: '维修绩效报表' }],
    '/performance/maintenance-report': [{ label: 'TMS' }, { label: '保养绩效报表' }],
    '/performance/mold-statistics': [{ label: 'TMS' }, { label: '模具型号统计' }],
    '/production/plans': [{ label: 'TMS' }, { label: '生产计划' }],
    '/production/work-orders': [{ label: 'TMS' }, { label: '生产工单管理' }],
    '/production/task-generation': [{ label: 'TMS' }, { label: '工序任务单管理' }],
    '/production/field-execution': [{ label: 'TMS' }, { label: '现场任务执行' }],
    '/production/process-completion': [{ label: 'TMS' }, { label: '工序完工与转移' }],
    '/production/task-changes': [{ label: 'TMS' }, { label: '任务单变更管理' }],
    '/outsourcing/tasks': [{ label: 'TMS' }, { label: '委外任务单' }],
    '/outsourcing/tracking': [{ label: 'TMS' }, { label: '委外跟踪' }],
  }

  if (staticMap[pathname]) return staticMap[pathname]

  if (/^\/production\/plans\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '生产计划', href: '/production/plans' }, { label: `计划 ${id}` }]
  }
  if (/^\/production\/work-orders\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '生产工单管理', href: '/production/work-orders' }, { label: `工单 ${id}` }]
  }
  if (/^\/production\/field-execution\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '现场任务执行', href: '/production/field-execution' }, { label: `任务 ${id}` }]
  }
  if (/^\/outsourcing\/tasks\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '委外任务单', href: '/outsourcing/tasks' }, { label: `委外单 ${id}` }]
  }
  if (/^\/molds\/esop\/[^/]+$/.test(pathname)) {
    return [{ label: 'TMS' }, { label: 'ESOP', href: '/molds/esop' }, { label: '编辑' }]
  }
  if (/^\/molds\/process-routes\/[^/]+\/edit$/.test(pathname)) {
    return [{ label: 'TMS' }, { label: '工艺路线', href: '/molds/process-routes' }, { label: '编辑' }]
  }
  if (/^\/molds\/[^/]+\/edit$/.test(pathname)) {
    const id = pathname.split('/')[2]
    return [{ label: 'TMS' }, { label: '模具档案', href: '/molds' }, { label: `模具 ${id}`, href: `/molds/${id}` }, { label: '编辑' }]
  }
  if (/^\/molds\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[2]
    return [{ label: 'TMS' }, { label: '模具档案', href: '/molds' }, { label: `模具 ${id}` }]
  }
  if (/^\/maintenance\/repair-board\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '维修工单看板', href: '/maintenance/repair-board' }, { label: `工单 ${id}` }]
  }
  if (/^\/maintenance\/tasks\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '保养项标准库', href: '/maintenance/tasks' }, { label: '查看' }]
  }
  if (/^\/maintenance\/task-groups\/[^/]+$/.test(pathname)) {
    return [{ label: 'TMS' }, { label: '保养项组', href: '/maintenance/task-groups' }, { label: '查看' }]
  }
  if (/^\/maintenance\/repair-reasons\/[^/]+\/edit$/.test(pathname)) {
    return [{ label: 'TMS' }, { label: '维修原因', href: '/maintenance/repair-reasons' }, { label: '编辑' }]
  }
  if (/^\/storage\/warehouse\/[^/]+$/.test(pathname)) {
    return [{ label: 'TMS' }, { label: '仓库', href: '/storage/warehouse' }, { label: '编辑' }]
  }
  if (/^\/tasks\/my-tasks\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '我的任务', href: '/tasks/my-tasks' }, { label: `任务 ${id}` }]
  }
  if (/^\/tasks\/work-orders\/[^/]+\/edit$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '工单管理', href: '/tasks/work-orders' }, { label: `工单 ${id}`, href: `/tasks/work-orders/${id}` }, { label: '编辑' }]
  }
  if (/^\/tasks\/work-orders\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '工单管理', href: '/tasks/work-orders' }, { label: `工单 ${id}` }]
  }
  if (/^\/storage\/inventory\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '库存查询', href: '/storage/inventory' }, { label: `履历 ${id}` }]
  }
  if (/^\/storage\/inbound\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '入库管理', href: '/storage/inbound' }, { label: `入库单 ${id}` }]
  }
  if (/^\/storage\/outbound\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/')[3]
    return [{ label: 'TMS' }, { label: '出库管理', href: '/storage/outbound' }, { label: `出库单 ${id}` }]
  }

  return [{ label: 'TMS' }]
}

export function TopBar() {
  const pathname = usePathname()
  const crumbs = getBreadcrumbs(pathname)

  return (
    <header className="h-[48px] bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-1 text-sm">
        <button className="text-gray-500 hover:text-gray-700 p-1 mr-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300 mx-0.5">{'>'}</span>}
            {c.href ? (
              <Link
                href={c.href}
                className="text-gray-500 hover:text-blue-500 transition-colors"
              >
                {c.label}
              </Link>
            ) : (
              <span className={cn(
                i === crumbs.length - 1
                  ? 'text-gray-800 font-medium'
                  : 'text-gray-500'
              )}>
                {c.label}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button className="text-gray-500 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100 transition-colors">
          <ArrowLeftRight size={16} />
        </button>
        <button className="text-gray-500 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100 transition-colors">
          <Home size={16} />
        </button>
        <button className="text-gray-500 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100 transition-colors">
          <User size={16} />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-sm font-semibold select-none">
          Ad
        </div>
      </div>
    </header>
  )
}
