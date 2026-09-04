import Link from "next/link";
import pet_background from './james-lewis-AyAdrhCfOZM-unsplash.jpg';
import logo from './Logo.png';
import Image from "next/image";

export default function Home() {
  return (
    <div 
      className="min-h-screen relative w-full overflow-hidden bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url(${pet_background.src})`,
      }}
    >
      <div className="absolute top-0 left-0 w-full flex px-6 py-4 justify-between">
        <Image
          src={logo}
          alt="PawMatch Logo"
          width={100}
          height={100}
          className="object-contain"
        />
        <div className="flex text-center items-center gap-4 font-bold">
          <Link href='/how_it_works'>
            How It Works
          </Link>
          <Link href='/login' className="px-3 py-2 rounded-xl bg-orange-500">
            Login
          </Link>
        </div>
      </div>
      <div className="flex flex-col max-w-2xl w-full text-white">
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold p-3">
            Every Pet deserves to find their way home
          </h1>
          <p className="p-2">
            PawMatch helps you find your pet. If you have lost a companion or spotted one wandering, report
            it here so that community can look out together
          </p>
        </div>
        <div className="flex items-center gap-10 p-4">
          <Link href="/lost_pet" className="text-white font-bold bg-orange-500 py-3 px-5 rounded-2xl border-2 border-orange-600">
            Report a Lost Pet
          </Link>
          <Link href="/spotted_pet" className="font-bold bg-white py-3 px-5 text-black rounded-2xl border-2 border-gray-300">
            I found a Pet
          </Link>
        </div>
      </div>
    </div>
  );
}