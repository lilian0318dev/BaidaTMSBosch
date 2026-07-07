'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Save, X, Plus } from 'lucide-react'

const LEVEL_OPTIONS = ['一级保养', '二级保养']
const MOLD_TYPE_OPTIONS = ['通用', '指定模具']

export default function MaintenanceItemNewPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    level: '一级保养',
    moldType: '通用',
    content: '',
    tools: '',
    stdTime: 0,
    checkStandard: '',
  })

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // 保存后返回列表页
    router.push('/maintenance/tasks')
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/maintenance/tasks')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft size={14} /> 返回保养项标准库
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-semibold text-gray-800">新增保养项</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/maintenance/tasks')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              <X size={13} /> 取消
            </button>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded font-medium">
              <Save size={13} /> 保存
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6">
          <div className="max-w-5xl mx-auto space-y-5">

            <Section title="基本信息" subtitle="定义一个保养项的基础信息">
              <div className="grid grid-cols-3 gap-5">
                <Field label="项目名称" required>
                  <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="如：导柱清洁润滑" />
                </Field>

                <Field label="保养级别" required>
                  <select className={inputClass} value={form.level} onChange={(e) => update('level', e.target.value)}>
                    {LEVEL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>

                <Field label="模具类型" required>
                  <select className={inputClass} value={form.moldType} onChange={(e) => update('moldType', e.target.value)}>
                    {MOLD_TYPE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-5 pt-2">
                <Field label="标准作业时间（分钟）">
                  <input type="number" min={0} className={inputClass} value={form.stdTime || ''} onChange={(e) => update('stdTime', parseInt(e.target.value, 10) || 0)} placeholder="如：15" />
                </Field>

                <Field label="所需工具/耗材">
                  <input className={inputClass} value={form.tools || ''} onChange={(e) => update('tools', e.target.value)} placeholder="如：无纺布、专用润滑脂" />
                </Field>
              </div>
            </Section>

            <Section title="作业内容描述" subtitle="详细描述本保养项目需要执行的具体操作步骤">
              <textarea rows={5} className={inputClass} value={form.content} onChange={(e) => update('content', e.target.value)} placeholder="如：用专用润滑脂对导柱表面进行清洁后均匀涂抹..." />
            </Section>

            <Section title="检查标准 / 合格判据" subtitle="执行本保养项目后如何判定合格的标准">
              <textarea rows={4} className={inputClass} value={form.checkStandard || ''} onChange={(e) => update('checkStandard', e.target.value)} placeholder="如：导柱表面无异物，润滑脂涂抹均匀无遗漏" />
            </Section>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

/* ====== 辅助组件 ====== */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded border border-gray-200">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
        <Plus size={14} className="text-[#1e5fa8]" />
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

const inputClass = 'w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white'
