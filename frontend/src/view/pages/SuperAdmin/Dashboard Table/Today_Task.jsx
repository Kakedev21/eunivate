import React, { useState } from 'react';
import { FaCheckCircle, FaRegCircle, FaRegCalendarAlt, FaPaperclip, FaFlag } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import filterIcon from '../../../../assets/Filter.png';

const Today_Task = ({ projects, taskDetails, allTasks }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const getFlagColor = (priority) => {
        switch (priority) {
            case 'easy':
                return 'text-green-500';
            case 'medium':
                return 'text-yellow-500';
            case 'hard':
                return 'text-red-500';
            default:
                return 'text-gray-400';
        }
    };

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    const renderTodayTasks = () => {
        const tasksToRender = allTasks.length ? allTasks : [];

        if (tasksToRender.length === 0) return <p>No tasks for today</p>;

        return tasksToRender.map((task, index) => (
            <div key={index} className="relative flex items-start mb-4 pb-4 border-b border-gray-300">
                {task.status === 'Done' ? (
                    <FaCheckCircle className="text-green-500 text-3xl mr-3 relative top-5" />
                ) : (
                    <FaRegCircle className="text-gray-400 text-3xl mr-3 relative top-5" />
                )}
                <div className="flex-1">
                    <h3 className="text-sm text-gray-800 mb-1">{task.projectName}</h3>
                    <div className="text-gray-600 text-sm font-bold">{task.taskName}</div>
                    <div className="flex text-xs text-gray-500 mt-1">
                        <div className="flex items-center">
                            <FaRegCalendarAlt className="text-gray-400 mr-1" />
                            {task.startDate ? format(parseISO(task.startDate), 'd MMM') : 'N/A'}
                        </div>
                        <div className="ml-4 flex items-center">
                            <img src={filterIcon} alt="Objectives icon" className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">
                                {task.objectives && task.objectives.length > 0 
                                    ? `${task.objectives.length} Objective` 
                                    : '-'}
                            </span>
                            <span className="sm:hidden">{task.objectives?.length || 0}</span>
                        </div>
                        <div className="ml-4 flex items-center">
                            <FaPaperclip className="text-gray-400 mr-1" />
                            <span className="hidden sm:inline">
                                {task.attachment && task.attachment.length > 0 
                                    ? `${task.attachment.length} Attachment` 
                                    : '-'}
                            </span>
                            <span className="sm:hidden">{task.attachment?.length || 0}</span>
                        </div>
                        <div className="ml-4 flex items-center">
                            <FaFlag className={`${getFlagColor(task.priority)} mr-1`} />
                            <span className="hidden sm:inline">
                                {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'No Priority'}
                            </span>
                        </div>
                    </div>
                </div>
                {task.attachment && task.attachment.length > 0 && (
                    <div className="absolute right-0 top-0 flex space-x-2">
                        {task.attachment.map((attachment, i) => (
                            <img 
                                key={i}
                                src={attachment.url} 
                                alt="attachment preview" 
                                className="w-16 h-16 sm:w-12 sm:h-12 rounded-md object-cover border-2 border-gray-200 cursor-pointer" 
                                onClick={() => openImageModal(attachment.url)} 
                            />
                        ))}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div>
            <h2 className="text-medium font-semibold text-gray-800 mb-2">Today Task</h2>
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm today-task-div">
                {renderTodayTasks()}
            </div>
            {isModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
                    <img src={selectedImage} alt="Full View" className="max-w-lg max-h-lg object-contain cursor-pointer" />
                </div>
            )}
        </div>
    );
};

export default Today_Task;
