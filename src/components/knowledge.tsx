"use client";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { formatCardNumber, type TarotCard } from "@/data/cards";
import { Artwork } from "./artwork";

export function Knowledge({
  card,
  onClose,
}: {
  card: TarotCard | null;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open={!!card}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="knowledge-backdrop" />
        <Dialog.Viewport className="knowledge-viewport" data-lenis-prevent>
          <Dialog.Popup className="knowledge-panel">
            <div className="dialog-toolbar">
              <span className="eyebrow">
                {card
                  ? `${card.group} · ${formatCardNumber(card.number)}`
                  : "Kiến thức lá bài"}
              </span>
              <Dialog.Close className="modal-close" aria-label="Đóng kiến thức">
                <X size={22} />
              </Dialog.Close>
            </div>
            {card ? (
              <>
                <Dialog.Title className="knowledge-title">
                  {card.concept}
                </Dialog.Title>
                <Dialog.Description className="knowledge-subtitle">
                  {card.name} · Một lăng kính để suy ngẫm
                </Dialog.Description>
                <div className="knowledge-art">
                  <Artwork card={card} />
                </div>
                <div className="keyword-list">
                  {card.keywords.map((k) => (
                    <span key={k}>{k}</span>
                  ))}
                </div>
                <dl className="knowledge-details">
                  {[
                    [
                      "Góc nhìn có thể phát huy · Lá xuôi",
                      card.uprightFramework,
                    ],
                    ["Điểm mù cần kiểm tra · Lá ngược", card.reversedFramework],
                    ["Nội dung lý thuyết", card.definition],
                    ["Ví dụ liên hệ đời sống", card.realLifeExample],
                    ["Ý nghĩa phương pháp luận", card.methodologicalMeaning],
                    ["Sai lầm thường gặp", card.commonMistake],
                    ["Câu hỏi tự suy ngẫm", card.reflection],
                    [
                      "Nội dung liên quan trong môn học",
                      `${card.group} · ${card.concept}`,
                    ],
                  ].map(([title, text]) => (
                    <div key={title}>
                      <dt>{title}</dt>
                      <dd>{text}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <Dialog.Title>Kiến thức lá bài</Dialog.Title>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
