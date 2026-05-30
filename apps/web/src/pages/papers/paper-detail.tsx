import { useParams } from "react-router-dom";
import { ExternalLink, Bookmark, Quote, Link2, ChevronRight, UserPlus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaperDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs font-medium text-slate-500 mb-6">
        <span className="hover:text-slate-900 cursor-pointer">Publication Trend</span>
        <ChevronRight className="w-3 h-3 mx-1" />
        <span className="text-slate-900 dark:text-white">Paper Detail</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Column */}
        <div className="flex-1 min-w-0">
          
          {/* Hero Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              Large Language Models in Higher Education: A Comprehensive Systematic Review
            </h1>
            
            {/* Metadata Strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium mb-6">
              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Open Access
              </span>
              <span className="text-slate-700 dark:text-slate-300">Nature Electronics</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">Published Oct 2023</span>
              <span className="text-slate-400">•</span>
              <a href="#" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
                DOI 10.1038/s41928-023-01000-z <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Authors List */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Dr. Elena Rodriguez" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-400 cursor-pointer hover:underline">Dr. Elena Rodriguez</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704e" alt="Michael Chang" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-400 cursor-pointer hover:underline">Michael Chang</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center text-xs font-bold text-slate-500">
                  +3
                </div>
                <span className="text-sm text-slate-500">et al.</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <Button className="bg-blue-800 hover:bg-blue-900 text-white font-bold h-10 px-5 gap-2 rounded-lg">
                  <FileText className="w-4 h-4" /> Read PDF
                </Button>
                <Button variant="outline" className="h-10 px-4 gap-2 text-slate-700 dark:text-slate-300 font-bold border-slate-300 dark:border-slate-700 rounded-lg">
                  <Bookmark className="w-4 h-4" /> Save
                </Button>
                <Button variant="outline" className="h-10 px-4 gap-2 text-slate-700 dark:text-slate-300 font-bold border-slate-300 dark:border-slate-700 rounded-lg">
                  <Quote className="w-4 h-4" /> Cite
                </Button>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                <Link2 className="w-4 h-4" /> 2,184 Citations
              </div>
            </div>
          </div>

          {/* AI Analysis Summary */}
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
                  <SparklesIcon />
                </div>
                AI Analysis Summary
              </h2>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">!</div>
                Confidence: High
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Relevance</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">0.95</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              {/* Metric 2 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Semantic Fit</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">0.88</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              {/* Metric 3 */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Methodology</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">0.93</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full" style={{ width: '93%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Abstract */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Abstract</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
              <p>
                The rapid integration of Large Language Models (LLMs), such as GPT-4 and its peers, into higher
                education environments has catalyzed a paradigm shift in both pedagogical strategies and academic
                integrity frameworks. This systematic review synthesizes findings from 142 empirical studies published
                between 2022 and 2024, examining the multifaceted impact of LLMs on student learning outcomes,
                faculty workload, and institutional policy. Our analysis reveals a bimodal distribution in adoption
                outcomes: while LLMs significantly enhance personalized tutoring capabilities and accelerate
                preliminary research phases [1], they simultaneously exacerbate vulnerabilities in traditional
                assessment mechanisms. Furthermore, we quantify the 'prompt engineering' competency gap among
                undergraduates, noting that structured interventions lead to a 40% improvement in critical evaluation
                of AI-generated content. We conclude by proposing a robust, tiered integration model that mitigates
                cognitive offloading risks while maximizing the analytical leverage these models provide.
              </p>
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0">
          {/* Lead Author Card */}
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm sticky top-24">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Lead Author</div>
            
            <div className="flex gap-4 mb-6">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Dr. Elena Rodriguez" className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dr. Elena Rodriguez</h4>
                <p className="text-xs text-slate-500 mt-1">Stanford University, Dept. of Computer Science</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">Publications</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">42</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">h-index</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">18</div>
              </div>
            </div>

            <Button variant="outline" className="w-full font-bold border-slate-300 dark:border-slate-700 text-blue-700 dark:text-blue-400">
              Follow Researcher
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
