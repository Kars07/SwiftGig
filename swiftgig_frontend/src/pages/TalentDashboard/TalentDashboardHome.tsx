import React from 'react';
import { motion } from 'framer-motion';
import { Home, Briefcase, BarChart3, Settings, User, ChevronDown, ChevronRight, PlusCircle, FileText, LogOut } from 'lucide-react';


const DashboardHome: React.FC = () => {
  return (
    <div className='pl-10'>
      <div className='flex justify-between'>
        <div>
          <h1 className='text-white text-sm'>Talent Dashboard</h1>
          <h1 className='text-white font-bold mt-4 text-xl'>Welcome back!</h1>
       </div>
       <div className='flex justify-center items-center gap-4'>
           <div className='border-[#2B0A2F] flex bg-black border-2 text-white rounded-[15px] '><img src="/Search.svg" alt="" className='w-10 h-10 text-sm' /><input type="text" className='outline-none' placeholder='Type here...' /></div>
          <img src="/notifi.svg" className='w-6 h-6' alt="" />
       </div>
      </div>
      <div className='flex justify-between gap-10'>
        <div className='flex w-[35%] bg-black/30 mt-10 rounded-2xl p-4 justify-between'>
         <div> <h1 className='text-white text-sm'>Profile View</h1> <h1 className='text-white text-xl'>28</h1></div> <div className='bg-purple-500 flex justify-center items-center px-3 rounded-2xl'><User className="w-6 h-6 text-white" /></div>
        </div>
        <div className='flex w-[35%] bg-black/30 mt-10 rounded-2xl p-4 justify-between'>
         <div> <h1 className='text-white text-sm'>Profile View</h1> <h1 className='text-white text-xl'>28</h1></div> <div className='bg-purple-500 flex justify-center items-center px-3 rounded-2xl'><User className="w-6 h-6 text-white" /></div>
        </div>
        <div className='flex w-[35%] bg-black/30 mt-10 rounded-2xl p-4 justify-between'>
         <div> <h1 className='text-white text-sm'>Profile View</h1> <h1 className='text-white text-xl'>28</h1></div> <div className='bg-purple-500 flex justify-center items-center px-3 rounded-2xl'><User className="w-6 h-6 text-white" /></div>
        </div>
      </div>
      <div>
         <main className="flex-1 flex pt-10 w-[60%] h-[300px] ">
          {/* Wallet Balance Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#4B1656]/80 via-[#65206E]/70 to-[#2E0936]/70 p-8 rounded-2xl w-full  text-center shadow-lg backdrop-blur-md border border-purple-700/40"
          >
            <h2 className="text-2xl font-bold mb-4">Wallet Balance</h2>
            <p className="text-4xl font-extrabold text-purple-200">$12,450.00</p>
          </motion.div>
        </main>

      </div>
    </div>
  );
};

export default DashboardHome;
