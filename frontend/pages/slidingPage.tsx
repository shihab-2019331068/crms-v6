import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import api from "@/services/api"

interface SlidingPageProps {
  sidebarOpen?: boolean
}

export default function SlidingPage({ sidebarOpen = true }: SlidingPageProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [userDetails, setUserDetails] = React.useState(null)

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.email) {
        try {
          const response = await api.get(`/user/${user.email}`);
          setUserDetails(response.data);
        } catch (error) {
          console.error("Failed to fetch user details", error)
        }
      }
    }

    fetchUserDetails()
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div
      className={`min-h-screen p-6 page-bg-light transition-all duration-300 text-black ${ sidebarOpen ? "w-300" : "w-348" }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{userDetails?.name}</h2>
        <Button variant="outline" className="bg-[#3b5998] text-white hover:bg-[#2d4373]" onClick={handleLogout}>
          <span className="mr-2">&#x21bb;</span> Logout
        </Button>
      </div>
      <Card className="mb-6 w-full">
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Name</div>
              <div>{userDetails?.name}</div>
            </div>
            <div>
              <div className="font-medium">Registration No</div>
              <div>{userDetails?.regNo}</div>
            </div>
            <div>
              <div className="font-medium">School</div>
              <div>{userDetails?.school}</div>
            </div>
            <div>{userDetails?.department}</div>
            <div>
              <div className="font-medium">Semester</div>
              <div>{userDetails?.semester}</div>
            </div>
            <div>
              <div className="font-medium">Degree</div>
              <div>{userDetails?.degree}</div>
            </div>
            <div>
              <div className="font-medium">Session</div>
              <div>{userDetails?.session}</div>
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
              <div>{userDetails?.mobile}</div>
            </div>
            <div>
              <div className="font-medium">Email</div>
              <div>{userDetails?.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}