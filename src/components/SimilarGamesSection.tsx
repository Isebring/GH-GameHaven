// SimilarGamesSection.tsx
import { Box, Container, Divider, Text, Title } from "@mantine/core";
import { Game } from "../pages/HomePage";
import Carousel from "./Carousel";

interface SimilarGamesSectionProps {
  similarGames: Game[];
}

const SimilarGamesSection: React.FC<SimilarGamesSectionProps> = ({
  similarGames,
}) => {
  return (
    <>
      {similarGames && similarGames.length > 0 ? (
        <Box>
          <Title pl={10} mt="md" mb={"md"} order={4}>
            You might also like
          </Title>
          <Container size={"xl"}>
            <Divider color="var(--nav-text-color)" />
          </Container>
          <Carousel games={similarGames} />
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
