
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { PlusCircle, Users, BarChart3, Calendar } from "lucide-react";

interface EmployerSidebarProps {
  activeSection: 'post-opening' | 'view-applications' | 'view-status' | 'calendar-events';
  onSectionChange: (section: 'post-opening' | 'view-applications' | 'view-status' | 'calendar-events') => void;
}

const EmployerSidebar = ({ activeSection, onSectionChange }: EmployerSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const menuItems = [
    {
      id: 'post-opening' as const,
      label: 'Post Opening',
      icon: PlusCircle
    },
    {
      id: 'view-applications' as const,
      label: 'View Applications',
      icon: Users
    },
    {
      id: 'view-status' as const,
      label: 'View Status',
      icon: BarChart3
    },
    {
      id: 'calendar-events' as const,
      label: 'Calendar & Events',
      icon: Calendar
    }
  ];

  return (
    <Sidebar className="border-r border-slate-200 bg-white shadow-lg">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3 p-3">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className={`w-full py-4 px-4 rounded-lg transition-all duration-200 min-h-[56px] ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                    {!isCollapsed && (
                      <span className="font-medium text-sm leading-relaxed">{item.label}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default EmployerSidebar;
