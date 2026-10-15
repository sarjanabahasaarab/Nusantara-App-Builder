/**
 * Nusantara App Builder - File Explorer Component
 * Phase 4: Professional Android project tree view with context menu, CRUD, search filter, and custom icons.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Plus,
  FolderPlus,
  RefreshCw,
  MoreVertical,
  Trash2,
  Edit2,
  Copy,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';
import { FileTreeNode } from '../types';
import { useUiStore } from '../../../store/uiStore';

// Custom file icon mapper based on Android & Web extensions
function getFileIcon(fileName: string, isDirectory: boolean, isOpen: boolean) {
  if (isDirectory) {
    return isOpen ? (
      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
    ) : (
      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
    );
  }

  const lower = fileName.toLowerCase();
  if (lower.endsWith('.kt') || lower.endsWith('.kts')) {
    return <FileCode className="w-4 h-4 text-purple-400 shrink-0" />;
  }
  if (lower.endsWith('.xml')) {
    if (lower === 'androidmanifest.xml') {
      return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    return <FileCode className="w-4 h-4 text-amber-500 shrink-0" />;
  }
  if (lower.endsWith('.gradle') || lower.includes('gradle')) {
    return <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />;
  }
  if (lower.endsWith('.java')) {
    return <FileCode className="w-4 h-4 text-orange-400 shrink-0" />;
  }
  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    return <FileCode className="w-4 h-4 text-rose-400 shrink-0" />;
  }
  if (lower.endsWith('.css')) {
    return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
  }
  if (lower.endsWith('.js') || lower.endsWith('.json')) {
    return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
  }
  if (lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.jpg')) {
    return <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />;
  }
  return <FileText className="w-4 h-4 text-neutral-400 shrink-0" />;
}

export const FileExplorer: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const {
    fileTree,
    expandedFolders,
    toggleFolder,
    openFile,
    refreshFiles,
    selectedPath,
    selectPath,
    setDeleteItemCandidate,
    setRenameItemCandidate,
    setNewItemModal,
  } = useEditorStore();

  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const [filterQuery, setFilterQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    node: FileTreeNode | null;
  }>({ visible: false, x: 0, y: 0, node: null });

  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, node: null });
      }
    };
    window.addEventListener('mousedown', handleClose);
    return () => window.removeEventListener('mousedown', handleClose);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, node: FileTreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    selectPath(node.path);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    showToast(isIndo ? 'Jalur berkas disalin ke clipboard' : 'File path copied to clipboard');
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  // Recursive tree node renderer
  const renderNode = (node: FileTreeNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedPath === node.path;
    const isXmlLayout =
      node.path.startsWith('app/src/main/res/layout/') && node.path.endsWith('.xml');

    // Filter logic
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      const matches = node.name.toLowerCase().includes(q) || node.path.toLowerCase().includes(q);
      const childMatches = node.children?.some(
        (c) => c.name.toLowerCase().includes(q) || c.path.toLowerCase().includes(q)
      );
      if (!matches && !childMatches) return null;
    }

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={() => {
            selectPath(node.path);
            if (node.isDirectory) {
              toggleFolder(node.path);
            } else {
              openFile(node.path);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`flex items-center gap-1.5 py-1 pr-2 text-xs cursor-pointer group transition-colors rounded-sm ${
            isSelected
              ? 'bg-blue-600/25 text-blue-300 font-medium'
              : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
          }`}
          title={node.path}
        >
          {node.isDirectory ? (
            <span className="text-neutral-400 hover:text-white p-0.5">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
          ) : (
            <span className="w-3.5" />
          )}

          {getFileIcon(node.name, node.isDirectory, isExpanded)}

          <span className="truncate flex-1">{node.name}</span>

          {/* Quick XML Visual Designer icon on hover */}
          {isXmlLayout && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openFile(node.path);
                setActiveView('visual-designer');
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-emerald-400 hover:text-emerald-300 rounded hover:bg-neutral-700"
              title={isIndo ? 'Buka di Visual Designer' : 'Open in Visual Designer'}
            >
              <Layers className="w-3 h-3" />
            </button>
          )}
        </div>

        {node.isDirectory && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-neutral-900/60 border-r border-neutral-800 overflow-hidden">
      {/* Header with actions */}
      <div className="h-9 px-3 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          {isIndo ? 'Penjelajah File' : 'File Explorer'}
        </span>

        <div className="flex items-center gap-1">
          {/* New file */}
          <button
            onClick={() => setNewItemModal({ parentPath: selectedPath || '', isDirectory: false })}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isIndo ? 'Berkas Baru' : 'New File'}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* New folder */}
          <button
            onClick={() => setNewItemModal({ parentPath: selectedPath || '', isDirectory: true })}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isIndo ? 'Folder Baru' : 'New Folder'}
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>

          {/* Refresh tree */}
          <button
            onClick={() => refreshFiles()}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isIndo ? 'Muat Ulang Berkas' : 'Refresh Files'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick search filter */}
      <div className="p-1.5 border-b border-neutral-800/80">
        <div className="relative flex items-center">
          <Search className="w-3 h-3 absolute left-2 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={isIndo ? 'Cari file...' : 'Filter files...'}
            className="w-full bg-neutral-950/80 border border-neutral-800 rounded px-2 pl-6 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tree scroll view */}
      <div className="flex-1 overflow-y-auto py-1">
        {fileTree.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-500">
            {isIndo ? 'Tidak ada berkas proyek.' : 'No project files.'}
          </div>
        ) : (
          fileTree.map((node) => renderNode(node, 0))
        )}
      </div>

      {/* Context Menu Popup */}
      {contextMenu.visible && contextMenu.node && (
        <div
          ref={contextMenuRef}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-52 bg-neutral-900 border border-neutral-700 shadow-2xl rounded py-1 text-xs text-neutral-200 select-none animate-in fade-in"
        >
          {/* Open */}
          <button
            onClick={() => {
              if (contextMenu.node) {
                if (contextMenu.node.isDirectory) {
                  toggleFolder(contextMenu.node.path);
                } else {
                  openFile(contextMenu.node.path);
                }
              }
              setContextMenu({ visible: false, x: 0, y: 0, node: null });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <span>{isIndo ? 'Buka' : 'Open'}</span>
          </button>

          {/* Open in Visual Designer if XML layout */}
          {contextMenu.node.path.startsWith('app/src/main/res/layout/') &&
            contextMenu.node.path.endsWith('.xml') && (
              <button
                onClick={() => {
                  if (contextMenu.node) {
                    openFile(contextMenu.node.path);
                    setActiveView('visual-designer');
                  }
                  setContextMenu({ visible: false, x: 0, y: 0, node: null });
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-emerald-600 hover:text-white flex items-center gap-2 text-emerald-400 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Buka di Visual Designer' : 'Open with Visual Designer'}</span>
              </button>
            )}

          <div className="my-1 border-t border-neutral-800" />

          {/* New file inside this folder */}
          <button
            onClick={() => {
              if (contextMenu.node) {
                const parent = contextMenu.node.isDirectory
                  ? contextMenu.node.path
                  : contextMenu.node.path.split('/').slice(0, -1).join('/');
                setNewItemModal({ parentPath: parent, isDirectory: false });
              }
              setContextMenu({ visible: false, x: 0, y: 0, node: null });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Berkas Baru...' : 'New File...'}</span>
          </button>

          {/* New folder inside this folder */}
          <button
            onClick={() => {
              if (contextMenu.node) {
                const parent = contextMenu.node.isDirectory
                  ? contextMenu.node.path
                  : contextMenu.node.path.split('/').slice(0, -1).join('/');
                setNewItemModal({ parentPath: parent, isDirectory: true });
              }
              setContextMenu({ visible: false, x: 0, y: 0, node: null });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Folder Baru...' : 'New Folder...'}</span>
          </button>

          <div className="my-1 border-t border-neutral-800" />

          {/* Rename */}
          <button
            onClick={() => {
              if (contextMenu.node) {
                setRenameItemCandidate({
                  path: contextMenu.node.path,
                  name: contextMenu.node.name,
                });
              }
              setContextMenu({ visible: false, x: 0, y: 0, node: null });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Ubah Nama...' : 'Rename...'}</span>
          </button>

          {/* Copy path */}
          <button
            onClick={() => contextMenu.node && handleCopyPath(contextMenu.node.path)}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Salin Jalur' : 'Copy Path'}</span>
          </button>

          <div className="my-1 border-t border-neutral-800" />

          {/* Delete with confirmation */}
          <button
            onClick={() => {
              if (contextMenu.node) {
                setDeleteItemCandidate({
                  path: contextMenu.node.path,
                  name: contextMenu.node.name,
                  isDirectory: contextMenu.node.isDirectory,
                });
              }
              setContextMenu({ visible: false, x: 0, y: 0, node: null });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center gap-2 text-red-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Hapus...' : 'Delete...'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
