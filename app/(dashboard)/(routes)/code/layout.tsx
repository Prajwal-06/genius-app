// import Navbar from "@/components/Navbar";
// import Sidebar from "@/components/Sidebar";
// import { Children } from "react";

// const DashboardLayout = ({
//     children 
// } : {
//         children: React.ReactNode;

// }) =>{
//     return (
//         <div className="h-full relative">
//             <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
//                 <Sidebar/>
//             </div>
//             <main className="md:pl-72">
//                 <Navbar />
//                 {children}
//             </main>
//         </div>
//     )

// }

// export default DashboardLayout;




"use client"; // Required for using hooks in layout

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

const DashboardLayout = ({
    children 
}: {
    children: React.ReactNode;
}) => {
    const pathname = usePathname();
    
    // Define routes that shouldn't have layout
    const noLayoutRoutes = [
        '/doctutor',
        '/doctutor/chatId'
    ];

    if (noLayoutRoutes.includes(pathname)) {
        return <div className="h-full">{children}</div>;
    }

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar/>
            </div>
            <main className="md:pl-72">
                <Navbar />
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;