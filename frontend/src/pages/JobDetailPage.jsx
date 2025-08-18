import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { jobService } from '../services/api'

const JobDetailPage = () => {
  const { id } = useParams()
  
  const { data, isLoading, error } = useQuery(
    ['job', id],
    () => jobService.getJobById(id)
  )

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center">Error loading job</div>

  const job = data?.data?.job

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{job?.title}</h1>
          <p className="text-xl text-gray-700 mb-6">{job?.company}</p>
          <p className="text-gray-600 mb-8">{job?.description}</p>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-gray-600">{job?.location}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Salary</h3>
              <p className="text-gray-600">${job?.salary?.min} - ${job?.salary?.max}</p>
            </div>
          </div>
          
          <button className="btn-primary mt-8">Apply Now</button>
        </div>
      </div>
    </div>
  )
}

export default JobDetailPage
