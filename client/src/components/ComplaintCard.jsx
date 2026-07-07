import React, { useState } from 'react';
import { FiTrash2, FiClock, FiCheckCircle, FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';

const ComplaintCard = ({ complaint, onDelete, onStatusUpdate }) => {
  const [showTracker, setShowTracker] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-50 text-slate-700 border-sky-100';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved':
        return {
          badge: 'bg-green-50 text-green-700 border-green-200 shadow-sm',
          dot: 'bg-green-600'
        };
      case 'In Progress':
      case 'In Review':
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm',
          dot: 'bg-blue-600'
        };
      case 'Rejected':
        return {
          badge: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
          dot: 'bg-red-600'
        };
      default: // Pending
        return {
          badge: 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm',
          dot: 'bg-[#FF9933]'
        };
    }
  };

  const statusStyle = getStatusStyle(complaint.status);
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Compute estimated resolution date: 10 days from submission
  const estDate = new Date(complaint.createdAt);
  estDate.setDate(estDate.getDate() + 10);
  const formattedEstDate = estDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Mock progress tracker events
  const trackerEvents = [
    { title: 'Grievance Logged', desc: 'AI parsed complaint draft registered in database', done: true },
    { title: 'Officer Assigned', desc: 'Dispatched to Municipal Ward officer for inspection', done: complaint.status !== 'Pending' },
    { title: 'Site Inspection / Resolution', desc: 'Civic repair action taken on location', done: complaint.status === 'Resolved' }
  ];

  return (
    <div className="premium-card p-6 border relative overflow-hidden flex flex-col gap-4 text-left">
      {/* Accent corner glow based on status */}
      <div className={`absolute top-0 right-0 w-20 h-20 blur-3xl opacity-10 rounded-full ${
        complaint.status === 'Resolved' ? 'bg-green-500' : complaint.status === 'Pending' ? 'bg-orange-500' : 'bg-blue-500'
      }`}></div>

      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {complaint.department}
          </span>
          <h4 className="font-display font-extrabold text-lg text-slate-800 mt-1">
            {complaint.issue}
          </h4>
        </div>
        
        {/* Delete Trigger */}
        {onDelete && (
          <button
            onClick={() => onDelete(complaint._id)}
            className="p-2 rounded-xl text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
            title="Delete complaint"
          >
            <FiTrash2 className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Suggested Subject Draft */}
      {complaint.suggestedSubject && (
        <div className="text-xs font-bold text-slate-700 bg-sky-50 px-3.5 py-2.5 rounded-xl border border-sky-100">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-0.5">Subject Draft:</span>
          {complaint.suggestedSubject}
        </div>
      )}

      {/* Description text */}
      <p className="text-sm text-slate-600 leading-relaxed font-semibold">
        {complaint.description}
      </p>

      {/* Evidence preview */}
      {complaint.imageUrl && (
        <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-sky-100 mt-2 bg-sky-50 flex items-center justify-center">
          <img
            src={complaint.imageUrl}
            alt="Evidence proof"
            className="object-contain max-h-48 w-full"
            loading="lazy"
          />
        </div>
      )}

      {/* Timestamps */}
      <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 font-bold">
        <FiCalendar className="text-slate-400" />
        <span>Submitted: <strong>{formattedDate}</strong></span>
        <span className="mx-1 font-normal">•</span>
        <span>Est. Resolution: <strong className="text-primary">{formattedEstDate}</strong></span>
      </div>

      {/* Timeline tracker accordion */}
      {showTracker && (
        <div className="border-t border-sky-100/50 pt-4 mt-2 space-y-4 relative">
          <div className="absolute left-[9px] top-6 bottom-6 w-0.5 bg-sky-100"></div>
          {trackerEvents.map((event, idx) => (
            <div key={idx} className="flex gap-4 items-start relative z-10">
              <div className={`w-5 h-5 rounded-full border-4 border-white flex-shrink-0 mt-0.5 ${
                event.done ? 'bg-primary' : 'bg-sky-100'
              }`}></div>
              <div>
                <h5 className={`text-xs font-bold ${event.done ? 'text-slate-800' : 'text-slate-400'}`}>
                  {event.title}
                </h5>
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                  {event.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Control Actions & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
        <div className="flex gap-2">
          {/* Priority */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${getPriorityColor(complaint.priority)}`}>
            {complaint.priority} Priority
          </span>

          {/* Status */}
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${statusStyle.badge}`}>
            <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></span>
            {complaint.status}
          </span>
        </div>

        <div className="flex gap-2">
          {/* Track toggler */}
          <button
            onClick={() => setShowTracker(!showTracker)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-sky-100 hover:bg-sky-50 text-slate-700 transition-all cursor-pointer"
          >
            {showTracker ? 'Hide Tracking' : 'Track Grievance'}
          </button>

          {/* Advancement Simulator */}
          {onStatusUpdate && complaint.status !== 'Resolved' && (
            <button
              onClick={() => {
                const nextStatus = complaint.status === 'Pending' ? 'In Review' : 'Resolved';
                onStatusUpdate(complaint._id, nextStatus);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-primary hover:bg-emerald-700 text-white shadow shadow-primary/10 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Advance Stage</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default ComplaintCard;
