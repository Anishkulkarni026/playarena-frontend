// app/components/HeroCarousel.tsx
"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HeroCarousel = () => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={0}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000 }}
      loop={true}
      className="w-full h-full rounded-lg"
    >
      <SwiperSlide>
        <Image src="/images/image2.jpg" alt="Exciting sports action" layout="fill" objectFit="cover" />
      </SwiperSlide>
      <SwiperSlide>
        <Image src="/images/banner2.jpg" alt="State of the art turf" layout="fill" objectFit="cover" />
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousel;