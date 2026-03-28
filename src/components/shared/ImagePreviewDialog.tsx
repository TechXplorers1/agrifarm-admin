import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  image: string;
  className?: string;
  altText?: string;
}

export function ImagePreviewDialog({ image, className = "", altText = "Image preview" }: ImagePreviewDialogProps) {
  const [open, setOpen] = useState(false);

  // Check if it's a valid URL or just an emoji/placeholder
  const isUrl = image && (image.startsWith("http") || image.startsWith("/") || image.startsWith("data:image"));

  if (!isUrl) {
    // Render emoji or simple text fallback
    return <span className={className || "text-xl"}>{image || "N/A"}</span>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="focus:outline-none transition-transform hover:scale-105 active:scale-95 group relative block overflow-hidden rounded">
          <img 
            src={image} 
            alt={altText} 
            className={`object-cover bg-muted ${className}`} 
            onError={(e) => {
              // Fallback to initial display or broken image icon if image fails to load
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-1 bg-transparent border-0 shadow-none flex justify-center items-center">
         <div className="relative rounded-lg overflow-hidden max-h-[90vh] flex items-center justify-center bg-black/20 backdrop-blur-sm p-2">
            <img 
              src={image} 
              alt={altText} 
              className="max-w-full max-h-[85vh] object-contain rounded drop-shadow-2xl" 
            />
         </div>
      </DialogContent>
    </Dialog>
  );
}
