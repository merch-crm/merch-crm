"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronRight, FileText } from "lucide-react";
import { crmDocumentationSections } from "./content";

interface MermaidConfig {
  startOnLoad?: boolean;
  theme?: string;
  themeVariables?: Record<string, string>;
  flowchart?: {
    curve?: string;
    padding?: number;
    nodeSpacing?: number;
    rankSpacing?: number;
    useMaxWidth?: boolean;
    htmlLabels?: boolean;
  };
  state?: {
    padding?: number;
    nodeSpacing?: number;
    rankSpacing?: number;
    useMaxWidth?: boolean;
  };
  sequence?: {
    actorMargin?: number;
  };
}

interface MermaidInstance {
  initialize: (config: MermaidConfig) => void;
  init: (config?: MermaidConfig, nodes?: NodeList) => void;
}

interface MermaidWindow extends Window {
  mermaid: MermaidInstance;
}

export function DocsClient() {
  const [activeTab, setActiveTab] = useState(() => 
    crmDocumentationSections.length > 0 ? crmDocumentationSections[0].id : ""
  );
  
  const mermaidLoaded = useRef(false);

  // Load & init Mermaid once
  useEffect(() => {
    if (mermaidLoaded.current) return;
    mermaidLoaded.current = true;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => {
      const m = (window as unknown as MermaidWindow).mermaid;
      if (m && typeof m.initialize === 'function') {
        m.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#1565C0",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#0d47a1",
            lineColor: "#1565C0",
            secondaryColor: "#e3f2fd",
            background: "#ffffff",
            mainBkg: "#1565C0",
            nodeBorder: "#0d47a1",
            edgeLabelBackground: "#dbeafe",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "14px",
          },
          flowchart: { 
            curve: "linear", 
            padding: 60,
            nodeSpacing: 80,
            rankSpacing: 80,
            useMaxWidth: false,
            htmlLabels: true,
          },
          state: {
            padding: 30,
            nodeSpacing: 100,
            rankSpacing: 100,
            useMaxWidth: false,
          },
          sequence: { actorMargin: 50 },
        });
        runMermaid();
      }
    };
    document.head.appendChild(script);
  }, []);

  function runMermaid() {
    try {
      const m = (window as unknown as MermaidWindow).mermaid;
      if (m && typeof m.init === 'function') {
        document.querySelectorAll('.mermaid').forEach((el) => {
          el.removeAttribute('data-processed');
        });
        m.init(undefined, document.querySelectorAll('.mermaid'));
      }
    } catch (_e) {
      // console.error("Mermaid run error:", _e); // audit-ignore: Removed console.error as per instruction
    }
  }

  // Re-run mermaid on tab change
  useEffect(() => {
    const timer = setTimeout(() => {
      runMermaid();
    }, 200);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const currentSection = crmDocumentationSections.find(s => s.id === activeTab);

  const cssStyles = `
    .mermaid svg {
      max-width: none !important;
      height: auto !important;
      display: block;
      margin: 0 auto;
    }
    .mermaid .node rect, 
    .mermaid .node circle, 
    .mermaid .node polygon, 
    .mermaid .node path {
      stroke-width: 2px !important;
    }
    .mermaid .label {
      color: white !important;
      font-weight: 600 !important;
      font-size: 15px !important;
    }
    .mermaid .node rect,
    .mermaid .node circle,
    .mermaid .node polygon,
    .mermaid .node path,
    .mermaid .node foreignObject {
      overflow: visible !important;
    }
    .mermaid .node label,
    .mermaid .label-container {
      overflow: visible !important;
      padding: 10px !important;
    }
    .mermaid .edgeLabel,
    .mermaid .edgeLabel span,
    .mermaid .edgeLabel foreignObject,
    .mermaid .edge-text-container {
      background-color: #dbeafe !important;
      color: #1e40af !important;
      padding: 4px 10px !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      overflow: visible !important;
      white-space: nowrap !important;
    }
    .mermaid .stateLabel,
    .mermaid .stateLabel span {
      color: white !important;
      font-weight: 600 !important;
    }
    .mermaid .node.state rect {
      fill: #1565C0 !important;
      stroke: #0d47a1 !important;
    }
    /* Стили для ER-диаграмм (Entity Relationship) */
    .mermaid .er.relationshipLabelBox {
      fill: #dbeafe !important;
      stroke: #1e40af !important;
    }
    .mermaid .er.relationshipLabel {
      fill: #1e40af !important;
      font-weight: 600 !important;
      font-size: 11px !important;
    }
    .mermaid .er.entityBox {
      fill: #1565C0 !important;
      stroke: #0d47a1 !important;
    }
    .mermaid .er.entityLabel {
      fill: white !important;
      font-weight: bold !important;
    }
    .mermaid-container {
      width: 100%;
      overflow-x: auto;
      display: flex;
      justify-content: center;
      padding: 30px;
    }
    /* Улучшение читаемости таблиц в Markdown */
    .prose table {
      width: 100% !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      margin-top: 1.5rem !important;
      margin-bottom: 2rem !important;
    }
    .prose th {
      background-color: #f8fafc !important;
      color: #334155 !important;
      font-weight: 700 !important;
      letter-spacing: 0.025em !important;
      font-size: 0.75rem !important;
      padding: 0.75rem 1rem !important;
      border-bottom: 2px solid #e2e8f0 !important;
      text-align: left !important;
    }
    .prose td {
      padding: 1rem !important;
      border-bottom: 1px solid #f1f5f9 !important;
      vertical-align: top !important;
      font-size: 0.9375rem !important;
      line-height: 1.6 !important;
      color: #475569 !important;
    }
    .prose tr:last-child td {
      border-bottom: none !important;
    }
    .prose tr:hover td {
      background-color: #f1f5f933 !important;
    }
  `;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <style>{cssStyles}</style>
      
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> 
          Справочный центр CRM-системы
        </h1>
        <p className="text-sm text-slate-500 mt-1 pl-7">Архитектура, модули, инструкции и схемы взаимодействия</p>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex-shrink-0">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider">Разделы системы</h3>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {crmDocumentationSections.map((section) => {
              const isActive = activeTab === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveTab(section.id)}
                  className={
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex justify-between items-center group " +
                    (isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                  }
                >
                  <span className="leading-tight truncate pr-2" title={section.title}>
                    {section.title}
                  </span>
                  <ChevronRight className={"w-3.5 h-3.5 flex-shrink-0 transition-transform " + (isActive ? "text-blue-500" : "text-slate-300 opacity-0 group-hover:opacity-100")} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50 relative pb-24">
          {currentSection ? (
            <div className="max-w-4xl mx-auto px-10 py-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-10 flex flex-col items-start">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 mb-4">
                  Раздел документации
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{currentSection.title}</h2>
              </div>
              
              <article className="prose prose-slate max-w-none 
                [&>p]:text-base [&>p]:leading-relaxed [&>p]:mb-5 
                [&>ul]:mb-5 [&>ol]:mb-5 [&>li]:mb-1 
                [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6
                [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:border-b [&>h2]:border-slate-200 [&>h2]:pb-2 [&>h2]:mt-12 [&>h2]:mb-6 
                [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-10 [&>h3]:mb-4 
                [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:mt-8 [&>h4]:mb-3 
                prose-a:text-blue-600 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-medium prose-code:text-sm prose-code:rounded-md 
                prose-table:text-sm prose-table:mb-6 [&_th]:bg-slate-100 [&_th]:text-slate-700 [&_tr]:border-slate-200 
                prose-img:rounded-xl prose-img:border prose-img:border-slate-200 prose-img:mb-6">
                <ReactMarkdown
                  key={activeTab}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || ""); // audit-ignore: Safe regex method call
                      const lang = match ? match[1] : "";
                      
                      if (lang === "mermaid") {
                        const codeString = String(children);
                        return (
                          <div className="my-10 w-full overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
                            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                Схема взаимодействия
                              </span>
                            </div>
                            <div className="mermaid-container min-h-[400px]">
                              <div className="mermaid">
                                {codeString}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return <code className={className} {...props}>{children}</code>;
                    }
                  }}
                >
                  {currentSection.content}
                </ReactMarkdown>
              </article>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">Выберите раздел в меню слева</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
