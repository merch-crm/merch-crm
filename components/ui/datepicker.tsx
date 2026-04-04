"use client"

import { Calendar } from "@/components/ui/calendar"
import * as Popover from "@/components/ui/popover"

export { 
    Calendar,
    Popover
}

// Sub-component API compatibility
export const Root = Popover.Root;
export const Trigger = Popover.Trigger;
export const Content = Popover.Content;
