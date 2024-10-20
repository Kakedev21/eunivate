import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/SuperAdmin/AdminNavbar';
import Members_Msg from './Message/Members_Msg'; // Import Members_Msg component
import Chat from './Message/Chat'; // Import Chat component
import { FaUsers } from 'react-icons/fa'; // Import icon for the mobile sidebar
import { useWorkspace } from '../../components/SuperAdmin/workspaceContext'; // Use Workspace context

const Messages = () => {
  const { selectedWorkspace } = useWorkspace();  // Get selected workspace from context
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar
  const [invitedUsers, setInvitedUsers] = useState([]); // State for invited users
  const [loading, setLoading] = useState(true); // Loading state
  
  const toggleAccountDropdown = () => setIsAccountDropdownOpen(!isAccountDropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar for mobile

  // Callback to get invited users from Members_Msg
  const handleInvitedUsers = (users) => {
    setInvitedUsers(users); // Set the invited users to be passed into the group
    setLoading(users.length === 0); // Set loading based on fetched users
  };

  // Example group data with members from invitedUsers
  const group = {
    groupName: selectedWorkspace ? selectedWorkspace.workspaceTitle : 'No Workspace Selected',
    selectedMembers: invitedUsers,
    imagePreview: 'https://via.placeholder.com/50'
  };

  useEffect(() => {
    if (selectedWorkspace) {
      // Refetch data when workspace changes
      setLoading(false); // Stop loading when the workspace is selected
    } else {
      setLoading(true);
    }
  }, [selectedWorkspace]);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="w-full flex justify-between items-center mb-4">
        <div className="relative">
          <h1 className="text-2xl font-medium text-gray-800 hidden md:block">
            Message
          </h1>
        </div>
        <AdminNavbar 
          isAccountDropdownOpen={isAccountDropdownOpen}
          toggleAccountDropdown={toggleAccountDropdown}
        />
      </div>

      {/* Main layout with Members_Msg and Chat side by side */}
      <div className="flex flex-row gap-2">
        {/* Left side box with Members_Msg component */}
        <div className="hidden md:block bg-white w-1/4 p-4 shadow-md rounded-md">
          <Members_Msg 
            onInvitedUsersFetched={handleInvitedUsers}
            workspaceId={selectedWorkspace?._id} // Use the selected workspace ID
          />
        </div>

        {/* Mobile Icon to toggle Members_Msg as sidebar */}
        <div className="md:hidden flex items-center mb-auto">
          <button onClick={toggleSidebar} className="text-gray-800 p-2 rounded-full shadow-md bg-white">
            <FaUsers size={24} /> {/* Icon for mobile */}
          </button>
        </div>

        {/* Sidebar for mobile */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex">
            <div className="bg-white w-3/4 h-full p-4 shadow-md rounded-md">
              <Members_Msg 
                onInvitedUsersFetched={handleInvitedUsers}
                workspaceId={selectedWorkspace?._id} // Pass workspaceId to Members_Msg
              />
            </div>
            <div className="w-1/4" onClick={toggleSidebar}></div>
          </div>
        )}

        {/* Chat section */}
        <div className="bg-white w-full md:w-3/4 p-4 shadow-md rounded-md flex-grow">
          {!loading ? (
            selectedWorkspace ? (
              <Chat group={group} />
            ) : (
              <p>Please select a workspace to view the chat.</p>
            )
          ) : (
            <p>Loading chat...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
