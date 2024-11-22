import { Container, Divider, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  fetchGameThumbnailsData,
  getNewGames,
  getPopularRightNowGames,
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
  age_number?: string | number;
}

function HomePage() {
  const [topRatedGames, setTopRatedGames] = useState<Game[]>([]);
  const [newestGames, setNewestGames] = useState<Game[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);

  const fetchAgeRatings = async (games: Game[]) => {
    try {
      const gameIds = games.map((game) => game.id);
      const ageRatings = await fetchGameThumbnailsData(gameIds);
      return games.map((game) => {
        const ratingData = ageRatings.find(
          (rating: any) => rating.id === game.id
        );
        return { ...game, age_number: ratingData?.age_number || "Unrated" };
      });
    } catch (error) {
      console.error("Error fetching age ratings:", error);
      return games; // Return original games if age ratings fail
    }
  };

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
      .then(fetchAgeRatings) // Add age ratings to the games
      .then(setTopRatedGames)
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    getNewGames("playstation")
      .then(fetchAgeRatings) // Add age ratings to the games
      .then(setNewestGames)
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    getUpcomingGames("playstation")
      .then(fetchAgeRatings) // Add age ratings to the games
      .then(setUpcomingGames)
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    getPopularRightNowGames("playstation")
      .then(fetchAgeRatings) // Add age ratings to the games
      .then(setPopularGames)
      .catch((error) => {
        console.error("Error fetching popular games:", error);
      });
  }, []);

  return (
    <>
      <HeroSlide games={upcomingGames} />
      <Title order={3} mt={"md"} pl={"md"} mb={"md"}>
        Popular Right Now
      </Title>
      <Container size={"xl"}>
        <Divider color="#f2c341" />
      </Container>
      <Carousel games={popularGames} />
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
