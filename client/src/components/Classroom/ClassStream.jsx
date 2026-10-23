import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { api } from '../../services/api';
import LaTeXRenderer from '../Common/LaTeXRenderer';
import SyncBoard from '../Whiteboard/SyncBoard';
import {
  Sparkles,
  Users,
  MessageSquare,
  Share2,
  Copy,
  Check,
  Send,
  Heart,
  Smile,
  Paperclip,
  BookOpen,
  Calendar,
  MapPin,
  Bot,
  FileCheck2,
  Brain,
  PenTool
} from 'lucide-react';

export default function ClassStream({ onOpenWhiteboard, onOpenAssignments, onOpenTests, onOpenAI }) {
  const { classId: routeClassId, subtab: routeSubtab } = useParams();
  const navigate = useNavigate();
  const { currentUser, triggerXpGain } = useAuth();
  const { activeClass, activeClassData, refreshActiveClass, selectClassById, classes } = useClass();

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync route classId if present
  useEffect(() => {
    if (routeClassId && (!activeClass || activeClass.id !== routeClassId)) {
      selectClassById(routeClassId);
    }
  }, [routeClassId, activeClass]);

  const activeTab = routeSubtab || 'stream';

  const handleTabSwitch = (tab) => {
    const targetId = routeClassId || activeClass?.id;
    if (targetId) {
      navigate(`/classes/${targetId}/${tab}`);
    }
  };

  if (!activeClass) {
    return (
      <div className="p-12 text-center text-gray-400 border border-dashed border-gray-300 dark:border-dark-border rounded-3xl space-y-3">
        <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Loading classroom or none selected</h4>
        <p className="text-xs text-gray-400">Pick a classroom from the top menu or join with a room code.</p>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeClass.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setPosting(true);
    try {
      const res = await api.classes.postStream(activeClass.id, {
        authorId: currentUser?.id,
        title: postTitle.trim() || 'Classroom Discussion',
        content: postContent.trim()
      });

      if (res.success) {
        setPostTitle('');
        setPostContent('');
        triggerXpGain({
          xpGained: 25,
          reason: 'Contributed to classroom discussion stream'
        });
        refreshActiveClass();
      }
    } catch (err) {
      console.error('Failed to post announcement:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.classes.addComment(activeClass.id, postId, {
        authorId: currentUser?.id,
        content: text.trim()
      });

      if (res.success) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        triggerXpGain({
          xpGained: 15,
          reason: 'Commented on classroom thread'
        });
        refreshActiveClass();
      }
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  const handleReact = async (postId, emoji) => {
    try {
      await api.classes.react(activeClass.id, postId, emoji);
      refreshActiveClass();
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  const stream = activeClass.stream || [];
  const students = activeClassData?.students || [];

  return (
    <div className="relative space-y-6 text-xs">
      
      {/* Aurora Ambient Mesh Glows behind Classroom */}
      <div className="absolute -top-16 -left-16 w-96 h-96 bg-gradient-to-tr from-brand-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Classroom Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-dark-card to-gray-900 border border-gray-200/80 dark:border-white/10 text-white shadow-lg dark:shadow-specular p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-brand-500 text-white font-bold uppercase tracking-wider text-[10px]">
              {activeClass.subject}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-gray-200 font-semibold text-[10px]">
              {activeClass.gradeLevel}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {activeClass.title}
          </h2>

          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {activeClass.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              <span>{activeClass.schedule}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activeClass.roomLocation}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{students.length} Enrolled Students</span>
            </div>
          </div>
        </div>

        {/* Ambient Aurora Orbs inside Hero */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Room Code Quick Box in Corner */}
        <div className="mt-4 sm:mt-0 sm:absolute sm:top-6 sm:right-6 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex sm:flex-col items-center justify-between sm:justify-center gap-2">
          <div className="text-left sm:text-center">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Class Room Code</p>
            <p className="text-lg font-black font-mono tracking-widest text-brand-400">{activeClass.code}</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
          >
            {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Classroom Navigation Tabs & Quick Action Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface p-1 rounded-xl overflow-x-auto no-scrollbar flex-nowrap">
          <button
            onClick={() => handleTabSwitch('stream')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs flex-shrink-0 ${
              activeTab === 'stream'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Class Stream
          </button>
          <button
            onClick={() => handleTabSwitch('whiteboard')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs flex-shrink-0 ${
              activeTab === 'whiteboard'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> SyncBoard
          </button>
          <button
            onClick={() => handleTabSwitch('roster')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs flex-shrink-0 ${
              activeTab === 'roster'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Student Roster ({students.length})
          </button>
        </div>

        {/* Quick Classroom Tools */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap">
          <button
            onClick={() => navigate('/assignments')}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover font-semibold flex items-center gap-1.5 whitespace-nowrap text-xs flex-shrink-0"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" /> Homework
          </button>
          <button
            onClick={() => navigate('/arena')}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover font-semibold flex items-center gap-1.5 whitespace-nowrap text-xs flex-shrink-0"
          >
            <Brain className="w-3.5 h-3.5 text-purple-500" /> Exam Arena
          </button>
          <button
            onClick={onOpenAI}
            className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/60 font-bold flex items-center gap-1.5 whitespace-nowrap text-xs flex-shrink-0"
          >
            <Bot className="w-3.5 h-3.5" /> Ask AI
          </button>
        </div>
      </div>

      {activeTab === 'whiteboard' ? (
        <SyncBoard />
      ) : activeTab === 'stream' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Post Creator & Stream Feed (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Share / Post Box */}
            <form onSubmit={handleCreatePost} className="p-4 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-full object-cover border border-brand-500"
                />
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Announcement title or question topic..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs focus:ring-2 focus:ring-brand-500 dark:text-white font-medium"
                />
              </div>

              <textarea
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={`Share an announcement, ask a question, or post study materials to ${activeClass.title}...`}
                required
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs focus:ring-2 focus:ring-brand-500 dark:text-white leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-500" /> Supports LaTeX equations and code snippets
                </span>

                <button
                  type="submit"
                  disabled={posting || !postContent.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{posting ? 'Posting...' : 'Publish Post'}</span>
                </button>
              </div>
            </form>

            {/* Stream Posts Feed */}
            <div className="space-y-4">
              {stream.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-dark-border"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-gray-900 dark:text-white">{post.authorName}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            post.authorRole === 'teacher' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-dark-surface text-gray-500'
                          }`}>
                            {post.authorRole}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">{new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Post Title & Content */}
                  <div className="space-y-2">
                    {post.title && (
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{post.title}</h4>
                    )}
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      <LaTeXRenderer content={post.content} />
                    </div>
                  </div>

                  {/* Attachments if any */}
                  {post.attachments && post.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {post.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-dark-surface hover:bg-brand-50 border border-gray-200 dark:border-dark-border text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1.5"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{att.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Reactions Strip */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-dark-border">
                    {['🔥', '💡', '🚀', '❤️', '👍'].map((emoji) => {
                      const count = post.reactions?.[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReact(post.id, emoji)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                            count > 0
                              ? 'bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                              : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Comments section */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-dark-border">
                    {post.comments?.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface flex items-start gap-2.5">
                        <img
                          src={c.authorAvatar}
                          alt={c.authorName}
                          className="w-6 h-6 rounded-full object-cover mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">{c.authorName}</span>
                            <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 mt-0.5">
                            <LaTeXRenderer content={c.content} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add comment input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder="Write a comment / question..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-sm"
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Instructor Profile & Classroom Overview */}
          <div className="space-y-4">
            
            {/* Instructor Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class Instructor</span>
              <div className="flex items-center gap-3">
                <img
                  src={activeClass.teacherAvatar}
                  alt={activeClass.teacherName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{activeClass.teacherName}</h4>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{activeClass.subject} Dept</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Instructor for {activeClass.title}. Host of interactive whiteboard sessions and live problem solving.
              </p>
            </div>

            {/* AI Co-Pilot Persona Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-500/10 to-indigo-500/10 border border-brand-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand-500" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Active AI Classroom Persona</h4>
              </div>
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                {activeClass.aiTutorPersona || 'Socratic Teaching Assistant'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Trained on {activeClass.subject} curriculum. Ready to solve equations, evaluate Big-O proofs, and explain concepts 24/7.
              </p>
              <button
                onClick={onOpenAI}
                className="w-full py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
              >
                <Bot className="w-4 h-4" /> Open In-Class Assistant
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* Roster Tab */
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-500" /> Enrolled Students ({students.length})
            </h3>
            <span className="text-xs text-gray-400 font-mono">Room Code: {activeClass.code}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {students.map((student) => {
              const isMe = student.id === currentUser?.id;
              const gradeDisplay = student.gradeLevel || (student.gradeClass ? `${student.gradeClass} - Sec ${student.section}` : 'Student');

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                    isMe
                      ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500/50 ring-1 ring-brand-500/30'
                      : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border'
                  }`}
                >
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover border border-brand-500"
                  />
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{student.name}</h4>
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-500 text-white font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{gradeDisplay}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
                      <span className="text-brand-500 font-mono">{student.xp || 0} XP</span>
                      <span className="text-gray-400">• Lvl {student.level || 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
