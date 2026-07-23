import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { searchUsers } from "#/server/users";
import { Button } from "./ui/button";

const SEARCH_DEBOUNCE_MS = 250;

export interface SelectedUser {
  email: string;
  id: string;
  name: string | null;
}

interface Props {
  onChange: (user: SelectedUser | null) => void;
  value: SelectedUser | null;
}

export function UserPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SelectedUser[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setMatches([]);
      return;
    }
    const handle = setTimeout(() => {
      void (async () => {
        try {
          const rows = (await searchUsers({
            data: { q: query },
          })) as SelectedUser[];
          setMatches(rows);
        } catch {
          setMatches([]);
        }
      })();
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const picker = (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          {value ? "Change" : "Select user"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={setQuery}
            placeholder="Search by name or email..."
            value={query}
          />
          <CommandList>
            <CommandEmpty>No accounts found.</CommandEmpty>
            <CommandGroup>
              {matches.map((m) => (
                <CommandItem
                  key={m.id}
                  onSelect={() => {
                    onChange(m);
                    setOpen(false);
                    setQuery("");
                  }}
                  value={`${m.name ?? ""} ${m.email}`}
                >
                  <span className="font-medium">{m.name ?? m.email}</span>
                  <span className="ml-2 text-muted-foreground text-xs">
                    {m.email}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">
            {value.name ?? value.email}
          </p>
          <p className="truncate text-muted-foreground text-xs">
            {value.email}
          </p>
        </div>
        {picker}
      </div>
    );
  }

  return picker;
}
