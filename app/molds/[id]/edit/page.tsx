'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { ArrowLeft, Save, ChevronDown, Upload, Download, Trash2, Camera } from 'lucide-react'

const moldStages = ['设计', '试模', '量产', '封存', '报废']
const moldStatus = ['在用', '在库', '维修中', '保养中', '委外中', '报废']
const moldTypes = ['注塑模具', '冲压模具', '压铸模具', '锻造模具']
const moldCategories = ['通用件', '易损件', '标准件', '技术开发类']
const healthStatus = ['正常', '需关注', '异常']

const initialData = {
  id: '',
  moldName: 'PA66外壳模具',
  stage: '量产',
  status: '在用',
  designCycle: '500000',
  totalCycle: '482560',
  department: '一车间卡钳活塞',
  itemNo: '60004712402104',
  itemName: '7686SO三工位成形凹模',
  spec: '32327686SO',
  type: '注塑模具',
  processCount: '7300',
  manufactureDate: '2024-01-15',
  responsiblePerson: '张三',
  drawingNo: 'DWG-MJ-2024-001',
  cavityCount: '4',
  lifeWarning: '450000',
  healthStatus: '需关注',
  inFactoryDate: '2024/03/15',
  category: '易损件',
  applicableProduct: '',
  newMoldRemark: '',
  maintenanceRemark: '',
  repairRemark: '',
}

const attachments = [
  { id: '1', name: '模具图纸.pdf', size: '2.3 MB', date: '2024-03-15 09:30' },
  { id: '2', name: '零件明细表.dwg', size: '1.8 MB', date: '2024-03-15 09:35' },
  { id: '3', name: '验收报告.pdf', size: '568 KB', date: '2024-03-15 10:00' },
]

export default function MoldEditPage() {
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState({ ...initialData, id: params.id?.toString() || '' })
  const [files, setFiles] = useState(attachments)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDeleteAttachment = (id: string) => {
    setFiles(files.filter(f => f.id !== id))
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} />
              返回
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-semibold text-gray-800">编辑模具档案</h1>
            <span className="text-gray-400 text-sm">#{params.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              取消
            </button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm rounded transition-colors">
              <Save size={14} />
              保存修改
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-700">基本信息</h2>
                </div>
                <div className="p-5 space-y-4">
                  <FormField label="模具名称" required>
                    <input
                      type="text"
                      value={formData.moldName}
                      onChange={(e) => handleChange('moldName', e.target.value)}
                      className="form-input"
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="阶段">
                      <SelectField
                        placeholder="请选择阶段"
                        options={moldStages}
                        value={formData.stage}
                        onChange={(v) => handleChange('stage', v)}
                      />
                    </FormField>
                    <FormField label="适用产品">
                      <input
                        type="text"
                        value={formData.applicableProduct}
                        onChange={(e) => handleChange('applicableProduct', e.target.value)}
                        className="form-input"
                        placeholder="输入适用产品"
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="设计模次">
                      <input
                        type="number"
                        value={formData.designCycle}
                        onChange={(e) => handleChange('designCycle', e.target.value)}
                        className="form-input"
                      />
                    </FormField>
                    <FormField label="累计模次">
                      <input
                        type="number"
                        value={formData.totalCycle}
                        onChange={(e) => handleChange('totalCycle', e.target.value)}
                        className="form-input"
                      />
                    </FormField>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-center w-full h-32 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Camera size={24} />
                        <span className="text-xs">点击上传</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-700">模具备注信息</h2>
                </div>
                <div className="p-5 space-y-4">
                  <FormField label="新模备注">
                    <textarea
                      value={formData.newMoldRemark}
                      onChange={(e) => handleChange('newMoldRemark', e.target.value)}
                      className="form-input resize-none"
                      rows={3}
                      placeholder="新模交付时的备注信息"
                    />
                  </FormField>
                  <FormField label="保养备注">
                    <textarea
                      value={formData.maintenanceRemark}
                      onChange={(e) => handleChange('maintenanceRemark', e.target.value)}
                      className="form-input resize-none"
                      rows={3}
                      placeholder="保养相关的备注信息"
                    />
                  </FormField>
                  <FormField label="维修备注">
                    <textarea
                      value={formData.repairRemark}
                      onChange={(e) => handleChange('repairRemark', e.target.value)}
                      className="form-input resize-none"
                      rows={3}
                      placeholder="维修相关的备注信息"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">模工具基础信息</h2>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4">
                <FormField label="图号">
                  <input
                    type="text"
                    value={formData.drawingNo}
                    onChange={(e) => handleChange('drawingNo', e.target.value)}
                    className="form-input"
                  />
                </FormField>
                <FormField label="模腔数">
                  <input
                    type="number"
                    value={formData.cavityCount}
                    onChange={(e) => handleChange('cavityCount', e.target.value)}
                    className="form-input"
                  />
                </FormField>
                <FormField label="寿命预警值">
                  <input
                    type="number"
                    value={formData.lifeWarning}
                    onChange={(e) => handleChange('lifeWarning', e.target.value)}
                    className="form-input"
                  />
                </FormField>
                <FormField label="类型">
                  <SelectField
                    placeholder="请选择类型"
                    options={moldTypes}
                    value={formData.type}
                    onChange={(v) => handleChange('type', v)}
                  />
                </FormField>
                <FormField label="健康状态">
                  <SelectField
                    placeholder="请选择健康状态"
                    options={healthStatus}
                    value={formData.healthStatus}
                    onChange={(v) => handleChange('healthStatus', v)}
                  />
                </FormField>
                <FormField label="入厂日期">
                  <input
                    type="date"
                    value={formData.inFactoryDate.replace(/\//g, '-')}
                    onChange={(e) => handleChange('inFactoryDate', e.target.value)}
                    className="form-input"
                  />
                </FormField>
                <FormField label="编号">
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleChange('id', e.target.value)}
                    className="form-input"
                  />
                </FormField>
                <FormField label="部门">
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="form-input"
                  />
                </FormField>
                <FormField label="品号">
                  <input
                    type="text"
                    value={formData.itemNo}
                    onChange={(e) => handleChange('itemNo', e.target.value)}
                    className="form-input"
                  />
                </FormField>
                <FormField label="品名">
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => handleChange('itemName', e.target.value)}
                    className="form-input"
                  />
                </FormField>
                <FormField label="规格">
                  <input
                    type="text"
                    value={formData.spec}
                    onChange={(e) => handleChange('spec', e.target.value)}
                    className="form-input"
                  />
                </FormField>
                <FormField label="模具分类">
                  <SelectField
                    placeholder="请选择模具分类"
                    options={moldCategories}
                    value={formData.category}
                    onChange={(v) => handleChange('category', v)}
                  />
                </FormField>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">附件管理</h2>
                <button className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                  <Upload size={12} />
                  上传附件
                </button>
              </div>
              <div className="p-4 space-y-2">
                {files.map((file) => (
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
                      <button onClick={() => handleDeleteAttachment(file.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="删除">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 text-center py-4">支持 PDF、JPG、PNG、DWG 格式，单个文件不超过 20MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 13px;
          outline: none;
          background: #fafafa;
          transition: border-color 0.15s;
        }
        .form-input:focus {
          border-color: #0ea5e9;
          background: #fff;
        }
      `}</style>
    </MainLayout>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SelectField({ placeholder, options, value, onChange }: { placeholder: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="form-input flex items-center cursor-pointer"
        style={{ padding: '6px 10px' }}
      >
        <span className={`flex-1 ${value ? 'text-gray-800' : 'text-gray-400'}`}>{value || placeholder}</span>
        <ChevronDown size={13} className="text-gray-400 shrink-0" />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-lg z-20 mt-1 max-h-48 overflow-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${value === opt ? 'text-[#0ea5e9]' : 'text-gray-700'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}