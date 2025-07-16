
import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface KeyboardShortcutsProps {
  onNewProject?: () => void;
  onNewIdea?: () => void;
  onFocusMode?: () => void;
  onSearch?: () => void;
}

export const KeyboardShortcuts = ({
  onNewProject,
  onNewIdea,
  onFocusMode,
  onSearch
}: KeyboardShortcutsProps) => {
  const { toast } = useToast();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isCtrlCmd = event.ctrlKey || event.metaKey;
    
    // Prevent shortcuts when user is typing in input fields
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    // Ctrl/Cmd + N - New Project
    if (isCtrlCmd && event.key === 'n') {
      event.preventDefault();
      onNewProject?.();
      toast({
        title: "New Project",
        description: "Creating a new project..."
      });
    }

    // Ctrl/Cmd + I - New Idea
    if (isCtrlCmd && event.key === 'i') {
      event.preventDefault();
      onNewIdea?.();
      toast({
        title: "New Idea",
        description: "Opening idea capture..."
      });
    }

    // Ctrl/Cmd + F - Focus Mode
    if (isCtrlCmd && event.key === 'f') {
      event.preventDefault();
      onFocusMode?.();
      toast({
        title: "Focus Mode",
        description: "Entering focus mode..."
      });
    }

    // Ctrl/Cmd + K - Search (common shortcut)
    if (isCtrlCmd && event.key === 'k') {
      event.preventDefault();
      onSearch?.();
      toast({
        title: "Search",
        description: "Opening search..."
      });
    }

    // Show shortcuts help with ?
    if (event.key === '?' && !isCtrlCmd) {
      event.preventDefault();
      toast({
        title: "Keyboard Shortcuts",
        description: "Ctrl+N: New Project, Ctrl+I: New Idea, Ctrl+F: Focus Mode, Ctrl+K: Search"
      });
    }
  }, [onNewProject, onNewIdea, onFocusMode, onSearch, toast]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // This component doesn't render anything
};
