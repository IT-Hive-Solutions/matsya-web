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
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/core/lib/utils";

interface Props {
  title: string;
  description: string;
  isLoading?: boolean;
  onCancel?: () => void;
  onConfirm?: (setOpen?: React.Dispatch<React.SetStateAction<boolean>>) => void;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
  triggerVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const AlertDialogWrapper = ({
  children,
  title,
  description,
  isLoading = false,
  onCancel,
  onConfirm,
  defaultOpen = false,
  className,
  triggerVariant,
}: Props) => {
  const [isOpen, setOpen] = useState<boolean>(defaultOpen);
  const handleCancel = () => {
    onCancel && onCancel();
    setOpen(false);
  };
  return (
    <AlertDialog open={isOpen} defaultOpen={defaultOpen}>
      <AlertDialogTrigger className={className} onClick={() => setOpen(true)}>
        <div className={cn(buttonVariants({ variant: triggerVariant }))}>
          {children}
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="print:hidden">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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
              <AlertDialogAction
                onClick={() => onConfirm && onConfirm(setOpen)}
              >
                Confirm
              </AlertDialogAction>
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogWrapper;
