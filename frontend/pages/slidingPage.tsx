// --- START OF REVISED FILE slidingPage.tsx ---

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import api from "@/services/api"

// Define a type for the user details for better type safety and autocompletion.
interface UserDetails {
  name: string;
  email: string;
  regNo: string;
  school: string;
  department: string; // Expecting the department name string from the API
  semester: string;
  degree: string;
  session: string;
  mobile: string;
}

interface SlidingPageProps {
  sidebarOpen?: boolean
}

// A simple skeleton component for loading states to improve UX.
const SkeletonLoader = ({ className = 'w-3/4' }: { className?: string }) => (
  <div className={`h-4 bg-gray-300 rounded animate-pulse ${className}`}></div>
);

export default function SlidingPage({ sidebarOpen = true }: SlidingPageProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  // State management for data, loading, and error handling.
  const [userDetails, setUserDetails] = React.useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.email) {
        setIsLoading(false);
        setUserDetails(null); // Clear details if user logs out or is not present
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use the defined type for a typed API response
        const response = await api.get<UserDetails>(`/user/${user.email}`);
        setUserDetails(response.data);
      } catch (err: any) {
        console.error("Failed to fetch user details", err);
        const errorMessage = err.response?.data?.error || "Could not load user details. Please try again later.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserDetails()
  }, [user]) // Effect correctly depends on the user object.

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Card className="mb-6 w-full">
            <CardHeader><CardTitle>Academic Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <SkeletonLoader className="w-1/3" />
                    <SkeletonLoader />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="w-full">
             <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
             <CardContent>
               <div className="grid grid-cols-2 gap-4 text-sm">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <SkeletonLoader className="w-1/3" />
                      <SkeletonLoader />
                    </div>
                  ))}
               </div>
             </CardContent>
          </Card>
        </>
      )
    }

    if (error) {
      return (
        <Card className="w-full bg-red-50 border-red-200 text-red-800">
          <CardHeader><CardTitle>An Error Occurred</CardTitle></CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )
    }

    if (!userDetails) {
      return (
         <Card className="w-full">
          <CardContent className="pt-6">
            <p>User details are not available.</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        <Card className="mb-6 w-full">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Name</div>
                <div>{userDetails.name}</div>
              </div>
              <div>
                <div className="font-medium">Registration No</div>
                <div>{userDetails.regNo}</div>
              </div>
              <div>
                <div className="font-medium">School</div>
                <div>{userDetails.school}</div>
              </div>
              {/* Corrected: Added a label for Department */}
              <div>
                <div className="font-medium">Department</div>
                <div>{userDetails.department}</div>
              </div>
              <div>
                <div className="font-medium">Semester</div>
                <div>{userDetails.semester}</div>
              </div>
              <div>
                <div className="font-medium">Degree</div>
                <div>{userDetails.degree}</div>
              </div>
              <div>
                <div className="font-medium">Session</div>
                <div>{userDetails.session}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Mobile</div>
                <div>{userDetails.mobile}</div>
              </div>
              <div>
                <div className="font-medium">Email</div>
                <div>{userDetails.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <div className={`min-h-screen p-6 page-bg-light transition-all duration-300 text-black ${ sidebarOpen ? "w-316" : "w-364" }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold h-7 w-48">
            {isLoading ? <SkeletonLoader className="w-full"/> : userDetails?.name}
        </h2>
        <Button variant="outline" className="bg-[#3b5998] text-white hover:bg-[#2d4373]" onClick={handleLogout} disabled={isLoading}>
          <span className="mr-2">↻</span> Logout
        </Button>
      </div>
      {renderContent()}
    </div>
  )
}
