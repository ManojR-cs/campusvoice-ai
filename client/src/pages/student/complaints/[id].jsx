import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../components/Layout/ProtectedRoute';
import Sidebar from '../../../components/AppShell/Sidebar';
import StatusBadge from '../../../components/UI/StatusBadge';
import StatusTimeline from '../../../components/Complaints/StatusTimeline';
import StarRating from '../../../components/UI/StarRating';
import AIAutoCategoryBadge from '../../../components/Complaints/AIAutoCategoryBadge';
import { useAuthStore } from '../../../store/authStore';
import { useComplaintStore } from '../../../store/complaintStore';
import { getSocket } from '../../../services/socket';
import api from '../../../services/api';
import { MapPin, User, Send, Star, CheckCircle, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function ComplaintDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const { selectedComplaint, timelineLogs, feedback, fetchComplaintById, isLoading } = useComplaintStore();

  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Status update modal / form for Staff or Admin
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Student Rating State
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComplaintById(id);

      // Connect Socket.IO for live ticket updates
      const socket = getSocket();
      if (socket) {
        socket.emit('join_complaint', id);
        socket.on('complaint_updated', (data) => {
          fetchComplaintById(id);
        });
      }

      return () => {
        if (socket) {
          socket.emit('leave_complaint', id);
          socket.off('complaint_updated');
        }
      };
    }
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsPostingComment(true);
    try {
      const res = await api.post(`/complaints/${id}/comments`, { comment: commentText });
      if (res.data.success) {
        setCommentText('');
        fetchComplaintById(id);
      }
    } catch (err) {
      console.error('Post comment error:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.put(`/complaints/${id}/status`, {
        status: newStatus,
        comment: statusComment,
        resolutionSummary: newStatus === 'Resolved' ? resolutionSummary : undefined,
      });
      if (res.data.success) {
        setNewStatus('');
        setStatusComment('');
        setResolutionSummary('');
        fetchComplaintById(id);
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setIsSubmittingRating(true);
    try {
      const res = await api.post(`/complaints/${id}/feedback`, { rating, reviewComment });
      if (res.data.success) {
        fetchComplaintById(id);
      }
    } catch (err) {
      console.error('Submit feedback error:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading || !selectedComplaint) {
    return (
      <ProtectedRoute>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8 text-center text-slate-400 text-sm">Loading ticket details...</div>
        </div>
      </ProtectedRoute>
    );
  }

  const c = selectedComplaint;

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8 max-w-5xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">{c.ticketId}</span>
                <h1 className="text-2xl font-bold text-white mt-0.5">{c.title}</h1>
              </div>
            </div>
            <StatusBadge status={c.status} />
          </div>

          {/* Visual Step Timeline */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <StatusTimeline currentStatus={c.status} timelineLogs={timelineLogs} />
          </div>

          {/* Details & Sidebar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Complaint Body */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Issue Description</h3>
                  <AIAutoCategoryBadge category={c.category} confidence={c.aiCategoryConfidence} />
                </div>
                <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{c.description}</p>

                {c.aiSummary && (
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                    <p className="font-semibold flex items-center mb-1">
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Summary Digest
                    </p>
                    <p className="text-slate-300">{c.aiSummary}</p>
                  </div>
                )}

                {/* Attachments */}
                {c.attachments && c.attachments.length > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1 text-slate-500" /> Attached Proof ({c.attachments.length})
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {c.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-700 hover:opacity-80 transition group relative"
                        >
                          <img src={att.url} alt="Attachment" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update Control Panel for Staff & Admin */}
              {(user?.role === 'admin' || user?.role === 'staff') && c.status !== 'Closed' && (
                <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-blue-950/20 space-y-4">
                  <h3 className="text-sm font-bold text-white">Update Ticket Resolution Status</h3>
                  <form onSubmit={handleStatusChange} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        required
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      >
                        <option value="">-- Choose New Status --</option>
                        <option value="Under Review">Under Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>

                      <button
                        type="submit"
                        disabled={isUpdatingStatus || !newStatus}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20"
                      >
                        {isUpdatingStatus ? 'Updating...' : 'Save Status Update'}
                      </button>
                    </div>

                    {newStatus === 'Resolved' && (
                      <textarea
                        rows={2}
                        required
                        value={resolutionSummary}
                        onChange={(e) => setResolutionSummary(e.target.value)}
                        placeholder="Provide details on how the issue was resolved..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    )}
                  </form>
                </div>
              )}

              {/* Resolution Details Banner */}
              {c.status === 'Resolved' && c.resolutionDetails?.summary && (
                <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>Official Department Resolution Proof</span>
                  </div>
                  <p className="text-xs text-slate-300">{c.resolutionDetails.summary}</p>
                </div>
              )}

              {/* Feedback Rating Module for Student */}
              {user?.role === 'student' && (c.status === 'Resolved' || c.status === 'Closed') && (
                <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-950/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Student Resolution Feedback</h3>
                    <StarRating rating={feedback ? feedback.rating : rating} onRate={setRating} readOnly={!!feedback} />
                  </div>

                  {feedback ? (
                    <p className="text-xs text-slate-300 italic">"{feedback.reviewComment}"</p>
                  ) : (
                    <form onSubmit={handleSubmitFeedback} className="space-y-3">
                      <textarea
                        rows={2}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share feedback on resolution speed and quality..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingRating}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                      >
                        {isSubmittingRating ? 'Submitting...' : 'Submit Rating & Close Ticket'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Activity Timeline Logs & Comments */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Activity Timeline & Clarification Feed</h3>

                <div className="space-y-3">
                  {timelineLogs.map((log) => (
                    <div key={log._id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-white">{log.actionBy?.name || 'System Auto'}</span>
                        <span className="text-[10px]">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300">{log.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <form onSubmit={handlePostComment} className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Post a clarification message..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isPostingComment || !commentText.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Metadata */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-slate-800 pb-2">
                  Ticket Metadata
                </h3>

                <div>
                  <span className="text-slate-400">Student:</span>
                  <p className="font-semibold text-white mt-0.5">{c.studentId?.name}</p>
                  <p className="text-slate-500">{c.studentId?.collegeId}</p>
                </div>

                <div>
                  <span className="text-slate-400">Location:</span>
                  <p className="font-semibold text-white mt-0.5 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-blue-400" />
                    {c.location?.block || 'Campus Grounds'}, {c.location?.roomNumber || c.location?.floor}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Assigned Department:</span>
                  <p className="font-semibold text-emerald-400 mt-0.5">{c.assignedDepartment?.name || 'Unassigned'}</p>
                </div>

                <div>
                  <span className="text-slate-400">Priority Level:</span>
                  <p className="font-semibold text-white mt-0.5">{c.priority}</p>
                </div>

                <div>
                  <span className="text-slate-400">Logged At:</span>
                  <p className="text-slate-300 mt-0.5">{new Date(c.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
