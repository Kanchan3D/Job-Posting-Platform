const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">JobBoard</h3>
            <p className="text-gray-300">
              Find your dream job or post opportunities to connect with top talent.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/jobs" className="hover:text-white">Browse Jobs</a></li>
              <li><a href="/my-applications" className="hover:text-white">My Applications</a></li>
              <li><a href="/profile" className="hover:text-white">Profile</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/admin" className="hover:text-white">Post Jobs</a></li>
              <li><a href="/admin" className="hover:text-white">Manage Applications</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 JobBoard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
