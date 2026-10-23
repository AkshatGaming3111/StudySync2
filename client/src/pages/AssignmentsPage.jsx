import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClass } from '../context/ClassContext';
import { api } from '../services/api';
import SubmissionModal from '../components/Homework/SubmissionModal';
import AIGradingModal from '../components/Homework/AIGradingModal';
import CreateAssignmentModal from '../components/Homework/CreateAssignmentModal';
import LaTeXRenderer from '../components/Common/LaTeXRenderer';
import {
  FileCheck2,
  PlusCircle,
  Clock,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Send,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export default function AssignmentsPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isTeacher, isStudent } = useAuth();
  const { activeClass, classes } = useClass();

  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedAsgForSubmit, setSelectedAsgForSubmit] = useState(null);
  const [selectedSubmissionForGrade, setSelectedSubmissionForGrade] = useState(null);
  const [selectedAsgForGrade, setSelectedAsgForGrade] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingSubmissionsAsg, setViewingSubmissionsAsg] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.assignments.getAll({
        studentId: isStudent ? currentUser?.id : undefined
      });
      if (res.success) {
        setAssignments(res.assignments);
      }
    } catch (e) {
      console.error('Failed to load assignments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [currentUser, activeClass]);

  const filteredAssignments = assignments.filter(asg => {
    if (filter === 'all') return true;
    if (filter === 'pending') return asg.status === 'pending';
    if (filter === 'submitted') return asg.status === 'submitted';
    if (filter === 'graded') return asg.status === 'graded';
    return true;
  });

  const handleOpenTeacherReview = async (asg) => {
    try {
      const res = await api.assignments.getById(asg.id);
      if (res.success) {
        setViewingSubmissionsAsg(res);
      }
    } catch (e) {
      console.error('Failed to fetch submissions:', e);
    }
  };

  // Open modal if assignmentId is present in route
  useEffect(() => {
    if (assignmentId && assignments.length > 0) {
      const found = assignments.find(a => a.id === assignmentId);
      if (found) {
        if (isTeacher) {
          handleOpenTeacherReview(found);
        } else {
          setSelectedAsgForSubmit(found);
        }
      }
    }
  }, [assignmentId, assignments, isTeacher]);

  return (
    <div className="relative space-y-6 text-xs">
      
      {/* Aurora Ambient Mesh Glows */}
      <div className="absolute -top-16 -left-16 w-96 h-96 bg-gradient-to-tr from-indigo-500/10 via-brand-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200/80 dark:border-white/10 shadow-sm dark:shadow-specular flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-500" /> Homework Hub & AI Auto-Grading Studio
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {isTeacher
              ? 'Review submissions with AI Rubric analysis, adjust points, and return constructive feedback'
              : 'Submit solutions with LaTeX equations, run AI Pre-checks for hints, and earn XP'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isTeacher && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Create Assignment
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface p-1 rounded-2xl w-fit">
        {[
          { id: 'all', label: 'All Assignments' },
          ...(isStudent
            ? [
                { id: 'pending', label: '⏳ Pending' },
                { id: 'submitted', label: '📬 Submitted' },
                { id: 'graded', label: '✅ Graded' }
              ]
            : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === tab.id
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((asg) => {
          const userSub = asg.userSubmission;
          const isGraded = asg.status === 'graded';
          const isSubmitted = asg.status === 'submitted';

          return (
            <div
              key={asg.id}
              className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {asg.points} Points Max ({asg.xpReward || 150} XP)
                    </span>
                    {asg.autoAIGrading && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Auto-Grading
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-base text-gray-900 dark:text-white pt-1">{asg.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Due: {new Date(asg.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed max-w-4xl">
                <LaTeXRenderer content={asg.description} />
              </div>

              {/* Rubric Preview */}
              {asg.rubric && (
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border">
                  <span className="font-bold text-gray-900 dark:text-white block mb-1.5">Evaluation Rubric:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {asg.rubric.map((r, i) => (
                      <div key={i} className="text-[11px] p-2 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-800 dark:text-gray-200">{r.criterion}</span>
                          <span className="text-brand-500 font-mono">{r.maxPoints} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student status view or Teacher action view */}
              <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex flex-wrap items-center justify-between gap-3">
                {isStudent ? (
                  <div className="flex items-center gap-3">
                    {isGraded ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <div>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            Grade: {userSub?.grade} / {asg.points} Points ({Math.round(((userSub?.grade || 0) / asg.points) * 100)}%)
                          </span>
                          {userSub?.feedback && (
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">{userSub.feedback}</p>
                          )}
                        </div>
                      </div>
                    ) : isSubmitted ? (
                      <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Submitted • Awaiting Teacher Final Review
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Pending Submission
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs">
                    <strong>{asg.submissionsCount || 0}</strong> Submissions • <strong>{asg.gradedCount || 0}</strong> Graded
                  </div>
                )}

                <div className="w-full sm:w-auto">
                  {isStudent ? (
                    <button
                      onClick={() => {
                        navigate(`/assignments/${asg.id}`);
                        setSelectedAsgForSubmit(asg);
                      }}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold shadow-md active:scale-95 transition-all text-center ${
                        isGraded
                          ? 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 text-white shadow-brand-500/20'
                      }`}
                    >
                      {isGraded ? 'Resubmit / Edit Solution' : isSubmitted ? 'Update Submission' : 'Submit Homework (+150 XP)'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        navigate(`/assignments/${asg.id}`);
                        handleOpenTeacherReview(asg);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> Review Submissions & AI Auto-Grade
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Teacher Submissions Review List Modal */}
      {viewingSubmissionsAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Submissions for: {viewingSubmissionsAsg.assignment?.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {viewingSubmissionsAsg.submissions?.length || 0} student submissions received
                </p>
              </div>
              <button onClick={() => {
                setViewingSubmissionsAsg(null);
                if (assignmentId) navigate('/assignments', { replace: true });
              }} className="text-gray-400 hover:text-gray-200 text-sm font-bold">
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              {viewingSubmissionsAsg.submissions?.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={sub.studentAvatar}
                      alt={sub.studentName}
                      className="w-10 h-10 rounded-full object-cover border border-indigo-500"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{sub.studentName}</h4>
                      <p className="text-[11px] text-gray-400">
                        Submitted: {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-dark-border">
                    {sub.grade !== null ? (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        Grade: {sub.grade} pts
                      </span>
                    ) : (
                      <span className="text-amber-500 font-semibold text-xs">
                        Suggested: {sub.aiSuggestedScore || 'Pending'} pts
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setSelectedSubmissionForGrade(sub);
                        setSelectedAsgForGrade(viewingSubmissionsAsg.assignment);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                    >
                      {sub.status === 'graded' ? 'Edit Grade' : 'Grade with AI'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Submission Modal */}
      {selectedAsgForSubmit && (
        <SubmissionModal
          assignment={selectedAsgForSubmit}
          isOpen={!!selectedAsgForSubmit}
          onClose={() => {
            setSelectedAsgForSubmit(null);
            if (assignmentId) navigate('/assignments', { replace: true });
          }}
          onSubmitted={() => {
            fetchAssignments();
            setSelectedAsgForSubmit(null);
            if (assignmentId) navigate('/assignments', { replace: true });
          }}
        />
      )}

      {/* Teacher AI Grading Modal */}
      {selectedSubmissionForGrade && (
        <AIGradingModal
          submission={selectedSubmissionForGrade}
          assignment={selectedAsgForGrade}
          isOpen={!!selectedSubmissionForGrade}
          onClose={() => setSelectedSubmissionForGrade(null)}
          onGraded={() => {
            fetchAssignments();
            setSelectedSubmissionForGrade(null);
            setViewingSubmissionsAsg(null);
          }}
        />
      )}

      {/* Teacher Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            fetchAssignments();
            setShowCreateModal(false);
          }}
        />
      )}

    </div>
  );
}
