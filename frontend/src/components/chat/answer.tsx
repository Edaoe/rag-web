"use client";

import React, { FC, useMemo, useEffect, useState } from "react";
import Markdown from "react-markdown"; 
import remarkGfm from "remark-gfm"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; 
import { Skeleton } from "@/components/ui/skeleton"; 
import { api } from "@/lib/api"; 


interface Citation {
  id: number;
  text: string;
  metadata: {
    kb_id?: number;
    document_id?: number;
    [key: string]: any;
  };
}

export const Answer: FC<{
  markdown: string;
  citations?: Citation[];
}> = ({ markdown, citations = [] }) => {

  const [citationInfos, setCitationInfos] = useState<Record<string, any>>({});


  const processedMarkdown = useMemo(() => {
    if (!markdown) return "";
    return markdown
      .replace(/<think>/g, "## 💭 深度思考\n> ")
      .replace(/<\/think>/g, "\n\n---");
  }, [markdown]);


  useEffect(() => {
    const fetchInfos = async () => {
      const newInfos: Record<string, any> = {};
      for (const c of citations) {
        const { kb_id, document_id } = c.metadata;
        if (kb_id && document_id) {
          const key = `${kb_id}-${document_id}`;
          if (!newInfos[key]) {
            try {
            
              const doc = await api.get(`/api/knowledge-base/${kb_id}/documents/${document_id}`);
              newInfos[key] = doc;
            } catch (e) {
              console.error("加载引用详情失败", e);
            }
          }
        }
      }
      setCitationInfos(newInfos);
    };

    if (citations.length > 0) fetchInfos();
  }, [citations]);


  const CustomLink = (props: any) => {
    const { href, children } = props;

    const isCitation = /^\d+$/.test(href || "");
    const citationIndex = parseInt(href || "0") - 1;
    const citation = citations[citationIndex];

    if (isCitation && citation) {
      const infoKey = `${citation.metadata.kb_id}-${citation.metadata.document_id}`;
      const docInfo = citationInfos[infoKey];

      return (
        <Popover>
          <PopoverTrigger asChild>
            <span className="cursor-pointer mx-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
              {href}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 shadow-xl border-blue-100">
            <div className="text-sm">
              <div className="font-bold text-blue-600 mb-1 flex items-center gap-1">
                📍 来源: {docInfo?.file_name || "正在查询..."}
              </div>
              <p className="text-gray-600 italic leading-relaxed">
                "...{citation.text}..."
              </p >
            </div>
          </PopoverContent>
        </Popover>
      );
    }


    return <a href= "_blank" className="text-blue-500 underline">{children}</a >;
  };


  if (!markdown) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }


  return (
    <div className="markdown-container prose prose-blue max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: CustomLink, 
        }}
      >
        {processedMarkdown}
      </Markdown>
    </div>
  );
};