import {
  Burger,
  Button,
  Container,
  Divider,
  Group,
  Image,
  Menu,
  Paper,
  Text,
  Transition,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { CgLogOut } from "react-icons/cg";
import {
  FaEnvelope,
  FaHeart,
  FaInfoCircle,
  FaRegUserCircle,
  FaUser,
} from "react-icons/fa";
import { IoLogoGameControllerA } from "react-icons/io";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../assets/GH-logo.png";
import { ProfileImageContext } from "../context/ProfileImageContext";
import { UserContext } from "../context/UserContext";
import "../css/Header.css";
import { auth } from "../firebase";
import { getProfileImage } from "../utils/ProfileImageUtility";
import Search from "./Search";

const links = [
  { link: "/games", icon: <IoLogoGameControllerA size={18} />, label: "Games" },
  { link: "/favorites", icon: <FaHeart size={18} />, label: "Favorites" },
  { link: "/contact", icon: <FaEnvelope size={18} />, label: "Contact" },
  { link: "/about", icon: <FaInfoCircle size={18} />, label: "About" },
];

function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const location = useLocation();
  const isActive = (pathname: string) => location.pathname === pathname;
  const [isVisible, setIsVisible] = useState(true);
  const [pastThreshold, setPastThreshold] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const { selectedProfileImage } = useContext(ProfileImageContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsUserLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const threshold = 50;
    let lastScrollTop = 0;

    const onScroll = () => {
      const currentScrollTop = window.scrollY;
      setPastThreshold(currentScrollTop > threshold);
      setIsVisible(
        currentScrollTop < lastScrollTop || currentScrollTop <= threshold
      );

      lastScrollTop = currentScrollTop;
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const headerClass = isVisible && pastThreshold ? "visible" : "";
  const headerTransform = isVisible ? "translateY(0)" : "translateY(-100%)";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        close();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [close]);

  const items = links.map((link) => (
    <NavLink
      key={link.label}
      to={link.link}
      className={`link ${isActive(link.link) ? "link-active" : ""}`}
      onClick={() => {
        if (opened) {
          close();
        }
      }}
    >
      <span className="link-content">
        {link.icon}
        {link.label}
      </span>
    </NavLink>
  ));

  return (
    <>
      <header className={headerClass} style={{ transform: headerTransform }}>
        <Container size="xl" className="inner">
          <Group>
            <NavLink to={"/"}>
              <Image className="gh-logo" src={logo} alt="Gh logo" />
            </NavLink>
            <Group gap={5} className={`header-links ${opened ? "opened" : ""}`}>
              {" "}
              {items}
            </Group>
          </Group>
          <Group>
            <Search />
            {isUserLoggedIn ? (
              <Menu>
                <Menu.Target>
                  <Image
                    src={getProfileImage(selectedProfileImage)}
                    alt={user?.displayName || "Profile"}
                    title={user?.displayName || "Profile"}
                    radius="full"
                    w={50}
                    className={`button-color ${
                      isActive("/profile") ? "active" : ""
                    } clickable-profile-image`}
                  />
                </Menu.Target>
                <Text size="xs" fw={500}>
                  {user?.displayName || "Profile"}
                </Text>
                <Menu.Dropdown>
                  <Menu.Label>Account</Menu.Label>
                  <NavLink to={"/profile"} style={{ textDecoration: "none" }}>
                    <Menu.Item leftSection={<FaRegUserCircle />}>
                      My Profile
                    </Menu.Item>
                  </NavLink>
                  <Menu.Item
                    leftSection={<CgLogOut />}
                    onClick={() => auth.signOut()}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <NavLink to="/signin">
                <Button
                  variant="transparent"
                  leftSection={<FaUser size={18} />}
                  className={`button-color ${
                    isActive("/signin") ? "active" : ""
                  }`}
                >
                  Sign in
                </Button>
              </NavLink>
            )}
            <Burger
              aria-label="Toggle navigation"
              color="#F2C341"
              opened={opened}
              onClick={toggle}
              className="burger"
              size="md"
            />
          </Group>
        </Container>
      </header>
      <Divider color="var(--nav-text-color)" size="xl" />
      <Transition transition="pop-top-right" duration={200} mounted={opened}>
        {(styles) => (
          <Paper className="dropdown" withBorder style={styles}>
            {items}
          </Paper>
        )}
      </Transition>
    </>
  );
}

export default Header;
