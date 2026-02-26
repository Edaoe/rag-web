"use client";

import { useState, useCallback, useEffect } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { useDropzone } from "react-dropzone";
import { 
  Upload, X, Loader2, FileText, Settings, 
  CheckCircle2, AlertCircle, ChevronRight, ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileStatus {
  file: File;
  status: "pending" | "uploading" | "uploaded" | "processing" | "completed" | "error";
  uploadId?: number;
  documentId?: number;
  error?: string;
}

interface PreviewChunk {
  content: string;
  metadata: Record<string, any>;
}

interface TaskStatus {
  document_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
}

interface DocumentUploadStepsProps {
  knowledgeBaseId: number;
  onComplete?: () => void;
}

export function DocumentUploadSteps({ knowledgeBaseId, onComplete }: DocumentUploadStepsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [previewData, setPreviewData] = useState<PreviewChunk[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<Record<number, TaskStatus>>({});
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
  });

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter((f) => f.file !== fileToRemove));
  };

  const handleStartUpload = async () => {
    const pendingFiles = files.filter(f => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsLoading(true);
    const formData = new FormData();
    pendingFiles.forEach(f => formData.append("files", f.file));

    try {
      const response = await api.post(
        `/api/knowledge-base/${knowledgeBaseId}/documents/upload`,
        formData
      );

      const updatedFiles = files.map(f => {
        const result = response.find((r: any) => r.file_name === f.file.name);
        if (result) {
          return {
            ...f,
            status: "uploaded" as const,
            uploadId: result.upload_id,
            documentId: result.document_id
          };
        }
        return f;
      });

      setFiles(updatedFiles);
      setCurrentStep(2);
      toast({ title: "上传成功", description: "文件已保存，请配置预览" });
    } catch (error) {
      toast({ 
        title: "上传失败", 
        description: error instanceof ApiError ? error.message : "网络错误", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePreview = async () => {
    if (!selectedDocId) {
      toast({ title: "请选择文件" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(
        `/api/knowledge-base/${knowledgeBaseId}/documents/preview`,
        {
          document_ids: [selectedDocId],
          chunk_size: chunkSize,
          chunk_overlap: chunkOverlap,
        }
      );
      const chunks = response.chunks || response[selectedDocId]?.chunks || [];
      setPreviewData(chunks);
    } catch (error) {
      toast({ title: "预览失败", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalProcess = async () => {
    const uploadedFiles = files.filter(f => f.status === "uploaded");
    if (uploadedFiles.length === 0) return;

    setIsLoading(true);
    try {
      const processPayload = uploadedFiles.map(f => ({
        upload_id: f.uploadId,
        temp_path: f.file.name,
      }));

      const startResponse = await api.post(
        `/api/knowledge-base/${knowledgeBaseId}/documents/process`,
        processPayload
      );

      const taskIds = startResponse.tasks.map((t: any) => t.task_id);
      startPolling(taskIds);
    } catch (error) {
      setIsLoading(false);
      toast({ title: "启动处理失败", variant: "destructive" });
    }
  };

  const startPolling = (taskIds: number[]) => {
    const timer = setInterval(async () => {
      try {
        const statusRes = await api.get(
          `/api/knowledge-base/${knowledgeBaseId}/documents/tasks?task_ids=${taskIds.join(",")}`
        );
        
        setTaskStatuses(statusRes);

        const allFinished = Object.values(statusRes).every(
          (t: any) => t.status === "completed" || t.status === "failed"
        );

        if (allFinished) {
          clearInterval(timer);
          setIsLoading(false);
          toast({ title: "处理完毕" });
          onComplete?.();
        }
      } catch (err) {
        clearInterval(timer);
        setIsLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-center space-x-4 mb-10">
        {[
          { id: 1, label: "上传文件", icon: Upload },
          { id: 2, label: "切片预览", icon: FileText },
          { id: 3, label: "向量化处理", icon: Settings },
        ].map((step) => (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              "flex flex-col items-center space-y-2",
              currentStep >= step.id ? "text-blue-600" : "text-gray-400"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                currentStep === step.id ? "border-blue-600 bg-blue-50 shadow-md scale-110" : 
                currentStep > step.id ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200"
              )}>
                {currentStep > step.id ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">{step.label}</span>
            </div>
            {step.id < 3 && <div className={cn("w-20 h-[2px] mx-4 mb-6", currentStep > step.id ? "bg-blue-600" : "bg-gray-200")} />}
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <Card className="p-8 border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
          <div {...getRootProps()} className="flex flex-col items-center justify-center py-10 cursor-pointer">
            <input {...getInputProps()} />
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <Upload className="w-10 h-10 text-blue-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700">点击或拖拽文件到这里</h4>
            <p className="text-sm text-gray-400 mt-2">支持 PDF, DOCX, TXT, MD</p >
          </div>

          {files.length > 0 && (
            <div className="mt-8 space-y-3">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 flex-shrink-0">
                      <FileIcon extension={f.file.name.split('.').pop()} {...defaultStyles.pdf} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 truncate max-w-[300px]">{f.file.name}</p >
                      <p className="text-xs text-gray-400">{(f.file.size / 1024).toFixed(1)} KB</p >
                    </div>
                  </div>
                  <button onClick={() => removeFile(f.file)} className="text-gray-400 hover:text-red-500 p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <Button onClick={handleStartUpload} disabled={isLoading} className="w-full h-12 mt-4 text-md bg-blue-600">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "确认上传并继续"}
              </Button>
            </div>
          )}
        </Card>
      )}

      {currentStep === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 p-6 space-y-6 self-start">
            <h4 className="font-bold text-gray-800 flex items-center gap-2"><Settings className="w-4 h-4" /> 切片设置</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>目标文件</Label>
                <Select onValueChange={(val) => setSelectedDocId(Number(val))}>
                  <SelectTrigger><SelectValue placeholder="请选择文件" /></SelectTrigger>
                  <SelectContent>
                    {files.filter(f => f.uploadId).map(f => (
                      <SelectItem key={f.uploadId} value={f.uploadId!.toString()}>{f.file.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>块大小</Label>
                <Input type="number" value={chunkSize} onChange={e => setChunkSize(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>重叠量</Label>
                <Input type="number" value={chunkOverlap} onChange={e => setChunkOverlap(Number(e.target.value))} />
              </div>
              <Button onClick={handleGeneratePreview} disabled={isLoading} variant="outline" className="w-full">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "预览切片"}
              </Button>
              <div className="pt-4 border-t">
                <Button onClick={() => setCurrentStep(3)} className="w-full bg-blue-600">下一步</Button>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-2 p-6 h-[600px] flex flex-col bg-gray-50/50">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> 预览内容</h4>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {previewData.length > 0 ? previewData.map((chunk, i) => (
                <div key={i} className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">BLOCK #{i + 1}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed italic">"{chunk.content}"</p >
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm italic">点击预览查看切片效果</p >
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {currentStep === 3 && (
        <Card className="p-10 text-center space-y-8">
          <div className="max-w-md mx-auto space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              {isLoading ? (
                <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <div className="absolute inset-0 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800">准备向量化处理</h3>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {files.filter(f => f.status === "uploaded").map((f, i) => {
              const status = taskStatuses[f.uploadId || 0]?.status;
              return (
                <div key={i} className="p-4 border rounded-xl bg-white text-left space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700 truncate w-2/3">{f.file.name}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      status === "completed" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {status || "等待处理"}
                    </span>
                  </div>
                  <Progress value={status === "completed" ? 100 : status === "processing" ? 45 : 0} className="h-1.5" />
                </div>
              );
            })}
          </div>

          {!isLoading && !Object.keys(taskStatuses).length && (
            <Button onClick={handleFinalProcess} className="w-64 h-12 bg-blue-600">
              开始处理全部文档
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}