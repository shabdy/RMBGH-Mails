// src/pages/announcement/inbox/components/RecipientsModal.jsx

import { useMemo, useState } from "react";
import { Users, Building2, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
      {initials}
    </div>
  );
}

export function RecipientsModal({
  open,
  onClose,
  recipients = [],
}) {
  const [search, setSearch] = useState("");

  const normalizedRecipients = useMemo(() => {
    if (!Array.isArray(recipients)) return [];

    return recipients.map((recipient, index) => {
      if (typeof recipient === "string") {
        return {
          id: index,
          name: recipient,
          department: "",
          email: "",
        };
      }

      return {
        id: recipient.id ?? index,
        name: recipient.name ?? "Unknown User",
        department:
          recipient.department ??
          recipient.dept ??
          "",
        email: recipient.email ?? "",
      };
    });
  }, [recipients]);

  const filteredRecipients = useMemo(() => {
    const term = search.toLowerCase();

    return normalizedRecipients.filter((r) => {
      return (
        r.name.toLowerCase().includes(term) ||
        r.department.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term)
      );
    });
  }, [normalizedRecipients, search]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
          setSearch("");
        }
      }}
    >
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl p-0">
        {/* HEADER */}
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />

            <span>Recipients</span>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
              {normalizedRecipients.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* SEARCH */}
        <div className="border-b px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        {/* BODY */}
        <div className="max-h-[500px] overflow-y-auto px-5 py-4">
          {filteredRecipients.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />

              <p className="text-sm text-slate-400">
                No recipients found
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
                >
                  <Avatar name={recipient.name} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {recipient.name}
                    </p>

                    {(recipient.department ||
                      recipient.email) && (
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                        {recipient.department && (
                          <>
                            <Building2 className="h-3 w-3" />
                            <span>
                              {recipient.department}
                            </span>
                          </>
                        )}

                        {recipient.department &&
                          recipient.email && (
                            <span>•</span>
                          )}

                        {recipient.email && (
                          <span>{recipient.email}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RecipientsModal;