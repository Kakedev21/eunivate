import User from "../../models/Client/userModels.js";
import bcrypt from 'bcrypt';




// Update user information
export const updateUser = async (req, res) => {
  const { id } = req.params;  // User ID passed as a parameter
  const { firstName, lastName, email, phoneNumber, username, profilePicture } = req.body;

  try {
      const updatedUser = await User.findByIdAndUpdate(
          id,
          { firstName, lastName, email, phoneNumber, username, profilePicture },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ user: updatedUser });
  } catch (error) {
      res.status(500).json({ message: 'Error updating user information', error });
  }
};




        export const updateUserPassword = async (req, res) => {
          const { id } = req.params;  // User ID passed as a parameter
          const { newPassword } = req.body; // New password from the request body

          try {
            const user = await User.findById(id);

            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedNewPassword;
            await user.save();

            res.status(200).json({ message: 'Password updated successfully' });
          } catch (error) {
            console.error('Error updating password:', error.message);
            res.status(500).json({ message: 'Error updating password', error: error.message });
          }
        };
