import { motion } from "framer-motion";
import { User, Mail, Key, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";

export default function UserInfoDisplay() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mb-8"
    >
      <Card className="bg-blue-500/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Shield className="h-5 w-5" />
            Current User Session
          </CardTitle>
          <CardDescription>
            You are currently logged in with the default demo account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium">Username</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{user.email || 'alex.johnson@email.com'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">default123</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium">Full Name</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Demo Account
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Pro Plan Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}