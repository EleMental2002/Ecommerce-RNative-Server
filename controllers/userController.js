import userModel from "../models/userModel.js";
import cloudinary from "cloudinary"
import { getDataUri } from "../utils/features.js";


export const registerController = async (req, res) => {
    try {

        const { name, email, password, address, city, country, phone, answer } = req.body;
        //validation

        if (!name || !email || !password || !address || !city || !country || !phone || !answer) {
            return res.status(500).send({
                success: false,
                message: "Please Provide All Fields"
            })
        }
        //check existing user
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.status(500).send({
                success: false,
                message: "Email already in use"
            })
        }

        const user = await userModel.create({
            name,
            email,
            password,
            address,
            city,
            country,
            phone,
            answer
        });
        res.status(201).send({
            success: true,
            message: "Registration Success, Please login",
            user
        });



    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Register API',
            error
        })

    }
};




export const loginController = async (req, res) => {
    try {

        const { email, password } = req.body;

        //validation
        if (!email || !password) {
            return res.status(500).send({
                success: false,
                message: "Please add email or password"
            })
        }
        //check user
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            })
        }

        //check password
        const isMatch = await user.comparePassword(password)
        //validation
        if (!isMatch) {
            return res.status(500).send({
                success: false,
                message: "Invalid credentials"
            })
        }
        //token
        const token = user.generateToken();

        res.status(200).cookie("token", token, {
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            secure: process.env.NODE_ENV === "development" ? true : false,
            httpOnly: process.env.NODE_ENV === "development" ? true : false,
            sameSite: process.env.NODE_ENV === "development" ? true : false
        }).send({
            success: true,
            message: "Login successfull",
            token,
            user
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Login API',
            error
        })

    }
};


//Get user profile
export const getUserProfileController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id)
        const { password, ...rest } = user._doc;
        res.status(200).send({
            success: true,
            message: 'User profile fetched successfully',
            ...rest
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Profile API',
            error
        })
    }
};

//LOGOUT
export const logoutController = async (req, res) => {
    try {
        res.status(200).cookie("token", "", {
            expires: new Date(Date.now()),
            secure: process.env.NODE_ENV === "development" ? true : false,
            httpOnly: process.env.NODE_ENV === "development" ? true : false,
            sameSite: process.env.NODE_ENV === "development" ? true : false
        }).send({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Logout API',
            error
        })
    }
};

//update profile
export const updateProfileController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id)
        const { name, email, address, city, country, phone } = req.body;
        //validation + update
        if (name) user.name = name;
        if (email) user.email = email;
        if (address) user.address = address;
        if (city) user.city = city;
        if (country) user.country = country;
        if (phone) user.phone = phone;
        //save user
        await user.save()
        res.status(200).send({ success: true, message: "Updated successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in updateProfile API',
            error
        })
    }
};

//update user password
export const updatePasswordController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id)
        const { oldPassword, newPassword } = req.body;
        //validation
        if (!oldPassword || !newPassword) {
            return res.status(500).send({ success: false, message: "Please provide old or new password" });
        }
        //old pass check
        const isMatch = await user.comparePassword(oldPassword)
        //validation
        if (!isMatch) {
            return res.status(500).send({ success: false, message: "Invalid old password" });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).send({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in updatPassword API',
            error
        })
    }
};

// Update user profile photo
export const updateProfilePicController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id)
        // file get from client photo
        const file = getDataUri(req.file);
        //delete prev image
        await cloudinary.v2.uploader.destroy(user.profilePic.public_id)
        //update 
        const cdb = await cloudinary.v2.uploader.upload(file.content)
        user.profilePic = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        }
        //save func
        await user.save();

        res.status(200).send({ success: true, message: "Profile picture updated" });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in update profile pic API',
            error
        })
    }
};

//forgot password
export const passwordResetController = async (req, res) => {
    try {
        //userget  email || newPassword || answer
        const { email, newPassword, answer } = req.body;
        //validation
        if (!email || !newPassword || !answer) {
            return res.status(500).send({
                success: false,
                message: "Please provide all fields"
            })
        }
        //find user
        const user = await userModel.findOne({ email, answer })
        //validation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Invalid user or answer"
            })
        }
        user.password = newPassword
        await user.save();
        res.status(200).send({
            success: true,
            message: "Your password has been reset. Please login again"
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in password reset  API',
            error
        })
    }

}