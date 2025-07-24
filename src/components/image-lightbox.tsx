'use client';

import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
  onDelete: () => void;
  isOpen: boolean;
}

export function ImageLightbox({ imageUrl, onClose, onDelete, isOpen }: ImageLightboxProps) {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const imageRef = React.useRef<HTMLImageElement>(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onClose();
  }

  React.useEffect(() => {
    // Reset scale and position when the lightbox is closed or the image changes
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [isOpen, imageUrl]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent 
        className="bg-black/80 border-none p-0 w-screen h-screen max-w-full max-h-full flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          <Image
            ref={imageRef}
            src={imageUrl}
            alt="Receipt"
            width={1200}
            height={1600}
            onMouseDown={handleMouseDown}
            className={cn(
              "transition-transform duration-200 object-contain max-w-[90vw] max-h-[90vh]",
              isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'
            )}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          />
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Trash2 />
            <span className="sr-only">Delete Receipt</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <X />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut />
            <span className="sr-only">Zoom Out</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn />
            <span className="sr-only">Zoom In</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}