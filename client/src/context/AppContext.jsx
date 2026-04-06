import { useAuth, useClerk, useUser } from "@clerk/react";
import { useState, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [credit, setCredit] = useState(5);
  const [image, setImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim();

  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  // ----------------------------
  // CREATE USER IN DATABASE
  // ----------------------------
  const createUserInDB = async () => {
    try {
      if (!user || !backendUrl) return false;

      const payload = {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        photo: user.imageUrl || "",
      };

      const { data } = await axios.post(`${backendUrl}/api/user/create`, payload);

      console.log("Create User Response:", data);

      return data?.success === true;
    } catch (error) {
      console.log("Create User Error:", error?.response?.data || error.message);
      return false;
    }
  };

  // ----------------------------
  // LOAD USER CREDITS
  // ----------------------------
  const loadCreditsData = async () => {
    try {
      if (!isSignedIn || !user) return;
      if (!backendUrl) {
        toast.error("Backend URL missing");
        return;
      }

      await createUserInDB();

      const token = await getToken();

      const { data } = await axios.get(`${backendUrl}/api/user/credits`, {
        headers: { token },
      });

      console.log("Credits Response:", data);

      if (data?.success) {
        setCredit(data.creditBalance ?? data.credit ?? data.credits ?? 0);
      } else {
        toast.error(data?.message || "Failed to load credits");
      }
    } catch (error) {
      console.log("Load Credits Error:", error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // ----------------------------
  // REMOVE BACKGROUND
  // ----------------------------
  const removeBg = async (uploadedImage) => {
    try {
      if (!isSignedIn) {
        return openSignIn();
      }

      if (!uploadedImage) {
        return toast.error("Please select an image");
      }

      if (!backendUrl) {
        return toast.error("Backend URL missing");
      }

      setLoading(true);
      setImage(uploadedImage);
      setResultImage(null);
      navigate("/result");

      // ensure user exists in DB
      const userCreated = await createUserInDB();

      if (!userCreated) {
        toast.error("User creation failed");
        setLoading(false);
        return;
      }

      const token = await getToken();

      const formData = new FormData();
      formData.append("image", uploadedImage);

      const { data } = await axios.post(
        `${backendUrl}/api/image/remove-bg`,
        formData,
        {
          headers: {
            token,
          },
        }
      );

      console.log("Remove BG Response:", data);

      if (data?.success) {
        setResultImage(data.resultImage);

        if (data.creditBalance !== undefined) {
          setCredit(data.creditBalance);
        }

        toast.success(data.message || "Background removed successfully");
      } else {
        toast.error(data?.message || "Background remove failed");

        if (data?.creditBalance !== undefined) {
          setCredit(data.creditBalance);
        }

        if (data?.creditBalance === 0) {
          navigate("/buy");
        }
      }
    } catch (error) {
      console.log("Remove BG Error:", error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // RESET IMAGE STATE
  // ----------------------------
  const clearImageState = () => {
    setImage(null);
    setResultImage(null);
    setLoading(false);
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
    clearImageState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;