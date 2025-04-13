import {
  Button,
  Center,
  Container,
  Divider,
  Image,
  SimpleGrid,
  Title,
} from "@mantine/core";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import nofavorites1 from "../assets/no_favorites1.png";
import nofavorites2 from "../assets/no_favorites2.png";
import nofavorites3 from "../assets/no_favorites3.png";
import nofavorites4 from "../assets/no_favorites4.png";
import Thumbnail from "../components/Thumbnail";
import { FavoritesContext } from "../context/FavoritesContext";
import "../css/FavoritesPage.css";

const images = [nofavorites1, nofavorites2, nofavorites3, nofavorites4];

function FavoritesPage() {
  useEffect(() => {
    document.title = "GH: Gamehaven - Favorites";
    window.scrollTo(0, 0);
  }, []);

  const randomIndex = Math.floor(Math.random() * images.length);
  const random404Image = images[randomIndex];
  const { favorites } = useContext(FavoritesContext);

  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container size="xl">
      <Title ml="md" mt={"lg"} mb={"lg"} order={2}>
        Favorites
      </Title>
      {favorites.length === 0 ? (
        <Container className="favorites-container">
          <Center style={{ flexDirection: "column" }}>
            <Title order={2} mt={"xl"}>
              You have no favorite games added
            </Title>
            <Image mt="lg" maw={500} src={random404Image} alt="No favorites" />
            <Button
              fullWidth
              size={"lg"}
              mt={"xl"}
              className="favorites-button"
              onClick={handleGoHome}
            >
              To Homepage
            </Button>
          </Center>
        </Container>
      ) : (
        <Container size={"xl"} mb={"xl"}>
          <SimpleGrid
            cols={{ base: 1, xs: 3, sm: 4, lg: 6 }}
            spacing={"xs"}
            verticalSpacing={"lg"}
            mt="md"
          >
            {favorites.map((game) => (
              <Thumbnail key={game.id} game={game} />
            ))}
          </SimpleGrid>
          <Divider color="var(--nav-text-color)" mt={"xl"} />
        </Container>
      )}
    </Container>
  );
}

export default FavoritesPage;
