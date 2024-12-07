import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Group,
  Image,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ghRegister from "../assets/gh-register.png";
import { ProfileImageContext } from "../context/ProfileImageContext";
import { UserContext } from "../context/UserContext";
import "../css/SigninPage.css";
import { auth, db } from "../firebase";

interface FormValues {
  email: string;
  name: string;
  password: string;
  terms: boolean;
}

function RegisterPage() {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);
  const { updateSelectedProfileImage } = useContext(ProfileImageContext);

  useEffect(() => {
    document.title = "GH: Gamehaven - Register";
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<FormValues>({
    initialValues: {
      email: "",
      name: "",
      password: "",
      terms: true,
    },

    validate: {
      name: (val) =>
        val.length <= 1
          ? "Username should include at least 2 characters"
          : val.length > 12
          ? "Username cannot exceed 12 characters"
          : null,
      email: (val) =>
        /^\S+@\S+$/.test(val)
          ? null
          : "Make sure you are using mail@mail.com format",
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 7 characters"
          : null,
    },
  });
  const onSubmit = async (values: any) => {
    const { email, password } = values;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const displayName = values.name;

      await updateProfile(userCredential.user, { displayName });

      // Create a reference to the specific document in the 'users' collection
      const userRef = doc(db, "users", userCredential.user.uid);

      await setDoc(userRef, {
        username: values.name,
        profileImageId: 0,
        favorites: [],
      });

      updateUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: values.name,
      });

      updateSelectedProfileImage(0);

      navigate("/");
    } catch (error) {
      console.error("Error in user registration: ", error);
    }
  };
  return (
    <Container size="xs" mt="xl">
      <Paper
        style={{ background: "#f9f6ee" }}
        radius="md"
        p="xl"
        shadow="md"
        withBorder
      >
        <Text size="lg" fw={500}>
          Welcome to Gamehaven, register with
        </Text>

        <Flex justify="center">
          <Image
            mt="lg"
            mb="lg"
            src={ghRegister}
            alt="GH-mascot encouraging the user to register and join the family"
            w={200}
            radius="lg"
          />
        </Flex>

        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack>
            <TextInput
              label="Username"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) =>
                form.setFieldValue("name", event.currentTarget.value)
              }
              error={form.errors.name}
              radius="md"
            />

            <TextInput
              label="Email"
              withAsterisk
              placeholder="mail@mail.com"
              value={form.values.email}
              onChange={(event) =>
                form.setFieldValue("email", event.currentTarget.value)
              }
              error={form.errors.email}
              radius="md"
            />

            <PasswordInput
              withAsterisk
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={form.errors.password}
              radius="md"
            />

            <Checkbox
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) =>
                form.setFieldValue("terms", event.currentTarget.checked)
              }
            />
          </Stack>

          <Box mt="md">
            <NavLink to={"/signin"} style={{ textDecoration: "none" }}>
              <Anchor component="button" type="button" size="sm">
                Already a member? Sign in here.
              </Anchor>
            </NavLink>
          </Box>

          <Group justify="space-between" mt="xl">
            <Button
              className="signin-button-style"
              fullWidth
              type="submit"
              radius="sm"
              onClick={onSubmit}
            >
              Register
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

export default RegisterPage;
