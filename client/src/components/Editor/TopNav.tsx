import { Share2, ChevronDown, Check, Download, Upload, Save, LogOut, User } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser, useClerk } from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function TopNav() {
  const credits = useWorkflowStore((state) => state.credits);
  const exportWorkflow = useWorkflowStore((state) => state.exportWorkflow);
  const importWorkflow = useWorkflowStore((state) => state.importWorkflow);
  const { toast } = useToast();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirectUrl: '/sign-in' });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Assignment Requirement: Export workflow as JSON
  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Workflow exported",
      description: "Your workflow has been downloaded as JSON",
    });
  };

  // Assignment Requirement: Import workflow from JSON
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          importWorkflow(json);
          toast({
            title: "Workflow imported",
            description: "Your workflow has been loaded successfully",
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid workflow file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <header className="h-14 bg-[#0A0A0A] border-b border-[#222224] flex items-center justify-between px-4 z-20 shrink-0">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C084FC] to-[#8040C0] flex items-center justify-center shadow-lg shadow-purple-900/20">
          <span className="font-bold text-white text-lg">W</span>
        </div>
        
        <div className="flex items-center gap-2 bg-[#1C1C1E] px-3 py-1.5 rounded-full border border-[#2A2A2C] hover:border-[#3A3A3C] transition-colors group cursor-text">
          <span className="text-sm font-medium text-gray-200">Cyberpunk City Gen</span>
          <span className="text-[10px] text-gray-500 bg-[#2A2A2C] px-1.5 rounded group-hover:bg-black transition-colors">v3</span>
        </div>
      </div>

      {/* Right: Credits & Actions */}
      <div className="flex items-center gap-3">
        {/* Credits Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-[#2A2A2C]">
          <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          <span className="text-xs font-mono font-medium text-gray-300">
            {credits} credits
          </span>
        </div>

        {/* Export Button - Assignment Requirement */}
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C1C1E] text-gray-300 hover:bg-[#2A2A2C] hover:text-white transition-colors border border-transparent hover:border-[#333] text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        {/* Import Button - Assignment Requirement */}
        <button 
          onClick={handleImport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C1C1E] text-gray-300 hover:bg-[#2A2A2C] hover:text-white transition-colors border border-transparent hover:border-[#333] text-sm font-medium"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>

        {/* Profile Dropdown with Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-purple-800 border border-purple-500 hover:border-purple-400 transition-all flex items-center justify-center text-white font-semibold text-sm shadow-lg hover:shadow-purple-500/50 cursor-pointer">
              {user?.firstName?.[0] || user?.username?.[0] || <User className="w-4 h-4" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#1C1C1E] border-[#2A2A2C]">
            <DropdownMenuLabel className="text-gray-300">
              <div className="flex flex-col">
                <span className="font-medium">{user?.fullName || user?.username || "User"}</span>
                <span className="text-xs text-gray-500 font-normal">
                  {user?.primaryEmailAddress?.emailAddress || "No email"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#2A2A2C]" />
            <DropdownMenuItem 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/30 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
