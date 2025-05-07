"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const bibleVersions = [
  {
    value: "niv",
    label: "New International Version (NIV)",
  },
  {
    value: "esv",
    label: "English Standard Version (ESV)",
  },
  {
    value: "kjv",
    label: "King James Version (KJV)",
  },
  {
    value: "nlt",
    label: "New Living Translation (NLT)",
  },
  {
    value: "nasb",
    label: "New American Standard Bible (NASB)",
  },
]

export function BibleVersionSelector() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("niv")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? bibleVersions.find((version) => version.value === value)?.label
            : "Select Bible version..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Bible version..." />
          <CommandEmpty>No version found.</CommandEmpty>
          <CommandGroup>
            {bibleVersions.map((version) => (
              <CommandItem
                key={version.value}
                value={version.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === version.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {version.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 