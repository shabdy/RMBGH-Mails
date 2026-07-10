import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../../../assets/rmbghlogo.png";
import RegisterForm from "./registerForm";
import RegisterFooter from "./registerFooter";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-700 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="z-10 border border-blue-200/50 dark:border-blue-600/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-8 border-b">
          <img src={logo} alt="RMBGH Logo" className="h-14 w-14 mb-3 object-contain" />
          <h2 className="text-xl font-bold text-slate-900">Create an Account</h2>
          <p className="text-sm text-slate-500 text-center mt-1">
            Fill in your details to request access to the RMBGH Portal
          </p>
        </div>

        <RegisterForm />
      </motion.div>

      <Link to="/" className="text-sm text-blue-600 hover:underline mt-4 block text-center z-10">
        Already have an account? Login here.
      </Link>

      <RegisterFooter />
    </div>
  );
}
