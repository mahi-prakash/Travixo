import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Edit3 } from "lucide-react";
import CircleLogo from "../../../pages/CircleLogo.png";

export default function ChatPanel({
  tripMeta,
  isEditingTitle,
  setIsEditingTitle,
  editingTitle,
  setEditingTitle,
  handleNewChat,
  messages,
  activeTripId,
  sendMessage,
  isSending,
  messagesEndRef,
  handleSend,
  input,
  setInput
}) {
  return (
    <section className="relative z-20 h-fit lg:h-full">
      <div className="h-[500px] lg:h-[570px] rounded-[32px] bg-white shadow-2xl border border-slate-100 flex flex-col overflow-visible relative">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between relative z-30">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-sky-600 text-white flex items-center justify-center">
              <img src={CircleLogo} alt="Logo" />
            </div>
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={async () => {
                      setIsEditingTitle(false);
                      if (editingTitle && editingTitle !== tripMeta?.title) {
                        tripMeta.title = editingTitle;
                      }
                    }}
                    className="bg-slate-50 border-b-2 border-sky-600 outline-none font-semibold px-1"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <div className="font-semibold cursor-pointer hover:text-sky-600" onClick={() => {
                    setEditingTitle(tripMeta?.title || "My Trip");
                    setIsEditingTitle(true);
                  }}>
                    {"The Travstory"}
                  </div>
                  <Edit3 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                </div>
              )}
              <div className="text-[12px] text-slate-500 font-semibold">
                Knows vibes, not visas
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Current Trip Display */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 text-slate-800 text-sm font-semibold shadow-sm shadow-slate-100">
              <span className="text-slate-400 font-medium mr-1">
                Planning:
              </span>
              <span className="truncate max-w-[80px] sm:max-w-[120px]">
                {tripMeta?.title || tripMeta?.name || "New Trip"}
              </span>
            </div>

            {/* New trip button */}
            <button
              onClick={handleNewChat}
              className="text-xs sm:text-sm font-semibold border border-sky-600 text-white bg-sky-600 hover:bg-sky-700 px-3 sm:px-4 py-1.5 rounded-full transition shadow-md shadow-sky-100 whitespace-nowrap"
            >
              + New Trip
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-8 py-4 overflow-y-auto space-y-4 no-scrollbar">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-slate-400 text-sm text-center">
                {activeTripId
                  ? "No messages yet. Say hi! 👋"
                  : "Create or select a new trip to start chatting."}
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[24px] px-6 py-4 text-[14px] leading-relaxed shadow-sm ${m.from === "user"
                  ? "bg-sky-600 text-white rounded-br-none"
                  : "bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-xl shadow-slate-200/50"
                  }`}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                </div>

                {m.options && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {m.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(opt, activeTripId)}
                        className="px-3 py-1.5 bg-white border border-sky-300 rounded-full text-xs hover:bg-sky-100"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-sky-50 border border-sky-100 rounded-2xl rounded-bl-none px-5 py-3 text-sm text-slate-500 font-medium flex items-center">
                Thinking
                <span className="flex gap-[2px] ml-1 mt-[2px]">
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-4 sm:px-10 pb-4 sm:pb-8">
          <div className="flex items-center gap-2 sm:gap-3 bg-sky-50 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-inner">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your vibe"
              disabled={!activeTripId || isSending}
              className="flex-1 min-w-0 bg-transparent outline-none text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="h-9 w-9 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
