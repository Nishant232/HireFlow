import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { resumeAPI, type VerifiedUrl, type UrlSummary } from '@/lib/api'
import UrlStatusBadge from './UrlStatusBadge'
import toast from 'react-hot-toast'

interface ParsedResume {
  text: string
  sections: { experience: string; education: string; skills: string; summary: string; raw: string }
  wordCount: number
  fileType: string
  fileName: string
}

interface Props {
  onResumeParsed: (resume: ParsedResume) => void
}

export default function ResumeUpload({ onResumeParsed }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState<ParsedResume | null>(null)
  const [urlData, setUrlData] = useState<{ urls: VerifiedUrl[]; summary: UrlSummary } | null>(null)
  const [showUrls, setShowUrls] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setParsed(null)
      setUrlData(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const { data } = await resumeAPI.upload(file)
      setParsed(data.resume)
      if (data.urlVerification) setUrlData(data.urlVerification)
      onResumeParsed(data.resume)
      toast.success(`Resume parsed! ${data.resume.wordCount} words detected.`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to parse resume')
    } finally {
      setLoading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setParsed(null)
    setUrlData(null)
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {!parsed && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">
            {isDragActive ? 'Drop your resume here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-sm text-gray-500 mt-1">PDF or DOCX · Max 5MB</p>
        </div>
      )}

      {/* File selected */}
      {file && !parsed && (
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">{file.name}</p>
              <p className="text-xs text-blue-600">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleUpload} disabled={loading}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? (
                <><div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Parsing...</>
              ) : 'Parse & Verify'}
            </button>
            <button onClick={clearFile} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Parsed result */}
      {parsed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">✅ {parsed.fileName}</p>
                <p className="text-xs text-green-700">{parsed.wordCount} words · {parsed.fileType.toUpperCase()}</p>
              </div>
            </div>
            <button onClick={clearFile} className="text-xs text-gray-500 hover:text-red-600 transition">
              Replace
            </button>
          </div>

          {/* URL Verification Summary */}
          {urlData && (
            <div>
              <button
                onClick={() => setShowUrls(!showUrls)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition
                  ${urlData.summary.broken > 0
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-green-50 border-green-200 text-green-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {urlData.summary.broken > 0
                    ? <AlertCircle className="h-4 w-4" />
                    : <CheckCircle2 className="h-4 w-4" />
                  }
                  <span>
                    {urlData.summary.total} URLs found ·
                    {urlData.summary.valid} valid ·
                    {urlData.summary.broken > 0 ? ` ${urlData.summary.broken} broken ⚠️` : ' All clear ✅'}
                  </span>
                </div>
                <span className="text-xs">{showUrls ? '▲ Hide' : '▼ Show'} details</span>
              </button>

              {showUrls && (
                <div className="mt-2 space-y-2">
                  {urlData.urls.map((u, i) => (
                    <UrlStatusBadge key={i} urlData={u} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
