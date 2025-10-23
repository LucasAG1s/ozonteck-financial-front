// src/components/ui/DateRangeFilter.tsx
import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, X, Filter } from "lucide-react";

interface DateRangeFilterProps {
  startDate?: Date | string;
  endDate?: Date | string;
  onFilter: (start: string, end: string) => void;
  label?: string;
  width?: string;
}

export function DateRangeFilter({
  startDate: initialStart,
  endDate: initialEnd,
  onFilter,
  width = "w-50",
}: DateRangeFilterProps) {
  const parseDate = (date?: Date | string) => {
    if (!date) return undefined;
    if (typeof date === "string") {
      const parsed = parseISO(date);
      return isValid(parsed) ? parsed : undefined;
    }
    return date;
  };

  const [range, setRange] = useState<DateRange>({
    from: parseDate(initialStart),
    to: parseDate(initialEnd),
  });

  useEffect(() => {
    setRange({ from: parseDate(initialStart), to: parseDate(initialEnd) });
  }, [initialStart, initialEnd]);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange ?? { from: undefined, to: undefined });
  };

  const handleClear = () => {
    setRange({ from: undefined, to: undefined });
  };

  const handleApply = () => {
    if (range.from && range.to) {
      const start = format(range.from, "yyyy-MM-dd");
      const end = format(range.to, "yyyy-MM-dd");
      onFilter(start, end);
    }
  };

  const formatSafe = (date?: Date) => (date && isValid(date) ? format(date, "dd/MM/yyyy") : "");

  return (
    <div className="flex flex-col space-y-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`${width} justify-start text-left font-normal`}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{formatSafe(range.from) || "Início"} - {formatSafe(range.to) || "Fim"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 flex flex-col gap-2">
          <Calendar mode="range" selected={range} onSelect={handleSelect} initialFocus />
          <div className="flex gap-2">
            {(range.from || range.to) && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-center gap-1 text-red-500"
                onClick={handleClear}
              >
                <X className="h-4 w-4" /> Limpar
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1 justify-center gap-1"
              onClick={handleApply}
              disabled={!range.from || !range.to}
            >
              <Filter className="h-4 w-4" /> Filtrar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
