import React, { useEffect, useState } from "react";
import { echo } from "@/lib/echo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Send, Pin, Sparkles, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Comment {
  id: number;
  message: string;
  user?: { name: string; role?: string };
  created_at: string;
  user_id: number;
  reactions?: Record<string, number> | any[];
  parent_id?: number | null;
  pinned?: boolean;
  highlighted?: boolean;
  replies?: Comment[];
}

interface TaskCommentsProps {
  taskId: number;
  isAdmin?: boolean;
  clientKey?: string;
  currentUserId: number;
}

const REACTION_OPTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "🎉", label: "Celebrate" },
];

export default function TaskComments({ taskId, isAdmin = false, clientKey, currentUserId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Comment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [hoveredComment, setHoveredComment] = useState<number | null>(null);

  const baseUrl = isAdmin
    ? `/admin/tasks/${taskId}/comments`
    : `/client/tasks/${taskId}/comments`;

const getCsrf = () => {
  const token = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  return token?.content || '';
};

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    fetch(baseUrl)
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setComments(data);
      })
      .catch((err) => console.error("Failed to load comments", err))
      .finally(() => mounted && setIsLoading(false));

    const channel = `task.${taskId}`;
    const listener = (event: any) => {
      if (event?.comment) {
        setComments((prev) => [...prev, event.comment]);
        scrollToBottom();
      }
    };

    echo.channel(channel).listen(".comment.created", listener);

    return () => {
      mounted = false;
      try { echo.leaveChannel(channel); } catch {}
    };
  }, [taskId, baseUrl]);

  const scrollToBottom = () => {
    const container = document.querySelector("#comment-list");
    if (container) container.scrollTop = container.scrollHeight;
  };

  const organizeComments = (allComments: Comment[]) => {
    const topLevel = allComments.filter(c => !c.parent_id);
    const byParent = allComments.filter(c => c.parent_id).reduce((acc, comment) => {
      if (!acc[comment.parent_id!]) acc[comment.parent_id!] = [];
      acc[comment.parent_id!].push(comment);
      return acc;
    }, {} as Record<number, Comment[]>);

    return topLevel.map(comment => ({
      ...comment,
      replies: byParent[comment.id] || []
    })).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  };

  const handleSubmit = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    const textToSend = parentId ? replyMessage : message;
    if (!textToSend.trim()) return;
console.log('clientKey:', clientKey); // Add this to debug
  console.log('isAdmin:', isAdmin); // Add this too
    const tempId = Date.now();
    const optimisticComment: Comment = {
      id: tempId,
      message: textToSend,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      user: { name: "You", role: isAdmin ? "admin" : "client" },
      reactions: {},
      parent_id: parentId || null,
    };

    setComments((prev) => [...prev, optimisticComment]);
    if (parentId) {
      setReplyMessage("");
      setReplyingTo(null);
    } else {
      setMessage("");
    }
    scrollToBottom();

    const token = getCsrf();
    if (!token) return console.error("CSRF token not found");

    try {
const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token },
        credentials: "same-origin",
        body: JSON.stringify({ 
          message: textToSend, 
          client_key_id: clientKey,
          parent_id: parentId
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const savedComment = await res.json();
      setComments((prev) => prev.map((c) => (c.id === tempId ? savedComment : c)));
    } catch (err) {
      console.error(err);
      setComments((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const handleDelete = async (id: number) => {
    const token = getCsrf();
    if (!token) return;

    const url = isAdmin ? `/admin/comments/${id}` : `/client/comments/${id}`;
    setIsDeletingId(id);

    try {
      const res = await fetch(url, { method: "DELETE", headers: { "X-CSRF-TOKEN": token, "Content-Type": "application/json" }, credentials: "same-origin" });
      if (!res.ok) throw new Error("Delete failed");
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingId(null);
    }
  };

  const startEdit = (c: Comment) => setEditing(c);

  const saveEdit = async (commentId: number, newMessage: string) => {
    const token = getCsrf();
    if (!token) return;

    try {
      const res = await fetch(isAdmin ? `/admin/comments/${commentId}` : `/client/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token },
        body: JSON.stringify({ message: newMessage }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditing(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReact = async (commentId: number, emoji: string) => {
    const token = getCsrf();
    if (!token) return;

    const url = isAdmin 
      ? `/admin/comments/${commentId}/react` 
      : `/client/comments/${commentId}/react`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token },
        body: JSON.stringify({ emoji }),
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Failed to react");

      const updatedReactions = await res.json();
      setComments(prev =>
        prev.map(c => c.id === commentId ? { ...c, reactions: updatedReactions } : c)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setShowReactionPicker(null);
    }
  };

  const togglePin = async (commentId: number) => {
    if (!isAdmin) return;
    
    const token = getCsrf();
    if (!token) return;

    try {
      const res = await fetch(`/admin/comments/${commentId}/pin`, {
        method: "POST",
        headers: { "X-CSRF-TOKEN": token },
      });
      if (!res.ok) throw new Error("Failed to pin");
      const updated = await res.json();
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHighlight = async (commentId: number) => {
    if (!isAdmin) return;
    
    const token = getCsrf();
    if (!token) return;

    try {
      const res = await fetch(`/admin/comments/${commentId}/highlight`, {
        method: "POST",
        headers: { "X-CSRF-TOKEN": token },
      });
      if (!res.ok) throw new Error("Failed to highlight");
      const updated = await res.json();
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
    } catch (err) {
      console.error(err);
    }
  };

  const getReactionsCount = (reactions: Record<string, number> | any[] | undefined): Record<string, number> => {
    if (!reactions) return {};
    
    if (Array.isArray(reactions)) {
      return reactions.reduce((acc: Record<string, number>, r: any) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
      }, {});
    }
    
    return reactions;
  };

  const renderComment = (c: Comment, isReply: boolean = false) => {
    const reactionsCount = getReactionsCount(c.reactions);
    const isPinned = c.pinned;
    const isHighlighted = c.highlighted;

    return (
      <motion.div
        key={c.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors ${
          isReply ? 'ml-12 border-l-2 border-zinc-700' : ''
        } ${isPinned ? 'bg-zinc-800/40' : ''} ${
          isHighlighted ? 'bg-gradient-to-r from-amber-900/20 to-transparent animate-pulse' : ''
        }`}
        onMouseEnter={() => setHoveredComment(c.id)}
        onMouseLeave={() => setHoveredComment(null)}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 border border-zinc-800">
              <AvatarImage src={undefined} alt={c.user?.name ?? "User"} />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-semibold">
                {c.user?.name ? c.user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold text-zinc-100">
                  {c.user?.name ?? "Unknown"}
                </span>
                
                {c.user?.role === "admin" && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-400 rounded border border-green-500/20">
                    ADMIN
                  </span>
                )}
                
                {c.user?.role === "client" && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                    CLIENT
                  </span>
                )}
                
                {c.user_id === currentUserId && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                    YOU
                  </span>
                )}

                {isPinned && (
                  <Pin className="h-3 w-3 text-amber-500" />
                )}

                {isHighlighted && (
                  <Sparkles className="h-3 w-3 text-amber-500" />
                )}
                
                <span className="text-xs text-zinc-600">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>

              <div className="text-sm text-zinc-300 leading-relaxed mb-3 prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{c.message}</ReactMarkdown>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative">
                  <button
                    onClick={() => setShowReactionPicker(showReactionPicker === c.id ? null : c.id)}
                    className="text-xs font-medium text-zinc-500 hover:text-green-400 transition-colors"
                  >
                    React
                  </button>

                  <AnimatePresence>
                    {showReactionPicker === c.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        className="absolute bottom-full left-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-1.5 flex gap-1 z-20"
                      >
                        {REACTION_OPTIONS.map((reaction) => (
                          <motion.button
                            key={reaction.emoji}
                            whileHover={{ scale: 1.2, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReact(c.id, reaction.emoji)}
                            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-zinc-700 transition-colors"
                            title={reaction.label}
                          >
                            <span className="text-lg">{reaction.emoji}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!isReply && hoveredComment === c.id && (
                  <button
                    onClick={() => setReplyingTo(c.id)}
                    className="text-xs font-medium text-zinc-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Reply
                  </button>
                )}

                {isAdmin && (
                  <>
                    <button
                      onClick={() => togglePin(c.id)}
                      className="text-xs font-medium text-zinc-500 hover:text-amber-400 transition-colors"
                    >
                      {isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={() => toggleHighlight(c.id)}
                      className="text-xs font-medium text-zinc-500 hover:text-amber-400 transition-colors"
                    >
                      {isHighlighted ? 'Unhighlight' : 'Highlight'}
                    </button>
                  </>
                )}

                {(isAdmin || c.user_id === currentUserId) && (
                  <>
                    <button
                      onClick={() => startEdit(c)}
                      className="text-xs font-medium text-zinc-500 hover:text-green-400 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={isDeletingId === c.id}
                      className="text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {isDeletingId === c.id ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}
              </div>

              {Object.keys(reactionsCount).length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {Object.entries(reactionsCount).map(([emoji, count]) => (
                    <motion.button
                      key={emoji}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReact(c.id, emoji)}
                      className="flex items-center gap-1 px-2 py-1 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-full transition-colors"
                    >
                      <span className="text-sm">{emoji}</span>
                      <span className="text-xs font-medium text-zinc-400">{count}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {replyingTo === c.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex gap-2"
                >
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 min-h-[80px] bg-zinc-800/50 border-zinc-700 focus:border-blue-500 text-zinc-100 placeholder:text-zinc-600 resize-none text-sm"
                    autoFocus
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={(e) => handleSubmit(e, c.id)}
                      disabled={!replyMessage.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Reply
                    </Button>
                    <Button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyMessage("");
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-zinc-400"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const organizedComments = organizeComments(comments);

  return (
    <Card className="w-full bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader className="border-b border-zinc-800 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-zinc-100">Discussion</CardTitle>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-zinc-400">
              {comments.length} {comments.length !== 1 ? "comments" : "comment"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-0 max-h-[500px] overflow-auto" id="comment-list">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-green-500 rounded-full animate-spin"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-sm text-zinc-400">No comments yet</p>
                <p className="text-xs text-zinc-600 mt-1">Start the conversation</p>
              </div>
            ) : (
              organizedComments.map((c) => (
                <div key={c.id}>
                  {renderComment(c)}
                  {c.replies && c.replies.length > 0 && (
                    <div>
                      {c.replies.map(reply => renderComment(reply, true))}
                    </div>
                  )}
                </div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-zinc-800 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-semibold">
                {isAdmin ? "A" : "C"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a comment... (Markdown supported)"
                  className="flex-1 min-h-[44px] max-h-32 bg-zinc-800/50 border-zinc-700 focus:border-green-500 text-zinc-100 placeholder:text-zinc-600 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!message.trim() || isSaving}
                  size="icon"
                  className="h-[44px] w-[44px] bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-zinc-600">
                  Press Enter to send, Shift + Enter for new line
                </p>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-[11px] text-zinc-500 hover:text-green-400 transition-colors"
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>

              {showPreview && message && (
                <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                  <p className="text-[10px] text-zinc-500 mb-2 uppercase font-semibold">Preview:</p>
                  <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                    <ReactMarkdown>{message}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Edit Comment</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <Textarea
                value={editing.message}
                onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                className="min-h-[120px] bg-zinc-800/50 border-zinc-700 focus:border-green-500 text-zinc-100"
              />
              <DialogFooter>
                <Button onClick={() => setEditing(null)} variant="ghost" className="text-zinc-400 hover:text-zinc-100">
                  Cancel
                </Button>
                <Button 
                  onClick={() => editing && saveEdit(editing.id, editing.message)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}