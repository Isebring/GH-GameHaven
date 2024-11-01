import { Container, Divider, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  getNewGames,
  getTopRatedGames,
  getUpcomingGames,
} from "../api/igdbApi";
import Carousel from "../components/Carousel";
import GhInfo from "../components/GhInfo";
import HeroSlide from "../components/HeroSlide";

export interface Game {
  id: number;
  name: string;
  cover: string;
  rating: number;
  total_rating: number;
  screenshots: string[];
  summary: string;
  artworks: string[];
  release_dates: Array<{ date: string }>;
  platforms: Array<{ name: string }>;
}

function HomePage() {
  const [topRatedGames, setTopRatedGames] = useState<Game[]>([]);
  const [newestGames, setNewestGames] = useState<Game[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);

  useEffect(() => {
    document.title = "GH: Gamehaven";
  }, []);

  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //     } else {
  //     }
  //   });
  // }, []);

  useEffect(() => {
    getTopRatedGames("playstation")
      .then((topRatedGames) => {
        setTopRatedGames(topRatedGames);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    getNewGames("playstation")
      .then((newGames) => {
        setNewestGames(newGames);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    getUpcomingGames("playstation")
      .then((upcomingGames) => {
        setUpcomingGames(upcomingGames);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <>
      <HeroSlide games={upcomingGames} />
      <Title order={3} mt={"md"} pl={"md"} mb={"md"}>
        Top Rated Games
      </Title>
      <Container size={"xl"}>
        <Divider color="#f2c341" />
      </Container>
      <Carousel games={topRatedGames} />
      <Title order={3} mt={"md"} pl={"md"} mb={"md"}>
        Newest Releases
      </Title>
      <Container size={"xl"}>
        <Divider color="#f2c341" />
      </Container>
      <Carousel games={newestGames} />
      <GhInfo />
      <Title order={3} mt={"md"} pl={"md"} mb={"md"}>
        Upcoming Releases
      </Title>
      <Container size={"xl"}>
        <Divider color="#f2c341" />
      </Container>
      <Carousel games={upcomingGames} />
    </>
  );
}

export default HomePage;
