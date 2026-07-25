import { useState } from "react";
import toast from "react-hot-toast";
import useInquiryStore from "../../store/inquiryStore";

const InquiryModal = ({ propertyId, onClose }) => {

  const createInquiry = useInquiryStore(
    state => state.createInquiry
  );

  const [message,setMessage]=useState("");

  const submit=async()=>{

      const res=await createInquiry({

          property:propertyId,

          message

      });

      if(res.success){

          toast.success("Inquiry Sent");

          onClose();

      }else{

          toast.error(res.message);

      }

  }

  return(

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

<div className="w-full max-w-md rounded-2xl bg-slate-900 p-6">

<h2 className="mb-5 text-xl font-bold">

Contact Owner

</h2>

<textarea

rows={5}

value={message}

onChange={(e)=>setMessage(e.target.value)}

className="w-full rounded-xl border bg-slate-800 p-3"

/>

<button

onClick={submit}

className="mt-4 w-full rounded-xl bg-violet-600 py-3"

>

Send Inquiry

</button>

</div>

</div>

)

}

export default InquiryModal;