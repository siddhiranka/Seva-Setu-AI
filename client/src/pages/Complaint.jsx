import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import useSpeech from '../hooks/useSpeech';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';
import api from '../services/api';
import {
  FiMic,
  FiMicOff,
  FiCamera,
  FiAlertCircle,
  FiCheckCircle,
  FiTrash2,
  FiMapPin,
  FiNavigation
} from 'react-icons/fi';

const Complaint = () => {
  const { t, language } = useLanguage();
  const { fetchProfile } = useAuth();
  const { isListening, startListening, stopListening } = useSpeech();

  const [unstructuredText, setUnstructuredText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaint');
      setComplaints(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch complaints history.');
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setUnstructuredText(transcript);
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeAttachedImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!unstructuredText.trim()) return;

    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('unstructuredComplaint', unstructuredText);
      formData.append('language', language);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/complaint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg(t.complaintSuccess);
      setUnstructuredText('');
      setImageFile(null);
      setImagePreview('');
      
      await fetchComplaints();
      await fetchProfile();
    } catch (err) {
      console.error(err);
      setError('Failed to submit complaint. Verify internet connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this complaint?')) return;
    try {
      await api.delete(`/complaint/${id}`);
      setComplaints(prev => prev.filter(c => c._id !== id));
      await fetchProfile();
    } catch (err) {
      console.error(err);
      setError('Could not delete complaint.');
    }
  };

  const handleStatusUpdate = async (id, nextStatus) => {
    try {
      await api.patch(`/complaint/${id}`, { status: nextStatus });
      setComplaints(prev =>
        prev.map((c) => (c._id === id ? { ...c, status: nextStatus } : c))
      );
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16 animate-fade-in text-left">
      
      {/* Title with SVG cartoon illustration */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary-light to-white p-6 rounded-3xl border border-primary/10">
        <div className="space-y-2 text-left flex-1">
          <h2 className="font-display font-extrabold text-3xl text-slate-800">
            Grievance Redressal
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md font-semibold">
            Speak naturally or type your civic issues. AI structures the complaint, identifies the target department, and files it.
          </p>
        </div>

        {/* Citizen reporting illustration */}
        <div className="w-40 h-40 flex-shrink-0 animate-float">
          <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="45" fill="#FFF2E5" />
            {/* Person flat head */}
            <circle cx="60" cy="38" r="12" fill="#FCD5B5" />
            <path d="M40 76c0-15 10-18 20-18s20 3 20 18v12H40V76z" fill="#EAF8EC" stroke="#138808" strokeWidth="2.5"/>
            {/* Megaphone / Mic */}
            <path d="M72 44l12-8v20l-12-8H64V44h8z" fill="#FF9933" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.1))"/>
          </svg>
        </div>
      </div>

      {/* Fake Map Card */}
      <div className="premium-card p-5 border text-left space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <FiMapPin className="text-[#FF9933]" />
          <span>Grievance Area Map Overlay</span>
        </div>
        <div className="h-48 w-full rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120562.13809088514!2d72.82579007421875!3d19.218330700000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b738148eeb29%3A0xc4f135b1fec3b5a9!2sAtharva%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1689000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Grievance Map"
            className="w-full h-full"
          ></iframe>
          <div className="absolute bottom-2 left-2 bg-white/95 px-3 py-1.5 rounded-xl border border-sky-150 text-[10px] font-bold text-slate-800 shadow-md">
            {t.activeRegion || '📌 Active region: Near Atharva College Area, Malad'}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl flex items-center gap-3 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-3 text-sm">
          <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Input form */}
      <div className="premium-card p-6 border text-left">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              {t.describeGrievance || 'Describe Grievance (Speak or Type)'}
            </label>

            <div className="flex gap-4 items-start">
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={submitting}
                className={`p-5 rounded-full border transition-all cursor-pointer flex-shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-lg shadow-red-500/25 scale-105'
                    : 'bg-primary text-white border-primary hover:bg-emerald-700 shadow-md shadow-primary/10'
                }`}
                title="Record grievance"
              >
                <FiMic className={`w-6 h-6 ${isListening ? 'animate-bounce' : ''}`} />
              </button>

              <textarea
                value={unstructuredText}
                onChange={(e) => setUnstructuredText(e.target.value)}
                placeholder="E.g. The garbage truck has not visited ward 5 for the past 4 days, causing piles of refuse outside our society."
                rows={4}
                className="flex-1 p-4 bg-sky-50 border-2 border-sky-150 focus:border-accent rounded-2xl focus:outline-none text-sm transition-all resize-none font-bold"
                disabled={isListening || submitting}
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100">
            {/* Image attachment */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 border border-sky-150 hover:bg-sky-50 text-xs font-bold text-slate-655 rounded-xl cursor-pointer transition-all">
                <FiCamera className="w-4 h-4" />
                <span>{t.attachPhoto || 'Attach Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="relative w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={removeAttachedImage}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow"
                  >
                    <FiTrash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || isListening || !unstructuredText.trim()}
              className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? (t.analyzingGrievance || 'Analyzing Grievance...') : (t.fileComplaintBtn || 'Analyze & File Complaint')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Timeline list */}
      <div className="space-y-6">
        <h3 className="font-display font-extrabold text-xl text-slate-800">
          {t.complaintTracker || 'Complaint Redressal Tracker'}
        </h3>

        {complaints.length > 0 ? (
          <div className="relative pl-8 space-y-8">
            {/* Vertical timeline connector */}
            <div className="timeline-line"></div>

            {complaints.map((comp) => {
              // Status mappings
              let dotBg = 'bg-orange-500';
              if (comp.status === 'Resolved') {
                dotBg = 'bg-green-500 shadow-[0_0_8px_rgba(19,136,8,0.6)]';
              } else if (comp.status === 'In Review' || comp.status === 'In Progress') {
                dotBg = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]';
              }

              return (
                <div key={comp._id} className="relative">
                  {/* Timeline point */}
                  <div className={`absolute -left-[38px] top-6 w-3.5 h-3.5 rounded-full border-4 border-white z-10 ${dotBg}`}></div>
                  
                  <ComplaintCard
                    complaint={comp}
                    onDelete={handleDelete}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl border border-dashed border-sky-100 text-center text-sm text-slate-400 bg-sky-50/10 flex flex-col items-center justify-center gap-4">
            {/* Empty State Mascot: Waving Seva Bot */}
            <div className="w-20 h-20 relative animate-float">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="#EAF8EC" />
                <rect x="32" y="38" width="36" height="30" rx="8" fill="#FFFFFF" stroke="#138808" strokeWidth="2.5" />
                <circle cx="42" cy="50" r="2.5" fill="#1F2937" />
                <circle cx="58" cy="50" r="2.5" fill="#1F2937" />
                <path d="M46 58c0 0 2 2 4 2s4-2 4-2" stroke="#FF9933" strokeWidth="1.5" strokeLinecap="round" />
                {/* Waving hand */}
                <path d="M68 53c2-2 4 0 4 2c0 2-4 6-4 6" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <p className="font-extrabold text-slate-700 text-base">Everything looks clean!</p>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">No complaints filed yet. Speak or write above to register a report with Municipal services.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Complaint;
