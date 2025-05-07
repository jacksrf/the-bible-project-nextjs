"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { useBibleVersion } from "@/app/context/BibleVersionContext"

export function BibleVersionSelector() {
  const { selectedVersion, setSelectedVersion, bibleVersions, isLoading, error } = useBibleVersion()

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = bibleVersions.find(v => v.value === event.target.value)
    if (selected) {
      setSelectedVersion(selected)
    }
  }

  if (isLoading) {
    return (
      <div className="w-[300px] h-10 flex items-center justify-center bg-white border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-[300px] h-10 flex items-center justify-center bg-white border rounded-md text-red-500">
        Error loading versions
      </div>
    )
  }

  return (
    <select
      value={selectedVersion?.value || ''}
      onChange={handleChange}
      className="w-[300px] h-10 px-3 bg-white border rounded-md appearance-none cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
        bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%200110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]
        bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat"
    >
      <option value="" disabled>Select version</option>
      {bibleVersions.map((version) => {
        console.log(version);
        return(
        <option key={version.value} value={version.value}>
          {version.label}
        </option>
      )})}
    </select>
  )
} 