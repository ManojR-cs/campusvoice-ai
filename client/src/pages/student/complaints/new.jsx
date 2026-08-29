import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../components/Layout/ProtectedRoute';
import Sidebar from '../../../components/AppShell/Sidebar';
import AIAutoCategoryBadge from '../../../components/Complaints/AIAutoCategoryBadge';
import api from '../../../services/api';
import { FilePlus, Sparkles, Upload, MapPin, AlertCircle, ArrowLeft, Check } from 'lucide-react';

const CATEGORIES = ['Classroom', 'Laboratory', 'Hostel', 'Wi-Fi', 'Infrastructure', 'Transportation', 'Cleanliness', 'Other'];
const BLOCKS = ['Hostel Block A', 'Hostel Block B', 'Science Block A', 'Academic Building 1', 'Central Library', 'Sports Complex', 'Campus Grounds'];

export default function NewComplaint() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [priority, setPriority] = useState('Medium');
  const [location, setLocation] = useState({ block: 'Hostel Block A', floor: '1st Floor', roomNumber: '', customDetails: '' });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAiAutoCategory = async () => {
    if (!title || !description) {
      setError('Please type a title and description first for AI categorization');
      return;
    }
    setError('');
    setAiPredicting(true);
    try {
      const res = await api.post('/ai/categorize', { title, description });
      if (res.data.success) {
        setCategory(res.data.category);
        setAiConfidence(res.data.confidence);
      }
    } catch (err) {
      console.error('AI categorization error:', err);
    } finally {
      setAiPredicting(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    const urls = selected.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('location', JSON.stringify(location));

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        router.push(`/student/complaints/${res.data.complaint._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8 max-w-3xl">
          <div className="flex items-center space-x-3 mb-6">
            <button onClick={() => router.back()} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Log Campus Complaint</h1>
              <p className="text-xs text-slate-400">Fill in issue details and attach photo evidence</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            {/* Title & AI Auto Suggest */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wi-Fi router offline in Hostel Block B 3rd Floor"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Detailed Description *</label>
                <button
                  type="button"
                  onClick={handleAiAutoCategory}
                  disabled={aiPredicting}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiPredicting ? 'AI Analyzing...' : 'AI Auto-Suggest Category'}</span>
                </button>
              </div>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide specific details about the issue..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {aiConfidence && (
                  <div className="mt-2">
                    <AIAutoCategoryBadge category={category} confidence={aiConfidence} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Impact</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Low">Low - Minor cosmetic/informational</option>
                  <option value="Medium">Medium - Standard operational issue</option>
                  <option value="High">High - Impairing daily activities</option>
                  <option value="Critical">Critical - Safety or major blackout hazard</option>
                </select>
              </div>
            </div>

            {/* Campus Location Picker */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-blue-400" /> Campus Location Selector
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Block/Building</label>
                  <select
                    value={location.block}
                    onChange={(e) => setLocation({ ...location, block: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  >
                    {BLOCKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Floor Level</label>
                  <input
                    type="text"
                    value={location.floor}
                    onChange={(e) => setLocation({ ...location, floor: e.target.value })}
                    placeholder="e.g. 2nd Floor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Room / Door No.</label>
                  <input
                    type="text"
                    value={location.roomNumber}
                    onChange={(e) => setLocation({ ...location, roomNumber: e.target.value })}
                    placeholder="e.g. Lab 204 or B-302"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Photo Attachment Uploader */}
            <div className="pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Attach Photo / Document Proof (Max 5MB)</label>
              <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-center transition cursor-pointer relative bg-slate-900/30">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">Click or drag & drop photo attachments here</p>
                <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, WEBP, and PDF up to 5MB</p>
              </div>

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 disabled:opacity-50 transition flex items-center justify-center space-x-2"
            >
              <FilePlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Complaint Ticket...' : 'Submit Complaint Ticket'}</span>
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
