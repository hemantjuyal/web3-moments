import Link from 'next/link'


function Header() {    
    return (        
        <nav className="border-b p-6 font-semibold ">
          <p className="text-4xl font-bold text-purple-800"> What a Moment!! </p>
            <div className="bg-transparent flex mt-4">
              <Link href="/" className="mr-4 text-purple-800">
              Explore
            </Link>
            <Link href="/create-moments" className="mr-6 text-purple-800">
            Make Moments
          </Link>
          <Link href="/my-moments" className="mr-6 text-purple-800">
          My Owned Moments
          </Link>
          <Link href="/dashboard" className="mr-6 text-purple-800">
          My Listed Moments
          </Link>
          </div>
        </nav>
    )
}

export default Header


