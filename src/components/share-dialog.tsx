"use client";
import { useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import { Download, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { canShareImage, shareImage, type ShareImage } from "@/lib/share";
export function ShareDialog({
  image,
  onClose,
}: {
  image: ShareImage | null;
  onClose: () => void;
}) {
  const [sharing, setSharing] = useState(false);
  const lock = useRef(false);
  async function nativeShare() {
    if (!image || lock.current) return;
    lock.current = true;
    setSharing(true);
    try {
      const result = await shareImage(image);
      if (result === "shared")
        toast.success("Đã chuyển ảnh tới ứng dụng chia sẻ.");
      if (result === "unsupported")
        toast.info("Hãy tải ảnh PNG để chia sẻ từ thiết bị.");
    } catch {
      toast.error("Chưa chia sẻ được ảnh. Bạn có thể tải ảnh PNG bên dưới.");
    } finally {
      lock.current = false;
      setSharing(false);
    }
  }
  return (
    <Dialog.Root
      open={!!image}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="knowledge-backdrop" />
        <Dialog.Viewport className="knowledge-viewport" data-lenis-prevent>
          <Dialog.Popup className="knowledge-panel share-panel">
            <div className="dialog-toolbar">
              <span className="eyebrow">Ảnh chia sẻ</span>
              <Dialog.Close
                className="modal-close"
                aria-label="Đóng ảnh chia sẻ"
              >
                <X size={22} />
              </Dialog.Close>
            </div>
            <Dialog.Title className="knowledge-title">
              Giữ lại <em>một góc nhìn.</em>
            </Dialog.Title>
            <Dialog.Description className="fine-print">
              Ảnh 1080 × 1350. Không chứa câu hỏi hoặc luận giải riêng tư.
            </Dialog.Description>
            {image ? (
              <>
                <Image
                  src={image.url}
                  alt="Ảnh chia sẻ Tarot Biện Chứng"
                  width={1080}
                  height={1350}
                  unoptimized
                  className="share-preview"
                />
                <a
                  className="button primary"
                  href={image.url}
                  download={image.filename}
                >
                  <Download size={16} /> Tải ảnh PNG
                </a>
                {canShareImage(image) ? (
                  <button
                    className="button"
                    onClick={nativeShare}
                    disabled={sharing}
                  >
                    <Share2 size={16} /> Chia sẻ ảnh
                  </button>
                ) : null}
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
