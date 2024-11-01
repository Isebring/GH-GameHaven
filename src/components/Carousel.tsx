import { Box } from "@mantine/core";
// import { useMediaQuery } from "@mantine/hooks";
import SwiperCore from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FreeMode, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "../css/Carousel.css";
import { Game } from "../pages/HomePage";
import Thumbnail from "./Thumbnail";

interface CarouselProps {
  games: Game[];
}

SwiperCore.use([FreeMode, Navigation]);

function Carousel({ games }: CarouselProps) {
  return (
    <Box mt={"lg"} mb={"lg"}>
      <Swiper
        slidesPerView={"auto"}
        spaceBetween={16}
        className="carousel-container"
        modules={[FreeMode, Navigation]}
        navigation={true}
        watchOverflow={true}
        loop={true}
      >
        {games.map((game) => (
          <SwiperSlide key={game.id}>
            <Thumbnail game={game} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}

export default Carousel;
