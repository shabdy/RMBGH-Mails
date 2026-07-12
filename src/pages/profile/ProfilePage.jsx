import { useState, useContext } from "react";
import {
  User, Mail, Building2, Shield, Camera,
  Lock, Eye, EyeOff, CheckCircle, Loader2, Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/authContext";
import { toast } from "sonner";
import api from "@/services/apiClient";
import { getRoleConfig } from "@/config/roleConfig";

const STATUS_COLORS = {
  Active:   "bg-green-100 text-green-700",
  Pending:  "bg-amber-100 text-amber-700",
  Inactive: "bg-muted text-muted-foreground",
};

function FieldGroup({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {Icon && <Icon size={13} className="text-muted-foreground" />}
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useContext(AuthContext);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName,  setLastName]  = useState(user?.lastName  || "");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [imageFile, setImageFile]       = useState(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const passwordValid =
    newPw.length >= 8 &&
    /[A-Z]/.test(newPw) &&
    /[a-z]/.test(newPw) &&
    /\d/.test(newPw) &&
    /[@$!%*?&.#_\-]/.test(newPw);

  const initials     = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?";
  const AVATAR_COLORS = [
    "bg-blue-500","bg-violet-500","bg-green-500","bg-amber-500","bg-pink-500","bg-teal-500",
  ];
  const avatarColor = AVATAR_COLORS[(user?.email || "").charCodeAt(0) % AVATAR_COLORS.length];

  /* ── Save profile ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch(`/users/${user.id}`, { firstName, lastName, profileImage });
      updateUser(data);
      setSaved(true);
      toast.success("Profile updated");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Unable to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setProfileImage(reader.result); setImageFile(file); };
    reader.readAsDataURL(file);
  };

  /* ── Change password ── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPw) return toast.error("Enter your current password");
    if (!passwordValid) return toast.error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    if (newPw !== confirmPw) return toast.error("Passwords do not match");

    setPwSaving(true);
    try {
      await api.patch(`/users/${user.id}/password`, { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto py-8 px-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information and password</p>
      </div>

      {/* ── Profile card ── */}
      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden">

        {/* Avatar banner */}
        <div className="h-24 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600" />

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-6">
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl overflow-hidden border-4 border-background shadow ${!profileImage ? avatarColor : ""}`}>
                {profileImage ? (
                  <img key={profileImage} src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shadow-lg transition">
                <Camera size={15} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <div className="mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getRoleConfig(user?.role).class}`}>
                  {getRoleConfig(user?.role).label}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[user?.status] || ""}`}>
                  {user?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Read-only meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Building2 size={14} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Department</p>
                <p className="text-sm font-medium text-foreground">{user?.department || "—"}</p>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="First Name" icon={User}>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
              </FieldGroup>
              <FieldGroup label="Last Name" icon={User}>
                <Input value={lastName}  onChange={e => setLastName(e.target.value)}  placeholder="Last name" />
              </FieldGroup>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="min-w-[120px]">
                {saving ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : saved ? (
                  <CheckCircle size={14} className="mr-1 text-green-300" />
                ) : (
                  <Save size={14} className="mr-1" />
                )}
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Change password card ── */}
      <div className="bg-background border rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Lock size={15} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
            <p className="text-xs text-muted-foreground">Must be at least 8 characters with uppercase, lowercase, number and special character</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">

          {/* Current Password */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Current Password</label>
            <div className="relative">
              <Input
                type={showCur ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCur(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">New Password</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                onFocus={() => setShowRequirements(true)}
                onBlur={() => { if (!newPw) setShowRequirements(false); }}
                placeholder="Minimum 8 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {showRequirements && !passwordValid && (
              <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 mb-2">
                  Password Requirements
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <div className={`flex items-center gap-1 ${newPw.length >= 8 ? "text-green-600" : "text-muted-foreground"}`}>
                    <CheckCircle size={11} /><span>8+ chars</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[A-Z]/.test(newPw) ? "text-green-600" : "text-muted-foreground"}`}>
                    <CheckCircle size={11} /><span>Uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[a-z]/.test(newPw) ? "text-green-600" : "text-muted-foreground"}`}>
                    <CheckCircle size={11} /><span>Lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/\d/.test(newPw) ? "text-green-600" : "text-muted-foreground"}`}>
                    <CheckCircle size={11} /><span>Number</span>
                  </div>
                  <div className={`flex items-center gap-1 col-span-2 ${/[@$!%*?&.#_\-]/.test(newPw) ? "text-green-600" : "text-muted-foreground"}`}>
                    <CheckCircle size={11} /><span>Special Character</span>
                  </div>
                </div>
              </div>
            )}

            {newPw && passwordValid && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                <CheckCircle size={14} /><span>Strong password</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Confirm Password</label>
            <div className="relative">
              <Input
                type={showCon ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCon(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCon ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {confirmPw && (
              <div className={`mt-2 flex items-center gap-2 text-xs ${newPw === confirmPw ? "text-green-600" : "text-red-500"}`}>
                <CheckCircle size={12} />
                <span>{newPw === confirmPw ? "Passwords match" : "Passwords do not match"}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={pwSaving || !passwordValid || newPw !== confirmPw}
              className="min-w-[140px]"
            >
              {pwSaving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Lock size={14} className="mr-1" />}
              Update Password
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
