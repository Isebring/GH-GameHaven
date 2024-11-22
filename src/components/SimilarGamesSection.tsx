import { Box, Container, Divider, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { fetchGameThumbnailsData } from "../api/igdbApi";
import { Game } from "../pages/HomePage";
import Carousel from "./Carousel";

interface SimilarGamesSectionProps {
  similarGames: Game[];
}

const SimilarGamesSection: React.FC<SimilarGamesSectionProps> = ({
  similarGames,
}) => {
  const [enrichedGames, setEnrichedGames] = useState<Game[]>([]);

  useEffect(() => {
    const enrichSimilarGames = async () => {
      try {
        const gameIds = similarGames.map((game) => game.id);
        const ageRatings = await fetchGameThumbnailsData(gameIds);
        const enriched = similarGames.map((game) => {
          const ratingData = ageRatings.find(
            (rating: any) => rating.id === game.id
          );
          return { ...game, age_number: ratingData?.age_number || "Unrated" };
        });
        setEnrichedGames(enriched);
      } catch (error) {
        console.error("Error enriching similar games with age ratings:", error);
        setEnrichedGames(similarGames);
      }
    };

    if (similarGames && similarGames.length > 0) {
      enrichSimilarGames();
    }
  }, [similarGames]);

  return (
    <>
      {enrichedGames && enrichedGames.length > 0 ? (
        <Box>
          <Title pl={10} mt="md" mb={"md"} order={4}>
            You might also like
          </Title>
          <Container size={"xl"}>
            <Divider color="var(--nav-text-color)" />
          </Container>
          <Carousel games={enrichedGames} />
        </Box>
      ) : (
        <Box>
          <Title pl={10} order={4} mb={"md"} mt={"lg"}>
            You might also like
          </Title>
          <Container size={"xl"}>
            <Divider color="var(--nav-text-color)" />
          </Container>
          <Text pl={10} mb={"lg"} mt={"sm"}>
            No Similar Games Available
          </Text>
        </Box>
      )}
    </>
  );
};

export default SimilarGamesSection;
