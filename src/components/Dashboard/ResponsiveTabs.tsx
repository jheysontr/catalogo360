import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TabOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface ResponsiveTabsListProps {
  options: TabOption[];
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * On mobile: renders a Select dropdown.
 * On desktop: renders a standard TabsList with horizontal scroll.
 */
const ResponsiveTabsList = ({ options, value, onValueChange }: ResponsiveTabsListProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {(() => {
              const opt = options.find((o) => o.value === value);
              return opt ? (
                <span className="flex items-center gap-2">
                  {opt.icon}
                  {opt.label}
                  {opt.badge}
                </span>
              ) : null;
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-2">
                {opt.icon}
                {opt.label}
                {opt.badge}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <TabsList className="dashboard-tabs-list">
      {options.map((opt) => (
        <TabsTrigger
          key={opt.value}
          value={opt.value}
          className="dashboard-tab-trigger gap-1.5"
        >
          {opt.icon}
          {opt.label}
          {opt.badge}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ResponsiveTabsList;
