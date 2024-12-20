import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronDown,
  faQuestionCircle,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import logomobile from "../../../assets/logomobile.png"; // Correct image import
import { searchOptions } from "./Search/SearchContext"; // Import the search options
import TutorialModal from "./TutotialModal"; // Import the TutorialModal
import "./Css/Search.css";
import axios from "axios";

const AdminNavbar = ({ isAccountDropdownOpen, toggleAccountDropdown }) => {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    profilePicture: { url: "" },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [clickedOption, setClickedOption] = useState(""); // Track the clicked search option
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const navigate = useNavigate();
  const defaultProfilePicture =
    "https://res.cloudinary.com/dzxzc7kwb/image/upload/v1725974053/DefaultProfile/qgtsyl571c1neuls9evd.png";
  const dropdownRef = useRef();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [loadingNotification, setLoadingNotification] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isAccountDropdownOpen) {
          toggleAccountDropdown();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountDropdownOpen]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get the stored user data and access token
        const storedUser = JSON.parse(localStorage.getItem("user"));

        console.log(storedUser);

        if (!storedUser || !storedUser.accessToken) {
          console.log("No user or token found");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${storedUser.accessToken}`, // Use the token from storedUser
            "Content-Type": "application/json",
          },
        };

        // First, get user notifications
        const notificationsRes = await axios.get(
          "https://eunivate-r6ql.onrender.com/api/users/user-notifications",
          config
        );
        console.log("Notifications response:", notificationsRes);

        // Then, get unread count
        const unreadCountRes = await axios.get(
          "https://eunivate-r6ql.onrender.com/api/users/unread-count",
          config
        );
        console.log("Unread count response:", unreadCountRes);

        // Make sure we're accessing the data correctly
        if (notificationsRes.data.status === "success") {
          const notifications = notificationsRes.data.data.notifications;
          console.log("Setting notifications:", notifications);
          setNotifications(notifications || []); // Ensure we always set an array
        }

        if (unreadCountRes.data.status === "success") {
          const count = unreadCountRes.data.data.unreadCount;
          console.log("Setting unread count:", count);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error(
          "Error fetching notifications:",
          error.response?.data || error.message
        );
        if (error.response?.status === 401) {
          console.log("Unauthorized access - clearing local storage");
          localStorage.removeItem("user");
        }
      }
    };

    console.log("Starting to fetch notifications...");
    console.log(
      "Current user in localStorage:",
      JSON.parse(localStorage.getItem("user"))
    );

    fetchNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.log("No token found");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.put(
        `https://eunivate-r6ql.onrender.com/api/users/mark-as-read/${notificationId}`,
        {},
        config
      );

      if (response.data.status === "success") {
        // Update local state
        setNotifications(
          notifications.map((notif) =>
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error.response?.data || error.message
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/superadmin/settings");
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    // Filter the search options based on the query
    if (query) {
      const results = searchOptions.filter((option) =>
        option.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  };

  const handleResultClick = (result) => {
    setClickedOption(result.name); // Set the clicked option
    navigate(result.route); // Navigate to the route based on the selected result
    setSearchQuery("");
    setFilteredResults([]);

    // Optionally stop the blinking after a period (e.g., 2 seconds)
    setTimeout(() => setClickedOption(""), 2000);
  };

  const openModal = () => {
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Prevent clicking if already loading
      if (loadingNotification) return;

      setLoadingNotification(true);

      // Mark notification as read
      if (!notification.read) {
        const user = JSON.parse(localStorage.getItem("user"));
        await axios.put(
          `https://eunivate-r6ql.onrender.com/api/users/mark-as-read/${notification._id}`,
          {},
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }
        );

        // Update local state
        setNotifications(
          notifications.map((notif) =>
            notif._id === notification._id ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Navigate with delay for smooth transition
      setTimeout(() => {
        // Navigate based on notification type
        if (notification.type === "project") {
          navigate(`/superadmin/projects/${notification.relatedItem}`, {
            state: { projectId: notification.relatedItem },
          });
        }
        // Add more conditions here for other notification types

        // Close the notifications dropdown and reset loading
        setIsNotificationDropdownOpen(false);
        setLoadingNotification(false);
      }, 3000);
    } catch (error) {
      console.error("Error handling notification click:", error);
      setLoadingNotification(false);
    }
  };

  return (
    <>
      {/* Mobile Image */}
      <div className="lg:hidden inset-x-0 top-0 ml-16">
        <img
          src={logomobile} // Use the imported image here
          alt="Centered Image"
          className="w-40 h-18 mx-auto"
        />
      </div>

      {/* Admin Navbar */}
      <div className="flex items-center space-x-9 p-0 relative ">
        {/* Search Bar with Icon */}
        <div className="relative hidden lg:block">
          {" "}
          {/* Hide on mobile */}
          {/* Dropdown for Search Results */}
          {filteredResults.length > 0 && (
            <div
              className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 custom-scrollbar"
              style={{ maxHeight: "200px", overflowY: "scroll" }}
            >
              {" "}
              {/* Set max height and enable scrolling */}
              {filteredResults.map((result, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    clickedOption === result.name
                      ? "bg-yellow-300 animate-blink"
                      : ""
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  {result.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Mark Icon in Square Box */}
        <div className="relative hidden lg:block">
          {" "}
          {/* Add margin for spacing */}
          <div
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg cursor-pointer"
            onClick={openModal}
          >
            <FontAwesomeIcon
              icon={faQuestionCircle} // Use the question mark icon
              className="text-gray-500"
            />
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative z-50">
          <button
            onClick={() =>
              setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
            }
            className="relative p-2"
          >
            <FontAwesomeIcon icon={faBell} className="text-gray-600 text-xl" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() =>
                      !loadingNotification &&
                      handleNotificationClick(notification)
                    }
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer 
                      ${!notification.read ? "bg-blue-50" : ""} 
                      ${loadingNotification ? "opacity-50 cursor-wait" : ""}`}
                  >
                    <h4 className="font-semibold">{notification.title}</h4>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                    {loadingNotification && (
                      <div className="flex justify-center mt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div
          ref={dropdownRef}
          className="relative flex items-center cursor-pointer"
          onClick={toggleAccountDropdown}
        >
          {user.profilePicture ? (
            <img
              src={user.profilePicture.url || user.profilePicture}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <img
              src={defaultProfilePicture}
              alt="Default Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div className="hidden lg:block ml-2 font-medium text-gray-800">
            {" "}
            {/* Hide name on mobile */}
            {user.firstName} {user.lastName}
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="ml-1 text-gray-600 hidden lg:block" // Hide on mobile
          />

          {/* Account Dropdown Menu */}
          <div
            className={`absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg ${
              isAccountDropdownOpen ? "block" : "hidden"
            }`}
            style={{ top: "100%", zIndex: 10000 }}
          >
            {/* <a
              href="#"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={handleProfileClick}
            >
              Profile
            </a> */}
            <a
              href="#"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Logout
            </a>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      <TutorialModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default AdminNavbar;
