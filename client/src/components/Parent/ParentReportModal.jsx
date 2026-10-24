import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  X,
  Printer,
  Share2,
  Download,
  Building2,
  Award,
  Sparkles,
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  MessageCircle
} from 'lucide-react';

export default function ParentReportModal({ studentId, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReport() {
      if (!studentId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.reports.getStudentReport(studentId);
        if (res.success && res.report) {
          setReport(res.report);
        } else {
          setError(res.error || 'Failed to generate report card');
        }
      } catch (err) {
        setError(err.message || 'Error generating report');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [studentId]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!studentId) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!report) return;
    const student = report.student;
    const metrics = report.metrics;
    const reportUrl = `${window.location.origin}/reports/${student.id}`;
    const text = `📊 *StudySync Academic Diagnostic Report Card*\n\n` +
      `👤 *Student:* ${student.name} (${student.gradeClass} - ${student.section})\n` +
      `🏫 *Institute:* ${report.institute?.name || 'StudySync Academy'}\n` +
      `🎯 *Overall Academic Score:* ${metrics.overallPercentage}% (CGPA: ${metrics.cbseCGPA}/10)\n` +
      `📅 *Attendance:* ${metrics.attendanceRate} | *Study Streak:* ${metrics.learningStreakDays} days\n` +
      `📝 *Homework Mastery:* ${metrics.avgAssignmentScore}% | *Exam Arena:* ${metrics.avgQuizScore}%\n\n` +
      `💡 *Teacher Remarks:* "${report.pedagogicalInsights?.teacherRemarks}"\n\n` +
      `🔗 *View Live Verified Report Card:* ${reportUrl}\n\n` +
      `Generated securely via StudySync AI Interactive Classroom.`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    if (!report) return;
    const student = report.student;
    const metrics = report.metrics;
    const reportUrl = `${window.location.origin}/reports/${student.id}`;
    const subject = `Academic Progress Diagnostic Report - ${student.name}`;
    const body = `Dear Parent/Guardian,\n\nPlease find the diagnostic academic progress report for ${student.name}:\n\n` +
      `Grade & Section: ${student.gradeClass} - ${student.section}\n` +
      `Cumulative Score: ${metrics.overallPercentage}% (CBSE CGPA: ${metrics.cbseCGPA})\n` +
      `Attendance: ${metrics.attendanceRate}\n` +
      `Learning Streak: ${metrics.learningStreakDays} days\n\n` +
      `Teacher Remarks: ${report.pedagogicalInsights?.teacherRemarks}\n\n` +
      `View the live, verified interactive report card here:\n${reportUrl}\n\n` +
      `Best regards,\n${report.institute?.name || 'StudySync Educational Team'}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0 cursor-pointer"
    >
      
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-4 sm:p-8 my-6 text-gray-900 dark:text-gray-100 print:border-none print:shadow-none print:p-0 print:my-0 print:max-w-none print:w-full print:text-black cursor-default"
      >
        
        {/* Toolbar - Screen Only */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-gray-200 dark:border-white/10 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                Student Diagnostic & Parent Report Card
              </h3>
              <p className="text-[11px] text-gray-500">Official certified academic transcript with pedagogical diagnostics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Share via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handleEmailShare}
              className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Share via Email"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Email</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-900 shadow-xs"
              title="Exit Report Card (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <RotateCcw className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-400">Compiling multi-dimensional academic diagnostics...</p>
          </div>
        )}

        {error && (
          <div className="py-12 text-center space-y-3">
            <p className="text-rose-500 font-bold text-sm">{error}</p>
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-200 text-xs font-bold">
              Close
            </button>
          </div>
        )}

        {/* PRINTABLE REPORT CARD CONTENT */}
        {!loading && !error && report && (
          <div className="space-y-6 pt-4 print:space-y-4 print:pt-0">
            
            {/* Institute White-Label Header */}
            <div className="flex items-center justify-between border-b-2 border-gray-900 dark:border-white/20 pb-4 print:border-black">
              <div className="flex items-center gap-3">
                {report.institute?.logoUrl ? (
                  <img
                    src={report.institute.logoUrl}
                    alt={report.institute.name}
                    className="w-12 h-12 rounded-xl object-contain"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: report.institute?.brandColor || '#4F46E5' }}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white print:text-black">
                    {report.institute?.name || 'StudySync Academy of Excellence'}
                  </h1>
                  <p className="text-xs text-gray-500 font-medium print:text-gray-700">
                    {report.institute?.tagline || 'Empowering Minds Through Intelligent Pedagogy'}
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-gray-500 print:text-black">
                <p className="font-bold text-brand-600 dark:text-brand-400 print:text-black">OFFICIAL TRANSCRIPT</p>
                <p>Report ID: {report.reportId}</p>
                <p>Date: {new Date(report.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Student Profile & Executive Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 print:border-gray-300 print:bg-gray-50">
              <div className="sm:col-span-2 flex items-center gap-3">
                <img
                  src={report.student.avatar}
                  alt={report.student.name}
                  className="w-12 h-12 rounded-full border-2 border-brand-500 object-cover print:border-black"
                />
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-white print:text-black">
                    {report.student.name}
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold print:text-gray-700">
                    Cohort: {report.student.gradeClass} • Section {report.student.section}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Level {report.student.level} Scholar • {report.student.xp} Academic XP
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-white/10 pt-2 sm:pt-0 sm:pl-3">
                <span className="text-[10px] uppercase font-bold text-gray-400">Cumulative Mastery</span>
                <div className="text-2xl font-black text-brand-600 dark:text-brand-400 print:text-black">
                  {report.metrics.overallPercentage}%
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  CBSE CGPA: {report.metrics.cbseCGPA} / 10.0
                </span>
              </div>

              <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-white/10 pt-2 sm:pt-0 sm:pl-3">
                <span className="text-[10px] uppercase font-bold text-gray-400">Engagement</span>
                <div className="text-2xl font-black text-amber-500">
                  {report.metrics.attendanceRate}
                </div>
                <span className="text-[10px] font-bold text-gray-500">
                  🔥 {report.metrics.learningStreakDays} Day Active Streak
                </span>
              </div>
            </div>

            {/* Subject Mastery Matrix */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5 print:text-black">
                <BookOpen className="w-4 h-4 text-brand-500" />
                <span>Curricular Subject Mastery Breakdown</span>
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10 print:border-gray-400">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 print:bg-gray-100 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px]">
                      <th className="p-3">Subject Discipline</th>
                      <th className="p-3 text-center">Assessments</th>
                      <th className="p-3">Mastery Level</th>
                      <th className="p-3 text-right">Status Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 print:divide-gray-300">
                    {report.subjectBreakdown.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                        <td className="p-3 font-bold text-gray-900 dark:text-white print:text-black">
                          {sub.subject}
                        </td>
                        <td className="p-3 text-center font-mono text-gray-500">
                          {sub.quizzesTaken}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 sm:w-32 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden print:border print:border-gray-400">
                              <div
                                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full print:bg-black"
                                style={{ width: `${sub.masteryPercentage}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-xs">{sub.masteryPercentage}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status.includes('Mastery')
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : sub.status.includes('Practice')
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                            } print:border print:border-black print:bg-transparent print:text-black`}
                          >
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Pedagogical Diagnostics & Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Strengths */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2 print:border-gray-300 print:bg-white">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider print:text-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Demonstrated Strengths</span>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 print:text-black list-disc list-inside">
                  {report.pedagogicalInsights?.strengths?.map((str, idx) => (
                    <li key={idx} className="leading-relaxed">{str}</li>
                  ))}
                </ul>
              </div>

              {/* Areas for Growth */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2 print:border-gray-300 print:bg-white">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider print:text-black">
                  <TrendingUp className="w-4 h-4" />
                  <span>Curricular Growth Targets</span>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 print:text-black list-disc list-inside">
                  {report.pedagogicalInsights?.areasForImprovement?.map((area, idx) => (
                    <li key={idx} className="leading-relaxed">{area}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instructor Endorsement & Remarks */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-2 print:border-gray-300 print:bg-white">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Pedagogical Mentor Remarks & Honors Recommendation
              </span>
              <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200 italic print:text-black">
                "{report.pedagogicalInsights?.teacherRemarks}"
              </p>
              <p className="text-[11px] font-bold text-brand-600 dark:text-brand-400 print:text-black">
                Recommendation: {report.pedagogicalInsights?.recommendation}
              </p>
            </div>

            {/* Official Watermark & Signatures Footer */}
            <div className="border-t border-gray-200 dark:border-white/10 pt-6 flex flex-wrap items-end justify-between gap-4 text-xs text-gray-400 print:border-black print:text-black">
              <div className="space-y-1">
                <p className="font-bold text-gray-800 dark:text-gray-200 print:text-black">
                  {report.institute?.name || 'StudySync AI Classroom'}
                </p>
                <p className="text-[10px]">Digitally signed and verified via StudySync Academic Engine.</p>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="w-28 border-b border-gray-400 dark:border-gray-600 mb-1 print:border-black" />
                  <span className="text-[10px] font-bold">Class Coordinator</span>
                </div>
                <div className="text-center">
                  <div className="w-28 border-b border-gray-400 dark:border-gray-600 mb-1 print:border-black" />
                  <span className="text-[10px] font-bold">Head of Academics</span>
                </div>
              </div>
            </div>

            {/* Screen-Only Exit / Close Bottom Action Bar */}
            <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <span className="text-xs text-gray-400 font-medium">Finished reviewing official diagnostic transcript?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>Exit / Close Report Card</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
