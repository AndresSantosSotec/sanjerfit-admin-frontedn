import { toast } from "@/components/ui/sonner";

export const notifySuccess = (title: string) => toast.success(title);
export const notifyError = (title: string) => toast.error(title);
