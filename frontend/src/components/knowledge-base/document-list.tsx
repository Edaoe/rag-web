"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { FileIcon, defaultStyles } from "react-file-icon";
import { FileText, Plus, Eye, X } from "lucide-react"; 


import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { DocumentUploadSteps } from "./document-upload-steps";


interface Document {
  id: number;
  file_name: string;
  file_size: number;
  content_type: string;
  created_at: string;
  processing_tasks: Array<{ status: string }>;
}

export function DocumentList({ knowledgeBaseId }: { knowledgeBaseId: number }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null); 
  const [segments, setSegments] = useState<any[]>([]);
  const { toast } = useToast();


  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(`/api/knowledge-base/${knowledgeBaseId}`);
      setDocuments(data.documents);
    } catch (err) {
      toast({ title: "加载失败", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [knowledgeBaseId]);


  const handlePreview = async (doc: Document) => {
    setPreviewDoc(doc);
    setSegments([]); 
    try {
      const response = await api.post(`/api/knowledge-base/${knowledgeBaseId}/documents/preview`, {
        document_ids: [doc.id],
        chunk_size: 1000, 
        chunk_overlap: 200, 
      });

      setSegments(response.chunks || response || []);
    } catch (err) {
      toast({ title: "预览生成失败" });
    }
  };



  return (
    <div className="p-4 bg-white/50 backdrop-blur-md rounded-xl border shadow-sm">
      

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" /> 相关文档
        </h3>
        <Button onClick={() => setShowUpload(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" /> 添加文档
        </Button>
      </div>


      {isLoading ? (
        <div className="py-10 text-center text-gray-400">正在努力加载列表...</div>
      ) : documents.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-lg">
          <p className="text-gray-500">知识库还是空的，快去上传文件吧！</p >
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文件名</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium flex items-center gap-2">

                  <div className="w-5 h-5">
                    <FileIcon extension={doc.file_name.split('.').pop()} {...defaultStyles.pdf} />
                  </div>
                  {doc.file_name}
                </TableCell>
                <TableCell>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</TableCell>
                <TableCell>
                  <Badge variant={doc.processing_tasks[0]?.status === 'completed' ? 'secondary' : 'outline'}>
                    {doc.processing_tasks[0]?.status === 'completed' ? '已就绪' : '处理中'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handlePreview(doc)}>
                    <Eye className="w-4 h-4 mr-1" /> 预览
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}


      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>上传新文档</DialogTitle></DialogHeader>
          <DocumentUploadSteps 
            knowledgeBaseId={knowledgeBaseId} 
            onComplete={() => { setShowUpload(false); fetchDocs(); }} 
          />
        </DialogContent>
      </Dialog>


      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>文档分块预览: {previewDoc?.file_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {segments.length > 0 ? (
              segments.map((seg, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded border text-sm leading-relaxed">
                  <Badge className="mb-2">第 {i + 1} 块</Badge>
                  <p>{seg.content || "内容解析中..."}</p >
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">解析中，请稍候...</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}