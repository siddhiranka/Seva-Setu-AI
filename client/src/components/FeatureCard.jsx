import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col gap-3">
      <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100/30">
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg text-slate-800">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600 font-medium">{description}</p>
    </div>
  );
};

export default FeatureCard;
