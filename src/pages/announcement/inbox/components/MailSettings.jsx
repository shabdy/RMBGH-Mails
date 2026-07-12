import { Switch } from "../../../../components/ui/switch";
import { FileCheck2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../../components/ui/select";

export function MailSettings({
  enableEmailType,
  setEnableEmailType,
  enableReferenceNo,
  setEnableReferenceNo,
  emailType,
  setEmailType,
  referenceNumber,
  requiresReceipt,
  setRequiresReceipt,
}) {
  return (
    <div className="flex items-center gap-4 flex-wrap py-0.5">

      {/* ── EMAIL TYPE ── */}
      <div className="flex items-center gap-2">
        <Switch
          id="toggle-email-type"
          checked={enableEmailType}
          onCheckedChange={(v) => { setEnableEmailType(v); if (!v) setEmailType(""); }}
        />
        <label
          htmlFor="toggle-email-type"
          className="text-xs text-muted-foreground cursor-pointer select-none"
        >
          Email Type
        </label>
        {enableEmailType && (
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger className="h-7 text-xs w-36">
              <SelectValue placeholder="Select type…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="memorandum">Memorandum</SelectItem>
              <SelectItem value="office-order">Office Order</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="advisory">Advisory</SelectItem>
              <SelectItem value="notice">Notice</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {enableEmailType && (
        <>
          <div className="w-px h-4 bg-border" />

          {/* ── REFERENCE NO ── */}
          <div className="flex items-center gap-2">
            <Switch
              id="toggle-ref"
              checked={enableReferenceNo}
              onCheckedChange={setEnableReferenceNo}
            />
            <label
              htmlFor="toggle-ref"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Ref No.
            </label>
            {enableReferenceNo && referenceNumber && (
              <span className="text-xs font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                {referenceNumber}
              </span>
            )}
          </div>
        </>
      )}

      <div className="w-px h-4 bg-border" />

      {/* ── REQUIRE RECEIPT ── */}
      <div className="flex items-center gap-2">
        <Switch
          id="toggle-receipt"
          checked={requiresReceipt}
          onCheckedChange={setRequiresReceipt}
        />
        <label
          htmlFor="toggle-receipt"
          className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
        >
          <FileCheck2
            size={12}
            className={requiresReceipt ? "text-blue-600" : "text-muted-foreground"}
          />
          <span className={requiresReceipt ? "text-foreground font-medium" : "text-muted-foreground"}>
            Require Receipt
          </span>
        </label>
      </div>

    </div>
  );
}
