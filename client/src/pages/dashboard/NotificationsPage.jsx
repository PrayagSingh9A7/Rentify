import { useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useNotificationStore from "../../store/notificationStore";

export default function NotificationsPage() {

    const {

        notifications,

        fetchNotifications,

        markAsRead,

        markAllAsRead,

        deleteNotification

    } = useNotificationStore();

    useEffect(() => {

        fetchNotifications();

    }, []);

    const handleRead = async(id)=>{

        const {success}=await markAsRead(id);

        if(success){

            toast.success("Marked as read");

        }

    };

    const handleDelete=async(id)=>{

        const {success}=await deleteNotification(id);

        if(success){

            toast.success("Notification deleted");

        }

    };

    return(

        <div className="max-w-7xl mx-auto px-4 py-24">

            <div className="flex items-center justify-between mb-8">

                <div>

                    <h1 className="font-display text-3xl font-bold">

                        Notifications

                    </h1>

                    <p className="text-text-muted">

                        Stay updated with booking and inquiry activity.

                    </p>

                </div>

                <button

                    onClick={markAllAsRead}

                    className="btn-secondary"

                >

                    Mark All Read

                </button>

            </div>

            <div className="card overflow-hidden">

                {

                    notifications.length===0

                    ?

                    (

                        <div className="text-center py-20">

                            No Notifications

                        </div>

                    )

                    :

                    notifications.map((item)=>(

                        <motion.div

                            key={item._id}

                            initial={{opacity:0}}

                            animate={{opacity:1}}

                            className={`p-5 border-b flex justify-between items-start ${
                                item.isRead
                                ?
                                ""
                                :
                                "bg-accent/5"
                            }`}

                        >

                            <div>

                                <h3 className="font-semibold">

                                    {item.title}

                                </h3>

                                <p className="text-sm text-text-muted mt-2">

                                    {item.message}

                                </p>

                                <p className="text-xs mt-3 text-gray-500">

                                    {new Date(item.createdAt).toLocaleString()}

                                </p>

                            </div>

                            <div className="flex gap-2">

                                {

                                    !item.isRead &&

                                    <button

                                        onClick={()=>handleRead(item._id)}

                                        className="btn-secondary"

                                    >

                                        Read

                                    </button>

                                }

                                <button

                                    onClick={()=>handleDelete(item._id)}

                                    className="bg-red-600 text-white rounded-xl px-4 py-2"

                                >

                                    Delete

                                </button>

                            </div>

                        </motion.div>

                    ))

                }

            </div>

        </div>

    );

}