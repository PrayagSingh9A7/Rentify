import { CalendarDays } from "lucide-react";

const BookingButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
     className="flex items-center justify-center gap-2 w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95"
    >
      <CalendarDays size={20} />
      Schedule Visit
    </button>
  );
};

export default BookingButton;