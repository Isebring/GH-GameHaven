import {
  Box,
  Button,
  Container,
  Image,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import {
  EmailAuthProvider,
  User,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { MdOutlineError, MdThumbUp } from "react-icons/md";
import { TfiFaceSad } from "react-icons/tfi";
import { NavLink, useNavigate } from "react-router-dom";
import DeleteAccountModal from "../components/DeleteAccountModal";
import { ProfileImageContext } from "../context/ProfileImageContext";
import { UserContext } from "../context/UserContext";
import "../css/ProfilePage.css";
import { auth, db } from "../firebase";
import { getProfileImage, profileImages } from "../utils/ProfileImageUtility";

interface FormValues {
  name: string;
  newPassword: string;
  currentPassword: string;
}

function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedProfileImage, setSelectedProfileImage] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const { updateUser } = useContext(UserContext);
  const { updateSelectedProfileImage } = useContext(ProfileImageContext);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const navigate = useNavigate();

  const form = useForm<FormValues>({
    initialValues: {
      name: "",
      newPassword: "",
      currentPassword: "",
    },

    validate: {
      name: (val) =>
        val && val.length <= 1
          ? "Username should include at least 2 characters"
          : null,
      newPassword: (val) => {
        if (form.values.newPassword.trim() === "") {
          return null;
        }

        return val.length <= 6
          ? "Password should include at least 7 characters"
          : null;
      },
      currentPassword: (val) =>
        val.length === 0 ? "Please enter your current password." : null,
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser: User | null) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      document.title = `GH: Gamehaven - ${user.displayName || "Profile"}`;
    } else {
      document.title = "GH: Gamehaven - Profile";
    }
  }, [user]);

  useEffect(() => {
    const fetchProfileImageId = async () => {
      try {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnapshot = await getDoc(userRef);
          const userData = userSnapshot.data();
          if (userData && userData.profileImageId !== undefined) {
            setSelectedProfileImage(userData.profileImageId);
          }
        }
      } catch (error) {
        console.error("Error fetching profile image id:", error);
      }
    };

    fetchProfileImageId();
    if (user) {
      document.title = `GH: Gamehaven - ${user.displayName}`;
    }
  }, [user]);

  const onSubmit = async () => {
    try {
      if (!form.values.currentPassword) {
        return;
      }

      if (user && user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          form.values.currentPassword
        );

        await reauthenticateWithCredential(user, credential);

        if (form.values.name && form.values.name.length >= 2) {
          await updateProfile(user, {
            displayName: form.values.name,
          });

          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            username: form.values.name,
          });

          updateUser({
            uid: user?.uid || "",
            email: user?.email || null,
            displayName: form.values.name || "",
          });
        }

        if (form.values.newPassword) {
          await updatePassword(user, form.values.newPassword);
        }

        form.setFieldValue("currentPassword", "");

        showNotification({
          title: "Profile updated successfully!",
          message: "Your profile has been updated successfully.",
          color: "green",
          icon: <MdThumbUp />,
        });
      }
    } catch (error) {
      showNotification({
        title: "Failed to update profile!",
        message: "Please check your current password.",
        color: "red",
        icon: <MdOutlineError />,
      });
      console.error(error);
    }
  };

  const handleSaveProfileImage = async () => {
    try {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          profileImageId: selectedProfileImage,
        });

        updateSelectedProfileImage(selectedProfileImage);

        showNotification({
          title: "Profile image updated successfully!",
          message: "Your profile image has been updated successfully.",
          color: "green",
          icon: <MdThumbUp />,
        });
      }
    } catch (error) {
      setError("Failed to update profile image. Please try again.");
      showNotification({
        title: "Failed to update profile image!",
        message: "Please try again.",
        color: "red",
        icon: <MdOutlineError />,
      });
      console.error(error);
    }
  };

  const handleSelectProfileImage = (index: number) => {
    setSelectedProfileImage(index);
  };

  const handleDeleteAccount = async () => {
    try {
      if (user) {
        const userRef = doc(db, "users", user.uid);

        await deleteDoc(userRef);

        await user.delete();

        auth.signOut();

        showNotification({
          title: "Account Deleted",
          message: "Your account has been deleted successfully.",
          color: "green",
          icon: <TfiFaceSad />,
        });

        navigate("/");
      }
    } catch (error) {
      showNotification({
        title: "Failed to Delete Account",
        message: "Please try again.",
        color: "red",
        icon: <MdOutlineError />,
      });
      console.error("Error deleting account:", error);
    }
  };

  if (!user) {
    return (
      <Box className="loader-style">
        <Title mb={"xl"} order={2}>
          User not logged in
        </Title>
        <NavLink to="/signin">
          <Button className="button-style">Sign In</Button>
        </NavLink>
      </Box>
    );
  }

  return (
    <>
      <DeleteAccountModal
        opened={modalOpened}
        onClose={closeModal}
        onDeleteAccount={handleDeleteAccount}
      />

      <Container size={"lg"}>
        <Paper
          className="profile-settings-paper"
          style={{ background: "#f9f6ee" }}
          radius="md"
          p="xl"
          shadow="md"
          mt={"xl"}
          mb={"lg"}
          withBorder
        >
          <Box className="profile-settings-wrapper">
            <Box className="profile-settings-image">
              <Title order={3}>{user.displayName || "Username"}</Title>
              <Image src={getProfileImage(selectedProfileImage)} w={200} />
              <Box className="profile-settings-thumbnails">
                {Array.from({ length: profileImages.length }).map(
                  (_, index) => (
                    <Image
                      key={index}
                      src={getProfileImage(index)}
                      w={65}
                      className="profile-thumbnail"
                      onClick={() => handleSelectProfileImage(index)}
                    />
                  )
                )}
              </Box>
              <Button
                variant="subtle"
                color="dark"
                // className="button-style"
                fullWidth
                onClick={handleSaveProfileImage}
              >
                Save Profile Image
              </Button>
              {error && <div style={{ color: "red" }}>{error}</div>}
            </Box>
            <Box className="profile-settings-form">
              <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack gap="lg">
                  <TextInput label="Email" value={user?.email || ""} disabled />
                  <TextInput
                    label="Username"
                    name="name"
                    placeholder={user?.displayName || "Your name"}
                    value={form.values.name}
                    onChange={(event) =>
                      form.setFieldValue("name", event.currentTarget.value)
                    }
                    error={form.errors.name}
                  />

                  <PasswordInput
                    label="New Password"
                    placeholder="●●●●●●●●●●"
                    value={form.values.newPassword}
                    onChange={(event) =>
                      form.setFieldValue(
                        "newPassword",
                        event.currentTarget.value
                      )
                    }
                    error={form.errors.newPassword}
                    radius="md"
                  />
                  <PasswordInput
                    label="Current Password"
                    placeholder="●●●●●●●●●●"
                    withAsterisk
                    value={form.values.currentPassword}
                    onChange={(event) =>
                      form.setFieldValue(
                        "currentPassword",
                        event.currentTarget.value
                      )
                    }
                    error={form.errors.currentPassword}
                    radius="md"
                  />

                  <Button
                    className="button-style"
                    fullWidth
                    type="submit"
                    mt={"xl"}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </form>
              <Button color="red" fullWidth onClick={openModal}>
                Delete My Account
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default ProfilePage;
