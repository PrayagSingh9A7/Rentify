import { useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useBookingStore from "../../store/bookingStore";

export default function OwnerBookingsPage() {

    const {

        ownerBookings,

        fetchOwnerBookings,

        approveBooking,

        rejectBooking,

        completeBooking,

        loading,

        error

    } = useBookingStore();

    useEffect(() => {

        fetchOwnerBookings();

    }, [fetchOwnerBookings]);

    return (

        <div className="max-w-7xl mx-auto px-4 py-24">

            <div className="mb-8">

                <h1 className="font-display text-3xl font-bold">

                    Booking Requests

                </h1>

                <p className="text-text-muted">

                    Manage all property visit requests.

                </p>

            </div>

            <div className="card overflow-hidden">

                {

                    loading

                        ?

                        (

                            <div className="text-center py-20">

                                Loading booking requests...

                            </div>

                        )

                        :

                    error

                        ?

                        (

                            <div className="text-center py-20 text-red-600">

                                {error}

                            </div>

                        )

                        :

                    ownerBookings.length === 0

                        ?

                        (

                            <div className="text-center py-20">

                                No Booking Requests

                            </div>

                        )

                        :

                        ownerBookings.map((booking) => (

                            <motion.div

                                key={booking._id}

                                initial={{ opacity: 0 }}

                                animate={{ opacity: 1 }}

                                className="flex items-center justify-between p-5 border-b"

                            >

                                <div>

                                    <h3 className="font-semibold">

                                        {booking.tenant?.name}

                                    </h3>

                                    <p className="text-sm text-gray-500">

                                        {booking.property?.title}

                                    </p>

                                    <p className="text-xs mt-1">

                                        Visit :

                                        {" "}

                                        {

                                            new Date(

                                                booking.visitDate

                                            ).toLocaleDateString()

                                        }

                                    </p>

                                    <span className="badge mt-2">

                                        {booking.status}

                                    </span>

                                </div>

                                <div className="flex gap-2">

                                    {

                                        booking.status === "pending"

                                        &&

                                        <>

                                            <button

                                                onClick={async () => {

                                                    await approveBooking(

                                                        booking._id

                                                    );

                                                    toast.success("Approved");

                                                }}

                                                className="btn-primary"

                                            >

                                                Approve

                                            </button>

                                            <button

                                                onClick={async () => {

                                                    await rejectBooking(

                                                        booking._id

                                                    );

                                                    toast.success("Rejected");

                                                }}

                                                className="bg-red-600 text-white rounded-xl px-4"

                                            >

                                                Reject

                                            </button>

                                        </>

                                    }

                                    {

                                        booking.status === "approved"

                                        &&

                                        <button

                                            onClick={async () => {

                                                await completeBooking(

                                                    booking._id

                                                );

                                                toast.success("Completed");

                                            }}

                                            className="bg-blue-600 text-white rounded-xl px-4"

                                        >

                                            Complete

                                        </button>

                                    }

                                </div>

                            </motion.div>

                        ))

                }

            </div>

        </div>

    );

}
