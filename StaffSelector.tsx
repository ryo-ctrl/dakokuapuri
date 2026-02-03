
import React from 'react';
import { Staff } from '../types';

interface StaffSelectorProps {
  staffList: Staff[];
  selectedStaffId: string;
  onSelect: (id: string) => void;
}

const StaffSelector: React.FC<StaffSelectorProps> = ({ staffList, selectedStaffId, onSelect }) => {
  return (
    <div className="relative">
      <select
        value={selectedStaffId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 px-5 text-lg font-semibold text-slate-700 appearance-none cursor-pointer transition-all"
      >
        <option value="" disabled>スタッフを選択してください</option>
        {staffList.map((staff) => (
          <option key={staff.id} value={staff.id}>
            {staff.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
        <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};

export default StaffSelector;
