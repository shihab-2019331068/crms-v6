import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as React from "react"
import { Button } from "@/components/ui/button"

interface SlidingPageProps {
  sidebarOpen?: boolean
}

export default function SlidingPage({ sidebarOpen = true }: SlidingPageProps) {
  return (
    <div
      className={`min-h-screen p-6 page-bg-light transition-all duration-300 text-black ${
        sidebarOpen ? "w-300" : "w-348"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">ABDULLAH ALL FERDOUSE</h2>
        <Button variant="outline" className="bg-[#3b5998] text-white hover:bg-[#2d4373]">
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
              <div>ABDULLAH ALL FERDOUSE</div>
            </div>
            <div>
              <div className="font-medium">Registration No</div>
              <div>2019331068</div>
            </div>
            <div>
              <div className="font-medium">School</div>
              <div>School of Applied Sciences & Technology</div>
            </div>
            <div>
              <div className="font-medium">Department</div>
              <div>Department of Computer Science & Engineering</div>
            </div>
            <div>
              <div className="font-medium">Semester</div>
              <div>8th Semester</div>
            </div>
            <div>
              <div className="font-medium">Degree</div>
              <div>Bachelor of Science (Engineering)</div>
            </div>
            <div>
              <div className="font-medium">Session</div>
              <div>2019-2020</div>
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
              <div>01575087097</div>
            </div>
            <div>
              <div className="font-medium">Email</div>
              <div>siababdullah3946@gmail.com</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}