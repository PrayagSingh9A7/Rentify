import { MessageCircle } from "lucide-react";

const InquiryButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full rounded-xl border border-violet-500 px-5 py-3 text-violet-400 transition hover:bg-violet-600 hover:text-white"
    >
      <MessageCircle size={20} />
      Contact Owner
    </button>
  );
};

export default InquiryButton;