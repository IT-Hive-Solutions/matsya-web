"use client"
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";

type Props = {
  children: React.ReactNode;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: (setOpen: React.Dispatch<React.SetStateAction<boolean>>) => void;
  onCancel: (setOpen: React.Dispatch<React.SetStateAction<boolean>>) => void;
  variant?: "default" | "destructive";
};

function ConfirmationDialog({
  children,
  defaultOpen,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen);
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(setOpen);
    } else {
      setOpen(false);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(setOpen)}
            className={
              variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmationDialog;
