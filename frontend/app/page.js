"use client"
import { useContext, useEffect } from 'react'
import Navbar from './component/Navbar'
import Hero from './sections/Herosection';
import Whysection from './sections/Whysection';
import Feature from './sections/Featuresections'
import Plan from './sections/Plansection'
import Ready from './sections/Readysection'
import Footer from './component/Footer'
import Testimonials from './sections/Testimonials'
import { appcontext } from './context/appcontext';
import { useRouter } from 'next/navigation';

const Page = () => {
  const { api, setprofile } = useContext(appcontext);
  const router = useRouter();

  useEffect(() => {
    const checkauth = async () => {
      try {
        const res = await fetch(`${api}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => null);

        if (res.ok && data) {
          setprofile(data);

          router.replace(data.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
        } else {
          router.replace("/auth/signin");
        }
      } catch {
        router.replace("/auth/signin");
      }
    };

    checkauth();
  }, [api, router, setprofile])
  
  return (
    <div>
     <Navbar />
     <Hero />
     <Whysection/>
     <Feature />
     <Plan />
     <Testimonials />
     <Ready />
     <Footer />
    </div>
  )
}

export default Page



