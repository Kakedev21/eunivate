import React, { useState } from 'react';
import tutImage1 from '../../../assets/Tutorial/tut1.png'; // Import tutorial images
import tutImage2 from '../../../assets/Tutorial/tut2.png';
import tutImage3 from '../../../assets/Tutorial/tut3.png'; // Example additional image
import tutImage4 from '../../../assets/Tutorial/tut4.png'; // Example additional image
import tutImage5 from '../../../assets/Tutorial/tut5.png'; // Example additional image
import tutImage6 from '../../../assets/Tutorial/tut6.png'; // Example additional image
import tutImage7 from '../../../assets/Tutorial/tut7.png'; // Example additional image
import tutImage8 from '../../../assets/Tutorial/tut8.png'; // Example additional image

const tutorialSteps = [
  {
    text: "This is the first tutorial step. You can add instructions or information here.",
    images: [tutImage1], // Single image for the first step
  },
  {
    text: "This is the second tutorial step. Here you can explain the next part of your application.",
    images: [tutImage2, tutImage3], // Two images for the second step
  },
  {
    text: "This is the third tutorial step. Here you can explain the next part of your application.",
    images: [tutImage4], // Single image for the third step
  },
  {
    text: "This is the fourth tutorial step. Here you can explain the next part of your application.",
    images: [tutImage5, tutImage6], // Images for the fourth step
  },
  {
    text: "This is the fifth tutorial step. Here you can explain the next part of your application.",
    images: [tutImage7, tutImage8], // Images for the fifth step
  },
];

const TutorialModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    // Move to the next step or close the modal if at the last step
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(); // Close modal if last step is reached
    }
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black opacity-50 absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-4 z-10 relative">
        <h2 className="text-lg font-semibold mb-4">Tutorial</h2>
        <p>{currentTutorial.text}</p>
        
        {/* Images below the paragraph */}
        <div className="flex justify-center mt-4"> {/* Flex container for centering images */}
          {currentTutorial.images.map((image, index) => (
            <div className="flex items-center justify-center mx-2 bg-black p-2" key={index}> {/* Centering and black background for images */}
              <img 
                src={image} // Use the current tutorial images
                alt={`Tutorial step ${currentStep + 1} image ${index + 1}`} 
                className={`rounded ${currentStep === 0 || currentStep === 2 ? 'w-96' : 'w-60'} h-auto`} // Larger width for tutImage1 and tutImage3
              />
            </div>
          ))}
        </div>

        {/* Close Button (X) */}
        <button
          className="absolute top-0 right-2 text-gray-600 hover:text-gray-900 text-2xl p-2" // Increased font size and added padding
          onClick={onClose}
        >
          &times; {/* HTML entity for multiplication sign (X) */}
        </button>

        {/* Previous and Next buttons */}
        <div className="flex justify-between mt-4">
          <button 
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded" 
            onClick={() => setCurrentStep(currentStep > 0 ? currentStep - 1 : 0)} // Allow going back
            disabled={currentStep === 0} // Disable if on the first step
          >
            Previous
          </button>
          <button className="bg-red-700 text-white px-4 py-2 rounded" onClick={handleNext}>
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
