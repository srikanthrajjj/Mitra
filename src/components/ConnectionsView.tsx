import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { 
  Plus, X, Edit, Key, MoreHorizontal, HelpCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ConnectionsViewProps {
  theme: Theme;
  createConnectionNonce?: number;
}

interface ConnectionData {
  id: string;
  name: string;
  description: string;
  tag: string;
  active: boolean;
  authType: string;
  url: string;
  username: string;
  updatedAt: string;
}

export default function ConnectionsView({ theme, createConnectionNonce = 0 }: ConnectionsViewProps) {
  const isDark = isDarkTheme(theme);

  // Initial connections seed matching the screenshot
  const [connections, setConnections] = useState<ConnectionData[]>([
    {
      id: 'conn-1',
      name: 'POC RAVI',
      description: 'testing PDI',
      tag: 'PDI',
      active: true,
      authType: 'Basic Authentication',
      url: 'https://dev202951.service-now.com',
      username: 'admin',
      updatedAt: '11 days ago',
    },
    {
      id: 'conn-2',
      name: 'Staging Instance',
      description: 'Pre-production staging environment for integration testing',
      tag: 'STAGE',
      active: true,
      authType: 'OAuth 2.0',
      url: 'https://staging-sn.service-now.com',
      username: 'svc_staging',
      updatedAt: '3 days ago',
    },
    {
      id: 'conn-3',
      name: 'QA Automation',
      description: 'Automated QA test runner instance',
      tag: 'QA',
      active: false,
      authType: 'Basic Authentication',
      url: 'https://qa-auto.service-now.com',
      username: 'qa_bot',
      updatedAt: '5 hours ago',
    },
    {
      id: 'conn-4',
      name: 'Production Sync',
      description: 'Live production ServiceNow sync channel',
      tag: 'PROD',
      active: true,
      authType: 'OAuth 2.0',
      url: 'https://prod.service-now.com',
      username: 'svc_prod_sync',
      updatedAt: '2 days ago',
    }
  ]);

  // Project title and title editing
  const [projectTitle, setProjectTitle] = useState('Advance Solution Demo 19');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectTitle);

  // Modal open/close state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ConnectionData | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formActive, setFormActive] = useState<string>('');
  const [formAuthType, setFormAuthType] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle closing modal via Escape key and Click Outside
  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [modalOpen]);

  // Start editing title
  const startEditingTitle = () => {
    setTitleInput(projectTitle);
    setIsEditingTitle(true);
  };

  // Handle saving inline title change
  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      setProjectTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  // Open "Create New Connection" Modal
  const handleAddClick = () => {
    setEditingConnection(null);
    setFormName('');
    setFormDesc('');
    setFormTag('');
    setFormActive('');
    setFormAuthType('');
    setFormUrl('');
    setFormUsername('');
    setFormPassword('');
    setModalOpen(true);
  };

  useEffect(() => {
    if (!createConnectionNonce) return;
    handleAddClick();
  }, [createConnectionNonce]);

  // Open "Edit Connection" Modal
  const handleEditClick = (conn: ConnectionData) => {
    setEditingConnection(conn);
    setFormName(conn.name);
    setFormDesc(conn.description);
    setFormTag(conn.tag);
    setFormActive(conn.active ? 'true' : 'false');
    setFormAuthType(conn.authType);
    setFormUrl(conn.url);
    setFormUsername(conn.username);
    setFormPassword('••••••••');
    setModalOpen(true);
  };

  // Delete/Remove Connection
  const handleDeleteClick = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  // Submit Modal Form (both create and edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const isActiveBool = formActive === 'true';
    if (editingConnection) {
      // Edit mode
      setConnections(prev => prev.map(c => c.id === editingConnection.id ? {
        ...c,
        name: formName,
        description: formDesc,
        tag: formTag,
        active: isActiveBool,
        authType: formAuthType,
        url: formUrl,
        username: formUsername,
        updatedAt: 'Just now',
      } : c));
    } else {
      // Create mode
      const newConn: ConnectionData = {
        id: `conn-${Date.now()}`,
        name: formName,
        description: formDesc,
        tag: formTag,
        active: isActiveBool,
        authType: formAuthType,
        url: formUrl,
        username: formUsername,
        updatedAt: 'Just now',
      };
      setConnections(prev => [...prev, newConn]);
    }
    setModalOpen(false);
  };

  return (
    <div className={cn(
      'flex-1 flex flex-col min-h-0 h-full overflow-hidden p-6 md:p-8',
      isDark ? 'bg-mitra-bg' : 'bg-[#fafbfa]'
    )}>
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0 overflow-y-auto">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4 pb-4 mb-6">
          <h1 className={cn(
            'text-2xl font-bold font-display tracking-tight',
            isDark ? 'text-zinc-150' : 'text-slate-900'
          )}>
            Connections
          </h1>
          <button
            type="button"
            onClick={handleAddClick}
            className="btn-cta px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Credentials</span>
          </button>
        </div>

        {/* Project Section Title */}
        <div className="flex items-center gap-2 mb-6 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              className={cn(
                'text-sm font-semibold px-2 py-0.5 border rounded outline-none w-64',
                isDark 
                  ? 'bg-zinc-800 border-white/[0.08] text-zinc-100' 
                  : 'bg-white border-slate-200 text-slate-800'
              )}
              autoFocus
            />
          ) : (
            <>
              <span className={cn('text-sm font-semibold truncate', isDark ? 'text-zinc-300' : 'text-slate-700')}>
                {projectTitle}
              </span>
              <button
                type="button"
                onClick={startEditingTitle}
                className="text-blue-500 hover:text-blue-600 cursor-pointer transition-colors p-0.5 rounded"
                title="Edit title"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="text-brand-green hover:text-brand-green-hover cursor-pointer transition-colors p-0.5 rounded"
                title="API keys"
              >
                <Key className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Connections List/Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.length === 0 ? (
            <div className={cn(
              'border rounded-2xl p-10 text-center flex flex-col items-center justify-center',
              isDark ? 'border-white/[0.06] bg-card/10' : 'border-slate-200 bg-white'
            )}>
              <HelpCircle className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">No connections found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Add your ServiceNow Developer or Production instance credential tunnels to enable live applet code sync.
              </p>
            </div>
          ) : (
            connections.map((conn) => (
              <div
                key={conn.id}
                className={cn(
                  'border rounded-xl p-6 transition-all duration-200 shadow-sm flex flex-col gap-4',
                  isDark 
                    ? 'bg-zinc-900/40 border-white/[0.06] hover:bg-zinc-900/60 hover:border-white/[0.1]' 
                    : 'bg-white border-zinc-200 hover:border-zinc-300'
                )}
              >
                {/* Top row: Tag on left, status + more menu on right */}
                <div className="flex items-center justify-between">
                  <div>
                    {conn.tag && (
                      <span className="bg-brand-green text-[#030d0a] text-[11px] font-bold px-2 py-0.5 rounded tracking-wide">
                        {conn.tag}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        conn.active ? 'bg-brand-green' : 'bg-slate-400'
                      )} />
                      <span className={cn(
                        'text-xs font-semibold',
                        conn.active ? 'text-brand-green' : 'text-slate-400'
                      )}>
                        Active
                      </span>
                    </div>

                    {/* Context menu actions button */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer transition-colors"
                          title="Options"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className={cn(
                          theme,
                          'w-36 p-1.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200',
                          isDark
                            ? 'bg-zinc-900/90 border-white/[0.08] text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                            : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.06)]',
                        )}
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditClick(conn)}
                          className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 focus:bg-brand-green/10 focus:text-brand-green transition-colors"
                        >
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(conn.id)}
                          className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-colors"
                        >
                          <span>Remove</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Details Stack */}
                <div className="space-y-1">
                  <h3 className={cn('text-sm font-bold', isDark ? 'text-zinc-150' : 'text-[#0f172a]')}>
                    {conn.name}
                  </h3>
                  <p className={cn('text-xs', isDark ? 'text-zinc-400' : 'text-zinc-500')}>
                    {conn.description}
                  </p>
                  <div className="pt-0.5">
                    <a
                      href={conn.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-green hover:underline font-mono"
                    >
                      {conn.url}
                    </a>
                  </div>
                </div>

                {/* Footer Section */}
                <div className={cn('text-[10px] pt-1 font-sans', isDark ? 'text-zinc-500' : 'text-zinc-400')}>
                  Updated {conn.updatedAt}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Creation/Edit Connection Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          
          {/* Modal Panel content */}
          <div 
            ref={modalRef}
            className={cn(
              'w-full max-w-[560px] max-h-[85vh] rounded-xl shadow-xl flex flex-col overflow-hidden border',
              isDark ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-zinc-200'
            )}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <h2 className={cn('text-base font-bold', isDark ? 'text-zinc-100' : 'text-zinc-900')}>
                {editingConnection ? 'Edit Connection' : 'Create New Connection'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="flex-1 flex flex-col min-h-0">
              
              {/* Modal Form Scrollable Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pr-3">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className={cn('block text-xs font-medium', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter connection name (e.g., ServiceNow Dev Instance)"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all',
                      isDark 
                        ? 'bg-[#09090b] border-zinc-800 focus:border-brand-green text-zinc-100' 
                        : 'bg-white border-zinc-200 focus:border-brand-green text-zinc-800'
                    )}
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-1">
                  <label className={cn('block text-xs font-medium', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                    Short Description
                  </label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Write"
                    rows={3}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all resize-none',
                      isDark 
                        ? 'bg-[#09090b] border-zinc-800 focus:border-brand-green text-zinc-100' 
                        : 'bg-white border-zinc-200 focus:border-brand-green text-zinc-800'
                    )}
                  />
                </div>

                {/* Tag */}
                <div className="space-y-1">
                  <label className={cn('block text-xs font-medium', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                    Tag
                  </label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="Ex: PROD"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all',
                      isDark 
                        ? 'bg-[#09090b] border-zinc-800 focus:border-brand-green text-zinc-100' 
                        : 'bg-white border-zinc-200 focus:border-brand-green text-zinc-800'
                    )}
                  />
                </div>

                {/* Active */}
                <div className="space-y-1">
                  <label className={cn('block text-xs font-medium', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                    Active
                  </label>
                  <select
                    value={formActive}
                    onChange={(e) => setFormActive(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all cursor-pointer',
                      isDark 
                        ? 'bg-[#09090b] border-zinc-800 focus:border-brand-green text-zinc-100' 
                        : 'bg-white border-zinc-200 focus:border-brand-green text-zinc-800'
                    )}
                  >
                    <option value="" disabled>Select status</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>

                {/* Authentication Type */}
                <div className="space-y-1">
                  <label className={cn('block text-xs font-medium', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                    Authentication Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formAuthType}
                    onChange={(e) => setFormAuthType(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all cursor-pointer',
                      isDark 
                        ? 'bg-[#09090b] border-zinc-800 focus:border-brand-green text-zinc-100' 
                        : 'bg-white border-zinc-200 focus:border-brand-green text-zinc-800'
                    )}
                  >
                    <option value="" disabled>Select authentication type</option>
                    <option value="Basic Authentication">Basic Authentication</option>
                    <option value="OAuth 2.0">OAuth 2.0</option>
                  </select>
                </div>

                {/* Instance URL */}
                <div className="space-y-1">
                  <label className={cn('block text-xs font-medium', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                    Instance URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://your-instance.service-now.com"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all',
                      isDark 
                        ? 'bg-[#09090b] border-zinc-800 focus:border-brand-green text-zinc-100 font-mono' 
                        : 'bg-white border-zinc-200 focus:border-brand-green text-zinc-800 font-mono'
                    )}
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className={cn('block text-xs font-medium', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Enter username"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all',
                      isDark 
                        ? 'bg-[#09090b] border-zinc-800 focus:border-brand-green text-zinc-100' 
                        : 'bg-white border-zinc-200 focus:border-brand-green text-zinc-800'
                    )}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className={cn('block text-xs font-medium', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter password"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg text-xs outline-none transition-all',
                      isDark 
                        ? 'bg-[#09090b] border-zinc-800 focus:border-brand-green text-zinc-100' 
                        : 'bg-white border-zinc-200 focus:border-brand-green text-zinc-800'
                    )}
                  />
                </div>

              </div>

              {/* Modal Buttons (aligned to bottom-left) */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cta px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
