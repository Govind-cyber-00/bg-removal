import { useAuth, useClerk, useUser } from "@clerk/react";
import { useState, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [credit, setCredit] = useState(5);
  const [image, setImage] = useState(false);
  const [resultImage, setResultImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  // Ensure user exists in DB
  const createUserInDB = async () => {
    try {
      if (!user) return false;

      const { data } = await axios.post(backendUrl + "/api/user/create", {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        photo: user.imageUrl,
      });

      console.log("Create User Response:", data);
      return data.success;
    } catch (error) {
      console.log("Create User Error:", error.response?.data || error.message);
      return false;
    }
  };

  // Load credits
  const loadCreditsData = async () => {
    try {
      if (!isSignedIn || !user) return;

      await createUserInDB();

      const token = await getToken();

      const { data } = await axios.get(backendUrl + "/api/user/credits", {
        headers: { token },
      });

      console.log("Credits Response:", data);

      if (data.success) {
        setCredit(data.creditBalance ?? data.credit ?? data.credits ?? 0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Load Credits Error:", error.response?.data || error.message);
      toast.error(error.message);
    }
  };

  // Remove background
  const removeBg = async (uploadedImage) => {
    try {
      if (!isSignedIn) {
        return openSignIn();
      }

      if (!uploadedImage) {
        return toast.error("Please select an image");
      }

      setLoading(true);
      setImage(uploadedImage);
      setResultImage(false);
      navigate("/result");

      // ensure user exists
      await createUserInDB();

      const token = await getToken();

      const formData = new FormData();
      formData.append("image", uploadedImage);

      const { data } = await axios.post(
        backendUrl + "/api/image/remove-bg",
        formData,
        {
          headers: { token },
        }
      );

      console.log("Remove BG Response:", data);

      if (data.success) {
        setResultImage(data.resultImage);

        if (data.creditBalance !== undefined) {
          setCredit(data.creditBalance);
        }

        toast.success(data.message || "Background removed successfully");
      } else {
        toast.error(data.message);

        if (data.creditBalance !== undefined) {
          setCredit(data.creditBalance);
        }

        if (data.creditBalance === 0) {
          navigate("/buy");
        }
      }
    } catch (error) {
      console.log("Remove BG Error:", error.response?.data || error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    credit,
    setCredit,
    loadCreditsData,
    backendUrl,
    image,
    setImage,
    resultImage,
    setResultImage,
    removeBg,
    loading,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;