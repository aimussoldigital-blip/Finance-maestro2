import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Target, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  onNewRecord: () => void;
}

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/analysis', icon: BarChart3, label: 'Análisis' },
  { path: '/goals', icon: Target, label: 'Metas' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

const AppSidebar = ({ onNewRecord }: AppSidebarProps) => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gradient">Finanzas</h1>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* New Record Button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onNewRecord}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 mb-4"
                >
                  <Plus className="h-5 w-5" />
                  {!collapsed && <span>Nuevo Registro</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Navigation Items */}
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 transition-colors',
                          isActive 
                            ? 'bg-sidebar-accent text-sidebar-primary font-medium' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        )}
                      >
                        <Icon className={cn(
                          'h-5 w-5',
                          isActive && 'text-sidebar-primary'
                        )} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
