'use client';
import HomePage from "@/components/Home/page";
import AppLayout from "@/components/Layout/page";

export default function Home() {
  return (
     <AppLayout>
      <div className="lg:ml-[100px] lg:mr-[0px] lg:mt-0 mt-1  w-92vh h-95vh justify-center items-center">
          <HomePage  />
        </div>
      </AppLayout>
  );
}
