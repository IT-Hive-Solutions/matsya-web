import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Textarea } from "../ui/textarea";

interface Props {
  title: string;
  description: string;
  isLoading?: boolean;
  onCancel?: () => void;
  onConfirm?: (
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>,
    reason?: string,
  ) => void;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

const EntryRejectionWithReason = ({
  children,
  title,
  description,
  isLoading = false,
  onCancel,
  onConfirm,
  defaultOpen = false,
  className,
}: Props) => {
  const [isOpen, setOpen] = useState<boolean>(defaultOpen);
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleCancel = () => {
    onCancel && onCancel();
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!reason) {
      setError("Rejection Reason is required!");
    }
    if (!error && reason && onConfirm) {
      onConfirm(setOpen, reason);
    }
  };
  return (
    <AlertDialog open={isOpen} defaultOpen={defaultOpen}>
      <AlertDialogTrigger className={className} onClick={() => setOpen(true)}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="print:hidden">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          <Textarea
            value={reason}
            placeholder="Enter your reason for rejection!"
            onChange={(e) => {
              const value = e.target.value;
              setReason(value);
              if (value) {
                setError("");
              }
            }}
            className={` resize-none ${error ? "border-destructive" : "border-primary"}`}
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {isLoading ? (
            <div className="w-full flex items-center justify-center">
              <Loader2 className="mr-2 w-10 h-10  text-primary  animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ">
              <AlertDialogCancel onClick={handleCancel}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => handleSubmit()}>
                Confirm
              </AlertDialogAction>
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EntryRejectionWithReason;
