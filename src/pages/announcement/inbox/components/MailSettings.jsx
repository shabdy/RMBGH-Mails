import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

export function MailSettings({
  enableEmailType,
  setEnableEmailType,
  enableReferenceNo,
  setEnableReferenceNo,
  emailType,
  setEmailType,
  referenceNumber,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

      {/* EMAIL TYPE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Email Type</Label>
          <Switch checked={enableEmailType} onCheckedChange={setEnableEmailType} />
        </div>

        {enableEmailType ? (
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger className="h-11 w-full min-w-0">
              <SelectValue placeholder="Select type" />
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
        ) : (
          <div className="h-11 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
            Disabled
          </div>
        )}
      </div>

      {/* REFERENCE NUMBER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Reference No.</Label>
          <Switch checked={enableReferenceNo} onCheckedChange={setEnableReferenceNo} />
        </div>

        {enableReferenceNo ? (
          <Input
            className="h-11 w-full min-w-0 bg-muted/50"
            value={referenceNumber}
            readOnly
          />
        ) : (
          <div className="h-11 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
            Auto-generated
          </div>
        )}
      </div>

      {/* PRIORITY */}
      <div className="space-y-2">
        <Label>Priority</Label>
        <Select>
          <SelectTrigger className="h-11 w-full min-w-0">
            <SelectValue placeholder="Normal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}