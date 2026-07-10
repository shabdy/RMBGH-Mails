import { CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginHeader({ logo }) {
  return (
    <CardHeader className="flex flex-col items-center space-y-3 pt-5">
      <img
        src={logo}
        alt="RMBGH Logo"
        className="w-20 h-20 rounded-full border-4 border-blue-400 object-cover shadow-md"
      />
      <CardTitle className="text-center text-lg font-semibold text-gray-800 dark:text-gray-100">
        RMBGH Portal
      </CardTitle>
    </CardHeader>
  );
}
