import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SavedRepliesMenuProps {
  onSelectReply: (text: string) => void;
  disabled?: boolean;
}

export function SavedRepliesMenu({ onSelectReply, disabled = false }: SavedRepliesMenuProps) {
  const { data: savedReplies, isLoading } = trpc.savedReplies.getAll.useQuery();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !savedReplies || savedReplies.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled}
          title="Saved Replies"
          className="relative"
        >
          <MessageSquare className="h-4 w-4" />
          {savedReplies.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {savedReplies.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto">
        <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
          Saved Replies ({savedReplies.length})
        </div>
        <DropdownMenuSeparator />
        {savedReplies.map((reply: any) => (
          <DropdownMenuItem
            key={reply.id}
            onClick={() => {
              onSelectReply(reply.content);
              setIsOpen(false);
            }}
            className="cursor-pointer py-2 px-2 flex flex-col items-start"
          >
            <div className="flex flex-col gap-1 w-full">
              <span className="font-medium text-sm line-clamp-1">
                {reply.content.substring(0, 50)}
                {reply.content.length > 50 ? "..." : ""}
              </span>
              <span className="text-xs text-gray-500 line-clamp-2">
                {reply.content}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
