"use client"

import { useState } from "react"
import { useAuth } from "@/firebase"
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout, Mail, Lock, UserPlus, LogIn, Ghost } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { useEffect } from "react"

export default function LoginPage() {
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
      initiateEmailSignUp(auth, email, password)
    } else {
      initiateEmailSignIn(auth, email, password)
    }
  }

  if (isUserLoading) return null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
              <Layout className="text-white h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">
            AquaFlow<span className="text-accent">Planner</span>
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Create an account to start your flow" : "Sign in to manage your daily tasks"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 gap-2">
              {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full h-11 gap-2" 
            onClick={() => initiateAnonymousSignIn(auth)}
          >
            <Ghost className="h-4 w-4" />
            Continue as Guest
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            variant="link" 
            className="text-xs text-muted-foreground"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
