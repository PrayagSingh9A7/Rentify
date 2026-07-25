import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import useNotificationStore from "../../store/notificationStore";

export default function NotificationBell() {

    const [open,setOpen]=useState(false);

    const{

        notifications,

        unreadCount,

        fetchNotifications,

        fetchUnreadCount,

        markAsRead

    }=useNotificationStore();

    useEffect(()=>{

        fetchNotifications();

        fetchUnreadCount();

    },[]);

    return(

        <div className="relative">

            <button

                onClick={()=>setOpen(!open)}

                className="relative p-2 rounded-xl hover:bg-surface-secondary"

            >

                <Bell size={22}/>

                {

                    unreadCount>0 &&

                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">

                        {unreadCount}

                    </span>

                }

            </button>

            {

                open &&

                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border z-50">

                    <div className="p-4 border-b flex justify-between">

                        <h3 className="font-semibold">

                            Notifications

                        </h3>

                        <Link

                            to="/dashboard/notifications"

                            className="text-accent text-sm"

                        >

                            View All

                        </Link>

                    </div>

                    {

                        notifications.length===0

                        ?

                        <div className="p-8 text-center">

                            No Notifications

                        </div>

                        :

                        notifications.slice(0,5).map((item)=>(

                            <div

                                key={item._id}

                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                                    !item.isRead && "bg-accent/5"
                                }`}

                                onClick={()=>markAsRead(item._id)}

                            >

                                <p className="font-semibold">

                                    {item.title}

                                </p>

                                <p className="text-sm text-gray-500 mt-1">

                                    {item.message}

                                </p>

                            </div>

                        ))

                    }

                </div>

            }

        </div>

    );

}