// import { useState } from "react";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import EmployerSidebar from "@/components/EmployerSidebar";
// import EmployerHeader from "@/components/EmployerHeader";
// import PostOpening from "@/components/PostOpening";
// import ViewApplications from "@/components/ViewApplications";
// import ViewStatus from "@/components/ViewStatus";
// import CalendarEvents from "@/components/CalendarEvents";
// import CreateEvent from "@/components/CreateEvent";
// import MyEvents from "@/components/MyEvents";
// import EmployerDashboardHome from "@/components/EmployerDashboardHome";
// import Analytics from "@/components/Analytics";
// import EmployerNotifications from "@/components/EmployerNotifications";
// import EmployerMessages from "@/components/EmployerMessages";

// const EmployerDashboard = () => {
//   const [activeSection, setActiveSection] = useState<
//     'dashboard-home' | 'post-opening' | 'view-applications' | 'view-status' | 'calendar-events' | 'create-event' | 'my-events' | 'analytics' | 'notifications' | 'messages'
//   >('dashboard-home');

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       <SidebarProvider>
//         <div className="min-h-screen flex w-full">
//           <EmployerSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
//           <div className="flex-1 flex flex-col">
//             <EmployerHeader />
//             <main className="flex-1 p-6">
//               {activeSection === 'dashboard-home' && <EmployerDashboardHome />}
//               {activeSection === 'post-opening' && <PostOpening />}
//               {activeSection === 'view-applications' && <ViewApplications />}
//               {activeSection === 'view-status' && <ViewStatus />}
//               {activeSection === 'calendar-events' && <CalendarEvents />}
//               {activeSection === 'create-event' && <CreateEvent />}
//               {activeSection === 'my-events' && <MyEvents />}
//               {activeSection === 'analytics' && <Analytics />}
//               {activeSection === 'notifications' && <EmployerNotifications />}
//               {activeSection === 'messages' && <EmployerMessages />}
//             </main>
//           </div>
//         </div>
//       </SidebarProvider>
//     </div>
//   );
// };

// export default EmployerDashboard;



// src/pages/EmployerDashboard.tsx (CORRECTED)

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import EmployerSidebar from "@/components/EmployerSidebar";
import EmployerHeader from "@/components/EmployerHeader";
import PostOpening from "@/components/PostOpening";
import ViewApplications from "@/components/ViewApplications";
import ViewStatus from "@/components/ViewStatus";
import CalendarEvents from "@/components/CalendarEvents";
import CreateEvent from "@/components/CreateEvent";
import MyEvents from "@/components/MyEvents";
import EmployerDashboardHome from "@/components/EmployerDashboardHome";
import Analytics from "@/components/Analytics";
import EmployerNotifications from "@/components/EmployerNotifications";
// ❌ We no longer import EmployerMessages because it was deleted.
// import EmployerMessages from "@/components/EmployerMessages";

// Define the type for the active section. We remove 'messages' from this list.
type ActiveSection = 
  'dashboard-home' | 
  'post-opening' | 
  'view-applications' | 
  'view-status' | 
  'calendar-events' | 
  'create-event' | 
  'my-events' | 
  'analytics' | 
  'notifications';

const EmployerDashboard = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard-home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* 
            The EmployerSidebar will need a small update to handle navigation for 'messages' 
            instead of just changing state. For now, this component will pass the props it needs.
          */}
          <EmployerSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          
          <div className="flex-1 flex flex-col">
            <EmployerHeader />
            <main className="flex-1 p-6">
              {/* Render components based on the active section */}
              {activeSection === 'dashboard-home' && <EmployerDashboardHome />}
              {activeSection === 'post-opening' && <PostOpening />}
              {activeSection === 'view-applications' && <ViewApplications />}
              {activeSection === 'view-status' && <ViewStatus />}
              {activeSection === 'calendar-events' && <CalendarEvents />}
              {activeSection === 'create-event' && <CreateEvent />}
              {activeSection === 'my-events' && <MyEvents />}
              {activeSection === 'analytics' && <Analytics />}
              {activeSection === 'notifications' && <EmployerNotifications />}
              
              {/* ❌ The line that rendered EmployerMessages has been removed. */}
              {/* {activeSection === 'messages' && <EmployerMessages />} */}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default EmployerDashboard;
