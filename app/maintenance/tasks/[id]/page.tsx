'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Pencil, Eye, Save, X } from 'lucide-react'

// 模拟：保养项标准库中的一条记录（会被 URL 参数的 id 引用）
const MOCK_ITEM = {
  id: 'T001',
  name: '导柱清洁润滑',
  level: '一级保养',
  moldType: '通用',
  content: '用专用润滑脂对导柱表面进行清洁后均匀涂抹',
  tools: '无纺布、专用润滑脂',
  stdTime: 15,
  checkStandard: '导柱表面无异物，润滑脂涂抹均匀无遗漏',
}

const LEVEL_OPTIONS = ['一级保养', '二级保养']
const MOLD_TYPE_OPTIONS = ['通用', '指定模具']

export default function MaintenanceItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = typeof params.id === 'string' ? params.id : 'T001'

  // 编辑模式 vs 查看模式
  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState(MOCK_ITEM)

  const levelBadge: Record<string, string> = {
    '一级保养': 'bg-blue-100 text-blue-700',
    '二级保养': 'bg-purple-100 text-purple-700',
  }

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // 这里是保存入口；保存后回到查看模式
    setIsEdit(false)
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <LinkButton onClick={() => router.push('/maintenance/tasks')} icon={<ArrowLeft size={14} />}>返回保养项标准库</LinkButton>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-semibold text-gray-800">{isEdit ? '编辑保养项' : '保养项详情'}</h1>
            <span className="text-xs text-gray-400 font-mono">{form.id}</span>
            <span className={`px-2 py-0.5 text-xs rounded font-medium ${levelBadge[form.level]}`}>{form.level}</span>
          </div>
          <div className="flex items-center gap-2">
            {isEdit ? (
              <>
                <button onClick={() => { setIsEdit(false); setForm(MOCK_ITEM) }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                  <X size={13} /> 取消
                </button>
                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded font-medium">
                  <Save size={13} /> 保存
                </button>
              </>
            ) : (
              <button onClick={() => setIsEdit(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1e5fa8] border border-[#1e5fa8]/30 rounded hover:bg-blue-50 font-medium">
                <Pencil size={13} /> 编辑
              </button>
            )}
          </div>
        </div>

        {/* 基本信息 / 作业内容 */}
        <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* 基本信息 */}
            <Section title="基本信息" subtitle="保养项的定义信息，保养计划和工单将引用此标准">
              <div className="grid grid-cols-3 gap-5">
                <Field label="项目名称" required>
                  {isEdit
                    ? <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="如：导柱清洁润滑" />
                    : <Value text={form.name} />}
                </Field>

                <Field label="保养级别" required>
                  {isEdit
                    ? <select className={inputClass} value={form.level} onChange={(e) => update('level', e.target.value)}>
                      {LEVEL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    : <Badge text={form.level} color={levelBadge[form.level]} />}
                </Field>

                <Field label="模具类型" required>
                  {isEdit
                    ? <select className={inputClass} value={form.moldType} onChange={(e) => update('moldType', e.target.value)}>
                      {MOLD_TYPE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    : <Value text={form.moldType} />}
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-5 pt-2">
                <Field label="标准作业时间（分钟）">
                  {isEdit
                    ? <input type="number" min={0} className={inputClass} value={form.stdTime || ''} onChange={(e) => update('stdTime', parseInt(e.target.value, 10) || 0)} placeholder="如：15" />
                    : <Value text={form.stdTime ? `${form.stdTime} 分钟` : '-'} />}
                </Field>

                <Field label="所需工具/耗材">
                  {isEdit
                    ? <input className={inputClass} value={form.tools || ''} onChange={(e) => update('tools', e.target.value)} placeholder="如：无纺布、专用润滑脂" />
                    : <Value text={form.tools || '-'} />}
                </Field>

                <Field label="项目编号">
                  <Value text={form.id} mono />
                </Field>
              </div>
            </Section>

            {/* 作业内容 */}
            <Section title="作业内容描述" subtitle="详细描述本保养项目需要执行的具体操作步骤">
              {isEdit
                ? <textarea rows={4} className={inputClass} value={form.content} onChange={(e) => update('content', e.target.value)} placeholder="如：用专用润滑脂对导柱表面进行清洁后均匀涂抹" />
                : <div className="text-sm text-gray-700 leading-relaxed bg-gray-50/60 border border-gray-100 rounded p-3 whitespace-pre-wrap">{form.content}</div>}
            </Section>

            {/* 检查标准 */}
            <Section title="检查标准 / 合格判据" subtitle="执行本保养项目后如何判定合格的标准">
              {isEdit
                ? <textarea rows={3} className={inputClass} value={form.checkStandard || ''} onChange={(e) => update('checkStandard', e.target.value)} placeholder="如：导柱表面无异物，润滑脂涂抹均匀无遗漏" />
                : <div className="text-sm text-gray-700 leading-relaxed bg-blue-50/40 border border-blue-100 rounded p-3 whitespace-pre-wrap">{form.checkStandard || '—'}</div>}
            </Section>

            {/* 引用统计（仅查看模式） */}
            {!isEdit && (
              <Section title="引用情况" subtitle="当前保养项被其他业务引用的统计">
                <div className="grid grid-cols-3 gap-4">
                  <InfoCard label="被保养计划引用" value="12 次" hint="近 30 天" />
                  <InfoCard label="被保养工单引用" value="47 次" hint="历史累计" />
                  <InfoCard label="被委外保养引用" value="3 次" hint="历史累计" />
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

/* ====== 辅助组件 ====== */

function LinkButton({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
      {icon} {children}
    </button>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded border border-gray-200">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
        <Eye size={14} className="text-[#1e5fa8]" />
        <div>
          <div className="text-sm font-semibold text-gray-800">{title}</div>
          {subtitle && <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-0.5">
        {label}{required && <span className="text-red-500 text-[11px]">*</span>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Value({ text, mono }: { text: string; mono?: boolean }) {
  return <div className={`text-sm text-gray-800 font-medium ${mono ? 'font-mono' : ''}`}>{text}</div>
}

function Badge({ text, color }: { text: string; color: string }) {
  return <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${color}`}>{text}</span>
}

function InfoCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-gray-100 rounded p-4 bg-gray-50/40">
      <div className="text-[11px] text-gray-400 mb-1">{label}</div>
      <div className="text-lg font-semibold text-gray-800">{value}</div>
      {hint && <div className="text-[11px] text-gray-400 mt-1">{hint}</div>}
    </div>
  )
}

const inputClass = 'w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white'
