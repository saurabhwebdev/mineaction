import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-xl mb-6">
        You don't have permission to access this page.
      </p>
      {userData?.role && (
        <p className="mb-6">
          Your current role is: <span className="font-semibold">{userData.role}</span>
        </p>
      )}
      <div className="flex gap-4">
        <Button onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </div>
    </div>
  );
} 