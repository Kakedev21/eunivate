import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaCalendar,
  FaPaperclip,
  FaTrashAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Modal from "./KanbanModals/Modal";
import TaskDetailModal from "./EditableModals/TaskDetailModal"; // New modal for task details
import axios from "axios";

const ItemType = {
  TASK: "task",
};

const Kanban = ({
  projectId,
  projectName,
  setTasks: updateParentTasks,
  members,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!projectId) {
          console.error("Project ID is not defined");
          return;
        }
        const response = await axios.get(
          `https://eunivate-r6ql.onrender.com/api/users/sa-tasks/${projectId}`
        );
        setTasks(response.data.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [projectId]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenTaskDetailModal = (task) => {
    setSelectedTask(task);
    setTaskDetailModalOpen(true);
  };

  const handleCloseTaskDetailModal = () => {
    setTaskDetailModalOpen(false);
    setSelectedTask(null); // Clear selected task
  };

  const updateTaskStatus = async (taskId, newStatus, modifiedBy) => {
    try {
      // Capture the user details
      const user = JSON.parse(localStorage.getItem("user"));
      const modifiedUser = {
        username: `${user.firstName} ${user.lastName}`,
        profilePicture: user.profilePicture?.url || user.profilePicture,
      };

      // Update the task status on the server
      await axios.patch(
        `https://eunivate-r6ql.onrender.com/api/users/sa-tasks/${taskId}`,
        {
          status: newStatus,
          modifiedBy: modifiedBy,
          history: {
            modifiedBy: modifiedUser,
            modifiedAt: new Date().toISOString(),
            changes: JSON.stringify({ status: newStatus }),
          },
        }
      );

      console.log(`Task ${taskId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error; // Propagate error to handle it in moveTask
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const updatedTask = tasks.find((task) => task._id === taskId);
      if (!updatedTask) return;

      // Create new array with updated status
      const updatedTasks = tasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      );

      // Update local state
      setTasks(updatedTasks);

      // Get current user
      const user = JSON.parse(localStorage.getItem("user"));

      // Update task status on server first
      await updateTaskStatus(taskId, newStatus, user._id);

      // Calculate completion after successful status update
      const totalTasks = updatedTasks.length;
      const completedTasks = updatedTasks.filter(
        (task) => task.status === "Done" || task.status === "Changelog"
      ).length;

      // Update parent component's tasks
      updateParentTasks(updatedTasks);

      // Check if project is complete and create notifications
      if (completedTasks === totalTasks) {
        console.log("All tasks completed, creating notifications...");

        const config = {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
          },
        };

        // Get all project members including admin
        const allRecipients = [
          { _id: user._id }, // Current user (admin)
          ...members, // Project members
        ];

        console.log("Sending notifications to:", allRecipients);

        // Create notifications for all members
        for (const recipient of allRecipients) {
          try {
            const notificationData = {
              recipient: recipient._id,
              type: "project",
              title: "Project Completed",
              message: `Project "${projectName}" has been completed!`,
              relatedItem: projectId,
              itemModel: "Project",
            };

            const response = await axios.post(
              "https://eunivate-r6ql.onrender.com/api/users/create-notification",
              notificationData,
              config
            );
            console.log(
              `Notification created for ${recipient._id}:`,
              response.data
            );
          } catch (error) {
            console.error(
              `Error creating notification for ${recipient._id}:`,
              error
            );
          }
        }
      }
    } catch (error) {
      console.error("Error in moveTask:", error);
    }
  };

  const handleTaskSubmit = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  // Function to handle task update (description update)
  const handleUpdateTask = (updatedTask) => {
    const updatedTasks = tasks.map((task) =>
      task._id === updatedTask._id ? updatedTask : task
    );
    setTasks(updatedTasks); // Update the tasks array

    // Check if the updated task is the currently selected task
    if (selectedTask && selectedTask._id === updatedTask._id) {
      setSelectedTask(updatedTask); // Update selectedTask
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Send DELETE request to backend
      const response = await axios.delete(`/api/users/tasks/${taskId}`);

      // Check if the response is successful
      if (response.status === 200) {
        console.log("Task deleted successfully");
        // Optionally, update the UI (e.g., remove the task from the list)
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      // Optionally, show a user-friendly error message
    }
  };

  const Column = ({ status, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: ItemType.TASK,
      drop: (item) => moveTask(item.id, status),
      canDrop: (item) => {
        const taskItem = tasks.find((task) => task._id === item.id);
        if (!taskItem) return false;

        // Get current task status
        const currentStatus = taskItem.status;

        // Rules for Done and Changelog
        if (currentStatus === "Done") {
          // Tasks in Done can only move to Changelog
          return status === "Changelog";
        }

        if (currentStatus === "Changelog") {
          // Tasks in Changelog can only move to Done
          return status === "Done";
        }

        // Tasks in other statuses (Backlog/Todo/Ongoing)
        if (currentStatus !== "Done" && currentStatus !== "Changelog") {
          // Can move freely between Backlog/Todo/Ongoing or to Done
          return status !== "Changelog";
        }

        return false;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    const backgroundColor = isOver && canDrop ? "bg-gray-100" : "";

    return (
      <div ref={drop} className={`w-full sm:w-1/5 p-2 ${backgroundColor}`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base text-gray-600 font-bold">{status}</h2>
          <button
            onClick={handleOpenModal}
            className="text-gray-600 p-0 flex items-center justify-center"
            style={{ width: "30px", height: "30px" }}
          >
            <FaPlus size={16} />
          </button>
        </div>
        <div className="space-y-2">{children}</div>
      </div>
    );
  };

  const TaskCard = ({ task }) => {
    const [, drag] = useDrag({
      type: ItemType.TASK,
      item: { id: task._id },
    });

    const handleTaskClick = () => {
      handleOpenTaskDetailModal(task); // Open the task detail modal
    };

    const getPriorityBackgroundColor = (priority) => {
      switch (priority) {
        case "easy":
          return "bg-green-200 text-green-800";
        case "medium":
          return "bg-orange-200 text-orange-800";
        case "hard":
          return "bg-red-200 text-red-800";
        default:
          return "bg-gray-200 text-gray-800";
      }
    };

    const formatStartMonth = (startDate) => {
      if (!startDate) return "N/A";
      const date = new Date(startDate);
      return date.toLocaleString("default", { month: "short" });
    };

    const Tooltip = ({ children, title }) => {
      return (
        <div className="relative group">
          {children}
          <div
            className="absolute hidden group-hover:flex bg-gray-500 text-white text-xs rounded-md p-2 whitespace-nowrap -top-10 left-1/2 transform -translate-x-1/2"
            style={{ zIndex: 10 }}
          >
            {title}
          </div>
        </div>
      );
    };

    return (
      <div
        ref={drag}
        className="p-4 rounded-lg shadow-md bg-white relative"
        onClick={handleTaskClick}
      >
        <div className="flex items-start justify-between">
          <div
            className={`px-3 py-2 text-sm font-medium rounded-sm ${getPriorityBackgroundColor(
              task.priority
            )}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
          <div className="flex -space-x-3">
            {task.assignee &&
              task.assignee.map((member, index) => (
                <Tooltip
                  key={index}
                  title={`${member.firstName} ${member.lastName}`}
                >
                  <img
                    src={member.profilePicture?.url || member.profilePicture}
                    alt={`${member.firstName} ${member.lastName}`} // Update alt text for better accessibility
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                </Tooltip>
              ))}
          </div>
        </div>
        <div className="mt-2">
          <h2 className="text-2xl font-semibold mb-2">{task.taskName}</h2>
          <p className="text-lg text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
            {task.description}
          </p>
          {task.attachment && task.attachment.length > 0 && (
            <div className="mt-4 flex overflow-x-auto space-x-2 py-2 justify-center">
              {task.attachment.map((attachment, index) => (
                <img
                  key={index}
                  src={attachment?.url}
                  alt={`Attachment ${index + 1}`}
                  className="w-full sm:w-40 h-48 sm:h-36 object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center space-x-3 overflow-x-auto">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <FaCalendar className="text-gray-400" size={13} />
            <p className="text-xs">{formatStartMonth(task.startDate)}</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <FaPaperclip className="text-gray-400" size={13} />
            <p className="text-sm">
              {task.attachment ? task.attachment.length : 0}
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <FaCheckCircle className="text-gray-400" size={13} />
            <p className="text-sm">{task.doneObjectivesCount || 0}</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 cursor-pointer text-red-600">
            <FaTrashAlt
              size={13}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering other events
                handleDeleteTask(task._id);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-wrap p-4">
        {["Backlog", "Todo", "Ongoing", "Done", "Changelog"].map((status) => (
          <Column key={status} status={status}>
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
          </Column>
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        projectId={projectId}
        onTaskSubmit={handleTaskSubmit}
      />
      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={handleCloseTaskDetailModal}
        task={selectedTask}
        projectName={projectName} // Pass the project name here
        onUpdateTask={handleUpdateTask} // Pass the update task handler to the modal
        projectId={projectId}
      />
    </DndProvider>
  );
};

export default Kanban;
