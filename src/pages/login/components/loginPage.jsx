import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import logo from "../../../assets/rmbghlogo.png";
import LoginHeader from "./loginHeader";
import LoginForm from "./loginForm";
import LoginFooter from "./loginFooter";
import { useCurrentTime } from "./useLogin";

export default function LoginPage() {
  const { formattedDate, formattedTime } = useCurrentTime();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-700 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 text-center"
      >
        <p className="text-gray-700 dark:text-gray-300 text-sm tracking-wide">{formattedDate}</p>
        <p className="text-2xl font-semibold text-blue-700 dark:text-blue-400">{formattedTime}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="z-10 border border-blue-200 dark:border-blue-600/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <LoginHeader logo={logo} />
        <LoginForm />

        <Link
          to="/register"
          className="text-sm text-blue-600 hover:underline mt-5 block text-center"
        >
          Don't have an account? Register here.
        </Link>
      </motion.div>

      <LoginFooter />
    </div>
  );
}
