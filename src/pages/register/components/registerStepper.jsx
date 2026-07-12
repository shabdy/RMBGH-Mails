import { cn } from "@/lib/utils";
import { User, CreditCard, Home } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Account Details",
    subtitle: "Setup Account Details",
    icon: Home,
  },
  {
    id: 2,
    title: "Personal Information",
    subtitle: "Add Personal Info",
    icon: User,
  },
  {
    id: 3,
    title: "Billing",
    subtitle: "Payment Details",
    icon: CreditCard,
  },
];

export function RegisterStepper({ currentStep }) {
  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const active = currentStep === step.id;
        const completed = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center gap-4">
            <div
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-full border",
                active && "bg-black text-white",
                completed && "bg-black text-white",
                !active && !completed && "bg-gray-100 text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="hidden md:block">
              <p className="font-medium">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.subtitle}</p>
            </div>

            {index !== steps.length - 1 && (
              <div className="hidden md:block w-16 h-px bg-gray-300 mx-6" />
            )}
          </div>
        );
      })}
    </div>
  );
}
