import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChevronDown,
  faChevronUp,
  faTrash,
  faCaretDown,
  faCaretUp,
  faBox, // for Products
  faCartPlus, // for Add Product
  faFolderPlus, // for Add Project
  faCalendarPlus, // for Add Event
  faCalendar, // for Events Admin
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useWorkspace } from "./workspaceContext";
import "../../components/SuperAdmin/Css/SideNav.css"; // Ensure this file exists

import {
  dashboard_logo,
  dashboard_sidenav_icon,
  activity_red,
  dashboard_red,
  messages_red,
  people_red,
  project_red,
  settings_red,
  task_red,
  activity_icon,
  messages_icon,
  people_icon,
  project_icon,
  settings_icon,
  task_icon,
} from "../../../constants/assets";

const SideNav = ({ isNavOpen }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace();

  const handleWorkspaceSelect = (workspace) => {
    setSelectedWorkspace(workspace);
    setIsDropdownOpen(false);

    // Store workspace details in localStorage
    localStorage.setItem("currentWorkspaceId", workspace._id);
    localStorage.setItem("currentWorkspaceTitle", workspace.workspaceTitle);

    navigate(
      `/superadmin/dashboard?workspaceId=${workspace._id}&workspaceTitle=${workspace.workspaceTitle}`
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const workspaceId = params.get("workspaceId");
    const workspaceTitle = params.get("workspaceTitle");

    if (workspaceId && workspaceTitle) {
      setSelectedWorkspace({ _id: workspaceId, workspaceTitle });
    } else {
      // Check if there's a workspace saved in localStorage
      const storedWorkspaceId = localStorage.getItem("currentWorkspaceId");
      const storedWorkspaceTitle = localStorage.getItem(
        "currentWorkspaceTitle"
      );

      if (storedWorkspaceId && storedWorkspaceTitle) {
        setSelectedWorkspace({
          _id: storedWorkspaceId,
          workspaceTitle: storedWorkspaceTitle,
        });
      }
    }

    const fetchWorkspaces = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.accessToken) {
        setError("User is not authenticated.");
        return;
      }

      try {
        const response = await axios.get(
          "https://eunivate-jys4.onrender.com/api/users/workspaces",
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }
        );

        if (response.status === 200) {
          setWorkspaces(response.data);
        } else {
          setError("Failed to load workspaces");
        }
      } catch (err) {
        setError();
      }
    };

    fetchWorkspaces();
  }, [location.search, setSelectedWorkspace]);

  const closeModal = () => {
    setIsModalOpen(false);
    setWorkspaceTitle("");
    setError("");
    setAlertMessage("");
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();

    if (!workspaceTitle.trim()) {
      setError("Workspace title is required");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const accessToken = user ? user.accessToken : null;

    if (!accessToken) {
      setError("No access token found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        "https://eunivate-jys4.onrender.com/api/users/workspace",
        { workspaceTitle },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 201) {
        const newWorkspace = response.data;
        localStorage.setItem("currentWorkspaceId", newWorkspace._id);

        setAlertMessage("Workspace created successfully!");
        closeModal();
        setWorkspaces([...workspaces, newWorkspace]);

        navigate(
          `/superadmin/dashboard?workspaceId=${newWorkspace._id}&workspaceTitle=${newWorkspace.workspaceTitle}`
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        "An error occurred while creating the workspace";

      if (errorMessage.includes("duplicate key error")) {
        alert(
          "A workspace with this title already exists. Please choose a different title."
        );
      } else {
        console.error("Error creating workspace:", errorMessage);
        setError(errorMessage);
      }
    }
  };

  const handleDeleteWorkspace = async (workspaceTitle, workspaces) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const accessToken = user?.accessToken;

    if (!accessToken) {
      alert("No access token found. Please log in again.");
      return;
    }

    // Find workspace by title
    const workspace = workspaces.find(
      (w) => w.workspaceTitle === workspaceTitle
    );
    if (!workspace) {
      alert("Workspace not found.");
      return;
    }

    try {
      const response = await axios.delete(
        `https://eunivate-jys4.onrender.com/api/users/workspaces/${workspace._id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 200) {
        alert("Workspace deleted successfully!");

        setWorkspaces((prevWorkspaces) =>
          prevWorkspaces.filter((w) => w._id !== workspace._id)
        );
        window.location.reload();

        // Clear selected workspace if deleted
        if (selectedWorkspace?._id === workspace._id) {
          setSelectedWorkspace(null);
          localStorage.removeItem("currentWorkspaceId");
          localStorage.removeItem("currentWorkspaceTitle");
        }
      }
    } catch (error) {
      console.error(
        "Error deleting workspace:",
        error.response?.data?.error || error.message
      );
      alert("Failed to delete workspace.");
    }
  };

  const mainNavItems = [
    {
      to: "dashboard",
      text: "Dashboard",
      icon: dashboard_sidenav_icon,
      hoverIcon: dashboard_red,
    },
    {
      to: "project",
      text: "Project",
      icon: project_icon,
      hoverIcon: project_red,
    },
    {
      to: "task",
      text: "My Task",
      icon: task_icon,
      hoverIcon: task_red,
    },
    {
      to: "activity",
      text: "Activity",
      icon: activity_icon,
      hoverIcon: activity_red,
    },
    {
      to: "people",
      text: "People",
      icon: people_icon,
      hoverIcon: people_red,
    },
    {
      to: "messages",
      text: "Messages",
      icon: messages_icon,
      hoverIcon: messages_red,
    },
    {
      to: "settings",
      text: "Settings",
      icon: settings_icon,
      hoverIcon: settings_red,
    },
  ];

  const adminNavItems = [
    {
      to: "products",
      text: "Products",
      icon: faBox,
    },
    {
      to: "admin-products/add",
      text: "Add Product",
      icon: faCartPlus,
    },
    {
      to: "admin-projects/add",
      text: "Add Project",
      icon: faFolderPlus,
    },
    {
      to: "admin-events/add",
      text: "Add Event",
      icon: faCalendarPlus,
    },
    {
      to: "events-admin",
      text: "Events Admin",
      icon: faCalendar,
    },
  ];

  return (
    <div
      className={`side-nav-admin h-full bg-red-750 shadow-lg transition-transform transform ${
        isNavOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:w-[250px] z-30 w-[250px] flex flex-col`}
    >
      {/* Logo section */}
      <div className="dashboard-logo flex items-center p-4">
        <img src={dashboard_logo} alt="EUnivate Logo" className="h-7 mr-3" />
        <h2 className="text-lg font-bold text-white mt-3">EUnivate</h2>
      </div>

      {/* Main navigation section - make it scrollable if needed */}
      <div className="flex-1 overflow-y-auto">
        <ul className="list-none p-0">
          {/* Main nav items */}
          {mainNavItems.map((item, index) => (
            <li className="mb-2" key={index}>
              <Link
                to={item.to}
                className="group relative flex items-center p-2 bg-red-750 hover:bg-red-700 rounded-md transition-all"
              >
                <img
                  src={item.icon}
                  alt={`${item.text} Icon`}
                  className="absolute h-5 group-hover:hidden"
                />
                <img
                  src={item.hoverIcon}
                  alt={`${item.text} Icon Red`}
                  className="absolute h-5 hidden group-hover:block -translate-y-1"
                />
                <span className="ml-10 text-red-750 group-hover:text-red-750">
                  {item.text}
                </span>
              </Link>
            </li>
          ))}

          {/* Admin controls section */}
          <li className="mb-2">
            <button
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
              className="w-full group relative flex items-center justify-between p-2 bg-red-750 hover:bg-red-700 rounded-md transition-all"
            >
              <div className="flex items-center">
                <img
                  src={settings_icon}
                  alt="Admin Icon"
                  className="absolute h-5 group-hover:hidden"
                />
                <img
                  src={settings_red}
                  alt="Admin Icon Red"
                  className="absolute h-5 hidden group-hover:block -translate-y-1"
                />
                <span className="ml-10 text-red-750 group-hover:text-red-750">
                  Admin Controls
                </span>
              </div>
              <FontAwesomeIcon
                icon={isAdminMenuOpen ? faCaretUp : faCaretDown}
                className="text-red-750 group-hover:text-red-750 mr-2"
              />
            </button>

            {isAdminMenuOpen && (
              <ul className="ml-4 mt-2">
                {adminNavItems.map((item, index) => (
                  <li className="mb-2" key={index}>
                    <Link
                      to={item.to}
                      className="group relative flex items-center p-2 bg-red-750 hover:bg-red-700 rounded-md transition-all"
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className="absolute h-5 text-red-750 group-hover:text-red-700"
                      />
                      <span className="ml-10 text-red-750 group-hover:text-red-750">
                        {item.text}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </div>

      {/* Workspace section - will stay at bottom */}
      <div className="mt-auto p-4 text-white bg-red-750">
        <p className="font-size mb-2">
          Workspace
          <button onClick={() => setIsModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} className="faPlusWorkspace ml-2" />
          </button>
        </p>

        <div className="workspaceSelect relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="workspaceDropdown flex items-center justify-between bg-transparent text-white w-full"
          >
            <span className="truncate">
              {selectedWorkspace
                ? selectedWorkspace.workspaceTitle
                : "Select Workspace"}
            </span>
            <FontAwesomeIcon
              icon={isDropdownOpen ? faChevronUp : faChevronDown}
              className="faChevronWS ml-2"
            />
          </button>

          {isDropdownOpen && (
            <ul className="workspaceList absolute z-[100] bottom-full mb-2 bg-white text-black shadow max-h-48 overflow-y-auto rounded w-full">
              {workspaces.length > 0 ? (
                workspaces.map(
                  (workspace) => (
                    console.log("Workspace:", workspace),
                    (
                      <li
                        key={workspace._id}
                        className="flex items-center justify-between p-2 hover:bg-gray-400 cursor-pointer"
                      >
                        <span onClick={() => handleWorkspaceSelect(workspace)}>
                          {workspace.workspaceTitle}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering workspace selection
                            handleDeleteWorkspace(
                              workspace.workspaceTitle,
                              workspaces
                            ); // Pass workspaces explicitly
                          }}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete Workspace"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </li>
                    )
                  )
                )
              ) : (
                <li className="p-2 text-gray-500">No workspaces available</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideNav;
