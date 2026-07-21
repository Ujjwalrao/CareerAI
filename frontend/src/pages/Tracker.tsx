import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { Application } from '../types';
import { Plus, X, Calendar, DollarSign, FileText, Briefcase, Trash2 } from 'lucide-react';

export default function Tracker() {
  const { applications, addApplication, updateApplicationStatus, deleteApplication } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  
  // New application form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Application['status']>('Applied');
  const [resumeTag, setResumeTag] = useState('Senior Frontend Developer');
  const [notes, setNotes] = useState('');

  // HTML5 Drag and Drop State Management
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Application['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      updateApplicationStatus(id, targetStatus);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;
    
    await addApplication({
      company,
      role,
      appliedDate,
      status,
      resumeTag,
      salary,
      notes
    });

    // Reset Form
    setCompany('');
    setRole('');
    setSalary('');
    setNotes('');
    setModalOpen(false);
  };

  const columns: { label: Application['status']; labelWithCount: string }[] = [
    { label: 'Applied', labelWithCount: `Applied · 0${applications.filter(a => a.status === 'Applied').length}` },
    { label: 'Interview', labelWithCount: `Interview · 0${applications.filter(a => a.status === 'Interview').length}` },
    { label: 'Offer', labelWithCount: `Offer · 0${applications.filter(a => a.status === 'Offer').length}` },
    { label: 'Rejected', labelWithCount: `Rejected · 0${applications.filter(a => a.status === 'Rejected').length}` }
  ];

  return (
    <div id="tracker-page" className="w-full bg-paper min-h-[calc(100vh-4rem)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-6 mb-10 gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Interactive Pipeline Logs</span>
            <h1 className="font-heading text-2xl sm:text-3xl text-ink font-medium tracking-tight">Active Application Tracker</h1>
            <p className="font-sans text-[14px] text-mid-grey">
              Drag-and-drop jobs across sequence stages to monitor active threads and track salary specifications.
            </p>
          </div>
          <Button 
            onClick={() => setModalOpen(true)}
            variant="dark"
            className="self-start sm:self-center shrink-0"
          >
            <Plus size={14} /> Log Application
          </Button>
        </div>

        {/* Empty State when no applications exist */}
        {applications.length === 0 ? (
          <EmptyState
            title="No applications logged yet."
            description="Add the first application to start tracking your pipeline stages, dates, and notes in our local terminal."
            actionLabel="Add Application"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          /* Kanban Board Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
            {columns.map((col) => {
              const colApps = applications.filter((app) => app.status === col.label);
              return (
                <div
                  key={col.label}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.label)}
                  className="flex flex-col min-h-[480px] bg-paper-warm/45 border border-hairline p-4 rounded-3xl"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-hairline px-1.5">
                    <span className="font-heading text-sm text-ink font-medium tracking-tight">
                      {col.labelWithCount}
                    </span>
                  </div>

                  {/* Cards stack */}
                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                    {colApps.map((app) => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        className="bg-paper border border-hairline p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-ink/20 hover:shadow-sm transition-all duration-150"
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <div className="flex flex-col">
                            <span className="font-sans text-sm font-semibold text-ink leading-snug">{app.role}</span>
                            <span className="font-sans text-xs text-mid-grey leading-tight">{app.company}</span>
                          </div>
                          <button
                            onClick={() => deleteApplication(app.id)}
                            className="text-mid-grey/40 hover:text-negative transition-colors p-0.5"
                            title="Delete Log"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Metadata Rows */}
                        <div className="flex flex-col gap-1.5 mt-3 font-sans text-[11px] text-mid-grey">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={11} />
                            <span>Applied: {app.appliedDate}</span>
                          </div>
                          {app.salary && (
                            <div className="flex items-center gap-1.5 text-ink font-medium">
                              <DollarSign size={11} className="text-signal" />
                              <span>Salary Target: {app.salary}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <FileText size={11} />
                            <span className="truncate">{app.resumeTag}</span>
                          </div>
                        </div>

                        {/* Notes snippet */}
                        {app.notes && (
                          <div className="mt-2.5 pt-2 border-t border-hairline font-sans text-[11px] text-mid-grey leading-snug italic">
                            "{app.notes}"
                          </div>
                        )}
                      </div>
                    ))}

                    {colApps.length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-hairline/60 rounded-xl p-8 text-center text-xs font-sans text-mid-grey/50">
                        Drag items here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Overlay for Adding New Applications */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-paper border border-hairline rounded-3xl w-full max-w-md p-6 animate-fade-in">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-hairline pb-3 mb-5">
                <span className="font-heading text-base font-semibold text-ink">Add Position Log</span>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-1 border border-hairline hover:bg-paper-warm rounded-full cursor-pointer text-mid-grey hover:text-ink"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] font-medium text-ink">Organization</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OpenAI"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full border border-hairline rounded-xl px-3 py-2 text-xs focus:border-ink focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] font-medium text-ink">Target Position</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UI Lead"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full border border-hairline rounded-xl px-3 py-2 text-xs focus:border-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] font-medium text-ink">Salary Baseline</label>
                    <input
                      type="text"
                      placeholder="e.g. $160,000"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="w-full border border-hairline rounded-xl px-3 py-2 text-xs focus:border-ink focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] font-medium text-ink">Applied Date</label>
                    <input
                      type="date"
                      required
                      value={appliedDate}
                      onChange={(e) => setAppliedDate(e.target.value)}
                      className="w-full border border-hairline rounded-xl px-3 py-2 text-xs focus:border-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] font-medium text-ink">Default Stage</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Application['status'])}
                      className="w-full border border-hairline bg-paper rounded-xl px-2 py-2 text-xs focus:border-ink focus:outline-none"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] font-medium text-ink">Resume Version Used</label>
                    <select
                      value={resumeTag}
                      onChange={(e) => setResumeTag(e.target.value)}
                      className="w-full border border-hairline bg-paper rounded-xl px-2 py-2 text-xs focus:border-ink focus:outline-none"
                    >
                      <option value="Senior Frontend Developer">Senior Frontend Developer</option>
                      <option value="AI/ML Solutions Architect">AI/ML Architect</option>
                      <option value="Technical Product Manager">Product Manager</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-medium text-ink">Session Log Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide comments, next round targets, or referral records..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-hairline rounded-xl px-3 py-2 text-xs focus:border-ink focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <Button
                  type="submit"
                  variant="dark"
                  className="py-3 mt-2"
                >
                  Lock In & Archive Log
                </Button>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
