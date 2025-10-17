import { useTemporaryFileUrl } from "@/hooks/useTemporaryFileUrl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface AvatarWithTemporaryUrlProps {
  path: string | null | undefined;
  fallback: string; 
}

export function AvatarWithTemporaryUrl({ path, fallback }: AvatarWithTemporaryUrlProps) {
  const { data, isLoading, isError } = useTemporaryFileUrl(path);

  if (isLoading || isError || !data?.url) {
    return (
      <Avatar>
        <AvatarFallback>
          {fallback || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar>
      <AvatarImage src={data.url} alt="Avatar" />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}