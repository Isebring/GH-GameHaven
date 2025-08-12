import { Box, Container, Image, Text, Title } from "@mantine/core";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import getInTouch from "../assets/GH-GetInTouch.png";
import logo from "../assets/GH-logo.png";
import "../css/AboutPage.css";

function AboutPage() {
  useEffect(() => {
    document.title = "GH: Gamehaven - About";
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container size={"md"} className="about-container">
      <Box className="about-image-container" mb={"xl"}>
        <Image src={logo} alt="GameHaven Logo" maw={500} />
      </Box>
      <Title order={2} mb={"lg"}>
        The Story of GameHaven
      </Title>
      <Text mb={"lg"}>
        Greetings, gaming enthusiasts! We are thrilled to introduce you to
        GH-GameHaven, your go-to hub for discovering, connecting, and favoriting
        your favorite video games. Let's embark on a journey into the world of
        gaming like never before!
      </Text>
      <Title order={4} mb={"xs"}>
        Explore the Vast Gaming Universe
      </Title>
      <Text mb={"lg"}>
        At GH-GameHaven, we understand the thrill of exploring new gaming
        worlds. Our powerful search feature allows you to effortlessly discover
        a vast array of games across different genres, platforms, and themes.
        Whether you're into action-packed adventures, immersive RPGs, or
        fast-paced shooters, GH-GameHaven is your haven to navigate the gaming
        universe.
      </Text>
      <Title order={4} mb={"xs"}>
        Connect with Fellow Gamers
      </Title>
      <Text mb={"lg"}>
        Gaming is not just a solo experience; it's a community-driven adventure.
        GH-GameHaven brings gamers together! Sign up and join a vibrant
        community of like-minded individuals who share your passion for gaming.
        Forge new friendships, exchange tips and strategies, and stay updated on
        the latest gaming trends. The gaming community awaits, and GH-GameHaven
        is your portal to connect.
      </Text>
      <Title order={4} mb={"xs"}>
        Save Your Favorites
      </Title>
      <Text mb={"lg"}>
        Found a game that resonates with you? Never lose track of your favorites
        again. With GH-GameHaven, you can effortlessly favorite and organize
        your most-loved games. Whether it's a nostalgic classic, an upcoming
        release, or a hidden gem, our platform ensures that your gaming wishlist
        is always just a click away.
      </Text>
      <Title order={4} mb={"xs"}>
        Why GH-GameHaven?
      </Title>
      <ul>
        <li>
          User-Friendly Interface: Navigate through our intuitive and
          user-friendly interface designed with gamers in mind.
        </li>
        <li>
          Comprehensive Search: Discover games easily with our robust search
          functionality, filtering options, and curated recommendations.
        </li>
        <li>
          Community Engagement: Connect with a diverse community of gamers,
          share experiences, and be a part of the ever-expanding gaming network.
        </li>
        <li>
          Favoriting Feature: Personalize your gaming experience by favoriting
          and organizing your favorite titles effortlessly.
        </li>
      </ul>
      <Title order={4} mb={"xs"}>
        Ready to Level Up Your Gaming Experience?
      </Title>
      <Text mb={"lg"}>
        Don't miss out on the excitement! Join GH-GameHaven today and let the
        gaming adventure begin. Your favorite games are just a search away, and
        a community of fellow gamers is waiting to welcome you.
      </Text>
      <Title order={4} mb={"xs"}>
        Contact GH GameHaven
      </Title>
      <Text mb={"xs"}>
        Have questions, suggestions, or need assistance? We're here for you!
        Contact GH GameHaven through the following channels:
      </Text>
      <ul>
        <li>
          Customer Support Email:{" "}
          <a
            aria-label="Contact Gamehaven support"
            href="mailto:support@ghgamehaven.com"
          >
            support@ghgamehaven.com
          </a>
        </li>
        <li>
          Social Media: Connect with us on{" "}
          <a
            aria-label="Visit Facebook (opens in a new tab)"
            href="https://www.facebook.com"
            target="blank"
          >
            Facebook
          </a>
          ,{" "}
          <a
            aria-label="Visit Instagram (opens in a new tab)"
            href="https://www.instagram.com"
            target="blank"
          >
            Instagram
          </a>{" "}
          or{" "}
          <a
            aria-label="Visit X (opens in a new tab)"
            href="https://www.twitter.com"
            target="blank"
          >
            X
          </a>{" "}
          for the latest updates and announcements.
        </li>
      </ul>
      <Box className="about-image-container">
        <NavLink to={"/contact"}>
          <Image src={getInTouch} maw={450} />
        </NavLink>
      </Box>
    </Container>
  );
}

export default AboutPage;
