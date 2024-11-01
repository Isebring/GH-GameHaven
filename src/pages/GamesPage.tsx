import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Image,
  Pagination,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { BsNintendoSwitch } from "react-icons/bs";
import { FaPlaystation, FaXbox } from "react-icons/fa";
import { PiDesktopTowerFill } from "react-icons/pi";
import { SiNintendogamecube } from "react-icons/si";
import { fetchFilteredGames } from "../api/igdbApi";
import n64 from "../assets/N64-logo.png";
import nes from "../assets/NES-logo.png";
import snes from "../assets/SNES-logo.png";
import nogames from "../assets/no-games-available.png";
import Thumbnail from "../components/Thumbnail";
import "../css/GamesPage.css";

function GamesPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("pc");
  const [selectedGenre, setSelectedGenre] = useState<string>("Adventure");
  const [selectedGameMode, setSelectedGameMode] =
    useState<string>("Singleplayer");
  const [games, setGames] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const limitPerPage = 24;

  useEffect(() => {
    document.title = "GH: Gamehaven - Games";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      const platformFilter = selectedPlatform
        ? [{ name: selectedPlatform }]
        : [];
      const genreFilter = selectedGenre ? [{ name: selectedGenre }] : [];

      const gameModeFilter = selectedGameMode
        ? [{ name: selectedGameMode }]
        : [];

      const filteredGames = await fetchFilteredGames(
        platformFilter,
        genreFilter,
        gameModeFilter,
        currentPage,
        limitPerPage
      );
      setGames(filteredGames);
    };

    fetchGames();
  }, [selectedPlatform, selectedGenre, selectedGameMode, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    setCurrentPage(1);
  };

  const handleGameModeSelect = (gameMode: string) => {
    setSelectedGameMode(gameMode);
    setCurrentPage(1);
  };

  const isActiveButton = (
    buttonType: "platform" | "genre" | "gameMode",
    value: string
  ) => {
    switch (buttonType) {
      case "platform":
        return selectedPlatform === value;
      case "genre":
        return selectedGenre === value;
      case "gameMode":
        return selectedGameMode === value;
      default:
        return false;
    }
  };

  type PlatformIconType = {
    [key: string]: JSX.Element;
  };

  const platformIcons: PlatformIconType = {
    pc: <PiDesktopTowerFill color="grey" />,
    playstation: <FaPlaystation color="blue" />,
    xbox: <FaXbox color="green" />,
    "nintendo switch": <BsNintendoSwitch color="red" />,
    n64: (
      <Image
        maw={32}
        src={n64}
        alt="Logo of Nintendo 64"
        className="platform-icon"
      />
    ),
    nes: (
      <Image
        maw={55}
        src={nes}
        alt="Logo of Nintendo Entertainment System"
        className="platform-icon"
      />
    ),
    snes: (
      <Image
        maw={55}
        src={snes}
        alt="Logo of Super Nintendo Entertainment System"
        className="platform-icon"
      />
    ),
    gamecube: <SiNintendogamecube color="indigo" />,
  };

  return (
    <Container mb={"xl"} className="games-buttons" size="xl">
      <Box>
        <Title mb={"sm"} mt={"sm"} order={5}>
          Platform:
        </Title>
        <Group>
          {[
            "pc",
            "playstation",
            "xbox",
            "nintendo Switch",
            "n64",
            "nes",
            "snes",
            "gamecube",
          ].map((platform) => (
            <Button
              color="#f2c341"
              key={platform}
              onClick={() => handlePlatformSelect(platform)}
              variant={
                isActiveButton("platform", platform) ? "filled" : "outline"
              }
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Button>
          ))}
        </Group>
      </Box>
      <Box>
        <Title mb={"sm"} mt={"sm"} order={5}>
          Genre:
        </Title>
        <Group>
          {["Adventure", "RPG", "Strategy", "Indie", "Platform", "Arcade"].map(
            (genre) => (
              <Button
                color="#f2c341"
                key={genre}
                onClick={() => handleGenreSelect(genre)}
                variant={isActiveButton("genre", genre) ? "filled" : "outline"}
              >
                {genre}
              </Button>
            )
          )}
        </Group>
      </Box>

      <Box>
        <Title mb={"sm"} mt={"sm"} order={5}>
          Game Mode:
        </Title>
        <Group>
          {["Singleplayer", "Multiplayer", "Coop"].map((gameMode) => (
            <Button
              autoContrast
              color="#f2c341"
              key={gameMode}
              onClick={() => handleGameModeSelect(gameMode)}
              variant={
                isActiveButton("gameMode", gameMode) ? "filled" : "outline"
              }
            >
              {gameMode}
            </Button>
          ))}
        </Group>
      </Box>

      <Title mt={"lg"} ta="center" order={3}>
        {selectedPlatform ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {platformIcons[selectedPlatform.toLowerCase()]}{" "}
            <span style={{ marginRight: "", marginLeft: "0.5rem" }}>
              {selectedPlatform.toUpperCase()}
            </span>
          </Box>
        ) : (
          "None"
        )}
      </Title>
      <Text size="lg" ta="center">
        {selectedGenre || "None"}
      </Text>
      <Text size="lg" ta="center">
        {selectedGameMode || "None"}
      </Text>
      <Container mt={"md"} size={"xl"}>
        <Divider color="var(--nav-text-color)" />
      </Container>
      <div>
        {games.length > 0 ? (
          <SimpleGrid
            cols={{ base: 1, xs: 3, sm: 4, lg: 6 }}
            spacing={"xs"}
            verticalSpacing={"lg"}
            mt="md"
          >
            {games.map((game) => (
              <Thumbnail key={game.id} game={game} />
            ))}
          </SimpleGrid>
        ) : (
          <>
            <Text fw={"500"} size="xl" ta="center" mt="lg">
              No more games available for this selection.
            </Text>
            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                ta="center"
                mt="lg"
                maw={500}
                src={nogames}
                alt="No more games available for this selection"
              />
            </Box>
          </>
        )}
      </div>
      <Box
        mt="lg"
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Pagination
          mt={"xl"}
          color="#f2c341"
          value={currentPage}
          onChange={handlePageChange}
          total={5}
        />
      </Box>
    </Container>
  );
}

export default GamesPage;
