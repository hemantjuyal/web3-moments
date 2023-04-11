import Link from 'next/link'

export default function Custom404() {
  return <>
    <h1 className="mr-4 text-purple-800">Not Found</h1>
    <Link href="/" className="mr-4 text-purple-800">
        Invalid Operation...... Go back <span className="mr-4 text-blue-800"> Home </span>
    </Link>
  </>
}
