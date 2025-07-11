import Link from "next/link";

const Navbar = () => {
  return (
    <header className="bg-amber-50 shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-amber-600">AnaViz</Link>
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <Link href="/upload" className="hover:text-amber-600">Upload</Link>
          <Link href="#" className="hover:text-amber-600">Trial Space</Link>
          <Link href="#" className="hover:text-amber-600">Contact</Link>
        </nav>
        <a
          href="#"
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full font-semibold text-sm"
        >
          Sign Up
        </a>
      </div>
    </header>
  );
};

export default Navbar;
