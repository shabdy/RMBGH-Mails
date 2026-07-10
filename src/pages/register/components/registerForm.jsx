import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

const DEPARTMENTS = [
  { id: "ADMIN",   label: "Administration" },
  { id: "HR",      label: "Human Resources" },
  { id: "IT",      label: "Information Technology" },
  { id: "NUR",     label: "Nursing" },
  { id: "LAB",     label: "Laboratory" },
  { id: "PHARM",   label: "Pharmacy" },
  { id: "RAD",     label: "Radiology" },
  { id: "SURG",    label: "Surgery" },
  { id: "MED",     label: "Medical Records" },
  { id: "FIN",     label: "Finance" },
  { id: "MAINT",   label: "Maintenance" },
  { id: "SEC",     label: "Security" },
];



export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
    department: "", departmentId: "",
  });
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);
  const [errors, setErrors]               = useState({});
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setErrors(err => ({ ...err, [key]: undefined }));
  };

  const setDept = (e) => {
    const opt = DEPARTMENTS.find(d => d.id === e.target.value);
    setForm(f => ({ ...f, departmentId: opt?.id || "", department: opt?.label || "" }));
    setErrors(err => ({ ...err, department: undefined }));
  };

const validate = () => {
  const e = {};

  if (!form.firstName.trim()) {
    e.firstName = "First name is required";
  }

  if (!form.lastName.trim()) {
    e.lastName = "Last name is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.email.trim()) {
    e.email = "Email is required";
  } else if (!emailRegex.test(form.email)) {
    e.email = "Please enter a valid email address";
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-])[A-Za-z\d@$!%*?&.#_\-]{8,}$/;

  if (!form.password) {
    e.password = "Password is required";
  } else if (!passwordRegex.test(form.password)) {
    e.password =
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
  }

  if (!form.confirmPassword) {
    e.confirmPassword = "Please confirm your password";
  } else if (form.password !== form.confirmPassword) {
    e.confirmPassword = "Passwords do not match";
  }

  if (!form.departmentId) {
    e.department = "Please select your department";
  }

  setErrors(e);
  return Object.keys(e).length === 0;
};

const passwordValid =
  form.password.length >= 8 &&
  /[A-Z]/.test(form.password) &&
  /[a-z]/.test(form.password) &&
  /\d/.test(form.password) &&
  /[@$!%*?&.#_\-]/.test(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = await authService.register({
      firstName:    form.firstName.trim(),
      lastName:     form.lastName.trim(),
      email:        form.email.trim().toLowerCase(),
      password:     form.password,
      department:   form.department,
      departmentId: form.departmentId,
    });
    setLoading(false);
    if (res.success) setSuccess(true);
    else if (res.error) setErrors({ email: res.error });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center px-8 py-10 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Registration Submitted!</h3>
          <p className="text-sm text-slate-500 mt-1">
            Your account is pending approval by the administrator.<br />
            You will be notified once your account is activated.
          </p>
        </div>
        <Button className="w-full mt-2" onClick={() => navigate("/")}>
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-5 w-full max-w-md">
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" error={errors.firstName}>
          <Input value={form.firstName} onChange={set("firstName")} placeholder="Juan" className={errors.firstName ? "border-red-400" : ""} />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <Input value={form.lastName} onChange={set("lastName")} placeholder="Dela Cruz" className={errors.lastName ? "border-red-400" : ""} />
        </Field>
      </div>

      {/* Email */}
      <Field label="Email Address" error={errors.email}>
        <Input type="email" value={form.email} onChange={set("email")} placeholder="you@rmbgh.com" className={errors.email ? "border-red-400" : ""} />
      </Field>

      {/* Department */}
      <Field label="Department" error={errors.department}>
        <select
          value={form.departmentId}
          onChange={setDept}
          className={`w-full h-10 px-3 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.department ? "border-red-400" : "border-input"}`}
        >
          <option value="">Select your department</option>
          {DEPARTMENTS.map(d => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </Field>

      {/* Password */}
<Field label="Password" error={errors.password}>
  <div className="relative">
    <Input
      type={showPassword ? "text" : "password"}
      value={form.password}
      onChange={set("password")}
      onFocus={() => setShowRequirements(true)}
      onBlur={() => {
        if (!form.password) setShowRequirements(false);
      }}
      placeholder="Minimum 8 characters"
      className={`pr-10 ${errors.password ? "border-red-400" : ""}`}
    />

    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>

{showRequirements && !passwordValid && (
  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2">
    <p className="text-[10px] font-medium uppercase tracking-wide text-amber-700 mb-1.5">
      Password Requirements
    </p>

    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
      <div className={`flex items-center gap-1 ${form.password.length >= 8 ? "text-green-600" : "text-slate-400"}`}>
        <CheckCircle2 size={11} />
        <span>8+ chars</span>
      </div>

      <div className={`flex items-center gap-1 ${/[A-Z]/.test(form.password) ? "text-green-600" : "text-slate-400"}`}>
        <CheckCircle2 size={11} />
        <span>Uppercase</span>
      </div>

      <div className={`flex items-center gap-1 ${/[a-z]/.test(form.password) ? "text-green-600" : "text-slate-400"}`}>
        <CheckCircle2 size={11} />
        <span>Lowercase</span>
      </div>

      <div className={`flex items-center gap-1 ${/\d/.test(form.password) ? "text-green-600" : "text-slate-400"}`}>
        <CheckCircle2 size={11} />
        <span>Number</span>
      </div>

      <div className={`flex items-center gap-1 col-span-2 ${/[@$!%*?&.#_\-]/.test(form.password) ? "text-green-600" : "text-slate-400"}`}>
        <CheckCircle2 size={11} />
        <span>Special character</span>
      </div>
    </div>
  </div>
)}

  {form.password && passwordValid && (
    <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
      <CheckCircle2 size={14} />
      <span>Strong password</span>
    </div>
  )}
</Field>


{/* Confirm Password */}
<Field label="Confirm Password" error={errors.confirmPassword}>
  <div className="relative">
    <Input
      type={showConfirm ? "text" : "password"}
      value={form.confirmPassword}
      onChange={set("confirmPassword")}
      placeholder="Repeat your password"
      className={`pr-10 ${errors.confirmPassword ? "border-red-400" : ""}`}
    />

    <button
      type="button"
      onClick={() => setShowConfirm((v) => !v)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>

  {form.confirmPassword && (
    <div
      className={`mt-2 flex items-center gap-2 text-xs ${
        form.password === form.confirmPassword
          ? "text-green-600"
          : "text-red-500"
      }`}
    >
      <CheckCircle2 size={14} />
      <span>
        {form.password === form.confirmPassword
          ? "Passwords match"
          : "Passwords do not match"}
      </span>
    </div>
  )}
</Field>

        <Button
          type="submit"
          disabled={loading || !passwordValid}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>

      <p className="text-xs text-center text-slate-400">
        Your account will be reviewed and activated by the system administrator.
      </p>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}


 
