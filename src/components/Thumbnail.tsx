import {
  Box,
  Image,
  Spoiler,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useContext, useEffect, useState } from "react";
import { GiCrownedHeart, GiStabbedNote } from "react-icons/gi";
import { IoHeartOutline } from "react-icons/io5";
import { MdOutlineError } from "react-icons/md";
import { NavLink } from "react-router-dom";
import logo from "../assets/GH-logo.png";
import { FavoritesContext, GameData } from "../context/FavoritesContext";
import "../css/Thumbnail.css";
import { auth } from "../firebase";
import GameRating from "./RateGame";

interface Game {
  name: string;
  cover: string;
  rating: number;
  total_rating: number;
  id: number;
  summary: string;
  age_number?: string | number;
}

const Thumbnail: React.FC<{ game: Game }> = ({ game }) => {
  const { favorites, addFavorite, removeFavorite } =
    useContext(FavoritesContext);
  const [isHeartCrowned, setIsHeartCrowned] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setUserId(user ? user.uid : "");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const isFavorited = favorites.some((b) => b.id === game.id);
    setIsHeartCrowned(isFavorited);
  }, [favorites, game.id]);

  const getRatingClass = (rating: number) => {
    if (rating === null || rating === undefined) {
      return "rating-tbd";
    } else if (rating >= 75) {
      return "rating-high";
    } else if (rating >= 50) {
      return "rating-medium";
    } else {
      return "rating-low";
    }
  };
  const getRatingText = (rating: number) => {
    if (rating === null || rating === undefined) {
      return "No Rating";
    } else if (rating >= 75) {
      return "Acclaimed";
    } else if (rating >= 50) {
      return "Average";
    } else {
      return "Unfavorable";
    }
  };

  const handleHeartClick = () => {
    const gameData: GameData = {
      ...game,
      userId: userId,
    };

    if (userId) {
      if (isHeartCrowned) {
        removeFavorite(gameData);
      } else {
        addFavorite({ ...game, userId });
      }
      setIsHeartCrowned(!isHeartCrowned);
    } else {
      showNotification({
        title: "Sign In Needed",
        message: "You need to sign in to favorite a game",
        color: "red",
        icon: <MdOutlineError />,
      });
    }
  };

  const renderAgeRating = () => {
    if (typeof game.age_number === "number" && game.age_number > 0) {
      return `${game.age_number}+`;
    }
    return "N/A";
  };
  return (
    <Box className="thumbnail-card-container">
      <NavLink to={`/game/${game.id}`} className="game-link">
        <Box className="thumbnail-image">
          <Image src={game.cover} fallbackSrc={logo} alt={game.name} />
          <Box className="age-rating-div">{renderAgeRating()}</Box>
          <Box className="hover-content">
            <Spoiler
              maxHeight={200}
              showLabel={<VisuallyHidden>Show more</VisuallyHidden>}
              hideLabel={<VisuallyHidden>Show less</VisuallyHidden>}
            >
              <GiStabbedNote
                style={{
                  fontSize: "2rem",
                  color: "#FFF",
                }}
              />
              <Text style={{ padding: "1rem" }} size="sm" className="game-info">
                {game.summary}
              </Text>
            </Spoiler>
          </Box>
        </Box>
      </NavLink>
      <Box className="thumbnail-content-container">
        {isHeartCrowned ? (
          <GiCrownedHeart className="heart-icon" onClick={handleHeartClick} />
        ) : (
          <IoHeartOutline className="heart-icon" onClick={handleHeartClick} />
        )}
        <Title mb="sm" order={5}>
          {game.name}
        </Title>
      </Box>
      <Box className="rating-content">
        <Box style={{ marginBottom: "1rem" }}>
          <GameRating gameId={game.id.toString()} showText={false} />
        </Box>
        <Text className={`rating ${getRatingClass(game.total_rating)}`}>
          {game.total_rating === null || game.total_rating === undefined
            ? "TBD"
            : Math.round(game.total_rating)}
        </Text>
        <Text className="rating-text" ml="xs">
          {getRatingText(game.total_rating)}
        </Text>
      </Box>
    </Box>
  );
};

export default Thumbnail;
