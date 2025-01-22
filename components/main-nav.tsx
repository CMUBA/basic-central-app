"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import CustomLink from "./custom-link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"

export function MainNav() {
  const router = useRouter()
  const [role, setRole] = useState<string>()

  useEffect(() => {
    // Load saved role from localStorage
    const savedRole = localStorage.getItem("userRole")
    if (savedRole) {
      setRole(savedRole)
    }
  }, [])

  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
    localStorage.setItem("userRole", newRole)
    router.push(`/${newRole}`)
  }

  return (
    <div className="flex items-center gap-6">
      <CustomLink href="/">
        <Button variant="ghost" className="p-0">
          <Image
            src="/logo.png"
            alt="Home"
            width="32"
            height="32"
            className="min-w-8"
          />
        </Button>
      </CustomLink>

      <Select value={role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select your role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="player">Player Portal</SelectItem>
          <SelectItem value="merchant">Merchant Portal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
