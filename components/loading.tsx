import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Loader2 className=" h-12 w-12 text-primary left-1/2 animate-spin" />
    </div>
  );
}
