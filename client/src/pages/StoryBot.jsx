import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const DEFAULT_PROMPTS = [
  "Summarize a story in simple words",
  "Write a story about my visit",
  "How to write an engaging story?",
];

const StoryBot = () => {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [prompt]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (bottomRef.current && chatContainerRef.current) {
      // Get the chat container
      const container = chatContainerRef.current;

      // Calculate if user is near bottom before new message
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      // Only scroll if user is near bottom or it's a new message
      if (isNearBottom || messages.length === 0) {
        bottomRef.current.scrollIntoView({
          behavior: messages.length > 1 ? "smooth" : "auto",
          block: "end",
        });
      }
    }
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text, timestamp: new Date() };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/ai/chat", { prompt: text });
      const aiReply = res.data.data.reply;
      const aiMessage = {
        role: "assistant",
        content: aiReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError("Failed to get AI response");
      // Add error message to chat
      const errorMessage = {
        role: "system",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear the chat? All messages will be lost."
    );

    if (!confirmClear) return;

    setMessages([]);
    setPrompt("");
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(prompt);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      {/* Space for navbar */}
      <div className="h-16"></div>

      {/* Header - Fixed position */}
      <div className="fixed top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="/story-bot.png"
                alt="StoryBot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<span class="text-2xl">🤖</span>';
                }}
              />
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl text-gray-800">
                StoryBot
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                Your AI storytelling companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {messages.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-xs md:text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {messages.length}{" "}
                {messages.length === 1 ? "message" : "messages"}
              </div>
            )}
            <button
              onClick={clearChat}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Clear chat"
            >
              <svg
                className="w-3.5 h-3.5 md:w-4 md:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-3 sm:px-4 md:px-6 py-6">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col">
          {/* Welcome message when no messages - disappears after first prompt */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl">📚</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                Welcome to StoryBot!
              </h2>
              <p className="text-gray-600 max-w-xs sm:max-w-md text-sm sm:text-base mb-6 sm:mb-8">
                I can help you create amazing stories, summarize content, or
                provide writing tips. Try one of the prompts below or ask me
                anything!
              </p>
            </div>
          )}

          {/* Chat Messages - Scrolls under StoryBot bar */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 mb-4 sm:mb-6 scroll-smooth"
            style={{
              maxHeight: "calc(100vh - 16rem)",
              scrollBehavior: "smooth",
              paddingTop: messages.length === 0 ? "0" : "3rem",
              marginTop: messages.length === 0 ? "0" : "-3rem",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex max-w-[90%] sm:max-w-[85%]">
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 mr-2 sm:mr-3 mt-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full  flex items-center justify-center overflow-hidden">
                        <img
                          src="/story-bot.png"
                          alt="StoryBot"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<span class="text-xs sm:text-sm text-white">AI</span>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col flex-1">
                    <div
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none"
                          : msg.role === "assistant"
                          ? "bg-gray-100 text-gray-800 rounded-bl-none"
                          : "bg-yellow-50 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm sm:text-base">
                        {msg.content}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400 px-1 sm:px-2">
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.role === "user" && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center ml-1 sm:ml-2">
                          <span className="text-xs text-blue-600">You</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 ml-2 sm:ml-3 mt-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs sm:text-sm text-gray-700">
                          👤
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex">
                  <div className="flex-shrink-0 mr-2 sm:mr-3 mt-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      <img
                        src="/story-bot.png"
                        alt="StoryBot"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<span class="text-xs sm:text-sm text-white">AI</span>';
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex gap-0.5 sm:gap-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-gray-600 text-sm sm:text-base">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-0" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xs sm:text-sm">!</span>
                </div>
                <span className="text-red-700 text-sm sm:text-base">
                  {error}
                </span>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-600 hover:text-red-800 flex-shrink-0"
                aria-label="Dismiss error"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Prompt Chips - Show when no messages or empty prompt */}
          {(messages.length === 0 || prompt.length === 0) && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">
                Try asking:
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {DEFAULT_PROMPTS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(item)}
                    className="group px-3 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 hover:border-blue-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm flex items-center gap-1 sm:gap-2"
                  >
                    <span className="truncate max-w-[120px] sm:max-w-none">
                      {item}
                    </span>
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows="1"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your story request or question..."
                className="w-full resize-none border-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 py-1.5 sm:py-2 text-sm sm:text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                maxLength={2000}
              />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ${
                  prompt ? "w-full" : "w-0"
                }`}
              ></div>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg flex items-center gap-1 sm:gap-2"
              aria-label="Send message"
            >
              <span className="hidden sm:inline">Send</span>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>

          <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs">
                Enter to send • Shift+Enter for new line
              </span>
            </div>
            <span className="text-xs">{prompt.length}/2000</span>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-4 sm:mt-6 flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 sm:group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryBot;
