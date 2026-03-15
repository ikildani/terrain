'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, MoreHorizontal, Pencil, Trash2, Library } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ReportFolder } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface FolderNode extends ReportFolder {
  children: FolderNode[];
  report_count: number;
}

interface FolderTreeProps {
  folders: ReportFolder[];
  activeFolderId: string | null;
  onSelect: (id: string | null) => void;
  reportCountsByFolder: Record<string, number>;
  totalReportCount: number;
  canManageFolders?: boolean;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onDeleteFolder?: (folderId: string) => void;
}

// ────────────────────────────────────────────────────────────
// Build tree from flat list
// ────────────────────────────────────────────────────────────

function buildTree(folders: ReportFolder[], counts: Record<string, number>): FolderNode[] {
  const map = new Map<string, FolderNode>();

  // Create nodes
  for (const f of folders) {
    map.set(f.id, {
      ...f,
      children: [],
      report_count: counts[f.id] ?? 0,
    });
  }

  const roots: FolderNode[] = [];

  // Link children to parents
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort alphabetically
  const sortNodes = (nodes: FolderNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    for (const n of nodes) sortNodes(n.children);
  };
  sortNodes(roots);

  return roots;
}

// ────────────────────────────────────────────────────────────
// Context menu
// ────────────────────────────────────────────────────────────

function FolderContextMenu({
  x,
  y,
  onRename,
  onDelete,
  onClose,
}: {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-navy-800 border border-navy-700 rounded-lg shadow-xl py-1 min-w-[140px]"
      style={{ top: y, left: x }}
    >
      <button
        onClick={onRename}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-navy-700 hover:text-white transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Rename
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-navy-700 hover:text-red-300 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Single folder row
// ────────────────────────────────────────────────────────────

function FolderRow({
  node,
  depth,
  activeFolderId,
  onSelect,
  expandedIds,
  toggleExpanded,
  canManage,
  onContextMenu,
}: {
  node: FolderNode;
  depth: number;
  activeFolderId: string | null;
  onSelect: (id: string | null) => void;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  canManage: boolean;
  onContextMenu: (e: React.MouseEvent, folderId: string) => void;
}) {
  const isActive = activeFolderId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const FolderIcon = isActive || isExpanded ? FolderOpen : Folder;

  return (
    <>
      <button
        onClick={() => onSelect(node.id)}
        onContextMenu={(e) => {
          if (canManage) {
            e.preventDefault();
            onContextMenu(e, node.id);
          }
        }}
        className={cn(
          'group flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-md transition-all duration-150',
          isActive
            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
            : 'text-slate-400 hover:text-white hover:bg-navy-800/60 border border-transparent',
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(node.id);
            }}
            className="p-0.5 -ml-1 rounded hover:bg-navy-700/50 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-slate-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-slate-500" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <FolderIcon className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-teal-500' : 'text-slate-500')} />
        <span className="truncate flex-1 text-left">{node.name}</span>
        <span className="font-mono text-2xs text-slate-600 shrink-0">{node.report_count}</span>
        {canManage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e, node.id);
            }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-navy-700/50 transition-all"
          >
            <MoreHorizontal className="w-3 h-3 text-slate-500" />
          </button>
        )}
      </button>

      {isExpanded &&
        node.children.map((child) => (
          <FolderRow
            key={child.id}
            node={child}
            depth={depth + 1}
            activeFolderId={activeFolderId}
            onSelect={onSelect}
            expandedIds={expandedIds}
            toggleExpanded={toggleExpanded}
            canManage={canManage}
            onContextMenu={onContextMenu}
          />
        ))}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Main FolderTree component
// ────────────────────────────────────────────────────────────

export function FolderTree({
  folders,
  activeFolderId,
  onSelect,
  reportCountsByFolder,
  totalReportCount,
  canManageFolders = false,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null);

  const tree = buildTree(folders, reportCountsByFolder);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, folderId });
  }, []);

  const handleRename = useCallback(() => {
    if (!contextMenu || !onRenameFolder) return;
    const folder = folders.find((f) => f.id === contextMenu.folderId);
    if (!folder) return;
    const newName = window.prompt('Rename folder', folder.name);
    if (newName && newName.trim() && newName.trim() !== folder.name) {
      onRenameFolder(contextMenu.folderId, newName.trim());
    }
    setContextMenu(null);
  }, [contextMenu, folders, onRenameFolder]);

  const handleDelete = useCallback(() => {
    if (!contextMenu || !onDeleteFolder) return;
    const folder = folders.find((f) => f.id === contextMenu.folderId);
    if (!folder) return;
    if (window.confirm(`Delete folder "${folder.name}"? Reports inside will be moved to "All Reports".`)) {
      onDeleteFolder(contextMenu.folderId);
    }
    setContextMenu(null);
  }, [contextMenu, folders, onDeleteFolder]);

  return (
    <div className="flex flex-col gap-0.5">
      {/* All Reports */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-md transition-all duration-150',
          activeFolderId === null
            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
            : 'text-slate-400 hover:text-white hover:bg-navy-800/60 border border-transparent',
        )}
      >
        <Library className={cn('w-3.5 h-3.5', activeFolderId === null ? 'text-teal-500' : 'text-slate-500')} />
        <span className="flex-1 text-left">All Reports</span>
        <span className="font-mono text-2xs text-slate-600">{totalReportCount}</span>
      </button>

      {/* Divider */}
      {tree.length > 0 && <div className="border-t border-navy-700/40 my-1" />}

      {/* Folder tree */}
      {tree.map((node) => (
        <FolderRow
          key={node.id}
          node={node}
          depth={0}
          activeFolderId={activeFolderId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          toggleExpanded={toggleExpanded}
          canManage={canManageFolders}
          onContextMenu={handleContextMenu}
        />
      ))}

      {/* Context menu */}
      {contextMenu && (
        <FolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={handleRename}
          onDelete={handleDelete}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
